import { useEffect } from 'react'
import { latLngBounds } from 'leaflet'
import { createPointIcon } from './point-icon'
import { Marker, Polyline, Popup, useMap } from 'react-leaflet'
import type { PlannedRoute } from '@/features/routes/use-route-planner'

const originIcon = createPointIcon('A', { origin: true })

export function RouteLayer({
  route,
  fitVersion,
}: {
  route: PlannedRoute
  fitVersion: number
}) {
  const map = useMap()
  const positions: [number, number][] = route.coordinates.map(
    ([longitude, latitude]) => [latitude, longitude],
  )
  useEffect(() => {
    map.closePopup()
    const bounds = latLngBounds(
      route.coordinates.map(
        ([longitude, latitude]) => [latitude, longitude] as [number, number],
      ),
    )
    bounds.extend([route.origin.latitude, route.origin.longitude])
    bounds.extend([route.destination.latitude, route.destination.longitude])
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16, animate: false })
  }, [route, fitVersion, map])
  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.95 }}
        interactive={false}
      />
      <Polyline
        positions={positions}
        pathOptions={{ color: '#2563eb', weight: 5, opacity: 1 }}
        interactive={false}
      />
      {!route.fromDevice && (
        <Marker
          position={[route.origin.latitude, route.origin.longitude]}
          icon={originIcon}
          title="Origem da rota"
        >
          <Popup>Origem da rota: {route.originLabel}</Popup>
        </Marker>
      )}
    </>
  )
}
