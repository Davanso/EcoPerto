import { expect, it, vi } from 'vitest'
import { createEcopointService } from './ecopoints.ts'
import { PILOT_LOCATION } from '../src/domain/types/location.ts'

it('serves municipal points as a successful API result without depending on Overpass', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('upstream unavailable'))
  const result = await createEcopointService(fetcher)(PILOT_LOCATION, 5000)
  expect(result.points).toHaveLength(4)
  expect(result.freshness).toBe('official')
  expect(fetcher).not.toHaveBeenCalled()
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
