import { useEffect, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useGetTradeSizeAnalysis } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { getBrokerLabel } from '../utils/brokerNames'
import { SEVERITY_RAMP } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatNumber, formatTradeTime } from '../utils/format'

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

const BUCKET_ORDER = ['< 10K', '10K - 50K', '50K - 100K', '100K - 500K', '500K - 1M', '> 1M']
const BLOCK_DEAL_THRESHOLD = 1000000

export default function TradeSizeAnalysis() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetTradeSizeAnalysis()

  useEffect(() => {
    trigger()
  }, [])

  const sizeDistribution = useMemo(() => {
    const rows = (data?.sizeDistribution ?? []) as SizeBucketRow[]
    const byBucket = new Map(rows.map((r) => [r.bucket, r]))
    return BUCKET_ORDER.map((bucket) => {
      const row = byBucket.get(bucket)
      return {
        bucket,
        tradeCount: row ? Number(row.trade_count) : 0,
        totalAmount: row ? Number(row.total_amount) : 0,
      }
    })
  }, [data])

  const blockDeals = (data?.blockDeals ?? []) as BlockDealRow[]
  const totalTrades = sizeDistribution.reduce((s, b) => s + b.tradeCount, 0)
  const totalTurnover = sizeDistribution.reduce((s, b) => s + b.totalAmount, 0)
  const blockDealShare = sizeDistribution.find((b) => b.bucket === '> 1M')

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Trade Size Analysis</h1>
            <p className="text-sm text-muted-foreground">Trade size distribution and the largest block deals</p>
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
          <KpiCard label="Total Trades" value={formatNumber(totalTrades)} tone="neutral" />
          <KpiCard label="Total Turnover" value={formatCurrency(totalTurnover)} tone="info" />
          <KpiCard
            label="Block Deal Turnover (>1M)"
            value={formatCurrency(blockDealShare?.totalAmount ?? 0)}
            tone="negative"
            icon={<AlertTriangle className="w-4 h-4" />}
            hint={`${formatNumber(blockDealShare?.tradeCount ?? 0)} large trades`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-1">Trades by Size Bucket</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Number of trades in each amount range. Color intensifies from small (blue) to large, high-risk (red) trades.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sizeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Trades']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="tradeCount" radius={[4, 4, 0, 0]}>
                  {sizeDistribution.map((entry, index) => (
                    <Cell key={entry.bucket} fill={SEVERITY_RAMP[index % SEVERITY_RAMP.length] ?? 'hsl(var(--chart-1))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold mb-1">Turnover Share by Size Bucket</h2>
            <p className="text-sm text-muted-foreground mb-4">Proportion of total traded amount contributed by each bucket</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sizeDistribution.filter((d) => d.totalAmount > 0)}
                  dataKey="totalAmount"
                  nameKey="bucket"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sizeDistribution
                    .filter((d) => d.totalAmount > 0)
                    .map((entry, index) => (
                      <Cell key={entry.bucket} fill={SEVERITY_RAMP[index % SEVERITY_RAMP.length] ?? 'hsl(var(--chart-1))'} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Turnover']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="rounded-xl border border-border/60 bg-card shadow-retool-sm overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold">Largest Block Deals</h2>
            <p className="text-sm text-muted-foreground mb-4">Top 25 single trades by traded amount</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Trade Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && blockDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                blockDeals.map((deal) => {
                  const amount = Number(deal.amount)
                  const isHuge = amount >= BLOCK_DEAL_THRESHOLD
                  return (
                    <TableRow key={deal.contract_id} className={`transition-colors hover:bg-accent/60 ${isHuge ? 'bg-destructive/5' : ''}`}>
                      <TableCell className="font-medium">{deal.symbol}</TableCell>
                      <TableCell className="whitespace-nowrap">{getBrokerLabel(deal.buyer_broker)}</TableCell>
                      <TableCell className="whitespace-nowrap">{getBrokerLabel(deal.seller_broker)}</TableCell>
                      <TableCell className="tabular-nums">{formatNumber(deal.quantity)}</TableCell>
                      <TableCell className="tabular-nums">{formatNumber(deal.rate)}</TableCell>
                      <TableCell className="tabular-nums font-medium">
                        <span className="inline-flex items-center gap-1">
                          {formatCurrency(deal.amount)}
                          {isHuge ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                              Block
                            </span>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{formatTradeTime(deal.trade_time)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground mt-3">
          Total turnover across all buckets: {formatCompactNumber(totalTurnover)}
        </div>
      </div>
    </div>
  )
}
