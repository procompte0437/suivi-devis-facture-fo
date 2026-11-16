import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../../site.css';
import { MODULES } from './data';

const YEAR = new Date().getFullYear();

/* ------------------------------------------------------------------
   Icônes du site (traits simples, couleur héritée)
   ------------------------------------------------------------------ */
const PATHS = {
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16.5 16.5 21 21',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M6 9l6 6 6-6',
  folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2h9A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z',
  check: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.6 2.6L16 9.6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  send: 'M4 12 20 4l-6 16-3-7z',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M9.5 13h6M9.5 17h6',
  bill: 'M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21zM9 8h6M9 12h6M9 16h3',
  layers: 'M12 4 3 8.5l9 4.5 9-4.5zM3 13l9 4.5 9-4.5',
  people: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c.5-3 3-5 6-5s5.5 2 6 5M16 11a2.8 2.8 0 1 0 0-5.6M17.5 15c2 .5 3.2 2.3 3.5 5',
  coins: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 10v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  play: 'M8 5v14l11-7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c.8-4 4-6 8-6s7.2 2 8 6',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7',
  building: 'M4 21V5l8-3v19M12 9h8v12M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1M2 21h20',
};

export function SiteIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Navigation et index de recherche
   ------------------------------------------------------------------ */

const NAV = [
  ['Produit', '/fonctionnalites'],
  ['Démo', '/demo'],
  ['Tarifs', '/tarifs'],
  ['Contact', '/contact'],
];

// Liens secondaires : seulement dans le menu mobile et le pied de page.
const MORE = [
  ['Secteurs', '/secteurs'],
  ['Conseils', '/conseils'],
  ['Questions fréquentes', '/conseils#faq'],
  ['À propos', '/a-propos'],
];

const SEARCH_INDEX = [
  ['Accueil', 'Présentation de DOUKOU', '/', 'accueil doukou portail'],
  ['Fonctionnalités', 'Tous les modules du portail', '/fonctionnalites', 'fonctions modules roles droits'],
  ...MODULES.map(([title, href, , text]) => [title, text, href, `${title} ${text}`]),
  ['Modèles de documents', 'Cinq modèles de devis et cinq de facture', '/fonctionnalites#devis', 'modele nomade ligne canopee soleil chantier cedre artisans csmart atelier iris pdf impression'],
  ['Rôles et droits d’accès', 'Administrateur, commercial, comptable, chef de projet, client', '/fonctionnalites#roles', 'role droit acces administrateur commercial comptable chef projet securite'],
  ['Secteurs', 'Artisans, agences, BTP, indépendants', '/secteurs', 'secteur metier artisan agence btp chantier independant'],
  ['Démonstration', 'Comptes de test, un par rôle', '/demo', 'demo demonstration essai test compte mot de passe'],
  ['Tarifs', 'Formules et conditions', '/tarifs', 'tarif prix formule abonnement gratuit'],
  ['Conseils d’utilisation', 'Bonnes pratiques', '/conseils', 'conseil astuce pratique'],
  ['Questions fréquentes', 'FAQ', '/conseils#faq', 'faq question reponse aide'],
  ['Pourquoi DOUKOU', 'Le problème résolu', '/vision', 'vision pourquoi word excel'],
  ['À propos', 'Le projet', '/a-propos', 'a propos equipe projet stage nzebi'],
  ['Contact', 'Nous écrire', '/contact', 'contact message support aide partenariat'],
  ['Connexion', 'Accéder au portail', '/login', 'connexion login se connecter mot de passe'],
  ['Créer un compte', 'Inscription', '/inscription', 'inscription creer compte'],
];

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/* ------------------------------------------------------------------
   Gabarit commun
   ------------------------------------------------------------------ */
