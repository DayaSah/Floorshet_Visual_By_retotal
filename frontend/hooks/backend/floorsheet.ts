import { useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const clientCache = new Map<string, CacheEntry<any>>()
const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes client memory freshness

function buildQueryString(params?: Record<string, any>, skipCache?: boolean): string {
  const query = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, String(v))
      }
    }
  }
  if (skipCache) {
    query.set('_skip_cache', '1')
  }
  return query.toString()
}

export function createBackendHook<T>(url: string) {
  return function useQuery() {
    const [data, setData] = useState<T | null>(() => clientCache.get(url)?.data ?? null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dataAccessErrors] = useState<Array<{ message: string }>>([])
    const lastParamsRef = useRef<any>(null)

    const trigger = useCallback(
      async (params?: Record<string, any>, options?: { skipCache?: boolean }) => {
        const effectiveParams = params !== undefined ? params : lastParamsRef.current
        lastParamsRef.current = effectiveParams

        const baseQuery = buildQueryString(effectiveParams, false)
        const cacheKey = baseQuery ? `${url}?${baseQuery}` : url

        const requestQuery = buildQueryString(effectiveParams, options?.skipCache)
        const requestUrl = requestQuery ? `${url}?${requestQuery}` : url

        const now = Date.now()
        const cached = clientCache.get(cacheKey)

        if (!options?.skipCache && cached) {
          setData(cached.data)
          // If cached data is still fresh within 10 minutes, return immediately with zero network overhead
          if (now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
            return cached.data
          }
          // Stale: keep loading false so UI shows cached data without any loading flicker while revalidating
        } else {
          setLoading(true)
        }

        setError(null)
        try {
          const res = await fetch(requestUrl)
          if (!res.ok) {
            const body = await res.json().catch(() => ({ error: res.statusText }))
            throw new Error(body.error || `HTTP ${res.status}`)
          }
          const json = await res.json()
          clientCache.set(cacheKey, { data: json, timestamp: Date.now() })
          setData(json)
          return json
        } catch (err: any) {
          setError(err.message || 'An error occurred while fetching data')
        } finally {
          setLoading(false)
        }
      },
      []
    )

    return { data, loading, error, dataAccessErrors, trigger }
  }
}

export const useGetFloorsheetRaw = createBackendHook<any[]>('/api/floorsheet/raw')
export const useGetFloorsheetStats = createBackendHook<{ daily: any[]; topSymbols: any[] }>('/api/floorsheet/stats')
export const useGetSymbolAnalysis = createBackendHook<{ ranking: any[]; trades: any[] }>('/api/floorsheet/symbols')
export const useGetBrokerAnalysis = createBackendHook<{ ranking: any[]; daily: any[]; stocks?: any[] }>('/api/floorsheet/brokers')
export const useGetBrokerNetwork = createBackendHook<{ topPairs: any[]; topBrokers: any[]; matrix: any[] }>('/api/floorsheet/network')
export const useGetTimePatterns = createBackendHook<{ minuteBuckets: any[]; dayOfWeek: any[] }>('/api/floorsheet/time-patterns')
export const useGetTradeSizeAnalysis = createBackendHook<{ sizeDistribution: any[]; blockDeals: any[] }>('/api/floorsheet/trade-size')
