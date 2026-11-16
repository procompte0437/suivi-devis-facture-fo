const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export function getToken() {
  return localStorage.getItem('oree_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('oree_token', token);
  else localStorage.removeItem('oree_token');
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const company = localStorage.getItem('oree_company');
  if (company) headers['X-Company-Id'] = company;

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: 'Réponse illisible du serveur.' };
    }
  }

  if (response.status === 401 && path !== '/login') {
    setToken(null);
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/inscription')) {
      const publicPage = ['/', '/vision', '/a-propos', '/fonctionnalites', '/secteurs', '/demo', '/tarifs', '/conseils', '/contact'].includes(window.location.pathname);
      if (!publicPage) window.location.assign('/login');
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || 'La requête a échoué.');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export async function apiForm(path, formData) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const company = localStorage.getItem('oree_company');
  if (company) headers['X-Company-Id'] = company;

  const response = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: 'Réponse illisible du serveur.' };
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || 'La requête a échoué.');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

/** Télécharge un fichier binaire produit par l’API (PDF). */
export async function telechargerFichier(path, nomParDefaut = 'document.pdf') {
  const headers = { Accept: 'application/pdf' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const company = localStorage.getItem('oree_company');
  if (company) headers['X-Company-Id'] = company;

  const response = await fetch(`${BASE}${path}`, { headers });
  if (!response.ok) {
    const error = new Error('Le PDF n’a pas pu être préparé.');
    error.status = response.status;
    throw error;
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const trouve = disposition.match(/filename="([^"]+)"/);
  const nom = trouve?.[1] || nomParDefaut;
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(lien.href);
}

export function errorText(error) {
  const details = error?.errors ? Object.values(error.errors).flat().filter(Boolean) : [];
  const brut = details.length ? details.join(' ') : (error?.message || 'Une erreur est survenue.');
  if (/morph map|SQLSTATE|stack trace|exception/i.test(brut)) {
    return 'L’enregistrement n’a pas abouti à cause d’un problème interne. Réessayez. Si le nom existe déjà, ouvrez la ligne avec le crayon.';
  }
  return brut;
}
