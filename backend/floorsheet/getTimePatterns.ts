interface MinuteBucketRow {
  bucket_minute: string
  trade_count: string
  total_amount: string
}

interface DowRow {
  dow: string
  trade_count: string
  total_amount: string
}

type Params = Record<string, never>

export default async function (_req: { params: Params }) {
  const [minuteResult, dowResult] = await Promise.all([
    grafana.query<MinuteBucketRow>(`
      SELECT (EXTRACT(HOUR FROM trade_time) * 60 + FLOOR(EXTRACT(MINUTE FROM trade_time) / 5) * 5) as bucket_minute,
             COUNT(*) as trade_count,
             SUM(amount) as total_amount
      FROM floorsheet_raw
      GROUP BY bucket_minute
      ORDER BY bucket_minute ASC
    `),
    grafana.query<DowRow>(`
      SELECT EXTRACT(DOW FROM trade_time) as dow,
             COUNT(*) as trade_count,
             SUM(amount) as total_amount
      FROM floorsheet_raw
      GROUP BY dow
      ORDER BY dow ASC
    `),
  ])

  return {
    minuteBuckets: minuteResult.data,
    dayOfWeek: dowResult.data,
  }
}
