import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type RangeLabel = '7d' | '15d' | '30d' | '90d' | 'all' | 'custom'

interface DateRangeContextValue {
  startDate: string
  endDate: string
  rangeLabel: RangeLabel
  setRange: (label: RangeLabel, start?: string, end?: string) => void
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function computeDates(label: RangeLabel): { startDate: string; endDate: string } {
  const end = new Date()
  const endStr = formatDate(end)
  if (label === 'all') return { startDate: '', endDate: '' }
  const days = label === '7d' ? 7 : label === '15d' ? 15 : label === '30d' ? 30 : 90
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return { startDate: formatDate(start), endDate: endStr }
}

const defaultDates = computeDates('15d')

const DateRangeContext = createContext<DateRangeContextValue>({
  startDate: defaultDates.startDate,
  endDate: defaultDates.endDate,
  rangeLabel: '15d',
  setRange: () => {},
})

export function useDateRange() {
  return useContext(DateRangeContext)
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [rangeLabel, setRangeLabel] = useState<RangeLabel>('15d')
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)

  const setRange = useCallback((label: RangeLabel, start?: string, end?: string) => {
    setRangeLabel(label)
    if (label === 'custom' && start && end) {
      setStartDate(start)
      setEndDate(end)
    } else {
      const dates = computeDates(label)
      setStartDate(dates.startDate)
      setEndDate(dates.endDate)
    }
  }, [])

  return (
    <DateRangeContext.Provider value={{ startDate, endDate, rangeLabel, setRange }}>
      {children}
    </DateRangeContext.Provider>
  )
}
