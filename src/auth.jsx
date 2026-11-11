import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [abilities, setAbilities] = useState([]);
  const [ready, setReady] = useState(false);

  function apply(data) {
    setUser(data.user);
    setAbilities(data.abilities || []);
    setSettings(data.settings);
    setCompanies(data.companies || []);
    const saved = localStorage.getItem('oree_company');
    const current = (data.companies || []).find((item) => String(item.id) === saved) || data.company || null;
    setCompany(current);
    if (current?.id) localStorage.setItem('oree_company', String(current.id));
  }

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api('/me')
      .then(apply)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(() => ({
    user,
    settings,
    setSettings,
    companies,
    company,
    ready,
    isClient: user?.role === 'client',
    isManager: ['admin', 'dirigeant'].includes(user?.role),
    can: (ability) => abilities.includes(ability),
    async login(email, password) {
      const data = await api('/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      apply(data);
      return data.user;
    },
    async register(form) {
      const data = await api('/register', { method: 'POST', body: form });
      setToken(data.token);
      apply(data);
      return data.user;
    },
    async refresh() {
      apply(await api('/me'));
    },
    async switchCompany(id) {
      localStorage.setItem('oree_company', String(id));
      apply(await api('/me'));
      window.location.assign('/tableau');
    },
    async logout() {
      try {
        await api('/logout', { method: 'POST' });
      } catch {
        /* session already closed */
      }
      setToken(null);
      setUser(null);
      setCompany(null);
      setCompanies([]);
      setAbilities([]);
    },
  }), [user, settings, companies, company, ready, abilities]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
