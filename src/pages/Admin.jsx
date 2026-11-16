import { useEffect, useState } from 'react';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, formatDateTime, ROLES } from '../format';
import { Banner, Field, Modal, Pill } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const CONTACT_SUBJECTS = {
  demo: 'Démonstration',
  tarifs: 'Tarifs',
  support: 'Aide sur le portail',
  partenariat: 'Partenariat',
  autre: 'Autre',
};

const EMPTY_USER = { name: '', email: '', password: '', role: 'commercial', client_id: '', phone: '', job_title: '', is_active: true };

const AUDIT_ACTIONS = {
  'auth.entree': 'Connexion',
  'auth.sortie': 'Déconnexion',
  'auth.echec': 'Connexion refusée',
  'auth.inscription': 'Inscription',
  'projet.cree': 'Création',
  'projet.maj': 'Modification',
  'projet.avancement': 'Avancement',
  'projet.supprime': 'Suppression',
  'devis.cree': 'Création',
  'devis.maj': 'Modification',
  'devis.supprime': 'Suppression',
  'devis.statut': 'Changement d’état',
  'devis.decision_client': 'Décision client',
  'facture.creee': 'Création',
  'facture.maj': 'Modification',
  'facture.supprimee': 'Suppression',
  'facture.statut': 'Changement d’état',
  'facture.reglement': 'Règlement',
  'client.cree': 'Création',
  'client.maj': 'Modification',
  'client.supprime': 'Suppression',
  'equipe.cree': 'Création',
  'equipe.maj': 'Modification',
  'equipe.retire': 'Suppression',
  'entreprise.creee': 'Création',
  'entreprise.maj': 'Modification',
  'entreprise.logo': 'Logo',
  'entreprise.retiree': 'Suppression',
  'personnel.cree': 'Création',
  'personnel.maj': 'Modification',
  'personnel.retire': 'Suppression',
  'ville.ajoutee': 'Ville ajoutée',
  'ville.retiree': 'Ville retirée',
  'maison.maj': 'Paramètres',
  'maison.ouverte': 'Ouverture',
  'devis.relance': 'Relance',
};

