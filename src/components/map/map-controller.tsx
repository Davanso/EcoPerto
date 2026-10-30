import { useEffect, useRef } from 'react'
import { latLng, latLngBounds } from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'
import type { Coordinates, UserLocation } from '@/domain/types/location'
import type { Ecopoint } from '@/domain/types/ecopoint'

export function MapController({
  focus,
  queryCenter = focus,
  radius = 5000,
  points,
  userLocation,
  fitVersion,
  recenterVersion,
  onViewportChange,
}: {
  focus: Coordinates
  queryCenter?: Coordinates
  radius?: number
  points: Ecopoint[]
  userLocation?: UserLocation
  fitVersion: number
  recenterVersion: number
  onViewportChange: (center: Coordinates) => void
}) {
  const map = useMap()
  const previous = useRef<{
    focus: Coordinates
    points: Ecopoint[]
    fitVersion: number
    recenterVersion: number
  } | null>(null)
  useMapEvents({
    moveend: () => {
      const center = map.getCenter().wrap()
      onViewportChange({ latitude: center.lat, longitude: center.lng })
    },
  })
  useEffect(() => {
    const last = previous.current
    const positions: [number, number][] = points.map((point) => [
      point.latitude,
      point.longitude,
    ])
    if (userLocation)
      positions.push([userLocation.latitude, userLocation.longitude])
    if (
      userLocation &&
      recenterVersion > 0 &&
      recenterVersion !== last?.recenterVersion
    ) {
      map.setView([userLocation.latitude, userLocation.longitude], 16, {
        animate: false,
      })
    } else if (
      last &&
      focus !== last.focus &&
      points === last.points &&
      fitVersion === last.fitVersion
    ) {
      map.setView([focus.latitude, focus.longitude], 13, { animate: false })
    } else if (positions.length) {
      const bounds = latLng(
        queryCenter.latitude,
        queryCenter.longitude,
      ).toBounds(radius * 2)
      bounds.extend(latLngBounds(positions))
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
        animate: false,
      })
    } else {
      map.fitBounds(
        latLng(queryCenter.latitude, queryCenter.longitude).toBounds(
          radius * 2,
        ),
        { padding: [40, 40], maxZoom: 15, animate: false },
      )
    }
    previous.current = { focus, points, fitVersion, recenterVersion }
  }, [
    focus,
    queryCenter,
    radius,
    points,
    userLocation,
    fitVersion,
    recenterVersion,
    map,
  ])
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}
