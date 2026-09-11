import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const cacheKey = 'broker_network'

    const data = await getCachedOrFetch(
      cacheKey,
      600, // 10 minutes cache
      async () => {
        const pool = getPool()

        const topPairsResult = await pool.query(`
          SELECT buyer_broker, seller_broker, SUM(amount) as total_amount, SUM(quantity) as total_qty, COUNT(*) as trade_count
          FROM floorsheet_raw
          WHERE buyer_broker != seller_broker
          GROUP BY buyer_broker, seller_broker
          ORDER BY total_amount DESC
          LIMIT 20
        `)

        const topBrokersResult = await pool.query(`
          WITH buys AS (
            SELECT buyer_broker as broker, SUM(amount) as buy_amount FROM floorsheet_raw GROUP BY buyer_broker
          ),
          sells AS (
            SELECT seller_broker as broker, SUM(amount) as sell_amount FROM floorsheet_raw GROUP BY seller_broker
          )
          SELECT COALESCE(b.broker, s.broker)::text as broker,
                 COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0) as turnover
          FROM buys b FULL OUTER JOIN sells s ON b.broker = s.broker
          ORDER BY turnover DESC
          LIMIT 10
        `)

        const topBrokerIds = topBrokersResult.rows.map((r: any) => Number(r.broker))

        const matrixResult = await pool.query(
          `SELECT buyer_broker, seller_broker, SUM(amount) as total_amount
           FROM floorsheet_raw
           WHERE buyer_broker = ANY($1) AND seller_broker = ANY($2)
           GROUP BY buyer_broker, seller_broker`,
          [topBrokerIds, topBrokerIds]
        )

        return {
          topPairs: topPairsResult.rows,
          topBrokers: topBrokersResult.rows,
          matrix: matrixResult.rows,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 600)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in broker network:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
