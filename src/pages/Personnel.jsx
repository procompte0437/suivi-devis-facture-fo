import { useEffect, useMemo, useState } from 'react';
import { api, errorText } from '../api';
import { Banner, Field, Modal } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, ListeDeroulante, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const EMPTY = { name: '', role_title: '', email: '', phone: '' };

export default function Personnel() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesEnCours, setRolesEnCours] = useState(true);
  const [rechercheRole, setRechercheRole] = useState('');
  const [ouvert, setOuvert] = useState(false);

  function load() {
    setLoading(true);
    return api('/staff')
      .then(setRows)
      .catch((err) => {
        setRows([]);
        setError(errorText(err));
      })
      .finally(() => setLoading(false));
  }

  function chargerRoles() {
    setRolesEnCours(true);
    return api('/referentiel')
      .then((listes) => setRoles(listes.role || []))
      .catch(() => setRoles([]))
      .finally(() => setRolesEnCours(false));
  }

  useEffect(() => { load(); chargerRoles(); }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    if (!form.role_title) {
      setError('Choisissez un rôle défini dans le référentiel.');
      return;
    }
    try {
      if (form.id) await api(`/staff/${form.id}`, { method: 'PUT', body: form });
      else await api('/staff', { method: 'POST', body: form });
      setForm(EMPTY);
      setOuvert(false);
      await load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function remove(member) {
    if (!window.confirm(`Retirer ${member.name} de l’équipe ?`)) return;
    try {
      await api(`/staff/${member.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(errorText(err));
    }
  }

  const optionsRole = useMemo(() => {
    const noms = [...new Set([
      ...roles.map((item) => item.label),
      ...rows.map((membre) => membre.role_title),
    ].filter(Boolean))];
    return [{ valeur: '', libelle: 'Tous les rôles' }, ...noms.map((nom) => ({ valeur: nom, libelle: nom }))];
  }, [roles, rows]);

  const optionsFormulaire = [
    { valeur: '', libelle: roles.length ? 'Choisir un rôle' : 'Aucun rôle défini' },
    ...roles.map((item) => ({ valeur: item.label, libelle: item.label })),
  ];
  const roleChoisi = roles.find((item) => item.label === form.role_title);
  const texteRoles = roles.length
    ? roles.map((item) => `${item.label} : ${item.meta?.explication || 'explication à rédiger.'}`).join('\n')
    : 'Aucun rôle pour l’instant. L’administrateur ou le dirigeant les ajoute dans le référentiel.';

  const filtres = rows.filter((membre) => {
    const mot = query.trim().toLowerCase();
    const roleOk = !role || membre.role_title === role;
    const texte = [membre.name, membre.email, membre.phone, membre.role_title].join(' ').toLowerCase();
    return roleOk && (!mot || texte.includes(mot));
  });
  const liste = useListePaginee(filtres);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Entreprise</p>
          <div className="titre-avec-info">
            <h1>Personnel</h1>
            <IconeInformation titre="Personnel" texte="Les personnes à qui sont assignées les tâches des projets. Le rôle se choisit parmi ceux définis par l’administrateur dans le référentiel. L’icône i à côté du rôle dit ce qu’il fait." />
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => { setForm(EMPTY); setOuvert(true); }}>Ajouter une personne</button>
      </header>
      <Banner>{error}</Banner>
      <div className="studio">
        {ouvert ? (
        <Modal title={form.id ? 'Modifier la personne' : 'Nouvelle personne'} onClose={() => { setOuvert(false); setForm(EMPTY); }} ouvert>
        <form className="stack" onSubmit={save}>
          <Field label="Nom"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
          <Field label={<span className="titre-avec-info">Rôle <IconeInformation titre={roleChoisi?.label || 'Rôles'} texte={roleChoisi?.meta?.explication || texteRoles} /></span>}>
            {rolesEnCours ? <ChargementPourcentage actif libelle="Chargement des rôles" /> : (
              <ListeDeroulante
                libelle="Rôle"
                options={optionsFormulaire}
                valeur={form.role_title}
                onChange={(valeur) => setForm({ ...form, role_title: valeur })}
                recherche={rechercheRole}
                onRecherche={setRechercheRole}
                placeholderRecherche="Nom du rôle"
                filtrerOptions
              />
            )}
          </Field>
          <Field label="E-mail"><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Téléphone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <button className="btn btn-primary" type="submit">{form.id ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
        </Modal>
        ) : null}
        <div className="card table-wrap" style={{ gridColumn: '1 / -1' }}>
          <BarreListe
            libelleFiltre="Rôle"
            optionsFiltre={optionsRole}
            filtre={role}
            onFiltre={setRole}
            recherche={query}
            onRecherche={setQuery}
            placeholderRecherche="Nom, e-mail, téléphone"
            taille={liste.taille}
            onTaille={liste.changerTaille}
            chargement={loading}
            onActualiser={() => load()}
          />
          {loading ? <ChargementPourcentage actif libelle="Lecture de l’équipe" /> : (
            <table>
              <thead><tr><th>Nom</th><th>Rôle</th><th>E-mail</th><th>Téléphone</th><th>Actions</th></tr></thead>
              <tbody>
                {liste.visibles.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>
                      <span className="titre-avec-info">
                        {member.role_title || '—'}
                        {roles.find((item) => item.label === member.role_title)?.meta?.explication ? (
                          <IconeInformation titre={member.role_title} texte={roles.find((item) => item.label === member.role_title).meta.explication} />
                        ) : null}
                      </span>
                    </td>
                    <td>{member.email || '—'}</td>
                    <td>{member.phone || '—'}</td>
                    <td>
                      <ActionsLigne
                        onModifier={() => { setForm(member); setOuvert(true); }}
                        onSupprimer={() => remove(member)}
                      />
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 ? <tr><td colSpan="5" className="muted">Personne pour l’instant.</td></tr> : null}
              </tbody>
            </table>
          )}
          <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
        </div>
      </div>
    </div>
  );
}
