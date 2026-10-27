
# EcoPerto — Contexto e Planejamento do Projeto

> Documento de referência conceitual, funcional e técnica para orientar o desenvolvimento do EcoPerto.

## 1. Visão geral

O **EcoPerto** é uma aplicação web que permite localizar ecopontos e pontos de coleta de resíduos próximos ao usuário por meio de geolocalização.

O objetivo é facilitar o descarte adequado de materiais, centralizando informações sobre localização, tipos de resíduos aceitos, horários de funcionamento e rotas de acesso.

O aplicativo não será limitado a uma cidade específica. Sua abrangência dependerá da disponibilidade de informações confiáveis sobre os pontos de coleta em cada região.

O projeto também faz parte de uma iniciativa de extensão universitária voltada à sustentabilidade ambiental, educação e tecnologia.

## 2. Problema identificado

A população pode enfrentar dificuldades para encontrar informações claras e centralizadas sobre os ecopontos disponíveis.

Entre os principais problemas estão:

- Desconhecimento sobre a localização dos pontos de coleta.
- Informações distribuídas em diferentes sites e plataformas.
- Dificuldade para identificar quais materiais são aceitos.
- Falta de informações atualizadas sobre horários de funcionamento.
- Necessidade de consultar várias fontes antes de realizar o descarte.
- Descarte inadequado de resíduos por falta de orientação e acesso à informação.

### Problema central

Dificuldade de acesso a informações centralizadas, claras e atualizadas sobre a localização e o funcionamento dos pontos de coleta.

Esses problemas representam hipóteses iniciais que deverão ser investigadas com potenciais usuários.

## 3. Objetivos

### Objetivo geral

Desenvolver uma aplicação web baseada em geolocalização que facilite a identificação de ecopontos próximos ao usuário, promovendo o descarte adequado de resíduos e incentivando práticas sustentáveis.

### Objetivos específicos

1. Identificar dificuldades enfrentadas pela população na localização de ecopontos.
2. Reunir informações sobre pontos de coleta e materiais aceitos.
3. Desenvolver uma interface acessível, responsiva e intuitiva.
4. Permitir a identificação de ecopontos próximos à localização do usuário.
5. Implementar filtros por tipo de resíduo.
6. Disponibilizar informações e rotas para os pontos selecionados.
7. Avaliar a usabilidade da aplicação com potenciais usuários.
8. Incentivar a conscientização ambiental.

## 4. Público-alvo

O EcoPerto será direcionado à população em geral, especialmente pessoas que utilizam smartphones ou computadores e precisam encontrar locais adequados para descartar resíduos.

O público poderá incluir:

- Moradores de áreas urbanas e rurais.
- Estudantes.
- Trabalhadores.
- Famílias.
- Pessoas interessadas em reciclagem.
- Cidadãos que desconhecem os ecopontos de sua região.

A aplicação deverá utilizar linguagem simples e oferecer alternativas para usuários que não desejam compartilhar sua localização.

## 5. Proposta de valor

O EcoPerto pretende permitir que o usuário:

- Encontre pontos de coleta sem pesquisar em diversos sites.
- Descubra quais locais aceitam determinado material.
- Consulte informações antes de sair de casa.
- Identifique pontos próximos à sua localização.
- Abra rotas para chegar ao destino.
- Tome decisões mais conscientes sobre o descarte.

### Princípio central

O ecoponto mais próximo nem sempre será o mais adequado.

A aplicação deverá considerar também o tipo de resíduo que o usuário pretende descartar.

## 6. Jornada do usuário

1. O usuário acessa o EcoPerto.
2. Visualiza uma interface explicando a finalidade da aplicação.
3. Autoriza a geolocalização ou informa manualmente uma localidade.
4. O sistema consulta os ecopontos disponíveis na região.
5. Os resultados são apresentados em mapa e lista.
6. O usuário pode selecionar um tipo de material.
7. Os resultados são filtrados conforme as informações disponíveis.
8. O usuário seleciona um ecoponto.
9. A aplicação apresenta seus detalhes.
10. O usuário pode abrir uma rota para chegar ao local.

### Ausência de resultados

Quando não forem encontrados pontos cadastrados, a aplicação deverá:

- Informar que não há resultados disponíveis para a busca.
- Permitir aumentar o raio de pesquisa.
- Permitir remover filtros.
- Oferecer uma nova busca por localidade.

A ausência de resultados não deverá ser interpretada como inexistência de ecopontos na região.

