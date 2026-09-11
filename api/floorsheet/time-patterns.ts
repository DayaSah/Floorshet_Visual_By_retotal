import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const cacheKey = 'time_patterns'

    const data = await getCachedOrFetch(
      cacheKey,
      600, // 10 minutes cache
      async () => {
        const pool = getPool()
        const [minuteResult, dowResult] = await Promise.all([
          pool.query(`
            SELECT (EXTRACT(HOUR FROM trade_time) * 60 + FLOOR(EXTRACT(MINUTE FROM trade_time) / 5) * 5) as bucket_minute,
                   COUNT(*) as trade_count,
                   SUM(amount) as total_amount
            FROM floorsheet_raw
            GROUP BY bucket_minute
            ORDER BY bucket_minute ASC
          `),
          pool.query(`
            SELECT EXTRACT(DOW FROM trade_time) as dow,
                   COUNT(*) as trade_count,
                   SUM(amount) as total_amount
            FROM floorsheet_raw
            GROUP BY dow
            ORDER BY dow ASC
          `),
        ])

        return {
          minuteBuckets: minuteResult.rows,
          dayOfWeek: dowResult.rows,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 600)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in time patterns:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
