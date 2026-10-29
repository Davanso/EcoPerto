import type { Ecopoint } from '@/domain/types/ecopoint'
import { isCoordinates, type Coordinates } from '@/domain/types/location'
import { normalizeOverpass } from './normalize'

export const SEARCH_RADIUS_METERS = 5000
const ENDPOINT =
  import.meta.env.VITE_OVERPASS_URL || 'https://overpass-api.de/api/interpreter'

export function buildQuery(center: Coordinates): string {
  if (!isCoordinates(center))
    throw new Error('Coordenadas inválidas para a busca.')
  return `[out:json][timeout:25];nwr["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${center.latitude.toFixed(5)},${center.longitude.toFixed(5)});out center tags;`
}

/** One bounded request, triggered explicitly; no polling or automatic retries. */
export async function searchEcopoints(
  center: Coordinates,
  signal: AbortSignal,
): Promise<Ecopoint[]> {
  const query = buildQuery(center)
  const timeout = AbortSignal.timeout(35000)
  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.any([signal, timeout]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted)
      throw new Error(
        'A consulta demorou mais que o esperado. Tente novamente mais tarde.',
      )
    throw new Error(
      'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
    )
  }
  if (response.status === 429)
    throw new Error(
      'O serviço está recebendo muitas consultas. Aguarde um minuto antes de tentar novamente.',
    )
  if (!response.ok)
    throw new Error(
      'O serviço de pontos de coleta está temporariamente indisponível. Tente novamente mais tarde.',
    )
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error(
      'O serviço retornou uma resposta inválida. Tente novamente mais tarde.',
    )
  }
  return normalizeOverpass(payload)
}
