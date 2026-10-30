// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MapController } from './map-controller'

const camera = vi.hoisted(() => ({
  fitBounds: vi.fn(),
  setView: vi.fn(),
  invalidateSize: vi.fn(),
  getContainer: () => document.createElement('div'),
}))
vi.mock('react-leaflet', () => ({
  useMap: () => camera,
  useMapEvents: vi.fn(),
}))
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const focus = { latitude: -23.09, longitude: -47.218 }
const points = [
  {
    id: 'official:1',
    name: 'Coleta',
    source: 'official' as const,
    latitude: -23.1,
    longitude: -47.22,
  },
]
const userLocation = {
  latitude: -23.075,
  longitude: -47.205,
  accuracyMeters: 150,
}

it('includes the user position when results fit the map, including after a refresh', () => {
  const props = {
    focus,
    points,
    userLocation,
    fitVersion: 0,
    recenterVersion: 0,
    onViewportChange: vi.fn(),
  }
  const view = render(<MapController {...props} />)
  expect(
    camera.fitBounds.mock.calls
      .at(-1)![0]
      .contains([userLocation.latitude, userLocation.longitude]),
  ).toBe(true)
  view.rerender(<MapController {...props} points={[...points]} />)
  expect(
    camera.fitBounds.mock.calls
      .at(-1)![0]
      .contains([userLocation.latitude, userLocation.longitude]),
  ).toBe(true)
})
it('centers on the device without making a new location or search request', () => {
  const props = {
    focus,
    points,
    userLocation,
    fitVersion: 0,
    recenterVersion: 0,
    onViewportChange: vi.fn(),
  }
  const view = render(<MapController {...props} />)
  view.rerender(<MapController {...props} recenterVersion={1} />)
  expect(camera.setView).toHaveBeenLastCalledWith(
    [userLocation.latitude, userLocation.longitude],
    16,
    { animate: false },
  )
  view.rerender(<MapController {...props} recenterVersion={1} fitVersion={1} />)
  expect(
    camera.fitBounds.mock.calls
      .at(-1)![0]
      .contains([userLocation.latitude, userLocation.longitude]),
  ).toBe(true)
})
it('moves to a newly searched region while the old results are still loading', () => {
  const props = {
    focus,
    points,
    fitVersion: 0,
    recenterVersion: 0,
    onViewportChange: vi.fn(),
  }
  const view = render(<MapController {...props} />)
  view.rerender(
    <MapController {...props} focus={{ latitude: -22.9, longitude: -47.1 }} />,
  )
  expect(camera.setView).toHaveBeenLastCalledWith([-22.9, -47.1], 13, {
    animate: false,
  })
})

it('expands the camera bounds with the selected radius even when points do not change', () => {
  const props = {
    focus,
    points,
    fitVersion: 0,
    recenterVersion: 0,
    onViewportChange: vi.fn(),
  }
  const view = render(<MapController {...props} radius={5000} />)
  const small = camera.fitBounds.mock.calls.at(-1)![0]
  view.rerender(<MapController {...props} radius={20000} />)
  const large = camera.fitBounds.mock.calls.at(-1)![0]
  expect(large.getNorth() - large.getSouth()).toBeGreaterThan(
    (small.getNorth() - small.getSouth()) * 3,
  )
  expect(large.contains(small)).toBe(true)
})
