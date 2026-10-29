import { ArrowDown, ArrowUpRight, Leaf, MapPin, Recycle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AppShell } from '@/components/layout/app-shell'
import { EcopointSearch } from '@/features/search/ecopoint-search'
import { MATERIALS } from '@/domain/types/ecopoint'

export default function App() {
  return (
    <AppShell>
      <section className="intro" aria-labelledby="intro-title">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary">
            <Leaf aria-hidden="true" /> Descarte consciente, mais perto
          </Badge>
          <h1 id="intro-title">
            O que sobra pode ter um <em>novo caminho.</em>
          </h1>
          <p className="intro-description">
            Encontre o lugar certo para seus resíduos. Explore o mapa e consulte
            pontos de coleta cadastrados na sua região.
          </p>
          <Button asChild size="lg">
            <a href="#explorar">
              Conheça a busca{' '}
              <ArrowDown data-icon="inline-end" aria-hidden="true" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Sem cadastro. Com informação sobre onde descartar.
          </p>
        </div>
        <div className="cycle-panel" aria-label="Do descarte ao recomeço">
          <div className="cycle-orbit" aria-hidden="true">
            <Recycle />
          </div>
          <span className="cycle-label">Separar. Encaminhar. Recomeçar.</span>
          <p>
            Um pequeno gesto.
            <br />
            <strong>Um caminho melhor.</strong>
          </p>
        </div>
      </section>

      <section
        id="explorar"
        className="explore-section"
        aria-labelledby="explore-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pontos de coleta</p>
            <h2 id="explore-title">O destino certo começa perto.</h2>
          </div>
          <Badge variant="outline">Mapa em versão inicial</Badge>
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
