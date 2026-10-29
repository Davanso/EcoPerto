import { useEffect, useState } from 'react'
import { divIcon } from 'leaflet'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Ecopoint } from '@/domain/types/ecopoint'
import { MATERIALS } from '@/domain/types/ecopoint'
import type { Coordinates, UserLocation } from '@/domain/types/location'
import { SEARCH_RADIUS_METERS } from '@/services/overpass/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

const pointIcon = divIcon({
  className: 'ecopoint-marker',
  html: '<span aria-hidden="true">♻</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

type Props = {
  focus: Coordinates
  queryCenter?: Coordinates
  userLocation?: UserLocation
  points: Ecopoint[]
  onViewportChange: (center: Coordinates) => void
}

function MapControls({
  focus,
  onViewportChange,
}: Pick<Props, 'focus' | 'onViewportChange'>) {
  const map = useMap()
  useMapEvents({
    moveend: () => {
      const center = map.getCenter().wrap()
      onViewportChange({ latitude: center.lat, longitude: center.lng })
    },
  })
  useEffect(() => {
    map.setView([focus.latitude, focus.longitude], 13)
  }, [focus, map])
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

export default function EcopointMap({
  focus,
  queryCenter,
  userLocation,
  points,
  onViewportChange,
}: Props) {
  const [tileError, setTileError] = useState(false)
  return (
    <div className="ecopoint-map-wrapper">
      {tileError && (
        <Alert>
          <AlertDescription>
            O mapa de fundo não pôde ser carregado por completo. Verifique sua
            conexão. Os resultados da busca continuam disponíveis abaixo.
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
        <MapControls focus={focus} onViewportChange={onViewportChange} />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        {queryCenter && (
          <Circle
            center={[queryCenter.latitude, queryCenter.longitude]}
            radius={SEARCH_RADIUS_METERS}
            pathOptions={{
              color: '#175b49',
              fillOpacity: 0.035,
              weight: 1,
              dashArray: '6 6',
            }}
            interactive={false}
          />
        )}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={userLocation.accuracyMeters}
              pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.08 }}
              interactive={false}
            />
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={7}
              pathOptions={{
                color: '#fff',
                fillColor: '#2563eb',
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>Sua localização aproximada</Popup>
            </CircleMarker>
          </>
        )}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={pointIcon}
            title={point.name}
            alt={`Ponto de coleta: ${point.name}`}
          >
            <Popup>
              <div className="ecopoint-popup">
                <strong>{point.name}</strong>
                <p>{point.address || 'Endereço não informado.'}</p>
                <p>
                  <strong>Materiais:</strong>{' '}
                  {point.acceptedMaterials
                    ?.map((material) => MATERIALS[material])
                    .join(', ') || 'Não informados.'}
                </p>
                <p>
                  <strong>Horários:</strong>{' '}
                  {point.openingHours || 'Não informados.'}
                </p>
                <a href={point.sourceUrl} target="_blank" rel="noreferrer">
                  Consultar fonte no OpenStreetMap
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="map-legend">
        <span className="legend-item">
          <span className="legend-point" aria-hidden="true" /> Ponto de coleta
        </span>
        <span className="legend-item">
          <span className="legend-user" aria-hidden="true" /> Sua localização
          aproximada
        </span>
        <span>Área tracejada: raio de 5 km</span>
      </p>
    </div>
  )
}
