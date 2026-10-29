import { useEffect, useRef, useState } from 'react'
import type { Ecopoint } from '@/domain/types/ecopoint'
import {
  PILOT_LOCATION,
  type Coordinates,
  type UserLocation,
} from '@/domain/types/location'
import { requestLocation } from '@/features/location/geolocation'
import { searchEcopoints } from '@/services/overpass/client'

type SearchState = {
  status: 'idle' | 'locating' | 'loading' | 'success' | 'error'
  points: Ecopoint[]
  error?: string
}

export function useEcopointSearch() {
  const [state, setState] = useState<SearchState>({
    status: 'idle',
    points: [],
  })
  const [focus, setFocus] = useState<Coordinates>(PILOT_LOCATION)
  const [queryCenter, setQueryCenter] = useState<Coordinates>()
  const [userLocation, setUserLocation] = useState<UserLocation>()
  const operation = useRef(0)
  const active = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      operation.current += 1
      active.current?.abort()
    },
    [],
  )

  function cancel() {
    operation.current += 1
    active.current?.abort()
    active.current = null
    setState({ status: 'idle', points: [] })
    setQueryCenter(undefined)
  }

  async function search(center?: Coordinates) {
    // Protect against repeated clicks and late geolocation callbacks after cancel/unmount.
    if (active.current) return
    const controller = new AbortController()
    active.current = controller
    const id = ++operation.current
    setState({ status: center ? 'loading' : 'locating', points: [] })
    setQueryCenter(undefined)
    try {
      let origin = center
      if (!origin) {
        const position = await requestLocation()
        if (id !== operation.current) return
        // Keep and send only an approximate position (~100 m), never persist it.
        const approximate = {
          latitude: Number(position.latitude.toFixed(3)),
          longitude: Number(position.longitude.toFixed(3)),
          accuracyMeters: position.accuracyMeters + 100,
        }
        setUserLocation(approximate)
        origin = approximate
        setFocus(approximate)
      }
      if (id !== operation.current) return
      setQueryCenter(origin)
      setState({ status: 'loading', points: [] })
      const points = await searchEcopoints(origin, controller.signal)
      if (id === operation.current) setState({ status: 'success', points })
    } catch (error) {
      if (id === operation.current && !controller.signal.aborted) {
        setState({
          status: 'error',
          points: [],
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível realizar a busca. Tente novamente.',
        })
      }
    } finally {
      if (id === operation.current) active.current = null
    }
  }

  return { ...state, focus, queryCenter, userLocation, search, cancel }
}
