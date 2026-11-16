import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { dateInput, money, PROJECT_STATUS } from '../format';
import { Gantt } from '../components/Gantt';
import { Banner, Pill } from '../components/ui';

const FILTERS = [['', 'Tous'], ['cadrage', 'Cadrage'], ['en_cours', 'En cours'], ['pause', 'Pause'], ['livre', 'Livrés'], ['clos', 'Clos']];

export default function Projects() {
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('cartes');

  useEffect(() => {
    const params = status ? `?status=${status}` : '';
    api(`/projects${params}`).then(setRows).catch((err) => setError(errorText(err)));
  }, [status]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Gestion</p>
          <h1>Projets</h1>
          <p className="lead">Étapes, avancement et dates prévues de chaque projet.</p>
        </div>
        {can('projects') ? <button className="btn btn-primary" type="button" onClick={() => navigate('/projets/nouveau')}>Nouveau projet</button> : null}
      </header>
      <Banner>{error}</Banner>
      <div className="filters">
        {FILTERS.map(([value, label]) => (
          <button key={label} className={`chip${status === value ? ' on' : ''}`} type="button" onClick={() => setStatus(value)}>{label}</button>
        ))}
      </div>
      <div className="gx-zoom" role="radiogroup" aria-label="Affichage" style={{ marginBottom: 14 }}>
        {[['cartes', 'Cartes'], ['planning', 'Planning']].map(([value, label]) => (
          <button key={value} type="button" role="radio" aria-checked={view === value} className={view === value ? 'on' : ''} onClick={() => setView(value)}>{label}</button>
        ))}
      </div>
      {view === 'planning' ? (
        <section className="card gantt-card">
          <header>
            <div>
              <h2>Planning des projets</h2>
              <p className="sub">Chaque barre va du début à la fin prévue ; le remplissage indique l’avancement.</p>
            </div>
          </header>
          <Gantt
            label="Projet"
            emptyText="Renseignez les dates de début et de fin des projets pour les voir sur le planning."
            tasks={rows.map((project) => ({
              title: project.name,
              staff_name: project.client?.company,
              start_date: dateInput(project.start_date),
              end_date: dateInput(project.due_date),
              progress: project.progress,
            }))}
          />
        </section>
      ) : null}
      <div className="project-grid" hidden={view === 'planning'}>
        {rows.map((project) => (
          <button className="project-card" type="button" key={project.id} onClick={() => navigate(`/projets/${project.id}`)} style={{ textAlign: 'left' }}>
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <span className="muted">{project.code}</span>
              <Pill status={project.status} map={PROJECT_STATUS} />
            </div>
            <h3>{project.name}</h3>
            <p className="muted">{project.client?.company}</p>
            <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
            <div className="actions" style={{ justifyContent: 'space-between' }}>
              <span>{project.progress} %</span>
              <span>{money(project.budget, settings?.currency)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
