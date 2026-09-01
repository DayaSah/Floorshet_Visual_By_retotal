interface SizeBucketRow {
  bucket: string
  trade_count: string
  total_amount: string
}

interface BlockDealRow {
  contract_id: string
  symbol: string
  buyer_broker: string
  seller_broker: string
  quantity: string
  rate: string
  amount: string
  trade_time: string
}

type Params = Record<string, never>

export default async function (_req: { params: Params }) {
  const [sizeResult, blockDealsResult] = await Promise.all([
    grafana.query<SizeBucketRow>(`
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
    grafana.query<BlockDealRow>(`
      SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time
      FROM floorsheet_raw
      ORDER BY amount DESC
      LIMIT 25
    `),
  ])

  return {
    sizeDistribution: sizeResult.data,
    blockDeals: blockDealsResult.data,
  }
}
