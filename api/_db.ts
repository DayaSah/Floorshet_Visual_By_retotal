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
 * Standard caching headers for Vercel Edge CDN:
 * - Serves from Edge CDN for s-maxage seconds
 * - Revalidates in background (stale-while-revalidate) for up to 1 day
 */
export function setCacheHeaders(res: any, sMaxAge = 300) {
  res.setHeader('Cache-Control', `public, s-maxage=${sMaxAge}, stale-while-revalidate=86400`)
}
