import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useGetSymbolAnalysis } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../lib/shadcn/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { SignBadge } from '../components/SignBadge'
import { CHART_PRIMARY, signColor } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatDay, formatNumber } from '../utils/format'

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

interface RankingPoint {
  symbol: string
  totalAmount: number
  totalQuantity: number
  tradeCount: number
  minRate: number
  maxRate: number
  pctChange: number
}

export default function SymbolAnalysis() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetSymbolAnalysis()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSymbol = searchParams.get('symbol')?.trim().toUpperCase() || ''
  const [selectedSymbol, setSelectedSymbol] = useState<string>(urlSymbol)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'totalAmount', desc: true }])

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol)
    if (symbol) {
      setSearchParams({ symbol })
      trigger({ symbol })
    } else {
      setSearchParams({})
      trigger()
    }
  }

  useEffect(() => {
    if (urlSymbol) {
      setSelectedSymbol(urlSymbol)
      trigger({ symbol: urlSymbol })
    } else {
      trigger()
    }
  }, [urlSymbol])

  const ranking: RankingPoint[] = useMemo(
    () =>
      data?.ranking.map((row: SymbolRankingRow) => ({
        symbol: row.symbol,
        totalAmount: Number(row.total_amount),
        totalQuantity: Number(row.total_quantity),
        tradeCount: Number(row.trade_count),
        minRate: Number(row.min_rate),
        maxRate: Number(row.max_rate),
        pctChange: Number(row.pct_change),
      })) ?? [],
    [data]
  )

  const topByAmount = useMemo(() => [...ranking].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10), [ranking])
  const topGainers = useMemo(() => [...ranking].sort((a, b) => b.pctChange - a.pctChange).slice(0, 8), [ranking])
  const topLosers = useMemo(() => [...ranking].sort((a, b) => a.pctChange - b.pctChange).slice(0, 8), [ranking])

  const symbolOptions = useMemo(() => [...ranking].sort((a, b) => a.symbol.localeCompare(b.symbol)), [ranking])

  const priceHistory = useMemo(() => {
    if (!selectedSymbol || !data) return []
    return data.trades.map((t: { trade_time: string; rate: string; quantity: string; amount: string }) => ({
      trade_time: t.trade_time,
      rate: Number(t.rate),
      quantity: Number(t.quantity),
      amount: Number(t.amount),
    }))
  }, [data, selectedSymbol])

  const dailyForSymbol = useMemo(() => {
    if (priceHistory.length === 0) return []
    const byDay = new Map<string, { day: string; volume: number; turnover: number; close: number }>()
    for (const p of priceHistory) {
      const day = p.trade_time.slice(0, 10)
      const existing = byDay.get(day)
      if (existing) {
        existing.volume += p.quantity
        existing.turnover += p.amount
        existing.close = p.rate
      } else {
        byDay.set(day, { day, volume: p.quantity, turnover: p.amount, close: p.rate })
      }
    }
    return Array.from(byDay.values())
  }, [priceHistory])

  const selectedTrend =
    dailyForSymbol.length >= 2
      ? (dailyForSymbol[dailyForSymbol.length - 1]?.close ?? 0) - (dailyForSymbol[0]?.close ?? 0)
      : 0

  const columns = useMemo<ColumnDef<RankingPoint>[]>(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => {
          const sym = getValue<string>()
          return (
            <button
              onClick={() => handleSelectSymbol(sym)}
              className="font-semibold text-primary hover:underline hover:opacity-80 transition-opacity text-left cursor-pointer"
              title={`Deep dive into ${sym}`}
            >
              {sym}
            </button>
          )
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Turnover',
        cell: ({ getValue }) => <span className="tabular-nums">{formatCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: 'totalQuantity',
        header: 'Volume',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<number>())}</span>,
      },
      {
        accessorKey: 'tradeCount',
        header: 'Trades',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<number>())}</span>,
      },
      {
        accessorKey: 'minRate',
        header: 'Low',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<number>())}</span>,
      },
      {
        accessorKey: 'maxRate',
        header: 'High',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<number>())}</span>,
      },
      {
        accessorKey: 'pctChange',
        header: 'Change',
        cell: ({ getValue }) => {
          const v = getValue<number>()
          return (
            <SignBadge value={v}>
              {v >= 0 ? '+' : ''}
              {v.toFixed(2)}%
            </SignBadge>
          )
        },
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

  const totalTurnover = ranking.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalVolume = ranking.reduce((sum, r) => sum + r.totalQuantity, 0)
  const gainersCount = ranking.filter((r) => r.pctChange >= 0).length
  const losersCount = ranking.length - gainersCount

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Symbol Analysis</h1>
            <p className="text-sm text-muted-foreground">Turnover, volume, and price change by stock symbol</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Symbols Traded" value={formatNumber(ranking.length)} tone="neutral" />
          <KpiCard label="Total Turnover" value={formatCurrency(totalTurnover)} tone="info" icon={<Wallet className="w-4 h-4" />} />
          <KpiCard label="Total Volume" value={formatNumber(totalVolume)} tone="neutral" />
          <KpiCard
            label="Gainers vs Losers"
            value={`${gainersCount} / ${losersCount}`}
            tone={gainersCount >= losersCount ? 'positive' : 'negative'}
            icon={gainersCount >= losersCount ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Top Gainers
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Largest price increase, first to last trade</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topGainers} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <YAxis dataKey="symbol" type="category" width={60} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Change']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="pctChange" radius={[0, 4, 4, 0]}>
                  {topGainers.map((entry) => (
                    <Cell key={entry.symbol} fill={signColor(entry.pctChange)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Top Losers
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Largest price decrease, first to last trade</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topLosers} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <YAxis dataKey="symbol" type="category" width={60} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Change']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="pctChange" radius={[0, 4, 4, 0]}>
                  {topLosers.map((entry) => (
                    <Cell key={entry.symbol} fill={signColor(entry.pctChange)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Top 10 Symbols by Turnover</h2>
          <p className="text-sm text-muted-foreground mb-4">Total traded amount per symbol</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topByAmount}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="symbol" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), 'Turnover']}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
              />
              <Bar dataKey="totalAmount" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Symbol Deep Dive</h2>
              <p className="text-sm text-muted-foreground">Select a symbol to see its trade activity trend</p>
            </div>
            <Select
              value={selectedSymbol}
              onValueChange={handleSelectSymbol}
            >
              <SelectTrigger className="w-48 bg-background/60">
                <SelectValue placeholder="Select a symbol" />
              </SelectTrigger>
              <SelectContent>
                {symbolOptions.map((s) => (
                  <SelectItem key={s.symbol} value={s.symbol}>
                    {s.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedSymbol ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Select a symbol above to see its price and volume trend
            </div>
          ) : loading ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                  Closing Rate per Day
                  <SignBadge value={selectedTrend}>{selectedTrend >= 0 ? 'Up' : 'Down'}</SignBadge>
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={dailyForSymbol}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <Tooltip
                      labelFormatter={(value) => formatDay(String(value))}
                      formatter={(value) => [Number(value).toLocaleString(), 'Rate']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                    />
                    <Line type="monotone" dataKey="close" stroke={signColor(selectedTrend)} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">Daily Turnover</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={dailyForSymbol}>
                    <defs>
                      <linearGradient id="symbolTurnoverGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      labelFormatter={(value) => formatDay(String(value))}
                      formatter={(value) => [Number(value).toLocaleString(), 'Turnover']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--card-foreground))' }}
                    />
                    <Area type="monotone" dataKey="turnover" stroke={CHART_PRIMARY} fill="url(#symbolTurnoverGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="rounded-xl border border-border/60 bg-card shadow-retool-sm overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-semibold">All Symbols</h2>
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="transition-colors hover:bg-accent/60">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
