interface PairRow {
  buyer_broker: string
  seller_broker: string
  total_amount: string
  total_qty: string
  trade_count: string
}

interface MatrixRow {
  buyer_broker: string
  seller_broker: string
  total_amount: string
}

type Params = Record<string, never>

export default async function (_req: { params: Params }) {
  const topPairsResult = await grafana.query<PairRow>(`
    SELECT buyer_broker, seller_broker, SUM(amount) as total_amount, SUM(quantity) as total_qty, COUNT(*) as trade_count
    FROM floorsheet_raw
    WHERE buyer_broker != seller_broker
    GROUP BY buyer_broker, seller_broker
    ORDER BY total_amount DESC
    LIMIT 20
  `)

  const topBrokersResult = await grafana.query<{ broker: string; turnover: string }>(`
    WITH buys AS (
      SELECT buyer_broker as broker, SUM(amount) as buy_amount FROM floorsheet_raw GROUP BY buyer_broker
    ),
    sells AS (
      SELECT seller_broker as broker, SUM(amount) as sell_amount FROM floorsheet_raw GROUP BY seller_broker
    )
    SELECT COALESCE(b.broker, s.broker)::text as broker,
           COALESCE(b.buy_amount, 0) + COALESCE(s.sell_amount, 0) as turnover
    FROM buys b FULL OUTER JOIN sells s ON b.broker = s.broker
    ORDER BY turnover DESC
    LIMIT 10
  `)

  const topBrokerIds = topBrokersResult.data.map((r) => Number(r.broker))

  const matrixResult = await grafana.query<MatrixRow>(
    `SELECT buyer_broker, seller_broker, SUM(amount) as total_amount
     FROM floorsheet_raw
     WHERE buyer_broker = ANY($1) AND seller_broker = ANY($2)
     GROUP BY buyer_broker, seller_broker`,
    [topBrokerIds, topBrokerIds]
  )

  return {
    topPairs: topPairsResult.data,
    topBrokers: topBrokersResult.data,
    matrix: matrixResult.data,
  }
}
