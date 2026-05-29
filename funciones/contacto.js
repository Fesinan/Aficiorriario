/* ═══════════════════════════════════════════════
   contacto.js — Lógica del formulario de contacto
   Módulos: validación · chips de asunto · contador
            de caracteres · animación de envío
   ═══════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────
     MÓDULO 1: CHIPS DE ASUNTO PREDEFINIDO
     Al pulsar un chip, rellena el campo de asunto
     ────────────────────────────────────────────── */
  const inputAsunto  = document.getElementById('asunto');
  const chipsAsunto  = document.querySelectorAll('.asunto-chip');

  if (inputAsunto && chipsAsunto.length) {
    chipsAsunto.forEach(chip => {
      chip.addEventListener('click', () => {
        // Rellenar el input con el texto del chip
        inputAsunto.value = chip.textContent.trim();
        inputAsunto.focus();

        // Marcar chip activo visualmente (opcional, clase transitoria)
        chipsAsunto.forEach(c => c.removeAttribute('aria-pressed'));
        chip.setAttribute('aria-pressed', 'true');

        // Limpiar estado de error si existía
        inputAsunto.closest('.campo')?.classList.remove('invalido', 'valido');
      });
    });
  }


  /* ──────────────────────────────────────────────
     MÓDULO 2: CONTADOR DE CARACTERES EN TEXTAREA
     Muestra progresión y advierte cerca del límite
     ────────────────────────────────────────────── */
  const textarea     = document.getElementById('mensaje');
  const charCount    = document.getElementById('charCount');
  const MAX_CHARS    = 1200;
  const UMBRAL_WARN  = 0.80; // 80 %: color advertencia
  const UMBRAL_LIMIT = 0.95; // 95 %: color límite

  if (textarea && charCount) {
    // Actualizar contador al escribir
    textarea.addEventListener('input', actualizarContador);
    actualizarContador(); // estado inicial

    function actualizarContador() {
      const usados   = textarea.value.length;
      const restantes = MAX_CHARS - usados;

      // Texto del contador
      charCount.textContent = `${usados} / ${MAX_CHARS}`;

      // Clases de color según umbral
      charCount.classList.remove('advertencia', 'limite');
      if (usados >= Math.floor(MAX_CHARS * UMBRAL_LIMIT)) {
        charCount.classList.add('limite');
      } else if (usados >= Math.floor(MAX_CHARS * UMBRAL_WARN)) {
        charCount.classList.add('advertencia');
      }
    }
  }


  /* ──────────────────────────────────────────────
     MÓDULO 3: VALIDACIÓN DEL FORMULARIO
     Valida en tiempo real (blur) y al intentar enviar
     ────────────────────────────────────────────── */
  const form         = document.getElementById('formContacto');
  const campoNombre  = document.getElementById('campo-nombre');
  const campoEmail   = document.getElementById('campo-email');
  const campoAsunto  = document.getElementById('campo-asunto');
  const campoMensaje = document.getElementById('campo-mensaje');
  const btnEnviar    = document.getElementById('btnEnviar');
  const msgExito     = document.getElementById('formExito');

  if (!form) return; // salir si no hay formulario en la página

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Valida un campo y actualiza su estado visual.
   * @param {HTMLElement} contenedor  — elemento .campo
   * @param {boolean}     esValido    — resultado de la condición
   * @param {string}      [errorMsg]  — texto del error (opcional)
   * @returns {boolean}
   */
  function validarCampo(contenedor, esValido, errorMsg) {
    if (!contenedor) return true;

    contenedor.classList.remove('valido', 'invalido');

    if (esValido) {
      contenedor.classList.add('valido');
    } else {
      contenedor.classList.add('invalido');
      // Actualizar texto de error si se pasó uno
      if (errorMsg) {
        const msgEl = contenedor.querySelector('.error-msg');
        if (msgEl) msgEl.textContent = errorMsg;
      }
    }

    return esValido;
  }

  /**
   * Obtiene el input o textarea dentro de un .campo
   */
  function getInput(campo) {
    return campo?.querySelector('input, textarea');
  }

  /**
   * Ejecuta toda la validación y retorna true si es válido
   */
  function validarTodo() {
    const nombre  = getInput(campoNombre)?.value.trim()  || '';
    const email   = getInput(campoEmail)?.value.trim()   || '';
    const asunto  = getInput(campoAsunto)?.value.trim()  || '';
    const mensaje = getInput(campoMensaje)?.value.trim() || '';

    const v1 = validarCampo(campoNombre,  nombre.length >= 2,
      'Nombre debe tener al menos 2 caracteres');

    const v2 = validarCampo(campoEmail,   REGEX_EMAIL.test(email),
      email.length === 0
        ? 'El email es obligatorio'
        : 'Formato inválido: ejemplo@sitio.com');

    const v3 = validarCampo(campoAsunto,  asunto.length >= 3,
      'Indica el asunto del mensaje');

    const v4 = validarCampo(campoMensaje, mensaje.length >= 15,
      'El mensaje debe tener al menos 15 caracteres');

    return v1 && v2 && v3 && v4;
  }


  /* ── Validación al salir del campo (blur) ── */
  [campoNombre, campoEmail, campoAsunto, campoMensaje].forEach(campo => {
    const input = getInput(campo);
    if (!input) return;

    input.addEventListener('blur', () => {
      const val = input.value.trim();

      // Sólo validar si el usuario escribió algo (no molestar campos intactos)
      if (val.length === 0 && !campo.classList.contains('invalido')) return;

      switch (campo.id) {
        case 'campo-nombre':
          validarCampo(campo, val.length >= 2, 'Mínimo 2 caracteres');
          break;
        case 'campo-email':
          validarCampo(campo, REGEX_EMAIL.test(val),
            val.length === 0 ? 'Campo obligatorio' : 'Formato inválido');
          break;
        case 'campo-asunto':
          validarCampo(campo, val.length >= 3, 'Mínimo 3 caracteres');
          break;
        case 'campo-mensaje':
          validarCampo(campo, val.length >= 15, 'Mínimo 15 caracteres');
          break;
      }
    });

    /* Limpiar error al empezar a escribir de nuevo */
    input.addEventListener('input', () => {
      if (campo.classList.contains('invalido')) {
        campo.classList.remove('invalido', 'valido');
      }
    });
  });


  /* ── Envío del formulario ──────────────────── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Ejecutar validación completa
    if (!validarTodo()) {
      // Enfocar el primer campo con error para accesibilidad
      const primerError = form.querySelector('.invalido input, .invalido textarea');
      primerError?.focus();
      return;
    }

    // Simular envío asíncrono (1.8 s de "carga")
    btnEnviar.classList.add('enviando');
    btnEnviar.setAttribute('aria-busy', 'true');
    btnEnviar.setAttribute('aria-label', 'Enviando mensaje…');

    setTimeout(() => {
      // Restablecer botón
      btnEnviar.classList.remove('enviando');
      btnEnviar.setAttribute('aria-busy', 'false');
      btnEnviar.setAttribute('aria-label', 'Enviar mensaje');

      // Limpiar formulario y estados visuales
      form.reset();
      [campoNombre, campoEmail, campoAsunto, campoMensaje].forEach(c => {
        c?.classList.remove('valido', 'invalido');
      });

      // Reiniciar contador de caracteres
      if (charCount) {
        charCount.textContent = `0 / ${MAX_CHARS}`;
        charCount.classList.remove('advertencia', 'limite');
      }

      // Quitar aria-pressed de chips de asunto
      chipsAsunto.forEach(c => c.removeAttribute('aria-pressed'));

      // Mostrar mensaje de éxito
      if (msgExito) {
        msgExito.classList.add('visible');
        msgExito.setAttribute('aria-hidden', 'false');
        msgExito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Ocultar automáticamente tras 7 segundos
        setTimeout(() => {
          msgExito.classList.remove('visible');
          msgExito.setAttribute('aria-hidden', 'true');
        }, 7000);
      }
    }, 1800);
  });


  /* ──────────────────────────────────────────────
     MÓDULO 4: ANIMACIÓN DE APARICIÓN AL SCROLL
     Entran las tarjetas de canal con fadeUp suave
     (IntersectionObserver, sin librería externa)
     ────────────────────────────────────────────── */
  const elementosAnimados = document.querySelectorAll(
    '.canal-item, .faq-item, .contacto-formulario-wrapper'
  );

  if ('IntersectionObserver' in window && elementosAnimados.length) {
    // Establecer estado inicial: invisible y ligeramente desplazado hacia abajo
    elementosAnimados.forEach((el, i) => {
      el.style.opacity  = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity  = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target); // animar solo una vez
          }
        });
      },
      { threshold: 0.12 }
    );

    elementosAnimados.forEach(el => observer.observe(el));
  }

}); // fin DOMContentLoaded