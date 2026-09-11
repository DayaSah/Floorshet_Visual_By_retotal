import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPool, getCachedOrFetch, setCacheHeaders } from '../_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const symbol = req.query.symbol ? String(req.query.symbol).trim().toUpperCase() : ''
    const range = req.query.range ? String(req.query.range).trim().toLowerCase() : '15d'
    const customStart = req.query.startDate ? String(req.query.startDate).trim() : ''
    const customEnd = req.query.endDate ? String(req.query.endDate).trim() : ''
    const skipCache = req.query._skip_cache === '1'
    const pool = getPool()

    // 1. Always fetch / cache list of all distinct symbols for autocomplete
    const allSymbols = await getCachedOrFetch(
      'all_distinct_symbols',
      86400,
      async () => {
        const result = await pool.query('SELECT DISTINCT symbol FROM floorsheet_raw ORDER BY symbol ASC')
        return result.rows.map((r: { symbol: string }) => r.symbol)
      },
      skipCache
    )

    if (!symbol) {
      setCacheHeaders(res, 86400, 300)
      return res.status(200).json({ allSymbols, symbol: '', topBrokers: [], dailySeries: [] })
    }

    const cacheKey = `script_analysis_v2_${symbol}_${range}_${customStart}_${customEnd}`

    const resultData = await getCachedOrFetch(
      cacheKey,
      14400, // 4 hours
      async () => {
        // Determine date range boundaries based on max date of the stock
        let dateCondition = ''
        const params: any[] = [symbol]

        if (customStart && customEnd) {
          params.push(customStart, customEnd)
          dateCondition = `AND trade_time::date >= $2 AND trade_time::date <= $3`
        } else if (range !== 'all') {
          const days = range === '7d' ? 7 : range === '30d' ? 30 : 15
          // Get the maximum trade date for this symbol
          const maxRes = await pool.query(
            'SELECT MAX(trade_time::date) as max_date FROM floorsheet_raw WHERE symbol = $1',
            [symbol]
          )
          const maxDate = maxRes.rows[0]?.max_date
          if (maxDate) {
            params.push(maxDate, days)
            dateCondition = `AND trade_time::date >= ($2::date - ($3 || ' days')::interval) AND trade_time::date <= $2::date`
          }
        }

        // 1. Overall Script KPIs & Date Bounds
        const kpiQuery = `
          SELECT
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(SUM(quantity), 0) as total_quantity,
            COUNT(*) as trade_count,
            COALESCE(AVG(rate), 0) as avg_rate,
            MIN(trade_time::date) as actual_start_date,
            MAX(trade_time::date) as actual_end_date
          FROM floorsheet_raw
          WHERE symbol = $1 ${dateCondition}
        `
        const kpiResult = await pool.query(kpiQuery, params)
        const kpiRow = kpiResult.rows[0] || {}

        // 2. Broker Aggregations for this symbol & date range
        const brokerQuery = `
          WITH filtered AS (
            SELECT trade_time, buyer_broker, seller_broker, amount, quantity, rate
            FROM floorsheet_raw
            WHERE symbol = $1 ${dateCondition}
          ),
          buys AS (
            SELECT buyer_broker as broker, SUM(amount) as buy_amount, SUM(quantity) as buy_qty, COUNT(*) as buy_count
            FROM filtered GROUP BY buyer_broker
          ),
          sells AS (
            SELECT seller_broker as broker, SUM(amount) as sell_amount, SUM(quantity) as sell_qty, COUNT(*) as sell_count
            FROM filtered GROUP BY seller_broker
          )
          SELECT COALESCE(b.broker, s.broker)::text as broker,
                 COALESCE(b.buy_amount, 0) as buy_amount,
                 COALESCE(s.sell_amount, 0) as sell_amount,
                 COALESCE(b.buy_amount, 0) - COALESCE(s.sell_amount, 0) as net_amount,
                 COALESCE(b.buy_qty, 0) as buy_qty,
                 COALESCE(s.sell_qty, 0) as sell_qty,
                 COALESCE(b.buy_qty, 0) - COALESCE(s.sell_qty, 0) as net_qty,
                 COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0) as total_amount
          FROM buys b FULL OUTER JOIN sells s ON b.broker = s.broker
          ORDER BY total_amount DESC
        `
        const brokerResult = await pool.query(brokerQuery, params)
        const totalTurnover = Number(kpiRow.total_amount) || 1

        const topBrokers = brokerResult.rows.map((r: any) => ({
          broker: r.broker,
          buyAmount: Number(r.buy_amount),
          sellAmount: Number(r.sell_amount),
          netAmount: Number(r.net_amount),
          buyQty: Number(r.buy_qty),
          sellQty: Number(r.sell_qty),
          netQty: Number(r.net_qty),
          totalTurnover: Number(r.total_amount),
          turnoverPct: (Number(r.total_amount) / totalTurnover) * 100,
        }))

        const allTradedBrokerIds = topBrokers.map((b: any) => String(b.broker))

        // 3. Daywise Breakdown for all active brokers
        let dailySeries: any[] = []
        let dailySeriesCumulative: any[] = []

        if (allTradedBrokerIds.length > 0) {
          const daywiseQuery = `
            WITH b_buys AS (
              SELECT trade_time::date as day, buyer_broker as broker, SUM(amount) as buy_amount, SUM(quantity) as buy_qty
              FROM floorsheet_raw
              WHERE symbol = $1 ${dateCondition}
              GROUP BY day, buyer_broker
            ),
            b_sells AS (
              SELECT trade_time::date as day, seller_broker as broker, SUM(amount) as sell_amount, SUM(quantity) as sell_qty
              FROM floorsheet_raw
              WHERE symbol = $1 ${dateCondition}
              GROUP BY day, seller_broker
            )
            SELECT COALESCE(b.day, s.day)::text as day,
                   COALESCE(b.broker, s.broker)::text as broker,
                   COALESCE(b.buy_amount, 0) as buy_amount,
                   COALESCE(s.sell_amount, 0) as sell_amount,
                   COALESCE(b.buy_amount, 0) - COALESCE(s.sell_amount, 0) as net_amount,
                   COALESCE(b.buy_qty, 0) - COALESCE(s.sell_qty, 0) as net_qty
            FROM b_buys b FULL OUTER JOIN b_sells s ON b.day = s.day AND b.broker = s.broker
            ORDER BY day ASC
          `
          const dayResult = await pool.query(daywiseQuery, params)

          // Pivot rows by day
          const dayMap = new Map<string, any>()

          for (const row of dayResult.rows) {
            const d = String(row.day).slice(0, 10)
            if (!dayMap.has(d)) {
              dayMap.set(d, { day: d })
            }
            const entry = dayMap.get(d)
            const b = String(row.broker)
            entry[`net_${b}`] = Number(row.net_amount)
            entry[`buy_${b}`] = Number(row.buy_amount)
            entry[`sell_${b}`] = Number(row.sell_amount)
            entry[`qty_${b}`] = Number(row.net_qty)
          }

          dailySeries = Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day))

          // Compute cumulative running net totals per broker across the days
          const runningNet: Record<string, number> = {}
          const runningQty: Record<string, number> = {}

          dailySeriesCumulative = dailySeries.map((dayItem) => {
            const cumItem: any = { day: dayItem.day }
            for (const bStr of allTradedBrokerIds) {
              const netToday = dayItem[`net_${bStr}`] || 0
              const qtyToday = dayItem[`qty_${bStr}`] || 0
              runningNet[bStr] = (runningNet[bStr] || 0) + netToday
              runningQty[bStr] = (runningQty[bStr] || 0) + qtyToday
              cumItem[`cum_net_${bStr}`] = runningNet[bStr]
              cumItem[`cum_qty_${bStr}`] = runningQty[bStr]
              cumItem[`daily_net_${bStr}`] = netToday
            }
            return cumItem
          })
        }

        return {
          symbol,
          range,
          dateRange: {
            startDate: kpiRow.actual_start_date ? String(kpiRow.actual_start_date).slice(0, 10) : '',
            endDate: kpiRow.actual_end_date ? String(kpiRow.actual_end_date).slice(0, 10) : '',
          },
          kpis: {
            totalAmount: Number(kpiRow.total_amount),
            totalQuantity: Number(kpiRow.total_quantity),
            tradeCount: Number(kpiRow.trade_count),
            avgRate: Number(kpiRow.avg_rate),
          },
          topBrokers,
          dailySeries,
          dailySeriesCumulative,
        }
      },
      skipCache
    )

    setCacheHeaders(res, 86400, 300)
    return res.status(200).json({ ...resultData, allSymbols })
  } catch (error: any) {
    console.error('Error in script analysis API:', error)
    return res.status(500).json({ error: error.message || 'Internal Server Error' })
  }
}
