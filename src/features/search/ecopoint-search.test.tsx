// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { EcopointSearch } from './ecopoint-search'

const search = vi.hoisted(() => vi.fn())
const center = vi.hoisted(() => ({ latitude: -22.905, longitude: -47.061 }))
vi.mock('./use-ecopoint-search', () => ({
  useEcopointSearch: () => ({
    status: 'success',
    points: [],
    focus: center,
    center,
    radius: 5000,
    label: 'Campinas',
    result: { freshness: 'live' },
    search,
    cancel: vi.fn(),
  }),
}))
vi.mock('@/components/map/ecopoint-map', () => ({
  default: () => <div>Mapa</div>,
}))
vi.mock('@/features/location/location-access', () => ({
  readLocationAccess: async () => 'unknown',
  LOCATION_ACCESS_MESSAGES: { unknown: 'Localização não obtida' },
}))
afterEach(cleanup)

it('searches the same area immediately when the selected radius changes', async () => {
  render(<EcopointSearch />)
  await screen.findByText('Mapa')
  fireEvent.change(screen.getByLabelText('Raio de busca'), {
    target: { value: '20000' },
  })
  expect(search).toHaveBeenCalledExactlyOnceWith(center, 20000, 'Campinas')
  expect(
    (screen.getByLabelText('Raio de busca') as HTMLSelectElement).value,
  ).toBe('20000')
})
