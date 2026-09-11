import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, Download, RefreshCw, Star, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useGetSymbolAnalysis } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../lib/shadcn/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { SignBadge } from '../components/SignBadge'
import { CHART_PRIMARY, signColor } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatDay, formatNumber } from '../utils/format'
import { exportToCsv } from '../utils/csvExport'
import { getBrokerLabel } from '../utils/brokerNames'
import { getWatchlist, subscribeWatchlist, toggleBrokerWatchlist, toggleSymbolWatchlist } from '../utils/watchlist'

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
  const [watchlist, setWatchlist] = useState(getWatchlist)
  const [brokerTab, setBrokerTab] = useState<'smart_flow' | 'volume'>('smart_flow')

  useEffect(() => {
    return subscribeWatchlist(setWatchlist)
  }, [])

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

  const brokerActivity = useMemo(() => {
    if (!selectedSymbol || !data?.trades || data.trades.length === 0) {
      return {
        accumulators: [],
        distributors: [],
        topBuyers: [],
        topSellers: [],
        totalTurnover: 0,
      }
    }

    const map = new Map<string, { buyAmount: number; buyQty: number; sellAmount: number; sellQty: number }>()
    let totalStockTurnover = 0

    for (const t of data.trades) {
      const amt = Number(t.amount) || 0
      const qty = Number(t.quantity) || 0
      totalStockTurnover += amt

      const b = String(t.buyer_broker)
      const s = String(t.seller_broker)

      if (!map.has(b)) map.set(b, { buyAmount: 0, buyQty: 0, sellAmount: 0, sellQty: 0 })
      const bEntry = map.get(b)!
      bEntry.buyAmount += amt
      bEntry.buyQty += qty

      if (!map.has(s)) map.set(s, { buyAmount: 0, buyQty: 0, sellAmount: 0, sellQty: 0 })
      const sEntry = map.get(s)!
      sEntry.sellAmount += amt
      sEntry.sellQty += qty
    }

    const list = Array.from(map.entries()).map(([broker, stats]) => ({
      broker,
      label: getBrokerLabel(broker),
      buyAmount: stats.buyAmount,
      buyQty: stats.buyQty,
      sellAmount: stats.sellAmount,
      sellQty: stats.sellQty,
      netAmount: stats.buyAmount - stats.sellAmount,
      netQty: stats.buyQty - stats.sellQty,
      totalTurnover: stats.buyAmount + stats.sellAmount,
    }))

    const accumulators = list
      .filter((b) => b.netAmount > 0)
      .sort((a, b) => b.netAmount - a.netAmount)
      .slice(0, 5)

    const distributors = list
      .filter((b) => b.netAmount < 0)
      .sort((a, b) => a.netAmount - b.netAmount)
      .slice(0, 5)

    const topBuyers = [...list].sort((a, b) => b.buyAmount - a.buyAmount).slice(0, 5)
    const topSellers = [...list].sort((a, b) => b.sellAmount - a.sellAmount).slice(0, 5)

    return { accumulators, distributors, topBuyers, topSellers, totalTurnover: totalStockTurnover }
  }, [data, selectedSymbol])

  const columns = useMemo<ColumnDef<RankingPoint>[]>(
    () => [
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => {
          const sym = getValue<string>()
          const isStarred = watchlist.symbols.includes(sym)
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSymbolWatchlist(sym)
                }}
                className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-warning fill-warning' : ''}`} />
              </button>
              <button
                onClick={() => handleSelectSymbol(sym)}
                className="font-semibold text-primary hover:underline hover:opacity-80 transition-opacity text-left cursor-pointer"
                title={`Deep dive into ${sym}`}
              >
                {sym}
              </button>
            </div>
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

  const handleExportCsv = () => {
    if (selectedSymbol && priceHistory.length > 0) {
      exportToCsv(
        `${selectedSymbol}_trades_${new Date().toISOString().slice(0, 10)}`,
        [
          { key: 'trade_time', label: 'Trade Time' },
          { key: 'rate', label: 'Rate' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'amount', label: 'Amount' },
        ],
        priceHistory
      )
    } else {
      exportToCsv(
        `nepse_symbol_rankings_${new Date().toISOString().slice(0, 10)}`,
        [
          { key: 'symbol', label: 'Symbol' },
          { key: 'totalAmount', label: 'Turnover (NPR)' },
          { key: 'totalQuantity', label: 'Volume' },
          { key: 'tradeCount', label: 'Trades' },
          { key: 'minRate', label: 'Min Rate' },
          { key: 'maxRate', label: 'Max Rate' },
          { key: 'pctChange', label: 'Change %' },
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
            <h1 className="text-2xl font-bold">Symbol Analysis</h1>
            <p className="text-sm text-muted-foreground">Turnover, volume, and price change by stock symbol</p>
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
              {selectedSymbol ? `Export ${selectedSymbol}` : 'Export CSV'}
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Symbol Deep Dive</h2>
                {selectedSymbol && (
                  <button
                    onClick={() => toggleSymbolWatchlist(selectedSymbol)}
                    className="p-1 text-muted-foreground hover:text-warning transition-colors cursor-pointer"
                    title={watchlist.symbols.includes(selectedSymbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star className={`w-4 h-4 ${watchlist.symbols.includes(selectedSymbol) ? 'text-warning fill-warning' : ''}`} />
                  </button>
                )}
              </div>
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
            <>
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

            {/* Smart Money Broker Activity */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold">Smart Money & Broker Activity for {selectedSymbol}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time institutional flow & positioning breakdown across brokerages
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                  <button
                    onClick={() => setBrokerTab('smart_flow')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      brokerTab === 'smart_flow'
                        ? 'bg-background shadow-xs text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🧠 Net Smart Money
                  </button>
                  <button
                    onClick={() => setBrokerTab('volume')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      brokerTab === 'volume'
                        ? 'bg-background shadow-xs text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📊 Top Gross Volume
                  </button>
                </div>
              </div>

              {brokerTab === 'smart_flow' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Accumulators (Net Buyers) */}
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                        <h4 className="text-sm font-semibold text-success">Top Accumulators (Net Buyers)</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">Institutional Accumulation</span>
                    </div>
                    {brokerActivity.accumulators.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">No net buyer accumulation detected</p>
                    ) : (
                      <div className="space-y-3">
                        {brokerActivity.accumulators.map((item, idx) => {
                          const maxAcc = brokerActivity.accumulators[0]?.netAmount || 1
                          const pct = Math.min(100, Math.round((item.netAmount / maxAcc) * 100))
                          const isStarred = watchlist.brokers.includes(item.broker)
                          return (
                            <div key={item.broker} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <button
                                    onClick={() => toggleBrokerWatchlist(item.broker)}
                                    className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                                    title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                  >
                                    <Star className={`w-3 h-3 ${isStarred ? 'text-warning fill-warning' : ''}`} />
                                  </button>
                                  <span className="font-mono text-muted-foreground text-[10px]">#{idx + 1}</span>
                                  <Link
                                    to={`/brokers?broker=${item.broker}`}
                                    className="font-medium hover:underline text-primary truncate max-w-[180px] sm:max-w-[240px]"
                                    title={`View ${item.label}`}
                                  >
                                    {item.label}
                                  </Link>
                                </div>
                                <div className="text-right whitespace-nowrap pl-2">
                                  <span className="font-semibold text-success">+{formatCurrency(item.netAmount)}</span>
                                  <span className="text-[10px] text-muted-foreground ml-1">
                                    (+{formatCompactNumber(item.netQty)} shares)
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-success/80 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Bought: {formatCompactNumber(item.buyAmount)}</span>
                                <span>Sold: {formatCompactNumber(item.sellAmount)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Top Distributors (Net Sellers) */}
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-destructive"></span>
                        <h4 className="text-sm font-semibold text-destructive">Top Distributors (Net Sellers)</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">Institutional Offloading</span>
                    </div>
                    {brokerActivity.distributors.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">No net seller distribution detected</p>
                    ) : (
                      <div className="space-y-3">
                        {brokerActivity.distributors.map((item, idx) => {
                          const maxDist = Math.abs(brokerActivity.distributors[0]?.netAmount || -1)
                          const pct = Math.min(100, Math.round((Math.abs(item.netAmount) / maxDist) * 100))
                          const isStarred = watchlist.brokers.includes(item.broker)
                          return (
                            <div key={item.broker} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <button
                                    onClick={() => toggleBrokerWatchlist(item.broker)}
                                    className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                                    title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                  >
                                    <Star className={`w-3 h-3 ${isStarred ? 'text-warning fill-warning' : ''}`} />
                                  </button>
                                  <span className="font-mono text-muted-foreground text-[10px]">#{idx + 1}</span>
                                  <Link
                                    to={`/brokers?broker=${item.broker}`}
                                    className="font-medium hover:underline text-primary truncate max-w-[180px] sm:max-w-[240px]"
                                    title={`View ${item.label}`}
                                  >
                                    {item.label}
                                  </Link>
                                </div>
                                <div className="text-right whitespace-nowrap pl-2">
                                  <span className="font-semibold text-destructive">
                                    {formatCurrency(item.netAmount)}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground ml-1">
                                    ({formatCompactNumber(item.netQty)} shares)
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-destructive/80 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Sold: {formatCompactNumber(item.sellAmount)}</span>
                                <span>Bought: {formatCompactNumber(item.buyAmount)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Gross Buyers */}
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">Top 5 Buyers by Amount</h4>
                      <span className="text-xs text-muted-foreground">Gross Buy Volume</span>
                    </div>
                    <div className="space-y-3">
                      {brokerActivity.topBuyers.map((item, idx) => {
                        const maxBuy = brokerActivity.topBuyers[0]?.buyAmount || 1
                        const pct = Math.min(100, Math.round((item.buyAmount / maxBuy) * 100))
                        return (
                          <div key={item.broker} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-muted-foreground text-[10px]">#{idx + 1}</span>
                                <Link
                                  to={`/brokers?broker=${item.broker}`}
                                  className="font-medium hover:underline text-primary truncate max-w-[180px] sm:max-w-[240px]"
                                >
                                  {item.label}
                                </Link>
                              </div>
                              <span className="font-semibold text-success tabular-nums pl-2">
                                {formatCurrency(item.buyAmount)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/80 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Top Gross Sellers */}
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">Top 5 Sellers by Amount</h4>
                      <span className="text-xs text-muted-foreground">Gross Sell Volume</span>
                    </div>
                    <div className="space-y-3">
                      {brokerActivity.topSellers.map((item, idx) => {
                        const maxSell = brokerActivity.topSellers[0]?.sellAmount || 1
                        const pct = Math.min(100, Math.round((item.sellAmount / maxSell) * 100))
                        return (
                          <div key={item.broker} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-muted-foreground text-[10px]">#{idx + 1}</span>
                                <Link
                                  to={`/brokers?broker=${item.broker}`}
                                  className="font-medium hover:underline text-primary truncate max-w-[180px] sm:max-w-[240px]"
                                >
                                  {item.label}
                                </Link>
                              </div>
                              <span className="font-semibold text-destructive tabular-nums pl-2">
                                {formatCurrency(item.sellAmount)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-muted-foreground/50 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
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
