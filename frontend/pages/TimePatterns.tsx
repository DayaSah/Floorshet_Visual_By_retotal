import { useEffect, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, RefreshCw } from 'lucide-react'
import { useGetTimePatterns } from '../hooks/backend/floorsheet'
import { useDateRange } from '../contexts/DateRangeContext'
import { Button } from '../lib/shadcn/button'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { CHART_PRIMARY, CHART_WARNING } from '../utils/chartColors'
import { DAY_OF_WEEK_LABELS, formatCompactNumber, formatMinuteOfDay, formatNumber } from '../utils/format'

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

export default function TimePatterns() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetTimePatterns()
  const { startDate, endDate } = useDateRange()

  useEffect(() => {
    trigger({ startDate, endDate })
  }, [startDate, endDate])

  const minuteBuckets = useMemo(
    () =>
      data?.minuteBuckets.map((row: MinuteBucketRow) => ({
        bucketMinute: Number(row.bucket_minute),
        label: formatMinuteOfDay(Number(row.bucket_minute)),
        tradeCount: Number(row.trade_count),
        totalAmount: Number(row.total_amount),
      })) ?? [],
    [data]
  )

  const dayOfWeek = useMemo(
    () =>
      data?.dayOfWeek.map((row: DowRow) => ({
        dow: Number(row.dow),
        label: DAY_OF_WEEK_LABELS[Number(row.dow)] ?? String(row.dow),
        tradeCount: Number(row.trade_count),
        totalAmount: Number(row.total_amount),
      })) ?? [],
    [data]
  )

  const busiestBucket = useMemo(
    () => [...minuteBuckets].sort((a, b) => b.tradeCount - a.tradeCount)[0],
    [minuteBuckets]
  )
  const busiestDay = useMemo(() => [...dayOfWeek].sort((a, b) => b.totalAmount - a.totalAmount)[0], [dayOfWeek])

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Time Patterns</h1>
            <p className="text-sm text-muted-foreground">When trading activity happens — intraday and weekly patterns</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trigger(undefined, { skipCache: true })}
            disabled={loading}
            className="gap-2 transition-transform hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="p-4 mb-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            Error: {error}
          </div>
        ) : dataAccessErrors.length > 0 ? (
          <div className="p-4 mb-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            Access restricted: {dataAccessErrors.map((e) => e.message).join('; ')}
          </div>
        ) : null}

        {busiestBucket && busiestDay ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <KpiCard label="Busiest Interval" value={busiestBucket.label} tone="info" icon={<Clock className="w-4 h-4" />} hint={`${formatNumber(busiestBucket.tradeCount)} trades`} />
            <KpiCard label="Busiest Day of Week" value={busiestDay.label} tone="info" icon={<Clock className="w-4 h-4" />} hint={`${formatNumber(busiestDay.totalAmount)} turnover`} />
          </div>
        ) : null}

        <GlassCard className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Intraday Activity (5-minute buckets)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Trade count across time of day, summed across all trading days. Activity is heavily concentrated near market close.
          </p>
          {loading && minuteBuckets.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={minuteBuckets}>
                <defs>
                  <linearGradient id="intradayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={1} />
                    <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={60} />
                <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Trades']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="tradeCount" fill="url(#intradayGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold mb-1">Activity by Day of Week</h2>
          <p className="text-sm text-muted-foreground mb-4">Total traded amount summed across all weeks in the data</p>
          {loading && dayOfWeek.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeek}>
                <defs>
                  <linearGradient id="dowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_WARNING} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={CHART_WARNING} stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Turnover']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="totalAmount" fill="url(#dowGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
