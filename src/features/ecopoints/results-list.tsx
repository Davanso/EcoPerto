import { MapPin } from 'lucide-react'
import { MATERIALS, type Ecopoint } from '@/domain/types/ecopoint'
import { cn } from '@/lib/utils'

export function ResultsList({
  points,
  selectedId,
  onSelect,
}: {
  points: Ecopoint[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return (
    <ol className="ecopoint-results" aria-label="Pontos de coleta encontrados">
      {points.map((point, index) => (
        <li key={point.id}>
          <button
            type="button"
            className={cn(
              'result-card',
              selectedId === point.id && 'is-selected',
            )}
            aria-pressed={selectedId === point.id}
            onClick={() => onSelect(point.id)}
          >
            <span className="result-number">{index + 1}</span>
            <span className="result-description">
              <strong>{point.name}</strong>
              {point.source === 'official' && (
                <span className="result-official">Fonte municipal</span>
              )}
              <span>{point.address || 'Endereço não informado'}</span>
              <span className="result-materials">
                {point.acceptedMaterials
                  ?.map((material) => MATERIALS[material])
                  .join(' · ') || 'Materiais não informados'}
              </span>
              <span className="result-distance">
                <MapPin aria-hidden="true" />
                {point.distanceMeters === undefined
                  ? 'Ver no mapa'
                  : `${(point.distanceMeters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km em linha reta · Ver no mapa`}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}
