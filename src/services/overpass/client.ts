import type { Ecopoint } from '@/domain/types/ecopoint'
import { isCoordinates, type Coordinates } from '@/domain/types/location'
import { searchOfficialPoints } from '@/services/official-data/indaiatuba'
import type { EcopointSearchResult } from '@/domain/types/search'
import { MATERIALS } from '@/domain/types/ecopoint'

export const SEARCH_RADIUS_METERS = 5000
export type SearchResult = EcopointSearchResult

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
    return await searchRemote(center, signal, radius)
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
  const timeout = AbortSignal.timeout(55000)
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
  if (!response.ok) {
    console.error('ecopoints_request_failed', {
      status: response.status,
      code: payload?.code,
      requestId: response.headers.get('X-Request-Id'),
    })
    throw new Error(
      payload?.error ||
        'O serviço de coleta está temporariamente indisponível.',
    )
  }
  if (
    !payload ||
    !['live', 'cache', 'stale', 'official'].includes(payload.freshness) ||
    typeof payload.fetchedAt !== 'string' ||
    !Number.isFinite(Date.parse(payload.fetchedAt)) ||
    !Array.isArray(payload.points) ||
    !payload.points.every(isEcopoint)
  )
    throw new Error('O serviço retornou uma resposta inválida.')
  return {
    points: payload.points,
    fetchedAt: payload.fetchedAt,
    freshness: payload.freshness,
    warning: typeof payload.warning === 'string' ? payload.warning : undefined,
  }
}

function isEcopoint(value: unknown): value is Ecopoint {
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return (
    typeof point.id === 'string' &&
    typeof point.name === 'string' &&
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    isCoordinates({ latitude: point.latitude, longitude: point.longitude }) &&
    (point.source === 'osm' || point.source === 'official') &&
    (point.acceptedMaterials === undefined ||
      (Array.isArray(point.acceptedMaterials) &&
        point.acceptedMaterials.every(
          (material) =>
            typeof material === 'string' && Object.hasOwn(MATERIALS, material),
        )))
  )
}
