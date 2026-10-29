import type { Ecopoint } from '@/domain/types/ecopoint'
import { isCoordinates, type Coordinates } from '@/domain/types/location'
import { normalizeOverpass } from './normalize'
import { searchOfficialPoints } from '@/services/official-data/indaiatuba'

export const SEARCH_RADIUS_METERS = 5000
export type SearchResult = {
  points: Ecopoint[]
  fetchedAt: string
  freshness: 'live' | 'cache' | 'stale' | 'official'
  warning?: string
}

export async function searchEcopoints(
  center: Coordinates,
  signal: AbortSignal,
  radius = SEARCH_RADIUS_METERS,
): Promise<SearchResult> {
  if (!isCoordinates(center) || ![5000, 10000, 20000].includes(radius))
    throw new Error('Área de busca inválida.')
  signal.throwIfAborted()
  const official = searchOfficialPoints(center, radius)
  try {
    const result = await searchRemote(center, signal, radius)
    return { ...result, points: [...official, ...result.points] }
  } catch (error) {
    if (signal.aborted || !official.length) throw error
    return {
      points: official,
      fetchedAt: '2026-10-29',
      freshness: 'official',
      warning:
        'Pontos municipais disponíveis. A atualização colaborativa está temporariamente indisponível.',
    }
  }
}

async function searchRemote(
  center: Coordinates,
  signal: AbortSignal,
  radius: number,
): Promise<SearchResult> {
  const params = new URLSearchParams({
    lat: center.latitude.toFixed(3),
    lon: center.longitude.toFixed(3),
    radius: String(radius),
  })
  const timeout = AbortSignal.timeout(32000)
  let response: Response
  try {
    response = await fetch(`/api/ecopoints?${params}`, {
      signal: AbortSignal.any([signal, timeout]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new Error(
      timeout.aborted
        ? 'A busca demorou mais que o esperado. Seus resultados anteriores foram mantidos. Tente atualizar.'
        : 'Não foi possível conectar. Verifique sua conexão e tente atualizar.',
    )
  }
  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('O serviço retornou uma resposta inválida.')
  }
  if (!response.ok)
    throw new Error(
      payload?.error ||
        'O serviço de coleta está temporariamente indisponível.',
    )
  if (
    !payload ||
    !['live', 'cache', 'stale'].includes(payload.freshness) ||
    typeof payload.fetchedAt !== 'string'
  )
    throw new Error('O serviço retornou uma resposta inválida.')
  return {
    points: normalizeOverpass(payload.data),
    fetchedAt: payload.fetchedAt,
    freshness: payload.freshness,
  }
}
