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

// Carrossel de fotos do hero — botões de seta + auto-avanço, com loop
(function () {
  var track = document.getElementById('carouselTrack');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');

  if (!track || !prevBtn || !nextBtn) return;

  var AUTO_DELAY = 3200;
  var timer = null;

  function slideWidth() {
    var slide = track.querySelector('.carousel-slide');
    return slide ? slide.getBoundingClientRect().width : 190;
  }

  function atEnd() {
    return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }

  function goNext() {
    if (atEnd()) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: slideWidth(), behavior: 'smooth' });
    }
  }

  function goPrev() {
    if (track.scrollLeft <= 4) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -slideWidth(), behavior: 'smooth' });
    }
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(goNext, AUTO_DELAY);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  prevBtn.addEventListener('click', function () {
    goPrev();
    startAuto();
  });

  nextBtn.addEventListener('click', function () {
    goNext();
    startAuto();
  });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('touchstart', stopAuto, { passive: true });
  track.addEventListener('touchend', startAuto);

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    startAuto();
  }
})();
