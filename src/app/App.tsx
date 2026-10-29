import { ArrowUpRight, MapPin, Recycle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AppShell } from '@/components/layout/app-shell'
import { EcopointSearch } from '@/features/search/ecopoint-search'
import { MATERIALS } from '@/domain/types/ecopoint'

export default function App() {
  return (
    <AppShell>
      <section
        id="explorar"
        className="explore-section"
        aria-labelledby="explore-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pontos de coleta</p>
            <h1 id="explore-title">Seu descarte tem um lugar certo.</h1>
          </div>
          <Badge variant="outline">Sem cadastro</Badge>
        </div>
        <EcopointSearch />
      </section>

      <section
        id="materiais"
        className="materials-section"
        aria-labelledby="materials-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Antes de sair de casa</p>
            <h2 id="materials-title">Cada material tem seu lugar.</h2>
          </div>
          <p className="section-note">
            A aceitação varia por ponto de coleta.
            <br />
            Confirme as informações antes do descarte.
          </p>
        </div>
        <ul className="materials-list">
          {Object.entries(MATERIALS).map(([id, name], index) => (
            <li key={id}>
              <span className="material-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{name}</span>
              <Recycle className="size-5" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      <Separator />
      <section
        id="sobre"
        className="about-section"
        aria-labelledby="about-title"
      >
        <MapPin className="size-7 text-primary" aria-hidden="true" />
        <div>
          <h2 id="about-title">Informação que aproxima.</h2>
          <p>
            Um projeto de extensão universitária que une tecnologia, educação
            ambiental e acesso à informação. A cobertura dependerá dos dados
            disponíveis em cada região.
          </p>
        </div>
        <Button asChild variant="outline">
          <a
            href="https://www.openstreetmap.org/about"
            target="_blank"
            rel="noreferrer"
          >
            Conheça o OpenStreetMap{' '}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </a>
        </Button>
      </section>
    </AppShell>
  )
}
