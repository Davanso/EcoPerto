import { isCoordinates, type Coordinates } from './location.ts'

export type RouteRequest = { origin: Coordinates; destination: Coordinates }
export type DrivingRoute = {
  coordinates: [number, number][] // GeoJSON order: longitude, latitude.
  distanceMeters: number
  durationSeconds: number
}

export function isRouteRequest(value: unknown): value is RouteRequest {
  if (!value || typeof value !== 'object') return false
  const route = value as RouteRequest
  return (
    !!route.origin &&
    !!route.destination &&
    isCoordinates(route.origin) &&
    isCoordinates(route.destination)
  )
}

export function isDrivingRoute(value: unknown): value is DrivingRoute {
  if (!value || typeof value !== 'object') return false
  const route = value as DrivingRoute
  return (
    Number.isFinite(route.distanceMeters) &&
    route.distanceMeters >= 0 &&
    Number.isFinite(route.durationSeconds) &&
    route.durationSeconds >= 0 &&
    Array.isArray(route.coordinates) &&
    route.coordinates.length >= 2 &&
    route.coordinates.length <= 100000 &&
    route.coordinates.every(
      (position) =>
        Array.isArray(position) &&
        position.length === 2 &&
        isCoordinates({ latitude: position[1], longitude: position[0] }),
    )
  )
}
