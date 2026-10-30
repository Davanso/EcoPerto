import type { IncomingMessage, ServerResponse } from 'node:http'
import { RADII } from './overpass.ts'
import { createEcopointService } from './ecopoints.ts'
import { ApiError } from './errors.ts'
import { randomUUID } from 'node:crypto'
import { createPlaceService } from './places.ts'
import { isCoordinates } from '../src/domain/types/location.ts'

type Services = {
  searchPoints: ReturnType<typeof createEcopointService>
  searchPlaces: ReturnType<typeof createPlaceService>
}

export function createApiHandler(
  services: Services = {
    searchPoints: createEcopointService(),
    searchPlaces: createPlaceService(),
  },
) {
  return async function handleApi(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    const requestId = randomUUID()
    res.setHeader('X-Request-Id', requestId)
    if (req.method !== 'GET') {
      res
        .writeHead(405, { Allow: 'GET' })
        .end(JSON.stringify({ error: 'Método não permitido.' }))
      return
    }
    const url = new URL(req.url || '/', 'http://localhost')
    try {
      if (url.pathname === '/api/ecopoints') {
        const latitude = url.searchParams.get('lat')
        const longitude = url.searchParams.get('lon')
        const center = {
          latitude: Number(latitude),
          longitude: Number(longitude),
        }
        const radius = Number(url.searchParams.get('radius') || 5000)
        if (
          !latitude ||
          !longitude ||
          !isCoordinates(center) ||
          !RADII.includes(radius as (typeof RADII)[number])
        ) {
          res
            .writeHead(400)
            .end(JSON.stringify({ error: 'Coordenadas ou raio inválidos.' }))
          return
        }
        const started = Date.now()
        const result = await services.searchPoints(center, radius)
        res.setHeader(
          'Cache-Control',
          result.freshness === 'official'
            ? 'public, max-age=30, s-maxage=60'
            : 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
        )
        console.info(
          JSON.stringify({
            event: 'ecopoints_success',
            requestId,
            elapsedMs: Date.now() - started,
            count: result.points.length,
            freshness: result.freshness,
          }),
        )
        res.end(JSON.stringify(result))
      } else if (url.pathname === '/api/places') {
        const query = url.searchParams.get('q')?.trim() || ''
        if (query.length < 3 || query.length > 120) {
          res.writeHead(400).end(
            JSON.stringify({
              error: 'Informe uma cidade ou bairro com 3 a 120 caracteres.',
            }),
          )
          return
        }
        res.end(JSON.stringify({ places: await services.searchPlaces(query) }))
      } else {
        res
          .writeHead(404)
          .end(JSON.stringify({ error: 'Recurso não encontrado.' }))
      }
    } catch (error) {
      const known = error instanceof ApiError
      console.error(
        JSON.stringify({
          event: 'api_failure',
          requestId,
          route: url.pathname,
          code: known ? error.code : 'INTERNAL_ERROR',
        }),
      )
      if (known && error.retryAfterSeconds)
        res.setHeader('Retry-After', error.retryAfterSeconds)
      res.writeHead(known ? error.status : 500).end(
        JSON.stringify({
          code: known ? error.code : 'INTERNAL_ERROR',
          error: known
            ? error.message
            : 'Ocorreu um erro interno. Tente novamente mais tarde.',
          requestId,
        }),
      )
    }
  }
}

export default createApiHandler()
