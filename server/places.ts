import { isCoordinates } from '../src/domain/types/location.ts'
import { ApiError } from './errors.ts'

export type Place = {
  id: string
  name: string
  latitude: number
  longitude: number
}

/** Explicit searches only; serialized per process, cached and limited to one upstream call/second. */
export function createPlaceService(fetcher: typeof fetch = fetch) {
  const cache = new Map<string, Place[]>()
  let lastRequest = 0
  let busy = false
  return async function search(query: string): Promise<Place[]> {
    const key = query.trim().toLocaleLowerCase('pt-BR')
    if (key.length < 3 || key.length > 120)
      throw new ApiError(
        400,
        'INVALID_PLACE_QUERY',
        'Informe uma cidade ou bairro com 3 a 120 caracteres.',
      )
    const cached = cache.get(key)
    if (cached) return cached
    if (busy || Date.now() - lastRequest < 1100)
      throw new ApiError(
        429,
        'PLACE_RATE_LIMITED',
        'Aguarde um instante antes de buscar outra localidade.',
        2,
      )
    busy = true
    lastRequest = Date.now()
    try {
      const url = new URL(
        process.env.NOMINATIM_URL ||
          'https://nominatim.openstreetmap.org/search',
      )
      url.search = new URLSearchParams({
        q: query.trim(),
        format: 'jsonv2',
        limit: '5',
        'accept-language': 'pt-BR',
      }).toString()
      const response = await fetcher(url, {
        headers: {
          'User-Agent': 'EcoPerto/0.1 (+https://github.com/Davanso/EcoPerto)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        console.warn(
          JSON.stringify({
            event: 'places_failure',
            provider: url.hostname,
            reason: 'http',
            status: response.status,
          }),
        )
        throw new ApiError(
          response.status === 429 ? 429 : 503,
          response.status === 429
            ? 'PLACE_RATE_LIMITED'
            : 'PLACE_PROVIDER_UNAVAILABLE',
          'O serviço de localidades está indisponível. Você pode escolher a área no mapa.',
          response.status === 429 ? 60 : undefined,
        )
      }
      const data: unknown = await response.json()
      if (!Array.isArray(data))
        throw new ApiError(
          502,
          'PLACE_INVALID_RESPONSE',
          'O serviço de localidades retornou uma resposta inválida.',
        )
      const places: Place[] = data.flatMap((value) => {
        if (
          !value ||
          typeof value !== 'object' ||
          typeof value.display_name !== 'string' ||
          !value.lat ||
          !value.lon
        )
          return []
        const point = {
          latitude: Number(value.lat),
          longitude: Number(value.lon),
        }
        return isCoordinates(point)
          ? [
              {
                id: `${value.osm_type}:${value.osm_id}`,
                name: value.display_name,
                ...point,
              },
            ]
          : []
      })
      if (cache.size >= 100) cache.delete(cache.keys().next().value!)
      const unique = [
        ...new Map(
          places.map((place) => [
            `${place.name}|${place.latitude}|${place.longitude}`,
            place,
          ]),
        ).values(),
      ]
      cache.set(key, unique)
      return unique
    } catch (error) {
      if (error instanceof ApiError) throw error
      const timeout = error instanceof Error && error.name === 'TimeoutError'
      console.warn(
        JSON.stringify({
          event: 'places_failure',
          reason: timeout ? 'timeout' : 'network_or_payload',
        }),
      )
      throw new ApiError(
        timeout ? 504 : 503,
        timeout ? 'PLACE_TIMEOUT' : 'PLACE_PROVIDER_UNAVAILABLE',
        'Não foi possível consultar localidades agora. Tente novamente ou escolha a área no mapa.',
      )
    } finally {
      busy = false
    }
  }
}
