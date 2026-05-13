/* ═══════════════════════════════════════════
   main.js — Aficiorriarios Ferroviarios
   Módulos: dropdown · menú móvil · carrusel · formulario
   ═══════════════════════════════════════════ */
'use strict';

/* ── ESPERAR DOM listo ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────
     MÓDULO 1: DROPDOWN GALERÍA (escritorio)
     Abrir/cerrar con clic. Cerrar con Escape
     y al hacer clic fuera. Teclado accesible.
     ──────────────────────────────────────────── */
  const dropdowns = document.querySelectorAll('.nav-links .dropdown');

  dropdowns.forEach(dd => {
    const btn     = dd.querySelector('.dropbtn');
    const content = dd.querySelector('.dropdown-content');
    if (!btn || !content) return;

    // Clic en botón: abrir/cerrar este dropdown
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const estaAbierto = dd.classList.contains('abierto');
      cerrarTodosDropdowns();
      if (!estaAbierto) {
        dd.classList.add('abierto');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Navegación por teclado dentro del panel
    content.addEventListener('keydown', e => {
      const links = [...content.querySelectorAll('a')];
      const idx   = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(idx + 1, links.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); links[Math.max(idx - 1, 0)]?.focus(); }
      if (e.key === 'Escape')    { cerrarTodosDropdowns(); btn.focus(); }
    });
  });

  // Cerrar todos los dropdowns al hacer clic fuera
  document.addEventListener('click', cerrarTodosDropdowns);

  // Cerrar con Escape desde cualquier parte de la página
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarTodosDropdowns();
  });

  function cerrarTodosDropdowns() {
    dropdowns.forEach(dd => {
      dd.classList.remove('abierto');
      dd.querySelector('.dropbtn')?.setAttribute('aria-expanded', 'false');
    });
  }

  /* ────────────────────────────────────────────
     MÓDULO 2: SUBMENÚ GALERÍA EN MÓVIL
     Desplegable independiente dentro de nav-movil
     ──────────────────────────────────────────── */
  const btnGaleriaMovil  = document.getElementById('btnGaleriaMovil');
  const submenuGaleria   = document.getElementById('submenuGaleriaMovil');

  if (btnGaleriaMovil && submenuGaleria) {
    btnGaleriaMovil.addEventListener('click', () => {
      const estaAbierto = submenuGaleria.classList.contains('abierto');
      submenuGaleria.classList.toggle('abierto', !estaAbierto);
      btnGaleriaMovil.setAttribute('aria-expanded', String(!estaAbierto));
      // Rotar flecha del botón
      const flecha = btnGaleriaMovil.querySelector('.arrow');
      if (flecha) flecha.style.transform = estaAbierto ? '' : 'rotate(180deg)';
    });
  }

  /* ────────────────────────────────────────────
     MÓDULO 3: MENÚ HAMBURGUESA
     Controlar apertura/cierre suave en móvil
     ──────────────────────────────────────────── */
  const btnMenu    = document.getElementById('btnMenu');
  const navMovil   = document.getElementById('navMovil');
  // Seleccionar solo <a> directos, excluir el btn-galeria-movil y el submenu
  const linksMovil = navMovil
    ? [...navMovil.querySelectorAll('a'), btnGaleriaMovil].filter(Boolean)
    : [];

  if (btnMenu && navMovil) {

    // Abrir o cerrar menú al pulsar hamburguesa
    btnMenu.addEventListener('click', () => {
      const estaAbierto = btnMenu.getAttribute('aria-expanded') === 'true';
      btnMenu.setAttribute('aria-expanded', String(!estaAbierto));
      navMovil.setAttribute('aria-hidden', String(estaAbierto));
      navMovil.classList.toggle('abierto');

      // Activar/desactivar tabindex: accesibilidad teclado
      linksMovil.forEach(el =>
        el.setAttribute('tabindex', estaAbierto ? '-1' : '0')
      );
    });

    // Cerrar menú al navegar por link (solo <a>)
    navMovil.querySelectorAll('a').forEach(a => {
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
     MÓDULO 4: CARRUSEL AUTOMÁTICO
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
     MÓDULO 5: VALIDACIÓN FORMULARIO
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