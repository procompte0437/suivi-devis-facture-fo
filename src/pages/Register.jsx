import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field, Loading } from '../components/ui';

export default function Register() {
  const { user, ready, register } = useAuth();
  const [form, setForm] = useState({
    account_type: 'personne',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    city: 'Libreville',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!ready) return <Loading inline />;
  if (user) return <Navigate to="/tableau" replace />;

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await register(form);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  return (
    <main className="mkt-page mkt-auth">
      <div>
        <p className="kicker">Inscription</p>
        <h1>Créer un compte</h1>
        <p className="mkt-lead">Un compte personne ou entreprise, puis autant de maisons que l’activité en demande. Chacune tient ses devis, ses factures et ses projets.</p>
      </div>
      <form className="mkt-auth-card" onSubmit={submit}>
        <h2>Nouvel espace</h2>
        <div className="account-choice">
          <button type="button" className={form.account_type === 'personne' ? 'on' : ''} onClick={() => set('account_type', 'personne')}>Personne</button>
          <button type="button" className={form.account_type === 'entreprise' ? 'on' : ''} onClick={() => set('account_type', 'entreprise')}>Entreprise</button>
        </div>
        <Banner>{error}</Banner>
        <Field label="Nom"><input value={form.name} onChange={(event) => set('name', event.target.value)} required /></Field>
        <Field label="E-mail"><input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} required /></Field>
        <Field label="Téléphone"><input value={form.phone} onChange={(event) => set('phone', event.target.value)} /></Field>
        {form.account_type === 'entreprise' ? (
          <>
            <Field label="Entreprise"><input value={form.company_name} onChange={(event) => set('company_name', event.target.value)} required /></Field>
            <Field label="Ville"><input value={form.city} onChange={(event) => set('city', event.target.value)} /></Field>
          </>
        ) : null}
        <Field label="Mot de passe"><input type="password" value={form.password} onChange={(event) => set('password', event.target.value)} required minLength={8} /></Field>
        <Field label="Confirmation"><input type="password" value={form.password_confirmation} onChange={(event) => set('password_confirmation', event.target.value)} required /></Field>
        <button className="mkt-cta" type="submit" disabled={pending}>{pending ? 'Création…' : 'Créer l’espace'}</button>
        <p className="muted">Déjà inscrit ? <Link to="/login">Espace client</Link></p>
      </form>
    </main>
  );
}
