import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { dateInput, money, PROJECT_STATUS, todayISO } from '../format';
import { Gantt } from '../components/Gantt';
import { Banner, Field, Modal, Pill } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const FILTRES = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'cadrage', libelle: 'Cadrage' },
  { valeur: 'en_cours', libelle: 'En cours' },
  { valeur: 'pause', libelle: 'Pause' },
  { valeur: 'livre', libelle: 'Livrés' },
  { valeur: 'clos', libelle: 'Clos' },
];
const SCALES = [['fit', 'Ajusté'], ['week', 'Semaines'], ['month', 'Mois']];

export default function Projects() {
  const navigate = useNavigate();
  const { settings, can, company } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('cartes');
  const [scale, setScale] = useState('fit');
  const [loading, setLoading] = useState(true);
  const [creation, setCreation] = useState(null);
  const [clients, setClients] = useState([]);
  const [equipe, setEquipe] = useState([]);

  function charger(prochainStatut = status) {
    const params = prochainStatut ? `?status=${prochainStatut}` : '';
    setLoading(true);
    api(`/projects${params}`)
      .then(setRows)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { charger(status); }, [status]);

  const filtres = rows.filter((projet) => {
    const mot = query.trim().toLowerCase();
    if (!mot) return true;
    return [projet.name, projet.code, projet.client?.company].join(' ').toLowerCase().includes(mot);
  });
  const liste = useListePaginee(filtres);

  function ouvrirCreation() {
    setCreation({
      client_id: '', manager_id: '', name: '', status: 'cadrage', progress: 0,
      budget: '', start_date: todayISO(), due_date: todayISO(45), description: '',
    });
    if (!clients.length) api('/clients').then(setClients).catch(() => setClients([]));
    if (!equipe.length) api('/team').then(setEquipe).catch(() => setEquipe([]));
  }

  async function creerProjet(event) {
    event.preventDefault();
    setError('');
    try {
      const saved = await api('/projects', {
        method: 'POST',
        body: {
          ...creation,
          client_id: Number(creation.client_id),
          manager_id: creation.manager_id ? Number(creation.manager_id) : null,
          progress: Number(creation.progress || 0),
          budget: Number(creation.budget || 0),
          milestones: [
            { title: 'Cadrage', due_date: '', done: false },
            { title: 'Production', due_date: '', done: false },
            { title: 'Livraison', due_date: '', done: false },
          ],
          tasks: [],
          budget_lines: [],
        },
      });
      setCreation(null);
      navigate(`/projets/${saved.id}`);
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function supprimer(projet) {
    if (!window.confirm(`Supprimer le projet ${projet.name} ?`)) return;
    try {
      await api(`/projects/${projet.id}`, { method: 'DELETE' });
      charger();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head projects-head">
        <div className="titre-avec-info">
          <h1>Projets</h1>
          <IconeInformation titre="Projets" texte="Suivi des chantiers : cartes ou planning. La recherche (nom, code, client) est dans le filtre de statut. Un projet qui porte déjà des factures ne peut pas être supprimé." />
        </div>
        <div className="projects-actions">
          <div className="gx-zoom" role="radiogroup" aria-label="Affichage">
            {[['cartes', 'Cartes'], ['planning', 'Planning']].map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={view === value} className={view === value ? 'on' : ''} onClick={() => setView(value)}>{label}</button>
            ))}
          </div>
          {can('projects') ? <button className="btn btn-primary" type="button" onClick={ouvrirCreation}>Nouveau projet</button> : null}
        </div>
      </header>
      <Banner>{error}</Banner>
      <BarreListe
        libelleFiltre="Statut"
        optionsFiltre={FILTRES}
        filtre={status}
        onFiltre={setStatus}
        recherche={query}
        onRecherche={setQuery}
        placeholderRecherche="Nom, code, client"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={loading}
        onActualiser={() => charger()}
      />
      <div className="projects-bar">
        {view === 'planning' ? (
          <div className="projects-scale">
            <div className="gx-zoom" role="radiogroup" aria-label="Échelle">
              {SCALES.map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={scale === value} className={scale === value ? 'on' : ''} onClick={() => setScale(value)}>{label}</button>
              ))}
            </div>
            <ul className="gx-legend">
              <li><i className="lg-run" />En cours</li>
              <li><i className="lg-done" />Terminé</li>
              <li><i className="lg-late" />En retard</li>
            </ul>
          </div>
        ) : null}
      </div>
      {view === 'planning' ? (
        <section className="card gantt-card projects-plan">
          {loading ? <ChargementPourcentage actif libelle="Chargement des projets" /> : (
            <Gantt
              label="Projet"
              tools={false}
              zoom={scale}
              emptyText="Renseignez les dates de début et de fin des projets pour les voir sur le planning."
              tasks={filtres.map((project) => ({
                title: project.name,
                staff_name: project.client?.company,
                start_date: dateInput(project.start_date),
                end_date: dateInput(project.due_date),
                progress: project.progress,
              }))}
            />
          )}
        </section>
      ) : loading ? (
        <section className="card"><ChargementPourcentage actif libelle="Chargement des projets" /></section>
      ) : (
      <>
      <div className="project-grid">
        {liste.visibles.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <span className="muted">{project.code}</span>
              <Pill status={project.status} map={PROJECT_STATUS} />
            </div>
            <h3>{project.name}</h3>
            {!company && project.company?.name ? <p className="muted">{project.company.name}</p> : null}
            <p className="muted">{project.client?.company}</p>
            <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <span>{project.progress} %</span>
              <span>{money(project.budget, settings?.currency)}</span>
            </div>
            <ActionsLigne
              onVoir={() => navigate(`/projets/${project.id}`)}
              onModifier={can('projects') ? () => navigate(`/projets/${project.id}`) : null}
              onSupprimer={can('projects') ? () => supprimer(project) : null}
            />
          </article>
        ))}
      </div>
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
      </>
      )}
      {creation ? (
        <Modal title="Nouveau projet" onClose={() => setCreation(null)} wide>
          <form className="stack" onSubmit={creerProjet}>
            {!company ? <p className="muted">Choisissez une entreprise dans le menu du haut. La vue « Toutes les entreprises » sert à consulter.</p> : null}
            <div className="fields">
              <Field label="Client" wide>
                <select value={creation.client_id} onChange={(event) => setCreation({ ...creation, client_id: event.target.value })} required>
                  <option value="">Choisir</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}
                </select>
              </Field>
              <Field label="Chef de projet">
                <select value={creation.manager_id} onChange={(event) => setCreation({ ...creation, manager_id: event.target.value })}>
                  <option value="">Moi, par défaut</option>
                  {equipe.map((membre) => <option key={membre.id} value={membre.id}>{membre.name}</option>)}
                </select>
              </Field>
              <Field label="Nom" wide><input value={creation.name} onChange={(event) => setCreation({ ...creation, name: event.target.value })} required /></Field>
              <Field label="Statut">
                <select value={creation.status} onChange={(event) => setCreation({ ...creation, status: event.target.value })}>
                  {Object.entries(PROJECT_STATUS).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
                </select>
              </Field>
              <Field label="Budget"><input type="number" min="0" value={creation.budget} onChange={(event) => setCreation({ ...creation, budget: event.target.value })} /></Field>
              <Field label="Début"><input type="date" value={creation.start_date} onChange={(event) => setCreation({ ...creation, start_date: event.target.value })} /></Field>
              <Field label="Fin visée"><input type="date" value={creation.due_date} onChange={(event) => setCreation({ ...creation, due_date: event.target.value })} /></Field>
              <Field label="Description" wide><textarea value={creation.description} onChange={(event) => setCreation({ ...creation, description: event.target.value })} /></Field>
            </div>
            <button className="btn btn-primary" type="submit">Créer le projet</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
