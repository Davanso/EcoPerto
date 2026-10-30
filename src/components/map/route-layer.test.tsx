// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { RouteLayer } from './route-layer'
import type { PlannedRoute } from '@/features/routes/use-route-planner'

const camera = vi.hoisted(() => ({ fitBounds: vi.fn(), closePopup: vi.fn() }))
const line = vi.hoisted(() => vi.fn())
vi.mock('react-leaflet', () => ({
  useMap: () => camera,
  Marker: () => null,
  Popup: () => null,
  Polyline: (props: unknown) => {
    line(props)
    return null
  },
}))
afterEach(cleanup)
it('draws street geometry in Leaflet coordinate order and frames the full route, origin and destination', () => {
  const route: PlannedRoute = {
    coordinates: [
      [-47.218, -23.09],
      [-47.22, -23.095],
      [-47.208, -23.107],
    ],
    origin: { latitude: -23.089, longitude: -47.218, accuracyMeters: 100 },
    destination: {
      id: 'test:point',
      name: 'Destino',
      source: 'osm',
      latitude: -23.108,
      longitude: -47.208,
    },
    originLabel: 'Origem de teste',
    fromDevice: true,
    distanceMeters: 3400,
    durationSeconds: 330,
  }
  const view = render(<RouteLayer route={route} fitVersion={0} />)
  expect(line.mock.calls[0][0].positions).toEqual([
    [-23.09, -47.218],
    [-23.095, -47.22],
    [-23.107, -47.208],
  ])
  const bounds = camera.fitBounds.mock.calls.at(-1)![0]
  expect(bounds.contains([route.origin.latitude, route.origin.longitude])).toBe(
    true,
  )
  expect(
    bounds.contains([route.destination.latitude, route.destination.longitude]),
  ).toBe(true)
  view.rerender(<RouteLayer route={route} fitVersion={1} />)
  expect(camera.fitBounds).toHaveBeenCalledTimes(2)
})
