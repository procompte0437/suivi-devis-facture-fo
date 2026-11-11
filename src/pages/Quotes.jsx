import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, money, QUOTE_STATUS } from '../format';
import { Banner, Pill } from '../components/ui';

const FILTERS = [['', 'Tous'], ['brouillon', 'Brouillons'], ['envoye', 'Envoyés'], ['accepte', 'Acceptés'], ['refuse', 'Refusés'], ['expire', 'Expirés']];

export default function Quotes() {
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  function load(nextStatus = status, nextQuery = query) {
    const params = new URLSearchParams();
    if (nextStatus) params.set('status', nextStatus);
    if (nextQuery) params.set('q', nextQuery);
    api(`/quotes?${params.toString()}`).then(setRows).catch((err) => setError(errorText(err)));
  }

  useEffect(() => { load(status, query); }, [status]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Relation</p>
          <h1>Devis</h1>
          <p className="lead">Création, envoi et suivi des propositions commerciales.</p>
        </div>
        {can('quotes') ? <Link className="btn btn-primary" to="/devis/nouveau">Nouveau devis</Link> : null}
      </header>
      <Banner>{error}</Banner>
      <div className="filters">
        {FILTERS.map(([value, label]) => (
          <button key={label} className={`chip${status === value ? ' on' : ''}`} type="button" onClick={() => setStatus(value)}>{label}</button>
        ))}
        <input className="search-inline" style={{ maxWidth: 260 }} placeholder="Numéro, client, titre" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') load(); }} />
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Numéro</th><th>Client</th><th>Intitulé</th><th>Émission</th><th className="num">Total</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {rows.map((quote) => (
              <tr className="clickable" key={quote.id} onClick={() => navigate(`/devis/${quote.id}`)}>
                <td>{quote.number}</td>
                <td>{quote.client?.company}</td>
                <td>{quote.title}</td>
                <td>{formatDate(quote.issue_date)}</td>
                <td className="num">{money(quote.total, settings?.currency)}</td>
                <td><Pill status={quote.display_status} map={QUOTE_STATUS} /></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan="6" className="muted">Aucun devis pour ce filtre.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
