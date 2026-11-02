import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, INVOICE_STATUS, money, QUOTE_STATUS } from '../format';
import { Banner, Loading, Pill, Ring } from '../components/ui';

export default function Dashboard() {
  const { user, settings } = useAuth();
  const currency = settings?.currency || 'XAF';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard').then(setData).catch((err) => setError(errorText(err)));
  }, []);

  if (error) return <div className="page"><Banner>{error}</Banner></div>;
  if (!data) return <Loading inline label="Lecture du tableau de bord" />;

  const first = user?.name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const hello = hour < 18 ? 'Bonjour' : 'Bonsoir';
  const maxPipe = Math.max(...data.pipeline.map((item) => item.amount), 1);
  const maxSpark = Math.max(...data.spark.map((item) => item.total), 1);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Tableau de bord — DOUKOU</p>
          <h1>{hello}, {first}.</h1>
          <p className="lead">Voici ce que l’atelier a en mouvement ce mois-ci.</p>
        </div>
      </header>

      <section className="grid-kpis">
        {data.kpis.map((kpi) => (
          <article className={`kpi tone-${kpi.tone}`} key={kpi.key}>
            <div>
              <span>{kpi.label}</span>
              <strong>{kpi.money === false ? kpi.value : money(kpi.value, currency)}</strong>
              <em>
                {kpi.delta != null && Math.abs(kpi.delta) < 300 ? <span className="delta">{kpi.delta > 0 ? `+${kpi.delta} %` : `${kpi.delta} %`} · </span> : null}
                {kpi.hint}
              </em>
            </div>
            <Ring percent={kpi.percent} />
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="card flow">
          <h2>Mouvement du mois</h2>
          <p className="sub">Synthèse de l’atelier — créations, décisions, retards.</p>
          <div className="flow-hero">
            <Link to="/devis" className="flow-block green">
              <span>Créations</span>
              <strong>{data.flow[0]?.value ?? 0}</strong>
            </Link>
            <Link to="/devis" className="flow-block mist">
              <span>Acceptés</span>
              <strong>{data.flow[1]?.value ?? 0}</strong>
            </Link>
          </div>
          <table>
            <thead><tr><th>Nature</th><th className="num">Volume</th></tr></thead>
            <tbody>
              {data.flow_rows.map((row) => (
                <tr key={row.label}><td>{row.label}</td><td className="num">{row.value}</td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>Six mois</h2>
          <p className="sub">Facturation hors pièces annulées.</p>
          <svg className="spark" viewBox="0 0 280 86" role="img" aria-label="Facturation des six derniers mois">
            <path d={sparkPath(data.spark, maxSpark)} />
            {data.spark.map((point, index) => {
              const x = (index / Math.max(data.spark.length - 1, 1)) * 280;
              const y = 78 - (point.total / maxSpark) * 68;
              return <circle key={point.label} cx={x} cy={y} r="3.2" />;
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: 12 }}>
            {data.spark.map((point) => <span key={point.label}>{point.label}</span>)}
          </div>
          <div className="pipeline">
            {data.pipeline.map((item) => (
              <div className="pipe" key={item.status}>
                <span>{QUOTE_STATUS[item.status]?.label}</span>
                <div className="bar"><span style={{ width: `${(item.amount / maxPipe) * 100}%` }} /></div>
                <b>{item.count}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>Échéances</h2>
          <p className="sub">Factures encore ouvertes.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Pièce</th><th>Client</th><th>Échéance</th><th className="num">Solde</th><th></th></tr></thead>
              <tbody>
                {data.due.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><Link to={`/factures/${invoice.id}`}>{invoice.number}</Link></td>
                    <td>{invoice.client?.company}</td>
                    <td>{formatDate(invoice.due_date)}</td>
                    <td className="num">{money(invoice.balance, currency)}</td>
                    <td><Pill status={invoice.display_status} map={INVOICE_STATUS} /></td>
                  </tr>
                ))}
                {data.due.length === 0 ? <tr><td colSpan="5" className="muted">Aucune échéance ouverte.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
        <article className="card">
          <h2>À relancer</h2>
          <p className="sub">Devis envoyés depuis plus de sept jours.</p>
          {data.follow_ups.length === 0 ? <p className="muted">Rien en souffrance. Belle semaine.</p> : null}
          <div className="link-list">
            {data.follow_ups.map((quote) => (
              <Link key={quote.id} to={`/devis/${quote.id}`}>
                <span>{quote.client?.company}<br /><small className="muted">{quote.number}</small></span>
                <strong>{money(quote.total, currency)}</strong>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>Projets vivants</h2>
          <p className="sub">Avancement des dossiers ouverts.</p>
          {data.projects.map((project) => (
            <Link className="quiet-row" key={project.id} to={`/projets/${project.id}`}>
              <span>
                <b>{project.name}</b>
                <small className="muted" style={{ display: 'block' }}>{project.client?.company}</small>
                <span className="progress" style={{ marginTop: 6 }}><span style={{ width: `${project.progress}%` }} /></span>
              </span>
              <strong>{project.progress}%</strong>
            </Link>
          ))}
        </article>
        <article className="card">
          <h2>Journal</h2>
          <p className="sub">Les derniers gestes de l’équipe.</p>
          <div className="timeline">
            {data.activity.map((item) => (
              <article key={item.id}>
                <span className="dot" />
                <div className="quiet-row" style={{ border: 0, paddingTop: 0 }}>
                  <span>{item.description}<br /><small className="muted">{item.user?.name || 'Atelier'} · {formatDate(item.created_at)}</small></span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function sparkPath(points, max) {
  return points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 280;
    const y = 78 - (point.total / max) * 68;
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');
}
