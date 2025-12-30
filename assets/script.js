'use strict';

/**
 * Configuración personalizada
 * - WhatsApp en wa.me debe ir SIN '+' y SIN espacios
 */
const CONFIG = {
  whatsappNumber: '593999022254',
  whatsappDisplay: '+593 999 022 254',
  defaultMsg: 'Hola, soy {NOMBRE}. Quiero una asesoría. Mi interés es: {SERVICIO}. Detalle: {MENSAJE}',
};

function $(id) { return document.getElementById(id); }

function encodeWhatsAppMessage(nombre, service, message) {
  const base = CONFIG.defaultMsg
    .replace('{NOMBRE}', nombre || 'un cliente')
    .replace('{SERVICIO}', service || 'General')
    .replace('{MENSAJE}', message || 'Sin detalles por ahora');
  return encodeURIComponent(base);
}

function buildWhatsAppLink(nombre, service, message) {
  const text = encodeWhatsAppMessage(nombre, service, message);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

function sanitizeText(text) {
  // Evita inyección básica en UI (no usamos innerHTML, solo texto)
  return String(text || '').replace(/[<>]/g, '').trim();
}

function setError(el, msg) { el.textContent = msg || ''; }

function toggleMenu() {
  const btn = document.querySelector('.nav__toggle');
  const menu = $('navMenu');
  const isOpen = menu.classList.toggle('is-open');
  btn.setAttribute('aria-expanded', String(isOpen));
}

function initNav() {
  const btn = document.querySelector('.nav__toggle');
  if (!btn) return;
  btn.addEventListener('click', toggleMenu);

  $('navMenu')?.addEventListener('click', (e) => {
    if (e.target?.tagName === 'A') {
      $('navMenu').classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initWhatsAppButtons() {
  const waDisplay = $('waDisplay');
  if (waDisplay) waDisplay.textContent = CONFIG.whatsappDisplay;

  const top = $('btnWhatsAppTop');
  const telecom = $('btnWhatsAppTelecom');
  const firma = $('btnWhatsAppFirma');
  const bottom = $('btnWhatsAppBottom');

  const generalLink = buildWhatsAppLink(
    'un cliente',
    'General',
    'Estoy interesado en conocer sus soluciones. Por favor contáctenme.'
  );

  [top, bottom].forEach(a => { if (a) a.href = generalLink; });

  if (telecom) telecom.href = buildWhatsAppLink('un cliente', 'Telecomunicaciones', 'Quiero diagnóstico para mi red/telecom.');
  if (firma) firma.href = buildWhatsAppLink('un cliente', 'Firma electrónica', 'Necesito emisión o renovación de firma electrónica.');
}

function initForm() {
  const form = $('leadForm');
  const msg = $('formMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Anti-bot: honeypot
    const hp = $('website')?.value?.trim();
    if (hp) return;

    const nombre = sanitizeText($('nombre').value);
    const empresa = sanitizeText($('empresa').value);
    const correo = sanitizeText($('correo').value);
    const servicio = $('servicio').value;
    const mensaje = sanitizeText($('mensaje').value);

    setError($('errNombre'), '');
    setError($('errCorreo'), '');
    setError($('errServicio'), '');
    setError($('errMensaje'), '');
    if (msg) msg.textContent = '';

    let ok = true;

    if (nombre.length < 3) { setError($('errNombre'), 'Ingresa tu nombre (mínimo 3 caracteres).'); ok = false; }
    if (!validEmail(correo)) { setError($('errCorreo'), 'Ingresa un correo válido.'); ok = false; }
    if (!servicio) { setError($('errServicio'), 'Selecciona un interés principal.'); ok = false; }
    if (mensaje.length < 10) { setError($('errMensaje'), 'Describe tu necesidad (mínimo 10 caracteres).'); ok = false; }

    if (!ok) return;

    // Mensaje estructurado para WhatsApp (sin backend)
    const details =
      `Nombre: ${nombre}\n` +
      (empresa ? `Empresa: ${empresa}\n` : '') +
      `Correo: ${correo}\n` +
      `Necesidad: ${mensaje}`;

    const link = buildWhatsAppLink(nombre, servicio, details);

    if (msg) msg.textContent = 'Listo. Se abrirá WhatsApp para enviar tu solicitud.';
    window.open(link, '_blank', 'noopener,noreferrer');
    form.reset();
  });
}

function initYear() {
  const y = $('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initWhatsAppButtons();
  initForm();
  initYear();
});

