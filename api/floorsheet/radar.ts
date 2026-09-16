import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders, parseDateRange } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const { condition, params, cacheSuffix } = parseDateRange(req.query)
    const cacheKey = `market_radar_analysis_${cacheSuffix}`

    const data = await getCachedOrFetch(
      cacheKey,
      86400,
      async () => {
        const pool = getPool()
        const [whalesResult, crossingsResult, topWhaleSymbolsResult, topCrossingBrokersResult, statsResult] =
          await Promise.all([
            pool.query(`
              SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
              FROM floorsheet_raw
              WHERE amount >= 500000 ${condition}
              ORDER BY amount DESC
              LIMIT 100
            `, params),
            pool.query(`
              SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
              FROM floorsheet_raw
              WHERE buyer_broker = seller_broker ${condition}
              ORDER BY amount DESC
              LIMIT 100
            `, params),
            pool.query(`
              SELECT symbol,
                     COUNT(*) as whale_trades,
                     SUM(amount) as whale_amount,
                     SUM(quantity) as whale_qty,
                     MAX(amount) as max_trade
              FROM floorsheet_raw
              WHERE amount >= 500000 ${condition}
              GROUP BY symbol
              ORDER BY whale_amount DESC
              LIMIT 10
            `, params),
            pool.query(`
              SELECT buyer_broker as broker,
                     COUNT(*) as cross_count,
                     SUM(amount) as cross_amount,
                     SUM(quantity) as cross_qty
              FROM floorsheet_raw
              WHERE buyer_broker = seller_broker ${condition}
              GROUP BY buyer_broker
              ORDER BY cross_amount DESC
              LIMIT 10
            `, params),
            pool.query(`
              SELECT
                COUNT(*) FILTER (WHERE amount >= 1000000) as whale_count_1m,
                COALESCE(SUM(amount) FILTER (WHERE amount >= 1000000), 0) as whale_volume_1m,
                COUNT(*) FILTER (WHERE buyer_broker = seller_broker) as cross_count,
                COALESCE(SUM(amount) FILTER (WHERE buyer_broker = seller_broker), 0) as cross_volume,
                COALESCE(MAX(amount), 0) as max_single_trade
              FROM floorsheet_raw
              WHERE 1=1 ${condition}
            `, params),
          ])

        return {
          whales: whalesResult.rows,
          crossings: crossingsResult.rows,
          topWhaleSymbols: topWhaleSymbolsResult.rows,
          topCrossingBrokers: topCrossingBrokersResult.rows,
          stats: statsResult.rows[0] || {
            whale_count_1m: '0',
            whale_volume_1m: '0',
            cross_count: '0',
            cross_volume: '0',
            max_single_trade: '0',
          },
        }
      },
      skipCache
    )

    setCacheHeaders(res, 86400, 300)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in market radar API:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
