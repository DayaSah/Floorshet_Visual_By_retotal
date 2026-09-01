interface BrokerRankingRow {
  broker: string
  buy_amount: string
  sell_amount: string
  net_amount: string
  buy_qty: string
  sell_qty: string
  trade_count: string
}

interface BrokerDailyRow {
  day: string
  buy_amount: string
  sell_amount: string
  buy_qty: string
  sell_qty: string
}

interface Params {
  broker?: string
}

export default async function (req: { params: Params }) {
  const rankingResult = await grafana.query<BrokerRankingRow>(`
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
  `)

  let daily: BrokerDailyRow[] = []
  if (req.params.broker) {
    const brokerId = Number(req.params.broker)
    const dailyResult = await grafana.query<BrokerDailyRow>(
      `SELECT trade_time::date as day,
              SUM(CASE WHEN buyer_broker = $1 THEN amount ELSE 0 END) as buy_amount,
              SUM(CASE WHEN seller_broker = $2 THEN amount ELSE 0 END) as sell_amount,
              SUM(CASE WHEN buyer_broker = $3 THEN quantity ELSE 0 END) as buy_qty,
              SUM(CASE WHEN seller_broker = $4 THEN quantity ELSE 0 END) as sell_qty
       FROM floorsheet_raw
       WHERE buyer_broker = $5 OR seller_broker = $6
       GROUP BY day
       ORDER BY day ASC`,
      [brokerId, brokerId, brokerId, brokerId, brokerId, brokerId]
    )
    daily = dailyResult.data
  }

  return {
    ranking: rankingResult.data,
    daily,
  }
}
