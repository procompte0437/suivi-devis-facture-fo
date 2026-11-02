import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { initials, monthLabel, ROLES } from '../format';
import { Icon, Mark } from './ui';

const NAV = [
  { to: '/tableau', label: 'Tableau de bord', group: 'Pilotage', icon: 'board', end: true },
  { to: '/statistiques', label: 'Statistiques', group: 'Pilotage', icon: 'board' },
  { to: '/clients', label: 'Clients', group: 'Relation', icon: 'people' },
  { to: '/devis', label: 'Devis', group: 'Relation', icon: 'doc' },
  { to: '/factures', label: 'Factures', group: 'Relation', icon: 'bill' },
  { to: '/projets', label: 'Projets', group: 'Relation', icon: 'layers' },
  { to: '/personnel', label: 'Personnel', group: 'Maison', icon: 'people' },
  { to: '/entreprises', label: 'Entreprises', group: 'Maison', icon: 'layers' },
  { to: '/admin', label: 'Administration', group: 'Maison', icon: 'key', admin: true },
];

export default function Shell() {
  const { user, logout, company, companies, switchCompany } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('oree_nav') === 'closed');
  const [drawer, setDrawer] = useState(false);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 820px)').matches);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState(null);

  const links = NAV.filter((item) => !item.admin || user?.role === 'admin');
  const groups = useMemo(() => {
    const order = [];
    links.forEach((item) => {
      if (!order.includes(item.group)) order.push(item.group);
    });
    return order;
  }, [links]);

  useEffect(() => {
    localStorage.setItem('oree_nav', collapsed ? 'closed' : 'open');
  }, [collapsed]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)');
    const onChange = () => {
      setNarrow(media.matches);
      if (!media.matches) setDrawer(false);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!palette) return undefined;
    const term = query.trim();
    if (term.length < 2) {
      setHits(null);
      return undefined;
    }
    const timer = setTimeout(() => {
      api(`/search?q=${encodeURIComponent(term)}`).then(setHits).catch(() => setHits(null));
    }, 180);
    return () => clearTimeout(timer);
  }, [query, palette]);

  function go(path) {
    setPalette(false);
    setDrawer(false);
    setQuery('');
    navigate(path);
  }

  function toggleNav() {
    if (narrow) setDrawer((value) => !value);
    else setCollapsed((value) => !value);
  }

  const navOpen = narrow ? drawer : !collapsed;

  const localHits = links.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className={`app-shell${collapsed ? ' nav-closed' : ''}`}>
      {drawer ? <div className="scrim no-print" onClick={() => setDrawer(false)} /> : null}
      <aside className={`sidebar no-print${drawer ? ' open' : ''}`} inert={!narrow && collapsed ? true : undefined}>
        <div className="brand-lockup">
          <Mark />
          <div>
            <strong>Orée</strong>
            <span>Atelier commercial</span>
          </div>
        </div>
        {groups.map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-label">{group}</div>
            {links.filter((item) => item.group === group).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setDrawer(false)}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar-spacer" />
        <div className="me">
          <span className="avatar">{initials(user?.name)}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{ROLES[user?.role] || user?.role}</small>
          </div>
          <button className="icon-btn" type="button" title="Quitter" onClick={logout}>↪</button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar no-print">
          <div className="topbar-lead">
            <button
              className="menu-btn"
              type="button"
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={toggleNav}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <span className="eyebrow">Pilotage commercial — devis, factures et projets</span>
            {companies?.length ? (
              <select
                className="company-switch"
                value={company?.id || ''}
                aria-label="Entreprise active"
                onChange={(event) => switchCompany(event.target.value)}
              >
                {companies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : null}
          </div>
          <button className="search-btn" type="button" onClick={() => setPalette(true)}>
            Rechercher… <span className="muted">Ctrl K</span>
          </button>
          <div className="date-pill">{monthLabel()}</div>
        </header>
        <div className="canvas">
          <Outlet />
        </div>
      </div>
      {palette ? (
        <div className="palette-scrim no-print" onMouseDown={() => setPalette(false)}>
          <div className="palette" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <h2>Aller à</h2>
              <button className="icon-btn" type="button" onClick={() => setPalette(false)} aria-label="Fermer">×</button>
            </header>
            <input
              className="search-inline"
              autoFocus
              placeholder="Client, devis, facture, projet"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {localHits.map((item) => (
              <button className="hit" type="button" key={item.to} onClick={() => go(item.to)}>
                {item.label}<small>{item.group}</small>
              </button>
            ))}
            {hits?.clients?.map((item) => (
              <button className="hit" type="button" key={`c${item.id}`} onClick={() => go(`/clients/${item.id}`)}>
                {item.company}<small>{item.city}</small>
              </button>
            ))}
            {hits?.quotes?.map((item) => (
              <button className="hit" type="button" key={`q${item.id}`} onClick={() => go(`/devis/${item.id}`)}>
                {item.number}<small>{item.title}</small>
              </button>
            ))}
            {hits?.invoices?.map((item) => (
              <button className="hit" type="button" key={`i${item.id}`} onClick={() => go(`/factures/${item.id}`)}>
                {item.number}<small>{item.title}</small>
              </button>
            ))}
            {hits?.projects?.map((item) => (
              <button className="hit" type="button" key={`p${item.id}`} onClick={() => go(`/projets/${item.id}`)}>
                {item.name}<small>{item.code}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
