import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, INVOICE_STATUS, money } from '../format';
import { Banner, Pill } from '../components/ui';

const FILTERS = [['', 'Toutes'], ['brouillon', 'Brouillons'], ['emise', 'Émises'], ['partielle', 'Partielles'], ['payee', 'Payées'], ['en_retard', 'En retard'], ['annulee', 'Annulées']];

export default function Invoices() {
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
    api(`/invoices?${params.toString()}`).then(setRows).catch((err) => setError(errorText(err)));
  }

  useEffect(() => { load(status, query); }, [status]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Relation</p>
          <h1>Factures</h1>
          <p className="lead">Factures émises, échéances et paiements reçus.</p>
        </div>
        {can('invoices') ? <Link className="btn btn-primary" to="/factures/nouvelle">Nouvelle facture</Link> : null}
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
            <tr><th>Numéro</th><th>Client</th><th>Intitulé</th><th>Échéance</th><th className="num">Total</th><th className="num">Solde</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {rows.map((invoice) => (
              <tr className="clickable" key={invoice.id} onClick={() => navigate(`/factures/${invoice.id}`)}>
                <td>{invoice.number}</td>
                <td>{invoice.client?.company}</td>
                <td>{invoice.title}</td>
                <td>{formatDate(invoice.due_date)}</td>
                <td className="num">{money(invoice.total, settings?.currency)}</td>
                <td className="num">{money(invoice.balance, settings?.currency)}</td>
                <td><Pill status={invoice.display_status} map={INVOICE_STATUS} /></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan="7" className="muted">Aucune facture pour ce filtre.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
