import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const ASKS = [
  ['Devis', 'Le client peut-il valider le devis lui-même ?', 'Oui. Une fois le devis envoyé, le client l’ouvre dans son espace et l’accepte ou le refuse. La date et l’auteur de la décision sont enregistrés.', 'Responsable commercial'],
  ['Factures', 'Faut-il ressaisir les lignes du devis ?', 'Non. La facture est générée à partir du devis accepté, avec les mêmes lignes, la même TVA et la même remise.', 'Comptable'],
  ['Projets', 'Comment le client suit-il l’avancement ?', 'Le chef de projet met à jour le pourcentage, l’état et les étapes, avec un commentaire. Le client voit ces mises à jour dans son espace.', 'Chef de projet'],
];

const ROLE_CARDS = [
  ['Commercial', 'Gère les clients, prépare les devis et les envoie.'],
  ['Comptable', 'Génère les factures et enregistre les paiements.'],
  ['Client', 'Consulte ses devis, ses factures et l’avancement de ses projets.'],
];

const TRADES = [
  ['/home/metier-platre.jpg', 'Artisans', 'Devis, acomptes et étapes de chaque intervention.', '/secteurs#ateliers', 'Menuiserie, plâtrerie, fabrication'],
  ['/home/metier-peinture.jpg', 'Agences et bureaux', 'Plusieurs clients en parallèle, chacun avec ses devis et ses factures.', '/secteurs#agences', 'Conseil, communication, études'],
  ['/home/metier-plomberie.jpg', 'Chantiers', 'Étapes, budget et planning des travaux.', '/secteurs#btp', 'BTP, second œuvre, réseaux'],
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
          <p className="tx-hero-kicker">Devis, factures, projets</p>
          <h1>Vos devis, factures et projets au même endroit.</h1>
          <form onSubmit={start}>
            <label htmlFor="dossier">Quelle est votre activité ?</label>
            <div>
              <input id="dossier" value={ask} onChange={(event) => setAsk(event.target.value)} placeholder="Par exemple : menuiserie, BTP, agence" />
              <button type="submit" aria-label="Créer un compte">→</button>
            </div>
          </form>
        </div>
        <figure className="tx-dossier">
          <div className="tx-sheet back" aria-hidden="true" />
          <div className="tx-sheet">
            <header>
              <span>DEV-2026-014</span>
              <b>En suivi</b>
            </header>
            <h2>Parquet, atelier Louis</h2>
            <ul>
              <li><i />Devis accepté<small>12 lignes</small></li>
              <li><i />Facture partielle<small>40 % encaissés</small></li>
              <li><i className="now" />Pose en cours<small>Jalon 3 sur 4</small></li>
            </ul>
            <div className="tx-plan" aria-hidden="true">
              <svg viewBox="0 0 280 92">
                <rect x="8" y="10" width="78" height="18" />
                <rect x="90" y="10" width="64" height="18" />
                <rect x="158" y="10" width="108" height="18" />
                <rect x="8" y="32" width="46" height="18" />
                <rect x="58" y="32" width="96" height="18" />
                <rect x="158" y="32" width="52" height="18" />
                <rect x="214" y="32" width="52" height="18" />
                <rect x="8" y="54" width="110" height="18" />
                <rect x="122" y="54" width="70" height="18" />
                <rect x="196" y="54" width="70" height="18" />
              </svg>
              <span>Plan de pose</span>
            </div>
          </div>
          <figcaption>Exemple de suivi de projet</figcaption>
        </figure>
      </section>

      <section className="tx-trust" aria-label="Repères">
        <p>Données de la <b>démonstration</b></p>
      </section>

      <section className="tx-stats" aria-label="Activité de la démonstration">
        <p><b>{stats ? stats.quotes : '—'}</b><span>devis</span></p>
        <p><b>{stats ? stats.invoices : '—'}</b><span>factures</span></p>
        <p><b>10</b><span>modèles de documents</span></p>
      </section>

      <section className="tx-steps">
        <h2>Comment ça marche</h2>
        <ol>
          <li>
            <StepIcon kind="doc" />
            <small>Étape 1</small>
            <strong>Le commercial crée et envoie le devis</strong>
          </li>
          <li>
            <StepIcon kind="models" />
            <small>Étape 2</small>
            <strong>Le client l’accepte en ligne</strong>
          </li>
          <li>
            <StepIcon kind="plan" />
            <small>Étape 3</small>
            <strong>Facture, paiements et projet suivis</strong>
          </li>
        </ol>
        <Link to="/fonctionnalites">Voir les fonctionnalités</Link>
      </section>

      <section className="tx-why">
        <h2>Pourquoi DOUKOU</h2>
        <p>DOUKOU veut dire « suivre » en nzebi. Au lieu d’un devis sous Word, d’un tableau Excel pour les paiements et d’échanges par téléphone pour l’avancement, tout est rangé dans un seul outil, avec un accès adapté à chaque rôle.</p>
        <Link to="/a-propos">En savoir plus sur DOUKOU</Link>
      </section>

      <section className="tx-split">
        <div>
          <article>
            <h2>Des documents prêts à imprimer</h2>
            <p>Cinq modèles de devis et cinq modèles de facture. Le total, la TVA et la remise sont calculés automatiquement, et chaque document s’imprime ou s’enregistre en PDF.</p>
          </article>
          <article>
            <h2>Un planning par projet</h2>
            <p>Dates prévues, étapes, tâches assignées et diagramme de Gantt. Chaque mise à jour d’avancement est datée.</p>
          </article>
          <article>
            <h2>Les paiements à jour</h2>
            <p>Chaque paiement est enregistré avec sa date et son mode. Le reste à payer et le statut de la facture se mettent à jour seuls.</p>
          </article>
        </div>
        <Phone />
      </section>

      <section className="tx-ready">
        <h2>Essayer DOUKOU</h2>
        <Link to="/inscription">Créer un compte</Link>
      </section>

      <section className="tx-asks">
        <header>
          <h2>Questions fréquentes</h2>
          <p>Ce que l’on nous demande le plus souvent.</p>
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
        <h2>Pour quels métiers ?</h2>
        <div>
          {TRADES.map(([src, title, text, href, meta]) => (
            <article key={title}>
              <img src={src} alt="" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
                <footer><span>{meta}</span><Link to={href}>En savoir plus</Link></footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tx-pro">
        <img src="/home/pro-chantier.jpg" alt="Électricien devant un tableau sur un chantier" />
        <div>
          <h2>Vous tenez plusieurs entreprises ?</h2>
          <p className="lead">Passez de l’une à l’autre sans mélanger les données.</p>
          <p>Un même compte peut gérer plusieurs entreprises. Chacune a ses clients, ses devis, ses factures, son équipe et ses statistiques.</p>
          <Link to="/inscription">Créer un compte</Link>
        </div>
      </section>

      <section className="tx-app">
        <div>
          <h2>Sur ordinateur et sur téléphone</h2>
          <p>DOUKOU fonctionne dans le navigateur, sans installation. L’équipe et les clients s’y connectent depuis le bureau ou depuis le chantier.</p>
          <Link to="/demo">Entrer dans la démonstration</Link>
        </div>
        <Phone />
      </section>

      <section className="tx-reviews">
        <img src="/home/bandeau-equipe.jpg" alt="Deux artisans dans un jardin" />
        <div className="tx-review-row">
          <article className="pitch">
            <h2>Un accès pour chaque rôle</h2>
            <p>Chacun voit ce qui le concerne et ne modifie que son propre module.</p>
            <Link to="/demo">Voir les comptes de démonstration</Link>
          </article>
          {ROLE_CARDS.map(([role, text]) => (
            <article key={role}>
              <b>{role}</b>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="tx-close">
        <Link to="/inscription">Créer un compte <span aria-hidden="true">→</span></Link>
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
      <header><b>Nouveau devis</b><span>×</span></header>
      <p>Modèle du document</p>
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
