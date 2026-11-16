import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [abilities, setAbilities] = useState([]);
  const [ready, setReady] = useState(() => !getToken());

  function apply(data) {
    setUser(data.user);
    setAbilities(data.abilities || []);
    setSettings(data.settings);
    setCompanies(data.companies || []);
    setUnassigned(data.unassigned || []);
    const platform = data.user?.role === 'admin';
    const saved = localStorage.getItem('oree_company');
    const mode = localStorage.getItem('oree_company_mode');
    if (platform && mode !== 'one') {
      localStorage.setItem('oree_company', 'all');
      localStorage.setItem('oree_company_mode', 'all');
      setCompany(null);
      return;
    }
    const current = (data.companies || []).find((item) => String(item.id) === saved) || (platform ? null : data.company) || null;
    setCompany(current);
    if (current?.id) localStorage.setItem('oree_company', String(current.id));
    else if (platform) localStorage.setItem('oree_company', 'all');
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
    unassigned,
    ready,
    isClient: user?.role === 'client',
    isPlatformAdmin: user?.role === 'admin',
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
      const data = await api('/me');
      apply(data);
      return data;
    },
    async switchCompany(id) {
      const all = String(id) === 'all';
      localStorage.setItem('oree_company', all ? 'all' : String(id));
      localStorage.setItem('oree_company_mode', all ? 'all' : 'one');
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
      setUnassigned([]);
      setAbilities([]);
    },
  }), [user, settings, companies, company, unassigned, ready, abilities]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
