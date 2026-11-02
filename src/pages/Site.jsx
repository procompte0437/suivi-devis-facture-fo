import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Mark } from '../components/ui';
import '../site.css';

const PERSONAS = [
  { id: 'personne', label: 'Personne' },
  { id: 'entreprise', label: 'Entreprise' },
  { id: 'atelier', label: 'Atelier' },
];

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
    label: 'Gérez votre facturation',
    tone: 'green',
    kicker: 'Devis et factures',
    title: 'Devisez & facturez',
    text: 'Créez le devis, choisissez le modèle, puis transformez-le en facture sans ressaisir les lignes. Numérotation, TVA et identité de l’entreprise suivent la pièce. Cinq devis, cinq factures : Nomade, Ligne, Canopée, Soleil, Chantier, Cèdre, Artisans, Csmart, Atelier, Iris.',
    mock: 'quote',
  },
  {
    id: 'projets',
    label: 'Suivez vos projets',
    tone: 'blue',
    kicker: 'Planning',
    title: 'Un Gantt qui se dessine',
    text: 'Renseignez le début, la fin visée et les tâches par personne. Le planning se trace dans la fiche, avec l’avancement et la ligne du jour. Jalons, pièces liées et équipe restent dans le même geste.',
    mock: 'gantt',
  },
  {
    id: 'budget',
    label: 'Tenez le budget',
    tone: 'purple',
    kicker: 'Postes',
    title: 'Prévu, dépensé, reste',
    text: 'Chaque mission a ses postes. Vous voyez ce qui était prévu, ce qui est déjà engagé, et ce qu’il reste avant la livraison. Le budget du projet parle le même langage que les factures.',
    mock: 'budget',
  },
  {
    id: 'relances',
    label: 'Gardez le fil des échéances',
    tone: 'rose',
    kicker: 'Encaissement',
    title: 'Ce qui est dû, visible',
    text: 'Date d’échéance, statut, reste à encaisser : la facture ne disparaît pas après l’envoi. L’équipe sait qui relancer, et le client retrouve une pièce lisible.',
    mock: 'relance',
  },
  {
    id: 'pilotage',
    label: 'Pilotez l’activité',
    tone: 'sand',
    kicker: 'Statistiques',
    title: 'Des indicateurs clairs',
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
  ['Qu’est-ce qu’Orée ?', 'Orée est l’espace où une personne ou une entreprise tient ses devis, ses factures et le suivi de ses projets. Chaque maison a ses clients, son personnel, son budget et ses statistiques.'],
  ['Faut-il un compte pour regarder le site ?', 'Non. L’accueil, la vision, les secteurs et les conseils sont ouverts. Le chat répond aussi avant l’inscription. Le compte sert à créer ses entreprises et à tenir les pièces.'],
  ['Comment choisir le modèle de devis ou de facture ?', 'Au moment de générer la pièce, cinq modèles sont proposés. Le papier reprend l’identité de l’entreprise active : nom, adresse, client, lignes et totaux.'],
  ['Le planning se construit comment ?', 'Sur la fiche projet : date de début, fin estimée, tâches assignées à une personne, avancement. Le diagramme de Gantt se dessine à partir de ces dates.'],
  ['Une personne peut-elle gérer plusieurs entreprises ?', 'Oui. Le compte peut être personnel ou d’entreprise. Dans l’espace client, on crée d’autres entreprises et on passe de l’une à l’autre.'],
];

const HERO = {
  personne: 'Un compte à votre nom, puis les entreprises que vous faites vivre.',
  entreprise: 'La maison, ses clients, ses pièces et le fil de chaque mission.',
  atelier: 'Devis, factures, équipe et planning dans le même geste.',
};

