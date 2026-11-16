import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText, telechargerFichier } from '../api';
import { useAuth } from '../auth';
import { dateInput, formatDate, METHODS, money, todayISO, UNITS } from '../format';
import { Paper } from '../components/Paper';
import { INVOICE_TEMPLATES } from '../templates';
import { DocumentPicker } from '../components/DocumentPicker';
import { Banner, Field, Loading, Modal } from '../components/ui';
import { champsDocumentManquants, messageChampsManquants, oublierChamp } from '../champsObligatoires';

function blankLine() {
  return { designation: '', detail: '', quantity: 1, unit: 'forfait', unit_price: '' };
}

export default function InvoiceStudio() {
  const { id } = useParams();
  const isNew = !id || id === 'nouvelle';
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const canWrite = can('invoices');
  const currency = settings?.currency || 'XAF';
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(isNew);
  const [payment, setPayment] = useState({ amount: '', paid_at: todayISO(), method: 'virement', reference: '', note: '' });
  const [paiementOuvert, setPaiementOuvert] = useState(false);
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
  const [champsErreur, setChampsErreur] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const paid = Boolean(invoice?.payments?.length);
  const locked = paid || !canWrite;

  function updateLine(index, key, value) {
    setLines(lines.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)));
    const cle = key === 'designation' ? `designation-${index}` : key === 'quantity' ? `quantite-${index}` : key === 'unit_price' ? `prix-${index}` : '';
    if (cle) setChampsErreur((actuel) => oublierChamp(actuel, cle));
    if (key === 'designation' && String(value).trim()) setChampsErreur((actuel) => oublierChamp(actuel, 'lignes'));
  }

  async function save(statusOverride, templateOverride) {
    const manque = champsDocumentManquants(form, lines);
    setChampsErreur(manque);
    if (Object.keys(manque).length) {
      setNotice('');
      setError(messageChampsManquants(manque, 'facture'));
      requestAnimationFrame(() => {
        document.querySelector('.field.erreur, input.erreur, .card.erreur')?.scrollIntoView({ block: 'center' });
      });
      return null;
    }
    setPending(true);
    setError('');
    setNotice('');
    const payload = {
      ...form,
      status: statusOverride || form.status,
      template: templateOverride || form.template,
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
      return saved;
    } catch (err) {
      setError(errorText(err));
      return null;
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
      setPaiementOuvert(false);
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

  const paperProps = {
    number: invoice?.number,
    status: invoice?.display_status || form.status,
    client,
    title: form.title,
    issue: form.issue_date,
    until: form.due_date,
    lines,
    discount: form.discount,
    taxRate: form.tax_rate,
    notes: form.notes,
  };

  // Le modèle choisi est enregistré sur la facture tant qu'elle n'est pas figée par un paiement.
  async function generate(template) {
    const saved = !locked && canWrite ? await save(undefined, template) : invoice;
    if (!saved?.id) return;
    setPickerOpen(false);
    try {
      await telechargerFichier(`/invoices/${saved.id}/pdf`);
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (!ready) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="kicker"><Link to="/factures">Factures</Link></p>
            <h1>Facture</h1>
          </div>
          <button className="btn" type="button" onClick={() => navigate('/factures')}>Retour</button>
        </header>
        <div className="studio">
          <div className="card"><Loading label="Chargement de la facture" /></div>
          <div className="sheet-wrap"><div className="card"><Loading compact label="Aperçu" /></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/factures">Factures</Link></p>
          <h1>{invoice?.number || 'Nouvelle facture'}</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => navigate('/factures')}>Retour</button>
          <button className="btn" type="button" onClick={() => setPickerOpen(true)}>Générer le PDF</button>
          {canWrite && invoice?.status === 'brouillon' ? <button className="btn btn-brass" type="button" onClick={emit}>Émettre</button> : null}
          {canWrite ? (
            <button className="btn btn-primary" type="button" disabled={pending || locked} onClick={() => save()}>
              {paid ? 'Figée après paiement' : pending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          ) : <span className="muted">Lecture seule</span>}
        </div>
      </header>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
      </div>
      <div className="studio">
        <div className="editor">
          <div className="card fields">
            <Field label="Client" erreur={Boolean(champsErreur.client)}>
              <select value={form.client_id} disabled={locked} onChange={(event) => { setForm({ ...form, client_id: event.target.value, project_id: '' }); setChampsErreur((actuel) => oublierChamp(actuel, 'client')); }}>
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
            <Field label="Intitulé" wide erreur={Boolean(champsErreur.titre)}><input disabled={locked} value={form.title} onChange={(event) => { setForm({ ...form, title: event.target.value }); setChampsErreur((actuel) => oublierChamp(actuel, 'titre')); }} /></Field>
            <Field label="Émission" erreur={Boolean(champsErreur.emission)}><input disabled={locked} type="date" value={form.issue_date} onChange={(event) => { setForm({ ...form, issue_date: event.target.value }); setChampsErreur((actuel) => oublierChamp(actuel, 'emission')); }} /></Field>
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
          <div className={`card${champsErreur.lignes ? ' erreur' : ''}`}>
            <div className="lines">
              {lines.map((line, index) => (
                <div className="line" key={index}>
                  <input className={champsErreur[`designation-${index}`] ? 'erreur' : ''} disabled={locked} placeholder="Désignation" value={line.designation} onChange={(event) => updateLine(index, 'designation', event.target.value)} />
                  <input className={champsErreur[`quantite-${index}`] ? 'erreur' : ''} disabled={locked} type="number" value={line.quantity} onChange={(event) => updateLine(index, 'quantity', event.target.value)} />
                  <select disabled={locked} value={line.unit} onChange={(event) => updateLine(index, 'unit', event.target.value)}>
                    {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                  <input className={champsErreur[`prix-${index}`] ? 'erreur' : ''} disabled={locked} type="number" value={line.unit_price} onChange={(event) => updateLine(index, 'unit_price', event.target.value)} />
                  <button className="icon-btn" type="button" disabled={locked} onClick={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}>×</button>
                </div>
              ))}
            </div>
            {!locked ? <button className="btn btn-tiny" type="button" style={{ marginTop: 10 }} onClick={() => setLines([...lines, blankLine()])}>Ajouter une ligne</button> : null}
          </div>
          {invoice && invoice.status !== 'brouillon' && invoice.status !== 'annulee' ? (
            <div className="card pay-box">
              <h3>Paiements</h3>
              <p className="muted">Solde {money(invoice.balance, currency)} · déjà reçu {money(invoice.amount_paid, currency)}</p>
              {canWrite ? <button className="btn" type="button" onClick={() => setPaiementOuvert(true)} disabled={!invoice.balance}>Enregistrer un paiement</button> : null}
              <div className="link-list">
                {invoice.payments?.map((item) => (
                  <div key={item.id} className="quiet-row">
                    <span>{formatDate(item.paid_at)} · {METHODS.find(([value]) => value === item.method)?.[1] || item.method}<br /><small className="muted">{item.reference}</small></span>
                    <strong>{money(item.amount, currency)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="sheet-wrap">
          <Paper {...paperProps} kind="facture" template={form.template} />
        </div>
      </div>
      {pickerOpen ? (
        <DocumentPicker
          kind="facture"
          templates={INVOICE_TEMPLATES}
          current={form.template}
          paper={paperProps}
          onClose={() => setPickerOpen(false)}
          onConfirm={generate}
        />
      ) : null}
      {paiementOuvert ? (
        <Modal title="Enregistrer un paiement" onClose={() => setPaiementOuvert(false)}>
          <form className="stack" onSubmit={pay}>
            <p className="muted">Solde {money(invoice.balance, currency)}</p>
            <Field label="Montant" wide><input type="number" min="0" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} required /></Field>
            <Field label="Date" wide><input type="date" value={payment.paid_at} onChange={(event) => setPayment({ ...payment, paid_at: event.target.value })} required /></Field>
            <Field label="Mode" wide>
              <select value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })}>
                {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Référence" wide><input value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></Field>
            <button className="btn btn-primary" type="submit">Enregistrer le paiement</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
