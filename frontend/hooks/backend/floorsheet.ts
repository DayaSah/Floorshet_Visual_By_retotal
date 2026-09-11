import { useState, useCallback, useRef } from 'react'

export function createBackendHook<T>(url: string) {
  return function useQuery() {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dataAccessErrors] = useState<Array<{ message: string }>>([])
    const lastParamsRef = useRef<any>(null)

    const trigger = useCallback(
      async (params?: Record<string, any>, options?: { skipCache?: boolean }) => {
        setLoading(true)
        setError(null)
        try {
          const effectiveParams = params !== undefined ? params : lastParamsRef.current
          lastParamsRef.current = effectiveParams

          const query = new URLSearchParams()
          if (effectiveParams) {
            for (const [k, v] of Object.entries(effectiveParams)) {
              if (v !== undefined && v !== null && v !== '') {
                query.set(k, String(v))
              }
            }
          }
          if (options?.skipCache) {
            query.set('_skip_cache', '1')
          }

          const queryString = query.toString()
          const fullUrl = queryString ? `${url}?${queryString}` : url

          const res = await fetch(fullUrl)
          if (!res.ok) {
            const body = await res.json().catch(() => ({ error: res.statusText }))
            throw new Error(body.error || `HTTP ${res.status}`)
          }
          const json = await res.json()
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
export const useGetBrokerAnalysis = createBackendHook<{ ranking: any[]; daily: any[] }>('/api/floorsheet/brokers')
export const useGetBrokerNetwork = createBackendHook<{ topPairs: any[]; topBrokers: any[]; matrix: any[] }>('/api/floorsheet/network')
export const useGetTimePatterns = createBackendHook<{ minuteBuckets: any[]; dayOfWeek: any[] }>('/api/floorsheet/time-patterns')
export const useGetTradeSizeAnalysis = createBackendHook<{ sizeDistribution: any[]; blockDeals: any[] }>('/api/floorsheet/trade-size')
