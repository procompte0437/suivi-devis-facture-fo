import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const ASKS = [
  ['Couverture du devis', 'Le bon modèle, du premier envoi', 'Le devis part avec le modèle choisi. On ne cherche plus la dernière version dans un autre dossier.', 'Direction d’atelier · Libreville'],
  ['Planning du chantier', 'Les tâches ont une personne', 'Début, fin estimée, personne assignée : le Gantt se dessine dans la fiche, avec la ligne du jour.', 'Conduite de chantier · Port-Gentil'],
  ['Facture et solde', 'La facture reprend le devis', 'Les lignes ne sont pas ressaisies. L’échéance et le reste à encaisser restent visibles après l’envoi.', 'Comptabilité · Libreville'],
];

const TRADES = [
  ['/home/metier-platre.jpg', 'Ateliers', 'Tenez les acomptes, les étapes et la trésorerie de chaque mission.', '/secteurs#ateliers', 'Menuiserie, atelier, fabrication'],
  ['/home/metier-peinture.jpg', 'Agences', 'Plusieurs clients, une identité, des relances et un avancement lisible.', '/secteurs#agences', 'Studio, conseil, suivi de clients'],
  ['/home/metier-plomberie.jpg', 'Chantiers', 'Lots, jalons et budget se lisent comme un planning.', '/secteurs#btp', 'BTP, lots, livraison'],
];

