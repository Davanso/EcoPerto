import { isCoordinates, type UserLocation } from '@/domain/types/location'

export async function requestLocation(
  signal?: AbortSignal,
): Promise<UserLocation> {
  signal?.throwIfAborted()
  if (!window.isSecureContext || !navigator.geolocation)
    throw new Error(
      'A localização não está disponível neste navegador. Busque por cidade ou escolha uma área no mapa.',
    )

  return new Promise((resolve, reject) => {
    let finished = false
    let retried = false
    const finish = (error?: Error, location?: UserLocation) => {
      if (finished) return
      finished = true
      clearTimeout(watchdog)
      signal?.removeEventListener('abort', abort)
      if (error) reject(error)
      else resolve(location!)
    }
    const abort = () =>
      finish(new DOMException('Busca cancelada.', 'AbortError'))
    const unavailable =
      'Não foi possível determinar sua localização. Ative a localização do sistema e permita o acesso nas configurações do navegador. Você também pode buscar por cidade.'
    const watchdog = setTimeout(
      () =>
        finish(
          new Error(
            'Este navegador não respondeu à solicitação de localização. Tente abrir o site no Chrome, Edge ou Safari, ou busque por cidade abaixo.',
          ),
        ),
      20000,
    )
    signal?.addEventListener('abort', abort, { once: true })
    const success = ({ coords }: GeolocationPosition) => {
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
        finish(new Error(unavailable))
        return
      }
      finish(undefined, location)
    }
    const failure = (error: GeolocationPositionError) => {
      if (finished) return
      if (error.code === 1) {
        finish(
          new Error(
            'Permissão de localização negada. Libere a localização nas configurações deste site e do sistema, ou busque por cidade abaixo.',
          ),
        )
        return
      }
      if (!retried) {
        retried = true
        navigator.geolocation.getCurrentPosition(success, failure, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
        return
      }
      finish(
        new Error(
          error.code === 3
            ? 'A localização demorou mais que o esperado. Este navegador pode não ter acesso ao serviço de localização. Tente outro navegador ou busque por cidade abaixo.'
            : unavailable,
        ),
      )
    }
    try {
      navigator.geolocation.getCurrentPosition(success, failure, {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000,
      })
    } catch {
      finish(new Error(unavailable))
    }
  })
}
