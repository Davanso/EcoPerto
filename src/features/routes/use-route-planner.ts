import { useEffect, useMemo, useRef, useState } from 'react'
import type { Ecopoint } from '@/domain/types/ecopoint'
import type { UserLocation } from '@/domain/types/location'
import type { DrivingRoute } from '@/domain/types/route'
import type { Place } from '@/services/places/client'
import { calculateRoute } from '@/services/routes/client'
import { requestLocation } from '@/features/location/geolocation'

export type PlannedRoute = DrivingRoute & {
  origin: UserLocation
  originLabel: string
  fromDevice: boolean
  destination: Ecopoint
}
type State = {
  context: object
  status: 'locating' | 'loading' | 'success' | 'error'
  route?: PlannedRoute
  error?: string
}

export function useRoutePlanner(
  destination: Ecopoint | undefined,
  userLocation?: UserLocation,
) {
  const [manualOrigin, setManualOrigin] = useState<Place>()
  const [deviceLocation, setDeviceLocation] = useState<UserLocation>()
  const [state, setState] = useState<State>()
  const active = useRef({
    id: 0,
    controller: undefined as AbortController | undefined,
  })
  const key = destination
    ? `${destination.id}:${destination.latitude}:${destination.longitude}`
    : ''
  const context = useMemo(() => ({ key, userLocation }), [key, userLocation])
  useEffect(() => {
    const lifecycle = active.current
    return () => {
      lifecycle.id++
      lifecycle.controller?.abort()
    }
  }, [context])
  const current = state?.context === context ? state : undefined
  function clear() {
    active.current.id++
    active.current.controller?.abort()
    setState(undefined)
  }
  function chooseOrigin(place: Place) {
    clear()
    setManualOrigin(place)
  }
  async function calculate(useDevice = false) {
    if (!destination) return
    clear()
    if (useDevice) setManualOrigin(undefined)
    const controller = new AbortController()
    const id = ++active.current.id
    active.current.controller = controller
    const manual = useDevice ? undefined : manualOrigin
    let origin = manual
      ? {
          latitude: manual.latitude,
          longitude: manual.longitude,
          accuracyMeters: 0,
        }
      : (userLocation ?? deviceLocation)
    setState({ context, status: origin ? 'loading' : 'locating' })
    try {
      if (!origin) {
        const position = await requestLocation(controller.signal)
        origin = {
          latitude: Number(position.latitude.toFixed(3)),
          longitude: Number(position.longitude.toFixed(3)),
          accuracyMeters: position.accuracyMeters + 100,
        }
        if (!controller.signal.aborted && active.current.id === id)
          setDeviceLocation(origin)
      }
      if (controller.signal.aborted || active.current.id !== id) return
      setState({ context, status: 'loading' })
      const route = await calculateRoute(
        { origin, destination },
        controller.signal,
      )
      if (controller.signal.aborted || active.current.id !== id) return
      setState({
        context,
        status: 'success',
        route: {
          ...route,
          origin,
          originLabel: manual?.name ?? 'Sua localização aproximada',
          fromDevice: !manual,
          destination,
        },
      })
    } catch (error) {
      if (controller.signal.aborted || active.current.id !== id) return
      setState({
        context,
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível calcular a rota.',
      })
    }
  }
  return {
    status: current?.status ?? 'idle',
    route: current?.route,
    error: current?.error,
    manualOrigin,
    deviceLocation,
    calculate,
    clear,
    chooseOrigin,
  }
}
