import { useEffect, useRef, useState } from 'react';
import { api, apiForm, errorText } from '../api';
import { useAuth } from '../auth';
import { afficherToast } from '../components/Toasts';
import { Banner, Loading } from '../components/ui';
import { formatDate } from '../format';
import { refreshSiteImages, SITE_IMAGE_SLOTS } from '../siteImages';

/*
 * Images du site public, réservées à l'administrateur de la plateforme.
 * Chaque emplacement montre l'image en place ; on peut la remplacer (clic ou glisser-déposer),
 * modifier son texte alternatif, ou revenir à l'image d'origine.
 */
export default function SiteImages() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState('Toutes');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api('/admin/site-images')
      .then((data) => setSaved(Array.isArray(data) ? {} : data))
      .catch((err) => setError(errorText(err)));
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="page">
        <h1>Images du site</h1>
        <p className="lead">Cet écran est réservé à l’administrateur de la plateforme.</p>
      </div>
    );
  }
  if (error) return <div className="page"><Banner>{error}</Banner></div>;
  if (!saved) return <Loading inline label="Chargement des images" />;

  const pages = ['Toutes', ...new Set(SITE_IMAGE_SLOTS.map((item) => item.page))];
  const shown = SITE_IMAGE_SLOTS.filter((item) => page === 'Toutes' || item.page === page);
  const customCount = Object.values(saved).filter((item) => item?.path).length;

  function onChange(slot, value) {
    setSaved((current) => {
      const next = { ...current };
      if (value) next[slot] = value;
      else delete next[slot];
      return next;
    });
    refreshSiteImages();
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Site public</p>
          <h1>Images du site</h1>
          <p className="lead">Remplacez les photos de l’accueil, des secteurs, de la page À propos et de la connexion. Les changements sont visibles immédiatement sur le site.</p>
        </div>
        <a className="btn" href="/" target="_blank" rel="noreferrer">Voir le site</a>
      </header>

      <div className="si-toolbar">
        <div className="filters">
          {pages.map((item) => (
            <button key={item} type="button" className={`chip${page === item ? ' on' : ''}`} onClick={() => setPage(item)}>{item}</button>
          ))}
        </div>
        <span className="muted">{customCount} image{customCount > 1 ? 's' : ''} personnalisée{customCount > 1 ? 's' : ''} sur {SITE_IMAGE_SLOTS.length}</span>
      </div>

      <div className="si-grid">
        {shown.map((item) => (
          <SlotCard key={item.slot} item={item} saved={saved[item.slot]} onChange={(value) => onChange(item.slot, value)} />
        ))}
      </div>
      <p className="muted si-note">Formats acceptés : JPG, PNG ou WebP, 5 Mo maximum. Une photo d’au moins 1600 px de large donne le meilleur rendu. Le texte alternatif décrit l’image pour les lecteurs d’écran et le référencement.</p>
    </div>
  );
}

function SlotCard({ item, saved, onChange }) {
  const input = useRef(null);
  const [alt, setAlt] = useState(saved?.alt ?? item.alt);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [preview, setPreview] = useState(null);

  const custom = Boolean(saved?.path);
  const src = preview || (custom ? saved.url : item.src);
  const altChanged = alt !== (saved?.alt ?? item.alt);

  async function upload(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      afficherToast('Choisissez une image JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      afficherToast('L’image ne doit pas dépasser 5 Mo.');
      return;
    }
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('alt', alt);
      const result = await apiForm(`/admin/site-images/${item.slot}`, form);
      onChange(result);
      afficherToast('Image remplacée.', 'succes');
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setPreview(null);
      URL.revokeObjectURL(local);
      setBusy(false);
    }
  }

  async function saveAlt() {
    setBusy(true);
    try {
      const result = await api(`/admin/site-images/${item.slot}`, { method: 'PUT', body: { alt } });
      onChange(result);
      afficherToast('Texte alternatif enregistré.', 'succes');
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!window.confirm(`Revenir à l’image d’origine pour « ${item.label} » ?`)) return;
    setBusy(true);
    try {
      await api(`/admin/site-images/${item.slot}`, { method: 'DELETE' });
      onChange(null);
      setAlt(item.alt);
      afficherToast('Image d’origine rétablie.', 'succes');
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`si-card${custom ? ' custom' : ''}`}>
      <button
        type="button"
        className={`si-drop si-${item.shape}${over ? ' over' : ''}`}
        onClick={() => input.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); upload(event.dataTransfer.files?.[0]); }}
        disabled={busy}
        aria-label={`Remplacer l’image : ${item.label}`}
      >
        <img src={src} alt="" />
        <span className="si-overlay">{busy ? 'Envoi…' : 'Cliquer ou déposer une image'}</span>
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ''; }} />
      <div className="si-body">
        <div className="si-head">
          <span className="si-page">{item.page}</span>
          <span className={`si-state${custom ? ' on' : ''}`}>{custom ? 'Personnalisée' : 'Image d’origine'}</span>
        </div>
        <h3>{item.label}</h3>
        <label className="field">
          <span>Texte alternatif</span>
          <input value={alt} maxLength={200} onChange={(event) => setAlt(event.target.value)} placeholder="Décrivez la photo en une phrase" />
        </label>
        <div className="si-actions">
          <button className="btn btn-primary btn-tiny" type="button" disabled={busy} onClick={() => input.current?.click()}>Remplacer</button>
          {altChanged ? <button className="btn btn-tiny" type="button" disabled={busy} onClick={saveAlt}>Enregistrer le texte</button> : null}
          {custom ? <button className="btn btn-tiny btn-danger" type="button" disabled={busy} onClick={reset}>Revenir à l’origine</button> : null}
        </div>
        {saved?.updated_at ? (
          <small className="muted">Modifiée le {formatDate(saved.updated_at)}{saved.editor ? ` par ${saved.editor.name}` : ''}</small>
        ) : null}
      </div>
    </article>
  );
}
