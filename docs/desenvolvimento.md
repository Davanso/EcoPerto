# Desenvolvimento do EcoPerto

## Executar

Node.js 22.12+ e npm:

```sh
npm ci
npm run dev
```

O Vite serve a interface e as APIs locais. `npm run preview` também inclui as APIs; servir apenas os arquivos de `dist/` em um servidor estático não substitui as funções.

| Comando                | Finalidade                              |
| ---------------------- | --------------------------------------- |
| `npm run typecheck`    | Verificação TypeScript                  |
| `npm run lint`         | Análise estática                        |
| `npm test`             | Testes Vitest, incluindo hooks em jsdom |
| `npm run format:check` | Conferir formatação                     |
| `npm run build`        | Verificar tipos e gerar `dist/`         |

## Fluxo do mapa

O mapa abre em **Indaiatuba (SP)**, região escolhida para validação. Isso não representa a localização do visitante. Quatro ecopontos municipais verificados nas fontes públicas aparecem imediatamente. A atualização colaborativa é solicitada em segundo plano; mover o mapa não dispara consultas. A base é cinza, os pontos são numerados e a seleção funciona pela lista e pelo mapa.

Pesquisa por cidade/bairro, raio de 5/10/20 km, distâncias em linha reta, lista ordenada, detalhes, atribuição e link para rota externa estão disponíveis. Materiais ainda não possuem filtro interativo.

Fontes e critérios: [fontes-indaiatuba.md](fontes-indaiatuba.md). Cada registro mantém origem e ID; registros municipais e OSM não são mesclados por mera proximidade, portanto duplicidades entre fontes ainda podem ocorrer. Coordenadas inválidas, acesso privado e respostas parciais Overpass são rejeitados; materiais ausentes permanecem desconhecidos.

## Localização

Apenas o clique em “Usar minha localização” solicita permissão. A primeira tentativa aceita uma posição recente do dispositivo (até cinco minutos). Se o provedor falhar, ocorre uma segunda tentativa com maior precisão. Um limite independente de 20 segundos encerra navegadores que não chamam os callbacks. Permissão negada não causa repetição; cancelamento ignora respostas tardias.

O navegador precisa disponibilizar a API, um contexto seguro e acesso à localização do sistema. Não é possível obrigar um navegador interno a fornecer coordenadas. Neste ambiente o navegador interno expirou sem posição; a obtenção física de GPS não foi comprovada. Os caminhos de sucesso, recusa, cancelamento e ausência de callback são testados automaticamente; a busca real por cidade foi validada no navegador.

Coordenadas do dispositivo são arredondadas a três casas decimais, com 100 m adicionados à incerteza exibida. O marcador azul “Você” usa uma camada acima dos ecopontos; o enquadramento de resultados inclui a posição obtida. “Centralizar em mim” reenquadra sem uma nova consulta de localização. Sem coordenadas, a interface informa “posição ainda não obtida”; pesquisar uma cidade não cria uma posição pessoal.

Não há histórico, cookies ou localStorage de localização. Área e consulta de cidade são enviadas à API do EcoPerto e aos provedores externos; os tiles também revelam a região visualizada. O cache de respostas no servidor é temporário, sem banco de dados; isso não elimina logs de infraestrutura externa.

## APIs

- `GET /api/ecopoints?lat=...&lon=...&radius=5000`: entrada validada, consultas limitadas a 5/10/20 km e arredondadas a três casas. Overpass principal e Private.coffee são tentadas sequencialmente, sem retry contínuo. Cada instância tem prazo de 14 s; falhas a pausam por um minuto. Requisições iguais em andamento são compartilhadas. Cache de três minutos, até 100 áreas; resultados anteriores de até uma hora podem ser usados com indicação de desatualização.
- `GET /api/places?q=...`: Nominatim somente mediante envio do formulário, sem autocomplete. Cache de até 100 consultas e limite de uma requisição por 1,1 s por processo. Resultados repetidos de localidades são removidos.
- Ambos usam identificação `EcoPerto` e link do repositório no User-Agent. O cliente pode cancelar sua operação sem derrubar uma consulta compartilhada do servidor.

As APIs locais e as funções em `api/` da Vercel usam o mesmo código de `server/`. Para trocar provedores, copie `.env.example` para `.env.local`, configure `OVERPASS_URL` e/ou `NOMINATIM_URL` e reinicie o Vite. Na Vercel, configure as variáveis no projeto. Não usar o antigo `VITE_OVERPASS_URL`.

Limites e cache são por processo, sem coordenação entre instâncias. Antes de publicação ampla, adotar provedores/infraestrutura adequados ao volume e controle agregado de tráfego. Serviços públicos continuam sujeitos a indisponibilidade; os quatro registros municipais de Indaiatuba funcionam independentemente da Overpass e nunca são apresentados como resultados de uma área distante.

Políticas consultadas: [Overpass](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html), [Private.coffee](https://overpass.private.coffee/), [Nominatim](https://operations.osmfoundation.org/policies/nominatim/), [tiles OSM](https://operations.osmfoundation.org/policies/tiles/). Tiles HTTPS com atribuição visível, cache normal do navegador e sem prefetch/download em massa.

## Organização

```text
api/                         funções Vercel
server/                      integrações, cache e limites das APIs
src/app/                     composição
src/components/map/          mapa, controle de câmera e marcadores
src/components/ui/           shadcn/ui
src/domain/                  modelos e cálculo de distância
src/features/location/       localização e pesquisa por cidade
src/features/ecopoints/      lista e seleção
src/features/search/         orquestração, cancelamento e estados
src/services/official-data/  informações municipais rastreáveis
src/services/overpass/       cliente e normalização OSM
src/services/places/         cliente da pesquisa de localidades
```

## Validação e publicação

Em 29/10/2026, os 32 testes passam, assim como build, lint e formatação. Testes incluem falhas dos provedores, cache, troca de instância, deduplicação de requisições, raio, preservação de resultados, StrictMode, GPS concedido/negado simulado, cancelamento e ausência de callback. Regressões da câmera verificam inclusão da posição do usuário nos limites, atualizações de resultados e centralização sem nova consulta.

Rotas internas ainda não estão integradas; proposta em [rotas-no-app.md](rotas-no-app.md). A navegação externa permanece disponível.

No navegador real: pesquisa por Indaiatuba, seleção do João Pioli, detalhes, link de rota, quatro marcadores e filtro cinza da base foram conferidos. Viewport de 390 px sem overflow horizontal. Overpass permaneceu indisponível durante parte da validação; a fonte municipal permaneceu utilizável. Nenhuma fixture de teste é usada como dado do produto.

CI executa instalação, formatação, lint, testes e build. Para Vercel: preset Vite, instalação `npm ci`, build `npm run build`, saída `dist/`, funções em `api/` com duração configurada em `vercel.json`. Deploy ainda não realizado. A auditoria de dependências de produção não aponta vulnerabilidades; permanecem três avisos de baixa severidade na CLI de desenvolvimento shadcn.
