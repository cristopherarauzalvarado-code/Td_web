const config = window.TOP_DOGS;
const defaultWhatsAppMessage = 'Hola Top Dogs, quisiera información para empezar a entrenar.';

function whatsappUrl(message) {
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('.whatsapp').forEach((link) => {
  link.href = whatsappUrl(link.dataset.message || defaultWhatsAppMessage);
  link.target = '_blank';
  link.rel = 'noopener';
});

document.querySelectorAll('.maps-link').forEach((link) => {
  link.href = config.mapsUrl;
});

const menu = document.querySelector('.menu');
const navigation = document.querySelector('nav');

menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  });
});

const form = document.querySelector('#booking-form');
const dateInput = form.elements.date;
const formStatus = document.querySelector('#form-status');
const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Costa_Rica',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

dateInput.min = today;

form.addEventListener('submit', (event) => {
  event.preventDefault();

  dateInput.setCustomValidity(dateInput.value < today ? 'Elige una fecha de hoy en adelante.' : '');

  if (!form.reportValidity()) return;

  const values = new FormData(form);
  const classType = values.get('type') === 'prueba' ? 'clase de prueba' : 'clase privada';
  const goal = values.get('goal').trim() || 'Por definir con el profesor';
  const message = [
    `Hola Top Dogs, quiero solicitar una ${classType}.`,
    `Nombre: ${values.get('name').trim()}`,
    `Fecha preferida: ${values.get('date')}`,
    `Hora preferida (Costa Rica): ${values.get('time')}`,
    `Nivel: ${values.get('level')}`,
    `Objetivo: ${goal}`,
    '¿Me confirman disponibilidad y me envían una cotización?',
  ].join('\n');
  const url = whatsappUrl(message);

  window.open(url, '_blank', 'noopener');

  formStatus.replaceChildren(
    document.createTextNode('Tu solicitud está preparada. Si WhatsApp no se abrió, '),
  );

  const link = document.createElement('a');
  link.href = url;
  link.textContent = 'abre el mensaje aquí';
  link.target = '_blank';
  link.rel = 'noopener';
  formStatus.append(link);
});

dateInput.addEventListener('input', () => {
  dateInput.setCustomValidity('');
});
