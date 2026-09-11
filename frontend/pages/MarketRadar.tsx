import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import {
  ArrowUpDown,
  Building2,
  Download,
  Flame,
  Layers,
  RefreshCw,
  Repeat,
  Search,
  Star,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react'
import { useGetMarketRadar } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Input } from '../lib/shadcn/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { getBrokerLabel } from '../utils/brokerNames'
import { CHART_PRIMARY, CHART_SUCCESS, CHART_DESTRUCTIVE } from '../utils/chartColors'
import { formatCompactNumber, formatCurrency, formatNumber, formatTradeTime } from '../utils/format'
import { exportToCsv } from '../utils/csvExport'
import { getWatchlist, subscribeWatchlist, toggleBrokerWatchlist, toggleSymbolWatchlist } from '../utils/watchlist'

interface WhaleTradeRow {
  contract_id: string
  symbol: string
  buyer_broker: string
  seller_broker: string
  quantity: string
  rate: string
  amount: string
  trade_time: string
}

interface CrossingTradeRow {
  contract_id: string
  symbol: string
  buyer_broker: string
  seller_broker: string
  quantity: string
  rate: string
  amount: string
  trade_time: string
}

interface TopWhaleSymbolRow {
  symbol: string
  whale_trades: string
  whale_amount: string
  whale_qty: string
  max_trade: string
}

interface TopCrossingBrokerRow {
  broker: string
  cross_count: string
  cross_amount: string
  cross_qty: string
}

