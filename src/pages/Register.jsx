import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { Loading } from '../components/ui';
import { PageBanner, SiteAside } from './site/SiteParts';

export default function Register() {
  const { user, ready, register } = useAuth();
  const prefill = useLocation().state || {};
  const [form, setForm] = useState({
    account_type: 'entreprise',
    name: prefill.name || '',
    email: prefill.email || '',
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
    <main>
      <PageBanner title="Créer un compte" lead="Gratuit pendant la phase de test. Vous pourrez ensuite inviter votre équipe et vos clients." />
      <div className="st-wrap st-auth">
        <div className="st-form-card">
          <h2>Votre compte</h2>
          <p>Compte d’entreprise pour travailler en équipe, ou compte individuel si vous êtes indépendant.</p>
          <form className="st-form" onSubmit={submit}>
            <div className="st-choice" role="radiogroup" aria-label="Type de compte">
              <button type="button" role="radio" aria-checked={form.account_type === 'entreprise'} className={form.account_type === 'entreprise' ? 'on' : ''} onClick={() => set('account_type', 'entreprise')}>Entreprise</button>
              <button type="button" role="radio" aria-checked={form.account_type === 'personne'} className={form.account_type === 'personne' ? 'on' : ''} onClick={() => set('account_type', 'personne')}>Indépendant</button>
            </div>
            {error ? <div className="st-alert err" role="alert">{error}</div> : null}
            <label className="st-input"><span>Nom complet</span><input value={form.name} onChange={(event) => set('name', event.target.value)} required autoComplete="name" /></label>
            <div className="row">
              <label className="st-input"><span>E-mail</span><input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} required autoComplete="email" /></label>
              <label className="st-input"><span>Téléphone <small>(facultatif)</small></span><input value={form.phone} onChange={(event) => set('phone', event.target.value)} autoComplete="tel" /></label>
            </div>
            {form.account_type === 'entreprise' ? (
              <div className="row">
                <label className="st-input"><span>Entreprise</span><input value={form.company_name} onChange={(event) => set('company_name', event.target.value)} required autoComplete="organization" /></label>
                <label className="st-input"><span>Ville</span><input value={form.city} onChange={(event) => set('city', event.target.value)} /></label>
              </div>
            ) : null}
            <div className="row">
              <label className="st-input"><span>Mot de passe <small>(8 caractères min.)</small></span><input type="password" value={form.password} onChange={(event) => set('password', event.target.value)} required minLength={8} autoComplete="new-password" /></label>
              <label className="st-input"><span>Confirmation</span><input type="password" value={form.password_confirmation} onChange={(event) => set('password_confirmation', event.target.value)} required autoComplete="new-password" /></label>
            </div>
            <button className="st-btn" type="submit" disabled={pending}>{pending ? 'Création…' : 'Créer mon compte'}</button>
          </form>
          <p className="st-auth-alt">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
        </div>
        <SiteAside />
      </div>
    </main>
  );
}
