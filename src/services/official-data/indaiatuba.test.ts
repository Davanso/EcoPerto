import { expect, it } from 'vitest'
import { INDAIATUBA_ECOPOINTS, searchOfficialPoints } from './indaiatuba'
import { PILOT_LOCATION } from '@/domain/types/location'

it('provides four traced municipal points within 5 km of Indaiatuba center', () => {
  const points = searchOfficialPoints(PILOT_LOCATION, 5000)
  expect(points).toHaveLength(4)
  expect(new Set(points.map((point) => point.id)).size).toBe(4)
  for (const point of points) {
    expect(point.source).toBe('official')
    expect(point.sourceUrl).toContain('indaiatuba.sp.gov.br')
    expect(point.coordinateSourceUrl).toContain('mapa.abrecon.org.br/ecoponto/')
    expect(point.lastVerifiedAt).toBe('2026-10-29')
  }
})
it('never leaks municipal points into unrelated areas or invents extra coverage', () => {
  expect(searchOfficialPoints({ latitude: 0, longitude: 0 }, 20000)).toEqual([])
  expect(searchOfficialPoints(PILOT_LOCATION, 100)).toEqual([])
  expect(INDAIATUBA_ECOPOINTS).toHaveLength(4)
})