export default function MarketRadar() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetMarketRadar()
  const [activeTab, setActiveTab] = useState<'whales' | 'crossings' | 'concentration'>('whales')
  const [whaleThreshold, setWhaleThreshold] = useState<number>(500000)
  const [searchQuery, setSearchQuery] = useState('')
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const [watchlist, setWatchlist] = useState(getWatchlist)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'amount', desc: true }])

  useEffect(() => {
    return subscribeWatchlist(setWatchlist)
  }, [])

  useEffect(() => {
    trigger()
  }, [])

  // 1. Processed Whale Trades
  const filteredWhales = useMemo(() => {
    if (!data?.whales) return []
    const q = searchQuery.trim().toUpperCase()
    return (data.whales as WhaleTradeRow[]).filter((t) => {
      const amt = Number(t.amount) || 0
      if (amt < whaleThreshold) return false
      if (watchlistOnly) {
        const matchesSym = watchlist.symbols.includes(t.symbol.toUpperCase())
        const matchesBroker = watchlist.brokers.includes(t.buyer_broker) || watchlist.brokers.includes(t.seller_broker)
        if (!matchesSym && !matchesBroker) return false
      }
      if (!q) return true
      return (
        t.symbol.toUpperCase().includes(q) ||
        t.buyer_broker.includes(q) ||
        t.seller_broker.includes(q) ||
        t.contract_id.includes(q)
      )
    })
  }, [data, whaleThreshold, searchQuery, watchlistOnly, watchlist])

  // 2. Processed Internal Crossings
  const filteredCrossings = useMemo(() => {
    if (!data?.crossings) return []
    const q = searchQuery.trim().toUpperCase()
    return (data.crossings as CrossingTradeRow[]).filter((t) => {
      if (watchlistOnly) {
        const matchesSym = watchlist.symbols.includes(t.symbol.toUpperCase())
        const matchesBroker = watchlist.brokers.includes(t.buyer_broker)
        if (!matchesSym && !matchesBroker) return false
      }
      if (!q) return true
      return (
        t.symbol.toUpperCase().includes(q) ||
        t.buyer_broker.includes(q) ||
        t.contract_id.includes(q)
      )
    })
  }, [data, searchQuery, watchlistOnly, watchlist])

  // 3. Concentration data
  const topWhaleSymbols = useMemo(() => {
    if (!data?.topWhaleSymbols) return []
    return (data.topWhaleSymbols as TopWhaleSymbolRow[]).map((r) => ({
      symbol: r.symbol,
      whaleAmount: Number(r.whale_amount),
      whaleTrades: Number(r.whale_trades),
      maxTrade: Number(r.max_trade),
    }))
  }, [data])

  const topCrossingBrokers = useMemo(() => {
    if (!data?.topCrossingBrokers) return []
    return (data.topCrossingBrokers as TopCrossingBrokerRow[]).map((r) => ({
      broker: r.broker,
      label: getBrokerLabel(r.broker),
      crossAmount: Number(r.cross_amount),
      crossCount: Number(r.cross_count),
    }))
  }, [data])

  // Table Columns for Whales
  const whaleColumns = useMemo<ColumnDef<WhaleTradeRow>[]>(
    () => [
      {
        accessorKey: 'trade_time',
        header: 'Time',
        cell: ({ getValue }) => (
          <span className="tabular-nums text-xs text-muted-foreground">{formatTradeTime(getValue<string>())}</span>
        ),
      },
      {
        accessorKey: 'contract_id',
        header: 'Contract ID',
        cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => {
          const sym = getValue<string>()
          const isStarred = watchlist.symbols.includes(sym)
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleSymbolWatchlist(sym)}
                className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-warning fill-warning' : ''}`} />
              </button>
              <Link to={`/symbols?symbol=${sym}`} className="font-bold text-primary hover:underline">
                {sym}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'buyer_broker',
        header: 'Buyer',
        cell: ({ getValue }) => {
          const b = getValue<string>()
          const isStarred = watchlist.brokers.includes(b)
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleBrokerWatchlist(b)}
                className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-3 h-3 ${isStarred ? 'text-warning fill-warning' : ''}`} />
              </button>
              <Link to={`/brokers?broker=${b}`} className="font-medium hover:underline text-success text-xs">
                #{b}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'seller_broker',
        header: 'Seller',
        cell: ({ getValue }) => {
          const b = getValue<string>()
          const isStarred = watchlist.brokers.includes(b)
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleBrokerWatchlist(b)}
                className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-3 h-3 ${isStarred ? 'text-warning fill-warning' : ''}`} />
              </button>
              <Link to={`/brokers?broker=${b}`} className="font-medium hover:underline text-destructive text-xs">
                #{b}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-mono text-xs">{formatNumber(Number(getValue<string>()))}</span>
        ),
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-mono text-xs">Rs. {formatNumber(Number(getValue<string>()))}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground font-semibold cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Turnover (NPR)
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ getValue }) => {
          const val = Number(getValue<string>())
          return (
            <span className={`tabular-nums font-bold text-sm ${val >= 1000000 ? 'text-warning font-mono' : 'text-foreground'}`}>
              {formatCurrency(val)}
            </span>
          )
        },
      },
    ],
    [watchlist]
  )

  const whaleTable = useReactTable({
    data: filteredWhales,
    columns: whaleColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Table Columns for Crossings
  const crossingColumns = useMemo<ColumnDef<CrossingTradeRow>[]>(
    () => [
      {
        accessorKey: 'trade_time',
        header: 'Time',
        cell: ({ getValue }) => (
          <span className="tabular-nums text-xs text-muted-foreground">{formatTradeTime(getValue<string>())}</span>
        ),
      },
      {
        accessorKey: 'contract_id',
        header: 'Contract ID',
        cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => {
          const sym = getValue<string>()
          return (
            <Link to={`/symbols?symbol=${sym}`} className="font-bold text-primary hover:underline">
              {sym}
            </Link>
          )
        },
      },
      {
        accessorKey: 'buyer_broker',
        header: 'Matched Broker (Buyer = Seller)',
        cell: ({ getValue }) => {
          const b = getValue<string>()
          return (
            <Link to={`/brokers?broker=${b}`} className="font-medium hover:underline text-primary text-xs">
              {getBrokerLabel(b)}
            </Link>
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-mono text-xs">{formatNumber(Number(getValue<string>()))}</span>
        ),
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-mono text-xs">Rs. {formatNumber(Number(getValue<string>()))}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Turnover',
        cell: ({ getValue }) => (
          <span className="tabular-nums font-semibold text-sm text-foreground">
            {formatCurrency(Number(getValue<string>()))}
          </span>
        ),
      },
    ],
    []
  )

  const crossingTable = useReactTable({
    data: filteredCrossings,
    columns: crossingColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const stats = data?.stats || {
    whale_count_1m: '0',
    whale_volume_1m: '0',
    cross_count: '0',
    cross_volume: '0',
    max_single_trade: '0',
  }

  const handleExportWhales = () => {
    const formatted = filteredWhales.map((w) => ({
      Contract: w.contract_id,
      Time: w.trade_time,
      Symbol: w.symbol,
      BuyerBroker: w.buyer_broker,
      SellerBroker: w.seller_broker,
      Quantity: w.quantity,
      Rate: w.rate,
      Amount: w.amount,
    }))
    exportToCsv(formatted, 'nepse-whale-trades.csv')
  }

  return (
    <div className="text-foreground p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-warning/15 text-warning border border-warning/30">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Market Radar & Whale Tracker</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time anomaly scanner for mega institutional block deals, internal broker crossings, and smart money clusters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => trigger(undefined, { skipCache: true })}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWhales} className="gap-2 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          Error: {error}
        </div>
      ) : null}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Mega Block Deals (> 10L)"
          value={formatCompactNumber(Number(stats.whale_volume_1m))}
          subtext={`${formatNumber(Number(stats.whale_count_1m))} trades ≥ Rs. 1,000,000`}
          icon={<Waves className="w-5 h-5 text-warning" />}
        />
        <KpiCard
          label="Internal Crossings"
          value={formatCompactNumber(Number(stats.cross_volume))}
          subtext={`${formatNumber(Number(stats.cross_count))} in-house matched trades`}
          icon={<Repeat className="w-5 h-5 text-primary" />}
        />
        <KpiCard
          label="Largest Single Deal"
          value={formatCompactNumber(Number(stats.max_single_trade))}
          subtext="Highest single trade value recorded"
          icon={<Zap className="w-5 h-5 text-success" />}
        />
        <KpiCard
          label="Top Whale Ticker"
          value={topWhaleSymbols[0]?.symbol || '—'}
          subtext={
            topWhaleSymbols[0]
              ? `${formatCompactNumber(topWhaleSymbols[0].whaleAmount)} block turnover`
              : 'Institutional target'
          }
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Radar Main Workspace */}
      <GlassCard>
        {/* Navigation Tabs & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
            <button
              onClick={() => setActiveTab('whales')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'whales'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-warning" />
              Whale Deals Tracker ({filteredWhales.length})
            </button>
            <button
              onClick={() => setActiveTab('crossings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'crossings'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-primary" />
              Internal Crossings ({filteredCrossings.length})
            </button>
            <button
              onClick={() => setActiveTab('concentration')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'concentration'
                  ? 'bg-background shadow-xs text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-success" />
              Whale Concentration
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'whales' && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground mr-1">Threshold:</span>
                {[
                  { label: '≥ 5 Lakhs', val: 500000 },
                  { label: '≥ 10 Lakhs', val: 1000000 },
                  { label: '≥ 25 Lakhs', val: 2500000 },
                  { label: '≥ 50 Lakhs', val: 5000000 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setWhaleThreshold(item.val)}
                    className={`px-2 py-1 rounded border text-[11px] font-medium transition-all cursor-pointer ${
                      whaleThreshold === item.val
                        ? 'bg-warning text-warning-foreground border-warning font-semibold'
                        : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <Button
              variant={watchlistOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWatchlistOnly((prev) => !prev)}
              className={`gap-1.5 h-8 text-xs cursor-pointer ${
                watchlistOnly ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''
              }`}
              title="Show only starred symbols and brokers"
            >
              <Star className={`w-3.5 h-3.5 ${watchlistOnly ? 'fill-current' : 'text-warning fill-warning'}`} />
              Watchlist Only
            </Button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symbol, broker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs w-44 bg-background/60"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Whale Deals Tracker */}
        {activeTab === 'whales' && (
          <div className="mt-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  {whaleTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {whaleTable.getRowModel().rows?.length ? (
                    whaleTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={whaleColumns.length} className="h-24 text-center text-muted-foreground text-sm">
                        No whale transactions found matching current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 2: Internal Broker Crossings */}
        {activeTab === 'crossings' && (
          <div className="mt-4">
            <div className="p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Internal Crossings:</strong> Trades where the buyer and seller brokerage are identical (Buyer Broker = Seller Broker). 
                These indicate matched orders between clients of the same brokerage firm or in-house transfers.
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  {crossingTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {crossingTable.getRowModel().rows?.length ? (
                    crossingTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={crossingColumns.length} className="h-24 text-center text-muted-foreground text-sm">
                        No internal crossings found matching filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 3: Whale Concentration Leaderboards */}
        {activeTab === 'concentration' && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Symbols for Whale Deals */}
            <div className="p-4 rounded-xl border border-border/60 bg-background/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold">Top Whale Magnet Stocks</h3>
                  <p className="text-xs text-muted-foreground">Tickers with the highest aggregate block deal turnover</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topWhaleSymbols}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="symbol" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), 'Whale Volume']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="whaleAmount" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {topWhaleSymbols.slice(0, 5).map((s, idx) => (
                  <div key={s.symbol} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">#{idx + 1}</span>
                      <Link to={`/symbols?symbol=${s.symbol}`} className="font-bold text-primary hover:underline">
                        {s.symbol}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">({s.whaleTrades} block deals)</span>
                    </div>
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(s.whaleAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Internal Crossing Brokerages */}
            <div className="p-4 rounded-xl border border-border/60 bg-background/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold">Top Internal Crossing Brokerages</h3>
                  <p className="text-xs text-muted-foreground">Brokerages with the highest in-house client matching</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCrossingBrokers}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="broker" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), 'Matched Volume']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Bar dataKey="crossAmount" fill={CHART_SUCCESS} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {topCrossingBrokers.slice(0, 5).map((b, idx) => (
                  <div key={b.broker} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-muted-foreground">#{idx + 1}</span>
                      <Link to={`/brokers?broker=${b.broker}`} className="font-semibold text-primary hover:underline truncate">
                        {b.label}
                      </Link>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">({b.crossCount} crossings)</span>
                    </div>
                    <span className="font-semibold tabular-nums text-foreground whitespace-nowrap pl-2">
                      {formatCurrency(b.crossAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
