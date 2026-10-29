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

Abra o endereço exibido no terminal. Não é necessário configurar credenciais.

### 🛠️ Comandos úteis

| Comando           | O que faz                        |
| ----------------- | -------------------------------- |
| `npm run build`   | Verifica os tipos e gera o build |
| `npm run lint`    | Analisa a qualidade do código    |
| `npm test`        | Executa os testes automatizados  |
| `npm run format`  | Formata os arquivos              |
| `npm run preview` | Abre uma prévia do build         |

---

<div align="center">

Um projeto de extensão universitária que aproxima **pessoas, sustentabilidade e informação**.

</div>
