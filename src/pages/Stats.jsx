import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { money } from '../format';
import { useAuth } from '../auth';
import { Banner, Loading } from '../components/ui';

export default function Stats() {
  const { settings } = useAuth();
  const currency = settings?.currency || 'XAF';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard').then(setData).catch((err) => setError(errorText(err)));
  }, []);

  if (error) return <div className="page"><Banner>{error}</Banner></div>;
  if (!data) return <Loading inline label="Lecture des statistiques" />;

  const quotes = data.pipeline?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Pilotage</p>
          <h1>Statistiques</h1>
          <p className="lead">Indicateurs du mois : devis, facturation, paiements et projets.</p>
        </div>
      </header>
      <section className="grid-kpis">
        {data.kpis.map((kpi) => (
          <article className="card" key={kpi.key}>
            <span>{kpi.label}</span>
            <strong>{kpi.money === false ? kpi.value : money(kpi.value, currency)}</strong>
            <em className="muted">{kpi.hint}</em>
          </article>
        ))}
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h2>Pipeline des devis</h2>
        <p className="sub">{quotes} devis au total.</p>
        {data.pipeline.map((item) => (
          <div className="pipe" key={item.status}>
            <span>{item.status}</span>
            <div className="bar"><span style={{ width: `${Math.min(100, item.count * 12)}%` }} /></div>
            <b>{item.count}</b>
          </div>
        ))}
      </section>
    </div>
  );
}
