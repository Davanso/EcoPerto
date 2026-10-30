import { expect, it, vi } from 'vitest'
import { createEcopointService } from './ecopoints.ts'
import { PILOT_LOCATION } from '../src/domain/types/location.ts'

it('keeps municipal points with an explicit warning when the collaborative source fails', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('upstream unavailable'))
  const result = await createEcopointService(fetcher)(PILOT_LOCATION, 5000)
  expect(result.points).toHaveLength(4)
  expect(result.freshness).toBe('official')
  expect(fetcher).toHaveBeenCalled()
  expect(result.warning).toContain('somente os pontos municipais')
})
it('supplements the global search instead of hiding OSM points inside municipal coverage', async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        elements: [
          {
            type: 'node',
            id: 123,
            lat: -23.09,
            lon: -47.218,
            tags: { amenity: 'recycling' },
          },
        ],
      }),
    ),
  )
  const result = await createEcopointService(fetcher)(PILOT_LOCATION, 5000)
  expect(result.points).toHaveLength(5)
  expect(result.points.some((point) => point.id === 'osm:node:123')).toBe(true)
  expect(result.freshness).toBe('live')
})
it('returns normalized OSM records for regions without a municipal adapter', async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        elements: [
          {
            type: 'node',
            id: 1,
            lat: -23.55,
            lon: -46.63,
            tags: { amenity: 'recycling' },
          },
        ],
      }),
    ),
  )
  const result = await createEcopointService(fetcher)(
    { latitude: -23.55, longitude: -46.63 },
    5000,
  )
  expect(result.points).toMatchObject([{ id: 'osm:node:1', source: 'osm' }])
  expect(result.freshness).toBe('live')
})
it('does not turn missing coverage or provider outages into an invented empty success', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const fetcher = vi.fn().mockRejectedValue(new TypeError('network'))
  await expect(
    createEcopointService(fetcher)({ latitude: 0, longitude: 0 }, 5000),
  ).rejects.toMatchObject({
    status: 503,
    code: 'ECOPOINTS_PROVIDER_UNAVAILABLE',
    retryAfterSeconds: 60,
  })
})
