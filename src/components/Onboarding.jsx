import { useEffect, useState } from 'react';
import { api, apiForm, errorText } from '../api';
import { useAuth } from '../auth';
import { Banner, Field } from './ui';

/**
 * Premier pas d'un compte « personne » : tout (clients, devis, factures,
 * personnel, projets) se range dans une entreprise. On la crée ici.
 */
export function Onboarding() {
  const { user, switchCompany } = useAuth();
  const [form, setForm] = useState({ name: '', city: '', legal_form: '', email: user?.email || '', phone: user?.phone || '' });
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    api('/cities')
      .then((rows) => {
        setCities(rows);
        const preferred = rows.find((city) => city.label === 'Libreville') || rows[0];
        if (preferred) setForm((current) => ({ ...current, city: current.city || preferred.label }));
      })
      .catch((err) => setError(errorText(err)));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const created = await api('/companies', { method: 'POST', body: { ...form, country: 'Gabon' } });
      if (logo) {
        const body = new FormData();
        body.append('logo', logo);
        await apiForm(`/companies/${created.id}/logo`, body);
      }
      await switchCompany(created.id);
    } catch (err) {
      setError(errorText(err));
      setPending(false);
    }
  }

  const first = (user?.name || '').split(' ')[0];

  return (
    <div className="page onboard">
      <section className="onboard-card">
        <div className="onboard-copy">
          <p className="kicker">Bienvenue{first ? `, ${first}` : ''}</p>
          <h1>Créez votre première entreprise</h1>
          <p className="lead">Vos clients, devis, factures, personnel et projets sont rangés par entreprise. Vous pourrez en ajouter d’autres et passer de l’une à l’autre à tout moment.</p>
          <ol className="onboard-steps">
            <li><b>1</b><span>Votre entreprise<small>Nom, logo et coordonnées, repris sur vos documents</small></span></li>
            <li><b>2</b><span>Vos clients<small>Une fiche par client, avec son historique</small></span></li>
            <li><b>3</b><span>Premier devis<small>Cinq modèles au choix au moment de le générer</small></span></li>
          </ol>
        </div>
        <form className="onboard-form" onSubmit={submit}>
          <Banner>{error}</Banner>
          <Field label="Nom de l’entreprise"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus /></Field>
          <Field label="Logo, facultatif">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogo(event.target.files?.[0] || null)} />
          </Field>
          <div className="fields">
            <Field label="Forme juridique"><input value={form.legal_form} placeholder="SARL, EI…" onChange={(event) => setForm({ ...form, legal_form: event.target.value })} /></Field>
            <Field label="Ville">
              <select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required>
                <option value="">{cities.length ? 'Choisir une ville' : 'Aucune ville configurée'}</option>
                {cities.map((city) => <option key={city.id} value={city.label}>{city.label}</option>)}
              </select>
            </Field>
            <Field label="E-mail"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Téléphone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? 'Création…' : 'Créer l’entreprise'}</button>
        </form>
      </section>
    </div>
  );
}
