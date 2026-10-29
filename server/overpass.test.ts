import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildQuery, createOverpassService } from './overpass.ts'

const center = { latitude: -23.55, longitude: -46.63 }
const good = () => new Response(JSON.stringify({ elements: [] }))
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('Overpass gateway', () => {
  it('validates coordinates/radii without accepting arbitrary queries', () => {
    expect(buildQuery(center, 10000)).toContain('around:10000,-23.550,-46.630')
    expect(() => buildQuery(center, 500000)).toThrow()
    expect(() => buildQuery({ latitude: 91, longitude: 0 })).toThrow()
  })
  it('falls back sequentially to another instance, then serves cached results', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 502 }))
      .mockResolvedValueOnce(good())
    const search = createOverpassService(fetcher)
    expect(await search(center)).toMatchObject({ freshness: 'live' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][0].host).not.toBe(
      fetcher.mock.calls[1][0].host,
    )
    expect(await search(center)).toMatchObject({ freshness: 'cache' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1][1].headers['User-Agent']).toContain('EcoPerto')
  })
  it('deduplicates simultaneous requests to the same area', async () => {
    let complete!: (value: Response) => void
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve
        }),
    )
    const search = createOverpassService(fetcher)
    const a = search(center),
      b = search(center)
    complete(good())
    await Promise.all([a, b])
    expect(fetcher).toHaveBeenCalledOnce()
  })
  it('does not mistake partial responses for empty results', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ elements: [], remark: 'timeout' })),
      )
      .mockResolvedValueOnce(good())
    expect(await createOverpassService(fetcher)(center)).toMatchObject({
      freshness: 'live',
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('retains a labelled stale result during an outage and pauses failing instances', async () => {
    vi.useFakeTimers()
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(good())
      .mockImplementation(async () => new Response('', { status: 429 }))
    const search = createOverpassService(fetcher)
    await search(center)
    vi.advanceTimersByTime(180001)
    expect(await search(center)).toMatchObject({ freshness: 'stale' })
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(await search(center)).toMatchObject({ freshness: 'stale' })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
  it('rejects genuine outages when no cached data exists', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('network'))
    await expect(createOverpassService(fetcher)(center)).rejects.toThrow(
      'indisponível',
    )
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
