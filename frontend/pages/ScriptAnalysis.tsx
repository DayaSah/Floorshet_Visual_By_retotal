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
  ShieldCheck,
  Sparkles,
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

export function getBrokerColor(broker: string | number): string {
  const id = Number(broker)
  if (!id || isNaN(id)) return '#3b82f6'
  // Use golden angle distribution (137.508 deg) to assign vibrant, distinct colors across all 96 brokers
  const hue = (id * 137.508) % 360
  return `hsl(${Math.round(hue)}, 78%, 52%)`
}

interface BrokerHoldingRow {
  broker: string
  buyAmount: number
  sellAmount: number
  netAmount: number
  buyQty: number
  sellQty: number
  netQty: number
  avgBuyRate?: number
  avgSellRate?: number
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
  const [showPriceOverlay, setShowPriceOverlay] = useState<boolean>(true)
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

  type TrajectoryPreset = 'top5_acc' | 'top5_dist' | 'top5_both' | 'all' | 'custom'
  const [activePreset, setActivePreset] = useState<TrajectoryPreset>('top5_both')
  const [brokerChipFilter, setBrokerChipFilter] = useState<string>('')

  // Top 5 Net Accumulators (Buyers: netAmount > 0)
  const top5Accumulators = useMemo(() => {
    return [...(data?.topBrokers || [])]
      .filter((b) => b.netAmount > 0)
      .sort((a, b) => b.netAmount - a.netAmount)
      .slice(0, 5)
  }, [data?.topBrokers])

  // Top 5 Net Distributors (Sellers: netAmount < 0, largest negative first)
  const top5Distributors = useMemo(() => {
    return [...(data?.topBrokers || [])]
      .filter((b) => b.netAmount < 0)
      .sort((a, b) => a.netAmount - b.netAmount)
      .slice(0, 5)
  }, [data?.topBrokers])

  // Top 5 Accumulators + Top 5 Distributors (up to 10 unique brokers)
  const top5Both = useMemo(() => {
    const accBrokers = new Set(top5Accumulators.map((b) => b.broker))
    const combined = [...top5Accumulators]
    for (const d of top5Distributors) {
      if (!accBrokers.has(d.broker)) {
        combined.push(d)
      }
    }
    return combined
  }, [top5Accumulators, top5Distributors])

  const applyPreset = (preset: TrajectoryPreset) => {
    setActivePreset(preset)
    const all = (data?.topBrokers || []) as BrokerHoldingRow[]
    const next: Record<string, boolean> = {}

    if (preset === 'top5_acc') {
      top5Accumulators.forEach((b) => {
        next[b.broker] = true
      })
    } else if (preset === 'top5_dist') {
      top5Distributors.forEach((b) => {
        next[b.broker] = true
      })
    } else if (preset === 'top5_both') {
      top5Both.forEach((b) => {
        next[b.broker] = true
      })
    } else if (preset === 'all') {
      all.forEach((b) => {
        next[b.broker] = true
      })
    }
    setVisibleBrokers(next)
  }

  // Initialize visible brokers map when brokers load
  useEffect(() => {
    if (data?.topBrokers && data.topBrokers.length > 0) {
      const presetToApply = activePreset === 'custom' ? 'top5_both' : activePreset
      setActivePreset(presetToApply)
      const all = data.topBrokers
      const next: Record<string, boolean> = {}

      if (presetToApply === 'top5_acc') {
        top5Accumulators.forEach((b) => {
          next[b.broker] = true
        })
      } else if (presetToApply === 'top5_dist') {
        top5Distributors.forEach((b) => {
          next[b.broker] = true
        })
      } else if (presetToApply === 'all') {
        all.forEach((b) => {
          next[b.broker] = true
        })
      } else {
        top5Both.forEach((b) => {
          next[b.broker] = true
        })
      }
      setVisibleBrokers(next)
    }
  }, [data?.topBrokers, top5Accumulators, top5Distributors, top5Both])

  const toggleBroker = (brokerId: string) => {
    setActivePreset('custom')
    setVisibleBrokers((prev) => ({
      ...prev,
      [brokerId]: !prev[brokerId],
    }))
  }

  const visibleBrokersCount = useMemo(() => {
    return Object.values(visibleBrokers).filter(Boolean).length
  }, [visibleBrokers])

