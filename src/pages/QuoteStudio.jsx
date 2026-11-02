import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { dateInput, todayISO, UNITS } from '../format';
import { Paper } from '../components/Paper';
import { QUOTE_TEMPLATES } from '../templates';
import { Banner, Field, Loading } from '../components/ui';

const SUGGESTIONS = [
  ['Direction de création', 'j', 180000],
  ['Journée de production', 'j', 220000],
  ['Forfait de cadrage', 'forfait', 750000],
];

function blankLine() {
  return { designation: '', detail: '', quantity: 1, unit: 'u', unit_price: '' };
}

export default function QuoteStudio() {
  const { id } = useParams();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();
  const { settings } = useAuth();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(isNew);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [createProject, setCreateProject] = useState(true);
  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    title: '',
    status: 'brouillon',
    issue_date: todayISO(),
    valid_until: todayISO(30),
    tax_rate: settings?.tax_rate ?? 18,
    discount: 0,
    notes: '',
    template: 'nomade',
  });
  const [lines, setLines] = useState([blankLine()]);

  useEffect(() => {
    api('/clients').then(setClients).catch((err) => setError(errorText(err)));
    api('/projects').then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    api(`/quotes/${id}`)
      .then((data) => {
        setQuote(data);
        setForm({
          client_id: data.client_id,
          project_id: data.project_id || '',
          title: data.title,
          status: data.status,
          issue_date: dateInput(data.issue_date),
          valid_until: dateInput(data.valid_until),
          tax_rate: data.tax_rate,
          discount: data.discount,
          notes: data.notes || '',
          template: data.template || 'nomade',
        });
        setLines(data.lines.length ? data.lines : [blankLine()]);
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }, [id, isNew]);

  const client = clients.find((item) => String(item.id) === String(form.client_id)) || quote?.client;
  const clientProjects = projects.filter((item) => String(item.client_id) === String(form.client_id));

  function updateLine(index, key, value) {
    setLines(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)));
  }

  async function save(statusOverride) {
    setPending(true);
    setError('');
    setNotice('');
    const payload = {
      ...form,
      status: statusOverride || form.status,
      client_id: Number(form.client_id),
      project_id: form.project_id ? Number(form.project_id) : null,
      tax_rate: Number(form.tax_rate),
      discount: Number(form.discount || 0),
      valid_until: form.valid_until || null,
      lines: lines.filter((line) => line.designation.trim()).map((line) => ({
        designation: line.designation,
        detail: line.detail,
        quantity: Number(line.quantity),
        unit: line.unit,
        unit_price: Number(line.unit_price || 0),
      })),
    };
    try {
      const saved = isNew
        ? await api('/quotes', { method: 'POST', body: payload })
        : await api(`/quotes/${id}`, { method: 'PUT', body: payload });
      setNotice('Devis enregistré.');
      if (isNew) navigate(`/devis/${saved.id}`, { replace: true });
      else setQuote(saved);
      return saved;
    } catch (err) {
      setError(errorText(err));
      return null;
    } finally {
      setPending(false);
    }
  }

  async function convert() {
    const saved = await save();
    if (!saved) return;
    setPending(true);
    setError('');
    try {
      const invoice = await api(`/quotes/${saved.id}/convert`, {
        method: 'POST',
        body: { create_project: createProject && !form.project_id, due_date: todayISO(30) },
      });
      navigate(`/factures/${invoice.id}`);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  async function remove() {
    try {
      await api(`/quotes/${id}`, { method: 'DELETE' });
      navigate('/devis');
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (!ready) return <Loading inline label="Préparation du devis" />;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/devis">Devis</Link> · atelier</p>
          <h1>{quote?.number || 'Nouveau devis'}</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => window.print()}>Imprimer</button>
          {quote?.status === 'brouillon' ? (
            <button className="btn btn-danger" type="button" onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}>
              {confirmDelete ? 'Confirmer' : 'Supprimer'}
            </button>
          ) : null}
          {quote && quote.status !== 'refuse' && !quote.invoice ? (
            <button className="btn btn-brass" type="button" onClick={() => setConvertOpen((value) => !value)}>Facturer</button>
          ) : null}
          {quote?.invoice ? <Link className="btn" to={`/factures/${quote.invoice.id}`}>{quote.invoice.number}</Link> : null}
          <button className="btn btn-primary" type="button" disabled={pending} onClick={() => save()}>
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </header>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
        {convertOpen ? (
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <label className="check-row" style={{ border: 0 }}>
              <input type="checkbox" checked={createProject} onChange={(event) => setCreateProject(event.target.checked)} disabled={Boolean(form.project_id)} />
              Ouvrir un projet si le devis n’en a pas
            </label>
            <button className="btn btn-brass" type="button" onClick={convert}>Créer la facture</button>
          </div>
        ) : null}
      </div>
      <div className="studio">
        <div className="editor">
          <div className="card fields">
            <Field label="Client">
              <select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value, project_id: '' })} required>
                <option value="">Choisir</option>
                {clients.map((item) => <option key={item.id} value={item.id}>{item.company}</option>)}
              </select>
            </Field>
            <Field label="Projet">
              <select value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })}>
                <option value="">Sans projet</option>
                {clientProjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <Field label="Intitulé" wide><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Statut">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="brouillon">Brouillon</option>
                <option value="envoye">Envoyé</option>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
              </select>
            </Field>
            <Field label="TVA %"><input type="number" value={form.tax_rate} onChange={(event) => setForm({ ...form, tax_rate: event.target.value })} /></Field>
            <Field label="Émission"><input type="date" value={form.issue_date} onChange={(event) => setForm({ ...form, issue_date: event.target.value })} /></Field>
            <Field label="Validité"><input type="date" value={form.valid_until} onChange={(event) => setForm({ ...form, valid_until: event.target.value })} /></Field>
            <Field label="Remise"><input type="number" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} /></Field>
            <Field label="Note" wide><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
            <div className="wide">
              <span className="kicker">Modèle du devis</span>
              <div className="template-picks">
                {QUOTE_TEMPLATES.map(([id, name, text]) => (
                  <button key={id} type="button" className={form.template === id ? 'on' : ''} onClick={() => setForm({ ...form, template: id })}>
                    <b>{name}</b>
                    <small>{text}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="suggest" style={{ marginBottom: 10 }}>
              {SUGGESTIONS.map(([label, unit, price]) => (
                <button key={label} className="chip" type="button" onClick={() => setLines([...lines, { designation: label, detail: '', quantity: 1, unit, unit_price: price }])}>
                  + {label}
                </button>
              ))}
            </div>
            <div className="lines">
              {lines.map((line, index) => (
                <div className="line" key={index}>
                  <input placeholder="Désignation" value={line.designation} onChange={(event) => updateLine(index, 'designation', event.target.value)} />
                  <input type="number" min="0" step="0.5" value={line.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} />
                  <select value={line.unit} onChange={(event) => updateLine(index, 'unit', event.target.value)}>
                    {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                  <input type="number" min="0" placeholder="Prix" value={line.unit_price} onChange={(event) => updateLine(index, 'unit_price', event.target.value)} />
                  <button className="icon-btn" type="button" onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))} aria-label="Retirer">×</button>
                </div>
              ))}
            </div>
            <button className="btn btn-tiny" type="button" style={{ marginTop: 10 }} onClick={() => setLines([...lines, blankLine()])}>Ajouter une ligne</button>
          </div>
        </div>
        <div className="sheet-wrap">
          <Paper
            kind="devis"
            number={quote?.number}
            status={form.status}
            client={client}
            title={form.title}
            issue={form.issue_date}
            until={form.valid_until}
            lines={lines}
            discount={form.discount}
            taxRate={form.tax_rate}
            notes={form.notes}
            template={form.template}
          />
        </div>
      </div>
    </div>
  );
}
