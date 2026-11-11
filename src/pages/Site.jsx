import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import '../site.css';

export { Home } from './Landing';

const MENUS = [
  {
    label: 'Fonctionnalités',
    to: '/fonctionnalites',
    items: [
      ['Devis & factures', 'Cinq modèles de chaque, impression et PDF.', '/fonctionnalites#facturation'],
      ['Projets & Gantt', 'Étapes, tâches assignées, avancement.', '/fonctionnalites#projets'],
      ['Budget', 'Montants prévus et dépensés par poste.', '/fonctionnalites#budget'],
      ['Paiements', 'Échéances, paiements et reste à payer.', '/fonctionnalites#relances'],
      ['Tableau de bord', 'Indicateurs du mois.', '/fonctionnalites#pilotage'],
    ],
  },
  {
    label: 'Secteurs',
    to: '/secteurs',
    items: [
      ['Artisans', 'Du devis à la fin du chantier.', '/secteurs#ateliers'],
      ['Agences et bureaux', 'Plusieurs clients suivis en parallèle.', '/secteurs#agences'],
      ['BTP & chantiers', 'Étapes, budget et planning.', '/secteurs#btp'],
      ['Indépendants', 'Un compte individuel, une ou plusieurs entreprises.', '/secteurs#independants'],
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
    text: 'Renseignez les dates prévues, les étapes et les tâches de chaque personne. Le diagramme de Gantt se construit à partir de ces dates. Le chef de projet publie l’avancement avec un commentaire, visible par le client.',
    mock: 'gantt',
  },
  {
    id: 'budget',
    label: 'Budget',
    tone: 'purple',
    kicker: 'Postes',
    title: 'Prévu et engagé',
    text: 'Chaque projet a ses postes de dépense, avec un montant prévu et un montant dépensé. Les devis et factures liés au projet sont affichés dans la même fiche.',
    mock: 'budget',
  },
  {
    id: 'relances',
    label: 'Échéances',
    tone: 'rose',
    kicker: 'Paiements',
    title: 'Suivre ce qui reste à payer',
    text: 'Le comptable enregistre chaque paiement (montant, date, mode). Le reste à payer et le statut de la facture se mettent à jour. Les factures en retard apparaissent sur le tableau de bord.',
    mock: 'relance',
  },
  {
    id: 'pilotage',
    label: 'Pilotage',
    tone: 'sand',
    kicker: 'Statistiques',
    title: 'Les indicateurs du mois',
    text: 'Montant facturé, paiements reçus, devis en attente, projets en cours et factures en retard, entreprise par entreprise.',
    mock: 'dash',
  },
];

const FAQ = [
  ['Qu’est-ce que DOUKOU ?', 'Un portail web de gestion des devis, des factures et du suivi des projets clients. DOUKOU veut dire « suivre » en nzebi.'],
  ['Faut-il un compte pour regarder le site ?', 'Non. Les pages de présentation sont publiques et le chat répond sans inscription. Le compte sert à gérer ses clients, ses devis et ses factures.'],
  ['Comment choisir le modèle de devis ou de facture ?', 'Cinq modèles sont proposés dans l’écran du devis ou de la facture. Le document reprend les coordonnées de l’entreprise, du client, les lignes et les totaux.'],
  ['Mes clients peuvent-ils se connecter ?', 'Oui. L’administrateur crée un compte client rattaché à la fiche du client. Le client consulte alors ses devis, ses factures et ses projets, et accepte ou refuse les devis envoyés.'],
  ['Le planning se construit comment ?', 'Sur la fiche projet : date de début, fin estimée, tâches assignées à une personne, avancement. Le diagramme de Gantt se dessine à partir de ces dates.'],
  ['Une personne peut-elle gérer plusieurs entreprises ?', 'Oui. Depuis l’écran Entreprises, on en crée d’autres et on passe de l’une à l’autre avec le sélecteur en haut de page.'],
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
            <h2>Produit</h2>
            <Link to="/fonctionnalites">Fonctionnalités</Link>
            <Link to="/secteurs">Secteurs</Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/conseils">Conseils</Link>
          </div>
          <div>
            <h2>Accès</h2>
            <Link to="/inscription">Créer un compte</Link>
            <Link to="/login">Connexion</Link>
            <Link to="/demo">Démonstration</Link>
            <Link to="/login">Espace client</Link>
          </div>
          <div>
            <h2>Société</h2>
            <Link to="/vision">Vision</Link>
            <Link to="/a-propos">À propos</Link>
            <Link to="/conseils">Bonnes pratiques</Link>
            <Link to="/demo">Comptes de démo</Link>
          </div>
          <div>
            <h2>Fonctions</h2>
            <Link to="/fonctionnalites#facturation">Devis et factures</Link>
            <Link to="/fonctionnalites#projets">Projets et Gantt</Link>
            <Link to="/fonctionnalites#budget">Budget</Link>
            <Link to="/fonctionnalites#pilotage">Pilotage</Link>
          </div>
        </div>
      </div>
      <p className="tx-foot-legal">DOUKOU · Devis, factures et projets · Libreville</p>
      <div className="tx-foot-geo">
        <h2>Villes</h2>
        <ul>
          {cities.map((city) => <li key={city}><Link to="/inscription">{city}</Link></li>)}
        </ul>
        <h2>Métiers</h2>
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
      <div className="mkt-studio-nav" role="tablist" aria-label="Fonctionnalités">
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
        title="Devis, factures, projets et paiements."
        lead="Les modules du portail, avec les droits de chaque rôle."
      />
      <Rails />
      <PageCta title="Essayer DOUKOU" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Sectors() {
  const sectors = [
    ['ateliers', '/home/metier-platre.jpg', 'Artisans', 'Un devis, un acompte, des travaux avec des dates. Le devis accepté devient la facture et les tâches sont assignées.'],
    ['agences', '/home/metier-peinture.jpg', 'Agences et bureaux', 'Plusieurs clients suivis en parallèle. Chaque entreprise a ses propres statistiques.'],
    ['btp', '/home/metier-plomberie.jpg', 'BTP & chantiers', 'Étapes, budget et planning. Le Gantt montre qui fait quoi entre le début et la fin prévue.'],
    ['independants', '/home/pro-chantier.jpg', 'Indépendants', 'Un compte individuel suffit. Vous pouvez ensuite ajouter une ou plusieurs entreprises.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Secteurs"
        title="Pour les entreprises de services et de travaux."
        lead="Artisans, agences, BTP ou indépendants."
      />
      <section className="pg-band">
        <div className="pg-photos">
          {sectors.map(([id, src, title, text]) => (
            <article id={id} key={id}>
              <img src={src} alt="" />
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
                <Link to="/inscription">Créer un compte</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <PageCta title="Essayer DOUKOU" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Demo() {
  const accounts = [
    ['Aurore Blanc', 'Administrateur', 'Comptes utilisateurs, paramètres et accès à tous les modules.', 'aurore.blanc@oree.fr'],
    ['Marc Essono', 'Responsable commercial', 'Clients et devis.', 'marc.essono@oree.fr'],
    ['Léa Nguema', 'Comptable', 'Factures et paiements.', 'lea.nguema@oree.fr'],
    ['Yannick Ondo', 'Chef de projet', 'Projets, étapes et avancement.', 'yannick.ondo@oree.fr'],
    ['Hervé Mba', 'Client', 'Espace client de la Clinique Les Flamboyants.', 'direction@flamboyants.ga'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Démonstration"
        title="Comptes de démonstration"
        lead="Un compte par rôle, sur la même entreprise de démonstration. Mot de passe commun : Cedre2026!"
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
    ['Solo', 'Compte individuel', 'Une entreprise, ses clients, ses devis, ses factures et ses projets.'],
    ['Équipe', 'Plusieurs utilisateurs', 'Comptes par rôle : commercial, comptable, chef de projet, clients.'],
    ['Multi', 'Plusieurs entreprises', 'Plusieurs entreprises sous un même compte, avec un sélecteur.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Tarifs"
        title="Tarifs"
        lead="Le portail est gratuit pendant la phase de test. Les formules ci-dessous sont indicatives."
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
    ['Envoyer le devis avant de facturer', 'Un devis passe par brouillon, envoyé, puis accepté ou refusé. Seul un devis accepté peut être transformé en facture.'],
    ['Dater les tâches', 'Une tâche sans date de début et de fin n’apparaît pas dans le Gantt.'],
    ['Publier l’avancement régulièrement', 'Une mise à jour courte chaque semaine évite au client de devoir appeler pour savoir où en est son projet.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Conseils & bonnes pratiques"
        title="Quelques conseils d’utilisation."
        lead="Pour tirer le meilleur parti du portail."
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
      <PageCta title="Essayer DOUKOU" to="/inscription" label="Créer un compte" />
    </main>
  );
}

export function Vision() {
  const points = [
    ['Moins de ressaisie', 'Le devis accepté devient la facture, sans recopier les lignes.'],
    ['Des informations au même endroit', 'Clients, devis, factures, paiements et projets dans une seule base.'],
    ['Un client plus autonome', 'Il consulte ses documents et l’avancement sans devoir appeler.'],
  ];
  return (
    <main className="pg">
      <PageHero
        kicker="Vision"
        title="Pourquoi ce portail ?"
        lead="Remplacer les fichiers Word et Excel dispersés par un outil commun."
      />
      <section className="pg-block pg-bars">
        {points.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <PageCta title="En savoir plus" to="/a-propos" label="À propos" />
    </main>
  );
}

export function About() {
  return (
    <main className="pg">
      <PageHero
        kicker="À propos"
        title="À propos de DOUKOU"
        lead="DOUKOU veut dire « suivre » en nzebi."
      />
      <section className="pg-split">
        <img src="/home/bandeau-equipe.jpg" alt="Deux artisans dans un atelier, en extérieur" />
        <div>
          <h2>Le projet</h2>
          <p>DOUKOU est un portail web de gestion des devis, des factures et du suivi des projets clients, réalisé dans le cadre d’un projet de stage à Libreville.</p>
          <p>Il s’adresse aux petites entreprises de services et de travaux qui gèrent aujourd’hui ces informations dans plusieurs fichiers séparés.</p>
          <Link to="/login">Se connecter</Link>
        </div>
      </section>
      <PageCta title="Essayer DOUKOU" to="/inscription" label="Créer un compte" />
    </main>
  );
}
