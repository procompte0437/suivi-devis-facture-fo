import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorText, setToken } from '../api';
import { useAuth } from '../auth';
import { PageBanner } from './site/SiteParts';

const ERRORS = {
  'non-configure': 'Cette connexion n’est pas encore configurée sur le serveur. Utilisez le formulaire, ou demandez à l’administrateur de renseigner les identifiants.',
  'session-expiree': 'La demande a expiré ou n’est pas valide. Recommencez depuis la page de connexion.',
  annule: 'Vous avez annulé la connexion.',
  fournisseur: 'Le fournisseur n’a pas pu confirmer votre identité. Réessayez dans un instant.',
  'email-manquant': 'Votre compte ne partage pas d’adresse e-mail. Rendez une adresse publique (ou vérifiée) sur ce service, ou utilisez le formulaire.',
  'compte-inactif': 'Ce compte DOUKOU est désactivé. Contactez l’administrateur.',
};

/**
 * Retour de Google / GitHub. L'adresse contient un code à usage unique (dans le fragment #,
 * jamais envoyé au serveur web), échangé ici contre la session.
 */
export default function SocialCallback() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, '', window.location.pathname);

    const failure = params.get('erreur');
    if (failure) {
      setError(ERRORS[failure] || 'La connexion n’a pas abouti.');
      return;
    }
    const code = params.get('code');
    if (!code) {
      setError('Lien de connexion incomplet. Recommencez depuis la page de connexion.');
      return;
    }

    api('/auth/social/exchange', { method: 'POST', body: { code } })
      .then(async (data) => {
        setToken(data.token);
        const me = await refresh();
        const role = me?.user?.role;
        navigate(role === 'client' ? '/espace-client' : '/tableau', { replace: true });
      })
      .catch((err) => setError(errorText(err)));
  }, [navigate, refresh]);

  return (
    <main>
      <PageBanner title={error ? 'Connexion interrompue' : 'Connexion en cours'} crumb="Connexion" />
      <div className="st-wrap" style={{ padding: '48px 0 72px', maxWidth: 640 }}>
        {error ? (
          <div className="st-form-card" style={{ marginTop: 0 }}>
            <div className="st-alert err" role="alert">{error}</div>
            <p style={{ marginTop: 18 }}>
              <Link className="st-btn" to="/login">Retour à la connexion</Link>{' '}
              <Link className="st-btn ghost" to="/inscription">Créer un compte avec le formulaire</Link>
            </p>
          </div>
        ) : (
          <p className="st-social-wait" role="status"><span className="spin" /> Ouverture de votre espace…</p>
        )}
      </div>
    </main>
  );
}
