// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRoutePlanner } from './use-route-planner'
import { requestLocation } from '@/features/location/geolocation'
import { calculateRoute } from '@/services/routes/client'
import type { Ecopoint } from '@/domain/types/ecopoint'
import type { DrivingRoute } from '@/domain/types/route'

vi.mock('@/services/routes/client', () => ({ calculateRoute: vi.fn() }))
vi.mock('@/features/location/geolocation', () => ({ requestLocation: vi.fn() }))
const api = vi.mocked(calculateRoute)
const gps = vi.mocked(requestLocation)
const destination: Ecopoint = {
  id: 'test:ecopoint',
  name: 'Ecoponto de teste',
  latitude: -23.107,
  longitude: -47.208,
  source: 'osm',
}
const route: DrivingRoute = {
  coordinates: [
    [-47.218, -23.09],
    [-47.208, -23.107],
  ],
  distanceMeters: 2800,
  durationSeconds: 480,
}
beforeEach(() => {
  vi.resetAllMocks()
  api.mockResolvedValue(route)
})
afterEach(cleanup)

it('only requests GPS after an explicit action and plans from the rounded mocked device location', async () => {
  gps.mockResolvedValue({
    latitude: -23.0908356,
    longitude: -47.2180677,
    accuracyMeters: 25,
  })
  const { result } = renderHook(() => useRoutePlanner(destination))
  expect(gps).not.toHaveBeenCalled()
  expect(api).not.toHaveBeenCalled()
  await act(() => result.current.calculate())
  expect(api.mock.calls[0][0].origin).toEqual({
    latitude: -23.091,
    longitude: -47.218,
    accuracyMeters: 125,
  })
  expect(result.current.route).toMatchObject({
    fromDevice: true,
    destination,
    distanceMeters: 2800,
  })
})
it('uses a manually chosen origin without treating it as a personal position or requesting GPS', async () => {
  const { result } = renderHook(() => useRoutePlanner(destination))
  act(() =>
    result.current.chooseOrigin({
      id: 'test:origin',
      name: 'Origem de teste',
      latitude: -23.09,
      longitude: -47.218,
    }),
  )
  await act(() => result.current.calculate())
  expect(gps).not.toHaveBeenCalled()
  expect(result.current.route).toMatchObject({
    fromDevice: false,
    originLabel: 'Origem de teste',
  })
})
it('does not show a route when device permission is denied', async () => {
  gps.mockRejectedValue(new Error('Permissão negada'))
  const { result } = renderHook(() => useRoutePlanner(destination))
  await act(() => result.current.calculate())
  expect(result.current.error).toBe('Permissão negada')
  expect(result.current.route).toBeUndefined()
  expect(api).not.toHaveBeenCalled()
})
it('cancels late responses and immediately hides a route when the destination changes', async () => {
  let complete!: (value: DrivingRoute) => void
  api.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve
      }),
  )
  const location = { latitude: -23.09, longitude: -47.218, accuracyMeters: 20 }
  const { result, rerender } = renderHook(
    ({ point }) => useRoutePlanner(point, location),
    { initialProps: { point: destination } },
  )
  let pending!: Promise<void>
  act(() => {
    pending = result.current.calculate()
  })
  rerender({ point: { ...destination, id: 'test:other' } })
  await act(async () => {
    complete(route)
    await pending
  })
  expect(result.current.route).toBeUndefined()
  expect(result.current.status).toBe('idle')
  act(() => {
    pending = result.current.calculate()
  })
  act(() => result.current.clear())
  await act(async () => {
    complete(route)
    await pending
  })
  expect(result.current.route).toBeUndefined()
  expect(result.current.status).toBe('idle')
})

it('never resurrects an old route when returning to a previous destination', async () => {
  const location = { latitude: -23.09, longitude: -47.218, accuracyMeters: 20 }
  const { result, rerender } = renderHook(
    ({ point }) => useRoutePlanner(point, location),
    { initialProps: { point: destination } },
  )
  await act(() => result.current.calculate())
  expect(result.current.route).toBeDefined()
  rerender({ point: { ...destination, id: 'test:other' } })
  rerender({ point: destination })
  expect(result.current.route).toBeUndefined()
})
