# EcoPerto

Aplicação web para aproximar pessoas de ecopontos e pontos de coleta. Planejamento: [docs/contexto.md](contexto.md).

## Desenvolvimento

Requisitos: Node.js 22.12 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Não são necessárias credenciais ou variáveis de ambiente nesta fase.

| Comando                | Finalidade                               |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento              |
| `npm run typecheck`    | Verificação TypeScript em modo estrito   |
| `npm run lint`         | Análise estática com Oxlint              |
| `npm run format`       | Formatação com Prettier                  |
| `npm run format:check` | Conferir formatação sem alterar arquivos |
| `npm run build`        | Typecheck e build de produção em `dist/` |
| `npm run preview`      | Servir o build localmente                |

## Estado atual

Fase 1 concluída: React + TypeScript + Vite, Tailwind CSS 4, shadcn/ui (Radix), aliases `@/`, layout responsivo em português e modelo interno de ecoponto. Fontes servidas localmente.

A tela inicial é uma estrutura de apresentação. Os controles de busca estão desabilitados e identificados como indisponíveis. Ainda não há mapa, consulta de ecopontos, geolocalização ou geocodificação. Nenhuma localização é solicitada ou armazenada.

## Organização

```text
src/
  app/                 composição da aplicação
  components/layout/   estrutura visual compartilhada
  components/ui/       componentes shadcn/ui
  domain/types/        modelo interno e categorias de materiais
  features/search/     interface e futura orquestração de busca
  lib/                 utilitários compartilhados
  styles/              identidade visual e layout responsivo
```

Criar `services/overpass`, `services/official-data`, `components/map`, `features/location` e regras de domínio quando houver implementação correspondente. Componentes não deverão consumir diretamente o formato da Overpass. Materiais desconhecidos nunca devem ser considerados aceitos.

## Próxima etapa

Implementar a fase 2: Leaflet + React Leaflet, mapa OSM com atribuição, geolocalização mediante ação do usuário e adaptador Overpass. Antes das consultas públicas, validar políticas de uso, cancelamento, limites e estados de erro. A escolha do provedor de geocodificação continua pendente.

## Qualidade e publicação

O workflow de CI verifica instalação pelo lockfile, formatação, lint e build em pushes e pull requests. O build já inclui verificação de tipos.

Para a futura Vercel: preset Vite, instalação `npm ci`, build `npm run build`, saída `dist`. O deploy não foi realizado.

Verificação inicial em navegador: desktop 1440px e celular 390px, sem overflow horizontal ou erros de JavaScript, âncoras funcionais e controles de busca desabilitados. A validação completa de acessibilidade e com usuários fica para as próximas fases.

`npm audit --omit=dev` não aponta vulnerabilidades. A CLI de desenvolvimento `shadcn` tem três avisos de baixa severidade na cadeia `deepmerge` / `@shadcn/registry`; acompanhar atualização upstream. A CLI não é importada pela aplicação. Não aplicar downgrade automático com `npm audit fix --force`.

Configuração baseada nas documentações de [Vite](https://vite.dev/guide/), [Tailwind para Vite](https://tailwindcss.com/docs/installation/using-vite) e [shadcn/ui](https://ui.shadcn.com/docs/installation/vite).
