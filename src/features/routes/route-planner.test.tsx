// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { RoutePlanner } from './route-planner'
import type { useRoutePlanner } from './use-route-planner'

vi.mock('@/features/location/place-search', () => ({
  PlaceSearch: ({ onSelect }: { onSelect: (place: unknown) => void }) => (
    <button
      onClick={() =>
        onSelect({
          id: 'test:origin',
          name: 'Origem de teste',
          latitude: -23.09,
          longitude: -47.218,
        })
      }
    >
      Selecionar origem de teste
    </button>
  ),
}))
afterEach(cleanup)
it('keeps origin options collapsed and closes them after choosing an address', async () => {
  const planner: ReturnType<typeof useRoutePlanner> = {
    status: 'idle',
    route: undefined,
    error: undefined,
    manualOrigin: undefined,
    deviceLocation: undefined,
    calculate: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
    chooseOrigin: vi.fn(),
  }
  render(
    <RoutePlanner
      destination={{
        id: 'test:point',
        name: 'Ecoponto de teste',
        source: 'osm',
        latitude: -23.1,
        longitude: -47.2,
      }}
      planner={planner}
    />,
  )
  const summary = screen.getByText('De: Minha localização').closest('summary')!
  const details = summary.closest('details')!
  expect(details.open).toBe(false)
  fireEvent.click(summary)
  await waitFor(() => expect(details.open).toBe(true))
  fireEvent.click(
    screen.getByRole('button', { name: 'Selecionar origem de teste' }),
  )
  await waitFor(() => expect(details.open).toBe(false))
  expect(planner.chooseOrigin).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Traçar rota de carro' }))
  expect(planner.calculate).toHaveBeenCalledOnce()
})
