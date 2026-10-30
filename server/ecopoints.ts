import { searchOfficialPoints } from '../src/services/official-data/indaiatuba.ts'
import type { Coordinates } from '../src/domain/types/location.ts'
import type { EcopointSearchResult } from '../src/domain/types/search.ts'
import { normalizeOverpass } from '../src/services/overpass/normalize.ts'
import { buildQuery, createOverpassService } from './overpass.ts'
import { ApiError } from './errors.ts'

export function createEcopointService(fetcher: typeof fetch = fetch) {
  const searchOverpass = createOverpassService(fetcher)
  return async function search(
    center: Coordinates,
    radius: number,
  ): Promise<EcopointSearchResult> {
    buildQuery(center, radius) // Validate even if a local source covers the area.
    const official = searchOfficialPoints(center, radius)
    try {
      const response = await searchOverpass(center, radius)
      return {
        points: [...official, ...normalizeOverpass(response.data)],
        fetchedAt: response.fetchedAt,
        freshness: response.freshness,
      }
    } catch (error) {
      if (
        !official.length ||
        !(error instanceof ApiError) ||
        error.status !== 503
      )
        throw error
      return {
        points: official,
        freshness: 'official',
        fetchedAt: '2026-10-29',
        warning:
          'A fonte colaborativa não respondeu. Exibindo somente os pontos municipais disponíveis nesta área.',
      }
    }
  }
}
