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

  // Desplegable "Servicios": se abre al hacer clic (además de al pasar el ratón por encima)
  document.querySelectorAll('.has-dropdown > .nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var parent = link.parentElement;
      if (!parent.classList.contains('open')) {
        e.preventDefault();
        document.querySelectorAll('.has-dropdown.open').forEach(function (other) {
          if (other !== parent) other.classList.remove('open');
        });
        parent.classList.add('open');
      }
      // Si ya estaba abierto, un segundo clic navega con normalidad a Servicios.
    });
  });

  // Cierra el desplegable "Servicios" si se hace clic fuera de él
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
      if (!el.contains(e.target)) el.classList.remove('open');
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

  // Efecto "cortina" del inicio: sus animaciones están pensadas para
  // arrancar nada más verse la sección. Si la intro de arriba (el logo
  // cayendo) tapa la pantalla varios segundos, hay que "reiniciar" estas
  // animaciones justo cuando la intro desaparece; si no, se ejecutarían
  // igualmente en segundo plano mientras la intro las tapa y el usuario
  // nunca las vería moverse.
  var heroCurtainStarted = false;
  function restartHeroCurtain() {
    if (heroCurtainStarted) return;
    heroCurtainStarted = true;
    var hero = document.querySelector('.hero--curtain');
    if (!hero) return;
    var els = hero.querySelectorAll(
      '.hero-curtain, .hero-curtain-logo, .eyebrow, h1, p.lead, .hero-actions, .hero-svc-panel'
    );
    els.forEach(function (el) { el.style.animation = 'none'; });
    void hero.offsetWidth; // fuerza el reflow para poder reiniciar la animación
    els.forEach(function (el) { el.style.animation = ''; });
  }

  // Intro: saltar animación
  var skip = document.querySelector('.skip-intro');
  var intro = document.getElementById('intro');
  var introTimeoutId = null;
  if (intro) {
    introTimeoutId = setTimeout(function () {
      intro.style.display = 'none';
      restartHeroCurtain();
    }, 9500);
  }
  if (skip && intro) {
    skip.addEventListener('click', function () {
      intro.style.display = 'none';
      if (introTimeoutId) clearTimeout(introTimeoutId);
      restartHeroCurtain();
    });
  }

  // Mostrar la intro solo la primera vez por sesión de navegador
  if (intro) {
    try {
      if (sessionStorage.getItem('gd_intro_shown')) {
        intro.style.display = 'none';
        if (introTimeoutId) clearTimeout(introTimeoutId);
        restartHeroCurtain();
      } else {
        sessionStorage.setItem('gd_intro_shown', '1');
      }
    } catch (err) {
      /* sessionStorage no disponible: se muestra la intro igualmente */
    }
  }

  // Formularios de contacto (página Contacto, Suministros y CTA final de cada
  // servicio): se envían por fetch() al endpoint real (Formspree) y solo
  // entonces se muestra el mensaje de confirmación. Antes, un bug enviaba
  // este mensaje sin llegar a mandar los datos a ningún sitio.
  var forms = document.querySelectorAll('.contact-form, .suministros-form, .cta-final-form');
  forms.forEach(function (form) {
    var action = form.getAttribute('action') || '';

    // Si el formulario apunta a "mailto:", dejamos el comportamiento nativo
    // del navegador (abre el cliente de correo) sin interceptarlo.
    if (action.indexOf('mailto:') === 0) return;

    function getNote() {
      var note = form.querySelector('.form-note');
      if (note) return note;
      note = form.nextElementSibling;
      if (note && note.classList && note.classList.contains('form-note')) return note;
      note = document.createElement('p');
      note.className = 'form-note';
      form.insertAdjacentElement('afterend', note);
      return note;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = getNote();
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) submitBtn.disabled = true;
      note.textContent = 'Enviando...';
      note.style.color = '';

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      }).then(function (response) {
        if (response.ok) {
          note.textContent = 'Gracias, hemos recibido tu mensaje. Te contactaremos en breve.';
          note.style.color = '#2f3e33';
          form.reset();
        } else {
          throw new Error('Respuesta no válida del servidor');
        }
      }).catch(function () {
        note.textContent = 'No hemos podido enviar el mensaje. Escríbenos directamente a info@grupodulas.com o llámanos al 622 587 788.';
        note.style.color = '#a33b3b';
      }).finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });
  });
});