export function SiteLayout() {
  const [persona, setPersona] = useState('atelier');
  const [menu, setMenu] = useState(false);

  return (
    <div className={`mkt ${menu ? 'nav-open' : ''}`}>
      <div className="mkt-header">
      <div className="mkt-personas" role="tablist" aria-label="À qui s’adresse Orée">
        {PERSONAS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={persona === item.id}
            className={persona === item.id ? 'on' : ''}
            onClick={() => setPersona(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <header className="mkt-nav">
        <Link to="/" className="mkt-logo" onClick={() => setMenu(false)}>
          <Mark size={36} />
          <span>Orée</span>
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
          <Link className="mkt-login" to="/login">Se connecter</Link>
          <Link className="mkt-cta" to="/inscription">Testez</Link>
        </div>
      </header>
      </div>
      <Outlet context={{ persona }} />
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-footer-card">
        <div className="mkt-footer-brand">
          <Link to="/" className="mkt-logo"><Mark size={34} /><span>Orée</span></Link>
          <Link className="mkt-cta" to="/inscription">Ouvrir un espace</Link>
          <p>Démo ouverte<br />Libreville</p>
        </div>
        <div>
          <h2>Secteurs</h2>
          <Link to="/secteurs#ateliers">Ateliers & artisans</Link>
          <Link to="/secteurs#agences">Agences</Link>
          <Link to="/secteurs#btp">BTP & chantiers</Link>
          <Link to="/secteurs#independants">Indépendants</Link>
        </div>
        <div>
          <h2>La maison</h2>
          <Link to="/vision">Vision</Link>
          <Link to="/a-propos">À propos</Link>
          <Link to="/conseils">Conseils</Link>
          <Link to="/demo">Démonstration</Link>
        </div>
        <div>
          <h2>Découvrir</h2>
          <Link to="/fonctionnalites">Fonctionnalités</Link>
          <Link to="/tarifs">Tarifs</Link>
          <Link to="/inscription">Créer un compte</Link>
          <Link to="/login">Espace client</Link>
        </div>
      </div>
      <p className="mkt-legal">Orée · Devis, factures et projets · Libreville</p>
    </footer>
  );
}

export function Home() {
  const { persona } = useOutletContext();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats({ quotes: 0, invoices: 0, companies: 0 }));
  }, []);

  return (
    <main>
      <section className="mkt-hero">
        <div className="mkt-hero-copy">
          <h1>
            <span>Logiciel</span>
            <span>de devis<i>’</i></span>
            <span>et projets<i>’</i></span>
          </h1>
          <p className="mkt-chip">Cinq modèles inclus</p>
          <p className="mkt-lead">{HERO[persona]} Facturez, suivez l’équipe et tenez le budget dans le même espace.</p>
        </div>
        <div className="mkt-hero-visual" aria-hidden="true">
          <div className="mkt-arch">
            <span className="desk" />
            <span className="sheet a" />
            <span className="sheet b" />
            <span className="lamp" />
          </div>
          <div className="mkt-float-badge">
            <b>Pièces au modèle</b>
            <span>Devis et facture</span>
          </div>
          <div className="mkt-float-card">
            <header><b>DEV-2026</b><span>Devis du jour</span></header>
            <ol><li className="done">Envoyé</li><li className="now">À signer</li><li>Facture</li></ol>
            <div className="sign">La maison a signé</div>
          </div>
        </div>
      </section>
      <section className="mkt-films">
          <article className="film olive">
            <span>Présentation</span>
            <strong>L’atelier, de bout en bout</strong>
            <i aria-hidden="true" />
          </article>
          <article className="film forest">
            <span>Pièces</span>
            <strong>Devis & factures</strong>
            <i aria-hidden="true" />
          </article>
          <article className="film moss">
            <span>Planning</span>
            <strong>Le Gantt du projet</strong>
            <i aria-hidden="true" />
          </article>
      </section>

      <section className="mkt-audiences">
        <article className="mkt-pitch">
          <h2>Un espace clair pour tenir la maison.</h2>
          <p>Orée réunit la proposition, la facture, l’équipe et le chantier. Vous dormez sur des chiffres qui ont un fil.</p>
          <Link className="mkt-cta" to="/inscription">Testez gratuitement</Link>
          <small>Démonstration ouverte</small>
        </article>
        <div className="mkt-audience-grid">
          <article>
            <span className="blob a" />
            <h3>Ateliers & artisans</h3>
            <p>Tenez la trésorerie et facturez chaque étape du chantier.</p>
          </article>
          <article>
            <span className="blob b" />
            <h3>Agences</h3>
            <p>Pilotez plusieurs clients, les relances et l’avancement.</p>
          </article>
          <article>
            <span className="blob c" />
            <h3>BTP & chantiers</h3>
            <p>Lots, jalons, budget : le projet se lit comme un planning.</p>
          </article>
          <article>
            <span className="blob d" />
            <h3>Indépendants</h3>
            <p>Un compte personne, puis autant d’entreprises que l’activité.</p>
          </article>
        </div>
        <Link className="mkt-more" to="/fonctionnalites">Toutes nos fonctionnalités</Link>
      </section>

      <section className="mkt-functions">
        <div className="mkt-functions-side">
          <h2>Tout ce que la maison tient déjà.</h2>
          <p>{stats ? `${stats.quotes} devis et ${stats.invoices} factures réalisés, ${stats.companies} entreprise${stats.companies > 1 ? 's' : ''} hébergée${stats.companies > 1 ? 's' : ''}.` : 'Les compteurs de la maison se chargent.'}</p>
        </div>
        <div className="mkt-function-grid">
          {[
            ['Facturation', 'Signez plus vite et facturez sans ressaisie.'],
            ['Projets', 'Dates, tâches, Gantt : le chantier reste visible.'],
            ['Budget', 'Prévu et dépensé, poste par poste.'],
            ['Échéances', 'Ce qui est dû ne se perd pas après l’envoi.'],
            ['Pilotage', 'La lecture du mois, sans être expert.'],
          ].map(([title, text]) => (
            <article key={title}>
              <span />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mkt-product">
        <div>
          <h2>Facturez, suivez le projet, gardez le fil des règlements.</h2>
          <p>Orée relie le quotidien de la maison à ses pièces : devis, facture, équipe, budget.</p>
          <div className="mkt-product-actions">
            <Link className="mkt-cta" to="/inscription">Testez, c’est ouvert</Link>
            <Link className="mkt-ghost" to="/demo">Demandez la démo</Link>
          </div>
        </div>
        <DashMock />
        <ul className="mkt-pills">
          <li><b>Devis</b><span>Cinq modèles, puis la facture.</span></li>
          <li><b>Gantt</b><span>Tâches par personne, ligne du jour.</span></li>
          <li><b>Factures</b><span>Identité de l’entreprise, totaux, échéance.</span></li>
          <li><b>Pilotage</b><span>Encaissé, ouvert, projets vivants.</span></li>
        </ul>
      </section>

      <section className="mkt-manage" id="fonctionnalites">
        <h2>Tout pour gérer</h2>
        <p className="mkt-scribble right">La maison, incluse</p>
        <Rails />
      </section>

      <Compare />
      <Voices />
      <Faq />
    </main>
  );
}

function Rails() {
  const [open, setOpen] = useState('facturation');
  return (
    <div className="mkt-rails">
      {RAILS.map((rail) => (
        <div key={rail.id} id={rail.id}>
          <button type="button" className={`rail ${rail.tone} ${open === rail.id ? 'on' : ''}`} aria-expanded={open === rail.id} onClick={() => setOpen(rail.id)}>
            {rail.label}
            <i />
          </button>
          {open === rail.id ? (
            <article className="rail-body">
              <div>
                <p className="kicker">{rail.kicker}</p>
                <h3>{rail.title}</h3>
                <p>{rail.text}</p>
                <Link className="mkt-cta" to="/inscription">Découvrir</Link>
              </div>
              <Mock kind={rail.mock} />
            </article>
          ) : null}
        </div>
      ))}
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
      <header><b>DEV-2026</b><span>Devis du jour</span></header>
      <ol>
        <li className="done">Envoyé</li>
        <li className="now">À signer</li>
        <li>Facture</li>
      </ol>
      <div className="sign">La maison a signé le devis</div>
    </div>
  );
}

function GanttMock() {
  return (
    <div className="mock gantt-mini">
      <header><b>Planning</b><span>Aujourd’hui</span></header>
      <div><em>Direction</em><span style={{ width: '68%' }} /></div>
      <div><em>Chantier</em><span style={{ width: '46%' }} /></div>
      <div><em>Livraison</em><span style={{ width: '28%' }} /></div>
    </div>
  );
}

function BudgetMock() {
  return (
    <div className="mock budget">
      <header><b>Postes</b><span>Mission</span></header>
      {[['Création', '2 000 000', '400 000'], ['Suivi', '900 000', '120 000'], ['Livraison', '450 000', '0']].map(([name, planned, spent]) => (
        <p key={name}><span>{name}</span><span>{planned}</span><span>{spent}</span></p>
      ))}
    </div>
  );
}

function RelanceMock() {
  return (
    <div className="mock relance">
      <header><b>Échéance</b><button type="button">×</button></header>
      <p>Facture envoyée, règlement à suivre.</p>
      <div>
        {['Échéance', 'Relance douce', 'Solde', 'Merci'].map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function DashMock({ compact = false }) {
  return (
    <div className={`mock dash ${compact ? 'compact' : ''}`}>
      <header><b>Bonjour</b><span>Tableau</span></header>
      <div className="donut" aria-hidden="true"><strong>62 %</strong></div>
      <ul>
        <li><span>Facturé du mois</span><b>visible</b></li>
        <li><span>Devis ouverts</span><b>en cours</b></li>
        <li><span>Projets vivants</span><b>au fil</b></li>
      </ul>
    </div>
  );
}

function Compare() {
  const [mode, setMode] = useState('avec');
  const notes = mode === 'avec'
    ? ['Relances tenues', 'Planning dessiné', 'Facture au modèle']
    : ['Facture en retard', 'Planning dispersé', 'Devis introuvable'];
  return (
    <section className={`mkt-compare ${mode}`}>
      <div className="circle">
        <span className="note left">{notes[0]}</span>
        <span className="note right">{notes[1]}</span>
        <span className="note bottom">{notes[2]}</span>
        <div className="scene" aria-hidden="true" />
        <div className="toggle" role="group" aria-label="Avec ou sans Orée">
          <button type="button" className={mode === 'sans' ? 'on' : ''} onClick={() => setMode('sans')}>Sans Orée</button>
          <button type="button" className={mode === 'avec' ? 'on' : ''} onClick={() => setMode('avec')}>Avec Orée</button>
        </div>
      </div>
    </section>
  );
}

function Voices() {
  const [index, setIndex] = useState(0);
  const voice = VOICES[index];
  return (
    <section className="mkt-voices">
      <h2>Ils tiennent le fil au quotidien</h2>
      <p className="mkt-scribble">et ils gèrent</p>
      <div className="voice">
        <button type="button" aria-label="Témoignage précédent" onClick={() => setIndex((value) => (value + VOICES.length - 1) % VOICES.length)}>‹</button>
        <blockquote>
          <p>{voice[0]}</p>
          <footer><b>{voice[1]}</b><span>{voice[2]}</span></footer>
        </blockquote>
        <button type="button" aria-label="Témoignage suivant" onClick={() => setIndex((value) => (value + 1) % VOICES.length)}>›</button>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mkt-faq">
      <h2>On répond à vos questions</h2>
      <p>Les questions qui reviennent, pour entrer dans l’atelier sans se perdre.</p>
      {FAQ.map(([question, answer], index) => (
        <article key={question}>
          <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}</button>
          {open === index ? <p>{answer}</p> : null}
        </article>
      ))}
    </section>
  );
}

export function Features() {
  return (
    <main className="mkt-page">
      <p className="kicker">Fonctionnalités</p>
      <h1>Tout pour gérer la maison.</h1>
      <p className="mkt-lead">Les pièces, le personnel, le budget et le planning vivent dans l’entreprise que vous avez choisie.</p>
      <Rails />
    </main>
  );
}

export function Sectors() {
  const sectors = [
    ['ateliers', 'Ateliers & artisans', 'Une proposition, des acomptes, un chantier qui a des dates. Le devis choisi devient la facture, et les tâches restent assignées.'],
    ['agences', 'Agences', 'Plusieurs clients, une identité par entreprise. Les statistiques lisent le mois sans mélanger les maisons.'],
    ['btp', 'BTP & chantiers', 'Lots, unités, jalons et budget. Le Gantt montre qui fait quoi entre le début et la fin visée.'],
    ['independants', 'Indépendants', 'Le compte personne ouvre l’espace. Chaque entreprise créée ensuite a ses clients, ses pièces et son équipe.'],
  ];
  return (
    <main className="mkt-page">
      <p className="kicker">Secteurs</p>
      <h1>Pour les maisons qui vendent un travail précis.</h1>
      <div className="mkt-sector-list">
        {sectors.map(([id, title, text]) => (
          <article id={id} key={id}>
            <h2>{title}</h2>
            <p>{text}</p>
            <Link to="/inscription">Essayer pour ce métier</Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function Demo() {
  return (
    <main className="mkt-page">
      <p className="kicker">Démo</p>
      <h1>Parcourez l’atelier déjà meublé.</h1>
      <p className="mkt-lead">Trois comptes partagent la démonstration. Le mot de passe est indiqué sur la page de connexion.</p>
      <div className="mkt-plans">
        <article><h2>Aurore Blanc</h2><p>Administration. Entreprises, réglages, lecture d’ensemble.</p></article>
        <article><h2>Marc Essono</h2><p>Commercial. Clients, devis, projets.</p></article>
        <article><h2>Léa Nguema</h2><p>Comptabilité. Factures, échéances, encaissements.</p></article>
      </div>
      <Link className="mkt-cta" to="/login">Entrer dans la démo</Link>
    </main>
  );
}

export function Pricing() {
  const plans = [
    ['Personne', 'Le compte individuel, une première entreprise, devis, factures et projets.'],
    ['Atelier', 'L’équipe, les tâches, le Gantt et le budget de chaque mission.'],
    ['Maison', 'Plusieurs entreprises, les statistiques et le passage de l’une à l’autre.'],
  ];
  return (
    <main className="mkt-page">
      <p className="kicker">Tarifs</p>
      <h1>L’essai est ouvert.</h1>
      <p className="mkt-lead">Les formules décrivent l’usage. L’espace de démonstration ne demande pas de règlement pour être parcouru.</p>
      <div className="mkt-plans">
        {plans.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
            <Link to="/inscription">Créer un compte</Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export function Advice() {
  const notes = [
    ['Choisir le modèle', 'Nomade pour une agence, Chantier pour un lot technique, Cèdre ou Iris pour une facture classique. Le modèle se choisit au moment de générer la pièce.'],
    ['Lire le planning', 'Une tâche sans dates ne dessine pas de barre. Début, fin, personne : le Gantt apparaît, avec la ligne du jour.'],
    ['Tenir le budget', 'Un poste a un prévu et un dépensé. La fiche projet les additionne à côté des factures liées.'],
  ];
  return (
    <main className="mkt-page">
      <p className="kicker">Conseils & bonnes pratiques</p>
      <h1>Trois gestes qui tiennent le fil.</h1>
      <div className="mkt-sector-list">
        {notes.map(([title, text]) => (
          <article key={title}><h2>{title}</h2><p>{text}</p></article>
        ))}
      </div>
    </main>
  );
}

export function Vision() {
  return (
    <main className="mkt-page">
      <p className="kicker">Vision</p>
      <h1>Une maison claire pour les chiffres d’un atelier.</h1>
      <p className="mkt-lead">La proposition, la décision, le chantier et le règlement restent dans le même geste.</p>
      <div className="mkt-plans">
        <article><h2>Pour la personne</h2><p>Un compte indépendant, puis autant d’entreprises que l’activité en demande.</p></article>
        <article><h2>Pour l’entreprise</h2><p>Une identité sur les pièces, une équipe, des clients, des projets.</p></article>
        <article><h2>Pour le client</h2><p>Un devis lisible, une facture choisie, un suivi qui ne se perd pas.</p></article>
      </div>
    </main>
  );
}

export function About() {
  return (
    <main className="mkt-page">
      <p className="kicker">À propos</p>
      <h1>Orée, à Libreville.</h1>
      <p className="mkt-lead">La plateforme sert les ateliers, les bureaux et les entreprises qui vendent un travail précis. Elle réunit la relation client, les pièces commerciales et le pilotage du projet.</p>
      <Link className="mkt-cta" to="/login">Entrer dans l’espace client</Link>
    </main>
  );
}
