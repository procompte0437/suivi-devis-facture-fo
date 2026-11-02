import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { dateInput, formatDate, METHODS, money, todayISO, UNITS } from '../format';
import { Paper } from '../components/Paper';
import { INVOICE_TEMPLATES } from '../templates';
import { Banner, Field, Loading } from '../components/ui';

function blankLine() {
  return { designation: '', detail: '', quantity: 1, unit: 'forfait', unit_price: '' };
}

export default function InvoiceStudio() {
  const { id } = useParams();
  const isNew = !id || id === 'nouvelle';
  const navigate = useNavigate();
  const { settings } = useAuth();
  const currency = settings?.currency || 'XAF';
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(isNew);
  const [payment, setPayment] = useState({ amount: '', paid_at: todayISO(), method: 'virement', reference: '', note: '' });
  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    title: '',
    status: 'brouillon',
    issue_date: todayISO(),
    due_date: todayISO(30),
    tax_rate: settings?.tax_rate ?? 18,
    discount: 0,
    notes: '',
    template: 'cedre',
  });
  const [lines, setLines] = useState([blankLine()]);

  useEffect(() => {
    api('/clients').then(setClients).catch((err) => setError(errorText(err)));
    api('/projects').then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    api(`/invoices/${id}`)
      .then((data) => {
        setInvoice(data);
        setForm({
          client_id: data.client_id,
          project_id: data.project_id || '',
          title: data.title,
          status: data.status,
          issue_date: dateInput(data.issue_date),
          due_date: dateInput(data.due_date),
          tax_rate: data.tax_rate,
          discount: data.discount,
          notes: data.notes || '',
          template: data.template || 'cedre',
        });
        setLines(data.lines.length ? data.lines : [blankLine()]);
        setPayment((current) => ({ ...current, amount: data.balance || '' }));
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }, [id, isNew]);

  const client = clients.find((item) => String(item.id) === String(form.client_id)) || invoice?.client;
  const clientProjects = projects.filter((item) => String(item.client_id) === String(form.client_id));
  const locked = Boolean(invoice?.payments?.length);

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
      due_date: form.due_date || null,
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
        ? await api('/invoices', { method: 'POST', body: payload })
        : await api(`/invoices/${id}`, { method: 'PUT', body: payload });
      setNotice('Facture enregistrée.');
      if (isNew) navigate(`/factures/${saved.id}`, { replace: true });
      else setInvoice(saved);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  async function pay(event) {
    event.preventDefault();
    setError('');
    try {
      const saved = await api(`/invoices/${id}/payments`, {
        method: 'POST',
        body: { ...payment, amount: Number(payment.amount) },
      });
      setInvoice(saved);
      setNotice('Règlement enregistré.');
      setPayment({ amount: saved.balance || '', paid_at: todayISO(), method: 'virement', reference: '', note: '' });
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function emit() {
    setError('');
    try {
      const saved = await api(`/invoices/${id}/status`, { method: 'POST', body: { status: 'emise' } });
      setInvoice((current) => ({ ...current, ...saved }));
      setForm((current) => ({ ...current, status: 'emise' }));
      setNotice('Facture émise.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (!ready) return <Loading inline label="Préparation de la facture" />;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/factures">Factures</Link> · pièce</p>
          <h1>{invoice?.number || 'Nouvelle facture'}</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => window.print()}>Imprimer</button>
          {invoice?.status === 'brouillon' ? <button className="btn btn-brass" type="button" onClick={emit}>Émettre</button> : null}
          <button className="btn btn-primary" type="button" disabled={pending || locked} onClick={() => save()}>
            {locked ? 'Figée après règlement' : pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </header>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
      </div>
      <div className="studio">
        <div className="editor">
          <div className="card fields">
            <Field label="Client">
              <select value={form.client_id} disabled={locked} onChange={(event) => setForm({ ...form, client_id: event.target.value, project_id: '' })}>
                <option value="">Choisir</option>
                {clients.map((item) => <option key={item.id} value={item.id}>{item.company}</option>)}
              </select>
            </Field>
            <Field label="Projet">
              <select value={form.project_id} disabled={locked} onChange={(event) => setForm({ ...form, project_id: event.target.value })}>
                <option value="">Sans projet</option>
                {clientProjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <Field label="Intitulé" wide><input disabled={locked} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Émission"><input disabled={locked} type="date" value={form.issue_date} onChange={(event) => setForm({ ...form, issue_date: event.target.value })} /></Field>
            <Field label="Échéance"><input disabled={locked} type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></Field>
            <Field label="TVA %"><input disabled={locked} type="number" value={form.tax_rate} onChange={(event) => setForm({ ...form, tax_rate: event.target.value })} /></Field>
            <Field label="Remise"><input disabled={locked} type="number" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} /></Field>
            <Field label="Note" wide><textarea disabled={locked} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
            <div className="wide">
              <span className="kicker">Modèle de la facture</span>
              <div className="template-picks">
                {INVOICE_TEMPLATES.map(([id, name, text]) => (
                  <button key={id} type="button" className={form.template === id ? 'on' : ''} onClick={() => setForm({ ...form, template: id })}>
                    <b>{name}</b>
                    <small>{text}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="lines">
              {lines.map((line, index) => (
                <div className="line" key={index}>
                  <input disabled={locked} placeholder="Désignation" value={line.designation} onChange={(event) => updateLine(index, 'designation', event.target.value)} />
                  <input disabled={locked} type="number" value={line.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} />
                  <select disabled={locked} value={line.unit} onChange={(event) => updateLine(index, 'unit', event.target.value)}>
                    {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                  <input disabled={locked} type="number" value={line.unit_price} onChange={(event) => updateLine(index, 'unit_price', event.target.value)} />
                  <button className="icon-btn" type="button" disabled={locked} onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}>×</button>
                </div>
              ))}
            </div>
            {!locked ? <button className="btn btn-tiny" type="button" style={{ marginTop: 10 }} onClick={() => setLines([...lines, blankLine()])}>Ajouter une ligne</button> : null}
          </div>
          {invoice && invoice.status !== 'brouillon' && invoice.status !== 'annulee' ? (
            <form className="card pay-box" onSubmit={pay}>
              <h3>Encaissement</h3>
              <p className="muted">Solde {money(invoice.balance, currency)} · déjà reçu {money(invoice.amount_paid, currency)}</p>
              <div className="fields">
                <Field label="Montant"><input type="number" min="0" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} required /></Field>
                <Field label="Date"><input type="date" value={payment.paid_at} onChange={(event) => setPayment({ ...payment, paid_at: event.target.value })} required /></Field>
                <Field label="Mode">
                  <select value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })}>
                    {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Référence"><input value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></Field>
              </div>
              <button className="btn btn-primary" type="submit" disabled={!invoice.balance}>Enregistrer le règlement</button>
              <div className="link-list">
                {invoice.payments?.map((item) => (
                  <div key={item.id} className="quiet-row">
                    <span>{formatDate(item.paid_at)} · {METHODS.find(([value]) => value === item.method)?.[1] || item.method}<br /><small className="muted">{item.reference}</small></span>
                    <strong>{money(item.amount, currency)}</strong>
                  </div>
                ))}
              </div>
            </form>
          ) : null}
        </div>
        <div className="sheet-wrap">
          <Paper
            kind="facture"
            number={invoice?.number}
            status={invoice?.display_status || form.status}
            client={client}
            title={form.title}
            issue={form.issue_date}
            until={form.due_date}
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
