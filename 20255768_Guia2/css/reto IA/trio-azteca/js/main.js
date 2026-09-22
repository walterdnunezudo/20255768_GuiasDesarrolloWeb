/* ==========================================================================
   TRÍO AZTECA DE EL SALVADOR — main.js
   JavaScript vanilla, modular, sin dependencias externas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initAudioPlayers();
  initRevealOnScroll();
  initRepertorioFilter();
  initWhatsAppForm();
});

/* --------------------------------------------------------------------------
   1. NAVBAR — transición de transparencia al hacer scroll
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 50;

  const updateHeaderState = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/* --------------------------------------------------------------------------
   2. MENÚ MÓVIL — overlay accesible con teclado
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const overlay = document.querySelector('.nav-overlay');
  const closeBtn = document.querySelector('.nav-overlay-close');

  if (!toggle || !overlay) return;

  let lastFocusedElement = null;

  const getFocusableElements = () =>
    Array.from(
      overlay.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

  const openMenu = () => {
    lastFocusedElement = document.activeElement;
    overlay.classList.add('is-open');
    overlay.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    const focusable = getFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    }
  };

  const closeMenu = () => {
    overlay.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    window.setTimeout(() => {
      if (!overlay.classList.contains('is-open')) {
        overlay.setAttribute('hidden', '');
      }
    }, 320);

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeMenu();
    }
  });

  overlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (event.key === 'Escape') {
      closeMenu();
      return;
    }

    // Trampa de foco dentro del overlay (navegación por teclado)
    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* --------------------------------------------------------------------------
   3. REPRODUCTORES DE AUDIO PERSONALIZADOS
   Maneja tanto ".player" (tarjetas de muestra) como ".rep-player" (tabla de
   repertorio). Al reproducir una pista, detiene automáticamente cualquier
   otra que esté sonando en la página.
   -------------------------------------------------------------------------- */
