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
