import { useEffect } from 'react'
import { latLngBounds } from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'
import type { Coordinates } from '@/domain/types/location'
import type { Ecopoint } from '@/domain/types/ecopoint'

export function MapController({
  focus,
  points,
  fitVersion,
  onViewportChange,
}: {
  focus: Coordinates
  points: Ecopoint[]
  fitVersion: number
  onViewportChange: (center: Coordinates) => void
}) {
  const map = useMap()
  useMapEvents({
    moveend: () => {
      const center = map.getCenter().wrap()
      onViewportChange({ latitude: center.lat, longitude: center.lng })
    },
  })
  useEffect(() => {
    map.setView([focus.latitude, focus.longitude], 13, { animate: false })
  }, [focus, map])
  useEffect(() => {
    if (points.length)
      map.fitBounds(
        latLngBounds(points.map((point) => [point.latitude, point.longitude])),
        { padding: [40, 40], maxZoom: 15, animate: false },
      )
  }, [points, fitVersion, map])
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}
