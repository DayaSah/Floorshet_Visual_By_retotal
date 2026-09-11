import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const broker = req.query.broker ? String(req.query.broker).trim() : ''
    const skipCache = req.query._skip_cache === '1'
    const pool = getPool()

    // 1. Fetch ranking (cached for 5 minutes)
    const ranking = await getCachedOrFetch(
      'broker_ranking',
      300,
      async () => {
        const rankingQuery = `
          WITH buys AS (
            SELECT buyer_broker as broker, SUM(amount) as buy_amount, SUM(quantity) as buy_qty, COUNT(*) as buy_count
            FROM floorsheet_raw GROUP BY buyer_broker
          ),
          sells AS (
            SELECT seller_broker as broker, SUM(amount) as sell_amount, SUM(quantity) as sell_qty, COUNT(*) as sell_count
            FROM floorsheet_raw GROUP BY seller_broker
          )
          SELECT COALESCE(b.broker, s.broker)::text as broker,
                 COALESCE(b.buy_amount, 0) as buy_amount,
                 COALESCE(s.sell_amount, 0) as sell_amount,
                 COALESCE(b.buy_amount, 0) - COALESCE(s.sell_amount, 0) as net_amount,
                 COALESCE(b.buy_qty, 0) as buy_qty,
                 COALESCE(s.sell_qty, 0) as sell_qty,
                 COALESCE(b.buy_count, 0) + COALESCE(s.sell_count, 0) as trade_count
          FROM buys b FULL OUTER JOIN sells s ON b.broker = s.broker
          ORDER BY (COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0)) DESC
        `
        const result = await pool.query(rankingQuery)
        return result.rows
      },
      skipCache
    )

    // 2. If specific broker requested, fetch daily history
    let daily: any[] = []
    if (broker) {
      const brokerId = Number(broker)
      daily = await getCachedOrFetch(
        `broker_daily_${broker}`,
        300,
        async () => {
          const dailyQuery = `
            SELECT trade_time::date as day,
                   SUM(CASE WHEN buyer_broker = $1 THEN amount ELSE 0 END) as buy_amount,
                   SUM(CASE WHEN seller_broker = $2 THEN amount ELSE 0 END) as sell_amount,
                   SUM(CASE WHEN buyer_broker = $3 THEN quantity ELSE 0 END) as buy_qty,
                   SUM(CASE WHEN seller_broker = $4 THEN quantity ELSE 0 END) as sell_qty
            FROM floorsheet_raw
            WHERE buyer_broker = $5 OR seller_broker = $6
            GROUP BY day
            ORDER BY day ASC
          `
          const result = await pool.query(dailyQuery, [brokerId, brokerId, brokerId, brokerId, brokerId, brokerId])
          return result.rows
        },
        skipCache
      )
    }

    setCacheHeaders(res, 300)
    return res.status(200).json({ ranking, daily })
  } catch (error: any) {
    console.error('Error in broker analysis:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
