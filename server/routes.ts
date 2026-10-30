import {
  isDrivingRoute,
  isRouteRequest,
  type DrivingRoute,
  type RouteRequest,
} from '../src/domain/types/route.ts'
import { distanceMeters } from '../src/domain/rules/distance.ts'
import { ApiError } from './errors.ts'

export function createRouteService(fetcher: typeof fetch = fetch) {
  let active = 0
  return async function calculate(
    input: RouteRequest,
    signal?: AbortSignal,
  ): Promise<DrivingRoute> {
    if (!isRouteRequest(input))
      throw new ApiError(
        400,
        'INVALID_ROUTE',
        'Informe uma origem e um destino válidos.',
      )
    if (distanceMeters(input.origin, input.destination) > 100000)
      throw new ApiError(
        400,
        'ROUTE_TOO_LONG',
        'Escolha uma origem a até 100 km do ecoponto.',
      )
    const key = process.env.ORS_API_KEY
    if (!key)
      throw new ApiError(
        503,
        'ROUTING_NOT_CONFIGURED',
        'O serviço de rotas ainda não está disponível. Você pode abrir a navegação externa.',
      )
    if (active >= 2)
      throw new ApiError(
        429,
        'ROUTING_BUSY',
        'Há outras rotas sendo calculadas. Aguarde alguns segundos.',
        5,
      )
    active++
    try {
      const response = await fetcher(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
          method: 'POST',
          headers: {
            Authorization: key,
            'Content-Type': 'application/json',
            Accept: 'application/geo+json',
            'User-Agent': 'EcoPerto/1.0 (+https://eco-perto.vercel.app)',
          },
          body: JSON.stringify({
            coordinates: [input.origin, input.destination].map((point) => [
              point.longitude,
              point.latitude,
            ]),
            instructions: false,
            radiuses: [500, 500],
          }),
          signal: AbortSignal.any([
            AbortSignal.timeout(15000),
            ...(signal ? [signal] : []),
          ]),
        },
      )
      if (response.status === 429)
        throw new ApiError(
          429,
          'ROUTING_QUOTA',
          'O serviço atingiu o limite de rotas. Tente mais tarde ou abra a navegação externa.',
          60,
        )
      if (response.status === 401 || response.status === 403)
        throw new ApiError(
          503,
          'ROUTING_UNAVAILABLE',
          'O serviço de rotas não está disponível. Abra a navegação externa ou tente mais tarde.',
        )
      const body = (await response.json().catch(() => {
        throw new ApiError(
          502,
          'INVALID_ROUTE_RESPONSE',
          'O serviço retornou uma rota inválida. Tente novamente.',
        )
      })) as {
        error?: { code?: number }
        features?: Array<{
          geometry?: { type?: string; coordinates?: unknown }
          properties?: { summary?: { distance?: number; duration?: number } }
        }>
      }
      if ([2009, 2010].includes(body?.error?.code ?? -1))
        throw new ApiError(
          404,
          'ROUTE_NOT_FOUND',
          'Não foi encontrada uma rota de carro entre estes locais. Tente uma origem em uma rua próxima.',
        )
      if (!response.ok)
        throw new ApiError(
          503,
          'ROUTING_UNAVAILABLE',
          'O serviço de rotas não respondeu. Tente novamente ou abra a navegação externa.',
        )
      const feature = body?.features?.[0]
      const route = {
        coordinates: feature?.geometry?.coordinates,
        distanceMeters: feature?.properties?.summary?.distance,
        durationSeconds: feature?.properties?.summary?.duration,
      }
      if (feature?.geometry?.type !== 'LineString' || !isDrivingRoute(route))
        throw new ApiError(
          502,
          'INVALID_ROUTE_RESPONSE',
          'O serviço retornou uma rota inválida. Tente novamente.',
        )
      return route
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (signal?.aborted) throw error
      throw new ApiError(
        503,
        'ROUTING_UNAVAILABLE',
        'Não foi possível conectar ao serviço de rotas. Tente novamente.',
      )
    } finally {
      active--
    }
  }
}
