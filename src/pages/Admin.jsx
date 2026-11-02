import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, ROLES } from '../format';
import { Banner, Field, Loading, Modal, Pill } from '../components/ui';

const EMPTY_USER = { name: '', email: '', password: '', role: 'commercial', phone: '', job_title: '', is_active: true };

export default function Admin() {
  const { user, settings, setSettings } = useAuth();
  const [tab, setTab] = useState('equipe');
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [house, setHouse] = useState(settings);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setReady(true);
      return;
    }
    Promise.all([api('/admin/users'), api('/admin/activity'), api('/settings')])
      .then(([team, journal, current]) => {
        setUsers(team);
        setActivity(journal);
        setHouse(current);
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="page">
        <h1>Administration</h1>
        <p className="lead">Cet espace est réservé à la direction de l’atelier.</p>
      </div>
    );
  }
  if (!ready || !house) return <Loading inline label="Ouverture de la maison" />;

  async function saveUser(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = { ...form, is_active: Boolean(form.is_active) };
      if (!payload.password) delete payload.password;
      if (form.id) await api(`/admin/users/${form.id}`, { method: 'PUT', body: payload });
      else await api('/admin/users', { method: 'POST', body: payload });
      setUsers(await api('/admin/users'));
      setForm(null);
      setNotice('Équipe mise à jour.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function removeUser(member) {
    setError('');
    try {
      await api(`/admin/users/${member.id}`, { method: 'DELETE' });
      setUsers(await api('/admin/users'));
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function saveHouse(event) {
    event.preventDefault();
    setError('');
    try {
      const saved = await api('/admin/settings', { method: 'PUT', body: { ...house, tax_rate: Number(house.tax_rate) } });
      setHouse(saved);
      setSettings(saved);
      setNotice('La maison est à jour. Les prochains documents en héritent.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Maison</p>
          <h1>Administration</h1>
          <p className="lead">L’équipe, l’identité de l’atelier et la mémoire des gestes.</p>
        </div>
      </header>
      <div className="tabs">
        {[['equipe', 'Équipe'], ['maison', 'Société'], ['journal', 'Journal']].map(([value, label]) => (
          <button key={value} className={`chip${tab === value ? ' on' : ''}`} type="button" onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
      </div>

      {tab === 'equipe' ? (
        <div className="card table-wrap">
          <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h2>Équipe</h2>
            <button className="btn btn-primary btn-tiny" type="button" onClick={() => setForm({ ...EMPTY_USER })}>Inviter</button>
          </div>
          <table>
            <thead><tr><th>Nom</th><th>Rôle</th><th>E-mail</th><th>Accès</th><th></th></tr></thead>
            <tbody>
              {users.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}<br /><small className="muted">{member.job_title}</small></td>
                  <td>{ROLES[member.role]}</td>
                  <td>{member.email}</td>
                  <td><Pill status={member.is_active ? 'actif' : 'veille'} map={{ actif: { label: 'Actif', tone: 'ok' }, veille: { label: 'Inactif', tone: 'mute' } }} /></td>
                  <td className="actions">
                    <button className="btn btn-tiny" type="button" onClick={() => setForm({ ...member, password: '' })}>Modifier</button>
                    {member.id !== user.id ? <button className="btn btn-tiny btn-danger" type="button" onClick={() => removeUser(member)}>Retirer</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'maison' ? (
        <form className="studio" onSubmit={saveHouse}>
          <div className="card fields">
            <Field label="Maison" wide><input value={house.company_name} onChange={(event) => setHouse({ ...house, company_name: event.target.value })} required /></Field>
            <Field label="Signature" wide><input value={house.tagline || ''} onChange={(event) => setHouse({ ...house, tagline: event.target.value })} /></Field>
            <Field label="Adresse"><input value={house.address || ''} onChange={(event) => setHouse({ ...house, address: event.target.value })} /></Field>
            <Field label="Ville"><input value={house.city || ''} onChange={(event) => setHouse({ ...house, city: event.target.value })} /></Field>
            <Field label="Pays"><input value={house.country || ''} onChange={(event) => setHouse({ ...house, country: event.target.value })} /></Field>
            <Field label="E-mail"><input value={house.email || ''} onChange={(event) => setHouse({ ...house, email: event.target.value })} /></Field>
            <Field label="Téléphone"><input value={house.phone || ''} onChange={(event) => setHouse({ ...house, phone: event.target.value })} /></Field>
            <Field label="Identifiant fiscal"><input value={house.tax_id || ''} onChange={(event) => setHouse({ ...house, tax_id: event.target.value })} /></Field>
            <Field label="TVA %"><input type="number" value={house.tax_rate} onChange={(event) => setHouse({ ...house, tax_rate: event.target.value })} /></Field>
            <Field label="Devise">
              <select value={house.currency} onChange={(event) => setHouse({ ...house, currency: event.target.value })}>
                <option value="XAF">Franc CFA</option>
                <option value="EUR">Euro</option>
                <option value="USD">Dollar</option>
              </select>
            </Field>
            <Field label="Préfixe devis"><input value={house.quote_prefix} onChange={(event) => setHouse({ ...house, quote_prefix: event.target.value })} /></Field>
            <Field label="Préfixe facture"><input value={house.invoice_prefix} onChange={(event) => setHouse({ ...house, invoice_prefix: event.target.value })} /></Field>
            <Field label="Modalités de règlement" wide><textarea value={house.payment_note || ''} onChange={(event) => setHouse({ ...house, payment_note: event.target.value })} /></Field>
            <Field label="Pied de document" wide><textarea value={house.footer || ''} onChange={(event) => setHouse({ ...house, footer: event.target.value })} /></Field>
            <button className="btn btn-primary" type="submit">Enregistrer la maison</button>
          </div>
          <aside className="letterhead">
            <p className="kicker">Aperçu d’en-tête</p>
            <h2 style={{ fontSize: 40, marginTop: 8 }}>{house.company_name}</h2>
            <p>{house.tagline}</p>
            <p className="muted" style={{ marginTop: 16 }}>{[house.address, house.city, house.country].filter(Boolean).join(' · ')}</p>
            <p className="muted">{[house.email, house.phone].filter(Boolean).join(' · ')}</p>
            <p className="muted">{house.tax_id}</p>
            <p style={{ marginTop: 22, whiteSpace: 'pre-wrap' }}>{house.payment_note}</p>
          </aside>
        </form>
      ) : null}

      {tab === 'journal' ? (
        <div className="card timeline">
          {activity.map((item) => (
            <article key={item.id}>
              <span className="dot" />
              <div className="quiet-row">
                <span>{item.description}<br /><small className="muted">{item.user?.name || 'Atelier'} · {item.action}</small></span>
                <span className="muted">{formatDate(item.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {form ? (
        <Modal title={form.id ? 'Modifier un accès' : 'Inviter dans l’atelier'} onClose={() => setForm(null)}>
          <form className="stack" onSubmit={saveUser}>
            <Banner>{error}</Banner>
            <div className="fields">
              <Field label="Nom" wide><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
              <Field label="E-mail" wide><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></Field>
              <Field label={form.id ? 'Nouveau mot de passe' : 'Mot de passe'} wide>
                <input type="password" value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!form.id} />
              </Field>
              <Field label="Fonction"><input value={form.job_title || ''} onChange={(event) => setForm({ ...form, job_title: event.target.value })} /></Field>
              <Field label="Rôle">
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="admin">Administration</option>
                  <option value="commercial">Commercial</option>
                  <option value="comptable">Comptabilité</option>
                </select>
              </Field>
              <label className="check-row wide">
                <input type="checkbox" checked={Boolean(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
                Compte actif
              </label>
            </div>
            <button className="btn btn-primary" type="submit">Enregistrer</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