export function SiteLayout() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // L'en-tête se resserre dès que l'on fait défiler la page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pas de défilement de la page derrière le menu mobile.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu]);

  // Fermer le menu et gérer les ancres à chaque changement de page.
  useEffect(() => {
    setMenu(false);
    if (location.state?.keepScroll) return undefined;
    if (location.hash) {
      const timer = setTimeout(() => {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`st${menu ? ' menu-open' : ''}`}>
      <header className={`st-head${scrolled ? ' scrolled' : ''}`}>
        <div className="st-wrap">
          <Link to="/" className="st-logo" aria-label="DOUKOU, accueil">
            <img src="/logo/logo-doukou-clair.png" alt="DOUKOU" />
          </Link>
          <nav className="st-menu" aria-label="Menu principal">
            {NAV.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <div className="st-head-end">
            <button className="st-search-btn" type="button" aria-label="Rechercher sur le site" onClick={() => { setMenu(false); setSearch(true); }}>
              <SiteIcon name="search" />
            </button>
            <Link className="st-signin" to="/login">Connexion</Link>
            <Link className="st-btn ghost st-head-quiet" to="/contact">Nous écrire</Link>
            <Link className="st-btn st-head-cta" to="/inscription">Essayer gratuitement</Link>
          </div>
          <button className="st-burger" type="button" aria-expanded={menu} aria-controls="st-sheet" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenu((value) => !value)}>
            <span /><span />
          </button>
        </div>
      </header>

      <div className="st-sheet-menu" id="st-sheet" aria-hidden={!menu} inert={!menu ? true : undefined}>
        <nav aria-label="Menu mobile">
          {NAV.map(([label, to], index) => (
            <NavLink key={to} to={to} style={{ '--i': index }}>
              <small>{String(index + 1).padStart(2, '0')}</small>{label}
            </NavLink>
          ))}
        </nav>
        <div className="st-sheet-more">
          {MORE.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
        </div>
        <div className="st-sheet-actions">
          <Link className="st-btn block" to="/inscription">Essayer gratuitement</Link>
          <Link className="st-btn ghost block" to="/login">Connexion</Link>
        </div>
      </div>

      {search ? <SiteSearch onClose={() => setSearch(false)} /> : null}
      <Outlet />
      <SiteFooter />
    </div>
  );
}

function SiteSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return SEARCH_INDEX.slice(0, 8);
    return SEARCH_INDEX.filter(([title, text, , keys]) => {
      const haystack = normalize(`${title} ${text} ${keys}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [query]);

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <div className="st-search" role="dialog" aria-label="Rechercher" onMouseDown={onClose}>
      <div className="st-search-box" onMouseDown={(event) => event.stopPropagation()}>
        <form onSubmit={(event) => { event.preventDefault(); if (results[0]) go(results[0][2]); }}>
          <SiteIcon name="search" />
          <input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Devis, paiement, démonstration…" aria-label="Rechercher" />
          <button type="button" onClick={onClose}>Échap</button>
        </form>
        {results.length ? (
          <ul>
            {results.map(([title, text, path]) => (
              <li key={`${title}${path}`}>
                <Link to={path} onClick={onClose}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p>Aucun résultat. Essayez « devis », « paiement » ou « démo ».</p>}
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="st-foot">
      <div className="st-wrap st-foot-main">
        <div className="st-foot-brand">
          <Link to="/" aria-label="DOUKOU, accueil"><img src="/logo/logo-doukou.png" alt="DOUKOU" /></Link>
          <p>Suivre chaque dossier client, du devis au dernier paiement.</p>
        </div>
        <nav aria-label="Produit">
          <h2>Produit</h2>
          {NAV.slice(0, 3).map(([label, to]) => <Link key={to} to={to}>{label === 'Produit' ? 'Fonctionnalités' : label}</Link>)}
          <Link to="/secteurs">Secteurs</Link>
        </nav>
        <nav aria-label="Ressources">
          <h2>Ressources</h2>
          {MORE.slice(1).map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
        <nav aria-label="Compte">
          <h2>Compte</h2>
          <Link to="/login">Connexion</Link>
          <Link to="/inscription">Créer un compte</Link>
          <Link to="/contact">Nous écrire</Link>
        </nav>
      </div>
      <div className="st-foot-bottom">
        <div className="st-wrap">
          <span>© {YEAR} DOUKOU · Libreville</span>
          <span>Devis, factures et suivi de projets</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------
   Blocs de page : bandeau titre, gabarit deux colonnes, colonne latérale
   ------------------------------------------------------------------ */
export function PageBanner({ title, lead, crumb }) {
  return (
    <section className="st-banner">
      <div className="st-wrap">
        <nav className="st-crumbs" aria-label="Fil d’Ariane">
          <Link to="/">Accueil</Link>
          <span aria-hidden="true">›</span>
          <span>{crumb || title}</span>
        </nav>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
    </section>
  );
}

export function PageBody({ children, aside }) {
  return (
    <div className="st-wrap st-layout">
      <div className="st-prose">{children}</div>
      {aside === undefined ? <SiteAside /> : aside}
    </div>
  );
}

export function SiteAside({ children }) {
  return (
    <aside className="st-aside">
      {children}
      <section className="st-aside-card">
        <h3>Voir DOUKOU en action</h3>
        <p>Un compte par rôle, déjà rempli avec des clients, des devis et des projets.</p>
        <Link className="st-btn light block" to="/demo">Essayer la démo</Link>
      </section>
      <section className="st-aside-help">
        <h3>Une question ?</h3>
        <p>Nous répondons par e-mail.</p>
        <Link to="/contact">Nous écrire <SiteIcon name="arrow" /></Link>
      </section>
    </aside>
  );
}

export function PageCta({ title = 'On vous ouvre la porte', text = 'Créez un compte, ou regardez d’abord la démonstration, sans rien installer.' }) {
  return (
    <section className="st-cta">
      <div className="st-wrap">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div>
          <Link className="st-btn ghost" to="/demo">Voir la démo</Link>
          <Link className="st-btn" to="/inscription">Créer un compte</Link>
        </div>
      </div>
    </section>
  );
}