function initAudioPlayers() {
  const players = Array.from(
    document.querySelectorAll('.player, .rep-player')
  );

  if (!players.length) return;

  const registry = players.map((wrapper) => {
    const audio = wrapper.querySelector('audio');
    const button = wrapper.querySelector('[data-role="play-toggle"]');
    const track = wrapper.querySelector('[data-role="track"]');
    const progress = wrapper.querySelector('[data-role="progress"]');
    const timeLabel = wrapper.querySelector('[data-role="time"]');

    return { wrapper, audio, button, track, progress, timeLabel };
  }).filter((entry) => entry.audio && entry.button);

  const formatTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const stopAllExcept = (activeEntry) => {
    registry.forEach((entry) => {
      if (entry !== activeEntry && !entry.audio.paused) {
        entry.audio.pause();
      }
    });
  };

  registry.forEach((entry) => {
    const { wrapper, audio, button, track, progress, timeLabel } = entry;

    button.addEventListener('click', () => {
      if (audio.paused) {
        stopAllExcept(entry);
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            /* Reproducción bloqueada o archivo de audio no disponible aún */
          });
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => {
      wrapper.classList.add('is-playing');
    });

    audio.addEventListener('pause', () => {
      wrapper.classList.remove('is-playing');
    });

    audio.addEventListener('ended', () => {
      wrapper.classList.remove('is-playing');
      if (progress) progress.style.width = '0%';
    });

    audio.addEventListener('timeupdate', () => {
      if (progress && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${pct}%`;
      }
      if (timeLabel) {
        const remaining = audio.duration
          ? audio.duration - audio.currentTime
          : 0;
        timeLabel.textContent = `-${formatTime(remaining)}`;
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (timeLabel) {
        timeLabel.textContent = formatTime(audio.duration);
      }
    });

    if (track) {
      track.addEventListener('click', (event) => {
        if (!audio.duration) return;
        const rect = track.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
      });
    }
  });
}

/* --------------------------------------------------------------------------
   4. REVEAL PROGRESIVO CON IntersectionObserver
   Fallback CSS: si JS está desactivado, .reveal permanece visible por
   defecto (ver regla ".reveal" en styles.css, fuera del scope ".js-reveal").
   -------------------------------------------------------------------------- */
function initRevealOnScroll() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;

  // Activa el modo animado sólo si JS corre y el navegador soporta el observer
  document.documentElement.classList.add('js-reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
    observer.observe(item);
  });
}

/* --------------------------------------------------------------------------
   5. FILTRO DE REPERTORIO
   -------------------------------------------------------------------------- */
function initRepertorioFilter() {
  const filterBar = document.querySelector('.filter-bar');
  const rows = document.querySelectorAll('.repertorio-row');
  const emptyState = document.querySelector('.repertorio-empty');

  if (!filterBar || !rows.length) return;

  const buttons = Array.from(filterBar.querySelectorAll('.filter-btn'));

  const applyFilter = (category) => {
    let visibleCount = 0;

    rows.forEach((row) => {
      const rowCategory = row.dataset.category || 'todos';
      const matches = category === 'todos' || rowCategory === category;

      row.classList.toggle('is-hidden', !matches);
      if (matches) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      applyFilter(button.dataset.filter || 'todos');
    });
  });
}

/* --------------------------------------------------------------------------
   6. FORMULARIO DE COTIZACIÓN → WHATSAPP
   No hace submit HTTP: valida, construye el mensaje y abre wa.me.
   -------------------------------------------------------------------------- */
function initWhatsAppForm() {
  const form = document.querySelector('#form-cotizacion');
  if (!form) return;

  const WHATSAPP_NUMBER = '50376545351';
  const statusEl = form.querySelector('.form-status');

  const setStatus = (message, state) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state || '';
  };

  const eventLabels = {
    serenata: 'Serenata sorpresa',
    boda: 'Boda / Aniversario',
    cumpleanos: 'Cumpleaños',
    empresarial: 'Evento empresarial',
    funeral: 'Funeral / Homenaje',
    otro: 'Otro',
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const nombre = (data.get('nombre') || '').toString().trim();
    const telefono = (data.get('telefono') || '').toString().trim();
    const tipoEvento = (data.get('tipo_evento') || '').toString().trim();
    const fecha = (data.get('fecha') || '').toString().trim();
    const ubicacion = (data.get('ubicacion') || '').toString().trim();
    const duracion = (data.get('duracion') || '').toString().trim();
    const notas = (data.get('notas') || '').toString().trim();

    const requiredFields = [
      { value: nombre, label: 'Nombre completo' },
      { value: telefono, label: 'Teléfono de contacto' },
      { value: tipoEvento, label: 'Tipo de evento' },
      { value: fecha, label: 'Fecha tentativa' },
      { value: ubicacion, label: 'Ubicación / Municipio' },
    ];

    const missing = requiredFields.filter((field) => field.value === '');

    if (missing.length) {
      const labels = missing.map((field) => field.label).join(', ');
      setStatus(
        `Por favor completa: ${labels}.`,
        'error'
      );
      const firstMissingName = form.querySelector(
        `[name="${getFieldNameByLabel(missing[0].label)}"]`
      );
      if (firstMissingName) firstMissingName.focus();
      return;
    }

    const eventoTexto = eventLabels[tipoEvento] || tipoEvento;

    const lines = [
      '🎻 *Solicitud de cotización — Trío Azteca de El Salvador*',
      '',
      `👤 Nombre: ${nombre}`,
      `📞 Teléfono: ${telefono}`,
      `🎉 Tipo de evento: ${eventoTexto}`,
      `📅 Fecha tentativa: ${fecha}`,
      `📍 Ubicación / Municipio: ${ubicacion}`,
    ];

    if (duracion) {
      lines.push(`🎵 Temas / horas deseadas: ${duracion}`);
    }

    if (notas) {
      lines.push(`📝 Notas especiales: ${notas}`);
    }

    lines.push('', 'Quedo atento(a) a su disponibilidad y cotización. ¡Gracias!');

    const mensaje = lines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensaje
    )}`;

    setStatus('Abriendo WhatsApp con tu cotización…', 'success');
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

/* Ayudante interno: mapea etiquetas legibles a atributos "name" del form */
function getFieldNameByLabel(label) {
  const map = {
    'Nombre completo': 'nombre',
    'Teléfono de contacto': 'telefono',
    'Tipo de evento': 'tipo_evento',
    'Fecha tentativa': 'fecha',
    'Ubicación / Municipio': 'ubicacion',
  };
  return map[label] || '';
}
