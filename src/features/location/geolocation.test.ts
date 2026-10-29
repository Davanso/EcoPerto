import { afterEach, expect, it, vi } from 'vitest'
import { requestLocation } from './geolocation'

afterEach(() => vi.unstubAllGlobals())

it('does not request position until called and uses a timeout without cached position', async () => {
  const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>(
    (success) =>
      success({
        coords: { latitude: 0, longitude: 0, accuracy: 100 },
      } as GeolocationPosition),
  )
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  expect(getCurrentPosition).not.toHaveBeenCalled()
  expect(await requestLocation()).toEqual({
    latitude: 0,
    longitude: 0,
    accuracyMeters: 100,
  })
  expect(getCurrentPosition.mock.calls[0][2]).toMatchObject({
    timeout: 12000,
    maximumAge: 0,
  })
})

it.each([
  [1, 'negada'],
  [2, 'determinar'],
  [3, 'demorou'],
])(
  'explains geolocation error %s with a map alternative',
  async (code, message) => {
    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _success: unknown,
          error: (value: { code: number }) => void,
        ) => error({ code }),
      },
    })
    await expect(requestLocation()).rejects.toThrow(message)
  },
)

it('handles unavailable geolocation', async () => {
  vi.stubGlobal('window', { isSecureContext: false })
  await expect(requestLocation()).rejects.toThrow('não está disponível')
})
