import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
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
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useGetScriptAnalysis, type ScriptAnalysisResponse } from '../hooks/backend/floorsheet'
import { Button } from '../lib/shadcn/button'
import { Input } from '../lib/shadcn/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { GlassCard } from '../components/GlassCard'
import { KpiCard } from '../components/KpiCard'
import { getBrokerLabel } from '../utils/brokerNames'
import { formatCompactNumber, formatCurrency, formatDay, formatNumber } from '../utils/format'
import { exportToCsv } from '../utils/csvExport'
import { getWatchlist, subscribeWatchlist, toggleBrokerWatchlist, toggleSymbolWatchlist } from '../utils/watchlist'

const PRESET_RANGES = [
  { id: '7d', label: 'Past 7 Days' },
  { id: '15d', label: 'Past 15 Days' },
  { id: '30d', label: 'Past 30 Days' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
]

const POPULAR_SYMBOLS = ['NABIL', 'SHIVM', 'CHCL', 'GBIME', 'HDL', 'NICA', 'CIT', 'NFS', 'SCB']

const BROKER_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
]

interface BrokerHoldingRow {
  broker: string
  buyAmount: number
  sellAmount: number
  netAmount: number
  buyQty: number
  sellQty: number
  netQty: number
  totalTurnover: number
  turnoverPct: number
}

