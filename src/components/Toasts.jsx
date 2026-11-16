import { useEffect, useState } from 'react';

let compteur = 0;
const abonnes = new Set();

/**
 * Affiche un message court en bas de l’écran.
 * ton : « erreur » ou « succes ».
 */
export function afficherToast(message, ton = 'erreur') {
  if (!message) return;
  const toast = { id: ++compteur, message, ton };
  abonnes.forEach((recevoir) => recevoir(toast));
}

/** Pile des toasts. À monter une seule fois, à côté de l’application. */
export function ZoneToasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const recevoir = (toast) => {
      setToasts((liste) => [...liste, toast].slice(-4));
      window.setTimeout(() => {
        setToasts((liste) => liste.filter((item) => item.id !== toast.id));
      }, 8000);
    };
    abonnes.add(recevoir);
    return () => abonnes.delete(recevoir);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <p key={toast.id} className={`toast ${toast.ton}`} role="status">
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Fermer le message"
            onClick={() => setToasts((liste) => liste.filter((item) => item.id !== toast.id))}
          >
            ×
          </button>
        </p>
      ))}
    </div>
  );
}
