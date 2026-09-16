import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders, parseDateRange } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const broker = req.query.broker ? String(req.query.broker).trim() : ''
    const skipCache = req.query._skip_cache === '1'
    const pool = getPool()
    const { condition, params: dateParams, cacheSuffix } = parseDateRange(req.query)

    // 1. Fetch ranking (cached per date range)
    const ranking = await getCachedOrFetch(
      `broker_ranking_${cacheSuffix}`,
      86400,
      async () => {
        const rankingQuery = `
          WITH buys AS (
            SELECT buyer_broker as broker, SUM(amount) as buy_amount, SUM(quantity) as buy_qty, COUNT(*) as buy_count
            FROM floorsheet_raw WHERE 1=1 ${condition} GROUP BY buyer_broker
          ),
          sells AS (
            SELECT seller_broker as broker, SUM(amount) as sell_amount, SUM(quantity) as sell_qty, COUNT(*) as sell_count
            FROM floorsheet_raw WHERE 1=1 ${condition} GROUP BY seller_broker
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
        const result = await pool.query(rankingQuery, dateParams)
        return result.rows
      },
      skipCache
    )

    // 2. If specific broker requested, fetch daily history and stock holding breakdown
    let daily: any[] = []
    let stocks: any[] = []
    if (broker) {
      const brokerId = Number(broker)
      if (!Number.isNaN(brokerId)) {
        // Build broker-specific condition: broker params come first, then date params
        const brokerDateCondition = condition.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + 6}`)

        daily = await getCachedOrFetch(
          `broker_daily_${broker}_${cacheSuffix}`,
          14400,
          async () => {
            const dailyQuery = `
              SELECT trade_time::date as day,
                     SUM(CASE WHEN buyer_broker = $1 THEN amount ELSE 0 END) as buy_amount,
                     SUM(CASE WHEN seller_broker = $2 THEN amount ELSE 0 END) as sell_amount,
                     SUM(CASE WHEN buyer_broker = $3 THEN quantity ELSE 0 END) as buy_qty,
                     SUM(CASE WHEN seller_broker = $4 THEN quantity ELSE 0 END) as sell_qty
              FROM floorsheet_raw
              WHERE (buyer_broker = $5 OR seller_broker = $6) ${brokerDateCondition}
              GROUP BY day
              ORDER BY day ASC
            `
            const result = await pool.query(dailyQuery, [brokerId, brokerId, brokerId, brokerId, brokerId, brokerId, ...dateParams])
            return result.rows
          },
          skipCache
        )

        // Stock breakdown: broker params $1, $2, then date params shift
        const stockDateCondition = condition.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + 1}`)
        const stockDateCondition2 = condition.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + 2}`)

        stocks = await getCachedOrFetch(
          `broker_stocks_${broker}_${cacheSuffix}`,
          14400,
          async () => {
            const stocksQuery = `
              WITH bought AS (
                SELECT symbol, SUM(amount) as buy_amount, SUM(quantity) as buy_qty, COUNT(*) as buy_count
                FROM floorsheet_raw
                WHERE buyer_broker = $1 ${stockDateCondition}
                GROUP BY symbol
              ),
              sold AS (
                SELECT symbol, SUM(amount) as sell_amount, SUM(quantity) as sell_qty, COUNT(*) as sell_count
                FROM floorsheet_raw
                WHERE seller_broker = $${dateParams.length + 2} ${stockDateCondition2}
                GROUP BY symbol
              )
              SELECT COALESCE(b.symbol, s.symbol) as symbol,
                     COALESCE(b.buy_amount, 0) as buy_amount,
                     COALESCE(s.sell_amount, 0) as sell_amount,
                     COALESCE(b.buy_amount, 0) - COALESCE(s.sell_amount, 0) as net_amount,
                     COALESCE(b.buy_qty, 0) as buy_qty,
                     COALESCE(s.sell_qty, 0) as sell_qty,
                     COALESCE(b.buy_qty, 0) - COALESCE(s.sell_qty, 0) as net_qty,
                     COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0) as total_amount
              FROM bought b FULL OUTER JOIN sold s ON b.symbol = s.symbol
              ORDER BY total_amount DESC
              LIMIT 50
            `
            const result = await pool.query(stocksQuery, [brokerId, ...dateParams, brokerId, ...dateParams])
            return result.rows
          },
          skipCache
        )
      }
    }

    setCacheHeaders(res, 86400, 300)
    return res.status(200).json({ ranking, daily, stocks })
  } catch (error: any) {
    console.error('Error in broker analysis:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
