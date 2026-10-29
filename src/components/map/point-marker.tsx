import { useEffect, useMemo, useRef } from 'react'
import { divIcon, type Marker as LeafletMarker } from 'leaflet'
import { Marker, Popup, useMap } from 'react-leaflet'
import { MATERIALS, type Ecopoint } from '@/domain/types/ecopoint'

export function PointMarker({
  point,
  number,
  selected,
  onSelect,
}: {
  point: Ecopoint
  number: number
  selected: boolean
  onSelect: (id: string) => void
}) {
  const marker = useRef<LeafletMarker>(null)
  const map = useMap()
  const icon = useMemo(
    () =>
      divIcon({
        className: `ecopoint-marker${selected ? ' is-selected' : ''}`,
        html: `<span aria-hidden="true">${number}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      }),
    [number, selected],
  )
  useEffect(() => {
    if (selected) {
      map.setView(
        [point.latitude, point.longitude],
        Math.max(map.getZoom(), 14),
        { animate: false },
      )
      marker.current?.openPopup()
    }
  }, [selected, point.latitude, point.longitude, map])
  return (
    <Marker
      ref={marker}
      position={[point.latitude, point.longitude]}
      icon={icon}
      title={point.name}
      alt={`Ponto ${number}: ${point.name}`}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(point.id) }}
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
            <strong>Horários:</strong> {point.openingHours || 'Não informados.'}
          </p>
          {point.contact && (
            <p>
              <strong>Contato:</strong> {point.contact}
            </p>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Abrir rota para este ponto ↗
          </a>
          <a href={point.sourceUrl} target="_blank" rel="noreferrer">
            {point.source === 'official'
              ? 'Fonte: Prefeitura de Indaiatuba'
              : 'Fonte: OpenStreetMap'}
          </a>
          {point.coordinateSourceUrl && (
            <a
              href={point.coordinateSourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Coordenadas: Mapa Abrecon
            </a>
          )}
          {point.lastVerifiedAt && (
            <small>
              Fonte consultada em{' '}
              {new Date(`${point.lastVerifiedAt}T12:00:00`).toLocaleDateString(
                'pt-BR',
              )}
              . Confirme as condições antes de ir.
            </small>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
