import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const cacheKey = 'market_radar_analysis'

    const data = await getCachedOrFetch(
      cacheKey,
      86400, // 24 hours cache
      async () => {
        const pool = getPool()
        const [whalesResult, crossingsResult, topWhaleSymbolsResult, topCrossingBrokersResult, statsResult] =
          await Promise.all([
            // 1. Largest whale trades (>= 500k)
            pool.query(`
              SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
              FROM floorsheet_raw
              WHERE amount >= 500000
              ORDER BY amount DESC
              LIMIT 100
            `),
            // 2. Internal crossings (buyer_broker = seller_broker)
            pool.query(`
              SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
              FROM floorsheet_raw
              WHERE buyer_broker = seller_broker
              ORDER BY amount DESC
              LIMIT 100
            `),
            // 3. Top symbols by whale money inflow
            pool.query(`
              SELECT symbol,
                     COUNT(*) as whale_trades,
                     SUM(amount) as whale_amount,
                     SUM(quantity) as whale_qty,
                     MAX(amount) as max_trade
              FROM floorsheet_raw
              WHERE amount >= 500000
              GROUP BY symbol
              ORDER BY whale_amount DESC
              LIMIT 10
            `),
            // 4. Top brokers engaging in internal crossings
            pool.query(`
              SELECT buyer_broker as broker,
                     COUNT(*) as cross_count,
                     SUM(amount) as cross_amount,
                     SUM(quantity) as cross_qty
              FROM floorsheet_raw
              WHERE buyer_broker = seller_broker
              GROUP BY buyer_broker
              ORDER BY cross_amount DESC
              LIMIT 10
            `),
            // 5. Radar summary KPIs
            pool.query(`
              SELECT
                COUNT(*) FILTER (WHERE amount >= 1000000) as whale_count_1m,
                COALESCE(SUM(amount) FILTER (WHERE amount >= 1000000), 0) as whale_volume_1m,
                COUNT(*) FILTER (WHERE buyer_broker = seller_broker) as cross_count,
                COALESCE(SUM(amount) FILTER (WHERE buyer_broker = seller_broker), 0) as cross_volume,
                COALESCE(MAX(amount), 0) as max_single_trade
              FROM floorsheet_raw
            `),
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
