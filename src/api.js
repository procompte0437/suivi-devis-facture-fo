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
      const publicPage = ['/', '/vision', '/a-propos', '/fonctionnalites', '/secteurs', '/demo', '/tarifs', '/conseils'].includes(window.location.pathname);
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

export function errorText(error) {
  const first = error?.errors ? Object.values(error.errors)[0] : null;
  if (Array.isArray(first) && first[0]) return first[0];
  return error?.message || 'Une erreur est survenue.';
}
