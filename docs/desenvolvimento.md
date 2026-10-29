# EcoPerto

Aplicação web para aproximar pessoas de ecopontos e pontos de coleta. Planejamento: [docs/contexto.md](contexto.md).

## Desenvolvimento

Requisitos: Node.js 22.12 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Não são necessárias credenciais ou variáveis de ambiente nesta fase.

| Comando                | Finalidade                                     |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                    |
| `npm run typecheck`    | Verificação TypeScript em modo estrito         |
| `npm run lint`         | Análise estática com Oxlint                    |
| `npm test`             | Testes de integração e normalização com Vitest |
| `npm run format`       | Formatação com Prettier                        |
| `npm run format:check` | Conferir formatação sem alterar arquivos       |
| `npm run build`        | Typecheck e build de produção em `dist/`       |
| `npm run preview`      | Servir o build localmente                      |

## Estado atual

Fases 1 e 2 implementadas: React + TypeScript + Vite, Tailwind CSS 4, shadcn/ui (Radix), Leaflet + React Leaflet, aliases `@/`, layout responsivo e modelo interno de ecoponto. Fontes servidas localmente.

A busca começa somente ao clicar em uma ação. O mapa abre no centro de São Paulo (SP), região piloto explicitamente identificada, sem representar a localização do usuário. É possível buscar em um raio de 5 km do centro do mapa ou autorizar a localização. Mover o mapa não executa consultas. Marcadores exibem informações disponíveis e links para a fonte; nomes e fontes também estão acessíveis fora do mapa.

Não há geocodificação, filtros, distâncias, ordenação ou lista sincronizada nesta fase. A lista simples de nomes é uma alternativa de acesso às fontes.

## Integrações e privacidade

- A localização é solicitada apenas por clique; coordenadas do dispositivo são arredondadas para três casas decimais antes de uso, e a incerteza é ampliada em 100 m. Permanecem apenas em memória, sem localStorage, cookies ou histórico próprio.
- A consulta GET envia a área ao serviço Overpass em sua URL. Tiles também revelam a área visualizada ao provedor do mapa. Os provedores recebem requisições normais de rede; ausência de histórico no EcoPerto não significa ausência de logs externos.
- Endpoint padrão: `https://overpass-api.de/api/interpreter`. Para substituir, copie `.env.example` para `.env.local`, altere `VITE_OVERPASS_URL` e reinicie o Vite. Variáveis `VITE_*` são públicas: nunca incluir segredos.
- Consultas limitadas a 5 km, timeout no servidor de 25 s e no cliente de 35 s, sem polling ou retry automático. Uma operação por vez na interface. Cancelamento impede respostas tardias de alterar resultados. Recusas 406/429 bloqueiam novas consultas por um minuto na sessão.
- Dados externos são normalizados; coordenadas inválidas e acessos privados são descartados. Só tags `recycling:*=yes` confirmam materiais. IDs incluem origem e tipo OSM. Respostas parciais com `remark` são tratadas como falha, não ausência de resultados.
- Tiles HTTPS com atribuição visível e cache normal do navegador, sem download em massa ou prefetch. [Política de tiles](https://operations.osmfoundation.org/policies/tiles/) e [uso compartilhado da Overpass](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html).

A instância pública é adequada a esta prova de conceito de baixo volume. Antes de publicação ampla, escolher infraestrutura apropriada e revisar cache e limites agregados. Não presumir disponibilidade ou capacidade de produção.

## Organização

```text
src/
  app/                 composição da aplicação
  components/layout/   estrutura visual compartilhada
  components/map/      mapa e marcadores, carregados sob demanda
  components/ui/       componentes shadcn/ui
  domain/types/        modelo interno e categorias de materiais
  features/search/     interface e futura orquestração de busca
  features/location/   acesso consentido à geolocalização
  services/overpass/    consulta e normalização dos dados externos
  lib/                 utilitários compartilhados
  styles/              identidade visual e layout responsivo
```

Criar `services/official-data` e regras de domínio quando houver implementação correspondente. Componentes consomem o modelo interno, sem depender do formato Overpass. Materiais desconhecidos nunca devem ser considerados aceitos.

## Próxima etapa

Implementar a fase 3: lista e mapa sincronizados, cálculo e ordenação de distâncias, filtros por material, detalhes, navegação externa e busca por localidade. A escolha do provedor de geocodificação continua pendente.

## Qualidade e publicação

O workflow de CI verifica instalação pelo lockfile, formatação, lint, testes e build em pushes e pull requests. O build já inclui verificação de tipos.

Para a futura Vercel: preset Vite, instalação `npm ci`, build `npm run build`, saída `dist`. O deploy não foi realizado.

Validação em 29/10/2026: 16 testes automatizados cobrem normalização, campos desconhecidos, dados parciais, falhas HTTP/rede, cancelamento e erros de geolocalização. Verificação em navegador desktop 1440px e celular 390px, sem overflow ou erros JavaScript. Com respostas controladas, foram verificados marcadores/popups, vazio, erro 429, permissão negada, cancelamento com callback tardio e arredondamento da localização; sem requisições automáticas ao carregar.

Cobertura piloto: consulta GET real a 5 km de `-23.55052, -46.63331` retornou 23 registros OSM e passou pela normalização. Isso verifica disponibilidade preliminar de registros, sem confirmar precisão ou atualização em campo. POST retornou 406, a instância alternativa Private.coffee não respondeu no prazo, e uma consulta GET pelo navegador retornou 502. O cliente trata essas falhas; a disponibilidade pública continua variável. Fixtures usadas nos testes de interface não são exibidas no produto. A validação completa de acessibilidade e com usuários permanece pendente.

`npm audit --omit=dev` não aponta vulnerabilidades. A CLI de desenvolvimento `shadcn` tem três avisos de baixa severidade na cadeia `deepmerge` / `@shadcn/registry`; acompanhar atualização upstream. A CLI não é importada pela aplicação. Não aplicar downgrade automático com `npm audit fix --force`.

Configuração baseada nas documentações de [Vite](https://vite.dev/guide/), [Tailwind para Vite](https://tailwindcss.com/docs/installation/using-vite) e [shadcn/ui](https://ui.shadcn.com/docs/installation/vite).
