import type { ReactNode } from 'react'
import { Recycle } from 'lucide-react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header page-width">
        <a href="#" className="brand" aria-label="EcoPerto — início">
          <Recycle aria-hidden="true" />
          <span>
            Eco<span className="text-primary">Perto</span>
          </span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#explorar">Explorar</a>
          <a href="#materiais">Materiais</a>
          <a href="#sobre">O projeto</a>
        </nav>
      </header>
      <main id="conteudo" className="page-width">
        {children}
      </main>
      <footer className="site-footer page-width">
        <span>EcoPerto · Descarte com consciência.</span>
        <span>Feito para aproximar pessoas e soluções.</span>
      </footer>
    </>
  )
}
