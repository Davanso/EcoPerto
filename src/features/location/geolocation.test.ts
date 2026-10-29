import { afterEach, expect, it, vi } from 'vitest'
import { requestLocation } from './geolocation'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
function setup(getCurrentPosition: Geolocation['getCurrentPosition']) {
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
}
it('requests only on invocation and accepts a recent device position', async () => {
  const get = vi.fn<Geolocation['getCurrentPosition']>((success) =>
    success({
      coords: { latitude: 0, longitude: 0, accuracy: 100 },
    } as GeolocationPosition),
  )
  setup(get)
  expect(get).not.toHaveBeenCalled()
  expect(await requestLocation()).toMatchObject({
    latitude: 0,
    accuracyMeters: 100,
  })
  expect(get.mock.calls[0][2]).toMatchObject({
    maximumAge: 300000,
    timeout: 6000,
  })
})
it('tries high accuracy once if the initial device provider fails', async () => {
  const get = vi
    .fn<Geolocation['getCurrentPosition']>()
    .mockImplementationOnce((_success, error) =>
      error!({ code: 2 } as GeolocationPositionError),
    )
    .mockImplementationOnce((success) =>
      success({
        coords: { latitude: 1, longitude: 2, accuracy: 20 },
      } as GeolocationPosition),
    )
  setup(get)
  expect(await requestLocation()).toMatchObject({ latitude: 1 })
  expect(get.mock.calls[1][2]?.enableHighAccuracy).toBe(true)
})
it('does not retry denied permissions', async () => {
  const get = vi.fn<Geolocation['getCurrentPosition']>((_success, error) =>
    error!({ code: 1 } as GeolocationPositionError),
  )
  setup(get)
  await expect(requestLocation()).rejects.toThrow('negada')
  expect(get).toHaveBeenCalledOnce()
})
it('has an independent deadline when an embedded browser never invokes callbacks', async () => {
  vi.useFakeTimers()
  setup(vi.fn())
  const pending = expect(requestLocation()).rejects.toThrow('não respondeu')
  await vi.advanceTimersByTimeAsync(20000)
  await pending
})
it('cancels the operation even while device callbacks are pending', async () => {
  setup(vi.fn())
  const controller = new AbortController()
  const pending = expect(
    requestLocation(controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' })
  controller.abort()
  await pending
})
it('handles insecure or unsupported contexts', async () => {
  vi.stubGlobal('window', { isSecureContext: false })
  await expect(requestLocation()).rejects.toThrow('HTTPS')
})
