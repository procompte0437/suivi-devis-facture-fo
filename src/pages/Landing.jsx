import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MODULES } from './site/data';
import { PageCta, SiteIcon } from './site/SiteParts';

const PROFILES = {
  entreprise: {
    label: 'Je gère une entreprise',
    title: 'Mettez en place votre suivi en quelques étapes.',
    items: [
      ['Créer votre compte et votre entreprise', '/inscription'],
      ['Ajouter vos clients et préparer un premier devis', '/fonctionnalites#devis'],
      ['Choisir un modèle de devis ou de facture', '/fonctionnalites#devis'],
      ['Transformer un devis accepté en facture', '/fonctionnalites#factures'],
      ['Enregistrer les paiements et suivre le reste à payer', '/fonctionnalites#factures'],
      ['Ouvrir un projet, définir ses étapes et publier l’avancement', '/fonctionnalites#projets'],
      ['Donner un accès à chaque membre de l’équipe selon son rôle', '/fonctionnalites#roles'],
    ],
  },
  client: {
    label: 'Je suis client',
    title: 'Suivez vos dossiers sans avoir à appeler.',
    items: [
      ['Se connecter avec le compte fourni par votre prestataire', '/login'],
      ['Consulter vos devis et les accepter ou les refuser en ligne', '/fonctionnalites#espace-client'],
      ['Voir vos factures, ce qui est payé et ce qui reste à payer', '/fonctionnalites#espace-client'],
      ['Suivre l’avancement et les étapes de vos projets', '/fonctionnalites#espace-client'],
      ['Imprimer ou enregistrer vos documents en PDF', '/fonctionnalites#devis'],
    ],
  },
};

const TRADES = [
  ['/home/metier-platre.jpg', 'Artisans', 'Devis, acomptes et étapes de chaque intervention.', '/secteurs#artisans', 'Menuiserie, plâtrerie'],
  ['/home/metier-peinture.jpg', 'Agences et bureaux', 'Plusieurs clients suivis en parallèle, chacun avec ses pièces.', '/secteurs#agences', 'Conseil, communication'],
  ['/home/metier-plomberie.jpg', 'BTP et chantiers', 'Étapes, budget et planning des travaux.', '/secteurs#btp', 'Gros œuvre, réseaux'],
];

