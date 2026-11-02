import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field, Loading } from '../components/ui';

const DEMOS = [
  ['Aurore Blanc', 'aurore.blanc@oree.fr', 'Administration'],
  ['Marc Essono', 'marc.essono@oree.fr', 'Commercial'],
  ['Léa Nguema', 'lea.nguema@oree.fr', 'Comptabilité'],
];

const STEPS = [
  ['01', 'Devis', 'Rédiger, envoyer, relancer.'],
  ['02', 'Projets', 'Suivre ce qui est accepté.'],
  ['03', 'Factures', 'Encaisser sans perdre le fil.'],
];

export default function Login() {
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState('aurore.blanc@oree.fr');
  const [password, setPassword] = useState('Cedre2026!');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!ready) return <Loading inline />;
  if (user) return <Navigate to="/tableau" replace />;

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
    <main className="mkt-page mkt-auth">
      <div>
        <p className="kicker">Espace client</p>
        <h1>Entrer dans l’atelier</h1>
        <p className="mkt-lead">Clients, devis, factures et projets dans le même geste — de la première proposition à l’encaissement.</p>
        <ol className="mkt-auth-steps">
          {STEPS.map(([index, title, text]) => (
            <li key={index}>
              <b>{index}</b>
              <span>{title}</span>
              <small>{text}</small>
            </li>
          ))}
        </ol>
      </div>
      <form className="mkt-auth-card" onSubmit={submit}>
        <h2>Connexion</h2>
        <p>Le mot de passe de démonstration est commun aux trois comptes.</p>
        <Banner>{error}</Banner>
        <Field label="E-mail">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
        </Field>
        <Field label="Mot de passe">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </Field>
        <button className="mkt-cta" type="submit" disabled={pending}>
          {pending ? 'Ouverture…' : 'Entrer dans l’atelier'}
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
        <p className="muted">Pas encore de compte ? <Link to="/inscription">Créer un accès</Link></p>
      </form>
    </main>
  );
}
