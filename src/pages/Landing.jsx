import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { MODULES } from './site/data';
import { PageCta, SiteIcon } from './site/SiteParts';

const PROFILES = {
  entreprise: {
    label: 'Je tiens l’entreprise',
    title: 'On commence par le compte, le reste suit.',
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
    label: 'Je suis le client',
    title: 'Vous voyez où en est votre dossier, sans avoir à appeler.',
    items: [
      ['Se connecter avec le compte fourni par votre prestataire', '/login'],
      ['Consulter vos devis et les accepter ou les refuser en ligne', '/fonctionnalites#espace-client'],
      ['Voir vos factures, ce qui est payé et ce qui reste à payer', '/fonctionnalites#espace-client'],
      ['Suivre l’avancement et les étapes de vos projets', '/fonctionnalites#espace-client'],
      ['Imprimer ou enregistrer vos documents en PDF', '/fonctionnalites#devis'],
    ],
  },
};

const WASHES = ['sage', 'sand', 'leaf', 'mist', 'foam', 'ink'];

const TRADES = [
  ['/home/metier-platre.jpg', 'Artisans', 'Le devis part, l’acompte est suivi, et le client voit les étapes.', '/secteurs#artisans', 'Menuiserie, plâtrerie'],
  ['/home/metier-peinture.jpg', 'Agences et bureaux', 'Plusieurs clients, chacun avec son dossier, sans les mélanger.', '/secteurs#agences', 'Conseil, communication'],
  ['/home/metier-plomberie.jpg', 'BTP et chantiers', 'Les dates, le budget et le planning tiennent sur la même page.', '/secteurs#btp', 'Gros œuvre, réseaux'],
];

export function Home() {
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState('entreprise');

  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats(null));
  }, []);

  const current = PROFILES[profile];

  return (
    <main>
      <section className="st-hero">
        <div className="st-wrap">
          <div>
            <p className="st-hello">DOUKOU</p>
            <h1>Vos devis, vos factures et vos projets, au même endroit.</h1>
            <p className="st-hero-lead">Vous préparez le devis. Votre client le lit et répond. La facture, les paiements et le chantier restent dans le même dossier.</p>
            <div className="st-hero-actions">
              <Link className="st-btn" to="/demo">Regarder la démo</Link>
              <Link className="st-btn ghost" to="/inscription">Essayer gratuitement</Link>
            </div>
            <p className="st-hero-note">Rien à installer. C’est gratuit pendant la phase de test.</p>
          </div>

          <figure className="st-shot">
            <span className="st-rings" aria-hidden="true" />
            <img src="/home/hero-atelier.jpg" alt="Artisan au travail dans son atelier" />
            <Link className="st-play" to="/demo" aria-label="Regarder la démonstration">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" /></svg>
            </Link>
            <span className="st-dots" aria-hidden="true" />
          </figure>
        </div>
      </section>

      <section className="st-stage">
        <div className="st-wrap st-stage-grid">
          <div>
            <p className="st-kicker">Votre place</p>
            <h2>Dites-nous de quel côté vous êtes</h2>
            <p className="st-hero-lead">L’entreprise prépare le dossier. Le client le consulte et répond. Chacun voit ce qui le concerne.</p>
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
          <div className="st-plinth" aria-hidden="true">
            <div className="st-stack">
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
                <header><span>FAC-2026-0009</span><b>Partielle</b></header>
                <h3>Reste à payer</h3>
                <div className="st-bar"><span style={{ width: '40%' }} /></div>
                <small>1 595 360 F reçus sur 3 988 400 F</small>
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
        </div>
      </section>

      <section className="st-section tint">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Tout ce qui tient dans un dossier</h2>
            <p>Six portes, reliées. Une ligne saisie sur le devis n’est pas retapée sur la facture.</p>
          </header>
          <div className="st-cards st-services">
            {MODULES.map(([title, href, icon, text], index) => (
              <Link className="st-card" to={href} key={href}>
                <span className={`ico ${WASHES[index % WASHES.length]}`}><SiteIcon name={icon} /></span>
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
            <h2>Ce que l’équipe voit en arrivant</h2>
            <p>Le mois en cours, les factures encore ouvertes, et les chantiers qui avancent. C’est le tableau de bord, en plus simple.</p>
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
          <p className="st-desk-link"><Link to="/demo">Entrer et regarder par vous-même</Link></p>
        </div>
      </section>

      <section className="st-section tint">
        <div className="st-wrap">
          <header className="st-section-title">
            <h2>Comment ça marche</h2>
          </header>
          <ol className="st-flow">
            <li><strong>Le devis part</strong><span>Les lignes et le total sont déjà calculés.</span></li>
            <li><strong>Le client répond</strong><span>Il accepte ou refuse, depuis son espace.</span></li>
            <li><strong>Le chantier suit</strong><span>La facture, les paiements et le planning restent liés.</span></li>
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
            <h2>Pour qui ?</h2>
            <p>Les ateliers, les bureaux et les chantiers qui vendent un travail sur devis.</p>
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
