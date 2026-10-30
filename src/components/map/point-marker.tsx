import { useEffect, useMemo, useRef } from 'react'
import { type Marker as LeafletMarker } from 'leaflet'
import { createPointIcon } from './point-icon'
import { Marker, Popup, useMap } from 'react-leaflet'
import { MATERIALS, type Ecopoint } from '@/domain/types/ecopoint'

export function PointMarker({
  point,
  number,
  selected,
  onSelect,
  onRoute,
}: {
  point: Ecopoint
  number: number
  selected: boolean
  onSelect: (id: string) => void
  onRoute: (id: string) => void
}) {
  const marker = useRef<LeafletMarker>(null)
  const map = useMap()
  const icon = useMemo(
    () => createPointIcon(number, { selected }),
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
      <Popup maxWidth={230} minWidth={160}>
        <div className="ecopoint-popup">
          <strong>{point.name}</strong>
          <p>{point.address || 'Endereço não informado.'}</p>
          <button
            className="popup-route-button"
            type="button"
            onClick={() => onRoute(point.id)}
          >
            Traçar rota no app
          </button>
          <details className="popup-details">
            <summary>Materiais, horários e fontes</summary>
            <div>
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
                  {new Date(
                    `${point.lastVerifiedAt}T12:00:00`,
                  ).toLocaleDateString('pt-BR')}
                  . Confirme as condições antes de ir.
                </small>
              )}
            </div>
          </details>
        </div>
      </Popup>
    </Marker>
  )
}
