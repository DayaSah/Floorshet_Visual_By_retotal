/**
 * Watchlist store with localStorage persistence and reactive event dispatching.
 */

const STORAGE_KEY = 'nepse_floorsheet_watchlist'
const EVENT_NAME = 'nepse-watchlist-changed'

export interface WatchlistData {
  symbols: string[]
  brokers: string[]
}

const DEFAULT_WATCHLIST: WatchlistData = {
  symbols: ['NABIL', 'SHIVM', 'CHCL', 'GBIME'],
  brokers: ['58', '48', '45'],
}

export function getWatchlist(): WatchlistData {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLIST))
      return DEFAULT_WATCHLIST
    }
    const parsed = JSON.parse(raw)
    return {
      symbols: Array.isArray(parsed.symbols) ? parsed.symbols : DEFAULT_WATCHLIST.symbols,
      brokers: Array.isArray(parsed.brokers) ? parsed.brokers : DEFAULT_WATCHLIST.brokers,
    }
  } catch (e) {
    return DEFAULT_WATCHLIST
  }
}

function saveWatchlist(data: WatchlistData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch (e) {
    console.error('Failed to save watchlist:', e)
  }
}

export function isSymbolWatchlisted(symbol: string): boolean {
  if (!symbol) return false
  const sym = symbol.trim().toUpperCase()
  const data = getWatchlist()
  return data.symbols.includes(sym)
}

export function toggleSymbolWatchlist(symbol: string): boolean {
  if (!symbol) return false
  const sym = symbol.trim().toUpperCase()
  const data = getWatchlist()
  let added = false
  if (data.symbols.includes(sym)) {
    data.symbols = data.symbols.filter((s) => s !== sym)
  } else {
    data.symbols.push(sym)
    added = true
  }
  saveWatchlist(data)
  return added
}

export function isBrokerWatchlisted(broker: string): boolean {
  if (!broker) return false
  const b = broker.trim()
  const data = getWatchlist()
  return data.brokers.includes(b)
}

export function toggleBrokerWatchlist(broker: string): boolean {
  if (!broker) return false
  const b = broker.trim()
  const data = getWatchlist()
  let added = false
  if (data.brokers.includes(b)) {
    data.brokers = data.brokers.filter((item) => item !== b)
  } else {
    data.brokers.push(b)
    added = true
  }
  saveWatchlist(data)
  return added
}

export function subscribeWatchlist(callback: (data: WatchlistData) => void): () => void {
  const handler = () => callback(getWatchlist())
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}
