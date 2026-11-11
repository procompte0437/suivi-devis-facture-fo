import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field, Loading } from '../components/ui';

const DEMOS = [
  ['Aurore Blanc', 'aurore.blanc@oree.fr', 'Administrateur'],
  ['Marc Essono', 'marc.essono@oree.fr', 'Commercial'],
  ['Léa Nguema', 'lea.nguema@oree.fr', 'Comptable'],
  ['Yannick Ondo', 'yannick.ondo@oree.fr', 'Chef de projet'],
  ['Hervé Mba', 'direction@flamboyants.ga', 'Client'],
];

const STEPS = [
  ['Devis', 'Rédiger, envoyer, faire valider.'],
  ['Projets', 'Suivre les étapes et l’avancement.'],
  ['Factures', 'Enregistrer les paiements et le solde.'],
];

export default function Login() {
  const { user, ready, login, isClient } = useAuth();
  const [email, setEmail] = useState('aurore.blanc@oree.fr');
  const [password, setPassword] = useState('Cedre2026!');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!ready) return <Loading inline />;
  if (user) return <Navigate to={isClient ? '/espace-client' : '/tableau'} replace />;

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="pg pg-auth">
      <div>
        <p>Connexion</p>
        <h1>Accéder au portail</h1>
        <p className="pg-lead">L’équipe y gère les clients, les devis, les factures et les projets. Les clients y consultent leurs documents et l’avancement de leurs projets.</p>
        <ul className="pg-auth-points">
          {STEPS.map(([title, text]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <form className="mkt-auth-card" onSubmit={submit}>
        <h2>Connexion</h2>
        <p>Comptes de démonstration : mot de passe <code>Cedre2026!</code> pour tous.</p>
        <Banner>{error}</Banner>
        <Field label="E-mail">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
        </Field>
        <Field label="Mot de passe">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </Field>
        <button className="mkt-cta" type="submit" disabled={pending}>
          {pending ? 'Connexion…' : 'Se connecter'}
        </button>
        <div className="gate-demos">
          <span>Comptes de démonstration</span>
          {DEMOS.map(([name, mail, role]) => (
            <button
              className={`demo-chip${email === mail ? ' active' : ''}`}
              type="button"
              key={mail}
              onClick={() => { setEmail(mail); setPassword('Cedre2026!'); }}
            >
              <span>{name}</span>
              <small>{role}</small>
            </button>
          ))}
        </div>
        <p className="muted">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
      </form>
    </main>
  );
}
