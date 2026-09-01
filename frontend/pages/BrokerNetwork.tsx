import { useEffect, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Network, RefreshCw } from 'lucide-react'
import { useGetBrokerNetwork } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { getBrokerLabel } from '../utils/brokerNames'
import { CHART_PRIMARY } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatNumber } from '../utils/format'

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

function heatColor(ratio: number): string {
  // Informational intensity scale (not gain/loss) — uses the primary hue so it isn't
  // confused with the green/red accumulation-vs-distribution convention used elsewhere.
  const clamped = Math.max(0, Math.min(1, ratio))
  return `hsl(var(--primary) / ${0.06 + clamped * 0.7})`
}

export default function BrokerNetwork() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetBrokerNetwork()

  useEffect(() => {
    trigger()
  }, [])

  const topPairs = useMemo(
    () =>
      data?.topPairs.map((p: PairRow) => ({
        pair: `${p.buyer_broker} -> ${p.seller_broker}`,
        buyer: p.buyer_broker,
        seller: p.seller_broker,
        totalAmount: Number(p.total_amount),
        totalQty: Number(p.total_qty),
        tradeCount: Number(p.trade_count),
      })) ?? [],
    [data]
  )

  const topBrokerIds = useMemo(() => data?.topBrokers.map((b: { broker: string }) => b.broker) ?? [], [data])

  const matrixLookup = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of (data?.matrix ?? []) as MatrixRow[]) {
      map.set(`${row.buyer_broker}|${row.seller_broker}`, Number(row.total_amount))
    }
    return map
  }, [data])

  const maxMatrixValue = useMemo(() => {
    let max = 0
    for (const value of matrixLookup.values()) {
      if (value > max) max = value
    }
    return max || 1
  }, [matrixLookup])

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Broker Network</h1>
            <p className="text-sm text-muted-foreground">Which brokers trade with which — top counterparties and a turnover matrix</p>
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

        {topPairs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Tracked Broker Pairs" value={formatNumber(topPairs.length)} tone="neutral" icon={<Network className="w-4 h-4" />} />
            <KpiCard label="Largest Pair Turnover" value={formatCurrency(topPairs[0]?.totalAmount ?? 0)} tone="info" />
            <KpiCard label="Top Broker Pair" value={`#${topPairs[0]?.buyer} -> #${topPairs[0]?.seller}`} tone="info" />
          </div>
        ) : null}

        <GlassCard className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Top 20 Broker Pairs by Turnover</h2>
          <p className="text-sm text-muted-foreground mb-4">Buyer broker to seller broker, largest counterparty relationships</p>
          {loading && topPairs.length === 0 ? (
            <div className="h-[420px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={480}>
              <BarChart data={topPairs} layout="vertical" margin={{ left: 16 }}>
                <defs>
                  <linearGradient id="networkBarGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="pair" type="category" width={90} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Turnover']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="totalAmount" fill="url(#networkBarGradient)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold mb-1">Top 10 Brokers Turnover Matrix</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Rows = buyer, columns = seller. Darker cells indicate higher traded amount between the pair.
          </p>
          {loading && topBrokerIds.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-muted-foreground font-medium sticky left-0 bg-card">Buyer \ Seller</th>
                    {topBrokerIds.map((id: string) => (
                      <th key={id} className="p-2 text-center text-muted-foreground font-medium whitespace-nowrap" title={getBrokerLabel(id)}>
                        #{id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topBrokerIds.map((rowId: string) => (
                    <tr key={rowId}>
                      <td className="p-2 font-medium text-muted-foreground sticky left-0 bg-card whitespace-nowrap" title={getBrokerLabel(rowId)}>
                        #{rowId}
                      </td>
                      {topBrokerIds.map((colId: string) => {
                        const value = matrixLookup.get(`${rowId}|${colId}`) ?? 0
                        return (
                          <td
                            key={colId}
                            className="p-2 text-center border border-border/60 tabular-nums transition-all duration-200 hover:scale-105 hover:z-10 relative"
                            style={{ backgroundColor: value > 0 ? heatColor(value / maxMatrixValue) : undefined }}
                            title={`Buyer #${rowId} <- Seller #${colId}: ${formatCurrency(value)}`}
                          >
                            {value > 0 ? formatCompactNumber(value) : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {topPairs.length > 0 ? (
          <div className="text-sm text-muted-foreground mt-4">
            Largest counterparty pair: {getBrokerLabel(topPairs[0]?.buyer ?? '')} bought {formatNumber(topPairs[0]?.totalQty ?? 0)} shares
            from {getBrokerLabel(topPairs[0]?.seller ?? '')}, worth {formatCurrency(topPairs[0]?.totalAmount ?? 0)}.
          </div>
        ) : null}
      </div>
    </div>
  )
}
