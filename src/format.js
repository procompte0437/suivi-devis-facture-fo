export const QUOTE_STATUS = {
  brouillon: { label: 'Brouillon', tone: 'mute' },
  envoye: { label: 'Envoyé', tone: 'info' },
  accepte: { label: 'Accepté', tone: 'ok' },
  refuse: { label: 'Refusé', tone: 'danger' },
  expire: { label: 'Expiré', tone: 'warn' },
};

export const INVOICE_STATUS = {
  brouillon: { label: 'Brouillon', tone: 'mute' },
  emise: { label: 'Émise', tone: 'info' },
  partielle: { label: 'Partielle', tone: 'warn' },
  payee: { label: 'Payée', tone: 'ok' },
  en_retard: { label: 'En retard', tone: 'danger' },
  annulee: { label: 'Annulée', tone: 'mute' },
};

export const PROJECT_STATUS = {
  cadrage: { label: 'Cadrage', tone: 'info' },
  en_cours: { label: 'En cours', tone: 'ok' },
  pause: { label: 'En pause', tone: 'warn' },
  livre: { label: 'Livré', tone: 'mute' },
  clos: { label: 'Clos', tone: 'mute' },
};

export const CLIENT_STATUS = {
  prospect: { label: 'Prospect', tone: 'warn' },
  actif: { label: 'Actif', tone: 'ok' },
  veille: { label: 'En veille', tone: 'mute' },
};

export const ROLES = {
  admin: 'Administrateur',
  dirigeant: 'Dirigeant',
  commercial: 'Responsable commercial',
  comptable: 'Comptable',
  chef_projet: 'Chef de projet',
  client: 'Client',
};

export const METHODS = [
  ['virement', 'Virement'],
  ['mobile', 'Mobile money'],
  ['especes', 'Espèces'],
  ['cheque', 'Chèque'],
  ['carte', 'Carte'],
];

export const UNITS = ['u', 'j', 'h', 'forfait', 'm²'];

function grouped(value, digits = 0) {
  const amount = Number(value || 0);
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(digits);
  const [whole, fraction] = fixed.split('.');
  const body = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return `${negative ? '-' : ''}${body}${fraction ? `,${fraction}` : ''}`;
}

export function money(value, currency = 'XAF') {
  const amount = Number(value || 0);
  if (currency === 'XAF') {
    return `${grouped(Math.round(amount))} F CFA`;
  }
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
  if (currency === 'USD') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency}`;
}

export function formatDate(value, withYear = true) {
  if (!value) return '—';
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '—';
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: withYear ? 'numeric' : undefined,
  });
}

export function dateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function todayISO(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function monthLabel(date = new Date()) {
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function computeTotals(lines, discount = 0, taxRate = 0) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0),
    0,
  );
  const safeDiscount = Math.min(Math.max(Number(discount || 0), 0), subtotal);
  const base = subtotal - safeDiscount;
  const tax = base * Number(taxRate || 0) / 100;
  return {
    subtotal,
    discount: safeDiscount,
    tax,
    total: base + tax,
  };
}

export function tintFor(text = '') {
  const palette = ['#1E6B45', '#1F5C62', '#8A6232', '#3E5348', '#6D4C41'];
  let hash = 0;
  for (const char of text) hash = (hash + char.charCodeAt(0)) % palette.length;
  return palette[hash];
}
