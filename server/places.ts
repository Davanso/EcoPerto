import { isCoordinates } from '../src/domain/types/location.ts'

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
      throw new Error('Informe uma cidade ou bairro com 3 a 120 caracteres.')
    const cached = cache.get(key)
    if (cached) return cached
    if (busy || Date.now() - lastRequest < 1100)
      throw new Error('Aguarde um instante antes de buscar outra localidade.')
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
      if (!response.ok)
        throw new Error(
          'O serviço de localidades está indisponível. Você pode escolher a área no mapa.',
        )
      const data: unknown = await response.json()
      if (!Array.isArray(data))
        throw new Error('Resposta inválida do serviço de localidades.')
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
    } finally {
      busy = false
    }
  }
}
