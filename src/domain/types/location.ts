export type Coordinates = { latitude: number; longitude: number }

export type UserLocation = Coordinates & { accuracyMeters: number }

export const PILOT_LOCATION: Coordinates = {
  latitude: -23.55052,
  longitude: -46.633308,
}

export function isCoordinates(value: Coordinates): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180
  )
}
