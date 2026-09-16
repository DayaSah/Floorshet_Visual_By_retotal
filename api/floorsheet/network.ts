import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders, parseDateRange } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const { condition, params, cacheSuffix } = parseDateRange(req.query)
    const cacheKey = `broker_network_${cacheSuffix}`

    const data = await getCachedOrFetch(
      cacheKey,
      86400,
      async () => {
        const pool = getPool()

        const topPairsResult = await pool.query(`
          SELECT buyer_broker, seller_broker, SUM(amount) as total_amount, SUM(quantity) as total_qty, COUNT(*) as trade_count
          FROM floorsheet_raw
          WHERE buyer_broker != seller_broker ${condition}
          GROUP BY buyer_broker, seller_broker
          ORDER BY total_amount DESC
          LIMIT 20
        `, params)

        const topBrokersResult = await pool.query(`
          WITH buys AS (
            SELECT buyer_broker as broker, SUM(amount) as buy_amount FROM floorsheet_raw WHERE 1=1 ${condition} GROUP BY buyer_broker
          ),
          sells AS (
            SELECT seller_broker as broker, SUM(amount) as sell_amount FROM floorsheet_raw WHERE 1=1 ${condition} GROUP BY seller_broker
          )
          SELECT COALESCE(b.broker, s.broker)::text as broker,
                 COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0) as turnover
          FROM buys b FULL OUTER JOIN sells s ON b.broker = s.broker
          ORDER BY turnover DESC
          LIMIT 10
        `, params)

        const topBrokerIds = topBrokersResult.rows.map((r: any) => Number(r.broker))

        const matrixParamOffset = params.length
        const matrixResult = await pool.query(
          `SELECT buyer_broker, seller_broker, SUM(amount) as total_amount
           FROM floorsheet_raw
           WHERE buyer_broker = ANY($${matrixParamOffset + 1}) AND seller_broker = ANY($${matrixParamOffset + 2}) ${condition}
           GROUP BY buyer_broker, seller_broker`,
          [...params, topBrokerIds, topBrokerIds]
        )

        return {
          topPairs: topPairsResult.rows,
          topBrokers: topBrokersResult.rows,
          matrix: matrixResult.rows,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 86400, 300)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in broker network:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
