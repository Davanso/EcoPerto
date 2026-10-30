// @vitest-environment jsdom
import { forwardRef, useImperativeHandle, type ReactNode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PointMarker } from './point-marker'

const closePopup = vi.hoisted(() => vi.fn())
vi.mock('react-leaflet', () => ({
  useMap: () => ({}),
  Marker: forwardRef<unknown, { children: ReactNode }>(({ children }, ref) => {
    useImperativeHandle(ref, () => ({ closePopup }))
    return <div>{children}</div>
  }),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
afterEach(cleanup)
it('closes the point popup before opening the in-app route planner', () => {
  const onRoute = vi.fn(() => expect(closePopup).toHaveBeenCalledOnce())
  render(
    <PointMarker
      point={{
        id: 'test:point',
        name: 'Destino',
        latitude: -23.1,
        longitude: -47.2,
        source: 'osm',
      }}
      number={1}
      selected={false}
      onSelect={vi.fn()}
      onRoute={onRoute}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Traçar rota no app' }))
  expect(onRoute).toHaveBeenCalledWith('test:point')
})