## 7. Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React |
| Linguagem | TypeScript |
| Build | Vite |
| Estilização | Tailwind CSS |
| Componentes | shadcn/ui |
| Mapa | Leaflet + React Leaflet |
| Dados geográficos | OpenStreetMap |
| Busca de ecopontos | Overpass API |
| Dados complementares | Fontes oficiais |
| Geolocalização | Browser Geolocation API |
| Deploy | Vercel |
| Banco de dados | Não utilizar inicialmente |

### Diretrizes técnicas

- Desenvolver uma aplicação web responsiva.
- Priorizar a experiência mobile.
- Não exigir autenticação.
- Não implementar banco de dados no MVP.
- Separar interface, regras de negócio e integração com APIs.
- Permitir substituição futura dos provedores externos.
- Evitar complexidade desnecessária.

## 8. Funcionalidades do MVP

### 8.1. Geolocalização

Solicitar permissão para acessar a localização do usuário.

Requisitos:

- Solicitar localização somente mediante ação ou consentimento.
- Tratar permissão negada.
- Tratar indisponibilidade do GPS.
- Permitir pesquisa manual por localidade.
- Não armazenar localização precisa sem necessidade.

### 8.2. Mapa interativo

Utilizar Leaflet e OpenStreetMap.

Requisitos:

- Exibir mapa interativo.
- Mostrar marcadores dos ecopontos.
- Mostrar localização aproximada do usuário, quando autorizada.
- Permitir zoom e movimentação.
- Centralizar o mapa na região pesquisada.
- Permitir selecionar marcadores.

### 8.3. Busca por proximidade

Consultar pontos de coleta próximos ao usuário.

Requisitos:

- Utilizar inicialmente um raio de 5 km.
- Permitir ampliar o raio.
- Calcular distância aproximada entre usuário e ecoponto.
- Ordenar resultados por proximidade.
- Tratar ausência de resultados.

A distância inicial será calculada em linha reta, não representando necessariamente a distância percorrida por ruas.

### 8.4. Filtros por material

Permitir filtrar pontos conforme os resíduos aceitos.

Categorias iniciais:

- Papel e papelão.
- Plástico.
- Vidro.
- Metal.
- Eletrônicos.
- Pilhas e baterias.

Os filtros deverão considerar somente informações efetivamente disponíveis.

Um ponto com materiais desconhecidos não deverá ser apresentado como comprovadamente compatível.

### 8.5. Detalhes do ecoponto

Cada ponto poderá apresentar:

- Nome.
- Endereço.
- Localização no mapa.
- Distância aproximada.
- Materiais aceitos.
- Horários de funcionamento.
- Informações de contato.
- Fonte dos dados.
- Data da última verificação, quando disponível.

Campos desconhecidos deverão ser identificados como informações não disponíveis.

### 8.6. Rotas

Permitir abrir um serviço externo de navegação.

No MVP, não será necessário implementar um sistema próprio de cálculo de rotas.

### 8.7. Tratamento de erros

Prever estados específicos para:

- Carregamento.
- Falha de conexão.
- Erro na API.
- Localização negada.
- Localização indisponível.
- Nenhum resultado encontrado.
- Dados incompletos.
- Serviço externo temporariamente indisponível.

## 9. Funcionalidades fora do MVP

Não implementar inicialmente:

- Login.
- Cadastro de usuários.
- Avaliações.
- Comentários.
- Painel administrativo.
- Notificações.
- Histórico de descarte.
- Sistema de recompensas.
- Banco de dados persistente.

Essas funcionalidades poderão ser avaliadas futuramente.

## 10. Fontes de dados

### 10.1. OpenStreetMap

Utilizado como fonte de dados geográficos e cartográficos.

### 10.2. Overpass API

Utilizada para consultar pontos de reciclagem cadastrados no OpenStreetMap.

A integração deverá permitir:

- Consultar pontos em uma região.
- Obter coordenadas.
- Identificar informações disponíveis.
- Interpretar categorias de reciclagem.
- Normalizar os dados recebidos.

A cobertura poderá variar conforme a região.

### 10.3. Dados oficiais

Complementar informações com fontes públicas, como:

- Prefeituras.
- Secretarias municipais.
- Órgãos ambientais.
- Operadores responsáveis pelos ecopontos.

Priorizar informações verificáveis, respeitando licenças e condições de uso.

### 10.4. Limitações

Os dados do OpenStreetMap são abertos, mas a infraestrutura pública de mapas e consultas possui políticas e limites de utilização.

Antes da publicação, verificar:

- Limites de requisições.
- Regras de atribuição.
- Políticas de cache.
- Disponibilidade dos serviços.
- Necessidade de proxy ou cache.
- Restrições de geocodificação.

