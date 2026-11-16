import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { DEMO_ACCOUNTS } from './site/data';
import { PageBanner, PageBody, PageCta, SiteIcon } from './site/SiteParts';

export { Home } from './Landing';
export { SiteLayout } from './site/SiteParts';

/* ------------------------------------------------------------------
   Fonctionnalités
   ------------------------------------------------------------------ */
const FEATURES = [
  {
    id: 'devis',
    label: 'Devis',
    title: 'Créer, envoyer et faire valider un devis',
    text: 'Le responsable commercial choisit le client, ajoute les prestations avec leurs quantités et prix unitaires. Le total, la remise et la TVA sont calculés automatiquement. Le devis reçoit une référence unique, puis passe de brouillon à envoyé ; le client l’accepte ou le refuse depuis son espace.',
    tags: ['Nomade', 'Ligne', 'Canopée', 'Soleil', 'Chantier', 'Impression', 'PDF'],
    mock: 'quote',
  },
  {
    id: 'factures',
    label: 'Factures',
    title: 'Facturer un devis accepté et suivre les paiements',
    text: 'Le comptable génère la facture à partir du devis accepté : les lignes, la remise et la TVA sont reprises sans ressaisie. Chaque paiement est enregistré avec son montant, sa date et son mode. Le reste à payer et le statut de la facture se mettent à jour.',
    tags: ['Cèdre', 'Artisans', 'Csmart', 'Atelier', 'Iris', 'Virement', 'Mobile money', 'Espèces'],
    mock: 'invoice',
  },
  {
    id: 'projets',
    label: 'Projets',
    title: 'Étapes, tâches et avancement',
    text: 'Le chef de projet crée le projet, l’associe à un client et définit ses étapes et ses dates. Les tâches assignées dessinent un diagramme de Gantt. À chaque point d’étape, il publie le pourcentage d’avancement, l’état du projet et un commentaire de suivi.',
    tags: ['Étapes', 'Gantt', 'Budget prévu / dépensé', 'Journal de suivi'],
    mock: 'gantt',
  },
  {
    id: 'clients',
    label: 'Clients',
    title: 'Une fiche par client',
    text: 'Coordonnées, contact, statut (prospect, actif, en veille) et historique : chaque fiche regroupe les devis, les factures et les projets du client. La recherche trouve un client par nom, ville ou code.',
    tags: ['Recherche', 'Historique', 'Chiffre d’affaires', 'Encaissé'],
    mock: 'client',
  },
  {
    id: 'espace-client',
    label: 'Espace client',
    title: 'Le client consulte et décide en ligne',
    text: 'Avec son compte, le client voit ses devis, ses factures et l’avancement de ses projets. Il accepte ou refuse un devis envoyé ; la date et l’auteur de la décision sont enregistrés. Il ne voit jamais les brouillons ni les données des autres clients.',
    tags: ['Accepter / refuser', 'Reste à payer', 'Suivi des projets'],
    mock: 'portal',
  },
  {
    id: 'pilotage',
    label: 'Tableau de bord',
    title: 'Les indicateurs du mois',
    text: 'Montant facturé, paiements reçus, devis en attente de décision, projets en cours et factures en retard. Le tableau de bord liste aussi les devis à relancer et les dernières opérations.',
    tags: ['Facturé', 'Encaissé', 'Retards', 'Relances'],
    mock: 'dash',
  },
];

const ROLES = [
  ['Administrateur', 'Gère les comptes utilisateurs et les droits d’accès', 'Tous les modules'],
  ['Responsable commercial', 'Gère les clients, prépare et envoie les devis', 'Clients, devis'],
  ['Comptable', 'Génère les factures, enregistre les paiements', 'Factures, paiements'],
  ['Chef de projet', 'Crée les projets, définit les étapes, publie l’avancement', 'Projets, personnel'],
  ['Client', 'Consulte ses devis, factures et projets ; valide les devis', 'Son espace uniquement'],
];

