import { divIcon } from 'leaflet'
import { Circle, Marker, Pane, Popup } from 'react-leaflet'
import type { UserLocation } from '@/domain/types/location'

const locationIcon = divIcon({
  className: 'user-location-marker',
  html: '<span class="user-location-dot" aria-hidden="true"></span><span class="user-location-label" aria-hidden="true">Você</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
})

export function UserLocationMarker({ location }: { location: UserLocation }) {
  const position: [number, number] = [location.latitude, location.longitude]
  return (
    <>
      <Circle
        center={position}
        radius={location.accuracyMeters}
        pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.08 }}
        interactive={false}
      />
      <Pane name="user-location" style={{ zIndex: 650 }}>
        <Marker
          position={position}
          icon={locationIcon}
          title="Você — localização aproximada"
          alt="Sua localização aproximada"
          zIndexOffset={2000}
        >
          <Popup>
            <strong>Você está aqui, aproximadamente.</strong>
            <br />
            Incerteza de até {Math.ceil(location.accuracyMeters)} m.
          </Popup>
        </Marker>
      </Pane>
    </>
  )
}