export function Home() {
  const [stats, setStats] = useState(null);
  const [ask, setAsk] = useState('');
  const [openAsk, setOpenAsk] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats({ quotes: 0, invoices: 0, companies: 0 }));
  }, []);

  function start(event) {
    event.preventDefault();
    const query = ask.trim();
    navigate(query ? `/inscription?activite=${encodeURIComponent(query)}` : '/inscription');
  }

  return (
    <main className="tx">
      <section className="tx-hero">
        <div className="tx-hero-copy">
          <h1>Le moyen fiable de suivre un dossier.</h1>
          <form onSubmit={start}>
            <label htmlFor="dossier">Que voulez-vous tenir ?</label>
            <div>
              <input id="dossier" value={ask} onChange={(event) => setAsk(event.target.value)} placeholder="Par exemple : devis, chantier, facture" />
              <button type="submit" aria-label="Continuer">→</button>
            </div>
          </form>
        </div>
        <figure>
          <img src="/home/hero-atelier.jpg" alt="Menuisier en train de poser un parquet dans un atelier clair" />
          <figcaption>Atelier Orée · Libreville</figcaption>
        </figure>
      </section>

      <section className="tx-trust" aria-label="Repères">
        <p>Démonstration ouverte <b>Libreville</b></p>
      </section>

      <section className="tx-stats" aria-label="Activité de la démonstration">
        <p><b>{stats ? stats.quotes : '—'}</b><span>devis</span></p>
        <p><b>{stats ? stats.invoices : '—'}</b><span>factures</span></p>
        <p><b>10</b><span>modèles de pièces</span></p>
      </section>

      <section className="tx-steps">
        <h2>Comment tenir le dossier</h2>
        <ol>
          <li>
            <StepIcon kind="doc" />
            <small>Étape 1</small>
            <strong>Créez le devis</strong>
          </li>
          <li>
            <StepIcon kind="models" />
            <small>Étape 2</small>
            <strong>Choisissez le modèle</strong>
          </li>
          <li>
            <StepIcon kind="plan" />
            <small>Étape 3</small>
            <strong>Suivez facture et planning</strong>
          </li>
        </ol>
        <Link to="/fonctionnalites">Voir comment ça marche</Link>
      </section>

      <section className="tx-why">
        <h2>Pourquoi DOUKOU tient le dossier jusqu’au solde</h2>
        <p>DOUKOU, « suivre » en nzebi, réunit la proposition, la facture, l’équipe et le chantier. Chaque entreprise a ses clients, ses pièces, son personnel et sa lecture du mois.</p>
        <Link to="/a-propos">En savoir plus sur DOUKOU</Link>
      </section>

      <section className="tx-split">
        <div>
          <article>
            <h2>Une pièce au modèle</h2>
            <p>Cinq devis, cinq factures. Nomade, Ligne, Canopée, Soleil, Chantier, Cèdre, Artisans, Csmart, Atelier, Iris. Le devis choisi devient la facture sans ressaisie.</p>
          </article>
          <article>
            <h2>Un planning daté</h2>
            <p>Début, fin estimée, tâches par personne. Le Gantt se trace dans la fiche, avec l’avancement et la ligne du jour.</p>
          </article>
          <article>
            <h2>Un solde qui reste visible</h2>
            <p>Prévu, engagé, échéance, reste à encaisser. Après l’envoi, la facture ne sort pas du dossier.</p>
          </article>
        </div>
        <Phone />
      </section>

      <section className="tx-ready">
        <h2>Prêt à ouvrir le dossier ?</h2>
        <Link to="/inscription">Créer un compte</Link>
      </section>

      <section className="tx-asks">
        <header>
          <h2>Ce que les équipes demandent</h2>
          <p>Trois questions qui reviennent avant d’entrer dans l’espace.</p>
        </header>
        <div>
          {ASKS.map(([kicker, title, text, who], index) => (
            <article key={title}>
              <small>{kicker}</small>
              <h3>{title}</h3>
              <p>{who}</p>
              {openAsk === index ? <p className="more">{text}</p> : null}
              <button type="button" onClick={() => setOpenAsk(openAsk === index ? -1 : index)}>
                {openAsk === index ? 'Réduire' : 'En savoir plus'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="tx-popular">
        <h2>Métiers tenus dans DOUKOU</h2>
        <div>
          {TRADES.map(([src, title, text, href, meta]) => (
            <article key={title}>
              <img src={src} alt="" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link to={href}>En savoir plus</Link>
                <footer><span>{meta}</span><Link to={href}>Voir plus</Link></footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tx-pro">
        <img src="/home/pro-chantier.jpg" alt="Électricien devant un tableau sur un chantier" />
        <div>
          <h2>Vous tenez plusieurs entreprises ?</h2>
          <p className="lead">Passez de l’une à l’autre sans mélanger les dossiers.</p>
          <p>Le compte personne ouvre l’espace. Chaque entreprise créée ensuite a ses clients, ses devis, ses factures, son équipe et ses statistiques.</p>
          <Link to="/inscription">Créer le compte, puis les entreprises</Link>
        </div>
      </section>

      <section className="tx-app">
        <div>
          <h2>Le dossier, sur l’écran du chantier</h2>
          <p>Devis, facture et planning s’ouvrent dans le navigateur, sur ordinateur comme sur téléphone. Les lignes, les dates et le solde restent le même dossier.</p>
          <Link to="/demo">Entrer dans la démonstration</Link>
        </div>
        <Phone />
      </section>

      <section className="tx-reviews">
        <img src="/home/bandeau-equipe.jpg" alt="Deux artisans dans un jardin" />
        <div className="tx-review-row">
          <article className="pitch">
            <h2>Des retours pris sur le terrain</h2>
            <p>Direction d’atelier, conduite de chantier, comptabilité. Le dossier se lit sans chercher la dernière version.</p>
            <Link to="/demo">Voir la démonstration</Link>
          </article>
          {ASKS.map(([kicker, , text, who]) => (
            <article key={kicker}>
              <b>{kicker}</b>
              <p>{text}</p>
              <footer>{who}</footer>
            </article>
          ))}
        </div>
      </section>

      <p className="tx-close">
        <Link to="/inscription">Ouvrir le dossier maintenant <span aria-hidden="true">→</span></Link>
      </p>
    </main>
  );
}

function StepIcon({ kind }) {
  const paths = {
    doc: 'M8 4h8l4 4v12H8zM16 4v4h4M11 12h6M11 16h6',
    models: 'M6 8h8v10H6zM10 6h8v10',
    plan: 'M5 16V8h4v8M11 16V5h4v11M17 16v-6h4v6',
  };
  return (
    <span className={`tx-icon ${kind}`} aria-hidden="true">
      <svg viewBox="0 0 28 28">
        <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

function Phone() {
  return (
    <div className="tx-phone" aria-hidden="true">
      <header><b>Étape 2 sur 3</b><span>×</span></header>
      <p>Quel modèle pour la pièce ?</p>
      <ul>
        <li>Nomade</li>
        <li className="on">Chantier</li>
        <li>Cèdre</li>
      </ul>
      <label>Montant de l’acompte <input readOnly value="800 000" /></label>
      <footer><span>Précédent</span><b>Suivant</b></footer>
    </div>
  );
}
