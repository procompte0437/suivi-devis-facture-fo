import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { DEMO_ACCOUNTS } from './site/data';

const DEMO_PASSWORD = 'Cedre2026!';

export default function Login() {
  const { user, ready, login, isClient } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (ready && user) return <Navigate to={isClient ? '/espace-client' : '/tableau'} replace />;

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  return (
    <main className="st-gate">
      <div className="st-gate-copy">
        <h1>Suivez ce qui vient ensuite</h1>
        <p>Devis, factures et projets, dans le même dossier.</p>
        <form className="st-gate-card" onSubmit={submit}>
          {error ? <div className="st-alert err" role="alert">{error}</div> : null}
          <label className="st-input">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" placeholder="vous@atelier.ga" />
          </label>
          <label className="st-input">
            <span>Mot de passe</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          <button className="st-btn block" type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Continuer avec l’e-mail'}</button>
          <p className="st-gate-alt">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
        </form>
        <div className="st-gate-demo">
          <p>Comptes de démonstration</p>
          <div>
            {DEMO_ACCOUNTS.map(([name, role, , mail]) => (
              <button key={mail} type="button" className={email === mail ? 'on' : ''} onClick={() => { setEmail(mail); setPassword(DEMO_PASSWORD); }}>
                {name}<small>{role}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
      <figure>
        <img src="/home/hero-atelier.jpg" alt="Artisan au travail dans son atelier" />
      </figure>
    </main>
  );
}
