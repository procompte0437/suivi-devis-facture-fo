import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { CLIENT_STATUS, INVOICE_STATUS, money, PROJECT_STATUS, QUOTE_STATUS, tintFor } from '../format';
import { Banner, Field, Loading, Modal, Pill } from '../components/ui';

const EMPTY = { company: '', contact_name: '', email: '', phone: '', address: '', city: 'Libreville', country: 'Gabon', tax_id: '', notes: '', status: 'prospect' };

export default function Clients() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const currency = settings?.currency || 'XAF';
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadList() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    return api(`/clients?${params.toString()}`).then(setRows);
  }

  useEffect(() => {
    loadList().catch((err) => setError(errorText(err))).finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    api(`/clients/${id}`).then(setDetail).catch((err) => setError(errorText(err)));
  }, [id]);

  function edit(client) {
    setForm(client ? { ...client } : { ...EMPTY });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      const saved = form.id
        ? await api(`/clients/${form.id}`, { method: 'PUT', body: payload })
        : await api('/clients', { method: 'POST', body: payload });
      setForm(null);
      await loadList();
      navigate(`/clients/${saved.id}`);
    } catch (err) {
      setError(errorText(err));
    }
  }

  const client = detail?.client;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Gestion</p>
          <h1>Clients</h1>
          <p className="lead">Fiches clients, avec leurs devis, factures et projets.</p>
        </div>
        {can('clients') ? <button className="btn btn-primary" type="button" onClick={() => edit(null)}>Nouveau client</button> : null}
      </header>
      <Banner>{error}</Banner>
      <div className="directory-layout" style={{ marginTop: 14 }}>
        <aside className="directory">
          <input className="search-inline" placeholder="Société, contact, ville" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadList(); }} />
          <div className="filters" style={{ marginTop: 10 }}>
            {[['', 'Tous'], ['actif', 'Actifs'], ['prospect', 'Prospects'], ['veille', 'Veille']].map(([value, label]) => (
              <button key={label} className={`chip${status === value ? ' on' : ''}`} type="button" onClick={() => setStatus(value)}>{label}</button>
            ))}
          </div>
          {loading ? <p className="muted">Chargement…</p> : null}
          {rows.map((row) => (
            <button key={row.id} type="button" className={`person${String(row.id) === String(id) ? ' on' : ''}`} onClick={() => navigate(`/clients/${row.id}`)}>
              <span className="avatar" style={{ background: tintFor(row.company) }}>{row.company.slice(0, 1)}</span>
              <span>
                <b>{row.company}</b>
                <small>{row.city} · {row.code}</small>
              </span>
            </button>
          ))}
        </aside>
        <section className="dossier">
          {!client ? <p className="lead">Sélectionnez un client dans la liste.</p> : (
            <>
              <div className="dossier-top">
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="monogram" style={{ background: tintFor(client.company) }}>{client.company.slice(0, 1)}</span>
                  <div>
                    <p className="kicker">{client.code}</p>
                    <h2>{client.company}</h2>
                    <p className="lead">{client.contact_name} · {client.city}</p>
                  </div>
                </div>
                <div className="actions">
                  <Pill status={client.status} map={CLIENT_STATUS} />
                  <button className="btn" type="button" onClick={() => edit(client)}>Modifier</button>
                </div>
              </div>
              <div className="stats">
                <div className="stat"><span>Facturé</span><strong>{money(detail.revenue, currency)}</strong></div>
                <div className="stat"><span>Encaissé</span><strong>{money(detail.collected, currency)}</strong></div>
                <div className="stat"><span>Projets</span><strong>{client.projects_count}</strong></div>
              </div>
              <p className="muted">{[client.email, client.phone, client.address].filter(Boolean).join(' · ') || 'Coordonnées à compléter.'}</p>
              {client.notes ? <p style={{ marginTop: 10 }}>{client.notes}</p> : null}
              <div className="fields" style={{ marginTop: 18 }}>
                <div>
                  <h3>Devis</h3>
                  <div className="link-list">
                    {detail.quotes.map((quote) => (
                      <Link key={quote.id} to={`/devis/${quote.id}`}><span>{quote.number}<br /><small className="muted">{quote.title}</small></span><Pill status={quote.display_status} map={QUOTE_STATUS} /></Link>
                    ))}
                    {detail.quotes.length === 0 ? <p className="muted">Aucun devis.</p> : null}
                  </div>
                </div>
                <div>
                  <h3>Factures</h3>
                  <div className="link-list">
                    {detail.invoices.map((invoice) => (
                      <Link key={invoice.id} to={`/factures/${invoice.id}`}><span>{invoice.number}<br /><small className="muted">{money(invoice.total, currency)}</small></span><Pill status={invoice.display_status} map={INVOICE_STATUS} /></Link>
                    ))}
                    {detail.invoices.length === 0 ? <p className="muted">Aucune facture.</p> : null}
                  </div>
                </div>
              </div>
              <h3 style={{ marginTop: 18 }}>Projets</h3>
              <div className="link-list">
                {detail.projects.map((project) => (
                  <Link key={project.id} to={`/projets/${project.id}`}><span>{project.name}</span><Pill status={project.status} map={PROJECT_STATUS} /></Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {form ? (
        <Modal title={form.id ? 'Modifier le client' : 'Nouveau client'} onClose={() => setForm(null)}>
          <form className="stack" onSubmit={save}>
            <div className="fields">
              <Field label="Société" wide><input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required /></Field>
              <Field label="Contact" wide><input value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} required /></Field>
              <Field label="E-mail"><input type="email" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Téléphone"><input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
              <Field label="Ville"><input value={form.city || ''} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
              <Field label="Statut">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="prospect">Prospect</option>
                  <option value="actif">Actif</option>
                  <option value="veille">En veille</option>
                </select>
              </Field>
              <Field label="Adresse" wide><input value={form.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
              <Field label="Notes" wide><textarea value={form.notes || ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
            </div>
            <button className="btn btn-primary" type="submit">Enregistrer</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
