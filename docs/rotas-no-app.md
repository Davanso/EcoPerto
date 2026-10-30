# Rotas dentro do EcoPerto

Implementado em 30/10/2026. Integração e revisão visual aprovadas pelo titular.

## Fluxo

1. Selecione um ecoponto no mapa ou na lista. O painel **Como chegar** mostra o destino.
2. Use **Sair da minha localização**, ou **Escolher outro endereço** e selecione uma origem encontrada. Uma cidade representa seu centro, não a posição pessoal.
3. **Traçar rota de carro** desenha o caminho viário em azul e mostra distância e duração estimada. **Ver rota** reenquadra o trajeto e **Remover rota** limpa a linha.

A localização só é solicitada por ação explícita. Coordenadas do dispositivo continuam arredondadas a três casas decimais; o ponto azul mantém a incerteza. Origens manuais usam um marcador **A**, sem se passar pela posição do usuário. A posição real obtida continua disponível se o cálculo de rota falhar ou a linha for removida.

Rotas são planejamento de carro, sem trânsito em tempo real, voz, acompanhamento contínuo ou recálculo automático. Origem/chegada podem ser ajustadas à via mais próxima; confirme a entrada do ecoponto. A navegação externa permanece disponível.

## Serviço e configuração

Usa [openrouteservice Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/), perfil `driving-car`, com [resposta GeoJSON](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/requests-and-return-types). Não usa servidor público de demonstração como dependência presumida.

Configure `ORS_API_KEY` em `.env.local` (ou `.env`) e reinicie o Vite. Na Vercel, configurar a variável de servidor antes de um futuro deploy. Nunca usar `VITE_ORS_API_KEY`. Não há chave ou coordenadas pessoais nos commits.

- `POST /api/routes`, JSON `{ origin: { latitude, longitude }, destination: { latitude, longitude } }`.
- O servidor chama `POST https://api.openrouteservice.org/v2/directions/driving-car/geojson` com a chave no header `Authorization`. A chave não chega ao navegador.
- Retorno interno: `{ coordinates: [longitude, latitude][], distanceMeters, durationSeconds }`. Leaflet converte a ordem e desenha a geometria retornada, sem inventar segmentos em linha reta.
- Coordenadas validadas, corpo até 4 KiB, distância inicial até 100 km, duas consultas concorrentes por processo, prazo externo de 15 s e do cliente de 18 s. Cancelar ou trocar destino impede uma resposta antiga de reaparecer.
- Rota inexistente: 404; entrada inválida: 400; limite: 429; resposta inválida: 502; provedor indisponível/chave ausente: 503. Erros públicos não expõem respostas internas ou credenciais.
- Resposta `no-store`, sem cache ou histórico de rotas. Origem/destino vão no corpo POST da API local, não na URL. Logs próprios registram evento, duração e ID da requisição, sem coordenadas. O serviço externo recebe os locais conforme aviso da interface.
- Atribuição visível: © openrouteservice · © OpenStreetMap contributors. Limites e condições do plano devem ser acompanhados na conta do titular.

## Validação

Testes automatizados usam GPS e respostas do provedor simulados apenas nos arquivos de teste. Cobrem autenticação no servidor, geometria, distância/duração, enquadramento, origem manual, permissão negada, cancelamento, troca/retorno ao destino, quota, entrada/corpo inválido e ausência de cache.

Chamada HTTP real local, com a chave configurada pelo titular e origem pública no centro de Indaiatuba até o Ecoponto Quintal: HTTP 200, 3.413,3 m, 329,8 s e 86 vértices de geometria. A medição pontual de 1.287 ms não representa SLA. Nenhuma posição pessoal foi usada nessa validação.

Validação final: 59 testes passaram, além de build, lint, formatação e diff sem erros. No navegador local, a origem manual Praça Prudente de Moraes até o Ecoponto Quintal retornou 3,3 km / 5 min, com linha azul pelas ruas e marcador A. Console sem erros no fluxo.

Revisão visual: origem manual usa o mesmo pin, dimensões e âncora do destino, com A em azul. Painel compacto com origem/endereço, explicações e fontes expansíveis; atalhos redundantes removidos. Layout conferido em 390 e 320 px, inclusive com origem expandida, sem overflow horizontal. 61 testes passam, além de build, lint e formatação. Durante esta revisão o provedor de rotas apresentou timeout; os estados de falha permaneceram utilizáveis. Revisão visual aprovada para commit e publicação pelo fluxo do repositório.

Correção de produção em 30/10/2026: diagnóstico confirmou HTTP 403 no openrouteservice e resposta HTML/HTTP 200 no NextGIS. Configurações de Production sincronizadas com os valores locais fornecidos pelo titular, preservados como secrets; novo deploy validou rota real com 84 vértices e HTTP 200, Campinas com quatro pontos OSM e São Paulo com 25. Respostas não JSON agora são identificadas como falha do provedor, com logs estruturais sem texto/segredos/coordenadas. Colar valores com espaços ou aspas externas é normalizado no servidor. A ação de rota fecha o popup antes de abrir o planejador. Smoke de deploy também verifica POST de rota usando apenas dois locais públicos.
