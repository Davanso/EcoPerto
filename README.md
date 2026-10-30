<div align="center">

<img src="public/favicon.svg" width="72" height="72" alt="" />

# EcoPerto

**Descarte consciente, mais perto.**

Tecnologia e educação ambiental para conectar pessoas aos pontos de coleta da sua região.

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Leaflet

[O projeto](docs/contexto.md) · [Guia de desenvolvimento](docs/desenvolvimento.md)

</div>

---

### ♻️ Um novo caminho para seus resíduos

O EcoPerto está sendo desenvolvido para ajudar você a encontrar ecopontos, consultar os materiais aceitos e descobrir onde descartar com consciência — sem precisar de cadastro.

**Agora:** mapa em tons de cinza com pontos destacados, lista sincronizada, distâncias e rotas. Busque por cidade, pela área do mapa ou pela localização do dispositivo, com raio de 5, 10 ou 20 km.

**Região piloto:** Indaiatuba (SP), com quatro ecopontos de fonte municipal disponíveis mesmo quando a Overpass falha. [Conheça as fontes](docs/fontes-indaiatuba.md).

> Dados municipais e OpenStreetMap, com origem identificada. A localização depende da permissão e do suporte do navegador; a busca por cidade funciona sem ela. Sem histórico pessoal salvo.

### 🚀 Rodar localmente

Com **Node.js 22.12+** e **npm** instalados:

```sh
npm ci
npm run dev
```

Abra o endereço exibido no terminal. Para usar as integrações de produção, copie `.env.example` para `.env.local` e configure as variáveis abaixo. Sem credenciais, a busca tenta a Overpass pública e mantém os dados municipais disponíveis; o cálculo de rotas exige uma chave.

### 🗺️ APIs e fontes de dados

| Serviço                                                                                                                                  | Uso no EcoPerto                                                                                                                                                        | Configuração                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Overpass / NextGIS](https://docs.nextgis.com/docs_ngcom/source/services.html)                                                           | Consulta pontos cadastrados no OpenStreetMap com `amenity=recycling`, por coordenadas e raio de 5, 10 ou 20 km. NextGIS é o provedor configurado em produção.          | `OVERPASS_URL`: URL completa gerada pelo NextGIS, incluindo a chave.     |
| [Overpass / Private.coffee](https://overpass.private.coffee/)                                                                            | Alternativa pública quando o provedor configurado falha; também é o padrão sem `OVERPASS_URL`.                                                                         | Sem chave; sujeito à disponibilidade do serviço.                         |
| [Nominatim](https://nominatim.org/release-docs/latest/api/Search/)                                                                       | Converte a pesquisa de cidade, bairro ou endereço em coordenadas, inclusive para escolher a origem da rota. Consulta somente ao enviar o formulário, sem autocomplete. | Usa o endpoint público por padrão. `NOMINATIM_URL` permite substituí-lo. |
| [openrouteservice Directions](https://giscience.github.io/openrouteservice/api-reference/endpoints/directions/requests-and-return-types) | Calcula rotas de carro com o perfil `driving-car`. A geometria GeoJSON desenha o trajeto no mapa; a resposta também fornece distância e duração estimada.              | `ORS_API_KEY`: chave enviada pelo servidor no header `Authorization`.    |
| [Tiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)                                                              | Imagens do mapa-base, exibidas pelo Leaflet com atribuição aos colaboradores. Leaflet é a biblioteca de visualização, não a fonte dos ecopontos.                       | Acesso direto pelo navegador, sem chave.                                 |

A posição do dispositivo vem da **API de Geolocalização do navegador**, com permissão do usuário; não vem do NextGIS ou do openrouteservice. Os quatro ecopontos municipais de Indaiatuba complementam a busca global e funcionam como cobertura parcial quando ela falha. A cobertura em outras cidades depende dos registros existentes no OpenStreetMap.

As integrações de busca e rota passam pelas nossas APIs, compartilhadas pelo Vite local e pelas funções da Vercel:

| Endpoint                                         | Função                                                                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `GET /api/ecopoints?lat=...&lon=...&radius=5000` | Busca e normaliza os ecopontos, com cache e indicação da origem/atualidade dos dados.                                 |
| `GET /api/places?q=...`                          | Pesquisa localidades e endereços, com cache e controle de frequência por processo.                                    |
| `POST /api/routes`                               | Recebe origem/destino no corpo JSON e retorna o trajeto, metros e segundos. Resposta sem cache ou histórico de rotas. |

> **Credenciais ficam no servidor:** use `.env.local` no desenvolvimento e variáveis de ambiente na Vercel, com novo deploy após alterá-las. Nunca use prefixo `VITE_` para chaves nem publique o conteúdo do `.env`. A chave NextGIS já está na `OVERPASS_URL`; uma variável separada `OVERPASS_KEY` não é consumida pelo app.

Não usamos a API do Google Maps. O botão **Navegar** apenas abre um link externo de navegação. As rotas internas usam openrouteservice, sem trânsito em tempo real ou navegação por voz. [Detalhes da integração de rotas](docs/rotas-no-app.md).

### 🛠️ Comandos úteis

| Comando           | O que faz                        |
| ----------------- | -------------------------------- |
| `npm run build`   | Verifica os tipos e gera o build |
| `npm run lint`    | Analisa a qualidade do código    |
| `npm test`        | Executa os testes automatizados  |
| `npm run format`  | Formata os arquivos              |
| `npm run preview` | Abre uma prévia do build         |

Para verificar as APIs publicadas: `npm run check:deployment -- https://eco-perto.vercel.app`.

---

<div align="center">

Um projeto de extensão universitária que aproxima **pessoas, sustentabilidade e informação**.

</div>