  const filteredBrokerChips = useMemo(() => {
    const list = (data?.topBrokers || []) as BrokerHoldingRow[]
    if (!brokerChipFilter.trim()) return list
    const q = brokerChipFilter.trim().toLowerCase()
    return list.filter((b) => {
      const brokerNum = String(b.broker).toLowerCase()
      const label = getBrokerLabel(b.broker).toLowerCase()
      return brokerNum.includes(q) || label.includes(q)
    })
  }, [data?.topBrokers, brokerChipFilter])

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
            {row.original.avgBuyRate ? (
              <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                Avg: Rs. {row.original.avgBuyRate.toFixed(1)}
              </div>
            ) : null}
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
            {row.original.avgSellRate ? (
              <div className="text-[10px] text-rose-400/90 font-mono mt-0.5">
                Avg: Rs. {row.original.avgSellRate.toFixed(1)}
              </div>
            ) : null}
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
        id: 'estCostStatus',
        header: 'Est. Cost & Status',
        cell: ({ row }) => {
          const latestPrice = Number(data?.kpis?.latestPrice) || 0
          const netQty = row.original.netQty
          const avgBuy = row.original.avgBuyRate || 0
          const avgSell = row.original.avgSellRate || 0

          if (netQty > 0 && avgBuy > 0) {
            const pnlDiff = latestPrice > 0 ? latestPrice - avgBuy : 0
            const pnlPct = latestPrice > 0 ? (pnlDiff / avgBuy) * 100 : 0
            const isProfit = pnlDiff >= 0

            return (
              <div className="text-right min-w-[130px]">
                <div className="text-xs font-mono font-medium">
                  Holding @ <span className="text-foreground">Rs. {avgBuy.toFixed(1)}</span>
                </div>
                {latestPrice > 0 ? (
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isProfit
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {pnlPct.toFixed(1)}% {isProfit ? 'Profit' : 'Underwater'}
                    </span>
                  </div>
                ) : null}
              </div>
            )
          }

          if (netQty < 0 && avgSell > 0) {
            return (
              <div className="text-right min-w-[130px]">
                <div className="text-xs font-mono font-medium text-muted-foreground">
                  Liquidated @ <span className="text-foreground">Rs. {avgSell.toFixed(1)}</span>
                </div>
                {latestPrice > 0 ? (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {latestPrice < avgSell ? (
                      <span className="text-emerald-400/90">Good Exit (LTP lower)</span>
                    ) : (
                      <span className="text-amber-400/90">Sold below LTP</span>
                    )}
                  </div>
                ) : null}
              </div>
            )
          }

          return (
            <div className="text-right text-xs text-muted-foreground font-mono">
              Churned (0 net)
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
      AvgBuyRate: b.avgBuyRate ?? '',
      SellAmount: b.sellAmount,
      SellQuantity: b.sellQty,
      AvgSellRate: b.avgSellRate ?? '',
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

  // Smart Money Accumulation Index & Verdict Calculation
  const smartMoneyAnalysis = useMemo(() => {
    if (!data?.topBrokers || data.topBrokers.length === 0 || !data?.kpis?.totalAmount) {
      return null
    }

    const totalBuyVolume = data.topBrokers.reduce((acc, b) => acc + b.buyAmount, 0) || 1
    const totalSellVolume = data.topBrokers.reduce((acc, b) => acc + b.sellAmount, 0) || 1

    const buyers = [...data.topBrokers].filter((b) => b.netAmount > 0).sort((a, b) => b.netAmount - a.netAmount)
    const sellers = [...data.topBrokers].filter((b) => b.netAmount < 0).sort((a, b) => a.netAmount - b.netAmount)

    const top5Buyers = buyers.slice(0, 5)
    const top5Sellers = sellers.slice(0, 5)

    const top5BuyAmount = top5Buyers.reduce((acc, b) => acc + b.buyAmount, 0)
    const top5SellAmount = top5Sellers.reduce((acc, b) => acc + b.sellAmount, 0)
    const top5NetAmount = top5Buyers.reduce((acc, b) => acc + b.netAmount, 0)
    const top5NetSelling = Math.abs(top5Sellers.reduce((acc, b) => acc + b.netAmount, 0))

    const buyerConcentration = Math.min(100, (top5BuyAmount / totalBuyVolume) * 100)
    const sellerConcentration = Math.min(100, (top5SellAmount / totalSellVolume) * 100)

    // Component 1: Concentration Delta (0 to 40 pts)
    const concentrationDelta = buyerConcentration - sellerConcentration
    const concentrationPts = Math.min(40, Math.max(0, 20 + concentrationDelta * 0.8))

    // Component 2: Net Absorption Balance (0 to 35 pts)
    let absorptionPts = 17.5
    if (top5NetAmount + top5NetSelling > 0) {
      const netRatio = (top5NetAmount - top5NetSelling) / (top5NetAmount + top5NetSelling)
      absorptionPts = Math.min(35, Math.max(0, 17.5 + netRatio * 17.5))
    }

    // Component 3: Trend Momentum from Cumulative Trajectory (0 to 25 pts)
    let momentumPts = 12.5
    const series = data.dailySeriesCumulative || []
    if (series.length >= 2 && top5Buyers.length > 0) {
      const lastIdx = series.length - 1
      const startIdx = Math.max(0, series.length - 4)
      const primaryBuyer = top5Buyers[0].broker
      const endNet = series[lastIdx]?.[`cum_net_${primaryBuyer}`] || 0
      const startNet = series[startIdx]?.[`cum_net_${primaryBuyer}`] || 0
      if (endNet > startNet) {
        momentumPts = 25
      } else if (endNet < startNet) {
        momentumPts = 5
      }
    }

    const totalScore = Math.round(Math.min(100, Math.max(5, concentrationPts + absorptionPts + momentumPts)))

    let verdictLabel = ''
    let verdictColor = ''
    let verdictBadgeClass = ''

    if (totalScore >= 75) {
      verdictLabel = 'Strong Institutional Accumulation'
      verdictColor = '#10b981'
      verdictBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    } else if (totalScore >= 60) {
      verdictLabel = 'Moderate Accumulation'
      verdictColor = '#06b6d4'
      verdictBadgeClass = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
    } else if (totalScore >= 45) {
      verdictLabel = 'Neutral / Churning'
      verdictColor = '#f59e0b'
      verdictBadgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    } else if (totalScore >= 30) {
      verdictLabel = 'Moderate Distribution'
      verdictColor = '#f97316'
      verdictBadgeClass = 'bg-orange-500/20 text-orange-400 border-orange-500/40'
    } else {
      verdictLabel = 'Heavy Institutional Distribution'
      verdictColor = '#ef4444'
      verdictBadgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    }

    // Compose plain-English dynamic summary
    const topBuyerNames = top5Buyers.slice(0, 2).map((b) => `#${b.broker} (${getBrokerLabel(b.broker)})`).join(' and ') || 'No major buyer'
    const topSellerNames = top5Sellers.slice(0, 2).map((b) => `#${b.broker} (${getBrokerLabel(b.broker)})`).join(' and ') || 'No major seller'

    let summaryText = ''
    if (totalScore >= 60) {
      summaryText = `Top buyers led by ${topBuyerNames} accumulated a combined ${formatCurrency(top5NetAmount)}, capturing ${buyerConcentration.toFixed(0)}% of total buy orders while selling was distributed across ${sellers.length} brokerages. Smart money is actively absorbing circulating supply.`
    } else if (totalScore <= 40) {
      summaryText = `Selling pressure was concentrated in ${topSellerNames} offloading ${formatCurrency(top5NetSelling)}, outstripping buyer demand across the period. Caution advised as major institutional accounts are reducing exposure.`
    } else {
      summaryText = `Trading remains two-sided with high intraday churning. ${topBuyerNames} are absorbing shares while ${topSellerNames} are providing equal liquidity, keeping net institutional holding relatively balanced.`
    }

    return {
      score: totalScore,
      verdictLabel,
      verdictColor,
      verdictBadgeClass,
      summaryText,
      buyerConcentration,
      sellerConcentration,
      top5NetAmount,
      top5NetSelling,
    }
  }, [data])

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
              subtext={
                data?.kpis?.latestPrice
                  ? `LTP: Rs. ${Number(data.kpis.latestPrice).toFixed(1)} • ${data?.dateRange?.startDate} to ${data?.dateRange?.endDate}`
                  : `${data?.dateRange?.startDate} to ${data?.dateRange?.endDate}`
              }
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
                  ? `+${formatCompactNumber(topAccumulator.netAmount)} @ Rs.${topAccumulator.avgBuyRate?.toFixed(1) || '-'}${
                      data?.kpis?.latestPrice && topAccumulator.avgBuyRate
                        ? ` (${data.kpis.latestPrice >= topAccumulator.avgBuyRate ? '+' : ''}${(((data.kpis.latestPrice - topAccumulator.avgBuyRate) / topAccumulator.avgBuyRate) * 100).toFixed(1)}% ${data.kpis.latestPrice >= topAccumulator.avgBuyRate ? '🟢' : '🔴'})`
                        : ''
                    }`
                  : 'No net accumulation'
              }
              icon={<TrendingUp className="w-5 h-5 text-success" />}
            />
            <KpiCard
              label="Top Distributor (Net Seller)"
              value={topDistributor ? `Broker #${topDistributor.broker}` : 'None'}
              subtext={
                topDistributor
                  ? `${formatCompactNumber(topDistributor.netAmount)} (${formatCompactNumber(topDistributor.netQty)} sh) @ Rs.${topDistributor.avgSellRate?.toFixed(1) || '-'}`
                  : 'No net distribution'
              }
              icon={<TrendingDown className="w-5 h-5 text-destructive" />}
            />
          </div>

          {/* Smart Money Sentiment & Accumulation Verdict Card */}
          {smartMoneyAnalysis && (
            <GlassCard className="border border-border/70 bg-gradient-to-br from-card/90 via-card/60 to-background shadow-retool-md">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Left: Score Gauge */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shadow-inner transition-all"
                      style={{
                        backgroundColor: `${smartMoneyAnalysis.verdictColor}15`,
                        borderColor: `${smartMoneyAnalysis.verdictColor}40`,
                      }}
                    >
                      <span
                        className="text-2xl font-black tabular-nums tracking-tight"
                        style={{ color: smartMoneyAnalysis.verdictColor }}
                      >
                        {smartMoneyAnalysis.score}
                      </span>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                        Score / 100
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Smart Money Index</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${smartMoneyAnalysis.verdictBadgeClass}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: smartMoneyAnalysis.verdictColor }}
                      />
                      {smartMoneyAnalysis.verdictLabel}
                    </span>
                  </div>
                </div>

                {/* Center: Plain-English Executive Summary */}
                <div className="flex-1 lg:border-x lg:border-border/50 lg:px-6">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Institutional Footprint Verdict:
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {smartMoneyAnalysis.summaryText}
                  </p>
                </div>

                {/* Right: Institutional Concentration Bars */}
                <div className="w-full lg:w-72 space-y-2.5 shrink-0">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Top 5 Buyer Concentration:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {smartMoneyAnalysis.buyerConcentration.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${smartMoneyAnalysis.buyerConcentration}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Top 5 Seller Concentration:</span>
                      <span className="text-rose-400 font-mono font-bold">
                        {smartMoneyAnalysis.sellerConcentration.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${smartMoneyAnalysis.sellerConcentration}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

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
                  <button
                    type="button"
                    onClick={() => setShowPriceOverlay((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all cursor-pointer border ${
                      showPriceOverlay
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-xs font-semibold ring-1 ring-amber-500/30'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    title="Toggle daily closing price line overlay on secondary right axis to spot smart money divergence"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Price (NPR)</span>
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportTimeline} className="gap-1.5 h-8 text-xs cursor-pointer">
                  <Download className="w-3 h-3" />
                  Export Timeline
                </Button>
              </div>
            </div>

            {/* Trajectory Preset Buttons Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap p-2.5 bg-muted/30 rounded-xl border border-border/50 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Trajectory Presets:
                </span>

                {/* 1. Top 5 Accumulators */}
                <button
                  type="button"
                  onClick={() => applyPreset('top5_acc')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    activePreset === 'top5_acc'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-xs font-semibold ring-1 ring-emerald-500/30'
                      : 'bg-background/60 text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Top 5 Accumulators</span>
                </button>

                {/* 2. Top 5 Distributors */}
                <button
                  type="button"
                  onClick={() => applyPreset('top5_dist')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    activePreset === 'top5_dist'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-xs font-semibold ring-1 ring-rose-500/30'
                      : 'bg-background/60 text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>Top 5 Distributors</span>
                </button>

                {/* 3. Top 5 Acc + 5 Dist */}
                <button
                  type="button"
                  onClick={() => applyPreset('top5_both')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    activePreset === 'top5_both'
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-xs font-semibold ring-1 ring-primary/30'
                      : 'bg-background/60 text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                  <span>Top 5 Acc + 5 Dist</span>
                </button>

                {/* 4. All Listed Brokers */}
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    activePreset === 'all'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-xs font-semibold ring-1 ring-cyan-500/30'
                      : 'bg-background/60 text-muted-foreground border-border/60 hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>All Listed Brokers ({data?.topBrokers?.length || 0})</span>
                </button>
              </div>

              {/* Status indicator & Clear All */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  Active: <span className="font-semibold text-foreground">{visibleBrokersCount}</span> / {data?.topBrokers?.length || 0}
                </span>
                {visibleBrokersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePreset('custom')
                      setVisibleBrokers({})
                    }}
                    className="text-muted-foreground hover:text-destructive underline text-[11px] cursor-pointer ml-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Individual Broker Line Visibility Filters */}
            <div className="space-y-2 mb-4 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Individual Broker Toggles:</span>
                  {activePreset === 'custom' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Custom Selection
                    </span>
                  )}
                </div>

                {(data?.topBrokers?.length || 0) > 10 && (
                  <div className="relative w-44">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={brokerChipFilter}
                      onChange={(e) => setBrokerChipFilter(e.target.value)}
                      placeholder="Filter broker #..."
                      className="w-full pl-6 pr-2 py-0.5 text-[11px] rounded bg-background/60 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1 py-1">
                {filteredBrokerChips.map((b) => {
                  const isVisible = visibleBrokers[b.broker] ?? false
                  const color = getBrokerColor(b.broker)
                  const isBuyer = b.netAmount > 0
                  const isSeller = b.netAmount < 0

                  return (
                    <button
                      key={b.broker}
                      type="button"
                      onClick={() => toggleBroker(b.broker)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                        isVisible
                          ? 'bg-background shadow-xs text-foreground'
                          : 'opacity-40 bg-muted/20 text-muted-foreground border-transparent hover:opacity-75'
                      }`}
                      style={{
                        borderColor: isVisible ? color : undefined,
                      }}
                      title={`${getBrokerLabel(b.broker)}: Net ${isBuyer ? '+' : ''}${formatCurrency(b.netAmount)}`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span>#{b.broker}</span>
                      <span
                        className={`text-[9px] font-mono ${
                          isBuyer ? 'text-success' : isSeller ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        {isBuyer ? `+${formatCompactNumber(b.netAmount)}` : formatCompactNumber(b.netAmount)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Multi-Line Chart */}
            <div className="h-[380px] w-full">
              {visibleBrokersCount === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/60 rounded-xl p-8 text-center">
                  <Layers className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm font-medium text-foreground">No brokers selected</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Click a preset above (Top 5 Accumulators, Distributors, Both, or All Listed Brokers) or toggle individual brokers to view their trajectory.
                  </p>
                </div>
              ) : (
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
                      yAxisId="holdings"
                      tickFormatter={formatCompactNumber}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    {showPriceOverlay && (
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `Rs.${val}`}
                        tick={{ fontSize: 11 }}
                        stroke="#f59e0b"
                      />
                    )}
                    <Tooltip
                      labelFormatter={(val) => `Date: ${formatDay(String(val))}`}
                      formatter={(val, name) => {
                        if (name === 'close_price') {
                          return [`Rs. ${Number(val).toFixed(1)}`, 'Close Price (LTP)']
                        }
                        const brokerId = String(name).replace(/^(cum_net_|cum_qty_|daily_net_)/, '')
                        const label = getBrokerLabel(brokerId)
                        const isQty = chartMetric === 'cumulative_qty'
                        const formatted = isQty
                          ? `${formatNumber(Number(val))} shares`
                          : formatCurrency(Number(val))
                        return [formatted, label]
                      }}
                      itemSorter={(item) => (item.name === 'close_price' ? -999999999 : -(Math.abs(Number(item.value) || 0)))}
                      wrapperStyle={{ maxHeight: 320, overflowY: 'auto', zIndex: 100 }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--card-foreground))',
                        fontSize: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}
                    />
                    {showPriceOverlay && (
                      <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="close_price"
                        name="close_price"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="4 3"
                        dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                        isAnimationActive={false}
                      />
                    )}
                    {(data?.topBrokers || []).map((b) => {
                      const isVisible = visibleBrokers[b.broker] ?? false
                      if (!isVisible) return null
                      const color = getBrokerColor(b.broker)
                      const dataKey =
                        chartMetric === 'cumulative_amount'
                          ? `cum_net_${b.broker}`
                          : chartMetric === 'cumulative_qty'
                          ? `cum_qty_${b.broker}`
                          : `daily_net_${b.broker}`

                      return (
                        <Line
                          key={b.broker}
                          yAxisId="holdings"
                          type="monotone"
                          dataKey={dataKey}
                          name={dataKey}
                          stroke={color}
                          strokeWidth={visibleBrokersCount > 15 ? 1.5 : 2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={visibleBrokersCount <= 15}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              )}
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
