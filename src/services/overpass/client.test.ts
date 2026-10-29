import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQuery, searchEcopoints } from './client'

const center = { latitude: -23.55052, longitude: -46.633308 }
let time = 0
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue((time += 120000))
})
afterEach(() => vi.unstubAllGlobals())

describe('Overpass client', () => {
  it('bounds query radius and rejects invalid coordinates', () => {
    expect(buildQuery(center)).toContain('(around:5000,-23.55052,-46.63331)')
    expect(() => buildQuery({ latitude: NaN, longitude: 0 })).toThrow()
    expect(() => buildQuery({ latitude: 0, longitude: 181 })).toThrow()
  })
  it('sends one bounded query and normalizes its response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ elements: [] })))
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchEcopoints(center, new AbortController().signal)).toEqual(
      [],
    )
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0].searchParams.get('data')).toBe(
      buildQuery(center),
    )
  })
  it.each([
    [429, 'muitas consultas'],
    [406, 'muitas consultas'],
    [504, 'temporariamente indisponível'],
  ])('handles HTTP %s without retrying', async (status, message) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      searchEcopoints(center, new AbortController().signal),
    ).rejects.toThrow(message)
    expect(fetchMock).toHaveBeenCalledOnce()
    if (status === 429 || status === 406) {
      await expect(
        searchEcopoints(center, new AbortController().signal),
      ).rejects.toThrow('Aguarde um minuto')
      expect(fetchMock).toHaveBeenCalledOnce()
    }
  })
  it('handles network and malformed response failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    await expect(
      searchEcopoints(center, new AbortController().signal),
    ).rejects.toThrow('conectar')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>error</html>')),
    )
    await expect(
      searchEcopoints(center, new AbortController().signal),
    ).rejects.toThrow('resposta inválida')
  })
  it('propagates cancellation', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(controller.signal.reason))
    await expect(
      searchEcopoints(center, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})
