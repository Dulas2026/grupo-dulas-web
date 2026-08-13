// Grupo Dulas — interacciones compartidas
document.addEventListener('DOMContentLoaded', function () {
  // Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      var expanded = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // Desplegable "Servicios" en móvil (click en vez de hover)
  document.querySelectorAll('.has-dropdown > .nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });

  // Servicios en pestañas (página Servicios)
  var tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = document.getElementById('panel-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // Intro: saltar animación
  var skip = document.querySelector('.skip-intro');
  var intro = document.getElementById('intro');
  if (skip && intro) {
    skip.addEventListener('click', function () {
      intro.style.display = 'none';
    });
  }
  // Oculta la intro del todo tras la animación para que no bloquee clics
  if (intro) {
    setTimeout(function () { intro.style.display = 'none'; }, 9500);
  }

  // Mostrar la intro solo la primera vez por sesión de navegador
  if (intro) {
    try {
      if (sessionStorage.getItem('gd_intro_shown')) {
        intro.style.display = 'none';
      } else {
        sessionStorage.setItem('gd_intro_shown', '1');
      }
    } catch (err) {
      /* sessionStorage no disponible: se muestra la intro igualmente */
    }
  }

  // Formulario de contacto: validación básica + mensaje de confirmación
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) {
        note.textContent = 'Gracias, hemos recibido tu mensaje. Te contactaremos en breve.';
        note.style.color = '#2f3e33';
      }
      form.reset();
    });
  }
});