function FeatureMock({ kind }) {
  if (kind === 'quote' || kind === 'invoice') {
    return (
      <div className="mock">
        <header><b>{kind === 'quote' ? 'DEV-2026-0012' : 'FAC-2026-0009'}</b><span>{kind === 'quote' ? 'Envoyé' : 'Partielle'}</span></header>
        <div className="r"><span>Plan de signes</span><span>780 000</span></div>
        <div className="r"><span>Fabrication et pose</span><span>2 600 000</span></div>
        <div className="r"><span>TVA 18 %</span><span>608 400</span></div>
        <div className="r total"><span>Total TTC</span><span>3 988 400 F</span></div>
        {kind === 'invoice' ? <div className="r"><span>Reste à payer</span><span className="badge">2 393 040 F</span></div> : null}
      </div>
    );
  }
  if (kind === 'gantt') {
    return (
      <div className="mock">
        <header><b>Signalétique de la clinique</b><span>45 %</span></header>
        {[['Relevé', 100], ['Plan de signes', 100], ['Fabrication', 40], ['Pose', 0]].map(([name, value]) => (
          <div className="g" key={name}><em>{name}</em><span><i style={{ width: `${value}%` }} /></span></div>
        ))}
      </div>
    );
  }
  if (kind === 'client') {
    return (
      <div className="mock">
        <header><b>Clinique Les Flamboyants</b><span>CLI-002</span></header>
        <div className="r"><span>Devis</span><span>3</span></div>
        <div className="r"><span>Factures</span><span>2</span></div>
        <div className="r"><span>Projets</span><span>1</span></div>
        <div className="r total"><span>Facturé</span><span>5 758 400 F</span></div>
      </div>
    );
  }
  if (kind === 'portal') {
    return (
      <div className="mock">
        <header><b>Un devis attend votre réponse</b></header>
        <div className="r"><span>DEV-2026-0003</span><span>3 988 400 F</span></div>
        <div className="r"><span>Validité</span><span>15 nov. 2026</span></div>
        <div className="r total"><span>Refuser</span><span className="badge">Accepter le devis</span></div>
      </div>
    );
  }
  return (
    <div className="mock">
      <header><b>Novembre 2026</b><span>Tableau de bord</span></header>
      <div className="r"><span>Facturé</span><span>4 800 000</span></div>
      <div className="r"><span>Encaissé</span><span>3 100 000</span></div>
      <div className="r"><span>Devis en attente</span><span>3</span></div>
      <div className="r"><span>Factures en retard</span><span className="badge">1</span></div>
    </div>
  );
}

