import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, INVOICE_STATUS, money, QUOTE_STATUS } from '../format';
import { Banner, Pill, Ring } from '../components/ui';
import { BarreListe, ChargementPourcentage, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

export default function Dashboard() {
  const { user, settings, company } = useAuth();
  const currency = settings?.currency || 'XAF';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [chargement, setChargement] = useState(true);

  function charger() {
    setChargement(true);
    api('/dashboard')
      .then(setData)
      .catch((err) => setError(errorText(err)))
      .finally(() => setChargement(false));
  }

  useEffect(() => { charger(); }, []);

  const first = user?.name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const hello = hour < 18 ? 'Bonjour' : 'Bonsoir';
  const maxPipe = data ? Math.max(...data.pipeline.map((item) => item.amount), 1) : 1;
  const maxSpark = data ? Math.max(...data.spark.map((item) => item.total), 1) : 1;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Tableau de bord{company?.name ? ` — ${company.name}` : ''}</p>
          <div className="titre-avec-info">
            <h1>{hello}, {first}.</h1>
            <IconeInformation titre="Tableau de bord" texte="Situation du mois en cours : indicateurs, échéances, devis à relancer, projets et journal." />
          </div>
        </div>
      </header>
      {error ? <Banner>{error}</Banner> : null}
      {chargement && !data ? <ChargementPourcentage actif libelle="Chargement du tableau de bord" /> : data ? (
        <>
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
          <div className="titre-avec-info">
            <h2>Mouvement du mois</h2>
            <IconeInformation titre="Mouvement du mois" texte="Devis créés et acceptés, factures en retard." />
          </div>
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
          <div className="titre-avec-info">
            <h2>Six mois</h2>
            <IconeInformation titre="Six mois" texte="Montant facturé par mois, hors factures annulées." />
          </div>
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
        <BlocListe
          titre="Échéances"
          texte="Factures encore ouvertes."
          lignes={data.due}
          vide="Aucune échéance ouverte."
          onActualiser={charger}
          chargement={chargement}
          texteLigne={(invoice) => `${invoice.number} ${invoice.client?.company || ''}`}
          estTableau
          entetes={<tr><th>Pièce</th><th>Client</th><th>Échéance</th><th className="num">Solde</th><th></th></tr>}
          rendu={(invoice) => (
            <tr key={invoice.id}>
              <td><Link to={`/factures/${invoice.id}`}>{invoice.number}</Link></td>
              <td>{invoice.client?.company}</td>
              <td>{formatDate(invoice.due_date)}</td>
              <td className="num">{money(invoice.balance, currency)}</td>
              <td><Pill status={invoice.display_status} map={INVOICE_STATUS} /></td>
            </tr>
          )}
        />
        <BlocListe
          titre="À relancer"
          texte="Devis envoyés depuis plus de sept jours."
          lignes={data.follow_ups}
          vide="Rien en souffrance. Belle semaine."
          onActualiser={charger}
          chargement={chargement}
          texteLigne={(quote) => `${quote.number} ${quote.client?.company || ''}`}
          rendu={(quote) => (
            <Link className="link-list" key={quote.id} to={`/devis/${quote.id}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{quote.client?.company}<br /><small className="muted">{quote.number}</small></span>
              <strong>{money(quote.total, currency)}</strong>
            </Link>
          )}
        />
      </section>

      <section className="dashboard-grid">
        <BlocListe
          titre="Projets en cours"
          texte="Avancement des projets non clôturés."
          lignes={data.projects}
          vide="Aucun projet en cours."
          onActualiser={charger}
          chargement={chargement}
          texteLigne={(project) => `${project.name} ${project.client?.company || ''}`}
          rendu={(project) => (
            <Link className="quiet-row" key={project.id} to={`/projets/${project.id}`}>
              <span>
                <b>{project.name}</b>
                <small className="muted" style={{ display: 'block' }}>{project.client?.company}</small>
                <span className="progress" style={{ marginTop: 6 }}><span style={{ width: `${project.progress}%` }} /></span>
              </span>
              <strong>{project.progress}%</strong>
            </Link>
          )}
        />
        <BlocListe
          titre="Journal activités"
          texte="Avancement des projets, au fil de l’eau."
          lignes={data.activity}
          vide="Aucune activité enregistrée."
          onActualiser={charger}
          chargement={chargement}
          texteLigne={(item) => `${item.description} ${item.user?.name || ''}`}
          rendu={(item) => (
            <article key={item.id} className="timeline">
              <span className="dot" />
              <div className="quiet-row" style={{ border: 0, paddingTop: 0 }}>
                <span>{item.description}<br /><small className="muted">{item.user?.name || 'Système'} · {formatDate(item.created_at)}</small></span>
              </div>
            </article>
          )}
        />
      </section>
        </>
      ) : null}
    </div>
  );
}

/**
 * Bloc de plusieurs éléments : filtre avec recherche interne, pages, actualisation.
 */
function BlocListe({ titre, texte, lignes, texteLigne, vide, rendu, onActualiser, chargement, estTableau, entetes }) {
  const [recherche, setRecherche] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = (lignes || []).filter((ligne) => !mot || texteLigne(ligne).toLowerCase().includes(mot));
  const liste = useListePaginee(filtres, 5);
  const corps = liste.visibles.map(rendu);

  return (
    <article className="card">
      <div className="titre-avec-info">
        <h2>{titre}</h2>
        <IconeInformation titre={titre} texte={texte} />
      </div>
      <BarreListe
        libelleFiltre="Liste"
        optionsFiltre={[{ valeur: '', libelle: 'Tous' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Rechercher"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={chargement}
        onActualiser={onActualiser}
      />
      {chargement ? <ChargementPourcentage actif libelle={`Chargement : ${titre}`} /> : estTableau ? (
        <div className="table-wrap">
          <table>
            <thead>{entetes}</thead>
            <tbody>
              {corps}
              {liste.total === 0 ? <tr><td className="muted" colSpan="6">{vide}</td></tr> : null}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {corps}
          {liste.total === 0 ? <p className="muted">{vide}</p> : null}
        </>
      )}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </article>
  );
}

function sparkPath(points, max) {
  return points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 280;
    const y = 78 - (point.total / max) * 68;
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');
}
