import { expect, it, vi } from 'vitest'
import { readProviderResponse, serverSecret } from './provider-response.ts'

it('distinguishes a gateway HTML page from valid JSON without logging its contents', async () => {
  const log = vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(
    await readProviderResponse(
      new Response('<html>private-key-and-location</html>', {
        headers: { 'content-type': 'text/html' },
      }),
      'test-provider',
    ),
  ).toMatchObject({ data: undefined, format: 'html' })
  expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":200'))
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    'private-key-and-location',
  )
  expect(
    await readProviderResponse(
      new Response('\uFEFF{"elements":[]}'),
      'test-provider',
    ),
  ).toMatchObject({ data: { elements: [] }, format: 'json' })
})
it('normalizes pasted whitespace and enclosing quotes without changing the secret', () => {
  expect(serverSecret('  "test-only-key"\n')).toBe('test-only-key')
  expect(serverSecret('test-only-key')).toBe('test-only-key')
  expect(serverSecret(undefined)).toBeUndefined()
})
