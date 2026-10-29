import { afterEach, expect, it, vi } from 'vitest'
import { createPlaceService } from './places.ts'

afterEach(() => vi.useRealTimers())
it('caches explicit searches and enforces the upstream rate limit', async () => {
  vi.useFakeTimers()
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify([
        {
          osm_type: 'relation',
          osm_id: 1,
          display_name: 'Campinas, São Paulo',
          lat: '-22.9',
          lon: '-47.06',
        },
      ]),
    ),
  )
  const search = createPlaceService(fetcher)
  expect(await search('Campinas')).toHaveLength(1)
  expect(await search('campinas')).toHaveLength(1)
  expect(fetcher).toHaveBeenCalledOnce()
  await expect(search('Santos')).rejects.toThrow('Aguarde')
  await expect(search('xx')).rejects.toThrow('3 a 120')
})
