// Small UI behaviours: listing filter, hero search, enquiry prefill, demo form handling, mobile menu.
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;

const filters = $<HTMLFormElement>('#filters');
const heroForm = $<HTMLFormElement>('#hero-search');
const rows = Array.from(document.querySelectorAll<HTMLElement>('#rows .row'));
const count = $('#count');
const empty = $('#empty');

function applyFilters() {
  const f = new FormData(filters);
  const mode = String(f.get('mode') ?? 'alle');
  const city = String(f.get('city') ?? '').trim().toLowerCase();
  const rooms = Number(f.get('rooms') ?? 0);
  let n = 0;
  for (const r of rows) {
    const ok =
      (mode === 'alle' || r.dataset.mode === mode) &&
      (!city || (r.dataset.city ?? '').includes(city)) &&
      Number(r.dataset.rooms) >= rooms;
    r.hidden = !ok;
    if (ok) n++;
  }
  count.textContent = `${n} ${n === 1 ? 'Objekt' : 'Objekte'}`;
  empty.hidden = n > 0;
}
filters.addEventListener('input', applyFilters);
filters.addEventListener('submit', (e) => e.preventDefault());
applyFilters();

function setFilter(values: { mode?: string; city?: string; rooms?: string }) {
  if (values.mode) {
    const radio = filters.querySelector<HTMLInputElement>(`input[name="mode"][value="${values.mode}"]`);
    if (radio) radio.checked = true;
  }
  if (values.city !== undefined) (filters.elements.namedItem('city') as HTMLInputElement).value = values.city;
  if (values.rooms !== undefined) (filters.elements.namedItem('rooms') as HTMLSelectElement).value = values.rooms;
  applyFilters();
}

heroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(heroForm);
  setFilter({ mode: String(f.get('mode')), city: String(f.get('city') ?? ''), rooms: String(f.get('rooms') ?? '0') });
  $('#objekte').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});

$('#reset').addEventListener('click', () => {
  filters.reset();
  setFilter({ mode: 'alle', city: '', rooms: '0' });
});

// links that carry a filter (nav, chapter calls to action)
document.querySelectorAll<HTMLElement>('[data-filter]').forEach((a) =>
  a.addEventListener('click', () => {
    const mode = a.dataset.filter;
    if (mode) setFilter({ mode, city: '', rooms: '0' });
  }),
);

// enquiry links prefill the contact form
const contact = $<HTMLFormElement>('#contact-form');
document.querySelectorAll<HTMLElement>('[data-enquiry]').forEach((a) =>
  a.addEventListener('click', () => {
    const text = contact.elements.namedItem('text') as HTMLTextAreaElement;
    const what = a.dataset.enquiry!;
    text.value = a.dataset.topic ? '' : `Ich interessiere mich für: ${what}.`;
    const topic = a.dataset.topic ?? (rows.find((r) => r.contains(a))?.dataset.mode === 'kaufen' ? 'kaufen' : 'mieten');
    const radio = contact.querySelector<HTMLInputElement>(`input[name="topic"][value="${topic}"]`);
    if (radio) radio.checked = true;
  }),
);

// show validation only after a field was left or a submit was tried
document.querySelectorAll<HTMLElement>('.input').forEach((i) => i.addEventListener('blur', () => i.classList.add('touched')));

// demo forms: validate, no backend yet
function demoForm(form: HTMLFormElement, ok: string) {
  const status = form.querySelector<HTMLElement>('.form-status')!;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.querySelectorAll('.input').forEach((i) => i.classList.add('touched'));
      const bad = form.querySelector<HTMLElement>(':invalid');
      status.hidden = false;
      status.textContent = 'Bitte füllen Sie die markierten Felder aus.';
      form.querySelectorAll<HTMLInputElement>('input,textarea').forEach((i) => i.setAttribute('placeholder', i.getAttribute('placeholder') ?? ' '));
      bad?.focus();
      return;
    }
    status.hidden = false;
    status.textContent = ok;
    form.reset();
    form.querySelectorAll('.input').forEach((i) => i.classList.remove('touched'));
  });
}
demoForm($('#damage-form'), 'Danke, das ist die Demo: Ihre Meldung wurde noch nicht versendet. Das Formular wird später an das Backend des Kunden angebunden.');
demoForm(contact, 'Danke, das ist die Demo: Ihre Anfrage wurde noch nicht versendet. Das Formular wird später angebunden.');

// mobile menu
const menu = $('.menu');
const toggle = $<HTMLButtonElement>('.menu-toggle');
toggle.addEventListener('click', () => {
  const open = menu.dataset.open !== 'true';
  menu.dataset.open = String(open);
  toggle.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  }),
);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    menu.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  }
});
