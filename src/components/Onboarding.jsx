import { useState } from 'react';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field } from './ui';

/**
 * Premier pas d'un compte « personne » : tout (clients, devis, factures,
 * personnel, projets) se range dans une entreprise. On la crée ici.
 */
export function Onboarding() {
  const { user, switchCompany } = useAuth();
  const [form, setForm] = useState({ name: '', city: 'Libreville', legal_form: '', email: user?.email || '', phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const created = await api('/companies', { method: 'POST', body: { ...form, country: 'Gabon' } });
      await switchCompany(created.id);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  const first = (user?.name || '').split(' ')[0];

  return (
    <div className="page onboard">
      <section className="onboard-card">
        <div className="onboard-copy">
          <p className="kicker">Bienvenue{first ? `, ${first}` : ''}</p>
          <h1>Créez votre première entreprise</h1>
          <p className="lead">Vos clients, devis, factures, personnel et projets sont rangés par entreprise. Vous pourrez en ajouter d’autres et passer de l’une à l’autre à tout moment.</p>
          <ol className="onboard-steps">
            <li><b>1</b><span>Votre entreprise<small>Nom et coordonnées, repris sur vos documents</small></span></li>
            <li><b>2</b><span>Vos clients<small>Une fiche par client, avec son historique</small></span></li>
            <li><b>3</b><span>Premier devis<small>Cinq modèles au choix au moment de le générer</small></span></li>
          </ol>
        </div>
        <form className="onboard-form" onSubmit={submit}>
          <Banner>{error}</Banner>
          <Field label="Nom de l’entreprise"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus /></Field>
          <div className="fields">
            <Field label="Forme juridique"><input value={form.legal_form} placeholder="SARL, EI…" onChange={(event) => setForm({ ...form, legal_form: event.target.value })} /></Field>
            <Field label="Ville"><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
            <Field label="E-mail"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Téléphone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? 'Création…' : 'Créer l’entreprise'}</button>
        </form>
      </section>
    </div>
  );
}
