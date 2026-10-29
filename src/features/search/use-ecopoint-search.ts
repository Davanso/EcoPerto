import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PILOT_LOCATION,
  PILOT_LABEL,
  type Coordinates,
  type UserLocation,
} from '@/domain/types/location'
import { requestLocation } from '@/features/location/geolocation'
import { searchEcopoints, type SearchResult } from '@/services/overpass/client'
import { distanceMeters } from '@/domain/rules/distance'
import { PILOT_RESULTS } from '@/data/pilot'
import { searchOfficialPoints } from '@/services/official-data/indaiatuba'

type State = {
  status: 'idle' | 'locating' | 'loading' | 'success' | 'error'
  result: SearchResult
  error?: string
  errorKind?: 'location' | 'service'
  center: Coordinates
  radius: number
  label: string
}

export function useEcopointSearch() {
  const [state, setState] = useState<State>({
    status: 'idle',
    result: PILOT_RESULTS,
    center: PILOT_LOCATION,
    radius: 5000,
    label: PILOT_LABEL,
  })
  const [focus, setFocus] = useState<Coordinates>(PILOT_LOCATION)
  const [userLocation, setUserLocation] = useState<UserLocation>()
  const lifecycle = useRef({
    operation: 0,
    active: null as AbortController | null,
  })

  function cancel() {
    lifecycle.current.operation++
    lifecycle.current.active?.abort()
    lifecycle.current.active = null
    setState((previous) => ({
      ...previous,
      status: 'idle',
      error: undefined,
      errorKind: undefined,
    }))
  }

  const search = useCallback(
    async (
      center?: Coordinates,
      radius = 5000,
      label = 'Área escolhida no mapa',
    ) => {
      lifecycle.current.active?.abort()
      const controller = new AbortController()
      lifecycle.current.active = controller
      const id = ++lifecycle.current.operation
      let locating = !center
      setState((previous) => ({
        ...previous,
        status: locating ? 'locating' : 'loading',
        error: undefined,
        errorKind: undefined,
      }))
      try {
        let origin = center
        if (!origin) {
          const position = await requestLocation(controller.signal)
          if (id !== lifecycle.current.operation) return
          const approximate = {
            latitude: Number(position.latitude.toFixed(3)),
            longitude: Number(position.longitude.toFixed(3)),
            accuracyMeters: position.accuracyMeters + 100,
          }
          setUserLocation(approximate)
          origin = approximate
          label = 'Perto da sua localização'
        }
        if (id !== lifecycle.current.operation) return
        locating = false
        setFocus({ ...origin })
        setState((previous) => ({ ...previous, status: 'loading' }))
        const official = searchOfficialPoints(origin, radius)
        if (official.length)
          setState({
            status: 'loading',
            result: {
              points: official
                .map((point) => ({
                  ...point,
                  distanceMeters: distanceMeters(origin, point),
                }))
                .sort((a, b) => a.distanceMeters - b.distanceMeters),
              freshness: 'official',
              fetchedAt: '2026-10-29',
            },
            center: origin,
            radius,
            label,
          })
        const result = await searchEcopoints(origin, controller.signal, radius)
        const points = result.points
          .map((point) => ({
            ...point,
            distanceMeters: distanceMeters(origin, point),
          }))
          .filter((point) => point.distanceMeters <= radius)
          .sort((a, b) => a.distanceMeters - b.distanceMeters)
        if (id === lifecycle.current.operation)
          setState({
            status: 'success',
            result: { ...result, points },
            center: origin,
            radius,
            label,
          })
      } catch (error) {
        if (id === lifecycle.current.operation && !controller.signal.aborted)
          setState((previous) => ({
            ...previous,
            status: 'error',
            errorKind: locating ? 'location' : 'service',
            error:
              error instanceof Error
                ? error.message
                : 'Não foi possível concluir a busca.',
          }))
      } finally {
        if (id === lifecycle.current.operation) lifecycle.current.active = null
      }
    },
    [lifecycle],
  )

  useEffect(() => {
    const running = lifecycle.current
    const timer = setTimeout(
      () => void search(PILOT_LOCATION, 5000, PILOT_LABEL),
      0,
    )
    return () => {
      clearTimeout(timer)
      running.operation++
      running.active?.abort()
      running.active = null
    }
  }, [search, lifecycle])

  return {
    ...state,
    points: state.result.points,
    focus,
    userLocation,
    search,
    cancel,
  }
}
