import { normalizeOverpass } from '../src/services/overpass/normalize.ts'
import {
  isCoordinates,
  type Coordinates,
} from '../src/domain/types/location.ts'
import { ApiError } from './errors.ts'

const DEFAULT_ENDPOINTS = ['https://overpass.private.coffee/api/interpreter']
export const RADII = [5000, 10000, 20000] as const

export function buildQuery(center: Coordinates, radius = 5000): string {
  if (
    !isCoordinates(center) ||
    !RADII.includes(radius as (typeof RADII)[number])
  ) {
    throw new ApiError(400, 'INVALID_AREA', 'Área de busca inválida.')
  }
  return `[out:json][timeout:20][maxsize:16777216];nwr["amenity"="recycling"](around:${radius},${center.latitude.toFixed(3)},${center.longitude.toFixed(3)});out center tags;`
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
    if (cached && Date.now() - Date.parse(cached.fetchedAt) < 3600000)
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
        ? [
            process.env.OVERPASS_URL,
            ...DEFAULT_ENDPOINTS.filter(
              (url) => url !== process.env.OVERPASS_URL,
            ),
          ]
        : DEFAULT_ENDPOINTS
      for (const endpoint of endpoints) {
        if ((paused.get(endpoint) ?? 0) > Date.now()) continue
        const started = Date.now()
        let provider = 'configured-provider'
        try {
          const url = new URL(endpoint)
          if (url.protocol !== 'https:') throw new Error('Invalid provider URL')
          provider = url.hostname
          const response = await fetcher(url, {
            method: 'POST',
            body: new URLSearchParams({ data: query }),
            headers: {
              'User-Agent':
                'EcoPerto/1.0 (+https://eco-perto.vercel.app; https://github.com/Davanso/EcoPerto)',
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            signal: AbortSignal.timeout(25000),
          })
          if (!response.ok) {
            console.warn(
              JSON.stringify({
                event: 'overpass_failure',
                provider: url.hostname,
                reason: 'http',
                status: response.status,
                elapsedMs: Date.now() - started,
              }),
            )
            paused.set(endpoint, Date.now() + 60000)
            continue
          }
          const data: unknown = await response.json()
          normalizeOverpass(data) // Never cache partial or malformed responses.
          const entry = { data, fetchedAt: new Date().toISOString() }
          console.info(
            JSON.stringify({
              event: 'overpass_success',
              provider,
              elapsedMs: Date.now() - started,
              count: normalizeOverpass(data).length,
            }),
          )
          if (cache.size >= 100) cache.delete(cache.keys().next().value!)
          cache.set(query, entry)
          return { ...entry, freshness: 'live' }
        } catch (error) {
          console.warn(
            JSON.stringify({
              event: 'overpass_failure',
              provider,
              reason: error instanceof Error ? error.name : 'unknown',
              elapsedMs: Date.now() - started,
            }),
          )
          paused.set(endpoint, Date.now() + 60000)
        }
      }
      if (cached && Date.now() - Date.parse(cached.fetchedAt) < 86400000)
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
