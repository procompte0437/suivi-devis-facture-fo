import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../api';
import '../site.css';

export { Home } from './Landing';

const MENUS = [
  {
    label: 'Fonctionnalités',
    to: '/fonctionnalites',
    items: [
      ['Devis & factures', 'Cinq modèles, une pièce à l’image de la maison.', '/fonctionnalites#facturation'],
      ['Projets & Gantt', 'Dates, tâches par personne, planning vivant.', '/fonctionnalites#projets'],
      ['Budget', 'Prévu, dépensé, reste à tenir.', '/fonctionnalites#budget'],
      ['Équipe', 'Le personnel qui porte les tâches.', '/fonctionnalites#relances'],
      ['Pilotage', 'Devis ouverts, encaissé, projets vivants.', '/fonctionnalites#pilotage'],
    ],
  },
  {
    label: 'Secteurs',
    to: '/secteurs',
    items: [
      ['Ateliers & artisans', 'De la proposition au chantier.', '/secteurs#ateliers'],
      ['Agences', 'Plusieurs clients, une maison claire.', '/secteurs#agences'],
      ['BTP & chantiers', 'Lots, jalons, budget de mission.', '/secteurs#btp'],
      ['Indépendants', 'Un compte personne, puis des entreprises.', '/secteurs#independants'],
    ],
  },
];

const RAILS = [
  {
    id: 'facturation',
    label: 'Facturation',
    tone: 'green',
    kicker: 'Pièces',
    title: 'Du devis à la facture',
    text: 'Créez le devis, choisissez le modèle, puis transformez-le en facture sans ressaisir les lignes. Numérotation, TVA et identité de l’entreprise suivent la pièce.',
    models: ['Nomade', 'Ligne', 'Canopée', 'Soleil', 'Chantier', 'Cèdre', 'Artisans', 'Csmart', 'Atelier', 'Iris'],
    mock: 'quote',
  },
  {
    id: 'projets',
    label: 'Projets',
    tone: 'blue',
    kicker: 'Planning',
    title: 'Dates, personnes, avancement',
    text: 'Renseignez le début, la fin visée et les tâches par personne. Le planning se trace dans la fiche, avec l’avancement et la ligne du jour. Jalons, pièces liées et équipe restent dans le même geste.',
    mock: 'gantt',
  },
  {
    id: 'budget',
    label: 'Budget',
    tone: 'purple',
    kicker: 'Postes',
    title: 'Prévu et engagé',
    text: 'Chaque mission a ses postes. Vous voyez ce qui était prévu, ce qui est déjà engagé, et ce qu’il reste avant la livraison. Le budget du projet parle le même langage que les factures.',
    mock: 'budget',
  },
  {
    id: 'relances',
    label: 'Échéances',
    tone: 'rose',
    kicker: 'Encaissement',
    title: 'Le solde après l’envoi',
    text: 'Date d’échéance, statut, reste à encaisser : la facture ne disparaît pas après l’envoi. L’équipe sait qui relancer, et le client retrouve une pièce lisible.',
    mock: 'relance',
  },
  {
    id: 'pilotage',
    label: 'Pilotage',
    tone: 'sand',
    kicker: 'Statistiques',
    title: 'La lecture du mois',
    text: 'Facturé du mois, encaissé, devis encore ouverts, projets vivants. La lecture tient sur une page, entreprise par entreprise, sans tableur à côté.',
    mock: 'dash',
  },
];

const VOICES = [
  ['Le devis part avec le bon modèle, et le projet garde les dates. On ne cherche plus la dernière version.', 'Direction d’atelier', 'Libreville'],
  ['Les tâches ont un nom et une personne. Le planning se voit, au lieu de rester dans un cahier.', 'Conduite de chantier', 'Port-Gentil'],
  ['La facture reprend le devis. La comptabilité n’a plus à recoller les lignes à la main.', 'Comptabilité', 'Maison de projets'],
  ['Un compte, puis les entreprises dont on s’occupe. Chacune a ses clients, ses pièces, son équipe.', 'Indépendant', 'Plusieurs maisons'],
];