## 11. Arquitetura lógica

```text
Usuário
   |
   v
EcoPerto Web App
React + TypeScript + Vite
   |
   +-- Interface
   |     Tailwind + shadcn/ui
   |
   +-- Mapa
   |     React Leaflet + OpenStreetMap
   |
   +-- Localização
   |     Browser Geolocation API
   |     Busca manual
   |
   +-- Busca de ecopontos
         |
         +-- Camada de serviços
               |
               +-- Overpass API
               |
               +-- Dados oficiais
               |
               +-- Normalização
               |
               +-- Deduplicação
               |
               +-- Cálculo de distância
               |
               +-- Filtros
```

### Princípios arquiteturais

- Componentes não devem depender diretamente do formato da Overpass API.
- Os dados externos deverão ser convertidos para um modelo interno.
- A interface deverá consumir dados normalizados.
- As regras de distância e filtragem deverão ser independentes dos componentes visuais.
- A integração com fontes oficiais deverá ser extensível.
- Não criar abstrações sem necessidade concreta.

## 12. Estrutura inicial do projeto

```text
ecoperto/
|
+-- public/
|
+-- src/
|   |
|   +-- app/
|   |   +-- App.tsx
|   |
|   +-- components/
|   |   +-- ui/
|   |   +-- map/
|   |   +-- layout/
|   |
|   +-- features/
|   |   +-- location/
|   |   +-- ecopoints/
|   |   +-- search/
|   |
|   +-- services/
|   |   +-- overpass/
|   |   +-- official-data/
|   |
|   +-- domain/
|   |   +-- types/
|   |   +-- rules/
|   |
|   +-- hooks/
|   |
|   +-- lib/
|   |
|   +-- styles/
|   |
|   +-- main.tsx
|
+-- docs/
|
+-- index.html
+-- package.json
+-- README.md
```

### Responsabilidades

