// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { createPointIcon } from './point-icon'

it('uses identical geometry and anchors for origin and destination pins', () => {
  const origin = createPointIcon('A', { origin: true })
  const destination = createPointIcon(1)
  expect(origin.options.iconSize).toEqual(destination.options.iconSize)
  expect(origin.options.iconAnchor).toEqual(destination.options.iconAnchor)
  expect(origin.options.popupAnchor).toEqual(destination.options.popupAnchor)
  expect(origin.options.html).toContain('ecopoint-marker-body')
  expect(origin.options.className).toContain('is-origin')
})
