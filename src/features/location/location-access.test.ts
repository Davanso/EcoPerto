import { afterEach, expect, it, vi } from 'vitest'
import { readLocationAccess } from './location-access'

afterEach(() => vi.unstubAllGlobals())
it('detects a denied site permission without requesting device coordinates', async () => {
  const locate = vi.fn()
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition: locate },
    permissions: { query: async () => ({ state: 'denied' }) },
  })
  expect(await readLocationAccess()).toBe('denied')
  expect(locate).not.toHaveBeenCalled()
})
it('distinguishes an embedded context that blocks geolocation', async () => {
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', { geolocation: {} })
  vi.stubGlobal('document', { featurePolicy: { allowsFeature: () => false } })
  expect(await readLocationAccess()).toBe('policy-blocked')
})
it('distinguishes an insecure page from an unsupported browser', async () => {
  vi.stubGlobal('window', { isSecureContext: false })
  expect(await readLocationAccess()).toBe('insecure')
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', {})
  expect(await readLocationAccess()).toBe('unsupported')
})
it('tolerates browsers without the permission query API', async () => {
  vi.stubGlobal('window', { isSecureContext: true })
  vi.stubGlobal('navigator', { geolocation: {} })
  expect(await readLocationAccess()).toBe('unknown')
})
