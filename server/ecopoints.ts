import { searchOfficialPoints } from '../src/services/official-data/indaiatuba.ts'
import type { Coordinates } from '../src/domain/types/location.ts'
import type { EcopointSearchResult } from '../src/domain/types/search.ts'
import { normalizeOverpass } from '../src/services/overpass/normalize.ts'
import { buildQuery, createOverpassService } from './overpass.ts'

export function createEcopointService(fetcher: typeof fetch = fetch) {
  const searchOverpass = createOverpassService(fetcher)
  return async function search(
    center: Coordinates,
    radius: number,
  ): Promise<EcopointSearchResult> {
    buildQuery(center, radius) // Validate even if a local source covers the area.
    const official = searchOfficialPoints(center, radius)
    if (official.length) {
      return {
        points: official,
        freshness: 'official',
        fetchedAt: '2026-10-29',
      }
    }
    const response = await searchOverpass(center, radius)
    return {
      points: normalizeOverpass(response.data),
      fetchedAt: response.fetchedAt,
      freshness: response.freshness,
    }
  }
}
