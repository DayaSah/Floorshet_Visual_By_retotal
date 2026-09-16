import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders, parseDateRange } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 50), 1000)
    const page = Math.max(Number(req.query.page) || 1, 1)
    const offset = (page - 1) * limit
    const skipCache = req.query._skip_cache === '1'
    const { condition, params, cacheSuffix } = parseDateRange(req.query)

    const cacheKey = `floorsheet_raw_${limit}_p${page}_${cacheSuffix}`
    const data = await getCachedOrFetch(
      cacheKey,
      1800,
      async () => {
        const pool = getPool()
        const query = `
          SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
          FROM floorsheet_raw
          WHERE 1=1 ${condition}
          ORDER BY trade_time DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `
        const result = await pool.query(query, [...params, limit, offset])
        return result.rows
      },
      skipCache
    )

    setCacheHeaders(res, 1800, 120)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching raw floorsheet:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
