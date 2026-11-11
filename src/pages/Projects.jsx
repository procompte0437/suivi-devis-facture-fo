import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { money, PROJECT_STATUS } from '../format';
import { Banner, Pill } from '../components/ui';

const FILTERS = [['', 'Tous'], ['cadrage', 'Cadrage'], ['en_cours', 'En cours'], ['pause', 'Pause'], ['livre', 'Livrés'], ['clos', 'Clos']];

export default function Projects() {
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = status ? `?status=${status}` : '';
    api(`/projects${params}`).then(setRows).catch((err) => setError(errorText(err)));
  }, [status]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Relation</p>
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
      <div className="project-grid">
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
