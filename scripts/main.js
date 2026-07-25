/* ══════════════════════════════════════════════
   Invitación de boda — Julio & Tamara
   ══════════════════════════════════════════════ */

// ─────────── Configuración ───────────
const FECHA_EVENTO = new Date('2026-08-29T17:30:00-04:00');

// ─────────── Sobre de bienvenida ───────────
const sobre = document.getElementById('sobre');
const btnAbrir = document.getElementById('abrirInvitacion');
document.body.style.overflow = 'hidden';

// ─────────── Música de fondo ───────────
const musica = document.getElementById('musicaFondo');
const musicaToggle = document.getElementById('musicaToggle');
const VOLUMEN_MAX = 0.6;
musica.volume = 0;

function subirVolumen() {
    // Fade-in suave del volumen
    const paso = VOLUMEN_MAX / 20;
    const fade = setInterval(() => {
        musica.volume = Math.min(VOLUMEN_MAX, musica.volume + paso);
        if (musica.volume >= VOLUMEN_MAX) clearInterval(fade);
    }, 60);
}

function reproducirMusica() {
    musica.play().then(() => {
        subirVolumen();
        musicaToggle.classList.remove('pausado');
        musicaToggle.setAttribute('aria-label', 'Pausar música');
    }).catch(() => {
        // El navegador bloqueó la reproducción: dejar en pausa visible
        musicaToggle.classList.add('pausado');
        musicaToggle.setAttribute('aria-label', 'Reproducir música');
    });
}

musicaToggle.addEventListener('click', () => {
    if (musica.paused) {
        reproducirMusica();
    } else {
        musica.pause();
        musicaToggle.classList.add('pausado');
        musicaToggle.setAttribute('aria-label', 'Reproducir música');
    }
});

const reducirMovimientoSobre = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

btnAbrir.addEventListener('click', () => {
    if (sobre.classList.contains('abriendo')) return;

    sobre.classList.add('abriendo');
    musicaToggle.classList.add('visible');
    reproducirMusica();

    const espera = reducirMovimientoSobre ? 0 : 600;
    setTimeout(() => {
        sobre.classList.add('cerrado');
        document.body.style.overflow = '';
    }, espera);
});

// ─────────── Invitación personalizada (?id=CODIGO) ───────────
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycby_9TxIDL6ol3sQHLfu5ru6mAkKt11LoafeMQ3CGXKIogEJp40k4PDfuK53X3J8WrSP/exec';

const params = new URLSearchParams(window.location.search);
const idInvitado = (params.get('id') || '').trim().toUpperCase();

const elNombreInvitado = document.getElementById('nombreInvitado');
const elNumeroPases = document.getElementById('numeroPases');
const sobreInvalido = document.getElementById('sobreInvalido');
const btnConfirmar = document.getElementById('btnConfirmar');

function marcarConfirmado() {
    btnConfirmar.textContent = '✓ Ya confirmaste tu asistencia';
    btnConfirmar.classList.add('btn--confirmado');
    btnConfirmar.disabled = true;
}

function desmarcarConfirmado() {
    btnConfirmar.textContent = 'Confirmar asistencia';
    btnConfirmar.classList.remove('btn--confirmado');
    btnConfirmar.disabled = false;
}

function mostrarInvitacionInvalida() {
    sobreInvalido.classList.add('visible');
    sobreInvalido.setAttribute('aria-hidden', 'false');
}

// La página siempre carga de inmediato con datos genéricos; el nombre real
// (y el estado de confirmación) llegan después, en segundo plano.
if (!idInvitado) {
    mostrarInvitacionInvalida();
} else {
    if (localStorage.getItem('rsvp:' + idInvitado) === 'confirmado') {
        marcarConfirmado();
    }

    // El servidor siempre manda la verdad; la caché de arriba solo evita el parpadeo
    // mientras llega la respuesta.
    fetch(`${RSVP_ENDPOINT}?id=${encodeURIComponent(idInvitado)}`)
        .then((r) => r.json())
        .then((datos) => {
            if (!datos.existe) {
                mostrarInvitacionInvalida();
                return;
            }
            const nombreInvitado = (datos.nombre || '').trim();
            if (nombreInvitado) elNombreInvitado.textContent = nombreInvitado;
            if (datos.pases) elNumeroPases.textContent = datos.pases;
            if (datos.confirmado) {
                localStorage.setItem('rsvp:' + idInvitado, 'confirmado');
                marcarConfirmado();
            } else {
                localStorage.removeItem('rsvp:' + idInvitado);
                desmarcarConfirmado();
            }
        })
        .catch(() => {});
}

