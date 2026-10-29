import { normalizeOverpass } from '../src/services/overpass/normalize.ts'
import {
  isCoordinates,
  type Coordinates,
} from '../src/domain/types/location.ts'
import { ApiError } from './errors.ts'

const DEFAULT_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
export const RADII = [5000, 10000, 20000] as const

export function buildQuery(center: Coordinates, radius = 5000): string {
  if (
    !isCoordinates(center) ||
    !RADII.includes(radius as (typeof RADII)[number])
  ) {
    throw new ApiError(400, 'INVALID_AREA', 'Área de busca inválida.')
  }
  return `[out:json][timeout:12];nwr["amenity"="recycling"](around:${radius},${center.latitude.toFixed(3)},${center.longitude.toFixed(3)});out center tags;`
}

type Entry = { data: unknown; fetchedAt: string }
export type OverpassResult = Entry & { freshness: 'live' | 'cache' | 'stale' }

/** Cache and in-flight deduplication are process-local, with no database or location history. */
export function createOverpassService(fetcher: typeof fetch = fetch) {
  const cache = new Map<string, Entry>()
  const pending = new Map<string, Promise<OverpassResult>>()
  const paused = new Map<string, number>()

  return async function search(
    center: Coordinates,
    radius = 5000,
  ): Promise<OverpassResult> {
    const query = buildQuery(center, radius)
    const cached = cache.get(query)
    if (cached && Date.now() - Date.parse(cached.fetchedAt) < 180000)
      return { ...cached, freshness: 'cache' }
    const existing = pending.get(query)
    if (existing) return existing
    if (pending.size >= 4)
      throw new ApiError(
        429,
        'SEARCH_BUSY',
        'Há muitas buscas em andamento. Aguarde alguns segundos.',
        5,
      )

    const task = (async (): Promise<OverpassResult> => {
      const endpoints = process.env.OVERPASS_URL
        ? [process.env.OVERPASS_URL]
        : DEFAULT_ENDPOINTS
      for (const endpoint of endpoints) {
        if ((paused.get(endpoint) ?? 0) > Date.now()) continue
        try {
          const url = new URL(endpoint)
          url.searchParams.set('data', query)
          const response = await fetcher(url, {
            headers: {
              'User-Agent':
                'EcoPerto/0.1 (+https://github.com/Davanso/EcoPerto)',
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(14000),
          })
          if (!response.ok) {
            console.warn(
              JSON.stringify({
                event: 'overpass_failure',
                provider: url.hostname,
                reason: 'http',
                status: response.status,
              }),
            )
            paused.set(endpoint, Date.now() + 60000)
            continue
          }
          const data: unknown = await response.json()
          normalizeOverpass(data) // Never cache partial or malformed responses.
          const entry = { data, fetchedAt: new Date().toISOString() }
          if (cache.size >= 100) cache.delete(cache.keys().next().value!)
          cache.set(query, entry)
          return { ...entry, freshness: 'live' }
        } catch (error) {
          console.warn(
            JSON.stringify({
              event: 'overpass_failure',
              provider: new URL(endpoint).hostname,
              reason: error instanceof Error ? error.name : 'unknown',
            }),
          )
          paused.set(endpoint, Date.now() + 60000)
        }
      }
      if (cached && Date.now() - Date.parse(cached.fetchedAt) < 3600000)
        return { ...cached, freshness: 'stale' }
      throw new ApiError(
        503,
        'ECOPOINTS_PROVIDER_UNAVAILABLE',
        'A fonte de ecopontos desta região está indisponível agora. Tente novamente em um minuto ou consulte outra área.',
        60,
      )
    })()
    pending.set(query, task)
    try {
      return await task
    } finally {
      pending.delete(query)
    }
  }
}
