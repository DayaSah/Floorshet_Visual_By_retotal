interface DailyVolumeRow {
  day: string
  total_amount: string
  total_quantity: string
  trade_count: string
}

interface TopSymbolRow {
  symbol: string
  total_amount: string
  total_quantity: string
  trade_count: string
}

type Params = Record<string, never>

export default async function (_req: { params: Params }) {
  const [daily, topSymbols] = await Promise.all([
    grafana.query<DailyVolumeRow>(`
      SELECT date_trunc('day', trade_time) as day,
             SUM(amount) as total_amount,
             SUM(quantity) as total_quantity,
             COUNT(*) as trade_count
      FROM floorsheet_raw
      GROUP BY day
      ORDER BY day ASC
    `),
    grafana.query<TopSymbolRow>(`
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
    daily: daily.data,
    topSymbols: topSymbols.data,
  }
}
