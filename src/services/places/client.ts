import { isCoordinates, type Coordinates } from '@/domain/types/location'

export type Place = Coordinates & { id: string; name: string }

export async function searchPlaces(
  query: string,
  signal: AbortSignal,
): Promise<Place[]> {
  const response = await fetch(
    `/api/places?${new URLSearchParams({ q: query })}`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]) },
  )
  const payload = await response.json()
  if (!response.ok)
    throw new Error(payload.error || 'Não foi possível buscar essa localidade.')
  if (!Array.isArray(payload.places))
    throw new Error('Resposta inválida do serviço de localidades.')
  return payload.places.filter(
    (place: Place) =>
      typeof place.name === 'string' &&
      typeof place.id === 'string' &&
      isCoordinates(place),
  )
}
