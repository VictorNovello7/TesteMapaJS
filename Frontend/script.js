/* Site Wade Brasil — lógica da página (JavaScript puro, sem React) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Utilidades
   * ---------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  // Escapa texto antes de inserir em innerHTML (dados da API e conteúdo fixo).
  function esc(valor) {
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Depois de redesenhar uma lista, devolve o foco ao botão que o usuário acionou.
  function manterFoco(container, seletor) {
    const alvo = container.querySelector(seletor);
    if (alvo) alvo.focus();
  }

  /* ------------------------------------------------------------------
   * Dados
   * ---------------------------------------------------------------- */
  const PRODUTOS = [
    { k: 'wade', img: './assets/abfddf0539989801123f0522fc573562.png', alt: 'Pote da Máscara Rescue da Wade', bg: '#F3F0F9', fit: 'contain', pad: '40px', brand: 'WADE', name: 'Rescue Máscara', desc: 'Brilho, maciez e leveza, com buriti, murumuru e vitamina E.' },
    { k: 'befarm', img: './assets/02c73ce1f76cfb45b88bf59c2b4382da.jpg', alt: 'Embalagem de café BeFarm Origens Alta Mogiana', bg: '#F1E7DA', fit: 'cover', pad: '0', brand: 'BEFARM', name: 'Café Origens', desc: 'Alta Mogiana, em embalagem artesanal de 250 g.' },
    { k: 'bluesafe', img: './assets/9b0e1706f51404fef995dd09abcd4434.png', alt: 'Frasco do Lava Roupas Enzimático BlueSafe', bg: '#F3F0F9', fit: 'contain', pad: '28px', brand: 'BLUESAFE', name: 'Lava Roupas Enzimático', desc: 'Proteína de alta performance, cores e tecidos protegidos.' },
    { k: 'wade', img: './assets/cc7c635395e4b5cad962ebcfab810264.png', alt: 'Frasco do Shampoo Rescue da Wade', bg: '#F3F0F9', fit: 'contain', pad: '36px', brand: 'WADE', name: 'Rescue Shampoo', desc: 'Nutrição profunda com óleo de argan e proteína da seda.' },
    { k: 'befarm', img: './assets/3dcdcd873cc97c4f3804fe6ad4fc07a2.jpg', alt: 'Embalagem de Mini Crackers BeFarm', bg: '#F6E6EE', fit: 'cover', pad: '0', brand: 'BEFARM', name: 'Mini Crackers', desc: 'Crocantes e práticos para o dia a dia.' },
    { k: 'bluesafe', img: './assets/1be0ec72c8485e8e64391d0598ca0900.png', alt: 'Frasco do Lava Roupas com Álcool BlueSafe', bg: '#EEF7F6', fit: 'contain', pad: '28px', brand: 'BLUESAFE', name: 'Lava Roupas com Álcool', desc: 'Limpeza profunda com baixa espuma e frescor.' },
    { k: 'wade', img: './assets/e3d804883a81faebc49ec94ba242e38e.png', alt: 'Frasco do Condicionador Rescue da Wade', bg: '#EEF7F6', fit: 'contain', pad: '36px', brand: 'WADE', name: 'Rescue Condicionador', desc: 'Cuidado diário para cabelos com brilho e leveza.' },
    { k: 'befarm', img: './assets/dc7136385ebcb01bdb96b67bc0e897ba.jpg', alt: 'Embalagem de Biscoito Integral BeFarm', bg: '#F1F3EA', fit: 'cover', pad: '0', brand: 'BEFARM', name: 'Biscoito Integral', desc: 'Nutrição com sabor, em uma embalagem leve e natural.' }
  ];

  const PALETA = {
    wade: { main: '#6B50A4', onMain: '#FFFFFF', text: '#6B50A4', tint: '#F3F0F9' },
    befarm: { main: '#A2C279', onMain: '#0B0B0F', text: '#4E6B2D', tint: '#F1F5E8' },
    bluesafe: { main: '#7ABFBC', onMain: '#0B0B0F', text: '#25706C', tint: '#E8F4F3' }
  };

  const FILTROS = [
    { k: 'all', label: 'Todos' },
    { k: 'wade', label: 'Wade' },
    { k: 'befarm', label: 'BeFarm' },
    { k: 'bluesafe', label: 'BlueSafe' }
  ];

  const LINHA_DO_TEMPO = [
    { label: '2018 · A pergunta', year: '2018', title: 'Uma inquietação muda tudo', text: 'O fundador conclui a formação em Direito e aprofunda estudos em Direito Internacional, sustentabilidade, inovação e economia. Ao ver o contraste entre os mercados mais desenvolvidos e a realidade empresarial brasileira, surge a pergunta: e se fosse possível criar uma empresa diferente?' },
    { label: '2019 · Nasce a Wade', year: '2019', title: 'A visão ganha forma', text: 'Ao final de 2019 nasce a Wade. Os primeiros produtos chegam por meio da nutrição e, com investimentos em pesquisa, desenvolvimento e inovação, a atuação se amplia para biocosméticos e soluções de limpeza.' },
    { label: '2025 · Novas marcas', year: '2025', title: 'Nascem a BeFarm e a BlueSafe', text: 'O crescimento da operação pede uma nova evolução. A BeFarm cuida de nutrição, bem-estar e produtos naturais; a BlueSafe, de soluções inteligentes de limpeza e cuidados com o ambiente.' },
    { label: '2025 · App próprio', year: '2025', title: 'Independência tecnológica', text: 'A Wade conquista a propriedade integral do seu aplicativo, que integra cadastro, logística, pedidos e comissões em um ambiente mais transparente, eficiente e seguro.' },
    { label: '2026 · Biopark', year: '2026', title: 'Uma nova fase de desenvolvimento', text: 'A aproximação com o Biopark conecta a Wade a um dos mais relevantes ecossistemas de inovação do Brasil, com foco em pesquisa, desenvolvimento tecnológico, industrialização, educação corporativa e expansão sustentável.' }
  ];

  const FAQS = [
    { q: 'Quem pode usar o aplicativo da Wade?', a: 'O acesso ao aplicativo é por convite, para garantir organização e rastreabilidade desde o primeiro contato. Procure um consultor Wade para receber o seu.' },
    { q: 'O que posso fazer dentro do aplicativo?', a: 'Fazer compras integradas, acompanhar comissões calculadas automaticamente em tempo real, gerir a sua rede e ter controle financeiro, com saque claro e previsível. Também navegue pelas lojas BeFarm e BlueSafe.' },
    { q: 'Como funciona o desconto em escala?', a: 'Os descontos crescem conforme a quantidade de produtos comprados. [Confirmar faixas e regras com a Wade]' },
    { q: 'Como baixo o aplicativo?', a: 'O app está disponível na App Store e no Google Play. Depois de instalar, entre com o convite recebido do seu consultor.' },
    { q: 'Como encontro um consultor perto de mim?', a: 'Na seção Consultores deste site, informe seu CEP ou e-mail e veja quem pode atender você.' }
  ];

  /* ------------------------------------------------------------------
   * Estado
   * ---------------------------------------------------------------- */
  const state = {
    pIdx: 0,          // posição do carrossel de produtos
    filter: 'all',    // filtro de marca
    tl: 0,            // item ativo da linha do tempo
    faq: 0,           // pergunta aberta do FAQ (-1 = nenhuma)
    mode: 'cep',      // 'cep' | 'mail'
    searched: false,  // true quando há resultados para exibir
    status: 'idle',   // idle | loading | ok | empty | error
    msg: '',
    found: []
  };

  /* ------------------------------------------------------------------
   * Produtos: filtros + carrossel
   * ---------------------------------------------------------------- */
  function produtosVisiveis() {
    const pintados = PRODUTOS.map(function (x) {
      return Object.assign({}, x, PALETA[x.k], { bg: x.fit === 'contain' ? PALETA[x.k].tint : x.bg });
    });
    return state.filter === 'all' ? pintados : pintados.filter(function (x) { return x.k === state.filter; });
  }

  function indiceAtual() {
    const maxIdx = Math.max(0, produtosVisiveis().length - 3);
    return { idx: Math.min(state.pIdx, maxIdx), maxIdx: maxIdx };
  }

  function renderProdutos() {
    const lista = produtosVisiveis();
    const pos = indiceAtual();
    const idx = pos.idx;
    const maxIdx = pos.maxIdx;

    // Filtros
    $('prod-tabs').innerHTML = FILTROS.map(function (t) {
      const on = state.filter === t.k;
      const c = t.k === 'all' ? { main: '#0B0B0F', onMain: '#FFFFFF', text: '#0B0B0F' } : PALETA[t.k];
      const bg = on ? c.main : '#fff';
      const color = on ? c.onMain : c.text;
      return '<button data-filtro="' + t.k + '" style="min-height:44px;padding:0 22px;border-radius:999px;border:1.5px solid ' + c.main + ';background:' + bg + ';color:' + color + ';font-weight:700;font-size:14px;font-family:inherit;cursor:pointer">' + esc(t.label) + '</button>';
    }).join('');

    // Cards
    const track = $('prod-track');
    track.style.transform = 'translateX(' + (-idx * 364) + 'px)';
    track.innerHTML = lista.map(function (p) {
      return '<article style="flex:0 0 340px;background:#fff;border:2px solid ' + p.main + ';border-radius:28px;overflow:hidden;display:flex;flex-direction:column">' +
        '<div style="height:10px;background:' + p.main + '"></div>' +
        '<div style="height:330px;background:' + p.bg + '"><img src="' + esc(p.img) + '" alt="' + esc(p.alt) + '" style="width:100%;height:100%;object-fit:' + p.fit + ';padding:' + p.pad + ';box-sizing:border-box;display:block"></div>' +
        '<div style="padding:24px 26px 28px;display:flex;flex-direction:column;gap:8px">' +
        '<span style="align-self:flex-start;padding:4px 12px;border-radius:999px;background:' + p.main + ';color:' + p.onMain + ';font-size:12px;font-weight:800;letter-spacing:1px">' + esc(p.brand) + '</span>' +
        '<strong style="font-size:21px;letter-spacing:-.5px">' + esc(p.name) + '</strong>' +
        '<span style="font-size:15px;line-height:1.5;color:#3A3A44">' + esc(p.desc) + '</span>' +
        '<a href="#app" style="margin-top:8px;font-size:14px;font-weight:700;color:' + p.text + '">Comprar pelo app →</a>' +
        '</div></article>';
    }).join('');

    // Setas
    const accent = state.filter === 'all' ? '#6B50A4' : PALETA[state.filter].main;
    const accentOn = state.filter === 'all' ? '#FFFFFF' : PALETA[state.filter].onMain;
    const prev = $('prod-prev');
    const next = $('prod-next');
    prev.style.opacity = idx === 0 ? 0.35 : 1;
    next.style.opacity = idx >= maxIdx ? 0.35 : 1;
    next.style.borderColor = accent;
    next.style.background = accent;
    next.style.color = accentOn;
  }

  function escolherFiltro(marca) {
    state.filter = marca;
    state.pIdx = 0;
    renderProdutos();
  }

  $('prod-tabs').addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-filtro]');
    if (!btn) return;
    const k = btn.getAttribute('data-filtro');
    escolherFiltro(k);
    manterFoco($('prod-tabs'), 'button[data-filtro="' + k + '"]');
  });

  $('prod-prev').addEventListener('click', function () {
    state.pIdx = Math.max(0, indiceAtual().idx - 1);
    renderProdutos();
  });

  $('prod-next').addEventListener('click', function () {
    const pos = indiceAtual();
    state.pIdx = Math.min(pos.maxIdx, pos.idx + 1);
    renderProdutos();
  });

  // Botões "Ver produtos Wade / BeFarm / BlueSafe" na seção de marcas.
  // O link continua rolando até #produtos normalmente.
  document.querySelectorAll('a[data-marca]').forEach(function (link) {
    link.addEventListener('click', function () {
      escolherFiltro(link.getAttribute('data-marca'));
    });
  });

  /* ------------------------------------------------------------------
   * Linha do tempo
   * ---------------------------------------------------------------- */
  function renderTimeline() {
    $('tl-nodes').innerHTML = LINHA_DO_TEMPO.map(function (n, i) {
      const on = state.tl === i;
      const bg = on ? '#6B50A4' : '#fff';
      const color = on ? '#fff' : '#0B0B0F';
      const border = on ? '#6B50A4' : '#CDBBE6';
      return '<button data-tl="' + i + '" style="min-height:48px;padding:0 22px;border-radius:999px;border:1.5px solid ' + border + ';background:' + bg + ';color:' + color + ';font-weight:700;font-size:15px;font-family:inherit;cursor:pointer">' + esc(n.label) + '</button>';
    }).join('');
    const atual = LINHA_DO_TEMPO[state.tl];
    $('tl-year').textContent = atual.year;
    $('tl-title').textContent = atual.title;
    $('tl-text').textContent = atual.text;
  }

  $('tl-nodes').addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-tl]');
    if (!btn) return;
    state.tl = Number(btn.getAttribute('data-tl'));
    renderTimeline();
    manterFoco($('tl-nodes'), 'button[data-tl="' + state.tl + '"]');
  });

  /* ------------------------------------------------------------------
   * FAQ
   * ---------------------------------------------------------------- */
  function renderFaq() {
    $('faq-list').innerHTML = FAQS.map(function (x, i) {
      const aberta = state.faq === i;
      return '<div style="background:#fff;border-radius:20px;padding:4px 28px">' +
        '<button data-faq="' + i + '" aria-expanded="' + (aberta ? 'true' : 'false') + '" style="width:100%;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:none;border:none;font-family:inherit;font-size:18px;font-weight:700;text-align:left;cursor:pointer;color:#0B0B0F;padding:0">' +
        '<span>' + esc(x.q) + '</span><span style="flex:none;font-size:26px;color:#6B50A4">' + (aberta ? '−' : '+') + '</span>' +
        '</button>' +
        (aberta ? '<p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#3A3A44">' + esc(x.a) + '</p>' : '') +
        '</div>';
    }).join('');
  }

  $('faq-list').addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-faq]');
    if (!btn) return;
    const i = Number(btn.getAttribute('data-faq'));
    state.faq = state.faq === i ? -1 : i;
    renderFaq();
    manterFoco($('faq-list'), 'button[data-faq="' + i + '"]');
  });

  /* ------------------------------------------------------------------
   * Consultores: busca por CEP ou e-mail
   * ---------------------------------------------------------------- */
  const HINTS = {
    idle: 'Os consultores mais próximos aparecem aqui depois da busca.',
    loading: 'Buscando consultores...'
  };

  function formatarConsultor(c) {
    const tel = String(c.telefone || '').trim();
    const mail = String(c.email || '').trim();
    const dg = tel.replace(/\D/g, '');
    const hasDist = typeof c.distancia === 'number' && isFinite(c.distancia);
    const km = hasDist ? c.distancia : 0;
    const nome = String(c.nome || '').trim();
    return {
      initial: (nome.charAt(0) || '?').toUpperCase(),
      name: nome,
      hasDist: hasDist,
      dist: km < 1 ? 'a menos de 1 km de você' : 'a ' + km.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' km de você',
      hasPhone: !!tel,
      phone: /^\d{10,11}$/.test(tel) ? '(' + tel.slice(0, 2) + ') ' + tel.slice(2, tel.length - 4) + '-' + tel.slice(-4) : tel,
      phoneHref: 'tel:' + (dg.length >= 12 ? '+' + dg : dg.length >= 10 ? '+55' + dg : dg),
      hasEmail: !!mail,
      email: mail,
      emailHref: 'mailto:' + mail
    };
  }

  function renderBusca() {
    const cepMode = state.mode === 'cep';

    const btnCep = $('btn-cep');
    const btnMail = $('btn-mail');
    btnCep.style.background = cepMode ? '#6B50A4' : '#fff';
    btnCep.style.color = cepMode ? '#fff' : '#0B0B0F';
    btnCep.style.borderColor = cepMode ? '#6B50A4' : '#CDBBE6';
    btnMail.style.background = cepMode ? '#fff' : '#6B50A4';
    btnMail.style.color = cepMode ? '#0B0B0F' : '#fff';
    btnMail.style.borderColor = cepMode ? '#CDBBE6' : '#6B50A4';

    $('busca').placeholder = cepMode ? 'Digite seu CEP' : 'Digite seu e-mail';

    const area = $('resultados');
    if (state.searched) {
      area.innerHTML = state.found.map(function (c) {
        const r = formatarConsultor(c);
        return '<div style="display:flex;align-items:center;gap:16px;padding:18px 22px;border-radius:20px;border:1.5px solid #E6E1EE">' +
          '<div style="flex:none;width:52px;height:52px;border-radius:50%;background:#EEF7F6;color:#25706C;display:flex;align-items:center;justify-content:center;font-weight:800">' + esc(r.initial) + '</div>' +
          '<div style="flex:1;display:flex;flex-direction:column;gap:2px">' +
          '<strong style="font-size:16px">' + esc(r.name) + '</strong>' +
          (r.hasDist ? '<span style="font-size:14px;color:#595959">' + esc(r.dist) + '</span>' : '') +
          (r.hasPhone ? '<a href="' + esc(r.phoneHref) + '" style="align-self:flex-start;font-size:14px;color:#595959">' + esc(r.phone) + '</a>' : '') +
          (r.hasEmail ? '<a href="' + esc(r.emailHref) + '" style="align-self:flex-start;font-size:14px;color:#595959;overflow-wrap:anywhere">' + esc(r.email) + '</a>' : '') +
          '</div>' +
          '<a href="#contato" style="display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:#6B50A4;color:#fff;font-size:14px;font-weight:600">Contatar</a>' +
          '</div>';
      }).join('');
    } else {
      const texto = state.status === 'idle' || state.status === 'loading' ? HINTS[state.status] : state.msg;
      area.innerHTML = '<div style="font-size:14px;color:#595959;line-height:1.5">' + esc(texto) + '</div>';
    }
  }

  function trocarModo(modo) {
    state.mode = modo;
    state.searched = false;
    state.status = 'idle';
    state.msg = '';
    state.found = [];
    $('busca').value = '';
    renderBusca();
  }

  let ultimaRequisicao = 0;

  async function buscarConsultor() {
    const mode = state.mode;
    const q = String($('busca').value || '').trim();

    function falhar(msg) {
      state.searched = false;
      state.status = 'error';
      state.msg = msg;
      state.found = [];
      renderBusca();
    }

    if (!q) { falhar(mode === 'cep' ? 'Digite seu CEP.' : 'Digite seu e-mail.'); return; }

    let url;
    if (mode === 'cep') {
      const cep = q.replace(/\D/g, '');
      if (cep.length !== 8) { falhar('CEP inválido. Digite os 8 números do CEP.'); return; }
      url = '/vendedores/proximos/' + cep + '?limite=3';
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) { falhar('E-mail inválido.'); return; }
      url = '/vendedores/email/' + encodeURIComponent(q);
    }

    const base = String(window.WADE_API_URL || '').replace(/\/$/, '');
    const id = ++ultimaRequisicao;

    state.searched = false;
    state.status = 'loading';
    state.msg = '';
    state.found = [];
    renderBusca();

    try {
      const resp = await fetch(base + url);
      const data = await resp.json();
      if (id !== ultimaRequisicao) return;
      if (!resp.ok) { falhar(data.erro || 'Não foi possível buscar consultores.'); return; }

      const lista = Array.isArray(data.vendedores) ? data.vendedores : [];
      if (!lista.length) {
        state.searched = false;
        state.status = 'empty';
        state.msg = mode === 'cep' ? 'Nenhum consultor encontrado por enquanto.' : 'Nenhum consultor encontrado com este e-mail.';
        state.found = [];
        renderBusca();
        return;
      }

      state.searched = true;
      state.status = 'ok';
      state.msg = '';
      state.found = lista;
      renderBusca();

      // Envia os pontos ao mapa sem interferir na renderização dos resultados.
      window.dispatchEvent(new CustomEvent('wade:map-points', {
        detail: {
          cliente: data.cliente || null,
          vendedores: lista
        }
      }));
    } catch (e) {
      if (id !== ultimaRequisicao) return;
      falhar('Não foi possível conectar ao servidor.');
    }
  }

  $('btn-cep').addEventListener('click', function () { trocarModo('cep'); });
  $('btn-mail').addEventListener('click', function () { trocarModo('mail'); });
  $('btn-buscar').addEventListener('click', buscarConsultor);

  /* ------------------------------------------------------------------
   * Mapa (Leaflet)
   * ---------------------------------------------------------------- */
  let mapa = null;
  let camadaMarcadores = null;
  const centroBrasil = [-14.2350, -51.9253];

  function iniciarMapa() {
    const elemento = document.getElementById('wade-map');
    if (!elemento || !window.L) return false;
    if (!mapa) {
      mapa = L.map(elemento, { scrollWheelZoom: true }).setView(centroBrasil, 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapa);
      camadaMarcadores = L.featureGroup().addTo(mapa);
    }
    setTimeout(function () { if (mapa) mapa.invalidateSize(); }, 150);
    return true;
  }

  function marcador(lat, lon, titulo, cor) {
    const icone = L.divIcon({
      className: 'wade-map-marker',
      html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:' + cor + ';border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([lat, lon], { icon: icone }).bindPopup(titulo).addTo(camadaMarcadores);
  }

  window.addEventListener('wade:map-points', function (evento) {
    if (!iniciarMapa()) return;
    const dados = evento.detail || {};
    camadaMarcadores.clearLayers();
    const limites = [];
    const cliente = dados.cliente;
    if (cliente && Number.isFinite(Number(cliente.latitude)) && Number.isFinite(Number(cliente.longitude))) {
      const ponto = [Number(cliente.latitude), Number(cliente.longitude)];
      marcador(ponto[0], ponto[1], 'Localização do cliente', '#25706C');
      limites.push(ponto);
    }
    (Array.isArray(dados.vendedores) ? dados.vendedores : []).forEach(function (vendedor) {
      const lat = Number(vendedor.latitude);
      const lon = Number(vendedor.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const ponto = [lat, lon];
      marcador(lat, lon, String(vendedor.nome || 'Consultor Wade'), '#6B50A4');
      limites.push(ponto);
    });
    const aviso = document.getElementById('wade-map-hint');
    if (aviso) aviso.textContent = limites.length ? 'Localização do cliente e consultores encontrados' : 'Não há coordenadas disponíveis para exibir';
    if (limites.length > 1) mapa.fitBounds(limites, { padding: [35, 35], maxZoom: 13 });
    else if (limites.length === 1) mapa.setView(limites[0], 13);
    setTimeout(function () { if (mapa) mapa.invalidateSize(); }, 200);
  });

  window.addEventListener('resize', function () { if (mapa) mapa.invalidateSize(); });

  /* ------------------------------------------------------------------
   * Inicialização
   * ---------------------------------------------------------------- */
  renderProdutos();
  renderTimeline();
  renderFaq();
  renderBusca();
  iniciarMapa();
})();
