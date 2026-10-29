// @vitest-environment jsdom
import { StrictMode, type ReactNode } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useEcopointSearch } from './use-ecopoint-search'
import { searchEcopoints, type SearchResult } from '@/services/overpass/client'
import { requestLocation } from '@/features/location/geolocation'

vi.mock('@/services/overpass/client', () => ({ searchEcopoints: vi.fn() }))
vi.mock('@/features/location/geolocation', () => ({ requestLocation: vi.fn() }))
const api = vi.mocked(searchEcopoints)
const location = vi.mocked(requestLocation)
beforeEach(() => {
  vi.resetAllMocks()
  api.mockImplementation(() => new Promise(() => {}))
})
afterEach(cleanup)

it('shows real dated pilot points immediately and starts exactly one refresh in StrictMode', async () => {
  const { result } = renderHook(useEcopointSearch, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    ),
  })
  expect(result.current.points.length).toBeGreaterThan(0)
  expect(result.current.result.freshness).toBe('official')
  expect(location).not.toHaveBeenCalled()
  await waitFor(() => expect(api).toHaveBeenCalledOnce())
})

it('keeps existing points when refresh or device location fails', async () => {
  const { result } = renderHook(useEcopointSearch)
  await waitFor(() => expect(api).toHaveBeenCalledOnce())
  const points = result.current.points
  api.mockRejectedValueOnce(new Error('offline'))
  await act(() =>
    result.current.search({ latitude: -23.55, longitude: -46.63 }),
  )
  expect(result.current.errorKind).toBe('service')
  expect(result.current.points).toBe(points)
  location.mockRejectedValueOnce(new Error('negada'))
  await act(() => result.current.search())
  expect(result.current.errorKind).toBe('location')
  expect(result.current.points).toBe(points)
})

it('centers a granted approximate position, normalizes distance and removes out-of-radius points', async () => {
  const { result } = renderHook(useEcopointSearch)
  await waitFor(() => expect(api).toHaveBeenCalledOnce())
  location.mockResolvedValueOnce({
    latitude: -22.905639,
    longitude: -47.059564,
    accuracyMeters: 30,
  })
  api.mockResolvedValueOnce({
    freshness: 'live',
    fetchedAt: '2026-10-29',
    points: [
      {
        id: 'osm:node:1',
        name: 'Perto',
        source: 'osm',
        latitude: -22.906,
        longitude: -47.06,
      },
      {
        id: 'osm:node:2',
        name: 'Longe',
        source: 'osm',
        latitude: 0,
        longitude: 0,
      },
    ],
  })
  await act(() => result.current.search())
  expect(result.current.userLocation).toMatchObject({
    latitude: -22.906,
    longitude: -47.06,
    accuracyMeters: 130,
  })
  expect(result.current.points.map((point) => point.name)).toEqual(['Perto'])
  expect(result.current.label).toBe('Perto da sua localização')
})

it('ignores stale responses after cancel or a newer search', async () => {
  let complete!: (result: SearchResult) => void
  const { result } = renderHook(useEcopointSearch)
  await waitFor(() => expect(api).toHaveBeenCalledOnce())
  api.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve
      }),
  )
  let pending!: Promise<void>
  act(() => {
    pending = result.current.search({ latitude: 1, longitude: 1 })
  })
  act(() => result.current.cancel())
  complete({ freshness: 'live', fetchedAt: '2026-10-29', points: [] })
  await act(() => pending)
  expect(result.current.points.length).toBeGreaterThan(0)
  expect(result.current.label).toContain('Indaiatuba')
  expect(result.current.status).toBe('idle')
})
