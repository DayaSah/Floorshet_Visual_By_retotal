import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type RangeLabel = '1d' | '3d' | '7d' | '15d' | '30d' | '90d' | 'all' | 'custom'

interface DateRangeContextValue {
  startDate: string
  endDate: string
  rangeLabel: RangeLabel
  latestDate: string       // Latest available trading day in the DB
  latestDateLoading: boolean
  setRange: (label: RangeLabel, start?: string, end?: string) => void
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function computeDates(label: RangeLabel, latestDate: string): { startDate: string; endDate: string } {
  if (label === 'all') return { startDate: '', endDate: '' }

  // 1D: exactly the latest available trading day
  if (label === '1d') {
    const base = latestDate || formatDate(new Date())
    return { startDate: base, endDate: base }
  }

  // For other presets, anchor to latest date (or today if not yet loaded)
  const base = latestDate ? new Date(latestDate + 'T00:00:00') : new Date()
  const days = label === '3d' ? 3 : label === '7d' ? 7 : label === '15d' ? 15 : label === '30d' ? 30 : 90
  const start = new Date(base)
  start.setDate(start.getDate() - (days - 1))
  return { startDate: formatDate(start), endDate: formatDate(base) }
}

const DateRangeContext = createContext<DateRangeContextValue>({
  startDate: '',
  endDate: '',
  rangeLabel: '15d',
  latestDate: '',
  latestDateLoading: true,
  setRange: () => {},
})

export function useDateRange() {
  return useContext(DateRangeContext)
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [rangeLabel, setRangeLabel] = useState<RangeLabel>('15d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [latestDate, setLatestDate] = useState('')
  const [latestDateLoading, setLatestDateLoading] = useState(true)

  // Fetch latest available trading date once on mount
  useEffect(() => {
    fetch('/api/floorsheet/latest-date')
      .then((r) => r.json())
      .then((json) => {
        const ld: string = json?.latestDate ?? ''
        setLatestDate(ld)
        // Apply default 15d anchored to real latest date
        const dates = computeDates('15d', ld)
        setStartDate(dates.startDate)
        setEndDate(dates.endDate)
      })
      .catch(() => {
        // Fallback to today if API fails
        const dates = computeDates('15d', formatDate(new Date()))
        setStartDate(dates.startDate)
        setEndDate(dates.endDate)
      })
      .finally(() => setLatestDateLoading(false))
  }, [])

  const setRange = useCallback(
    (label: RangeLabel, start?: string, end?: string) => {
      setRangeLabel(label)
      if (label === 'custom' && start && end) {
        setStartDate(start)
        setEndDate(end)
      } else {
        const dates = computeDates(label, latestDate)
        setStartDate(dates.startDate)
        setEndDate(dates.endDate)
      }
    },
    [latestDate]
  )

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, rangeLabel, latestDate, latestDateLoading, setRange }}>
      {children}
    </DateRangeContext.Provider>
  )
}
