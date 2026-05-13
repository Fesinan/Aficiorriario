/* ═══════════════════════════════════════════════
   galerias.js — Lógica compartida de galerías
   Módulos:  filtros · lightbox
   ═══════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────
     MÓDULO 1: FILTRADO DE GALERÍA
     Leer data-categoria de cada item y filtrar.
     ────────────────────────────────────────────── */
  const filtrosBtns = document.querySelectorAll('.filtro-btn');
  const galeriaItems = document.querySelectorAll('.galeria-item');
  const contador     = document.getElementById('galeriaContador');
  const msgVacia     = document.getElementById('galeriaMsgVacia');

  if (filtrosBtns.length && galeriaItems.length) {

    filtrosBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Actualizar botón activo
        filtrosBtns.forEach(b => {
          b.classList.remove('activo');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('activo');
        btn.setAttribute('aria-pressed', 'true');

        const filtro = btn.dataset.filtro; // 'todos' o slug de categoría
        aplicarFiltro(filtro);
      });
    });

    function aplicarFiltro(filtro) {
      let visibles = 0;

      galeriaItems.forEach(item => {
        const cat = item.dataset.categoria;
        const mostrar = filtro === 'todos' || cat === filtro;
        item.classList.toggle('oculto', !mostrar);
        if (mostrar) {
          visibles++;
          // Re-lanzar animación de aparición
          item.style.animation = 'none';
          // forzar reflow
          void item.offsetWidth;
          item.style.animation = '';
        }
      });

      // Actualizar contador
      if (contador) {
        contador.textContent = `${visibles} imagen${visibles !== 1 ? 'es' : ''}`;
      }

      // Mostrar/ocultar mensaje vacío
      if (msgVacia) {
        msgVacia.hidden = visibles > 0;
      }
    }

    // Aplicar filtro inicial ("todos") al cargar
    aplicarFiltro('todos');
  }


  /* ──────────────────────────────────────────────
     MÓDULO 2: LIGHTBOX
     Abrir imagen al clic. Navegar por filtro activo.
     ────────────────────────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lbImg         = document.getElementById('lbImg');
  const lbTitulo      = document.getElementById('lbTitulo');
  const lbMeta        = document.getElementById('lbMeta');
  const lbCerrar      = document.getElementById('lbCerrar');
  const lbPrev        = document.getElementById('lbPrev');
  const lbNext        = document.getElementById('lbNext');

  if (!lightbox || !lbImg) return; // no hay lightbox en esta página

  let itemsActivos = []; // items visibles con el filtro activo
  let indiceActual = 0;

  // Obtener lista de items visibles actualmente
  function getItemsVisibles() {
    return [...document.querySelectorAll('.galeria-item:not(.oculto)')];
  }

  // Abrir lightbox con el item indicado
  function abrirLightbox(item) {
    itemsActivos = getItemsVisibles();
    indiceActual = itemsActivos.indexOf(item);

    mostrarImagen(indiceActual);
    lightbox.classList.add('visible');
    document.body.style.overflow = 'hidden'; // bloquear scroll
    lbCerrar.focus();
  }

  // Mostrar imagen en posición n de itemsActivos
  function mostrarImagen(n) {
    const item = itemsActivos[n];
    if (!item) return;

    const img    = item.querySelector('img');
    const titulo = item.querySelector('.galeria-item-titulo');
    const cat    = item.dataset.categoria || '';

    // Transición de fade
    lbImg.classList.add('transicion');
    setTimeout(() => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      if (lbTitulo) lbTitulo.textContent = titulo ? titulo.textContent : img.alt;
      if (lbMeta)   lbMeta.innerHTML =
        `<strong>${formatearCategoria(cat)}</strong> &nbsp;·&nbsp; ${n + 1} / ${itemsActivos.length}`;
      lbImg.classList.remove('transicion');
    }, 220);

    // Mostrar/ocultar botones nav si solo hay 1 imagen
    const hayVarias = itemsActivos.length > 1;
    lbPrev.hidden = !hayVarias;
    lbNext.hidden = !hayVarias;
  }

  // Convertir slug a texto legible
  function formatearCategoria(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Cerrar lightbox
  function cerrarLightbox() {
    lightbox.classList.remove('visible');
    document.body.style.overflow = '';
    // Devolver foco al item que abrió el lightbox
    itemsActivos[indiceActual]?.focus();
  }

  // Navegar a imagen anterior
  function irAnterior() {
    indiceActual = (indiceActual - 1 + itemsActivos.length) % itemsActivos.length;
    mostrarImagen(indiceActual);
  }

  // Navegar a imagen siguiente
  function irSiguiente() {
    indiceActual = (indiceActual + 1) % itemsActivos.length;
    mostrarImagen(indiceActual);
  }

  // Asignar clic a cada item de galería
  galeriaItems.forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label',
      `Ver imagen: ${item.querySelector('.galeria-item-titulo')?.textContent || 'imagen'}`
    );

    item.addEventListener('click', () => abrirLightbox(item));

    // Activar con Enter / Espacio (accesibilidad teclado)
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirLightbox(item);
      }
    });
  });

  // Botones del lightbox
  lbCerrar.addEventListener('click', cerrarLightbox);
  lbPrev.addEventListener('click', irAnterior);
  lbNext.addEventListener('click', irSiguiente);

  // Cerrar al hacer clic en el fondo oscuro (fuera de la imagen)
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) cerrarLightbox();
  });

  // Navegación por teclado dentro del lightbox
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('visible')) return;
    if (e.key === 'Escape')      cerrarLightbox();
    if (e.key === 'ArrowLeft')   irAnterior();
    if (e.key === 'ArrowRight')  irSiguiente();
  });

  // Re-sincronizar itemsActivos al cambiar filtro
  // (los botones de filtro ya actualizan clases; el lightbox los lee en tiempo real)

}); // fin DOMContentLoaded
