import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 50), 1000)
    const skipCache = req.query._skip_cache === '1'

    const cacheKey = `floorsheet_raw_${limit}`
    const data = await getCachedOrFetch(
      cacheKey,
      60, // 1 minute cache
      async () => {
        const pool = getPool()
        const query = `
          SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
          FROM floorsheet_raw
          ORDER BY trade_time DESC
          LIMIT $1
        `
        const result = await pool.query(query, [limit])
        return result.rows
      },
      skipCache
    )

    setCacheHeaders(res, 60)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching raw floorsheet:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
