/* ═══════════════════════════════════════════
   main.js — Aficiorriarios Ferroviarios
   Módulos: menú móvil · carrusel · formulario
   ═══════════════════════════════════════════ */
'use strict';

/* ── ESPERAR DOM listo ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────
     MÓDULO 1: MENÚ HAMBURGUESA
     Controlar apertura/cierre suave en móvil
     ──────────────────────────────────────────── */
  const btnMenu    = document.getElementById('btnMenu');
  const navMovil   = document.getElementById('navMovil');
  const linksMovil = navMovil ? navMovil.querySelectorAll('a') : [];

  if (btnMenu && navMovil) {

    // Abrir o cerrar menú al pulsar hamburguesa
    btnMenu.addEventListener('click', () => {
      const estaAbierto = btnMenu.getAttribute('aria-expanded') === 'true';
      btnMenu.setAttribute('aria-expanded', String(!estaAbierto));
      navMovil.setAttribute('aria-hidden', String(estaAbierto));
      navMovil.classList.toggle('abierto');

      // Activar/desactivar tabindex: accesibilidad teclado
      linksMovil.forEach(a =>
        a.setAttribute('tabindex', estaAbierto ? '-1' : '0')
      );
    });

    // Cerrar menú al navegar por link
    linksMovil.forEach(a => {
      a.addEventListener('click', cerrarMenu);
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMovil.classList.contains('abierto')) {
        cerrarMenu();
        btnMenu.focus(); // devolver foco al botón
      }
    });
  }

  // Función reutilizable: cerrar menú
  function cerrarMenu() {
    btnMenu.setAttribute('aria-expanded', 'false');
    navMovil.setAttribute('aria-hidden', 'true');
    navMovil.classList.remove('abierto');
    linksMovil.forEach(l => l.setAttribute('tabindex', '-1'));
  }


  /* ────────────────────────────────────────────
     MÓDULO 2: CARRUSEL AUTOMÁTICO
     Avanzar cada INTERVALO ms. Transición suave.
     ──────────────────────────────────────────── */
  const pista   = document.getElementById('carruselPista');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  if (pista) {
    const slides  = pista.querySelectorAll('.slide');
    const puntos  = document.querySelectorAll('.punto');

    let indiceActual = 0;
    let temporizador;
    const INTERVALO = 4800; // ms entre cambios automáticos

    // Mover pista y actualizar indicadores
    function irASlide(n) {
      indiceActual = (n + slides.length) % slides.length;
      pista.style.transform = `translateX(-${indiceActual * 100}%)`;

      // Sincronizar puntos indicadores
      puntos.forEach((p, i) => {
        p.classList.toggle('activo', i === indiceActual);
        p.setAttribute('aria-selected', String(i === indiceActual));
      });
    }

    function siguiente() { irASlide(indiceActual + 1); }
    function anterior()  { irASlide(indiceActual - 1); }

    // Arrancar bucle automático
    function iniciarAuto() {
      temporizador = setInterval(siguiente, INTERVALO);
    }

    // Reiniciar temporizador tras interacción manual
    function reiniciarAuto() {
      clearInterval(temporizador);
      iniciarAuto();
    }

    // Botones prev / next
    if (btnPrev) btnPrev.addEventListener('click', () => { anterior();  reiniciarAuto(); });
    if (btnNext) btnNext.addEventListener('click', () => { siguiente(); reiniciarAuto(); });

    // Puntos: ir al slide concreto
    puntos.forEach(p => {
      p.addEventListener('click', () => {
        irASlide(Number(p.dataset.indice));
        reiniciarAuto();
      });
    });

    // Pausar al pasar ratón encima (no distraer lectura)
    const contenedorCarrusel = pista.parentElement;
    contenedorCarrusel.addEventListener('mouseenter', () => clearInterval(temporizador));
    contenedorCarrusel.addEventListener('mouseleave', iniciarAuto);

    // Navegación teclado con flechas ← →
    contenedorCarrusel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { anterior(); reiniciarAuto(); }
      if (e.key === 'ArrowRight') { siguiente(); reiniciarAuto(); }
    });

    iniciarAuto(); // arrancar al cargar
  }


  /* ────────────────────────────────────────────
     MÓDULO 3: VALIDACIÓN FORMULARIO
     Verificar campos antes de enviar
     ──────────────────────────────────────────── */
  const form         = document.getElementById('formContacto');
  const campoNombre  = document.getElementById('campoNombre');
  const campoEmail   = document.getElementById('campoEmail');
  const campoMensaje = document.getElementById('campoMensaje');
  const formExito    = document.getElementById('formExito');

  if (form) {
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Marcar campo válido o inválido: retorna booleano
    function validarCampo(contenedor, condicion) {
      contenedor.classList.toggle('invalido', !condicion);
      return condicion;
    }

    // Enviar formulario
    form.addEventListener('submit', e => {
      e.preventDefault();

      const nombre  = document.getElementById('nombre').value.trim();
      const email   = document.getElementById('email').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      const v1 = validarCampo(campoNombre,  nombre.length >= 2);
      const v2 = validarCampo(campoEmail,   REGEX_EMAIL.test(email));
      const v3 = validarCampo(campoMensaje, mensaje.length >= 10);

      if (v1 && v2 && v3) {
        // Éxito: limpiar y mostrar confirmación
        form.reset();
        if (formExito) {
          formExito.style.display = 'block';
          setTimeout(() => { formExito.style.display = 'none'; }, 5500);
        }
      } else {
        // Enfocar primer campo con error
        form.querySelector('.invalido input, .invalido textarea')?.focus();
      }
    });

    // Limpiar error al escribir en cada campo
    form.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.closest('.campo')?.classList.remove('invalido');
      });
    });
  }

}); // fin DOMContentLoaded
