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

O mapa abre em **Indaiatuba (SP)**, região escolhida para validação. Isso não representa a localização do visitante. Quatro ecopontos municipais verificados nas fontes públicas aparecem imediatamente. A consulta da API é solicitada em segundo plano; mover o mapa não dispara consultas. A API consulta a fonte global em qualquer área e acrescenta os registros municipais disponíveis. Quando a fonte global falha, o resultado municipal vem com aviso explícito de cobertura parcial. Durante a busca, um overlay cobre todo o mapa e permite cancelar. A base é cinza, os pontos são numerados e a seleção funciona pela lista e pelo mapa.

Pesquisa por cidade/bairro, raio de 5/10/20 km, distâncias em linha reta, lista ordenada, detalhes, atribuição e link para rota externa estão disponíveis. Materiais ainda não possuem filtro interativo.

Fontes e critérios: [fontes-indaiatuba.md](fontes-indaiatuba.md). Cada registro mantém origem e ID; registros municipais e OSM não são mesclados por mera proximidade, portanto duplicidades entre fontes ainda podem ocorrer. Coordenadas inválidas, acesso privado e respostas parciais Overpass são rejeitados; materiais ausentes permanecem desconhecidos.

## Localização

Apenas o clique em “Usar minha localização” solicita permissão. A primeira tentativa aceita uma posição recente do dispositivo (até cinco minutos). Se o provedor falhar, ocorre uma segunda tentativa com maior precisão. Um limite independente de 20 segundos encerra navegadores que não chamam os callbacks. Permissão negada não causa repetição; cancelamento ignora respostas tardias.

O navegador precisa disponibilizar a API, um contexto seguro e acesso à localização do sistema. Não é possível obrigar um navegador interno a fornecer coordenadas. Neste ambiente o navegador interno expirou sem posição; a obtenção física de GPS não foi comprovada. Os caminhos de sucesso, recusa, cancelamento e ausência de callback são testados automaticamente; a busca real por cidade foi validada no navegador.

A interface lê o estado da permissão sem solicitar coordenadas e distingue bloqueio por política de um contexto incorporado, permissão negada, navegador sem suporte e página sem HTTPS. `Permissions-Policy: geolocation=(self)` permite a funcionalidade na própria origem, sem conceder permissão pelo usuário ou remover bloqueios do sistema/ancestral incorporador. Trocar o provedor de mapas não substitui a API de geolocalização do navegador.

Coordenadas do dispositivo são arredondadas a três casas decimais, com 100 m adicionados à incerteza exibida. O marcador azul “Você” usa uma camada acima dos ecopontos; o enquadramento de resultados inclui a posição obtida. “Centralizar em mim” reenquadra sem uma nova consulta de localização. Sem coordenadas, a interface informa “posição ainda não obtida”; pesquisar uma cidade não cria uma posição pessoal.

Não há histórico, cookies ou localStorage de localização. Área e consulta de cidade são enviadas à API do EcoPerto e aos provedores externos; os tiles também revelam a região visualizada. O cache de respostas no servidor é temporário, sem banco de dados; isso não elimina logs de infraestrutura externa.

## APIs

- `GET /api/ecopoints?lat=...&lon=...&radius=5000`: entrada validada, raio de 5/10/20 km. Retorna `{ points, freshness, fetchedAt }` com o modelo interno, sem depender do formato Overpass no navegador. Registros municipais complementam a consulta global; em falha 503 da fonte externa, são servidos com `freshness: official` e aviso de cobertura parcial. Isso é cobertura cadastral disponível, não afirmação de que não existem outros pontos.
- Overpass usa POST form-urlencoded, identificação do projeto, timeout de execução de 20 s e memória máxima de 16 MiB. Private.coffee é o padrão; `OVERPASS_URL`, quando configurada, é tentada antes dele. O endpoint principal alemão foi removido dos padrões após falhas e revisão de sua política de uso. Cada tentativa tem limite HTTP de 25 s; falhas pausam o provedor por 60 s. Cache por processo de uma hora (100 áreas), com dados desatualizados por até 24 h. Respostas globais bem-sucedidas também recebem cache CDN de uma hora; fallback municipal, apenas 60 s. Erros não recebem cache. O cliente aguarda até 55 s e a função Vercel tem orçamento de 60 s.
- `GET /api/places?q=...`: Nominatim somente mediante envio do formulário, sem autocomplete. Cache de até 100 consultas e limite de uma requisição por 1,1 s por processo. Resultados repetidos de localidades são removidos.
- Ambos usam identificação `EcoPerto` e link do repositório no User-Agent. O cliente pode cancelar sua operação sem derrubar uma consulta compartilhada do servidor.
- Falhas conhecidas têm código, ID de requisição e status adequado: 429 para limite, 502 para resposta inválida, 503 para provedor indisponível e 504 para timeout de localidades. Falhas internas inesperadas são 500. `Retry-After` orienta nova tentativa quando aplicável. Logs registram evento, host do provedor, status/tipo e correlação; não registram a cidade pesquisada, coordenadas ou URLs com credenciais.

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

