import { Calendar, Loader2 } from 'lucide-react'
import { useDateRange } from '../contexts/DateRangeContext'

const PRESETS = [
  { label: '1d', display: '1D' },
  { label: '3d', display: '3D' },
  { label: '7d', display: '7D' },
  { label: '15d', display: '15D' },
  { label: '30d', display: '30D' },
  { label: '90d', display: '90D' },
  { label: 'all', display: 'All' },
] as const

function formatDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function DateRangeBar() {
  const { startDate, endDate, rangeLabel, latestDate, latestDateLoading, setRange } = useDateRange()

  return (
    <div className="sticky top-[49px] z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {latestDateLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setRange(p.label as any)}
              disabled={latestDateLoading}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 ${
                rangeLabel === p.label
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {p.display}
            </button>
          ))}
          <span className="mx-1 text-border text-sm">│</span>
          <input
            type="date"
            value={startDate}
            max={endDate || latestDate}
            onChange={(e) => setRange('custom', e.target.value, endDate || e.target.value)}
            className="text-[11px] font-mono bg-transparent border border-border/60 rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-[115px] cursor-pointer"
          />
          <span className="text-muted-foreground text-[10px]">→</span>
          <input
            type="date"
            value={endDate}
            max={latestDate}
            onChange={(e) => setRange('custom', startDate || e.target.value, e.target.value)}
            className="text-[11px] font-mono bg-transparent border border-border/60 rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-[115px] cursor-pointer"
          />
        </div>

        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {startDate && endDate
              ? startDate === endDate
                ? formatDisplay(startDate)
                : `${formatDisplay(startDate)} → ${formatDisplay(endDate)}`
              : 'All Time'}
          </span>
          {latestDate && (
            <span className="text-[9px] text-muted-foreground/50">
              Latest data: {formatDisplay(latestDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
