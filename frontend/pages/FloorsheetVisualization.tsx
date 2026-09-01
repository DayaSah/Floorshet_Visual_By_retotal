import { useEffect, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ArrowRightLeft, RefreshCw, Wallet } from 'lucide-react'
import { useGetFloorsheetStats } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { CHART_DESTRUCTIVE, CHART_PRIMARY, CHART_SUCCESS } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatDay, formatNumber } from '../utils/format'

const BAR_COLORS = [CHART_PRIMARY, 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

interface DailyPoint {
  day: string
  totalAmount: number
  totalQuantity: number
  tradeCount: number
}

interface SymbolPoint {
  symbol: string
  totalAmount: number
  totalQuantity: number
  tradeCount: number
}

export default function FloorsheetVisualization() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetFloorsheetStats()

  useEffect(() => {
    trigger()
  }, [])

  const daily: DailyPoint[] = useMemo(
    () =>
      data?.daily.map((row: { day: string; total_amount: string; total_quantity: string; trade_count: string }) => ({
        day: row.day,
        totalAmount: Number(row.total_amount),
        totalQuantity: Number(row.total_quantity),
        tradeCount: Number(row.trade_count),
      })) ?? [],
    [data]
  )

  const topSymbols: SymbolPoint[] = useMemo(
    () =>
      data?.topSymbols.map(
        (row: { symbol: string; total_amount: string; total_quantity: string; trade_count: string }) => ({
          symbol: row.symbol,
          totalAmount: Number(row.total_amount),
          totalQuantity: Number(row.total_quantity),
          tradeCount: Number(row.trade_count),
        })
      ) ?? [],
    [data]
  )

  const totalTurnover = daily.reduce((s, d) => s + d.totalAmount, 0)
  const totalTrades = daily.reduce((s, d) => s + d.tradeCount, 0)
  const trendUp = daily.length >= 2 ? (daily[daily.length - 1]?.totalAmount ?? 0) >= (daily[0]?.totalAmount ?? 0) : true
  const trendColor = trendUp ? CHART_SUCCESS : CHART_DESTRUCTIVE

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Market Overview</h1>
            <p className="text-sm text-muted-foreground">Trading activity summarized from floorsheet_raw</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            label="Total Turnover"
            value={formatCurrency(totalTurnover)}
            tone={trendUp ? 'positive' : 'negative'}
            icon={<Wallet className="w-4 h-4" />}
            hint={trendUp ? 'Trending up over the period' : 'Trending down over the period'}
          />
          <KpiCard label="Total Trades" value={formatNumber(totalTrades)} tone="info" icon={<ArrowRightLeft className="w-4 h-4" />} />
          <KpiCard label="Trading Days" value={formatNumber(daily.length)} tone="neutral" icon={<Activity className="w-4 h-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-1">Daily Traded Amount</h2>
            <p className="text-sm text-muted-foreground mb-4">Sum of trade amount per day</p>
            {loading && daily.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="dailyAmountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    labelFormatter={(value) => formatDay(String(value))}
                    formatter={(value) => [Number(value).toLocaleString(), 'Amount']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Area type="monotone" dataKey="totalAmount" stroke={trendColor} fill="url(#dailyAmountGradient)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold mb-1">Top 10 Symbols by Traded Amount</h2>
            <p className="text-sm text-muted-foreground mb-4">Sum of trade amount per symbol</p>
            {loading && topSymbols.length === 0 ? (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topSymbols} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="symbol" type="category" width={60} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), 'Amount']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]}>
                    {topSymbols.map((entry, index) => (
                      <Cell key={entry.symbol} fill={BAR_COLORS[index % BAR_COLORS.length] ?? CHART_PRIMARY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCard>

          <GlassCard className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-1">Daily Trade Count</h2>
            <p className="text-sm text-muted-foreground mb-4">Number of trades executed per day</p>
            {loading && daily.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={daily}>
                  <defs>
                    <linearGradient id="tradeCountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    labelFormatter={(value) => formatDay(String(value))}
                    formatter={(value) => [Number(value).toLocaleString(), 'Trades']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Bar dataKey="tradeCount" fill="url(#tradeCountGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
