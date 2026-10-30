import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle, LocateFixed, Search, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Field, FieldLabel } from '@/components/ui/field'
import { PILOT_LOCATION, type Coordinates } from '@/domain/types/location'
import { PlaceSearch } from '@/features/location/place-search'
import { ResultsList } from '@/features/ecopoints/results-list'
import { useEcopointSearch } from './use-ecopoint-search'
import {
  readLocationAccess,
  LOCATION_ACCESS_MESSAGES,
  type LocationAccess,
} from '@/features/location/location-access'

const EcopointMap = lazy(() => import('@/components/map/ecopoint-map'))

export function EcopointSearch() {
  const {
    status,
    points,
    error,
    errorKind,
    focus,
    center,
    radius: resultRadius,
    label,
    result,
    userLocation,
    search,
    cancel,
  } = useEcopointSearch()
  const viewport = useRef<Coordinates>(PILOT_LOCATION)
  const [radius, setRadius] = useState(5000)
  const [selectedId, setSelectedId] = useState<string>()
  const [fitVersion, setFitVersion] = useState(0)
  const [recenterVersion, setRecenterVersion] = useState(0)
  const [locationAccess, setLocationAccess] =
    useState<LocationAccess>('unknown')
  useEffect(() => {
    let active = true
    void readLocationAccess().then((access) => {
      if (active) setLocationAccess(access)
    })
    return () => {
      active = false
    }
  }, [status])
  const onViewportChange = useCallback((point: Coordinates) => {
    viewport.current = point
  }, [])
  const busy = status === 'loading' || status === 'locating'
  const selectPoint = (id: string) => {
    setSelectedId(id)
    document
      .getElementById('ecopoint-map')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  return (
    <div className="map-workspace">
      <aside className="map-sidebar" aria-label="Busca e pontos de coleta">
        <div className="map-search-controls">
          <h2>Onde você quer descartar?</h2>
          <Button
            size="lg"
            disabled={status === 'locating'}
            onClick={() => void search(undefined, radius)}
          >
            <LocateFixed data-icon="inline-start" aria-hidden="true" />
            {status === 'locating'
              ? 'Obtendo localização…'
              : 'Usar minha localização'}
          </Button>
          <p className="location-status" role="status">
            {userLocation
              ? 'Posição obtida. O marcador azul “Você” indica sua localização aproximada.'
              : status === 'locating'
                ? 'Aguardando a posição do dispositivo…'
                : LOCATION_ACCESS_MESSAGES[locationAccess]}
          </p>
          <PlaceSearch
            onSelect={(place) =>
              void search(
                place,
                radius,
                place.name.split(',').slice(0, 2).join(','),
              )
            }
          />
          <Field orientation="horizontal">
            <FieldLabel htmlFor="search-radius">Raio de busca</FieldLabel>
            <select
              id="search-radius"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            >
              <option value="5000">5 km</option>
              <option value="10000">10 km</option>
              <option value="20000">20 km</option>
            </select>
          </Field>
          <p className="location-privacy">
            Localização só com sua permissão, sem histórico salvo. Cidade e área
            consultadas são enviadas aos serviços de mapas.
          </p>
        </div>
        <div className="results-heading">
          <h3>
            {points.length}{' '}
            {points.length === 1 ? 'ponto de coleta' : 'pontos de coleta'}
          </h3>
          <p>
            {label} · até {resultRadius / 1000} km
          </p>
        </div>
        <ResultsList
          points={points}
          selectedId={selectedId}
          onSelect={selectPoint}
        />
        {!points.length && !busy && (
          <div className="no-results">
            <strong>Nenhum ponto cadastrado nesta busca.</strong>
            <p>
              A cobertura pode ser incompleta. Aumente o raio ou escolha outra
              área.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const next = Math.min(resultRadius * 2, 20000)
                setRadius(next)
                void search(center, next, label)
              }}
              disabled={resultRadius >= 20000}
            >
              Ampliar busca
            </Button>
          </div>
        )}
      </aside>
      <div className="map-main">
        <div className="map-toolbar">
          <p>Mova o mapa e busque na área desejada.</p>
          <div className="flex flex-wrap gap-2">
            {userLocation && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedId(undefined)
                  setRecenterVersion((value) => value + 1)
                }}
              >
                <LocateFixed data-icon="inline-start" aria-hidden="true" />
                Centralizar em mim
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setFitVersion((value) => value + 1)}
            >
              <Scan data-icon="inline-start" aria-hidden="true" />
              Ver todos
            </Button>
            <Button onClick={() => void search(viewport.current, radius)}>
              <Search data-icon="inline-start" aria-hidden="true" />
              Buscar nesta área
            </Button>
          </div>
        </div>
        <div role="status" aria-live="polite" className="map-progress">
          {busy ? (
            <>
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
              <span>
                {status === 'locating'
                  ? 'Autorize a localização no navegador. Se não responder, você pode buscar por cidade.'
                  : 'Atualizando pontos de coleta… Os resultados anteriores continuam disponíveis.'}
              </span>
              <Button size="sm" variant="ghost" onClick={cancel}>
                Cancelar
              </Button>
            </>
          ) : (
            <span>
              {result.freshness === 'official'
                ? `Dados municipais de Indaiatuba. Fontes consultadas em ${new Date(`${result.fetchedAt}T12:00:00`).toLocaleDateString('pt-BR')}.`
                : result.freshness === 'stale'
                  ? 'Exibindo a última consulta salva: o serviço não respondeu à atualização.'
                  : 'Selecione um ponto no mapa ou na lista para ver detalhes.'}
            </span>
          )}
        </div>
        {result.warning && <p className="map-progress">{result.warning}</p>}
        {error && (
          <Alert variant={errorKind === 'location' ? 'default' : 'destructive'}>
            <AlertTitle>
              {errorKind === 'location'
                ? 'Não conseguimos localizar este dispositivo'
                : 'Não foi possível atualizar os pontos'}
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Suspense
          fallback={
            <div className="map-loading" role="status">
              Carregando mapa…
            </div>
          }
        >
          <EcopointMap
            loading={status === 'loading'}
            onCancel={cancel}
            focus={focus}
            queryCenter={center}
            radius={resultRadius}
            userLocation={userLocation}
            points={points}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onViewportChange={onViewportChange}
            fitVersion={fitVersion}
            recenterVersion={recenterVersion}
          />
        </Suspense>
        <p className="search-source">
          Pontos municipais:{' '}
          <a
            href="https://www.indaiatuba.sp.gov.br/urbanismo/coleta-seletiva/"
            target="_blank"
            rel="noreferrer"
          >
            Prefeitura de Indaiatuba
          </a>
          . Mapa e dados colaborativos:{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap contributors
          </a>{' '}
          · Localidades: Nominatim. Confirme os materiais e horários antes do
          descarte. Distâncias em linha reta.
        </p>
      </div>
    </div>
  )
}
