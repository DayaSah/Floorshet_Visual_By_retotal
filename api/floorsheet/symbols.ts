import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const symbol = req.query.symbol ? String(req.query.symbol).trim().toUpperCase() : ''
    const skipCache = req.query._skip_cache === '1'
    const pool = getPool()

    // 1. Fetch ranking (cached for 5 minutes)
    const ranking = await getCachedOrFetch(
      'symbol_ranking',
      300,
      async () => {
        const rankingQuery = `
          WITH ordered AS (
            SELECT symbol, rate, trade_time,
                   ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY trade_time ASC) as rn_first,
                   ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY trade_time DESC) as rn_last
            FROM floorsheet_raw
          ),
          agg AS (
            SELECT symbol, SUM(amount) as total_amount, SUM(quantity) as total_quantity, COUNT(*) as trade_count,
                   MIN(rate) as min_rate, MAX(rate) as max_rate
            FROM floorsheet_raw GROUP BY symbol
          ),
          first_rate AS (SELECT symbol, rate as first_rate FROM ordered WHERE rn_first = 1),
          last_rate AS (SELECT symbol, rate as last_rate FROM ordered WHERE rn_last = 1)
          SELECT a.symbol, a.total_amount, a.total_quantity, a.trade_count, a.min_rate, a.max_rate,
                 f.first_rate, l.last_rate,
                 ROUND(((l.last_rate - f.first_rate) / NULLIF(f.first_rate, 0)) * 100, 2) as pct_change
          FROM agg a
          JOIN first_rate f ON a.symbol = f.symbol
          JOIN last_rate l ON a.symbol = l.symbol
          ORDER BY a.total_amount DESC
        `
        const result = await pool.query(rankingQuery)
        return result.rows
      },
      skipCache
    )

    // 2. If specific symbol requested, fetch its trade history (indexed by idx_symbol_time)
    let trades: any[] = []
    if (symbol) {
      trades = await getCachedOrFetch(
        `symbol_trades_${symbol}`,
        300,
        async () => {
          const tradesQuery = `
            SELECT trade_time, rate, quantity, amount, buyer_broker, seller_broker
            FROM floorsheet_raw
            WHERE symbol = $1
            ORDER BY trade_time ASC
          `
          const result = await pool.query(tradesQuery, [symbol])
          return result.rows
        },
        skipCache
      )
    }

    setCacheHeaders(res, 300)
    return res.status(200).json({ ranking, trades })
  } catch (error: any) {
    console.error('Error in symbol analysis:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
