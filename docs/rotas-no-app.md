# Proposta: rotas dentro do EcoPerto

Proposta discutida em 29/10/2026; integração ainda não implementada.

## Experiência

Ao selecionar um ecoponto, “Traçar rota” usa a posição obtida do dispositivo ou uma origem escolhida manualmente. Cidade pesquisada não equivale à posição pessoal. O mapa mostra o trajeto pelas ruas, distância e duração estimada; a ação para abrir navegação externa permanece disponível.

Começar com carro e depois oferecer caminhada/bicicleta. Nesta etapa, planejar o trajeto; navegação contínua com voz e recálculo automático exige outra avaliação de escopo e de localização.

## Integração candidata

Avaliar **openrouteservice Directions**, que retorna geometria GeoJSON, distância e duração. Referência: [serviço Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/) e [formatos de resposta](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/requests-and-return-types).

- `POST /api/routes` no EcoPerto, recebendo origem, destino e perfil permitido.
- Adaptador no servidor para `POST /v2/directions/{profile}/geojson`.
- Credencial do provedor somente em variável do servidor, nunca em `VITE_*` ou no repositório.
- Modelo interno com geometria, metros, segundos e atribuição; Leaflet desenha uma linha colorida sobre a base cinza.
- Calcular somente por ação explícita. Informar que origem/destino serão enviados ao provedor e manter os dados pessoais apenas pelo tempo necessário à requisição.
- Validar coordenadas, perfil, resposta, cancelamento e limite de tempo. Tratar rota inexistente, quota e falha de conexão; não substituir uma rota por uma linha reta apresentada como caminho viário.

Antes de ativar: selecionar a conta/credencial, verificar [limites vigentes](https://openrouteservice.org/restrictions/), atribuição, termos e volume previsto. Servidores públicos de demonstração de outros motores não devem ser a dependência de produção presumida.
