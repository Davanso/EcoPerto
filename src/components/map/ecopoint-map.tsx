import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Circle, MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Ecopoint } from '@/domain/types/ecopoint'
import type { Coordinates, UserLocation } from '@/domain/types/location'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapController } from './map-controller'
import { PointMarker } from './point-marker'
import { UserLocationMarker } from './user-location-marker'
import { RouteLayer } from './route-layer'
import type { PlannedRoute } from '@/features/routes/use-route-planner'

type Props = {
  loading?: boolean
  onCancel?: () => void
  focus: Coordinates
  queryCenter: Coordinates
  radius: number
  userLocation?: UserLocation
  route?: PlannedRoute
  onRoute: (id: string) => void
  points: Ecopoint[]
  selectedId?: string
  fitVersion: number
  recenterVersion: number
  onSelect: (id: string) => void
  onViewportChange: (center: Coordinates) => void
}

export default function EcopointMap({
  loading = false,
  onCancel,
  focus,
  queryCenter,
  radius,
  userLocation,
  route,
  onRoute,
  points,
  selectedId,
  fitVersion,
  recenterVersion,
  onSelect,
  onViewportChange,
}: Props) {
  const [tileError, setTileError] = useState(false)
  return (
    <div className="ecopoint-map-wrapper" id="ecopoint-map" aria-busy={loading}>
      {loading && (
        <div className="map-search-overlay" role="status" aria-live="polite">
          <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
          <strong>Buscando pontos de coleta…</strong>
          <span>Consultando os dados desta área.</span>
          <button type="button" onClick={onCancel}>
            Cancelar busca
          </button>
        </div>
      )}
      {tileError && (
        <Alert>
          <AlertDescription>
            Algumas imagens do mapa não carregaram. Os pontos e a lista
            continuam disponíveis.
          </AlertDescription>
        </Alert>
      )}
      <MapContainer
        center={[focus.latitude, focus.longitude]}
        zoom={13}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        dragging
        doubleClickZoom
        touchZoom
        className="ecopoint-map"
        aria-label="Mapa de pontos de coleta"
      >
        <MapController
          focus={focus}
          queryCenter={queryCenter}
          radius={radius}
          points={points}
          userLocation={userLocation}
          routeActive={!!route}
          fitVersion={fitVersion}
          recenterVersion={recenterVersion}
          onViewportChange={onViewportChange}
        />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        <Circle
          center={[queryCenter.latitude, queryCenter.longitude]}
          radius={radius}
          pathOptions={{
            color: '#187b51',
            fillOpacity: 0.025,
            weight: 1.5,
            dashArray: '6 6',
          }}
          interactive={false}
        />
        {userLocation && <UserLocationMarker location={userLocation} />}
        {route && <RouteLayer route={route} fitVersion={fitVersion} />}
        {points.map((point, index) => (
          <PointMarker
            key={point.id}
            point={point}
            number={index + 1}
            selected={point.id === selectedId}
            onSelect={onSelect}
            onRoute={onRoute}
          />
        ))}
      </MapContainer>
      <p className="map-legend">
        <span className="legend-item">
          <span className="legend-point" aria-hidden="true" />
          Pontos de coleta
        </span>
        <span className="legend-item">
          <span className="legend-user" aria-hidden="true" />
          {userLocation
            ? 'Você (posição aproximada)'
            : 'Localização ainda não obtida'}
        </span>
        <span>Área tracejada: raio selecionado de {radius / 1000} km</span>
      </p>
    </div>
  )
}
