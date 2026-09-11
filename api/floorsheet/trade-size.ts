import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const skipCache = req.query._skip_cache === '1'
    const cacheKey = 'trade_size_analysis'

    const data = await getCachedOrFetch(
      cacheKey,
      600, // 10 minutes cache
      async () => {
        const pool = getPool()
        const [sizeResult, blockDealsResult] = await Promise.all([
          pool.query(`
            SELECT
              CASE
                WHEN amount < 10000 THEN '< 10K'
                WHEN amount < 50000 THEN '10K - 50K'
                WHEN amount < 100000 THEN '50K - 100K'
                WHEN amount < 500000 THEN '100K - 500K'
                WHEN amount < 1000000 THEN '500K - 1M'
                ELSE '> 1M'
              END as bucket,
              COUNT(*) as trade_count,
              SUM(amount) as total_amount
            FROM floorsheet_raw
            GROUP BY bucket
          `),
          pool.query(`
            SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
            FROM floorsheet_raw
            ORDER BY amount DESC
            LIMIT 25
          `),
        ])

        return {
          sizeDistribution: sizeResult.rows,
          blockDeals: blockDealsResult.rows,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 600)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Error in trade size analysis:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