**app/**

Composição e inicialização da aplicação.

**components/**

Componentes visuais reutilizáveis, mapa e layout.

**features/location/**

Permissões de localização e busca manual.

**features/ecopoints/**

Listagem, detalhes e filtros dos ecopontos.

**features/search/**

Orquestração das buscas.

**services/**

Integração com APIs e fontes externas.

**domain/**

Modelos, normalização e regras de negócio.

**hooks/**

Hooks reutilizáveis.

**lib/**

Funções auxiliares, incluindo cálculos geográficos.

**docs/**

Documentação, pesquisas, decisões e validação do projeto.

## 13. Modelo de dados inicial

```ts
type Ecopoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  acceptedMaterials?: string[];
  openingHours?: string;
  source: "osm" | "official";
  sourceUrl?: string;
  lastVerifiedAt?: string;
  distanceMeters?: number;
};
```

### Regras

- O identificador deverá considerar a origem do dado.
- Campos ausentes não deverão ser preenchidos com valores inventados.
- Materiais desconhecidos não significam materiais aceitos.
- Distância em linha reta não equivale à distância de deslocamento.
- Informações oficiais e colaborativas poderão apresentar divergências.
- Registros de diferentes fontes deverão passar por verificação antes de serem mesclados.

## 14. Regras de negócio

### RN01 — Localização

A aplicação somente deverá utilizar a localização precisa do usuário após autorização.

### RN02 — Busca manual

O usuário deverá conseguir pesquisar sem conceder acesso à localização.

### RN03 — Proximidade

Os resultados poderão ser ordenados pela distância aproximada entre usuário e ecoponto.

### RN04 — Compatibilidade

A proximidade não garante que o ecoponto aceite o material desejado.

### RN05 — Dados desconhecidos

Informações ausentes deverão ser apresentadas como desconhecidas.

### RN06 — Origem dos dados

A aplicação deverá preservar a identificação da fonte das informações.

### RN07 — Cobertura

A ausência de resultados não significa que não existam ecopontos naquela região.

### RN08 — Privacidade

Não armazenar localização pessoal sem necessidade e finalidade claramente definidas.

### RN09 — Navegação

A rota poderá ser aberta em serviço externo.

### RN10 — Disponibilidade

A aplicação deverá tratar falhas dos serviços externos sem comprometer a navegação básica.

## 15. Plano de implementação

### Fase 1 — Inicialização

- [ ] Criar projeto Vite com React e TypeScript.
- [ ] Configurar Tailwind CSS.
- [ ] Configurar shadcn/ui.
- [ ] Definir organização inicial.
- [ ] Criar layout responsivo.
- [ ] Preparar componentes básicos.

**Entrega:** estrutura inicial executável.

### Fase 2 — Prova de conceito geográfica

- [ ] Integrar Leaflet.
- [ ] Exibir mapa OpenStreetMap.
- [ ] Implementar solicitação de geolocalização.
- [ ] Consultar pontos de reciclagem via Overpass.
- [ ] Exibir marcadores no mapa.
- [ ] Validar a cobertura dos dados em uma região piloto.

**Entrega:** mapa funcional com pontos reais consultados.

### Fase 3 — Experiência principal

- [ ] Criar lista de ecopontos.
- [ ] Calcular distâncias.
- [ ] Ordenar resultados.
- [ ] Implementar filtros.
- [ ] Criar visualização de detalhes.
- [ ] Sincronizar lista e mapa.
- [ ] Adicionar navegação externa.
- [ ] Implementar busca manual.

**Entrega:** fluxo principal completo.

### Fase 4 — Qualidade dos dados

- [ ] Pesquisar fontes oficiais.
- [ ] Criar adaptadores para os dados.
- [ ] Normalizar os registros.
- [ ] Identificar duplicidades.
- [ ] Registrar origem das informações.
- [ ] Tratar campos ausentes.
- [ ] Verificar licenças e políticas das fontes.

**Entrega:** dados mais consistentes e rastreáveis.

### Fase 5 — Testes

- [ ] Testar no desktop.
- [ ] Testar em smartphones.
- [ ] Verificar responsividade.
- [ ] Testar localização negada.
- [ ] Testar falhas da API.
- [ ] Testar filtros.
- [ ] Testar navegação.
- [ ] Avaliar acessibilidade básica.
- [ ] Realizar testes com voluntários.

**Entrega:** MVP validado funcionalmente.

### Fase 6 — Deploy

- [ ] Criar repositório.
- [ ] Configurar projeto na Vercel.
- [ ] Realizar build de produção.
- [ ] Publicar aplicação.
- [ ] Validar HTTPS.
- [ ] Testar geolocalização em produção.
- [ ] Verificar atribuições do OpenStreetMap.
- [ ] Validar limites das APIs.
- [ ] Documentar limitações conhecidas.

**Entrega:** EcoPerto publicado.

## 16. Critérios de aceite do MVP

O MVP será considerado funcional quando:

- [ ] O usuário conseguir acessar sem cadastro.
- [ ] A localização for solicitada mediante consentimento.
- [ ] Existir alternativa de pesquisa manual.
- [ ] Os ecopontos forem exibidos em mapa e lista.
- [ ] Os resultados puderem ser ordenados por proximidade.
- [ ] O usuário conseguir filtrar por material.
- [ ] Os detalhes apresentarem as informações disponíveis.
- [ ] O usuário conseguir abrir uma rota externa.
- [ ] Falhas de API forem tratadas adequadamente.
- [ ] A interface funcionar em dispositivos móveis e desktop.
- [ ] As fontes dos dados forem identificadas.

## 17. Pesquisa e validação extensionista

O EcoPerto também deverá ser validado junto à comunidade.

### Diagnóstico

Aplicar questionários para compreender:

- Hábitos de descarte.
- Conhecimento sobre ecopontos.
- Dificuldades de localização.
- Materiais mais difíceis de descartar.
- Familiaridade com aplicativos de mapas.
- Interesse na solução proposta.

### Validação do protótipo

Convidar voluntários para executar tarefas como:

- Encontrar um ecoponto próximo.
- Localizar um ponto que aceite determinado material.
- Consultar informações sobre o local.
- Abrir uma rota de navegação.

### Avaliação

Registrar:

- Facilidade de uso.
- Clareza das informações.
- Dificuldades encontradas.
- Sugestões de melhoria.
- Percepção de utilidade.

A participação deverá ser voluntária, respeitando os princípios éticos aplicáveis e a privacidade dos participantes.

## 18. Resultados esperados

### Resultados técnicos

- Protótipo web funcional.
- Integração com dados geográficos.
- Consulta de ecopontos por proximidade.
- Filtros por material.
- Visualização em mapa.
- Interface responsiva.
- Publicação na Vercel.

### Resultados sociais

- Facilitar o acesso às informações sobre descarte.
- Incentivar práticas sustentáveis.
- Promover conscientização ambiental.
- Aproximar tecnologia e comunidade.
- Reduzir dificuldades para localizar pontos de coleta.

Os impactos ambientais efetivos deverão ser avaliados antes de serem apresentados como resultados comprovados.

## 19. Indicadores de avaliação

| Indicador | Forma de avaliação |
| --- | --- |
| Facilidade de uso | Testes com usuários |
| Eficiência da busca | Execução de tarefas |
| Clareza das informações | Questionários |
| Qualidade dos dados | Verificação das fontes |
| Cobertura geográfica | Quantidade de pontos cadastrados |
| Funcionamento técnico | Testes funcionais |
| Percepção de utilidade | Feedback da comunidade |

Não definir metas numéricas sem uma etapa prévia de diagnóstico.

## 20. Riscos e limitações

### Qualidade dos dados

Os pontos de coleta podem apresentar informações incompletas ou desatualizadas.

### Cobertura geográfica

Algumas localidades podem não possuir ecopontos cadastrados nas fontes consultadas.

### Dependência de APIs

Serviços externos podem apresentar instabilidade, limites de uso ou alterações nas políticas.

### Localização

A precisão depende do dispositivo, das permissões e das condições de geolocalização.

### Inclusão digital

Pessoas sem acesso à internet ou dispositivos compatíveis poderão enfrentar limitações.

### Manutenção

A atualização das informações será um desafio contínuo.

## 21. Evoluções futuras

Após a validação do MVP, considerar:

- Banco de dados próprio.
- Supabase com PostgreSQL/PostGIS.
- Cadastro de novos ecopontos.
- Sugestões de correção pela comunidade.
- Painel administrativo.
- Verificação de informações.
- Conteúdos educativos.
- Novas categorias de resíduos.
- Expansão da cobertura.
- Recursos adicionais de acessibilidade.

Essas possibilidades não fazem parte do escopo obrigatório inicial.

## 22. Decisões técnicas pendentes

### Geocodificação

Definir o serviço utilizado para transformar pesquisas manuais de endereço em coordenadas.

A utilização de Nominatim ou alternativas deverá respeitar os respectivos limites e termos.

### Overpass em produção

Validar latência, disponibilidade e políticas de uso.

Considerar cache ou camada intermediária caso necessário.

### Dados oficiais

Selecionar uma região piloto e identificar fontes públicas reutilizáveis.

### Banco de dados

Reavaliar somente quando houver necessidade de persistência, moderação ou dados próprios.

### Métricas

Definir métricas de uso sem armazenar localização precisa desnecessariamente.

## 23. ODS relacionados

### ODS 9 — Indústria, Inovação e Infraestrutura

Aplicação de tecnologia para facilitar o acesso a serviços e informações ambientais.

### ODS 11 — Cidades e Comunidades Sustentáveis

Contribuição para uma gestão urbana mais sustentável dos resíduos.

### ODS 12 — Consumo e Produção Responsáveis

Incentivo ao descarte adequado, à reciclagem e ao consumo responsável.

## 24. Referências acadêmicas e legais

BRASIL. **Lei nº 12.305, de 2 de agosto de 2010**. Institui a Política Nacional de Resíduos Sólidos. Brasília, DF: Presidência da República, 2010. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12305.htm. Acesso em: 26 out. 2026.

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 26 out. 2026.

ORGANIZAÇÃO DAS NAÇÕES UNIDAS (ONU). **Transformando nosso mundo: a Agenda 2030 para o Desenvolvimento Sustentável**. Nova York: ONU, 2015. Disponível em: https://brasil.un.org/pt-br/91863-agenda-2030-para-o-desenvolvimento-sustent%C3%A1vel. Acesso em: 26 out. 2026.

UNIVERSIDADE SÃO FRANCISCO. **Manual de Boas Práticas Científicas**. Disponível em: https://www.usf.edu.br/galeria/getImage/410/2190986861362561.pdf. Acesso em: 26 out. 2026.

UNIVERSIDADE SÃO FRANCISCO. **Procedimentos para a curricularização da Extensão nos cursos de graduação da Universidade São Francisco**. Disponível em: https://www.usf.edu.br/galeria/getImage/410/2061430596198599.pdf. Acesso em: 26 out. 2026.

## 25. Referências técnicas

- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vite.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Leaflet: https://leafletjs.com/reference.html
- React Leaflet: https://react-leaflet.js.org/
- OpenStreetMap: https://www.openstreetmap.org/copyright
- Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- Política de tiles OSM: https://operations.osmfoundation.org/policies/tiles/
- Política do Nominatim: https://operations.osmfoundation.org/policies/nominatim/
- Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- Vercel: https://vercel.com/docs

---

**Status:** planejamento inicial.

**Próxima etapa:** inicializar o projeto React + TypeScript + Vite, configurar Tailwind e shadcn/ui e implementar a primeira prova de conceito com Leaflet e Overpass API.
