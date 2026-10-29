import { INDAIATUBA_ECOPOINTS } from '@/services/official-data/indaiatuba'
import { PILOT_LOCATION } from '@/domain/types/location'
import { distanceMeters } from '@/domain/rules/distance'
import type { SearchResult } from '@/services/overpass/client'

export const PILOT_RESULTS: SearchResult = {
  points: INDAIATUBA_ECOPOINTS.map((point) => ({
    ...point,
    distanceMeters: distanceMeters(PILOT_LOCATION, point),
  })).sort((a, b) => a.distanceMeters - b.distanceMeters),
  fetchedAt: '2026-10-29',
  freshness: 'official',
}
