import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createRouteService } from './routes.ts'

const input = {
  origin: { latitude: -23.09, longitude: -47.218 },
  destination: { latitude: -23.107, longitude: -47.208 },
}
const coordinates = [
  [-47.218, -23.09],
  [-47.216, -23.1],
  [-47.208, -23.107],
]
const payload = {
  features: [
    {
      geometry: { type: 'LineString', coordinates },
      properties: { summary: { distance: 2800, duration: 480 } },
    },
  ],
}
beforeEach(() => vi.stubEnv('ORS_API_KEY', 'test-only-secret'))
afterEach(() => vi.unstubAllEnvs())

it('uses GeoJSON and server-side authorization, preserving real road geometry and summary', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(payload)))
  const route = await createRouteService(fetcher)(input)
  expect(route).toEqual({
    coordinates,
    distanceMeters: 2800,
    durationSeconds: 480,
  })
  const [url, options] = fetcher.mock.calls[0]
  expect(url).toContain('/driving-car/geojson')
  expect(options.headers.Authorization).toBe('test-only-secret')
  expect(JSON.parse(options.body).coordinates).toEqual([
    coordinates[0],
    coordinates[2],
  ])
})
it('rejects absent credentials, bad coordinates and excessive distances before calling the provider', async () => {
  const fetcher = vi.fn()
  const service = createRouteService(fetcher)
  await expect(
    service({ ...input, origin: { latitude: 91, longitude: 0 } }),
  ).rejects.toMatchObject({ status: 400 })
  await expect(
    service({ ...input, origin: { latitude: 0, longitude: 0 } }),
  ).rejects.toMatchObject({ code: 'ROUTE_TOO_LONG' })
  vi.stubEnv('ORS_API_KEY', '')
  await expect(service(input)).rejects.toMatchObject({
    code: 'ROUTING_NOT_CONFIGURED',
  })
  expect(fetcher).not.toHaveBeenCalled()
})
it('never fabricates a straight line for absent, malformed or partial routes', async () => {
  for (const body of [
    { features: [] },
    {
      features: [
        {
          ...payload.features[0],
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 91],
              [0, 0],
            ],
          },
        },
      ],
    },
    { error: { code: 2010 } },
  ]) {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body)))
    await expect(createRouteService(fetcher)(input)).rejects.toMatchObject({
      status: expect.any(Number),
    })
  }
})
it('returns typed quota and provider errors without leaking the key or upstream response', async () => {
  for (const [status, expected] of [
    [429, 'ROUTING_QUOTA'],
    [403, 'ROUTING_AUTH_FAILED'],
    [500, 'ROUTING_UNAVAILABLE'],
  ] as const) {
    const service = createRouteService(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ private: 'test-only-secret' }), {
          status,
        }),
      ),
    )
    await expect(service(input)).rejects.toMatchObject({ code: expected })
  }
})
it('bounds concurrent requests and forwards cancellation to the provider', async () => {
  let complete!: (value: Response) => void
  const fetcher = vi.fn().mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve
      }),
  )
  const service = createRouteService(fetcher)
  const controller = new AbortController()
  const first = service(input, controller.signal)
  const finishFirst = complete
  const second = service(input)
  await expect(service(input)).rejects.toMatchObject({ status: 429 })
  controller.abort()
  expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
  finishFirst(new Response(JSON.stringify(payload)))
  complete(new Response(JSON.stringify(payload)))
  await Promise.all([first, second])
})
