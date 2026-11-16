import { useEffect, useState } from 'react';
import { api, API_BASE } from '../api';

const PROVIDERS = [
  ['google', 'Google', GoogleLogo],
  ['github', 'GitHub', GithubLogo],
];

/**
 * Boutons « Continuer avec Google / GitHub ».
 * Un clic quitte le site vers le fournisseur ; le retour se fait sur /connexion-sociale.
 * Un fournisseur sans identifiants dans le .env du serveur est affiché grisé.
 */
export function SocialButtons({ verb = 'Continuer' }) {
  const [enabled, setEnabled] = useState(null);

  useEffect(() => {
    api('/auth/providers').then(setEnabled).catch(() => setEnabled({}));
  }, []);

  return (
    <div className="st-social">
      <div className="st-social-row">
        {PROVIDERS.map(([key, label, Logo]) => {
          const ready = Boolean(enabled?.[key]);
          return ready ? (
            <a key={key} className={`st-social-btn ${key}`} href={`${API_BASE}/auth/${key}/redirect`}>
              <Logo />
              {verb} avec {label}
            </a>
          ) : (
            <button key={key} type="button" className={`st-social-btn ${key}`} disabled title={enabled ? `${label} n’est pas encore configuré sur ce serveur.` : 'Chargement…'}>
              <Logo />
              {verb} avec {label}
            </button>
          );
        })}
      </div>
      {enabled && !enabled.google && !enabled.github ? (
        <p className="st-social-note">La connexion par Google et GitHub sera disponible dès que l’administrateur aura renseigné les identifiants.</p>
      ) : null}
      <p className="st-social-or"><span>ou avec le formulaire</span></p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GithubLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}
