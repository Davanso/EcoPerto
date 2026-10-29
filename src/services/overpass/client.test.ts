import { afterEach, expect, it, vi } from 'vitest'
import { searchEcopoints } from './client'
import { PILOT_LOCATION } from '@/domain/types/location'

const center = { latitude: -23.55052, longitude: -46.633308 }
afterEach(() => vi.unstubAllGlobals())

it('returns traced Indaiatuba points during an actual upstream outage, labelled as municipal data', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'upstream unavailable' }), {
        status: 503,
      }),
    ),
  )
  const result = await searchEcopoints(
    PILOT_LOCATION,
    new AbortController().signal,
  )
  expect(result.points).toHaveLength(4)
  expect(result.freshness).toBe('official')
  expect(result.warning).toContain('indisponível')
  expect(result.points.every((point) => point.source === 'official')).toBe(true)
})

it('uses the same-origin API, approximate coordinates and requested radius', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { elements: [] },
        fetchedAt: '2026-10-29',
        freshness: 'live',
      }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)
  expect(
    await searchEcopoints(center, new AbortController().signal, 10000),
  ).toMatchObject({ points: [], freshness: 'live' })
  const url = new URL(fetchMock.mock.calls[0][0], 'http://localhost')
  expect(url.pathname).toBe('/api/ecopoints')
  expect(url.searchParams.get('lat')).toBe('-23.551')
  expect(url.searchParams.get('radius')).toBe('10000')
})
it('rejects invalid coordinates and excessive radius before sending', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  await expect(
    searchEcopoints(
      { latitude: NaN, longitude: 0 },
      new AbortController().signal,
    ),
  ).rejects.toThrow('inválida')
  await expect(
    searchEcopoints(center, new AbortController().signal, 99999),
  ).rejects.toThrow('inválida')
  expect(fetchMock).not.toHaveBeenCalled()
})
it('preserves meaningful server error messages', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'Tente atualizar em um minuto.' }),
          { status: 503 },
        ),
      ),
  )
  await expect(
    searchEcopoints(center, new AbortController().signal),
  ).rejects.toThrow('um minuto')
})
it('rejects malformed JSON, network failures and partial responses', async () => {
  for (const response of [
    new Response('<html>'),
    new Response(
      JSON.stringify({
        data: { elements: [], remark: 'timeout' },
        fetchedAt: '2026-10-29',
        freshness: 'live',
      }),
    ),
  ]) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
    await expect(
      searchEcopoints(center, new AbortController().signal),
    ).rejects.toThrow()
  }
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
  await expect(
    searchEcopoints(center, new AbortController().signal),
  ).rejects.toThrow('conectar')
})
it('does not send a cancelled request', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const controller = new AbortController()
  controller.abort()
  await expect(
    searchEcopoints(center, controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(fetchMock).not.toHaveBeenCalled()
})
