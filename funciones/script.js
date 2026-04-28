'use strict';

/* ─── MENÚ HAMBURGUESA ────────────────────── */
const btnMenu  = document.getElementById('btnMenu');
const navMovil = document.getElementById('navMovil');
const linksMovil = navMovil.querySelectorAll('a');

// Abrir/cerrar menú móvil
btnMenu.addEventListener('click', () => {
    const abierto = btnMenu.getAttribute('aria-expanded') === 'true';
    btnMenu.setAttribute('aria-expanded', String(!abierto));
    navMovil.setAttribute('aria-hidden', String(abierto));
    navMovil.classList.toggle('abierto');

    // Activar/desactivar tabindex para accesibilidad teclado
    linksMovil.forEach(a => {
    a.setAttribute('tabindex', abierto ? '-1' : '0');
    });
});

// Cerrar menú al navegar (click en link)
linksMovil.forEach(a => {
    a.addEventListener('click', () => {
    btnMenu.setAttribute('aria-expanded', 'false');
    navMovil.setAttribute('aria-hidden', 'true');
    navMovil.classList.remove('abierto');
    linksMovil.forEach(l => l.setAttribute('tabindex', '-1'));
    });
});

// Cerrar menú con Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMovil.classList.contains('abierto')) {
    btnMenu.setAttribute('aria-expanded', 'false');
    navMovil.setAttribute('aria-hidden', 'true');
    navMovil.classList.remove('abierto');
    linksMovil.forEach(l => l.setAttribute('tabindex', '-1'));
    btnMenu.focus(); // devolver foco al botón
    }
});


/* ─── CARRUSEL AUTOMÁTICO ─────────────────── */
const pista     = document.getElementById('carruselPista');
const slides    = pista.querySelectorAll('.slide');
const puntos    = document.querySelectorAll('.punto');
const btnPrev   = document.getElementById('btnPrev');
const btnNext   = document.getElementById('btnNext');

let indiceActual = 0;
let temporizador; // id del intervalo automático
const INTERVALO = 4500; // ms entre cambios automáticos

// Mover pista al slide indicado
function irASlide(n) {
    indiceActual = (n + slides.length) % slides.length;
    pista.style.transform = `translateX(-${indiceActual * 100}%)`;

    // Actualizar puntos indicadores
    puntos.forEach((p, i) => {
    p.classList.toggle('activo', i === indiceActual);
    p.setAttribute('aria-selected', String(i === indiceActual));
    });
}

// Avanzar al siguiente slide
function siguiente() { irASlide(indiceActual + 1); }
function anterior()  { irASlide(indiceActual - 1); }

// Iniciar bucle automático
function iniciarAuto() {
    temporizador = setInterval(siguiente, INTERVALO);
}

// Reiniciar temporizador al interactuar manualmente
function reiniciarAuto() {
    clearInterval(temporizador);
    iniciarAuto();
}

btnNext.addEventListener('click', () => { siguiente(); reiniciarAuto(); });
btnPrev.addEventListener('click', () => { anterior();  reiniciarAuto(); });

// Puntos: ir directamente a slide elegido
puntos.forEach(p => {
    p.addEventListener('click', () => {
    irASlide(Number(p.dataset.indice));
    reiniciarAuto();
    });
});

// Pausar automático al pasar ratón encima
pista.parentElement.addEventListener('mouseenter', () => clearInterval(temporizador));
pista.parentElement.addEventListener('mouseleave', iniciarAuto);

// Navegación teclado en carrusel (←  →)
pista.parentElement.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { anterior(); reiniciarAuto(); }
    if (e.key === 'ArrowRight') { siguiente(); reiniciarAuto(); }
});

iniciarAuto(); // arrancar carrusel


/* ─── VALIDACIÓN FORMULARIO ───────────────── */
const form       = document.getElementById('formContacto');
const campoNombre  = document.getElementById('campoNombre');
const campoEmail   = document.getElementById('campoEmail');
const campoMensaje = document.getElementById('campoMensaje');
const formExito    = document.getElementById('formExito');

// Validar campo individual: retorna true si válido
function validarCampo(contenedor, condicion) {
    contenedor.classList.toggle('invalido', !condicion);
    return condicion;
}

form.addEventListener('submit', e => {
    e.preventDefault(); // no enviar real

    const nombre  = document.getElementById('nombre').value.trim();
    const email   = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validar todos los campos
    const v1 = validarCampo(campoNombre,  nombre.length >= 2);
    const v2 = validarCampo(campoEmail,   regexEmail.test(email));
    const v3 = validarCampo(campoMensaje, mensaje.length >= 10);

    if (v1 && v2 && v3) {
    // Todo válido: mostrar mensaje éxito
    form.reset();
    formExito.style.display = 'block';
    setTimeout(() => { formExito.style.display = 'none'; }, 5000);
    } else {
    // Enfocar primer campo inválido
    form.querySelector('.invalido input, .invalido textarea')?.focus();
    }
});

// Limpiar error al escribir
form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
    input.closest('.campo')?.classList.remove('invalido');
    });
});