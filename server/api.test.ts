import { createServer, type Server } from 'node:http'
import { afterEach, expect, it, vi } from 'vitest'
import { createApiHandler } from './api.ts'
import { ApiError } from './errors.ts'

let server: Server | undefined
afterEach(async () => {
  if (server) {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) =>
      server!.close((error) => (error ? reject(error) : resolve())),
    )
  }
  server = undefined
})

async function start(handler = createApiHandler()) {
  server = createServer((req, res) => {
    void handler(req, res)
  })
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Server did not start')
  return `http://127.0.0.1:${address.port}`
}

it('serves the production HTTP contract for Indaiatuba with 200 and a trace id', async () => {
  const base = await start()
  const response = await fetch(
    `${base}/api/ecopoints?lat=-23.091&lon=-47.218&radius=5000`,
  )
  expect(response.status).toBe(200)
  expect(response.headers.get('X-Request-Id')).toBeTruthy()
  const body = (await response.json()) as {
    points: unknown[]
    freshness: string
  }
  expect(body.points).toHaveLength(4)
  expect(body.freshness).toBe('official')
})

it('rejects bad coordinates and unsupported methods before provider calls', async () => {
  const base = await start()
  expect((await fetch(`${base}/api/ecopoints?lat=abc&lon=0`)).status).toBe(400)
  expect(
    (await fetch(`${base}/api/ecopoints`, { method: 'POST' })).status,
  ).toBe(405)
})

it('preserves typed upstream errors and Retry-After for clients', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const base = await start(
    createApiHandler({
      searchPoints: vi
        .fn()
        .mockRejectedValue(
          new ApiError(
            503,
            'ECOPOINTS_PROVIDER_UNAVAILABLE',
            'Fonte indisponível.',
            60,
          ),
        ),
      searchPlaces: vi.fn(),
    }),
  )
  const response = await fetch(`${base}/api/ecopoints?lat=0&lon=0`)
  expect(response.status).toBe(503)
  expect(response.headers.get('Retry-After')).toBe('60')
  expect(await response.json()).toMatchObject({
    code: 'ECOPOINTS_PROVIDER_UNAVAILABLE',
    error: 'Fonte indisponível.',
    requestId: expect.any(String),
  })
})

it('does not mislabel programming errors as 503 or expose internal error messages', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const base = await start(
    createApiHandler({
      searchPoints: vi
        .fn()
        .mockRejectedValue(new Error('private provider configuration')),
      searchPlaces: vi.fn(),
    }),
  )
  const response = await fetch(`${base}/api/ecopoints?lat=0&lon=0`)
  expect(response.status).toBe(500)
  const body = (await response.json()) as { code: string; error: string }
  expect(body.code).toBe('INTERNAL_ERROR')
  expect(body.error).not.toContain('private')
})
