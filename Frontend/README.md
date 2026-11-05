# Site Wade — Frontend (HTML, CSS e JavaScript)

Frontend estático, sem React e sem etapa de build.

## Arquivos

- `index.html` — estrutura e conteúdo da página (estilos inline preservados do design original).
- `style.css` — estilos globais, animações da órbita e fundos (`.top`, `.faqbg`, `.snap`, `.navlink`).
- `script.js` — toda a lógica: filtros e carrossel de produtos, linha do tempo, FAQ,
  busca de consultores por CEP/e-mail e mapa (Leaflet).
- `assets/` — imagens usadas pela página.

## Visualizar

O site é servido pelo backend (`Backend/server.js`, rota `/`), na mesma origem da API.
Para ver só o visual, sirva esta pasta, por exemplo com `python3 -m http.server`,
e abra `http://localhost:8000`. A busca de consultores precisa do backend no ar
(ou de `window.WADE_API_URL` apontando para ele, definido antes de `script.js`).

## Dependências externas (CDN)

Leaflet 1.9.4 (unpkg) e a fonte Plus Jakarta Sans (Google Fonts), como no design original.
