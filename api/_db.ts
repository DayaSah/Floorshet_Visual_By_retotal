import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined')
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  return pool
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()

/**
 * In-memory caching wrapper to minimize database Request Units (RU).
 */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  skipCache = false
): Promise<T> {
  const now = Date.now()
  if (!skipCache) {
    const cached = memoryCache.get(key)
    if (cached && cached.expiresAt > now) {
      return cached.data as T
    }
  }

  const fresh = await fetcher()
  memoryCache.set(key, { data: fresh, expiresAt: now + ttlSeconds * 1000 })
  return fresh
}

/**
 * High-performance caching headers for Vercel Edge CDN and client browsers:
 * - maxAge (default 5 min): Tells the user's browser to reuse the response locally with 0 network calls.
 * - sMaxAge (default 24h): Tells Vercel's Edge CDN to cache globally across all edge regions.
 * - stale-while-revalidate (7 days): Tells Vercel to serve cached data instantly while refreshing in background.
 */
export function setCacheHeaders(res: any, sMaxAge = 86400, maxAge = 300) {
  res.setHeader(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=604800`
  )
}

/**
 * Parses startDate/endDate query params and returns SQL condition + params + cache suffix.
 * Returns empty condition if no dates provided (= query all data).
 */
export function parseDateRange(
  query: Record<string, any>,
  existingParams: any[] = [],
  tradeTimeColumn = 'trade_time'
): { condition: string; params: any[]; cacheSuffix: string } {
  const startDate = query.startDate ? String(query.startDate).trim() : ''
  const endDate = query.endDate ? String(query.endDate).trim() : ''

  if (!startDate || !endDate) {
    return { condition: '', params: [...existingParams], cacheSuffix: 'all' }
  }

  const startIdx = existingParams.length + 1
  const endIdx = existingParams.length + 2
  return {
    condition: `AND ${tradeTimeColumn}::date >= $${startIdx} AND ${tradeTimeColumn}::date <= $${endIdx}`,
    params: [...existingParams, startDate, endDate],
    cacheSuffix: `${startDate}_${endDate}`,
  }
}
