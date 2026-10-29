import { isCoordinates, type UserLocation } from '@/domain/types/location'

export async function requestLocation(): Promise<UserLocation> {
  if (!window.isSecureContext || !navigator.geolocation) {
    throw new Error(
      'A localização não está disponível neste navegador. Escolha uma área no mapa para buscar.',
    )
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
        }
        if (
          !isCoordinates(location) ||
          !Number.isFinite(coords.accuracy) ||
          coords.accuracy < 0
        ) {
          reject(
            new Error(
              'O dispositivo retornou uma localização inválida. Escolha uma área no mapa.',
            ),
          )
          return
        }
        resolve(location)
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Permissão de localização negada. Você pode escolher uma área no mapa e buscar sem compartilhar sua localização.',
          2: 'O dispositivo não conseguiu determinar sua localização. Escolha uma área no mapa ou tente novamente.',
          3: 'A localização demorou mais que o esperado. Escolha uma área no mapa ou tente novamente.',
        }
        reject(
          new Error(
            messages[error.code] ||
              'Não foi possível obter sua localização. Escolha uma área no mapa.',
          ),
        )
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 0 },
    )
  })
}