export function Features() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const current = FEATURES.find((item) => `#${item.id}` === hash) || FEATURES[0];

  return (
    <main>
      <PageBanner title="Fonctionnalités" lead="Les modules du portail et ce que chaque rôle peut y faire." />
      <PageBody>
        <p>
          DOUKOU regroupe dans une seule base les clients, les devis, les factures, les paiements et les projets.
          Chaque utilisateur se connecte avec son compte et n’accède qu’aux fonctions de son rôle.
        </p>
        <div className="st-tabs" role="tablist" aria-label="Modules">
          {FEATURES.map((item) => (
            <button
              key={item.id}
              id={item.id}
              type="button"
              role="tab"
              aria-selected={current.id === item.id}
              className={current.id === item.id ? 'on' : ''}
              onClick={() => navigate(`#${item.id}`, { replace: true, state: { keepScroll: true } })}
            >
              {item.label}
            </button>
          ))}
        </div>
        <article className="st-feature" role="tabpanel">
          <div>
            <h2>{current.title}</h2>
            <p>{current.text}</p>
            <ul className="st-tags">{current.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          </div>
          <FeatureMock kind={current.mock} />
        </article>

        <h2 id="roles">Rôles et droits d’accès</h2>
        <p>Tous les membres de l’équipe consultent l’ensemble des informations. Chacun ne modifie que son module ; le client ne voit que ses propres documents.</p>
        <div className="st-table-wrap">
          <table className="st-role-table">
            <thead><tr><th>Rôle</th><th>Responsabilités</th><th>Peut modifier</th></tr></thead>
            <tbody>
              {ROLES.map(([role, text, scope]) => (
                <tr key={role}><th>{role}</th><td>{text}</td><td>{scope}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageBody>
      <PageCta />
    </main>
  );
}

/* ------------------------------------------------------------------
   Secteurs
   ------------------------------------------------------------------ */
export function Sectors() {
  const sectors = [
    ['artisans', '/home/metier-platre.jpg', 'Artisans', 'Un devis, un acompte, des travaux avec des dates. Le devis accepté devient la facture, les paiements partiels sont suivis et le client voit l’avancement sans téléphoner.'],
    ['agences', '/home/metier-peinture.jpg', 'Agences et bureaux', 'Plusieurs clients en parallèle, chacun avec ses devis, ses factures et ses projets. Le tableau de bord montre les devis à relancer et les factures en retard.'],
    ['btp', '/home/metier-plomberie.jpg', 'BTP et chantiers', 'Étapes, budget prévu et dépensé, planning des équipes. Le Gantt montre qui fait quoi entre le début et la fin prévue du chantier.'],
    ['independants', '/home/pro-chantier.jpg', 'Indépendants', 'Un compte individuel suffit pour commencer. Vous pourrez ajouter une ou plusieurs entreprises et passer de l’une à l’autre.'],
  ];
  return (
    <main>
      <PageBanner title="Secteurs" lead="Pour les entreprises de services et de travaux qui vendent sur devis." />
      <PageBody>
        <p>Les besoins changent d’un métier à l’autre, mais le circuit reste le même : un devis, une décision, une facture, des paiements et un projet à suivre.</p>
        <div className="st-grid" style={{ gridTemplateColumns: '1fr' }}>
          {sectors.map(([id, src, title, text]) => (
            <article className="st-sector" id={id} key={id}>
              <img src={src} alt="" />
              <div>
                <h2>{title}</h2>
                <p>{text}</p>
                <p style={{ marginTop: 12 }}><Link to="/inscription" style={{ color: 'var(--st-forest)', fontWeight: 600 }}>Créer un compte</Link></p>
              </div>
            </article>
          ))}
        </div>
      </PageBody>
      <PageCta />
    </main>
  );
}

/* ------------------------------------------------------------------
   Démonstration
   ------------------------------------------------------------------ */

export function Demo() {
  return (
    <main>
      <PageBanner title="Démonstration" lead="Un compte par rôle, sur la même entreprise de démonstration." />
      <PageBody>
        <p>
          L’entreprise de démonstration contient déjà des clients, des devis, des factures et des projets.
          Connectez-vous avec l’un des comptes ci-dessous. Le mot de passe est le même pour tous : <strong>Cedre2026!</strong>
        </p>
        <div className="st-grid">
          {DEMO_ACCOUNTS.map(([name, role, text, mail]) => (
            <article className="st-demo" key={mail}>
              <small>{role}</small>
              <h3>{name}</h3>
              <p>{text}</p>
              <code>{mail}</code>
            </article>
          ))}
        </div>
        <h2>Un parcours à essayer</h2>
        <ul>
          <li>Avec <strong>Hervé Mba</strong> (client), ouvrez le devis en attente et acceptez-le.</li>
          <li>Avec <strong>Léa Nguema</strong> (comptable), générez la facture de ce devis et enregistrez un paiement.</li>
          <li>Avec <strong>Yannick Ondo</strong> (chef de projet), publiez une mise à jour d’avancement sur le projet de la clinique.</li>
          <li>Revenez avec le compte client : la facture et le suivi apparaissent dans son espace.</li>
        </ul>
        <p><Link className="st-btn" to="/login">Se connecter à la démo <SiteIcon name="arrow" /></Link></p>
      </PageBody>
    </main>
  );
}

/* ------------------------------------------------------------------
   Tarifs
   ------------------------------------------------------------------ */
export function Pricing() {
  const plans = [
    ['Solo', 'Compte individuel', ['Une entreprise', 'Clients, devis, factures, projets', 'Modèles de documents et PDF'], false],
    ['Équipe', 'Plusieurs utilisateurs', ['Comptes par rôle', 'Espace client pour vos clients', 'Journal des opérations'], true],
    ['Multi', 'Plusieurs entreprises', ['Plusieurs entreprises sous un compte', 'Sélecteur d’entreprise', 'Statistiques par entreprise'], false],
  ];
  return (
    <main className="st-plans-page">
      <div className="st-wrap">
        <h1>Explorer les formules</h1>
        <p>Pendant la phase de test, toutes les fonctions sont ouvertes sans frais.</p>
        <div className="st-plans">
          {plans.map(([title, line, items]) => (
            <article className="st-plan" key={title}>
              <h2>{title}</h2>
              <small>{line}</small>
              <span className="price">Gratuit</span>
              <Link className="st-btn block" to="/inscription">Créer un compte</Link>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className="st-plans-note">Une question sur les conditions ? <Link to="/contact">Écrivez-nous</Link>.</p>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------
   Conseils et FAQ
   ------------------------------------------------------------------ */
const FAQ = [
  ['Qu’est-ce que DOUKOU ?', 'Un portail web de gestion des devis, des factures et du suivi des projets clients. DOUKOU veut dire « suivre » en nzebi.'],
  ['Faut-il installer quelque chose ?', 'Non. Le portail fonctionne dans le navigateur, sur ordinateur comme sur téléphone.'],
  ['Mes clients peuvent-ils se connecter ?', 'Oui. L’administrateur crée un compte client rattaché à la fiche du client. Le client consulte alors ses devis, ses factures et ses projets, et accepte ou refuse les devis envoyés.'],
  ['Peut-on modifier un devis après envoi ?', 'Oui tant qu’il n’est pas facturé. Un devis refusé ne peut pas être transformé en facture, et un devis facturé ne peut plus être refusé.'],
  ['Comment choisir le modèle de devis ou de facture ?', 'Cinq modèles sont proposés dans l’écran du devis ou de la facture. Le document reprend les coordonnées de l’entreprise, du client, les lignes et les totaux, et s’imprime ou s’enregistre en PDF.'],
  ['Une personne peut-elle gérer plusieurs entreprises ?', 'Oui. Depuis l’écran Entreprises, on en crée d’autres et on passe de l’une à l’autre avec le sélecteur en haut de page.'],
];

export function Advice() {
  return (
    <main>
      <PageBanner title="Conseils d’utilisation" crumb="Ressources" lead="Quelques habitudes pour tirer le meilleur parti du portail." />
      <PageBody>
        <h2>Envoyer le devis avant de facturer</h2>
        <p>Un devis passe par les états brouillon, envoyé, puis accepté ou refusé. Seul un devis accepté peut être transformé en facture : marquez-le comme envoyé dès qu’il part chez le client.</p>
        <h2>Dater les tâches des projets</h2>
        <p>Une tâche sans date de début et de fin n’apparaît pas dans le diagramme de Gantt. Renseignez aussi la personne responsable pour savoir qui relancer.</p>
        <h2>Publier l’avancement chaque semaine</h2>
        <p>Une mise à jour courte, avec un pourcentage et une phrase de commentaire, évite au client de devoir appeler pour savoir où en est son projet.</p>
        <h2>Enregistrer les paiements le jour même</h2>
        <p>Le reste à payer et la liste des factures en retard ne sont justes que si chaque paiement est saisi avec sa date et son mode.</p>
      </PageBody>
      <section className="st-faq-page" id="faq">
        <div className="st-wrap">
          <h2>FAQ</h2>
          <div className="st-faq">
            {FAQ.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <PageCta />
    </main>
  );
}

/* ------------------------------------------------------------------
   Vision et À propos
   ------------------------------------------------------------------ */
export function Vision() {
  return (
    <main>
      <PageBanner title="Pourquoi DOUKOU" crumb="Ressources" lead="Remplacer des fichiers dispersés par un outil commun." />
      <PageBody>
        <h2>Le constat</h2>
        <p>Dans beaucoup de petites entreprises, les devis et les factures sont rédigés sous Word ou Excel, les échanges avec les clients passent par l’e-mail, la messagerie ou le téléphone, et le suivi des paiements tient dans un tableau à part.</p>
        <p>Résultat : des saisies répétées, des versions qui se contredisent, des factures restant à payer difficiles à repérer, et des clients obligés d’appeler pour connaître l’état de leur projet.</p>
        <h2>Ce que DOUKOU change</h2>
        <ul>
          <li><strong>Moins de ressaisie</strong> : le devis accepté devient la facture, sans recopier les lignes.</li>
          <li><strong>Une seule base</strong> : clients, devis, factures, paiements et projets au même endroit.</li>
          <li><strong>Des accès par rôle</strong> : chacun voit ce qui le concerne et ne modifie que son module.</li>
          <li><strong>Un client autonome</strong> : il consulte ses documents et l’avancement sans avoir à demander.</li>
        </ul>
      </PageBody>
      <PageCta />
    </main>
  );
}

export function About() {
  return (
    <main>
      <section className="st-about">
        <div className="st-about-copy">
          <h1>À propos</h1>
          <p>DOUKOU est un portail web de gestion des devis, des factures et du suivi des projets clients, réalisé dans le cadre d’un projet de stage à Libreville. DOUKOU veut dire « suivre » en nzebi.</p>
          <p>Il s’adresse aux petites entreprises de services et de travaux qui gèrent aujourd’hui ces informations dans plusieurs fichiers séparés, et à leurs clients, qui peuvent suivre leurs dossiers en ligne.</p>
          <h2>La technique</h2>
          <p>Une API Laravel avec une base PostgreSQL, une interface React, et des accès sécurisés par rôle. Chaque entreprise a ses propres données, séparées de celles des autres.</p>
          <Link className="st-btn ghost" to="/vision">Lire la suite</Link>
        </div>
        <figure>
          <img src="/home/bandeau-equipe.jpg" alt="Deux artisans dans un jardin, à Libreville" />
        </figure>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------
   Contact
   ------------------------------------------------------------------ */
const SUBJECTS = [
  ['demo', 'Demande de démonstration'],
  ['tarifs', 'Question sur les tarifs'],
  ['support', 'Aide sur le portail'],
  ['partenariat', 'Partenariat'],
  ['autre', 'Autre demande'],
];

const EMPTY_CONTACT = { name: '', email: '', phone: '', subject: 'demo', message: '', website: '' };

export function Contact() {
  const [form, setForm] = useState(EMPTY_CONTACT);
  const [status, setStatus] = useState({ pending: false, error: '', done: '' });

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ pending: true, error: '', done: '' });
    try {
      const data = await api('/contact', { method: 'POST', body: form });
      setForm(EMPTY_CONTACT);
      setStatus({ pending: false, error: '', done: data.message });
    } catch (err) {
      setStatus({ pending: false, error: errorText(err), done: '' });
    }
  }

  return (
    <main>
      <PageBanner title="Contact" />
      <PageBody>
        <p>Vous souhaitez une démonstration, une précision sur les tarifs ou un accompagnement pour démarrer avec DOUKOU ? Écrivez-nous avec le formulaire ci-dessous.</p>
        <p>Vous utilisez déjà le portail et vous avez besoin d’aide ? Choisissez l’objet <strong>« Aide sur le portail »</strong> et indiquez le nom de votre entreprise.</p>
        <p>Nous vous répondons <strong>par e-mail</strong>, à l’adresse que vous indiquez.</p>

        <div className="st-form-card">
          <form className="st-form" onSubmit={submit} noValidate={false}>
            {status.done ? <div className="st-alert ok" role="status">{status.done}</div> : null}
            {status.error ? <div className="st-alert err" role="alert">{status.error}</div> : null}
            <input aria-label="Nom complet" placeholder="Nom complet" value={form.name} onChange={(event) => set('name', event.target.value)} required maxLength={120} autoComplete="name" />
            <div className="row">
              <input aria-label="E-mail" type="email" placeholder="E-mail" value={form.email} onChange={(event) => set('email', event.target.value)} required maxLength={180} autoComplete="email" />
              <input aria-label="Téléphone (facultatif)" placeholder="Téléphone (facultatif)" value={form.phone} onChange={(event) => set('phone', event.target.value)} maxLength={40} autoComplete="tel" />
            </div>
            <select aria-label="Objet" value={form.subject} onChange={(event) => set('subject', event.target.value)}>
              {SUBJECTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className="st-hp" aria-hidden="true">
              Site web
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => set('website', event.target.value)} />
            </label>
            <textarea aria-label="Votre message" placeholder="Votre message" value={form.message} onChange={(event) => set('message', event.target.value.slice(0, 1000))} required minLength={10} maxLength={1000} />
            <span className="st-count">{form.message.length} sur 1000</span>
            <button className="st-btn" type="submit" disabled={status.pending}>
              {status.pending ? 'Envoi…' : 'Envoyer le message'} <SiteIcon name="send" />
            </button>
          </form>
        </div>
        <p className="st-note">Les informations saisies servent uniquement à répondre à votre demande.</p>
      </PageBody>
    </main>
  );
}
