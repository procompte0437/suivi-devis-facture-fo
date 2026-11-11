import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field, Loading } from '../components/ui';

const EMPTY = {
  name: '', tagline: '', legal_form: '', address: '', city: '', postal_code: '',
  country: 'Gabon', email: '', phone: '', tax_id: '', capital: '', iban: '', payment_note: '', footer: '',
};

export default function Companies() {
  const { companies, company, refresh, switchCompany } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (company) setForm({ ...EMPTY, ...company });
  }, [company]);

  if (!companies) return <Loading inline label="Chargement des entreprises" />;

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (form.id) {
        await api(`/companies/${form.id}`, { method: 'PUT', body: form });
        setNotice('Entreprise mise à jour.');
        await refresh();
      } else {
        const created = await api('/companies', { method: 'POST', body: form });
        await switchCompany(created.id);
      }
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Espace</p>
          <h1>Entreprises</h1>
          <p className="lead">Chaque entreprise a ses propres clients, documents et projets.</p>
        </div>
        <button className="btn" type="button" onClick={() => setForm(EMPTY)}>Nouvelle entreprise</button>
      </header>
      <Banner>{error}</Banner>
      <Banner tone="ok">{notice}</Banner>
      <div className="company-picks">
        {companies.map((item) => (
          <button key={item.id} type="button" className={company?.id === item.id ? 'on' : ''} onClick={() => switchCompany(item.id)}>
            <b>{item.name}</b>
            <small>{item.city}</small>
          </button>
        ))}
      </div>
      <form className="card fields" onSubmit={save}>
        <Field label="Nom"><input value={form.name} onChange={(event) => set('name', event.target.value)} required /></Field>
        <Field label="Signature"><input value={form.tagline} onChange={(event) => set('tagline', event.target.value)} /></Field>
        <Field label="Forme"><input value={form.legal_form || ''} onChange={(event) => set('legal_form', event.target.value)} placeholder="SARL, EI…" /></Field>
        <Field label="Adresse" wide><input value={form.address || ''} onChange={(event) => set('address', event.target.value)} /></Field>
        <Field label="Ville"><input value={form.city || ''} onChange={(event) => set('city', event.target.value)} /></Field>
        <Field label="Code postal"><input value={form.postal_code || ''} onChange={(event) => set('postal_code', event.target.value)} /></Field>
        <Field label="E-mail"><input value={form.email || ''} onChange={(event) => set('email', event.target.value)} /></Field>
        <Field label="Téléphone"><input value={form.phone || ''} onChange={(event) => set('phone', event.target.value)} /></Field>
        <Field label="Identifiant fiscal"><input value={form.tax_id || ''} onChange={(event) => set('tax_id', event.target.value)} /></Field>
        <Field label="Capital"><input value={form.capital || ''} onChange={(event) => set('capital', event.target.value)} /></Field>
        <Field label="IBAN" wide><input value={form.iban || ''} onChange={(event) => set('iban', event.target.value)} /></Field>
        <Field label="Règlement" wide><textarea value={form.payment_note || ''} onChange={(event) => set('payment_note', event.target.value)} /></Field>
        <Field label="Pied de page des documents" wide><textarea value={form.footer || ''} onChange={(event) => set('footer', event.target.value)} /></Field>
        <button className="btn btn-primary" type="submit">{form.id ? 'Enregistrer' : 'Créer l’entreprise'}</button>
      </form>
    </div>
  );
}
