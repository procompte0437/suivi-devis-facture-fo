import { useEffect } from 'react';

export function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#1C3D30" />
      <path d="M24 9c2.2 6.2 2.2 10.4 0 16.6 4.4-2.2 8.6-2.1 13 1.2-6.4 1-9.6 4.2-10.6 9.6-1.2-6.4-5.4-9.4-12.8-9.6 5.2-2.4 8.4-5.6 10.4-17.8z" fill="#CDE5D4" />
    </svg>
  );
}

export function Icon({ name }) {
  const paths = {
    board: 'M4 5h7v7H4zM13 5h7v4h-7zM13 12h7v7h-7zM4 15h7v4H4z',
    people: 'M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 19c.4-2.4 2.4-4 5-4s4.6 1.6 5 4M14 19c.3-1.6 1.5-2.8 3.2-3.2',
    doc: 'M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6',
    bill: 'M6 4h12v16l-2-1.2L14 20l-2-1.2L10 20l-2-1.2L6 20zM9 8h6M9 12h6',
    layers: 'M12 4 3 8l9 4 9-4-9-4zM3 12l9 4 9-4M3 16l9 4 9-4',
    key: 'M8 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM11.5 11.5 20 3M16 7l3 3',
    search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16 16l5 5',
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Ring({ percent = 0 }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (value / 100) * circ;
  return (
    <svg className="ring" viewBox="0 0 72 72" aria-hidden="true">
      <circle className="track" cx="36" cy="36" r={radius} />
      <circle className="value" cx="36" cy="36" r={radius} strokeDasharray={`${dash} ${circ - dash}`} />
    </svg>
  );
}

export function Pill({ status, map }) {
  const meta = map[status] || { label: status || '—', tone: 'mute' };
  return <span className={`pill tone-${meta.tone}`}>{meta.label}</span>;
}

export function Field({ label, children, wide }) {
  return (
    <label className={`field${wide ? ' wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onMouseDown={onClose}>
      <div className={`modal${wide ? ' wide' : ''}`} onMouseDown={(event) => event.stopPropagation()} role="dialog">
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer" type="button">×</button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      <p className="sub">{text}</p>
    </div>
  );
}

export function Loading({ label = 'Chargement', inline = false }) {
  return (
    <div className={inline ? 'loading inline' : 'loading'}>
      <span className="spin" />
      <p>{label}</p>
    </div>
  );
}

export function Banner({ tone = 'danger', children }) {
  if (!children) return null;
  return <div className={`banner${tone === 'ok' ? ' ok' : ''}`}>{children}</div>;
}