export default function ScriptAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSymbol = searchParams.get('symbol')?.trim().toUpperCase() || ''
  const urlRange = searchParams.get('range')?.trim().toLowerCase() || '15d'
  const urlStart = searchParams.get('startDate')?.trim() || ''
  const urlEnd = searchParams.get('endDate')?.trim() || ''

  const [selectedSymbol, setSelectedSymbol] = useState<string>(urlSymbol)
  const [symbolSearch, setSymbolSearch] = useState<string>(urlSymbol)
  const [selectedRange, setSelectedRange] = useState<string>(urlRange)
  const [customStartDate, setCustomStartDate] = useState<string>(urlStart)
  const [customEndDate, setCustomEndDate] = useState<string>(urlEnd)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Chart view options
  const [chartMetric, setChartMetric] = useState<'cumulative_amount' | 'cumulative_qty' | 'daily_net'>(
    'cumulative_amount'
  )
  const [visibleBrokers, setVisibleBrokers] = useState<Record<string, boolean>>({})
  const [brokerTab, setBrokerTab] = useState<'accumulators' | 'distributors' | 'all'>('accumulators')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'netAmount', desc: true }])

  const [watchlist, setWatchlist] = useState(getWatchlist)
  const { data, loading, error, trigger } = useGetScriptAnalysis()

  useEffect(() => {
    return subscribeWatchlist(setWatchlist)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Execute query whenever selectedSymbol or date range changes
  const executeSearch = (sym: string, rng: string, start?: string, end?: string) => {
    if (!sym) return
    const params: Record<string, string> = { symbol: sym, range: rng }
    if (rng === 'custom' && start && end) {
      params.startDate = start
      params.endDate = end
    }
    setSearchParams(params)
    trigger(params)
  }

  // Initial load
  useEffect(() => {
    if (urlSymbol) {
      executeSearch(urlSymbol, urlRange, urlStart, urlEnd)
    } else {
      trigger() // Load symbol list
    }
  }, [urlSymbol, urlRange])

  // Top 10 Brokers by gross turnover (used for the line diagram)
  const top10Brokers = useMemo(() => {
    return (data?.topBrokers || []).slice(0, 10)
  }, [data])

  // Initialize visible brokers map when top10 brokers load
  useEffect(() => {
    if (top10Brokers.length > 0) {
      const initial: Record<string, boolean> = {}
      top10Brokers.forEach((b, idx) => {
        // Default first 6 brokers visible to keep the line diagram crisp
        initial[b.broker] = idx < 6
      })
      setVisibleBrokers(initial)
    }
  }, [top10Brokers])

  // Filtered symbols for autocomplete dropdown
  const symbolSuggestions = useMemo(() => {
    const all = data?.allSymbols || POPULAR_SYMBOLS
    if (!symbolSearch) return all.slice(0, 15)
    const q = symbolSearch.trim().toUpperCase()
    return all.filter((s) => s.toUpperCase().includes(q)).slice(0, 20)
  }, [data?.allSymbols, symbolSearch])

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym)
    setSymbolSearch(sym)
    setShowDropdown(false)
    executeSearch(sym, selectedRange, customStartDate, customEndDate)
  }

  const handleRangeChange = (rng: string) => {
    setSelectedRange(rng)
    if (rng !== 'custom') {
      executeSearch(selectedSymbol, rng)
    }
  }

  const handleApplyCustomDate = () => {
    if (customStartDate && customEndDate) {
      executeSearch(selectedSymbol, 'custom', customStartDate, customEndDate)
    }
  }

  // Broker Table display list
  const displayedBrokers = useMemo(() => {
    const all = (data?.topBrokers as BrokerHoldingRow[]) || []
    if (brokerTab === 'accumulators') {
      return all.filter((b) => b.netAmount > 0).slice(0, 10)
    }
    if (brokerTab === 'distributors') {
      return all.filter((b) => b.netAmount < 0).slice(0, 10)
    }
    return all.slice(0, 10)
  }, [data?.topBrokers, brokerTab])

  // Table Columns
  const brokerColumns = useMemo<ColumnDef<BrokerHoldingRow>[]>(
    () => [
      {
        id: 'rank',
        header: '#',
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.index + 1}</span>,
      },
      {
        accessorKey: 'broker',
        header: 'Broker',
        cell: ({ getValue }) => {
          const b = getValue<string>()
          const isStarred = watchlist.brokers.includes(b)
          const label = getBrokerLabel(b)
          return (
            <div className="flex items-center gap-1.5 min-w-[200px]">
              <button
                onClick={() => toggleBrokerWatchlist(b)}
                className="text-muted-foreground hover:text-warning transition-colors p-0.5 cursor-pointer"
                title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-warning fill-warning' : ''}`} />
              </button>
              <Link
                to={`/brokers?broker=${b}`}
                className="font-medium text-primary hover:underline truncate"
                title={label}
              >
                {label}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'buyAmount',
        header: 'Buy Amount',
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-medium tabular-nums text-success">{formatCurrency(row.original.buyAmount)}</div>
            <div className="text-[11px] text-muted-foreground">{formatNumber(row.original.buyQty)} shares</div>
          </div>
        ),
      },
      {
        accessorKey: 'sellAmount',
        header: 'Sell Amount',
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-medium tabular-nums text-destructive">{formatCurrency(row.original.sellAmount)}</div>
            <div className="text-[11px] text-muted-foreground">{formatNumber(row.original.sellQty)} shares</div>
          </div>
        ),
      },
      {
        accessorKey: 'netAmount',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground font-semibold cursor-pointer ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Net Holding
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        ),
        cell: ({ row }) => {
          const isPositive = row.original.netAmount >= 0
          return (
            <div className="text-right">
              <span
                className={`inline-block font-semibold tabular-nums px-2 py-0.5 rounded text-xs ${
                  isPositive
                    ? 'bg-success/15 text-success border border-success/30'
                    : 'bg-destructive/15 text-destructive border border-destructive/30'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(row.original.netAmount)}
              </span>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isPositive ? '+' : ''}
                {formatNumber(row.original.netQty)} shares
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'totalTurnover',
        header: 'Turnover Share',
        cell: ({ row }) => (
          <div className="min-w-[130px] space-y-1">
            <div className="flex justify-between text-xs tabular-nums">
              <span>{formatCompactNumber(row.original.totalTurnover)}</span>
              <span className="text-muted-foreground font-mono">{row.original.turnoverPct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/80 rounded-full"
                style={{ width: `${Math.min(100, row.original.turnoverPct * 3)}%` }}
              />
            </div>
          </div>
        ),
      },
    ],
    [watchlist]
  )

  const brokerTable = useReactTable({
    data: displayedBrokers,
    columns: brokerColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Export handlers
  const handleExportBrokers = () => {
    if (!data?.topBrokers) return
    const exportRows = data.topBrokers.map((b) => ({
      Broker: b.broker,
      Label: getBrokerLabel(b.broker),
      BuyAmount: b.buyAmount,
      BuyQuantity: b.buyQty,
      SellAmount: b.sellAmount,
      SellQuantity: b.sellQty,
      NetAmount: b.netAmount,
      NetQuantity: b.netQty,
      Turnover: b.totalTurnover,
    }))
    exportToCsv(exportRows, `${selectedSymbol}-broker-holdings.csv`)
  }

  const handleExportTimeline = () => {
    if (!data?.dailySeriesCumulative) return
    exportToCsv(data.dailySeriesCumulative, `${selectedSymbol}-daily-holdings-timeline.csv`)
  }

  // Top Accumulator / Distributor for KPIs
  const topAccumulator = useMemo(() => {
    const sorted = [...(data?.topBrokers || [])].sort((a, b) => b.netAmount - a.netAmount)
    return sorted[0]?.netAmount > 0 ? sorted[0] : null
  }, [data?.topBrokers])

  const topDistributor = useMemo(() => {
    const sorted = [...(data?.topBrokers || [])].sort((a, b) => a.netAmount - b.netAmount)
    return sorted[0]?.netAmount < 0 ? sorted[0] : null
  }, [data?.topBrokers])

  return (
    <div className="text-foreground p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Script Analysis</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze institutional broker accumulation, distribution, and net holding trajectories day-by-day for any script
          </p>
        </div>
        {selectedSymbol && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeSearch(selectedSymbol, selectedRange, customStartDate, customEndDate)}
              disabled={loading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportBrokers} className="gap-2 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Script & Date Range Control Panel */}
      <GlassCard>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between flex-wrap">
            {/* Symbol Autocomplete Picker */}
            <div className="relative w-full md:w-80" ref={dropdownRef}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Select Script / Symbol
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={symbolSearch}
                  onChange={(e) => {
                    setSymbolSearch(e.target.value.toUpperCase())
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search ticker (e.g. NABIL, SHIVM)..."
                  className="pl-9 pr-8 font-semibold uppercase bg-background/60 tracking-wide"
                />
                {symbolSearch && (
                  <button
                    onClick={() => {
                      setSymbolSearch('')
                      setShowDropdown(true)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-lg border border-border/80 bg-card shadow-2xl max-h-64 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2.5 py-1 font-semibold">
                    Symbols ({symbolSuggestions.length})
                  </div>
                  {symbolSuggestions.map((sym) => {
                    const isStarred = watchlist.symbols.includes(sym)
                    return (
                      <button
                        key={sym}
                        onClick={() => handleSelectSymbol(sym)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center justify-between hover:bg-accent transition-colors cursor-pointer ${
                          selectedSymbol === sym ? 'bg-primary/15 font-bold text-primary' : 'text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sym}</span>
                          {isStarred && <Star className="w-3 h-3 text-warning fill-warning" />}
                        </div>
                        {selectedSymbol === sym && (
                          <span className="text-[10px] text-primary font-medium">Selected</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <label className="text-xs font-medium text-muted-foreground">Date Window</label>
              <div className="flex items-center gap-1.5 flex-wrap bg-muted/50 p-1 rounded-lg border border-border/40">
                {PRESET_RANGES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRangeChange(r.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      selectedRange === r.id
                        ? 'bg-background shadow-xs text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Date Range Picker inputs (visible only when custom range is active) */}
          {selectedRange === 'custom' && (
            <div className="flex items-center gap-3 pt-3 border-t border-border/40 flex-wrap animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From:</span>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-36 h-8 text-xs bg-background/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To:</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-36 h-8 text-xs bg-background/60"
                />
              </div>
              <Button size="sm" onClick={handleApplyCustomDate} className="h-8 text-xs cursor-pointer">
                Apply Date Filter
              </Button>
            </div>
          )}

          {/* Quick-select Popular Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-2">
            <span className="text-muted-foreground text-[11px] mr-1">Quick Picks:</span>
            {POPULAR_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => handleSelectSymbol(sym)}
                className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all cursor-pointer ${
                  selectedSymbol === sym
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Initial Empty Prompt State */}
      {!selectedSymbol ? (
        <div className="p-12 rounded-xl border border-dashed border-border/80 bg-card/40 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold">Select a script to view institutional holdings</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Choose any NEPSE ticker and a date range above to visualize which top 10 brokerages are accumulating or
            distributing shares, along with daywise holding trajectories.
          </p>
        </div>
      ) : loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm">Calculating broker holdings and daywise series for {selectedSymbol}...</p>
        </div>
      ) : (
        <>
          {/* Script Overview KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total Script Turnover"
              value={formatCompactNumber(data?.kpis?.totalAmount || 0)}
              subtext={`${data?.dateRange?.startDate} to ${data?.dateRange?.endDate}`}
              icon={<Wallet className="w-5 h-5 text-primary" />}
            />
            <KpiCard
              label="Shares Traded"
              value={formatCompactNumber(data?.kpis?.totalQuantity || 0)}
              subtext={`${formatNumber(data?.kpis?.tradeCount || 0)} trades @ Rs. ${Number(data?.kpis?.avgRate || 0).toFixed(1)} avg`}
              icon={<Layers className="w-5 h-5 text-cyan-400" />}
            />
            <KpiCard
              label="Top Accumulator (Net Buyer)"
              value={topAccumulator ? `Broker #${topAccumulator.broker}` : 'None'}
              subtext={
                topAccumulator
                  ? `+${formatCompactNumber(topAccumulator.netAmount)} (+${formatCompactNumber(topAccumulator.netQty)} shares)`
                  : 'No net accumulation'
              }
              icon={<TrendingUp className="w-5 h-5 text-success" />}
            />
            <KpiCard
              label="Top Distributor (Net Seller)"
              value={topDistributor ? `Broker #${topDistributor.broker}` : 'None'}
              subtext={
                topDistributor
                  ? `${formatCompactNumber(topDistributor.netAmount)} (${formatCompactNumber(topDistributor.netQty)} shares)`
                  : 'No net distribution'
              }
              icon={<TrendingDown className="w-5 h-5 text-destructive" />}
            />
          </div>

          {/* Section 1: Daywise Line Diagram */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Daywise Broker Net Holding Trajectory: {selectedSymbol}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visualizes institutional position building or unloading day-by-day across top brokerages
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Metric Selector Toggle */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                  <button
                    onClick={() => setChartMetric('cumulative_amount')}
                    className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                      chartMetric === 'cumulative_amount'
                        ? 'bg-background shadow-xs text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Cumulative NPR (Net)
                  </button>
                  <button
                    onClick={() => setChartMetric('cumulative_qty')}
                    className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                      chartMetric === 'cumulative_qty'
                        ? 'bg-background shadow-xs text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Cumulative Shares
                  </button>
                  <button
                    onClick={() => setChartMetric('daily_net')}
                    className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                      chartMetric === 'daily_net'
                        ? 'bg-background shadow-xs text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Daily Net NPR
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportTimeline} className="gap-1.5 h-8 text-xs cursor-pointer">
                  <Download className="w-3 h-3" />
                  Export Timeline
                </Button>
              </div>
            </div>

            {/* Broker Line Visibility Filters */}
            <div className="flex items-center gap-2 flex-wrap mb-4 pb-3 border-b border-border/40">
              <span className="text-xs text-muted-foreground mr-1">Toggle Brokers:</span>
              {top10Brokers.map((b, idx) => {
                const isVisible = visibleBrokers[b.broker] ?? false
                const color = BROKER_COLORS[idx % BROKER_COLORS.length]
                return (
                  <button
                    key={b.broker}
                    onClick={() =>
                      setVisibleBrokers((prev) => ({
                        ...prev,
                        [b.broker]: !prev[b.broker],
                      }))
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isVisible
                        ? 'bg-background shadow-xs text-foreground'
                        : 'opacity-40 bg-muted/20 text-muted-foreground border-transparent'
                    }`}
                    style={{
                      borderColor: isVisible ? color : undefined,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>Broker #{b.broker}</span>
                  </button>
                )
              })}
            </div>

            {/* Multi-Line Chart */}
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.dailySeriesCumulative || []} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatDay}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tickFormatter={formatCompactNumber}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    labelFormatter={(val) => `Date: ${formatDay(String(val))}`}
                    formatter={(val, name) => {
                      const brokerId = String(name).replace(/^(cum_net_|cum_qty_|daily_net_)/, '')
                      const label = getBrokerLabel(brokerId)
                      const isQty = chartMetric === 'cumulative_qty'
                      const formatted = isQty
                        ? `${formatNumber(Number(val))} shares`
                        : formatCurrency(Number(val))
                      return [formatted, label]
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  {top10Brokers.map((b, idx) => {
                    const isVisible = visibleBrokers[b.broker] ?? false
                    if (!isVisible) return null
                    const color = BROKER_COLORS[idx % BROKER_COLORS.length]
                    const dataKey =
                      chartMetric === 'cumulative_amount'
                        ? `cum_net_${b.broker}`
                        : chartMetric === 'cumulative_qty'
                        ? `cum_qty_${b.broker}`
                        : `daily_net_${b.broker}`

                    return (
                      <Line
                        key={b.broker}
                        type="monotone"
                        dataKey={dataKey}
                        name={dataKey}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Section 2: Top 10 Broker Summary Table */}
          <div className="rounded-xl border border-border/60 bg-card shadow-retool-sm overflow-hidden">
            <div className="p-6 pb-4 flex items-center justify-between flex-wrap gap-3 border-b border-border/60">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Top 10 Broker Net Holdings: {selectedSymbol}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed buying, selling, and net positions in {selectedSymbol} for {selectedRange === 'all' ? 'All Time' : selectedRange}
                </p>
              </div>

              {/* Table Tab Filter */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40 text-xs">
                <button
                  onClick={() => setBrokerTab('accumulators')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    brokerTab === 'accumulators'
                      ? 'bg-background shadow-xs text-success font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top 10 Accumulators (Net Buyers)
                </button>
                <button
                  onClick={() => setBrokerTab('distributors')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    brokerTab === 'distributors'
                      ? 'bg-background shadow-xs text-destructive font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  Top 10 Distributors (Net Sellers)
                </button>
                <button
                  onClick={() => setBrokerTab('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    brokerTab === 'all'
                      ? 'bg-background shadow-xs text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Top 10 by Gross Turnover
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {brokerTable.getHeaderGroups().map((headerGroup) => (
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
                  {brokerTable.getRowModel().rows?.length ? (
                    brokerTable.getRowModel().rows.map((row) => (
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
                      <TableCell colSpan={brokerColumns.length} className="h-24 text-center text-muted-foreground text-sm">
                        No broker trading records found for this criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