Em 29/10/2026, os 44 testes passam, assim como build, lint e formatação. Testes incluem falhas dos provedores, cache, troca de instância, deduplicação de requisições, raio, preservação de resultados, StrictMode, GPS concedido/negado simulado, cancelamento e ausência de callback. Regressões da câmera verificam inclusão da posição do usuário nos limites, atualizações de resultados e centralização sem nova consulta. Testes HTTP reais com o handler Node validam contrato, 200 municipal, 400/405, códigos, `Retry-After`, correlação e não exposição de erros internos.

Rotas internas ainda não estão integradas; proposta em [rotas-no-app.md](rotas-no-app.md). A navegação externa permanece disponível.

No navegador real: pesquisa por Indaiatuba, seleção do João Pioli, detalhes, link de rota, quatro marcadores e filtro cinza da base foram conferidos. Viewport de 390 px sem overflow horizontal. Overpass permaneceu indisponível durante parte da validação; a fonte municipal permaneceu utilizável. Nenhuma fixture de teste é usada como dado do produto.

CI executa instalação, formatação, lint, testes e build. Para Vercel: preset Vite, instalação `npm ci`, build `npm run build`, saída `dist/`, funções em `api/` com duração configurada em `vercel.json`. Para conferir uma implantação pública, execute `npm run check:deployment -- https://eco-perto.vercel.app`: verifica HTTP e conteúdo de ecopontos em Indaiatuba, Campinas e São Paulo, além da pesquisa de cidade. O comando deve falhar quando a busca global estiver indisponível; somente o catálogo local não comprova a integração. Não é monitoramento agendado e não testa a posição física de GPS.

Na investigação do primeiro deploy, ecopontos retornou 503 da própria aplicação por indisponibilidade da Overpass; localidades retornou 200. A prévia da correção retornou 200 nas duas APIs. Após promoção para `https://eco-perto.vercel.app`, o teste público retornou 200/ecopontos em 322 ms (quatro registros) e 200/localidades em 169 ms. São medições pontuais, não garantia de latência. Busca e seleção de Indaiatuba também foram conferidas na interface publicada. A leitura da permissão nessa aba retornou o estado de solicitação, sem coordenadas obtidas; posição física não é comprovada pelo teste HTTP.

O projeto permanece sem Google conforme decisão do usuário: uma eventual migração precisaria avaliar faturamento, requisitos de mapa/atribuição e preservar fontes municipais confiáveis. A auditoria de dependências de produção não aponta vulnerabilidades; permanecem três avisos de baixa severidade na CLI de desenvolvimento shadcn.

### Investigação da busca global

A validação anterior de quatro pontos em Indaiatuba só comprovava o catálogo local, não a integração global. Em nova investigação, Campinas retornou 503 em produção após 29,5 s; os logs da Vercel mostraram timeout nas duas instâncias. Não havia variáveis de ambiente no projeto. GET e POST falharam localmente. Com POST, menor maxsize, identificação e prazo ampliado, o preview também retornou 503 em 25,5 s, com `overpass_failure/TimeoutError` em 25.005 ms. Uma terceira instância pública (VK Maps) respondeu 504. Não há evidência de chave ausente no serviço público nem de erro de sintaxe: nenhum teste recebeu 400. Não foi possível comprovar disponibilidade global com esses provedores.

Próxima alternativa sem Google: [NextGIS Overpass](https://docs.nextgis.com/docs_ngcom/source/services.html). O [anúncio oficial](https://nextgis.com/blog/nextgis-overpass-api-server/) e a documentação orientam criar conta e chave em **Software and services → Overpass API → Create API key**. Configurar a URL completa fornecida no segredo `OVERPASS_URL` da Vercel, em Production e Preview; fazer novo deploy e repetir o smoke em múltiplas cidades. A chave nunca deve ir em `VITE_*`, commits ou logs. O titular configurou `OVERPASS_URL` como segredo de Production na Vercel, e a integração foi validada com esse endpoint. A variável separada `OVERPASS_KEY` não é consumida pelo código; a URL completa fornecida pelo NextGIS já contém a autenticação. Preview e desenvolvimento local precisam de configuração própria. Outro candidato é [Overpass.ch](https://overpass.ch/pricing), com plano gratuito para projetos pessoais/educacionais e limites publicados; também exige chave. Nenhuma conta ou assinatura foi criada.

Fontes técnicas: [métodos e codificação Overpass](https://dev.overpass-api.de/command_line.html), [política Private.coffee](https://overpass.private.coffee/). O cache reduz chamadas e preserva consultas anteriores, mas não resolve a primeira consulta quando todos os provedores falham. Mesmo um serviço disponível só retorna pontos existentes na base OSM; cobertura mundial de consulta não garante cadastro completo em toda cidade.

Após a configuração pelo titular e novo deploy (`dpl_A2cRtqkmkR8XM5GiiQe76DCKKZYr`), todos os checks públicos passaram: Indaiatuba HTTP 200, quatro pontos, 741 ms; Campinas HTTP 200, quatro pontos OSM, 905 ms; São Paulo HTTP 200, 25 pontos OSM, 926 ms; localidades HTTP 200, 611 ms. Logs `overpass_success` confirmaram `overpass.nextgis.com` com respostas de Campinas em 557 ms e São Paulo em 505 ms. São medições pontuais, não SLA. Nenhum segredo foi recuperado ou incluído nos commits. O bloqueio anterior foi superado em produção com o provedor autenticado; a completude dos cadastros por cidade continua dependendo da base OSM.
