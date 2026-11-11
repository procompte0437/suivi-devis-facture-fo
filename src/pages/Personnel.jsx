import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { Banner, Field, Loading } from '../components/ui';

const EMPTY = { name: '', role_title: '', email: '', phone: '' };

export default function Personnel() {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  function load() {
    return api('/staff').then(setRows).catch((err) => setError(errorText(err)));
  }

  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      if (form.id) await api(`/staff/${form.id}`, { method: 'PUT', body: form });
      else await api('/staff', { method: 'POST', body: form });
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function remove(id) {
    await api(`/staff/${id}`, { method: 'DELETE' });
    await load();
  }

  if (!rows) return <Loading inline label="Lecture de l’équipe" />;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Entreprise</p>
          <h1>Personnel</h1>
          <p className="lead">Les personnes à qui sont assignées les tâches des projets.</p>
        </div>
      </header>
      <Banner>{error}</Banner>
      <div className="studio">
        <form className="card fields" onSubmit={save}>
          <Field label="Nom"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <Field label="Rôle"><input value={form.role_title} onChange={(event) => setForm({ ...form, role_title: event.target.value })} /></Field>
          <Field label="E-mail"><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <button className="btn btn-primary" type="submit">{form.id ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
        <div className="card">
          {rows.length === 0 ? <p className="muted">Personne pour l’instant.</p> : null}
          <div className="link-list">
            {rows.map((member) => (
              <div key={member.id}>
                <span><b>{member.name}</b><br /><small className="muted">{member.role_title}</small></span>
                <span className="actions">
                  <button className="btn btn-tiny" type="button" onClick={() => setForm(member)}>Modifier</button>
                  <button className="btn btn-tiny" type="button" onClick={() => remove(member.id)}>Retirer</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
