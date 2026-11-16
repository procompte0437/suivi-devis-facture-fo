import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useSiteImages } from '../siteImages';
import { SiteIcon } from './site/SiteParts';

/* Accueil : même enchaînement de sections que le site d'it-corp, avec les contenus de DOUKOU. */

const SLIDES = [
  {
    title: 'Suivre chaque dossier, du devis au paiement',
    text: 'Devis, factures, paiements et projets réunis dans un seul espace, pour votre équipe comme pour vos clients.',
    slot: 'hero_1',
    primary: ['En savoir plus', '/fonctionnalites'],
  },
  {
    title: 'Un planning de chantier vivant',
    text: 'Tâches par personne, jalons et diagramme de Gantt : déplacez une tâche, la fin du projet se recalcule.',
    slot: 'hero_2',
    primary: ['Voir le planning', '/fonctionnalites#projets'],
  },
  {
    title: 'Vos clients suivent en ligne',
    text: 'Ils consultent leurs devis, les acceptent et voient l’avancement de leurs projets, sans avoir à vous appeler.',
    slot: 'hero_3',
    primary: ['Espace client', '/login'],
  },
];

const TEMPLATES = ['Nomade', 'Ligne', 'Canopée', 'Soleil', 'Chantier', 'Cèdre', 'Artisans', 'Csmart', 'Atelier', 'Iris'];

const SERVICES = [
  ['doc', 'Devis', '/fonctionnalites#devis', ['Création en quelques lignes', 'TVA et remise calculées', 'Cinq modèles au choix', 'Acceptation en ligne']],
  ['bill', 'Factures et paiements', '/fonctionnalites#factures', ['Facture tirée du devis', 'Paiements partiels', 'Reste à payer suivi', 'Retards signalés']],
  ['layers', 'Projets et planning', '/fonctionnalites#projets', ['Étapes et jalons', 'Tâches par personne', 'Gantt interactif', 'Journal d’avancement']],
  ['people', 'Clients', '/fonctionnalites#clients', ['Une fiche par client', 'Recherche rapide', 'Historique des pièces', 'Prospect, actif, en veille']],
  ['user', 'Espace client', '/fonctionnalites#espace-client', ['Devis à valider', 'Factures et paiements', 'Avancement des projets', 'Documents en PDF']],
  ['chart', 'Pilotage', '/fonctionnalites#pilotage', ['Indicateurs du mois', 'Budget prévu et dépensé', 'Charge de l’équipe', 'Plusieurs entreprises']],
];

const SECTORS = [
  ['tools', 'Artisans', '/secteurs#artisans'],
  ['briefcase', 'Agences et bureaux', '/secteurs#agences'],
  ['helmet', 'BTP et chantiers', '/secteurs#btp'],
  ['user', 'Indépendants', '/secteurs#independants'],
];

