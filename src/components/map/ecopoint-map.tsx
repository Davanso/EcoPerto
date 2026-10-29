import { useState } from 'react'
import { Circle, MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Ecopoint } from '@/domain/types/ecopoint'
import type { Coordinates, UserLocation } from '@/domain/types/location'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapController } from './map-controller'
import { PointMarker } from './point-marker'
import { UserLocationMarker } from './user-location-marker'

type Props = {
  focus: Coordinates
  queryCenter: Coordinates
  radius: number
  userLocation?: UserLocation
  points: Ecopoint[]
  selectedId?: string
  fitVersion: number
  recenterVersion: number
  onSelect: (id: string) => void
  onViewportChange: (center: Coordinates) => void
}

export default function EcopointMap({
  focus,
  queryCenter,
  radius,
  userLocation,
  points,
  selectedId,
  fitVersion,
  recenterVersion,
  onSelect,
  onViewportChange,
}: Props) {
  const [tileError, setTileError] = useState(false)
  return (
    <div className="ecopoint-map-wrapper" id="ecopoint-map">
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
        scrollWheelZoom={false}
        className="ecopoint-map"
        aria-label="Mapa de pontos de coleta"
      >
        <MapController
          focus={focus}
          points={points}
          userLocation={userLocation}
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
        {points.map((point, index) => (
          <PointMarker
            key={point.id}
            point={point}
            number={index + 1}
            selected={point.id === selectedId}
            onSelect={onSelect}
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
        <span>Área tracejada: {radius / 1000} km da última busca</span>
      </p>
    </div>
  )
}