const FAQ = [
  ['Qu’est-ce que DOUKOU ?', 'DOUKOU, « suivre » en nzebi, est l’espace où une personne ou une entreprise tient ses devis, ses factures et le suivi de ses projets. Chaque maison a ses clients, son personnel, son budget et ses statistiques.'],
  ['Faut-il un compte pour regarder le site ?', 'Non. L’accueil, la vision, les secteurs et les conseils sont ouverts. Le chat répond aussi avant l’inscription. Le compte sert à créer ses entreprises et à tenir les pièces.'],
  ['Comment choisir le modèle de devis ou de facture ?', 'Au moment de générer la pièce, cinq modèles sont proposés. Le papier reprend l’identité de l’entreprise active : nom, adresse, client, lignes et totaux.'],
  ['Le planning se construit comment ?', 'Sur la fiche projet : date de début, fin estimée, tâches assignées à une personne, avancement. Le diagramme de Gantt se dessine à partir de ces dates.'],
  ['Une personne peut-elle gérer plusieurs entreprises ?', 'Oui. Le compte peut être personnel ou d’entreprise. Dans l’espace client, on crée d’autres entreprises et on passe de l’une à l’autre.'],
];

export function SiteLayout() {
  const [menu, setMenu] = useState(false);
  const home = useLocation().pathname === '/';

  return (
    <div className={`mkt ${menu ? 'nav-open' : ''} ${home ? 'is-home' : ''}`}>
      <p className="tx-announce">
        Vous tenez déjà une activité ? <Link to="/inscription">Créez votre compte</Link>
      </p>
      <div className="mkt-header">
      <header className="mkt-nav">
        <Link to="/" className="mkt-logo" onClick={() => setMenu(false)}>
          <img src={home ? '/logo/logo-doukou.png' : '/logo/logo-doukou-clair.png'} alt="DOUKOU" />
        </Link>
        <button type="button" className="mkt-burger" aria-expanded={menu} onClick={() => setMenu((value) => !value)}>
          {menu ? 'Fermer' : 'Menu'}
        </button>
        <nav className="mkt-links" aria-label="Site">
          {MENUS.map((menuItem) => (
            <div className="mkt-drop" key={menuItem.label}>
              <NavLink to={menuItem.to}>{menuItem.label}</NavLink>
              <div className="mkt-panel">
                {menuItem.items.map(([title, text, href]) => (
                  <Link key={title} to={href} onClick={() => setMenu(false)}>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <NavLink to="/demo" onClick={() => setMenu(false)}>Démo</NavLink>
          <NavLink to="/tarifs" onClick={() => setMenu(false)}>Tarifs</NavLink>
          <NavLink to="/conseils" onClick={() => setMenu(false)}>Conseils & bonnes pratiques</NavLink>
        </nav>
        <div className="mkt-nav-end">
          <Link className="mkt-login" to="/login">Connexion</Link>
          <Link className="mkt-cta" to="/inscription">Créer un compte</Link>
        </div>
      </header>
      </div>
      <Outlet />
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const cities = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné', 'Mouila', 'Tchibanga', 'Makokou', 'Bitam', 'Koulamoutou', 'Gamba'];
  const trades = ['Ateliers', 'Agences', 'Chantiers', 'Indépendants', 'Menuiserie', 'Peinture', 'Plomberie', 'Électricité', 'Architecture', 'Comptabilité'];
  return (
    <footer className="tx-foot">
      <div className="tx-foot-main">
        <Link to="/" className="mkt-logo"><img src="/logo/logo-doukou-clair.png" alt="DOUKOU" /></Link>
        <div className="tx-foot-cols">
          <div>
            <h2>Le dossier</h2>
            <Link to="/fonctionnalites">Fonctionnalités</Link>
            <Link to="/secteurs">Secteurs</Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/conseils">Conseils</Link>
          </div>
          <div>
            <h2>L’espace</h2>
            <Link to="/inscription">Créer un compte</Link>
            <Link to="/login">Connexion</Link>
            <Link to="/demo">Démonstration</Link>
            <Link to="/login">Espace client</Link>
          </div>
          <div>
            <h2>La société</h2>
            <Link to="/vision">Vision</Link>
            <Link to="/a-propos">À propos</Link>
            <Link to="/conseils">Bonnes pratiques</Link>
            <Link to="/demo">Comptes de démo</Link>
          </div>
          <div>
            <h2>Les pièces</h2>
            <Link to="/fonctionnalites#facturation">Devis et factures</Link>
            <Link to="/fonctionnalites#projets">Projets et Gantt</Link>
            <Link to="/fonctionnalites#budget">Budget</Link>
            <Link to="/fonctionnalites#pilotage">Pilotage</Link>
          </div>
        </div>
      </div>
      <p className="tx-foot-legal">DOUKOU · Devis, factures et projets · Libreville</p>
      <div className="tx-foot-geo">
        <h2>Tenir un dossier, depuis ces villes</h2>
        <ul>
          {cities.map((city) => <li key={city}><Link to="/inscription">{city}</Link></li>)}
        </ul>
        <h2>Les métiers du dossier</h2>
        <ul>
          {trades.map((trade) => <li key={trade}><Link to="/secteurs">{trade}</Link></li>)}
        </ul>
      </div>
    </footer>
  );
}

function Rails() {
  const [open, setOpen] = useState('facturation');
  const rail = RAILS.find((item) => item.id === open) ?? RAILS[0];
  return (
    <div className="mkt-studio">
      <div className="mkt-studio-nav" role="tablist" aria-label="Ce que la maison gère">
        {RAILS.map((item) => (
          <button
            key={item.id}
            id={item.id}
            type="button"
            role="tab"
            aria-selected={open === item.id}
            className={open === item.id ? 'on' : ''}
            onClick={() => setOpen(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <article className="rail-body" role="tabpanel">
        <div>
          <p className="kicker">{rail.kicker}</p>
          <h3>{rail.title}</h3>
          <p>{rail.text}</p>
          {rail.models ? (
            <ul className="mkt-models">
              {rail.models.map((name) => <li key={name}>{name}</li>)}
            </ul>
          ) : null}
          <Link className="mkt-textlink" to="/inscription">Essayer cette fonction</Link>
        </div>
        <Mock kind={rail.mock} />
      </article>
    </div>
  );
}

function Mock({ kind }) {
  if (kind === 'quote') return <QuoteMock />;
  if (kind === 'gantt') return <GanttMock />;
  if (kind === 'budget') return <BudgetMock />;
  if (kind === 'relance') return <RelanceMock />;
  return <DashMock compact />;
}

function QuoteMock() {
  return (
    <div className="mock quote">
      <header><b>DEV-2026-0001</b><span>Nomade</span></header>
      <p className="who">Maison Olamba</p>
      <table>
        <tbody>
          <tr><td>Étude et plans</td><td>1 200 000</td></tr>
          <tr><td>Suivi de chantier</td><td>800 000</td></tr>
        </tbody>
      </table>
      <footer><span>À signer</span><b>2 000 000 FCFA</b></footer>
    </div>
  );
}

function GanttMock() {
  return (
    <div className="mock gantt-mini">
      <header><b>Projet Olamba</b><span>12 mars — 4 juin</span></header>
      {[['Direction', '68%'], ['Chantier', '46%'], ['Livraison', '28%']].map(([name, width]) => (
        <div key={name}><em>{name}</em><span style={{ width }} /></div>
      ))}
    </div>
  );
}

function BudgetMock() {
  return (
    <div className="mock budget">
      <header><b>Postes</b><span>FCFA</span></header>
      <p className="cols"><span>Poste</span><span>Prévu</span><span>Engagé</span></p>
      {[['Création', '2 000 000', '400 000'], ['Suivi', '900 000', '120 000'], ['Livraison', '450 000', '0']].map(([name, planned, spent]) => (
        <p key={name}><span>{name}</span><span>{planned}</span><span>{spent}</span></p>
      ))}
    </div>
  );
}

function RelanceMock() {
  return (
    <div className="mock relance">
      <header><b>Échéances</b><span>Ouvertes</span></header>
      {[['FAC-2026-0001', '18 nov.', 'À relancer'], ['FAC-2026-0004', '2 déc.', 'Envoyée']].map(([ref, date, state]) => (
        <p key={ref}><span>{ref}</span><span>{date}</span><b>{state}</b></p>
      ))}
    </div>
  );
}

function DashMock({ compact = false }) {
  return (
    <div className={`mock dash ${compact ? 'compact' : ''}`}>
      <header><b>Novembre 2026</b><span>DOUKOU</span></header>
      <ul>
        <li><span>Facturé</span><b>4 800 000</b></li>
        <li><span>Encaissé</span><b>3 100 000</b></li>
        <li><span>Devis ouverts</span><b>3</b></li>
        <li><span>Projets en cours</span><b>2</b></li>
      </ul>
    </div>
  );
}

function Compare() {
  const rows = [
    ['Devis', 'Versions dispersées', 'Un modèle, une pièce numérotée'],
    ['Planning', 'Dates dans un autre cahier', 'Tâches, personnes, Gantt'],
    ['Règlement', 'Échéance perdue après l’envoi', 'Relance et solde dans le dossier'],
  ];
  return (
    <section className="pro-compare">
      <div className="pro-wrap">
        <header className="pro-head">
          <h2>Le même travail, un dossier en plus.</h2>
        </header>
        <table>
          <thead>
            <tr><th>Sujet</th><th>Sans dossier unique</th><th>Avec DOUKOU</th></tr>
          </thead>
          <tbody>
            {rows.map(([topic, before, after]) => (
              <tr key={topic}><th>{topic}</th><td>{before}</td><td>{after}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="pro-faq">
      <div className="pro-wrap">
        <header className="pro-head">
          <h2>Avant d’ouvrir un compte.</h2>
        </header>
        {FAQ.map(([question, answer], index) => (
          <article key={question}>
            <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}</button>
            {open === index ? <p>{answer}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function PageHero({ kicker, title, lead }) {
  return (
    <header className="pg-hero">
      <p>{kicker}</p>
      <h1>{title}</h1>
      {lead ? <p className="pg-lead">{lead}</p> : null}
    </header>
  );
}

function PageCta({ title, to, label }) {
  return (
    <section className="tx-ready">
      <h2>{title}</h2>
      <Link to={to}>{label}</Link>
    </section>
  );
}

export function Features() {
  return (
    <main className="pg">
      <PageHero
        kicker="Fonctionnalités"
        title="Les pièces, le planning et le solde."
        lead="Tout tient dans l’entreprise choisie : le devis, la facture, les tâches, le budget et la lecture du mois."
      />
      <Rails />
      <PageCta title="Prêt à ouvrir le dossier ?" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Sectors() {
  const sectors = [
    ['ateliers', '/home/metier-platre.jpg', 'Ateliers & artisans', 'Une proposition, des acomptes, un chantier qui a des dates. Le devis choisi devient la facture, et les tâches restent assignées.'],
    ['agences', '/home/metier-peinture.jpg', 'Agences', 'Plusieurs clients, une identité par entreprise. Les statistiques lisent le mois sans mélanger les maisons.'],
    ['btp', '/home/metier-plomberie.jpg', 'BTP & chantiers', 'Lots, jalons et budget. Le planning montre qui fait quoi entre le début et la fin visée.'],
    ['independants', '/home/pro-chantier.jpg', 'Indépendants', 'Le compte personne ouvre l’espace. Chaque entreprise créée ensuite a ses clients, ses pièces et son équipe.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Secteurs"
        title="Pour les maisons qui vendent un travail précis."
        lead="Atelier, agence, chantier ou activité indépendante : le dossier suit le même fil."
      />
      <section className="pg-band">
        <div className="pg-photos">
          {sectors.map(([id, src, title, text]) => (
            <article id={id} key={id}>
              <img src={src} alt="" />
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
                <Link to="/inscription">Ouvrir un dossier</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <PageCta title="Le métier est déjà le vôtre ?" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Demo() {
  const accounts = [
    ['Aurore Blanc', 'Administration', 'Entreprises, réglages et lecture d’ensemble.', 'aurore.blanc@oree.fr'],
    ['Marc Essono', 'Commercial', 'Clients, devis et projets.', 'marc.essono@oree.fr'],
    ['Léa Nguema', 'Comptabilité', 'Factures, échéances et encaissements.', 'lea.nguema@oree.fr'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Démonstration"
        title="Parcourez l’atelier déjà meublé."
        lead="Trois comptes partagent la même maison de démonstration. Le mot de passe est indiqué sur la page de connexion."
      />
      <section className="pg-band">
        <div className="pg-grid">
          {accounts.map(([name, role, text, mail]) => (
            <article key={mail}>
              <small>{role}</small>
              <h2>{name}</h2>
              <p>{text}</p>
              <span>{mail}</span>
            </article>
          ))}
        </div>
      </section>
      <PageCta title="Entrer dans la démonstration" to="/login" label="Connexion" />
    </main>
  );
}

export function Pricing() {
  const plans = [
    ['Personne', 'Le compte individuel', 'Une première entreprise, ses devis, ses factures et ses projets.'],
    ['Atelier', 'L’équipe sur le chantier', 'Les tâches, le planning et le budget de chaque mission.'],
    ['Maison', 'Plusieurs entreprises', 'Les statistiques, et le passage d’une maison à l’autre.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Tarifs"
        title="L’essai est ouvert."
        lead="Les formules décrivent l’usage. L’espace de démonstration se parcourt sans règlement."
      />
      <section className="pg-band">
        <div className="pg-grid">
          {plans.map(([title, line, text]) => (
            <article key={title}>
              <small>{line}</small>
              <h2>{title}</h2>
              <p>{text}</p>
              <Link to="/inscription">Créer un compte</Link>
            </article>
          ))}
        </div>
      </section>
      <PageCta title="Commencer par la démonstration" to="/demo" label="Voir les comptes" />
    </main>
  );
}

export function Advice() {
  const notes = [
    ['Choisir le modèle', 'Nomade pour une agence, Chantier pour un lot technique, Cèdre ou Iris pour une facture classique. Le modèle se choisit au moment de générer la pièce.'],
    ['Lire le planning', 'Une tâche sans dates ne dessine pas de barre. Début, fin, personne : le planning apparaît, avec la ligne du jour.'],
    ['Tenir le budget', 'Un poste a un prévu et un dépensé. La fiche projet les additionne à côté des factures liées.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Conseils & bonnes pratiques"
        title="Trois gestes qui tiennent le fil."
        lead="Le modèle, le planning et le budget se règlent dans la fiche, pas dans un autre cahier."
      />
      <section className="pg-block pg-bars">
        {notes.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <Faq />
      <PageCta title="Mettre ces gestes dans un dossier" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Vision() {
  const points = [
    ['Pour la personne', 'Un compte indépendant, puis autant d’entreprises que l’activité en demande.'],
    ['Pour l’entreprise', 'Une identité sur les pièces, une équipe, des clients, des projets.'],
    ['Pour le client', 'Un devis lisible, une facture choisie, un suivi qui ne se perd pas.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Vision"
        title="Une maison claire pour les chiffres d’un atelier."
        lead="La proposition, la décision, le chantier et le règlement restent dans le même geste."
      />
      <section className="pg-block pg-bars">
        {points.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <PageCta title="Suivre, en nzebi : DOUKOU" to="/a-propos" label="À propos" />
    </main>
  );
}

export function About() {
  return (
    <main className="pg">
      <PageHero
        kicker="À propos"
        title="DOUKOU, à Libreville."
        lead="DOUKOU veut dire suivre, en nzebi."
      />
      <section className="pg-split">
        <img src="/home/bandeau-equipe.jpg" alt="Deux artisans dans un atelier, en extérieur" />
        <div>
          <h2>Le dossier suit le travail.</h2>
          <p>La plateforme sert les ateliers, les bureaux et les entreprises qui vendent un travail précis. Elle réunit la relation client, les pièces commerciales et le pilotage du projet.</p>
          <p>Chaque maison garde ses clients, son personnel, ses devis, ses factures et ses dates.</p>
          <Link to="/login">Entrer dans l’espace client</Link>
        </div>
      </section>
      <PageCta title="Ouvrir le dossier maintenant" to="/inscription" label="Créer un compte" />
    </main>
  );
}
