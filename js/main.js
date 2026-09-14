// Menu mobile — abre/fecha o painel de navegação no header
(function () {
  var toggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');

  if (!toggle || !mobileNav) return;

  function closeMenu() {
    mobileNav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }

  function openMenu() {
    mobileNav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = '✕';
  }

  toggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Fecha o menu ao clicar em qualquer link dele (rolagem até a seção)
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Fecha o menu se a pessoa clicar fora dele
  document.addEventListener('click', function (event) {
    var clickedInsideNav = mobileNav.contains(event.target);
    var clickedToggle = toggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // Fecha o menu se a tela for redimensionada para o layout desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 920) {
      closeMenu();
    }
  });
})();

// Galeria "Quem Somos" — troca a foto principal ao clicar nas miniaturas
(function () {
  var mainImg = document.getElementById('aboutMainImg');
  var thumbs = document.getElementById('aboutThumbs');
  if (!mainImg || !thumbs) return;

  thumbs.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var src = btn.getAttribute('data-img');
    var alt = btn.getAttribute('data-alt');
    if (!src) return;
    mainImg.style.opacity = '0';
    setTimeout(function () {
      mainImg.src = src;
      mainImg.alt = alt || '';
      mainImg.style.opacity = '1';
    }, 120);
    thumbs.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
  });
})();
