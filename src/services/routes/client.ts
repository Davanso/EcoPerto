import {
  isDrivingRoute,
  type DrivingRoute,
  type RouteRequest,
} from '@/domain/types/route'

export async function calculateRoute(
  input: RouteRequest,
  signal: AbortSignal,
): Promise<DrivingRoute> {
  const timeout = AbortSignal.timeout(18000)
  let response: Response
  try {
    response = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: {
          latitude: input.origin.latitude,
          longitude: input.origin.longitude,
        },
        destination: {
          latitude: input.destination.latitude,
          longitude: input.destination.longitude,
        },
      }),
      signal: AbortSignal.any([signal, timeout]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new Error(
      'Não foi possível conectar ao serviço de rotas. Tente novamente.',
    )
  }
  const body = await response.json().catch(() => {
    throw new Error('O serviço retornou uma resposta inválida.')
  })
  if (!response.ok)
    throw new Error(
      typeof body?.error === 'string'
        ? body.error
        : 'Não foi possível calcular a rota.',
    )
  if (!isDrivingRoute(body))
    throw new Error('O serviço retornou uma rota inválida.')
  return body
}