// ─────────── Cuenta regresiva ───────────
const cdDias = document.getElementById('cd-dias');
const cdHoras = document.getElementById('cd-horas');
const cdMin = document.getElementById('cd-min');
const cdSeg = document.getElementById('cd-seg');

function actualizarContador() {
    const resta = FECHA_EVENTO - Date.now();

    if (resta <= 0) {
        cdDias.textContent = '0';
        cdHoras.textContent = '0';
        cdMin.textContent = '0';
        cdSeg.textContent = '0';
        clearInterval(intervaloContador);
        return;
    }

    cdDias.textContent = Math.floor(resta / 86400000);
    cdHoras.textContent = String(Math.floor(resta / 3600000) % 24).padStart(2, '0');
    cdMin.textContent = String(Math.floor(resta / 60000) % 60).padStart(2, '0');
    cdSeg.textContent = String(Math.floor(resta / 1000) % 60).padStart(2, '0');
}

const intervaloContador = setInterval(actualizarContador, 1000);
actualizarContador();

// ─────────── Reveal on scroll ───────────
const observador = new IntersectionObserver(
    (entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => observador.observe(el));

// ─────────── Pétalos en el hero ───────────
const contenedorPetalos = document.querySelector('.hero__petalos');
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (contenedorPetalos && !reducirMovimiento) {
    const TOTAL_PETALOS = 14;
    for (let i = 0; i < TOTAL_PETALOS; i++) {
        const petalo = document.createElement('span');
        petalo.className = 'petalo';
        petalo.style.left = Math.random() * 100 + '%';
        petalo.style.animationDuration = 9 + Math.random() * 8 + 's';
        petalo.style.animationDelay = Math.random() * 12 + 's';
        const escala = 0.6 + Math.random() * 0.9;
        petalo.style.width = 12 * escala + 'px';
        petalo.style.height = 12 * escala + 'px';
        contenedorPetalos.appendChild(petalo);
    }
}

// ─────────── Popup de confirmación de asistencia ───────────
const rsvpPopup = document.getElementById('rsvpPopup');
const rsvpPopupCerrar = document.getElementById('rsvpPopupCerrar');

function cerrarRsvpPopup() {
    rsvpPopup.classList.remove('abierto');
    rsvpPopup.setAttribute('aria-hidden', 'true');
}

function abrirRsvpPopup() {
    rsvpPopup.classList.add('abierto');
    rsvpPopup.setAttribute('aria-hidden', 'false');
}

btnConfirmar.addEventListener('click', () => {
    if (btnConfirmar.disabled) return;

    if (idInvitado) {
        fetch(RSVP_ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams({ id: idInvitado }),
        }).catch(() => {});
        localStorage.setItem('rsvp:' + idInvitado, 'confirmado');
        marcarConfirmado();
    }

    abrirRsvpPopup();
});

rsvpPopupCerrar.addEventListener('click', cerrarRsvpPopup);
rsvpPopup.addEventListener('click', (e) => {
    if (e.target === rsvpPopup) cerrarRsvpPopup();
});

// ─────────── Lightbox de la galería ───────────
const lightbox = document.getElementById('lightbox');
const lbImagen = document.getElementById('lbImagen');
const lbCerrar = document.getElementById('lbCerrar');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const fotos = Array.from(document.querySelectorAll('.galeria__item img'));
let indiceActual = 0;

function abrirLightbox(indice) {
    indiceActual = indice;
    lbImagen.src = fotos[indiceActual].src;
    lightbox.classList.add('abierto');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    lightbox.classList.remove('abierto');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function mostrarFoto(direccion) {
    indiceActual = (indiceActual + direccion + fotos.length) % fotos.length;
    lbImagen.src = fotos[indiceActual].src;
}

fotos.forEach((img, i) => {
    img.closest('.galeria__item').addEventListener('click', () => abrirLightbox(i));
});

lbCerrar.addEventListener('click', cerrarLightbox);
lbPrev.addEventListener('click', () => mostrarFoto(-1));
lbNext.addEventListener('click', () => mostrarFoto(1));

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) cerrarLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') mostrarFoto(-1);
    if (e.key === 'ArrowRight') mostrarFoto(1);
});

// Gestos táctiles en el lightbox
let toqueInicioX = 0;

lightbox.addEventListener('touchstart', (e) => {
    toqueInicioX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - toqueInicioX;
    if (Math.abs(delta) > 50) mostrarFoto(delta > 0 ? -1 : 1);
}, { passive: true });
