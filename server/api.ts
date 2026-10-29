import type { IncomingMessage, ServerResponse } from 'node:http'
import { createOverpassService, RADII } from './overpass.ts'
import { createPlaceService } from './places.ts'
import { isCoordinates } from '../src/domain/types/location.ts'

const searchPoints = createOverpassService()
const searchPlaces = createPlaceService()

export default async function handleApi(
  req: IncomingMessage,
  res: ServerResponse,
) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
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
      res.end(JSON.stringify(await searchPoints(center, radius)))
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
      res.end(JSON.stringify({ places: await searchPlaces(query) }))
    } else {
      res
        .writeHead(404)
        .end(JSON.stringify({ error: 'Recurso não encontrado.' }))
    }
  } catch (error) {
    res.writeHead(503).end(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'O serviço não está disponível agora.',
      }),
    )
  }
}
