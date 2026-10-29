import { lazy, Suspense, useCallback, useRef } from 'react'
import { LoaderCircle, LocateFixed, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { PILOT_LOCATION, type Coordinates } from '@/domain/types/location'
import { useEcopointSearch } from './use-ecopoint-search'

const EcopointMap = lazy(() => import('@/components/map/ecopoint-map'))

export function EcopointSearch() {
  const {
    status,
    points,
    error,
    focus,
    queryCenter,
    userLocation,
    search,
    cancel,
  } = useEcopointSearch()
  const viewport = useRef<Coordinates>(PILOT_LOCATION)
  const onViewportChange = useCallback((center: Coordinates) => {
    viewport.current = center
  }, [])
  const busy = status === 'loading' || status === 'locating'

  return (
    <div className="flex flex-col gap-4">
      <div className="search-preview">
        <div className="search-options">
          <h3>Por onde vamos começar?</h3>
          <p>
            Use sua localização ou mova o mapa e busque na área que você
            escolher. O raio de pesquisa é de 5 km a partir do centro do mapa.
          </p>
          <div className="flex flex-col gap-3">
            <Button size="lg" disabled={busy} onClick={() => void search()}>
              <LocateFixed data-icon="inline-start" aria-hidden="true" /> Usar
              minha localização
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              onClick={() => void search(viewport.current)}
            >
              <Search data-icon="inline-start" aria-hidden="true" /> Buscar
              nesta área
            </Button>
            {busy && (
              <Button variant="ghost" onClick={cancel}>
                Cancelar busca
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            O mapa começa no centro de São Paulo (SP), nossa região piloto. Isso
            não representa sua localização.
          </p>
          <p className="text-sm text-muted-foreground">
            Ao buscar, a área consultada é enviada à Overpass. O mapa usa
            serviços do OpenStreetMap. Sua localização é aproximada e não é
            salva em histórico.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="map-loading" role="status">
              Carregando mapa…
            </div>
          }
        >
          <EcopointMap
            focus={focus}
            queryCenter={queryCenter}
            userLocation={userLocation}
            points={points}
            onViewportChange={onViewportChange}
          />
        </Suspense>
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="search-status"
      >
        {busy && (
          <p className="flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            {status === 'locating'
              ? 'Aguardando a localização do dispositivo…'
              : 'Consultando pontos de coleta em até 5 km…'}
          </p>
        )}
        {status === 'idle' && (
          <p>
            Escolha uma área e inicie a busca. Mover o mapa não faz consultas
            automaticamente.
          </p>
        )}
        {status === 'success' && points.length > 0 && (
          <p>
            <strong>
              {points.length}{' '}
              {points.length === 1 ? 'ponto encontrado' : 'pontos encontrados'}
            </strong>{' '}
            na última área consultada. Selecione um marcador para ver
            informações. Mover o mapa não atualiza esses resultados.
          </p>
        )}
      </div>
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível concluir a busca</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {status === 'success' && points.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              Nenhum ponto cadastrado foi encontrado nesta busca.
            </EmptyTitle>
            <EmptyDescription>
              Isso não significa que não existam ecopontos na região. Mova o
              mapa para consultar outra área. A cobertura do OpenStreetMap varia
              por localidade.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {points.length > 0 && (
        <details className="search-accessible-results">
          <summary>Consultar nomes e fontes dos pontos encontrados</summary>
          <ul>
            {points.map((point) => (
              <li key={point.id}>
                <a href={point.sourceUrl} target="_blank" rel="noreferrer">
                  {point.name}
                </a>
                {point.address && <span> — {point.address}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="search-source">
        Dados colaborativos:{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors
        </a>
        . Confirme materiais e horários antes de sair.{' '}
        <a
          href="https://dev.overpass-api.de/overpass-doc/en/preface/commons.html"
          target="_blank"
          rel="noreferrer"
        >
          Sobre o serviço Overpass
        </a>
        .{' '}
        <a
          href="https://www.openstreetmap.org/fixthemap"
          target="_blank"
          rel="noreferrer"
        >
          Informar um problema no mapa
        </a>
        .
      </p>
    </div>
  )
}
