import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Paper } from './Paper';

/**
 * Choix du modèle au moment de générer un devis ou une facture.
 * Les cinq modèles sont rendus avec les vraies données du document ;
 * le modèle retenu est enregistré, puis le PDF est produit par le serveur.
 */
export function DocumentPicker({ kind, templates, current, paper, onClose, onConfirm }) {
  const [picked, setPicked] = useState(current || templates[0][0]);
  const [busy, setBusy] = useState(false);
  const name = kind === 'facture' ? 'la facture' : 'le devis';

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const index = templates.findIndex(([id]) => id === picked);
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + templates.length) % templates.length;
        setPicked(templates[next][0]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, picked, templates]);

  async function generate() {
    setBusy(true);
    try {
      await onConfirm(picked);
    } finally {
      setBusy(false);
    }
  }

  const selected = templates.find(([id]) => id === picked);

  return createPortal(
    <div className="picker-scrim no-print" onMouseDown={onClose}>
      <div className="picker" role="dialog" aria-modal="true" aria-label={`Générer ${name}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="picker-head">
          <div>
            <p className="kicker">Générer {name}</p>
            <h2>Choisissez le modèle</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fermer">×</button>
        </header>

        <div className="picker-body">
          <div className="picker-grid" role="radiogroup" aria-label="Modèles">
            {templates.map(([id, label, text]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={picked === id}
                className={`picker-card${picked === id ? ' on' : ''}`}
                onClick={() => setPicked(id)}
                onDoubleClick={() => { setPicked(id); onConfirm(id); }}
              >
                <span className="picker-thumb" aria-hidden="true">
                  <span className="picker-scale"><Paper {...paper} kind={kind} template={id} /></span>
                </span>
                <b>{label}</b>
                <small>{text}</small>
              </button>
            ))}
          </div>
          <aside className="picker-preview" aria-label={`Aperçu du modèle ${selected?.[1]}`}>
            <div className="picker-preview-scale">
              <Paper {...paper} kind={kind} template={picked} />
            </div>
          </aside>
        </div>

        <footer className="picker-foot">
          <span className="muted">Modèle retenu : <b>{selected?.[1]}</b> · flèches ← → pour parcourir, double-clic pour générer</span>
          <div className="actions">
            <button className="btn" type="button" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" type="button" disabled={busy} onClick={generate}>
              {busy ? 'Préparation…' : 'Générer le PDF'}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

