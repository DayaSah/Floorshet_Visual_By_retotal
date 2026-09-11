import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Star, X } from 'lucide-react'
import { getWatchlist, subscribeWatchlist, toggleBrokerWatchlist, toggleSymbolWatchlist } from '../utils/watchlist'
import { getBrokerLabel } from '../utils/brokerNames'

export function WatchlistBar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [watchlist, setWatchlist] = useState(getWatchlist)

  useEffect(() => {
    return subscribeWatchlist(setWatchlist)
  }, [])

  if (watchlist.symbols.length === 0 && watchlist.brokers.length === 0) {
    return null
  }

  return (
    <div className="border-b border-border/40 bg-background/50 backdrop-blur-md px-6 py-1.5 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground font-medium flex-shrink-0 mr-1">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          <span className="hidden sm:inline">Watchlist:</span>
        </div>

        {/* Pinned Symbols */}
        {watchlist.symbols.map((symbol) => (
          <div
            key={`sym-${symbol}`}
            className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border/60 bg-card/60 hover:bg-accent/80 text-foreground font-medium transition-all"
          >
            <Link
              to={`/symbols?symbol=${encodeURIComponent(symbol)}`}
              className="hover:text-primary transition-colors"
            >
              {symbol}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleSymbolWatchlist(symbol)
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity cursor-pointer p-0.5 -mr-0.5"
              title={`Remove ${symbol} from watchlist`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Pinned Brokers */}
        {watchlist.brokers.map((broker) => (
          <div
            key={`brk-${broker}`}
            className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-medium transition-all"
            title={getBrokerLabel(broker)}
          >
            <Link
              to={`/brokers?broker=${encodeURIComponent(broker)}`}
              className="hover:underline"
            >
              #{broker}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                toggleBrokerWatchlist(broker)
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity cursor-pointer p-0.5 -mr-0.5"
              title={`Remove #${broker} from watchlist`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add shortcut button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors cursor-pointer"
            title="Search to add symbols or brokers"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  )
}
