import { LocateFixed, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function SearchPreview() {
  return (
    <div className="search-preview">
      <div className="search-options">
        <h3>Por onde vamos começar?</h3>
        <p>
          Você poderá usar sua localização ou informar uma localidade para
          encontrar pontos próximos.
        </p>
        <div className="flex flex-col gap-3">
          <Button size="lg" disabled aria-describedby="search-availability">
            <LocateFixed data-icon="inline-start" aria-hidden="true" /> Usar
            minha localização
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled
            aria-describedby="search-availability"
          >
            <Search data-icon="inline-start" aria-hidden="true" /> Buscar por
            localidade
          </Button>
        </div>
        <p id="search-availability" className="text-sm text-muted-foreground">
          Busca disponível em breve. Sua localização só será solicitada quando
          você escolher usá-la.
        </p>
      </div>
      <Empty className="map-preview">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Map aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Um mapa de possibilidades, em breve.</EmptyTitle>
          <EmptyDescription>
            Os pontos de coleta aparecerão aqui após a integração da busca.
            Ainda não há uma consulta ativa.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
