// Catálogo interativo — filtros, busca, ficha técnica e carrinho de cotação
(function () {
  'use strict';

  var PRODUCTS = window.ELS_PRODUCTS || [];
  var WHATSAPP_NUMBER = '5551998177556';
  var CART_KEY = 'els_cotacao_v1';

  var state = {
    category: 'todos',
    brand: 'todas',
    search: '',
    view: 'grid'
  };

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  function loadCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  var cart = loadCart();

  // ---------- Categorias / Marcas (derivadas do catálogo) ----------
  var CATEGORY_ORDER = ['chaves', 'parafusos', 'pregos', 'ferramentas', 'brocas', 'epi'];
  var CATEGORY_LABELS = {
    chaves: 'Chaves Profissionais',
    parafusos: 'Parafusos e Porcas',
    pregos: 'Pregos e Martelo',
    ferramentas: 'Ferramentas Manuais',
    brocas: 'Brocas e Corte',
    epi: 'Linha EPI'
  };
  var BRAND_ORDER = ['Tramontina Pro', 'Gedore', 'ELS Fixadores', 'ELS Ferramentas', 'Linha EPI'];

  function categoryCounts() {
    var counts = {};
    PRODUCTS.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }

  function brandCounts() {
    var counts = {};
    PRODUCTS.forEach(function (p) { counts[p.brand] = (counts[p.brand] || 0) + 1; });
    return counts;
  }

  // ---------- Render: chips de filtro ----------
  function renderFilters() {
    var catCounts = categoryCounts();
    var catWrap = document.getElementById('catChips');
    var chips = ['<button class="cat-chip' + (state.category === 'todos' ? ' active' : '') + '" data-cat="todos">Todos os produtos <span>' + PRODUCTS.length + '</span></button>'];
    CATEGORY_ORDER.forEach(function (c) {
      if (!catCounts[c]) return;
      chips.push('<button class="cat-chip' + (state.category === c ? ' active' : '') + '" data-cat="' + c + '">' + CATEGORY_LABELS[c] + ' <span>' + catCounts[c] + '</span></button>');
    });
    catWrap.innerHTML = chips.join('');

    var brCounts = brandCounts();
    var brWrap = document.getElementById('brandChips');
    var bchips = ['<button class="brand-chip' + (state.brand === 'todas' ? ' active' : '') + '" data-brand="todas">Todas</button>'];
    BRAND_ORDER.forEach(function (b) {
      if (!brCounts[b]) return;
      bchips.push('<button class="brand-chip' + (state.brand === b ? ' active' : '') + '" data-brand="' + esc(b) + '">' + esc(b) + '</button>');
    });
    brWrap.innerHTML = bchips.join('');
  }

  // ---------- Render: grid de produtos ----------
  function filteredProducts() {
    var q = state.search.trim().toLowerCase();
    return PRODUCTS.filter(function (p) {
      if (state.category !== 'todos' && p.category !== state.category) return false;
      if (state.brand !== 'todas' && p.brand !== state.brand) return false;
      if (q && (p.name + ' ' + p.desc + ' ' + p.brand).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function mediaHtml(p) {
    if (p.hasPhoto && p.image) {
      return '<img src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy">';
    }
    return '<svg class="prod-icon"><use href="#ic-' + p.icon + '"></use></svg>';
  }

  function badgeHtml(p) {
    var b = '<span class="pc-brand">' + esc(p.brand) + '</span>';
    if (p.badge) b += '<span class="pc-tag">' + esc(p.badge) + '</span>';
    return b;
  }

  function renderGrid() {
    var list = filteredProducts();
    var grid = document.getElementById('productGrid');
    var countEl = document.getElementById('itemCount');
    countEl.textContent = list.length + ' de ' + PRODUCTS.length + ' itens';

    if (!list.length) {
      grid.innerHTML = '<p class="empty-state">Nenhum produto encontrado com esse filtro/busca.</p>';
      return;
    }

    grid.innerHTML = list.map(function (p) {
      return (
        '<article class="product-card" data-id="' + p.id + '">' +
          '<div class="pc-media">' + badgeHtml(p) + mediaHtml(p) + '</div>' +
          '<div class="pc-body">' +
            '<div class="pc-cat">' + esc(p.categoryLabel) + '</div>' +
            '<h4 class="pc-name">' + esc(p.name) + '</h4>' +
            '<p class="pc-desc">' + esc(p.desc) + '</p>' +
            '<div class="pc-specs">' +
              '<div><span class="pc-lbl">Material</span>' + esc(p.material) + '</div>' +
              '<div><span class="pc-lbl">Norma</span>' + esc(p.norma) + '</div>' +
            '</div>' +
            '<div class="pc-sizes">' + p.sizes.length + ' medida' + (p.sizes.length === 1 ? '' : 's') + ' disponí' + (p.sizes.length === 1 ? 'vel' : 'veis') + '</div>' +
            '<div class="pc-actions">' +
              '<button class="btn btn-dark pc-view" data-id="' + p.id + '">Ver ficha técnica</button>' +
              '<button class="btn btn-orange pc-add" data-id="' + p.id + '">+ Cotação</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  // ---------- Modal de produto ----------
  var modalState = { product: null, size: null, qty: 1 };

  function openModal(id) {
    var p = PRODUCTS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    modalState = { product: p, size: p.sizes[0] || null, qty: 1 };
    renderModal();
    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderModal() {
    var p = modalState.product;
    if (!p) return;
    var m = document.getElementById('productModal');
    m.querySelector('.modal-brand').textContent = p.brand;
    m.querySelector('.modal-cat').textContent = p.categoryLabel;
    m.querySelector('.modal-title').textContent = p.name;
    m.querySelector('.modal-desc').textContent = p.desc;
    m.querySelector('.modal-media').innerHTML = mediaHtml(p);

    var sizeWrap = m.querySelector('.modal-sizes');
    sizeWrap.innerHTML = p.sizes.map(function (s) {
      return '<button class="size-btn' + (s === modalState.size ? ' active' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>';
    }).join('');
    m.querySelector('.modal-size-current').textContent = modalState.size || '—';

    m.querySelector('.modal-qty').textContent = modalState.qty;

    m.querySelector('.modal-material').textContent = p.material;
    m.querySelector('.modal-norma').textContent = p.norma;
  }

  // ---------- Carrinho de cotação ----------
  function updateCartBadge() {
    var totalQty = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var badge = document.getElementById('cartBadge');
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
  }

  function addToCart(product, size, qty) {
    var existing = cart.filter(function (i) { return i.id === product.id && i.size === size; })[0];
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: product.id, name: product.name, brand: product.brand, size: size, qty: qty });
    }
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function changeCartQty(index, delta) {
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    saveCart(cart);
    updateCartBadge();
    renderCartDrawer();
  }

  function renderCartDrawer() {
    var body = document.getElementById('cartBody');
    if (!cart.length) {
      body.innerHTML = '<p class="empty-state">Sua lista de cotação está vazia.<br>Adicione produtos pelo catálogo.</p>';
      document.getElementById('cartSendBtn').setAttribute('disabled', 'disabled');
      return;
    }
    document.getElementById('cartSendBtn').removeAttribute('disabled');
    body.innerHTML = cart.map(function (item, i) {
      return (
        '<div class="cart-item">' +
          '<div class="ci-info">' +
            '<div class="ci-name">' + esc(item.name) + '</div>' +
            '<div class="ci-meta">' + esc(item.brand) + (item.size ? ' · ' + esc(item.size) : '') + '</div>' +
          '</div>' +
          '<div class="ci-qty">' +
            '<button data-i="' + i + '" data-d="-1" class="ci-step">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button data-i="' + i + '" data-d="1" class="ci-step">+</button>' +
          '</div>' +
          '<button class="ci-remove" data-i="' + i + '" aria-label="Remover">×</button>' +
        '</div>'
      );
    }).join('');
  }

  function buildQuoteMessage() {
    var lines = ['Olá! Gostaria de um orçamento dos itens abaixo:', ''];
    cart.forEach(function (item) {
      lines.push('• ' + item.name + ' (' + item.brand + ')' + (item.size ? ' — ' + item.size : '') + ' — Qtd: ' + item.qty);
    });
    return lines.join('\n');
  }

  function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---------- Eventos ----------
  document.addEventListener('DOMContentLoaded', function () {
    renderFilters();
    renderGrid();
    updateCartBadge();
    renderCartDrawer();

    document.getElementById('catChips').addEventListener('click', function (e) {
      var btn = e.target.closest('.cat-chip');
      if (!btn) return;
      state.category = btn.getAttribute('data-cat');
      renderFilters();
      renderGrid();
    });

    document.getElementById('brandChips').addEventListener('click', function (e) {
      var btn = e.target.closest('.brand-chip');
      if (!btn) return;
      state.brand = btn.getAttribute('data-brand');
      renderFilters();
      renderGrid();
    });

    var searchInput = document.getElementById('productSearch');
    var searchInputMobile = document.getElementById('productSearchMobile');
    function onSearch(val) {
      state.search = val;
      renderGrid();
      var prodSection = document.getElementById('produtos');
      if (state.search.trim() && prodSection) prodSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    [searchInput, searchInputMobile].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        if (searchInput) searchInput.value = input.value;
        if (searchInputMobile) searchInputMobile.value = input.value;
        onSearch(input.value);
      });
    });

    document.getElementById('productGrid').addEventListener('click', function (e) {
      var view = e.target.closest('.pc-view');
      var add = e.target.closest('.pc-add');
      if (view) { openModal(view.getAttribute('data-id')); }
      if (add) {
        var p = PRODUCTS.filter(function (x) { return x.id === add.getAttribute('data-id'); })[0];
        if (p) addToCart(p, p.sizes[0] || null, 1);
      }
    });

    // Modal
    document.getElementById('productModal').addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay-bg') || e.target.closest('.modal-close')) closeModal();
      var sizeBtn = e.target.closest('.size-btn');
      if (sizeBtn) {
        modalState.size = sizeBtn.getAttribute('data-size');
        renderModal();
      }
      if (e.target.closest('.modal-qty-minus')) { modalState.qty = Math.max(1, modalState.qty - 1); renderModal(); }
      if (e.target.closest('.modal-qty-plus')) { modalState.qty = modalState.qty + 1; renderModal(); }
      if (e.target.closest('.modal-add-cart')) {
        addToCart(modalState.product, modalState.size, modalState.qty);
        closeModal();
        openCart();
      }
      if (e.target.closest('.modal-wa')) {
        var msg = 'Olá! Tenho interesse em: ' + modalState.product.name + ' (' + modalState.product.brand + ')' +
          (modalState.size ? ' — medida ' + modalState.size : '') + ' — Qtd: ' + modalState.qty;
        window.open(waLink(msg), '_blank', 'noopener');
      }
    });

    // Carrinho
    document.getElementById('cartToggle').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    document.getElementById('cartBody').addEventListener('click', function (e) {
      var step = e.target.closest('.ci-step');
      var rm = e.target.closest('.ci-remove');
      if (step) changeCartQty(parseInt(step.getAttribute('data-i'), 10), parseInt(step.getAttribute('data-d'), 10));
      if (rm) removeFromCart(parseInt(rm.getAttribute('data-i'), 10));
    });
    document.getElementById('cartSendBtn').addEventListener('click', function () {
      if (!cart.length) return;
      window.open(waLink(buildQuoteMessage()), '_blank', 'noopener');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); closeCart(); }
    });
  });
})();
