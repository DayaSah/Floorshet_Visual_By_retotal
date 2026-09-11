import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock, LayoutGrid, Network, ScatterChart, Search, Table2, Users } from 'lucide-react'
import { BROKER_DIRECTORY } from '../utils/brokerNames'

interface PaletteItem {
  id: string
  title: string
  subtitle?: string
  category: 'Pages' | 'Brokers' | 'Symbols'
  icon?: any
  onSelect: () => void
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase()
    const results: PaletteItem[] = []

    // 1. Pages
    const pages: PaletteItem[] = [
      { id: 'page-table', title: 'Table', subtitle: 'Raw floorsheet transactions', category: 'Pages', icon: Table2, onSelect: () => navigate('/') },
      { id: 'page-overview', title: 'Overview', subtitle: 'Market overview & volume metrics', category: 'Pages', icon: LayoutGrid, onSelect: () => navigate('/overview') },
      { id: 'page-symbols', title: 'Symbols', subtitle: 'Symbol rankings & price trend', category: 'Pages', icon: Activity, onSelect: () => navigate('/symbols') },
      { id: 'page-brokers', title: 'Brokers', subtitle: 'Broker net accumulation & daily history', category: 'Pages', icon: Users, onSelect: () => navigate('/brokers') },
      { id: 'page-network', title: 'Broker Network', subtitle: 'Counterparty trading pairs & matrix', category: 'Pages', icon: Network, onSelect: () => navigate('/broker-network') },
      { id: 'page-time', title: 'Time Patterns', subtitle: 'Minute buckets & day-of-week trends', category: 'Pages', icon: Clock, onSelect: () => navigate('/time-patterns') },
      { id: 'page-trade-size', title: 'Trade Size', subtitle: 'Block deal analysis & size distribution', category: 'Pages', icon: ScatterChart, onSelect: () => navigate('/trade-size') },
    ]

    for (const page of pages) {
      if (!q || page.title.toLowerCase().includes(q) || page.subtitle?.toLowerCase().includes(q)) {
        results.push(page)
      }
    }

    // 2. Direct Symbol query
    if (q) {
      const cleanTicker = q.toUpperCase()
      results.push({
        id: `sym-${cleanTicker}`,
        title: `Analyze Symbol "${cleanTicker}"`,
        subtitle: `Jump straight to ${cleanTicker} analysis chart`,
        category: 'Symbols',
        icon: Activity,
        onSelect: () => navigate(`/symbols?symbol=${encodeURIComponent(cleanTicker)}`),
      })
    }

    // 3. Brokers
    const filteredBrokers = BROKER_DIRECTORY.filter(
      (b) => !q || b.broker_no.includes(q) || b.broker_name.toLowerCase().includes(q)
    ).slice(0, 15)

    for (const b of filteredBrokers) {
      results.push({
        id: `broker-${b.broker_no}`,
        title: `Broker #${b.broker_no}`,
        subtitle: b.broker_name,
        category: 'Brokers',
        icon: Users,
        onSelect: () => navigate(`/brokers?broker=${encodeURIComponent(b.broker_no)}`),
      })
    }

    return results
  }, [query, navigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (items[selectedIndex]) {
          items[selectedIndex].onSelect()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, selectedIndex, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-label="Close command palette"
      />
      <div className="relative w-full max-w-xl rounded-xl border border-border/70 bg-card/95 shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search symbols (e.g. NABIL), brokers (#58), or pages..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted font-mono">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matching pages, symbols, or brokers found.
            </div>
          ) : (
            items.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                    <div className="truncate">
                      <span className="font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span
                          className={`ml-2 text-xs truncate ${
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                      isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border/40 bg-muted/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with <kbd className="font-mono bg-muted px-1 rounded">↑</kbd> <kbd className="font-mono bg-muted px-1 rounded">↓</kbd></span>
          <span>Select with <kbd className="font-mono bg-muted px-1 rounded">↵</kbd></span>
        </div>
      </div>
    </div>
  )
}