export function Home() {
  const [stats, setStats] = useState(null);
  const images = useSiteImages();

  useEffect(() => {
    api('/stats').then(setStats).catch(() => setStats(null));
  }, []);

  const figures = [
    [stats ? stats.quotes : '—', 'devis réalisés'],
    [stats ? stats.invoices : '—', 'factures émises'],
    [stats ? stats.companies : '—', stats && stats.companies > 1 ? 'entreprises hébergées' : 'entreprise hébergée'],
    ['10', 'modèles de documents'],
    ['6', 'modules reliés'],
    ['5', 'rôles d’accès'],
    ['4', 'secteurs d’activité'],
    ['0', 'logiciel à installer'],
  ];

  return (
    <main className="ic">
      <Hero />

      <section className="ic-help">
        <div className="st-wrap">
          <SectionTitle title="Comment pouvons-nous vous aider ?">
            DOUKOU réunit tout ce qu’il faut pour vendre, facturer et livrer un travail sur devis. Quel que soit votre métier,
            chaque module est relié aux autres : rien n’est saisi deux fois.
          </SectionTitle>
          <div className="ic-services">
            {SERVICES.map(([icon, title, href, items]) => (
              <article className="ic-service" key={title}>
                <span className="ic-badge" aria-hidden="true"><SiteIcon name={icon} /></span>
                <h3>{title}</h3>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                <Link className="st-btn gold" to={href}>Découvrir</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ic-trust">
        <div className="st-wrap">
          <SectionTitle title="La plateforme en chiffres">
            Ces chiffres viennent directement de la plateforme : devis et factures réalisés, entreprises hébergées,
            et tout ce que chaque compte trouve en ouvrant son espace.
          </SectionTitle>
          <div className="ic-figures">
            {figures.map(([value, label]) => (
              <p key={label}><b>{value}</b><span>{label}</span></p>
            ))}
          </div>
          <p className="ic-center"><Link className="st-btn gold" to="/demo">Voir la démonstration</Link></p>
        </div>
      </section>

      <section className="ic-sectors">
        <div className="st-wrap">
          <SectionTitle title="Des solutions adaptées à votre métier">
            Artisans, agences, entreprises du BTP ou indépendants : le circuit reste le même — un devis, une décision,
            une facture, des paiements et un projet à suivre.
          </SectionTitle>
          <Carousel className="ic-sector-track" label="Secteurs">
            {SECTORS.map(([icon, title, href]) => (
              <Link className="ic-sector" to={href} key={title} role="listitem">
                <span aria-hidden="true"><SiteIcon name={icon} /></span>
                <b>{title}</b>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="ic-project">
        <div className="st-wrap">
          <div>
            <h2>Vous gérez des devis et des projets ?</h2>
            <p>Décrivez votre activité en quelques mots et recevez gratuitement une démonstration adaptée à votre métier.</p>
            <Link className="st-btn gold" to="/contact">Demander une démonstration</Link>
          </div>
          <img src={images.project_cta.src} alt={images.project_cta.alt} />
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, children }) {
  return (
    <header className="ic-title">
      <h2>{title}</h2>
      <i aria-hidden="true" />
      <p>{children}</p>
    </header>
  );
}

function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Défilement automatique des trois vues, en pause au survol ou si l'on préfère moins d'animations.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % SLIDES.length), 6500);
    return () => clearInterval(timer);
  }, [paused]);

  const images = useSiteImages();
  const slide = SLIDES[index];
  const photo = images[slide.slot];

  return (
    <section className="ic-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carrousel" aria-label="Présentation">
      <div className="ic-hero-band" aria-hidden="true" />
      <div className="st-wrap ic-hero-grid">
        <div className="ic-hero-copy">
          <div className="ic-slide" key={index} aria-live="polite">
            <h1>{slide.title}</h1>
            <p>{slide.text}</p>
            <div className="ic-hero-actions">
              <Link className="st-btn" to={slide.primary[1]}>{slide.primary[0]}</Link>
              <Link className="st-btn light" to="/contact">Nous contacter</Link>
            </div>
          </div>
          <div className="ic-dots" role="tablist" aria-label="Choisir une vue">
            {SLIDES.map((item, i) => (
              <button key={item.title} type="button" role="tab" aria-selected={i === index} aria-label={`Vue ${i + 1} : ${item.title}`} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} />
            ))}
          </div>
          <div className="ic-models">
            <h2>Nos modèles de documents</h2>
            <Carousel className="ic-model-track" label="Modèles de documents">
              {TEMPLATES.map((name, i) => (
                <span className="ic-model" key={name} role="listitem">
                  <small>{i < 5 ? 'Devis' : 'Facture'}</small>
                  <b>{name}</b>
                </span>
              ))}
            </Carousel>
          </div>
        </div>
        <figure className="ic-hero-photo">
          <img key={photo.src} src={photo.src} alt={photo.alt} />
        </figure>
      </div>
    </section>
  );
}

function Carousel({ className, label, children }) {
  const track = useRef(null);
  function move(direction) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.max(160, element.clientWidth * 0.7), behavior: 'smooth' });
  }
  return (
    <div className="ic-carousel">
      <button type="button" className="ic-arrow" aria-label="Précédent" onClick={() => move(-1)}>‹</button>
      <div className={className} ref={track} role="list" aria-label={label}>
        {children}
      </div>
      <button type="button" className="ic-arrow" aria-label="Suivant" onClick={() => move(1)}>›</button>
    </div>
  );
}
