import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const data = await getCachedOrFetch(
      'latest_trade_date',
      3600, // 1 hour cache — refreshes daily
      async () => {
        const pool = getPool()
        const result = await pool.query(
          `SELECT MAX(trade_time::date) as latest_date FROM floorsheet_raw`
        )
        return { latestDate: result.rows[0]?.latest_date?.toISOString().slice(0, 10) ?? null }
      }
    )
    setCacheHeaders(res, 3600, 300)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching latest date:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
