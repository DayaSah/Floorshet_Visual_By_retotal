interface SymbolRankingRow {
  symbol: string
  total_amount: string
  total_quantity: string
  trade_count: string
  min_rate: string
  max_rate: string
  first_rate: string
  last_rate: string
  pct_change: string
}

interface SymbolTradeRow {
  trade_time: string
  rate: string
  quantity: string
  amount: string
  buyer_broker: string
  seller_broker: string
}

interface Params {
  symbol?: string
}

export default async function (req: { params: Params }) {
  const rankingResult = await grafana.query<SymbolRankingRow>(`
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
           ROUND(((l.last_rate - f.first_rate) / f.first_rate) * 100, 2) as pct_change
    FROM agg a
    JOIN first_rate f ON a.symbol = f.symbol
    JOIN last_rate l ON a.symbol = l.symbol
    ORDER BY a.total_amount DESC
  `)

  let trades: SymbolTradeRow[] = []
  if (req.params.symbol) {
    const tradesResult = await grafana.query<SymbolTradeRow>(
      `SELECT trade_time, rate, quantity, amount, buyer_broker, seller_broker
       FROM floorsheet_raw
       WHERE symbol = $1
       ORDER BY trade_time ASC`,
      [req.params.symbol]
    )
    trades = tradesResult.data
  }

  return {
    ranking: rankingResult.data,
    trades,
  }
}
