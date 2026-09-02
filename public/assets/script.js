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

  // (Se retiró la intro de pantalla negra con el logo cayendo: ahora el
  // hero de Inicio con el efecto "cortina" arranca directamente al cargar
  // la página, sin nada delante que lo tape.)

  // Servicios (Inicio): cada tarjeta sube desde abajo, una a una, según va
  // entrando ella misma en la pantalla al hacer scroll (no toda la sección
  // de golpe, sino cada tarjeta por separado).
  var svcCards = document.querySelectorAll('.svc-reveal-grid .service-card');
  if (svcCards.length) {
    if ('IntersectionObserver' in window) {
      var svcObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
      svcCards.forEach(function (card) { svcObserver.observe(card); });
    } else {
      // Sin soporte de IntersectionObserver: se muestran directamente.
      svcCards.forEach(function (card) { card.classList.add('in-view'); });
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

  // Slider antes/después interactivo (páginas de servicios): arrastrando o
  // tocando la imagen se revela más "antes" o más "después".
  document.querySelectorAll('[data-ba-slider]').forEach(function (slider) {
    var before = slider.querySelector('.ba-slider-before');
    var handle = slider.querySelector('.ba-slider-handle');
    if (!before || !handle) return;
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
    }

    function posFromEvent(e) {
      var rect = slider.getBoundingClientRect();
      var clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
      var x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function start(e) {
      dragging = true;
      setPos(posFromEvent(e));
    }
    function move(e) {
      if (!dragging) return;
      setPos(posFromEvent(e));
      if (e.cancelable) e.preventDefault();
    }
    function end() { dragging = false; }

    slider.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    slider.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    setPos(50);
  });
});