export function Home() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState('entreprise');
  const [lead, setLead] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats(null));
  }, []);

  function start(event) {
    event.preventDefault();
    navigate('/inscription', { state: { name: lead.name.trim(), email: lead.email.trim() } });
  }

  const current = PROFILES[profile];

  return (
    <main>
      <section className="st-hero">
        <div className="st-wrap">
          <div>
            <h1>Vos devis, factures et <mark>projets clients</mark> au même endroit</h1>
            <ul className="st-hero-points">
              <li><span><b>Créez</b> vos devis et faites-les valider en ligne par le client</span></li>
              <li><span><b>Facturez</b> sans ressaisie et suivez chaque paiement</span></li>
              <li><span><b>Publiez</b> l’avancement des projets, visible par vos clients</span></li>
            </ul>
            <form className="st-hero-form" onSubmit={start}>
              <input aria-label="Votre nom" placeholder="Votre nom" value={lead.name} onChange={(event) => setLead({ ...lead, name: event.target.value })} autoComplete="name" />
              <input aria-label="Votre e-mail" type="email" placeholder="Votre e-mail" value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} autoComplete="email" />
              <button className="st-btn brass" type="submit">Créer mon compte</button>
            </form>
            <p className="st-hero-note">Gratuit pendant la phase de test. Vous pouvez aussi <Link to="/demo" style={{ color: 'var(--st-forest)', fontWeight: 600 }}>essayer la démonstration</Link> sans vous inscrire.</p>
          </div>

          <div className="st-stack" aria-hidden="true">
            <div className="st-sheet s1">
              <header><span>DEV-2026-0012</span><b>Accepté</b></header>
              <h3>Signalétique intérieure</h3>
              <table>
                <tbody>
                  <tr><td>Plan de signes</td><td>780 000</td></tr>
                  <tr><td>Fabrication et pose</td><td>2 600 000</td></tr>
                </tbody>
                <tfoot><tr><td>Total TTC</td><td>3 988 400 F</td></tr></tfoot>
              </table>
            </div>
            <div className="st-sheet s2">
              <header><span>FAC-2026-0009</span><b style={{ background: 'var(--st-brass)' }}>Partielle</b></header>
              <h3>Reste à payer</h3>
              <div className="st-bar"><span style={{ width: '40%' }} /></div>
              <small style={{ color: 'var(--st-muted)' }}>1 595 360 F reçus sur 3 988 400 F</small>
            </div>
            <div className="st-sheet s3">
              <header><span>PRJ-002</span><b>45 %</b></header>
              <h3>Suivi du projet</h3>
              <ul className="st-steps-mini">
                <li><i />Relevé des espaces<small>fait</small></li>
                <li><i />Plan de signes<small>fait</small></li>
                <li><i className="now" />Fabrication<small>en cours</small></li>
                <li><i className="todo" />Pose<small>25 nov.</small></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="st-section">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Un seul outil pour suivre chaque dossier client</h2>
            <p>Du premier devis au dernier paiement, l’équipe et le client voient les mêmes informations, chacun selon ses droits.</p>
          </header>
          <div className="st-pills" role="tablist" aria-label="Votre profil">
            {Object.entries(PROFILES).map(([key, item]) => (
              <button key={key} type="button" role="tab" aria-selected={profile === key} className={profile === key ? 'on' : ''} onClick={() => setProfile(key)}>
                <SiteIcon name="check" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="st-checks" role="tabpanel">
            <h3>{current.title}</h3>
            <ul>
              {current.items.map(([text, href]) => (
                <li key={text}><Link to={href}><SiteIcon name="check" />{text}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="st-section tint">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Les modules du portail</h2>
            <p>Six modules reliés entre eux : rien n’est saisi deux fois.</p>
          </header>
          <div className="st-cards">
            {MODULES.map(([title, href, icon, text]) => (
              <Link className="st-card" to={href} key={href}>
                <span className="ico"><SiteIcon name={icon} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="more">En savoir plus →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="st-section">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Le bureau, comme dans l’espace équipe</h2>
            <p>Indicateurs du mois, échéances encore ouvertes et avancement des projets. La même lecture que dans le tableau de bord.</p>
          </header>
          <div className="st-desk" aria-label="Aperçu du tableau de bord">
            <div className="st-kpis">
              <p><span>Facturé</span><strong>4 800 000</strong><small>F CFA · ce mois</small></p>
              <p><span>Encaissé</span><strong>3 100 000</strong><small>F CFA · ce mois</small></p>
              <p><span>Devis</span><strong>{stats ? stats.quotes : '—'}</strong><small>dans la démonstration</small></p>
              <p><span>Projets en cours</span><strong>2</strong><small>avancement publié</small></p>
            </div>
            <div className="st-desk-grid">
              <article>
                <h3>Échéances</h3>
                <table>
                  <thead><tr><th>Pièce</th><th>Client</th><th>Échéance</th><th>Solde</th></tr></thead>
                  <tbody>
                    <tr><td>FAC-2026-0009</td><td>Clinique Les Flamboyants</td><td>18 nov.</td><td>2 393 040</td></tr>
                    <tr><td>FAC-2026-0004</td><td>Maison Olamba</td><td>2 déc.</td><td>890 000</td></tr>
                  </tbody>
                </table>
              </article>
              <article>
                <h3>Projets en cours</h3>
                {[['Signalétique de la clinique', '45'], ['Atelier Louis', '72']].map(([name, value]) => (
                  <p className="st-desk-job" key={name}>
                    <span>{name}<b>{value} %</b></span>
                    <i><em style={{ width: `${value}%` }} /></i>
                  </p>
                ))}
              </article>
            </div>
          </div>
          <p className="st-desk-link"><Link to="/demo">Ouvrir cette lecture dans la démonstration</Link></p>
        </div>
      </section>

      <section className="st-section tint">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Comment ça marche</h2>
          </header>
          <ol className="st-flow">
            <li><strong>Le commercial envoie le devis</strong><span>Lignes, quantités, prix : le total est calculé.</span></li>
            <li><strong>Le client l’accepte en ligne</strong><span>La décision est datée et signée de son nom.</span></li>
            <li><strong>Facture, paiements, projet</strong><span>Le comptable facture, le chef de projet publie l’avancement.</span></li>
          </ol>
        </div>
      </section>

      <section className="st-figures" aria-label="La démonstration en chiffres">
        <div className="st-wrap">
          <p><b>{stats ? stats.quotes : '—'}</b><span>devis</span></p>
          <p><b>{stats ? stats.invoices : '—'}</b><span>factures</span></p>
          <p><b>{stats ? stats.companies : '—'}</b><span>{stats && stats.companies > 1 ? 'entreprises hébergées' : 'entreprise hébergée'}</span></p>
          <p><b>10</b><span>modèles de documents</span></p>
          <small>Devis et factures réalisés sur la plateforme.</small>
        </div>
      </section>

      <section className="st-section">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Pour quels métiers ?</h2>
            <p>Pour les entreprises de services et de travaux qui vendent sur devis.</p>
          </header>
          <div className="st-cards">
            {TRADES.map(([src, title, text, href, meta]) => (
              <Link className="st-card photo" to={href} key={title}>
                <img src={src} alt="" />
                <div>
                  <small>{meta}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </main>
  );
}
