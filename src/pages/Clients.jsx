import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { CLIENT_STATUS, INVOICE_STATUS, money, PROJECT_STATUS, QUOTE_STATUS, tintFor } from '../format';
import { Banner, Field, Modal, Pill } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, ListePaginee, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const EMPTY = {
  kind: 'entreprise', societe_id: '', company: '', contact_name: '', email: '', phone: '',
  address: '', city: 'Libreville', country: 'Gabon', tax_id: '', notes: '', status: 'prospect',
};
const CLIENT_FIELDS = ['kind', 'societe_id', 'company', 'contact_name', 'email', 'phone', 'address', 'city', 'country', 'tax_id', 'notes', 'status'];

function listed(items, current, key = 'label') {
  const values = (items || []).map((item) => item[key]).filter(Boolean);
  if (current && !values.includes(current)) values.unshift(current);
  return values;
}

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
  const [ficheEnCours, setFicheEnCours] = useState(false);
  const [refs, setRefs] = useState(null);

  function loadList() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    setLoading(true);
    return api(`/clients?${params.toString()}`)
      .then(setRows)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadList(); }, [status]);

  useEffect(() => {
    api('/referentiel').then(setRefs).catch(() => setRefs(null));
  }, []);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    setDetail(null);
    setFicheEnCours(true);
    api(`/clients/${id}`).then(setDetail).catch((err) => setError(errorText(err))).finally(() => setFicheEnCours(false));
  }, [id]);

  function edit(client) {
    setForm(client ? { ...client } : { ...EMPTY });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = {};
      CLIENT_FIELDS.forEach((key) => { payload[key] = form[key] || null; });
      payload.kind = form.kind || 'entreprise';
      payload.status = form.status;
      if (payload.kind === 'individuel') payload.company = payload.contact_name;
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
  const statuses = refs?.statut?.length ? refs.statut : [
    { code: 'prospect', label: 'Prospect' },
    { code: 'actif', label: 'Actif' },
    { code: 'veille', label: 'En veille' },
  ];
  const statusMap = { ...CLIENT_STATUS };
  statuses.forEach((item) => {
    statusMap[item.code] = { label: item.label, tone: CLIENT_STATUS[item.code]?.tone || 'mute' };
  });
  const optionsStatut = [{ valeur: '', libelle: 'Tous' }, ...statuses.map((item) => ({ valeur: item.code, libelle: item.label }))];
  const liste = useListePaginee(rows, 10);

  async function supprimer(clientCible) {
    if (!window.confirm(`Supprimer ${clientCible.company || clientCible.contact_name} ?`)) return;
    try {
      await api(`/clients/${clientCible.id}`, { method: 'DELETE' });
      if (String(id) === String(clientCible.id)) navigate('/clients');
      await loadList();
    } catch (err) {
      setError(errorText(err));
    }
  }



  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Gestion</p>
          <div className="titre-avec-info">
            <h1>Clients</h1>
            <IconeInformation titre="Clients" texte="Fiches clients, avec leurs devis, factures et projets. La recherche (société, contact, ville) est dans le filtre de statut. Un client qui a déjà des pièces ne peut pas être supprimé : passez-le en veille." />
          </div>
        </div>
        {can('clients') ? <button className="btn btn-primary" type="button" onClick={() => edit(null)}>Nouveau client</button> : null}
      </header>
      <Banner>{error}</Banner>
      <div className="directory-layout" style={{ marginTop: 14 }}>
        <aside className="directory">
          <BarreListe
            libelleFiltre="Statut"
            optionsFiltre={optionsStatut}
            filtre={status}
            onFiltre={setStatus}
            recherche={query}
            onRecherche={setQuery}
            onValiderRecherche={() => loadList()}
            placeholderRecherche="Nom, contact, ville"
            taille={liste.taille}
            onTaille={liste.changerTaille}
            chargement={loading}
            onActualiser={() => loadList()}
          />
          {loading ? <ChargementPourcentage actif libelle="Chargement des clients" /> : liste.visibles.map((row) => (
            <button key={row.id} type="button" className={`person${String(row.id) === String(id) ? ' on' : ''}`} onClick={() => navigate(`/clients/${row.id}`)}>
              <span className="avatar" style={{ background: tintFor(row.company || row.contact_name) }}>{(row.company || row.contact_name || '?').slice(0, 1)}</span>
              <span>
                <b>{row.kind === 'individuel' ? row.contact_name : row.company}</b>
                <small>{[row.kind === 'individuel' ? 'Particulier' : null, row.city, row.code].filter(Boolean).join(' · ')}</small>
              </span>
            </button>
          ))}
          <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
        </aside>
        <section className="dossier">
          {ficheEnCours ? <ChargementPourcentage actif libelle="Chargement de la fiche" /> : !client ? <p className="muted">Sélectionnez un client dans la liste.</p> : (
            <>
              <div className="dossier-top">
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="monogram" style={{ background: tintFor(client.company) }}>{client.company.slice(0, 1)}</span>
                  <div>
                    <p className="kicker">{client.code} · {client.kind === 'individuel' ? 'Particulier' : 'Entreprise'}</p>
                    <h2>{client.kind === 'individuel' ? client.contact_name : client.company}</h2>
                    <p className="lead">{client.kind === 'individuel' ? client.city : `${client.contact_name} · ${client.city}`}</p>
                  </div>
                </div>
                <div className="actions">
                  <Pill status={client.status} map={statusMap} />
                  <ActionsLigne
                    onModifier={can('clients') ? () => edit(client) : null}
                    onSupprimer={can('clients') ? () => supprimer(client) : null}
                  />
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
                    <ListePaginee
                      lignes={detail.quotes}
                      vide="Aucun devis."
                      rendu={(quote) => (
                        <Link key={quote.id} to={`/devis/${quote.id}`}><span>{quote.number}<br /><small className="muted">{quote.title}</small></span><Pill status={quote.display_status} map={QUOTE_STATUS} /></Link>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h3>Factures</h3>
                  <div className="link-list">
                    <ListePaginee
                      lignes={detail.invoices}
                      vide="Aucune facture."
                      rendu={(invoice) => (
                        <Link key={invoice.id} to={`/factures/${invoice.id}`}><span>{invoice.number}<br /><small className="muted">{money(invoice.total, currency)}</small></span><Pill status={invoice.display_status} map={INVOICE_STATUS} /></Link>
                      )}
                    />
                  </div>
                </div>
              </div>
              <h3 style={{ marginTop: 18 }}>Projets</h3>
              <div className="link-list">
                <ListePaginee
                  lignes={detail.projects}
                  vide="Aucun projet."
                  rendu={(project) => (
                    <Link key={project.id} to={`/projets/${project.id}`}><span>{project.name}</span><Pill status={project.status} map={PROJECT_STATUS} /></Link>
                  )}
                />
              </div>
            </>
          )}
        </section>
      </div>

      {form ? (
        <Modal title={form.id ? 'Modifier le client' : 'Nouveau client'} onClose={() => setForm(null)}>
          <form className="stack" onSubmit={save}>
            <div className="fields">
              <Field label="Type">
                <select value={form.kind || 'entreprise'} onChange={(event) => setForm({ ...form, kind: event.target.value, societe_id: '' })}>
                  <option value="entreprise">Entreprise</option>
                  <option value="individuel">Particulier</option>
                </select>
              </Field>
              <Field label="Statut">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} required>
                  {statuses.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                </select>
              </Field>
              {form.kind === 'individuel' ? (
                <Field label="Nom" wide><input value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value, company: event.target.value })} required /></Field>
              ) : (
                <>
                  <Field label="Entreprise" wide><input value={form.company || ''} onChange={(event) => setForm({ ...form, company: event.target.value, societe_id: '' })} required placeholder="Nom de l’entreprise cliente" /></Field>
                  <Field label="Identifiant fiscal"><input value={form.tax_id || ''} onChange={(event) => setForm({ ...form, tax_id: event.target.value })} /></Field>
                </>
              )}
              {form.kind === 'entreprise' ? (
                <Field label="Contact" wide><input value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} required /></Field>
              ) : null}
              <Field label="E-mail"><input type="email" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Téléphone"><input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
              <Field label="Ville">
                <select value={form.city || ''} onChange={(event) => setForm({ ...form, city: event.target.value })}>
                  <option value="">Choisir</option>
                  {listed(refs?.ville, form.city).map((label) => <option key={label} value={label}>{label}</option>)}
                </select>
              </Field>
              <Field label="Pays">
                <select value={form.country || ''} onChange={(event) => setForm({ ...form, country: event.target.value })}>
                  <option value="">Choisir</option>
                  {listed(refs?.pays, form.country).map((label) => <option key={label} value={label}>{label}</option>)}
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
