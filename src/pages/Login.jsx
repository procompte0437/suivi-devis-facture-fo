import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { errorText } from '../api';
import { useAuth } from '../auth';
import { Loading } from '../components/ui';
import { DEMO_ACCOUNTS } from './site/data';
import { PageBanner } from './site/SiteParts';

const DEMO_PASSWORD = 'Cedre2026!';

export default function Login() {
  const { user, ready, login, isClient } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setPending(false);
    }
  }

  return (
    <main>
      <PageBanner title="Connexion" lead="L’équipe gère ses clients, devis, factures et projets ; les clients suivent leurs dossiers." />
      <div className="st-wrap st-auth">
        <div className="st-form-card">
          <h2>Accéder au portail</h2>
          <p>Saisissez l’adresse e-mail et le mot de passe de votre compte.</p>
          <form className="st-form" onSubmit={submit}>
            {error ? <div className="st-alert err" role="alert">{error}</div> : null}
            <label className="st-input">
              <span>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
            </label>
            <label className="st-input">
              <span>Mot de passe</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
            </label>
            <button className="st-btn" type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
          </form>
          <p className="st-auth-alt">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
        </div>

        <aside className="st-aside">
          <section>
            <h2>Comptes de démo</h2>
            <ul className="st-demos">
              {DEMO_ACCOUNTS.map(([name, role, , mail]) => (
                <li key={mail}>
                  <button
                    type="button"
                    className={email === mail ? 'on' : ''}
                    onClick={() => { setEmail(mail); setPassword(DEMO_PASSWORD); }}
                  >
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </button>
                </li>
              ))}
              <li><p>Cliquez sur un compte pour remplir le formulaire.</p></li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
