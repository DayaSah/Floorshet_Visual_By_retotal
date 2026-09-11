import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const cacheKey = 'floorsheet_stats'

    const data = await getCachedOrFetch(
      cacheKey,
      300, // 5 minutes cache
      async () => {
        const pool = getPool()
        const [dailyResult, topSymbolsResult] = await Promise.all([
          pool.query(`
            SELECT date_trunc('day', trade_time) as day,
                   SUM(amount) as total_amount,
                   SUM(quantity) as total_quantity,
                   COUNT(*) as trade_count
            FROM floorsheet_raw
            GROUP BY day
            ORDER BY day ASC
          `),
          pool.query(`
            SELECT symbol,
                   SUM(amount) as total_amount,
                   SUM(quantity) as total_quantity,
                   COUNT(*) as trade_count
            FROM floorsheet_raw
            GROUP BY symbol
            ORDER BY total_amount DESC
            LIMIT 10
          `),
        ])
        return {
          daily: dailyResult.rows,
          topSymbols: topSymbolsResult.rows,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 300)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