export default function Admin() {
  const { user, settings, setSettings, isManager, ready: authReady } = useAuth();
  const [tab, setTab] = useState('equipe');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [activity, setActivity] = useState([]);
  const [audits, setAudits] = useState([]);
  const [messages, setMessages] = useState([]);
  const [house, setHouse] = useState(settings);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('');
  const [filtreMessage, setFiltreMessage] = useState('');
  const [filtreAudit, setFiltreAudit] = useState('');

  function contient(valeur, mot) {
    return String(valeur || '').toLowerCase().includes(mot);
  }

  const mot = recherche.trim().toLowerCase();
  const equipeFiltree = users.filter((membre) => {
    const roleOk = !filtreRole || membre.role === filtreRole;
    const texte = [membre.name, membre.email, membre.job_title, ...(membre.companies || []).map((item) => item.name)].join(' ');
    return roleOk && (!mot || contient(texte, mot));
  });
  const messagesFiltres = messages.filter((item) => {
    const etatOk = !filtreMessage || (filtreMessage === 'traite' ? item.handled_at : !item.handled_at);
    const texte = [item.name, item.email, item.subject, item.message].join(' ');
    return etatOk && (!mot || contient(texte, mot));
  });
  const auditsFiltres = audits.filter((item) => {
    const actionOk = !filtreAudit || item.action === filtreAudit;
    const texte = [item.user?.name, item.description, item.action, item.ip_address].join(' ');
    return actionOk && (!mot || contient(texte, mot));
  });
  const journalFiltre = activity.filter((item) => !mot || contient([item.description, item.user?.name].join(' '), mot));
  const listeEquipe = useListePaginee(equipeFiltree);
  const listeMessages = useListePaginee(messagesFiltres);
  const listeAudit = useListePaginee(auditsFiltres);
  const listeJournal = useListePaginee(journalFiltre);

  function actualiser() {
    setReady(false);
    Promise.all([api('/admin/users'), api('/admin/activity'), api('/admin/audit'), api('/settings'), api('/clients')])
      .then(([team, journal, trace, current, clientList]) => {
        setUsers(team);
        setClients(clientList);
        if (user?.role === 'admin') api('/admin/contact-messages').then(setMessages).catch(() => setMessages([]));
        setActivity(journal);
        setAudits(trace);
        setHouse(current);
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }

  useEffect(() => {
    if (!authReady) return;
    if (!isManager) {
      setReady(true);
      return;
    }
    Promise.all([api('/admin/users'), api('/admin/activity'), api('/admin/audit'), api('/settings'), api('/clients')])
      .then(([team, journal, trace, current, clientList]) => {
        setUsers(team);
        setClients(clientList);
        if (user?.role === 'admin') api('/admin/contact-messages').then(setMessages).catch(() => setMessages([]));
        setActivity(journal);
        setAudits(trace);
        setHouse(current);
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }, [isManager, authReady]);

  useEffect(() => {
    if (!ready || (tab !== 'journal' && tab !== 'audit')) return undefined;
    const load = () => {
      const path = tab === 'journal' ? '/admin/activity' : '/admin/audit';
      api(path).then(tab === 'journal' ? setActivity : setAudits).catch(() => {});
    };
    const timer = setInterval(load, tab === 'journal' ? 4000 : 8000);
    return () => clearInterval(timer);
  }, [ready, tab]);

  if (authReady && !isManager) {
    return (
      <div className="page">
        <h1>Administration</h1>
        <p className="lead">Cet écran est réservé aux administrateurs.</p>
      </div>
    );
  }

  async function saveUser(event) {
    event.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        is_active: Boolean(form.is_active),
        client_id: form.role === 'client' && form.client_id ? Number(form.client_id) : null,
      };
      if (!payload.password) delete payload.password;
      if (form.id) await api(`/admin/users/${form.id}`, { method: 'PUT', body: payload });
      else await api('/admin/users', { method: 'POST', body: payload });
      setUsers(await api('/admin/users'));
      setForm(null);
      setNotice('Compte enregistré.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function removeUser(member) {
    setError('');
    if (!window.confirm(`Retirer le compte de ${member.name} ?`)) return;
    try {
      await api(`/admin/users/${member.id}`, { method: 'DELETE' });
      setUsers(await api('/admin/users'));
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function toggleHandled(message) {
    try {
      const saved = await api(`/admin/contact-messages/${message.id}/handled`, { method: 'POST' });
      setMessages(messages.map((item) => (item.id === saved.id ? saved : item)));
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
      setNotice('Paramètres enregistrés. Ils s’appliquent aux prochains documents.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Entreprise</p>
          <div className="titre-avec-info">
            <h1>Administration</h1>
            <IconeInformation titre="Administration" texte="Comptes, paramètres, avancement des projets et trace de toutes les actions. La recherche est dans le filtre de l’onglet affiché." />
          </div>
        </div>
      </header>
      <div className="tabs">
        {[['equipe', 'Utilisateurs'], ['maison', 'Paramètres'], ['journal', 'Journal activités'], ['audit', 'Journal audit'], ...(user?.role === 'admin' ? [['messages', `Messages du site${messages.filter((item) => !item.handled_at).length ? ` (${messages.filter((item) => !item.handled_at).length})` : ''}`]] : [])].map(([value, label]) => (
          <button key={value} className={`chip${tab === value ? ' on' : ''}`} type="button" onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
      </div>

      {(!ready || (tab === 'maison' && !house)) ? <section className="card"><ChargementPourcentage actif libelle="Chargement" /></section> : null}

      {tab === 'equipe' && ready ? (
        <div className="card table-wrap">
          <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h2>Utilisateurs</h2>
            <button className="btn btn-primary btn-tiny" type="button" onClick={() => setForm({ ...EMPTY_USER })}>Nouveau compte</button>
          </div>
          <BarreListe
            libelleFiltre="Rôle"
            optionsFiltre={[{ valeur: '', libelle: 'Tous les rôles' }, ...Object.entries(ROLES).map(([valeur, libelle]) => ({ valeur, libelle }))]}
            filtre={filtreRole}
            onFiltre={setFiltreRole}
            recherche={recherche}
            onRecherche={setRecherche}
            placeholderRecherche="Nom, e-mail, entreprise"
            taille={listeEquipe.taille}
            onTaille={listeEquipe.changerTaille}
            chargement={!ready}
            onActualiser={actualiser}
          />
          <table>
            <thead><tr><th>Nom</th><th>Rôle</th><th>Entreprise</th><th>E-mail</th><th>Accès</th><th></th></tr></thead>
            <tbody>
              {listeEquipe.visibles.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}<br /><small className="muted">{member.job_title}</small></td>
                  <td>{ROLES[member.role] || member.role}{member.client ? <><br /><small className="muted">{member.client.company}</small></> : null}</td>
                  <td>{member.companies?.length ? member.companies.map((item) => item.name).join(', ') : <span className="muted">Sans entreprise</span>}</td>
                  <td>{member.email}</td>
                  <td><Pill status={member.is_active ? 'actif' : 'veille'} map={{ actif: { label: 'Actif', tone: 'ok' }, veille: { label: 'Inactif', tone: 'mute' } }} /></td>
                  <td>
                    <ActionsLigne
                      onModifier={() => setForm({ ...member, password: '' })}
                      onSupprimer={member.id !== user.id ? () => removeUser(member) : null}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationListe page={listeEquipe.page} pages={listeEquipe.pages} total={listeEquipe.total} aller={listeEquipe.aller} />
        </div>
      ) : null}

      {tab === 'maison' && house ? (
        <form className="studio" onSubmit={saveHouse}>
          <div className="card fields">
            <Field label="Raison sociale" wide><input value={house.company_name} onChange={(event) => setHouse({ ...house, company_name: event.target.value })} required /></Field>
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
            <button className="btn btn-primary" type="submit">Enregistrer</button>
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

      {tab === 'messages' && ready ? (
        <div className="card table-wrap">
          <div className="titre-avec-info">
            <h2>Messages du formulaire de contact</h2>
            <IconeInformation titre="Messages" texte="Demandes envoyées depuis le site. Le filtre distingue les messages encore ouverts de ceux déjà traités." />
          </div>
          <BarreListe
            libelleFiltre="État"
            optionsFiltre={[{ valeur: '', libelle: 'Tous' }, { valeur: 'ouvert', libelle: 'À traiter' }, { valeur: 'traite', libelle: 'Traités' }]}
            filtre={filtreMessage}
            onFiltre={setFiltreMessage}
            recherche={recherche}
            onRecherche={setRecherche}
            placeholderRecherche="Nom, e-mail, message"
            taille={listeMessages.taille}
            onTaille={listeMessages.changerTaille}
            chargement={!ready}
            onActualiser={actualiser}
          />
          {messagesFiltres.length ? (
            <table>
              <thead><tr><th>Reçu le</th><th>Expéditeur</th><th>Objet</th><th>Message</th><th></th></tr></thead>
              <tbody>
                {listeMessages.visibles.map((item) => (
                  <tr key={item.id} style={item.handled_at ? { opacity: 0.6 } : null}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.name}<br /><small className="muted">{item.email}{item.phone ? ` · ${item.phone}` : ''}</small></td>
                    <td>{CONTACT_SUBJECTS[item.subject] || item.subject}</td>
                    <td style={{ maxWidth: 420, whiteSpace: 'pre-wrap' }}>{item.message}</td>
                    <td><button className="btn btn-tiny" type="button" onClick={() => toggleHandled(item)}>{item.handled_at ? 'Rouvrir' : 'Marquer traité'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">Aucun message pour l’instant.</p>}
          <PaginationListe page={listeMessages.page} pages={listeMessages.pages} total={listeMessages.total} aller={listeMessages.aller} />
        </div>
      ) : null}

      {tab === 'journal' && ready ? (
        <div className="card timeline">
          <div className="titre-avec-info">
            <h2>Journal activités</h2>
            <IconeInformation titre="Journal activités" texte="Avancement des projets, mis à jour dès qu’un suivi est enregistré." />
          </div>
          <BarreListe
            libelleFiltre="Période"
            optionsFiltre={[{ valeur: '', libelle: 'Tout le journal' }]}
            filtre=""
            onFiltre={() => {}}
            recherche={recherche}
            onRecherche={setRecherche}
            placeholderRecherche="Description, auteur"
            taille={listeJournal.taille}
            onTaille={listeJournal.changerTaille}
            chargement={!ready}
            onActualiser={actualiser}
          />
          {journalFiltre.length ? listeJournal.visibles.map((item) => (
            <article key={item.id}>
              <span className="dot" />
              <div className="quiet-row">
                <span>{item.description}<br /><small className="muted">{item.user?.name || 'Système'} · {formatDateTime(item.created_at)}</small></span>
                <span className="muted">{formatDate(item.created_at)}</span>
              </div>
            </article>
          )) : <p className="muted">Aucun avancement enregistré pour le moment.</p>}
          <PaginationListe page={listeJournal.page} pages={listeJournal.pages} total={listeJournal.total} aller={listeJournal.aller} />
        </div>
      ) : null}

      {tab === 'audit' && ready ? (
        <div className="card table-wrap">
          <div className="titre-avec-info">
            <h2>Journal audit</h2>
            <IconeInformation titre="Journal audit" texte="Qui a fait quoi, quand, par quel moyen, depuis quel navigateur et quelle adresse IP." />
          </div>
          <BarreListe
            libelleFiltre="Action"
            optionsFiltre={[{ valeur: '', libelle: 'Toutes les actions' }, ...Object.entries(AUDIT_ACTIONS).map(([valeur, libelle]) => ({ valeur, libelle }))]}
            filtre={filtreAudit}
            onFiltre={setFiltreAudit}
            recherche={recherche}
            onRecherche={setRecherche}
            placeholderRecherche="Personne, description, adresse IP"
            taille={listeAudit.taille}
            onTaille={listeAudit.changerTaille}
            chargement={!ready}
            onActualiser={actualiser}
          />
          {auditsFiltres.length ? (
            <table>
              <thead>
                <tr>
                  <th>Quand</th>
                  <th>Qui</th>
                  <th>Action</th>
                  <th>Quoi et pourquoi</th>
                  <th>Comment</th>
                  <th>Navigateur</th>
                  <th>Adresse IP</th>
                </tr>
              </thead>
              <tbody>
                {listeAudit.visibles.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.created_at)}</td>
                    <td>{item.user?.name || 'Inconnu'}<br /><small className="muted">{ROLES[item.user?.role] || item.user?.role || '—'}</small></td>
                    <td>{AUDIT_ACTIONS[item.action] || item.action}</td>
                    <td>{item.description}{item.company?.name ? <><br /><small className="muted">{item.company.name}</small></> : null}</td>
                    <td><small className="muted">{[item.http_method, item.path].filter(Boolean).join(' ') || '—'}</small></td>
                    <td>{item.browser || '—'}{item.user_agent ? <><br /><small className="muted" style={{ display: 'block', maxWidth: 240, wordBreak: 'break-word' }}>{item.user_agent}</small></> : null}</td>
                    <td>{item.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="muted">Aucune action enregistrée.</p>}
          <PaginationListe page={listeAudit.page} pages={listeAudit.pages} total={listeAudit.total} aller={listeAudit.aller} />
        </div>
      ) : null}

      {form ? (
        <Modal title={form.id ? 'Modifier le compte' : 'Nouveau compte'} onClose={() => setForm(null)}>
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
                  {form.role === 'dirigeant' ? <option value="dirigeant">Dirigeant</option> : null}
                  <option value="admin">Administrateur</option>
                  <option value="commercial">Responsable commercial</option>
                  <option value="comptable">Comptable</option>
                  <option value="chef_projet">Chef de projet</option>
                  <option value="client">Client</option>
                </select>
              </Field>
              {form.role === 'client' ? (
                <Field label="Fiche client" wide>
                  <select value={form.client_id || ''} onChange={(event) => setForm({ ...form, client_id: event.target.value })} required>
                    <option value="">Choisir le client</option>
                    {clients.map((item) => <option key={item.id} value={item.id}>{item.company}</option>)}
                  </select>
                </Field>
              ) : null}
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
