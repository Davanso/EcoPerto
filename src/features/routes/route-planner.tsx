import { useState } from 'react'
import {
  Car,
  ChevronDown,
  LoaderCircle,
  LocateFixed,
  Navigation,
  ExternalLink,
  Route,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceSearch } from '@/features/location/place-search'
import type { Ecopoint } from '@/domain/types/ecopoint'
import type { useRoutePlanner } from './use-route-planner'

export function RoutePlanner({
  destination,
  planner,
}: {
  destination: Ecopoint
  planner: ReturnType<typeof useRoutePlanner>
}) {
  const [editing, setEditing] = useState(false)
  const busy = planner.status === 'locating' || planner.status === 'loading'
  const route = planner.route
  const origin = planner.manualOrigin?.name ?? 'Minha localização'
  const shortOrigin = origin.split(',').slice(0, 2).join(',')
  const externalUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving${route ? `&origin=${route.origin.latitude},${route.origin.longitude}` : ''}`
  return (
    <section
      className="route-planner"
      aria-label="Planejar rota"
      id="route-planner"
    >
      <div className="route-topline">
        <div className="route-planner-heading">
          <Route aria-hidden="true" />
          <div>
            <h3>Como chegar · carro</h3>
            <p title={destination.name}>{destination.name}</p>
          </div>
        </div>
        {route && (
          <div className="route-summary" role="status">
            <strong>
              {Math.max(1, Math.ceil(route.durationSeconds / 60))} min
            </strong>
            <span>
              {new Intl.NumberFormat('pt-BR', {
                maximumFractionDigits: 1,
              }).format(route.distanceMeters / 1000)}{' '}
              km
            </span>
          </div>
        )}
      </div>
      <details
        className="route-options"
        open={editing}
        onToggle={(event) => setEditing(event.currentTarget.open)}
      >
        <summary>
          <span title={origin}>De: {shortOrigin}</span>
          <span className="route-edit-label">
            Alterar <ChevronDown aria-hidden="true" />
          </span>
        </summary>
        <div className="route-options-content">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              setEditing(false)
              void planner.calculate(true)
            }}
          >
            <LocateFixed aria-hidden="true" />
            Usar minha localização como origem
          </Button>
          <PlaceSearch
            label="Endereço de partida"
            placeholder="Rua, número, cidade"
            description="Selecione um endereço. Buscar só a cidade usa seu centro."
            onSelect={(place) => {
              planner.chooseOrigin(place)
              setEditing(false)
            }}
          />
          <p className="route-origin">Origem selecionada: {origin}</p>
          {route && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                setEditing(false)
                void planner.calculate()
              }}
            >
              Recalcular rota
            </Button>
          )}
        </div>
      </details>
      <div className="route-actions">
        {route ? (
          <a
            className="route-navigate"
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation aria-hidden="true" />
            Navegar <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ) : (
          <Button
            disabled={busy}
            onClick={() => {
              setEditing(false)
              void planner.calculate()
            }}
          >
            {busy ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Car aria-hidden="true" />
            )}
            {planner.status === 'locating'
              ? 'Obtendo localização…'
              : busy
                ? 'Calculando rota…'
                : 'Traçar rota de carro'}
          </Button>
        )}
        {(busy || route) && (
          <Button variant="ghost" size="sm" onClick={planner.clear}>
            <X aria-hidden="true" />
            {busy ? 'Cancelar' : 'Remover'}
          </Button>
        )}
        {!route && (
          <a
            className="route-external"
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            Abrir em outro app{' '}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        )}
      </div>
      {!route && (
        <p className="route-privacy">
          Origem e destino serão enviados ao openrouteservice.
        </p>
      )}
      {route && (
        <div className="route-footnote">
          <details>
            <summary>Detalhes da rota</summary>
            <p>
              Estimativa de carro, sem trânsito em tempo real. Origem e chegada
              aproximadas; confirme o acesso ao ecoponto. Origem e destino
              enviados ao openrouteservice.
            </p>
          </details>
          <a
            href="https://openrouteservice.org"
            target="_blank"
            rel="noreferrer"
          >
            © openrouteservice · © OpenStreetMap contributors
          </a>
        </div>
      )}
      {planner.error && (
        <p className="route-error" role="alert">
          {planner.error}
        </p>
      )}
    </section>
  )
}
