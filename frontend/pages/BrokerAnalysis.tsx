import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, RefreshCw, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useGetBrokerAnalysis } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../lib/shadcn/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { SignBadge } from '../components/SignBadge'
import { getBrokerLabel } from '../utils/brokerNames'
import { CHART_DESTRUCTIVE, CHART_PRIMARY, CHART_SUCCESS, signColor } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatDay, formatNumber } from '../utils/format'
import { exportToCsv } from '../utils/csvExport'

interface BrokerRankingRow {
  broker: string
  buy_amount: string
  sell_amount: string
  net_amount: string
  buy_qty: string
  sell_qty: string
  trade_count: string
}

interface BrokerPoint {
  broker: string
  label: string
  buyAmount: number
  sellAmount: number
  netAmount: number
  buyQty: number
  sellQty: number
  tradeCount: number
  turnover: number
}

export default function BrokerAnalysis() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetBrokerAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlBroker = searchParams.get('broker')?.trim() || ''
  const [selectedBroker, setSelectedBroker] = useState<string>(urlBroker)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'turnover', desc: true }])

  const handleSelectBroker = (broker: string) => {
    setSelectedBroker(broker)
    if (broker) {
      setSearchParams({ broker })
      trigger({ broker })
    } else {
      setSearchParams({})
      trigger()
    }
  }

  useEffect(() => {
    if (urlBroker) {
      setSelectedBroker(urlBroker)
      trigger({ broker: urlBroker })
    } else {
      trigger()
    }
  }, [urlBroker])

  const ranking: BrokerPoint[] = useMemo(
    () =>
      data?.ranking.map((row: BrokerRankingRow) => {
        const buyAmount = Number(row.buy_amount)
        const sellAmount = Number(row.sell_amount)
        return {
          broker: row.broker,
          label: getBrokerLabel(row.broker),
          buyAmount,
          sellAmount,
          netAmount: Number(row.net_amount),
          buyQty: Number(row.buy_qty),
          sellQty: Number(row.sell_qty),
          tradeCount: Number(row.trade_count),
          turnover: buyAmount + sellAmount,
        }
      }) ?? [],
    [data]
  )

  const topByTurnover = useMemo(() => [...ranking].sort((a, b) => b.turnover - a.turnover).slice(0, 10), [ranking])
  const topAccumulators = useMemo(() => [...ranking].sort((a, b) => b.netAmount - a.netAmount).slice(0, 8), [ranking])
  const topDistributors = useMemo(() => [...ranking].sort((a, b) => a.netAmount - b.netAmount).slice(0, 8), [ranking])

  const accumulatorCount = ranking.filter((r) => r.netAmount >= 0).length
  const distributorCount = ranking.length - accumulatorCount

  const dailyForBroker = useMemo(
    () =>
      data?.daily.map((row: { day: string; buy_amount: string; sell_amount: string; buy_qty: string; sell_qty: string }) => ({
        day: row.day,
        buyAmount: Number(row.buy_amount),
        sellAmount: Number(row.sell_amount),
        netAmount: Number(row.buy_amount) - Number(row.sell_amount),
        buyQty: Number(row.buy_qty),
        sellQty: Number(row.sell_qty),
      })) ?? [],
    [data]
  )

  const columns = useMemo<ColumnDef<BrokerPoint>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Broker',
        cell: ({ row }) => {
          const b = row.original
          return (
            <button
              onClick={() => handleSelectBroker(b.broker)}
              className="font-semibold text-primary hover:underline hover:opacity-80 transition-opacity text-left cursor-pointer"
              title={`Analyze broker #${b.broker}`}
            >
              {b.label}
            </button>
          )
        },
      },
      {
        accessorKey: 'buyAmount',
        header: 'Buy Amount',
        cell: ({ getValue }) => <span className="tabular-nums text-success">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'sellAmount',
        header: 'Sell Amount',
        cell: ({ getValue }) => <span className="tabular-nums text-destructive">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'netAmount',
        header: 'Net Position',
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return <SignBadge value={v}>{v >= 0 ? 'Accumulating' : 'Distributing'}</SignBadge>
        },
      },
      {
        accessorKey: 'turnover',
        header: 'Turnover',
        cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'tradeCount',
        header: 'Trades',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<number>())}</span>,
      },
    ],
    []
  )

  const table = useReactTable({
    data: ranking,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleExportCsv = () => {
    if (selectedBroker && dailyForBroker.length > 0) {
      exportToCsv(
        `broker_${selectedBroker}_daily_${new Date().toISOString().slice(0, 10)}`,
        [
          { key: 'day', label: 'Date' },
          { key: 'buyAmount', label: 'Buy Amount (NPR)' },
          { key: 'sellAmount', label: 'Sell Amount (NPR)' },
          { key: 'netAmount', label: 'Net Position (NPR)' },
          { key: 'buyQty', label: 'Buy Volume' },
          { key: 'sellQty', label: 'Sell Volume' },
        ],
        dailyForBroker
      )
    } else {
      exportToCsv(
        `nepse_broker_rankings_${new Date().toISOString().slice(0, 10)}`,
        [
          { key: 'broker', label: 'Broker #' },
          { key: 'label', label: 'Broker Name' },
          { key: 'buyAmount', label: 'Buy Amount (NPR)' },
          { key: 'sellAmount', label: 'Sell Amount (NPR)' },
          { key: 'netAmount', label: 'Net Amount (NPR)' },
          { key: 'buyQty', label: 'Buy Qty' },
          { key: 'sellQty', label: 'Sell Qty' },
          { key: 'tradeCount', label: 'Trades' },
          { key: 'turnover', label: 'Turnover (NPR)' },
        ],
        ranking
      )
    }
  }

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Broker Analysis</h1>
            <p className="text-sm text-muted-foreground">Buy/sell activity, net position, and rankings by broker</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={ranking.length === 0}
              className="gap-2 transition-transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              {selectedBroker ? `Export #${selectedBroker}` : 'Export CSV'}
            </Button>
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Active Brokers" value={formatNumber(ranking.length)} tone="neutral" icon={<Users className="w-4 h-4" />} />
          <KpiCard label="Total Buy Amount" value={formatCurrency(ranking.reduce((s, r) => s + r.buyAmount, 0))} tone="positive" icon={<TrendingUp className="w-4 h-4" />} />
          <KpiCard label="Total Sell Amount" value={formatCurrency(ranking.reduce((s, r) => s + r.sellAmount, 0))} tone="negative" icon={<TrendingDown className="w-4 h-4" />} />
          <KpiCard
            label="Accumulating vs Distributing"
            value={`${accumulatorCount} / ${distributorCount}`}
            tone={accumulatorCount >= distributorCount ? 'positive' : 'negative'}
          />
        </div>

        <GlassCard className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Top 10 Brokers by Turnover</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Buy amount + sell amount combined. <span className="text-success">Green</span> = net accumulator,{' '}
            <span className="text-destructive">red</span> = net distributor.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topByTurnover}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="broker" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                labelFormatter={(_, payload) => (payload && payload[0] ? String(payload[0].payload.label) : '')}
                formatter={(value) => [Number(value).toLocaleString(), 'Turnover']}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
              />
              <Bar dataKey="turnover" radius={[4, 4, 0, 0]}>
                {topByTurnover.map((entry) => (
                  <Cell key={entry.broker} fill={signColor(entry.netAmount)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Top Net Buyers (Accumulation)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Buy amount minus sell amount, highest net buy</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topAccumulators} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="broker" type="category" width={50} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  labelFormatter={(_, payload) => (payload && payload[0] ? String(payload[0].payload.label) : '')}
                  formatter={(value) => [Number(value).toLocaleString(), 'Net']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="netAmount" fill={CHART_SUCCESS} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Top Net Sellers (Distribution)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Sell amount exceeding buy amount, highest net sell</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topDistributors} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="broker" type="category" width={50} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  labelFormatter={(_, payload) => (payload && payload[0] ? String(payload[0].payload.label) : '')}
                  formatter={(value) => [Number(value).toLocaleString(), 'Net']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="netAmount" fill={CHART_DESTRUCTIVE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Broker Deep Dive</h2>
              <p className="text-sm text-muted-foreground">
                Daily buy (green), sell (red), and net position (line) for a selected broker
              </p>
            </div>
            <Select
              value={selectedBroker}
              onValueChange={handleSelectBroker}
            >
              <SelectTrigger className="w-56 bg-background/60">
                <SelectValue placeholder="Select a broker" />
              </SelectTrigger>
              <SelectContent>
                {[...ranking]
                  .sort((a, b) => Number(a.broker) - Number(b.broker))
                  .map((b) => (
                    <SelectItem key={b.broker} value={b.broker}>
                      {b.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedBroker ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Select a broker above to see their daily trading trend
            </div>
          ) : loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dailyForBroker}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  labelFormatter={(value) => formatDay(String(value))}
                  formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Legend />
                <Bar dataKey="buyAmount" name="Buy" fill={CHART_SUCCESS} radius={[4, 4, 0, 0]} />
                <Bar dataKey="sellAmount" name="Sell" fill={CHART_DESTRUCTIVE} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="netAmount" name="Net" stroke={CHART_PRIMARY} strokeWidth={2.5} dot={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <div className="rounded-xl border border-border/60 bg-card shadow-retool-sm overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold">All Brokers</h2>
            <p className="text-sm text-muted-foreground mb-4">Click column headers to sort</p>
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortDir = header.column.getIsSorted()
                    return (
                      <TableHead key={header.id}>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : sortDir === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                          )}
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const netAmount = row.original.netAmount
                return (
                  <TableRow
                    key={row.id}
                    className={`transition-colors hover:bg-accent/60 ${netAmount >= 0 ? 'bg-success/5' : 'bg-destructive/5'}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
