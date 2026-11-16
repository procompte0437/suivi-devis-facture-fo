import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../api';
import { afficherToast } from '../components/Toasts';
import { Field, Modal } from '../components/ui';
import { ActionsLigne, BarreListe, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const EMPTY_SOCIETE = {
  id: null, label: '', contact_name: '', email: '', phone: '', address: '', city: '', tax_id: '',
};

const LISTS = [
  ['ville', 'Villes', 'Villes proposées sur les fiches clients et sur votre entreprise.'],
  ['statut', 'Statuts', 'Statuts proposés quand vous ouvrez ou modifiez un client.'],
  ['forme', 'Formes juridiques', 'SARL, EI, association… proposées pour votre entreprise.'],
  ['pays', 'Pays', 'Pays proposés sur les fiches clients.'],
];

const EMPTY_ROLE = { id: null, label: '', explication: '' };

export function ReferentielLists({ onglet, refs, clients, canEdit, peutDefinirRoles, onSaved }) {
  const [drafts, setDrafts] = useState({ ville: '', statut: '', forme: '', pays: '' });
  const [societe, setSociete] = useState(EMPTY_SOCIETE);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [busy, setBusy] = useState(false);
  // Fenêtre d’ajout : société ou rôle. L’édition reprend la même fenêtre.
  const [fenetre, setFenetre] = useState(null);

  async function run(action) {
    setBusy(true);
    try {
      await action();
      await onSaved();
      return true;
    } catch (err) {
      afficherToast(errorText(err), 'erreur');
      return false;
    } finally {
      setBusy(false);
    }
  }

  function addSimple(kind) {
    const label = drafts[kind].trim();
    if (!label) return false;
    return run(async () => {
      await api('/referentiel', { method: 'POST', body: { kind, label } });
      setDrafts((current) => ({ ...current, [kind]: '' }));
      const phrases = {
        ville: `La ville « ${label} » a été ajoutée. Elle est proposée dans les formulaires.`,
        statut: `Le statut « ${label} » a été ajouté. Il est proposé sur les fiches clients.`,
        forme: `La forme juridique « ${label} » a été ajoutée. Elle est proposée sur la fiche entreprise.`,
        pays: `Le pays « ${label} » a été ajouté. Il est proposé sur les fiches clients.`,
      };
      afficherToast(phrases[kind] || `« ${label} » a été ajouté au référentiel.`, 'succes');
    });
  }

  function remove(item) {
    run(async () => {
      await api(`/referentiel/${item.id}`, { method: 'DELETE' });
      if (societe.id === item.id) setSociete(EMPTY_SOCIETE);
      if (roleForm.id === item.id) setRoleForm(EMPTY_ROLE);
      afficherToast(`« ${item.label} » a été retiré du référentiel.`, 'succes');
    });
  }

  function saveSociete(event) {
    event.preventDefault();
    const body = {
      kind: 'societe',
      label: societe.label.trim(),
      meta: {
        contact_name: societe.contact_name,
        email: societe.email,
        phone: societe.phone,
        address: societe.address,
        city: societe.city,
        tax_id: societe.tax_id,
      },
    };
    run(async () => {
      if (societe.id) await api(`/referentiel/${societe.id}`, { method: 'PUT', body });
      else await api('/referentiel', { method: 'POST', body });
      const nom = body.label;
      setSociete(EMPTY_SOCIETE);
      setFenetre(null);
      afficherToast(
        societe.id
          ? `La société « ${nom} » a été mise à jour. Les fiches clients rattachées reprennent ce nom.`
          : `La société « ${nom} » a été ajoutée. Vous pouvez la choisir en ouvrant un client entreprise.`,
        'succes',
      );
    });
  }

  function saveRole(event) {
    event.preventDefault();
    const body = {
      kind: 'role',
      label: roleForm.label.trim(),
      meta: { explication: roleForm.explication.trim() },
    };
    if (!body.label || !body.meta.explication) return;
    run(async () => {
      if (roleForm.id) await api(`/referentiel/${roleForm.id}`, { method: 'PUT', body });
      else await api('/referentiel', { method: 'POST', body });
      const nom = body.label;
      setRoleForm(EMPTY_ROLE);
      setFenetre(null);
      afficherToast(
        roleForm.id
          ? `Le rôle « ${nom} » a été mis à jour. Le personnel qui le portait déjà garde ce nom.`
          : `Le rôle « ${nom} » a été ajouté. Il apparaît dans le formulaire Personnel.`,
        'succes',
      );
    });
  }

  function editRole(item) {
    setRoleForm({ id: item.id, label: item.label, explication: item.meta?.explication || '' });
    setFenetre('role');
  }

  function editSociete(item) {
    const meta = item.meta || {};
    setFenetre('societe');
    setSociete({
      id: item.id,
      label: item.label,
      contact_name: meta.contact_name || '',
      email: meta.email || '',
      phone: meta.phone || '',
      address: meta.address || '',
      city: meta.city || '',
      tax_id: meta.tax_id || '',
    });
  }

  const societes = refs?.societe || [];
  const bySociete = new Map(societes.map((item) => [item.id, []]));
  const individuals = [];
  const loose = [];
  (clients || []).forEach((client) => {
    if (client.kind === 'individuel') individuals.push(client);
    else if (client.societe_id && bySociete.has(client.societe_id)) bySociete.get(client.societe_id).push(client);
    else loose.push(client);
  });

  return (
    <div className="ref-block">
      {onglet === 'societes' ? <section className="card">
        <div className="titre-avec-info">
          <h2>Sociétés</h2>
          <IconeInformation titre="Sociétés" texte="Les sociétés avec lesquelles vous travaillez. Un client entreprise se choisit dans cette liste." />
        </div>
        <ListeSocietes
          societes={societes}
          peutModifier={canEdit}
          occupe={busy}
          onModifier={editSociete}
          onRetirer={remove}
          onActualiser={onSaved}
        />
        {canEdit ? <button className="btn" type="button" onClick={() => { setSociete(EMPTY_SOCIETE); setFenetre('societe'); }}>Ajouter une société</button> : null}
      </section> : null}

      {onglet === 'clients' ? <section className="card">
        <div className="titre-avec-info">
          <h2>Clients par société</h2>
          <IconeInformation titre="Clients par société" texte="Les fiches déjà ouvertes, rangées selon la société du référentiel. Un particulier n’est rattaché à aucune société." />
        </div>
        {societes.map((item) => (
          <div key={item.id} className="ref-group">
            <h3>{item.label}</h3>
            <ClientLinks rows={bySociete.get(item.id) || []} empty="Aucun client pour cette société." />
          </div>
        ))}
        {loose.length ? (
          <div className="ref-group">
            <h3>Sans société du référentiel</h3>
            <ClientLinks rows={loose} />
          </div>
        ) : null}
        <div className="ref-group">
          <h3>Particuliers</h3>
          <ClientLinks rows={individuals} empty="Aucun client individuel." />
        </div>
      </section> : null}

      {onglet === 'roles' ? <section className="card">
        <div className="titre-avec-info">
          <h2>Rôles du personnel</h2>
          <IconeInformation titre="Rôles du personnel" texte="Métiers proposés quand on ajoute une personne. Seuls l’administrateur et le dirigeant les définissent. Chaque rôle dit ce que la personne fait." />
        </div>
        <ListeRoles
          roles={refs?.role || []}
          peutModifier={peutDefinirRoles}
          occupe={busy}
          onModifier={editRole}
          onRetirer={remove}
          onActualiser={onSaved}
        />
        {peutDefinirRoles ? <button className="btn" type="button" onClick={() => { setRoleForm(EMPTY_ROLE); setFenetre('role'); }}>Ajouter un rôle</button> : null}
      </section> : null}

      <div className="ref-grid">
        {LISTS.filter(([kind]) => kind === onglet).map(([kind, title, text]) => (
          <CarteReferentiel
            key={kind}
            titre={title}
            texte={text}
            lignes={refs?.[kind] || []}
            brouillon={drafts[kind]}
            peutModifier={canEdit}
            occupe={busy}
            onBrouillon={(valeur) => setDrafts({ ...drafts, [kind]: valeur })}
            onAjouter={() => addSimple(kind)}
            onRetirer={remove}
            onActualiser={onSaved}
          />
        ))}
      </div>
      {fenetre === 'societe' ? (
        <Modal title={societe.id ? 'Modifier la société' : 'Nouvelle société'} onClose={() => { setFenetre(null); setSociete(EMPTY_SOCIETE); }} wide>
          <form className="fields" onSubmit={saveSociete}>
            <Field label="Nom de la société"><input value={societe.label} onChange={(event) => setSociete({ ...societe, label: event.target.value })} required /></Field>
            <Field label="Contact"><input value={societe.contact_name} onChange={(event) => setSociete({ ...societe, contact_name: event.target.value })} /></Field>
            <Field label="E-mail"><input value={societe.email} onChange={(event) => setSociete({ ...societe, email: event.target.value })} /></Field>
            <Field label="Téléphone"><input value={societe.phone} onChange={(event) => setSociete({ ...societe, phone: event.target.value })} /></Field>
            <Field label="Ville">
              <select value={societe.city} onChange={(event) => setSociete({ ...societe, city: event.target.value })}>
                <option value="">Choisir</option>
                {(refs?.ville || []).map((item) => <option key={item.id} value={item.label}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Identifiant fiscal"><input value={societe.tax_id} onChange={(event) => setSociete({ ...societe, tax_id: event.target.value })} /></Field>
            <Field label="Adresse" wide><input value={societe.address} onChange={(event) => setSociete({ ...societe, address: event.target.value })} /></Field>
            <button className="btn btn-primary wide" type="submit" disabled={busy}>{societe.id ? 'Enregistrer la société' : 'Ajouter la société'}</button>
          </form>
        </Modal>
      ) : null}
      {fenetre === 'role' ? (
        <Modal title={roleForm.id ? 'Modifier le rôle' : 'Nouveau rôle'} onClose={() => { setFenetre(null); setRoleForm(EMPTY_ROLE); }}>
          <form className="stack" onSubmit={saveRole}>
            <Field label="Nom du rôle" wide><input value={roleForm.label} onChange={(event) => setRoleForm({ ...roleForm, label: event.target.value })} required /></Field>
            <Field label="Ce que fait ce rôle" wide><textarea value={roleForm.explication} onChange={(event) => setRoleForm({ ...roleForm, explication: event.target.value })} required /></Field>
            <button className="btn btn-primary" type="submit" disabled={busy}>{roleForm.id ? 'Enregistrer le rôle' : 'Ajouter le rôle'}</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function ClientLinks({ rows, empty }) {
  const [recherche, setRecherche] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = rows.filter((client) => {
    const texte = [client.company, client.contact_name, client.city, client.code].join(' ').toLowerCase();
    return !mot || texte.includes(mot);
  });
  const liste = useListePaginee(filtres, 5);
  return (
    <div>
      <BarreListe
        libelleFiltre="Liste"
        optionsFiltre={[{ valeur: '', libelle: 'Tous les clients' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Nom, ville, code"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        onActualiser={() => setRecherche('')}
      />
      <div className="link-list">
        {liste.visibles.map((client) => (
          <Link key={client.id} to={`/clients/${client.id}`}>
            <span>{client.kind === 'individuel' ? client.contact_name : client.company}<br /><small className="muted">{client.city || client.code}</small></span>
          </Link>
        ))}
        {liste.total === 0 ? <p className="muted">{empty || 'Aucun client.'}</p> : null}
      </div>
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </div>
  );
}

/** Sociétés du référentiel : recherche, pages, crayon et suppression. */
function ListeSocietes({ societes, peutModifier, occupe, onModifier, onRetirer, onActualiser }) {
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = societes.filter((item) => {
    const nom = (item.label || '').toLowerCase();
    const ville = (item.meta?.city || '').toLowerCase();
    const email = (item.meta?.email || '').toLowerCase();
    const texte = filtre === 'nom' ? nom : filtre === 'ville' ? ville : filtre === 'email' ? email : `${nom} ${ville} ${email}`;
    return !mot || texte.includes(mot);
  });
  const liste = useListePaginee(filtres, 5);

  return (
    <>
      <BarreListe
        libelleFiltre="Sociétés"
        optionsFiltre={[
          { valeur: '', libelle: 'Toutes' },
          { valeur: 'nom', libelle: 'Nom' },
          { valeur: 'ville', libelle: 'Ville' },
          { valeur: 'email', libelle: 'E-mail' },
        ]}
        filtre={filtre}
        onFiltre={setFiltre}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Nom, ville, e-mail"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={occupe}
        onActualiser={onActualiser}
      />
      <ul className="ref-list">
        {liste.visibles.map((item) => (
          <li key={item.id}>
            <span>
              <b>{item.label}</b>
              <small>{[item.meta?.city, item.meta?.email, item.meta?.phone].filter(Boolean).join(' · ') || 'Coordonnées à compléter'}</small>
            </span>
            {peutModifier ? (
              <ActionsLigne onModifier={() => onModifier(item)} onSupprimer={() => onRetirer(item)} />
            ) : null}
          </li>
        ))}
      </ul>
      {liste.total === 0 ? <p className="muted">Aucune société pour le moment.</p> : null}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </>
  );
}

/** Rôles du personnel : le nom se choisit, l’icône i dit ce que le rôle fait. */
function ListeRoles({ roles, peutModifier, occupe, onModifier, onRetirer, onActualiser }) {
  const [recherche, setRecherche] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = roles.filter((item) => !mot || `${item.label} ${item.meta?.explication || ''}`.toLowerCase().includes(mot));
  const liste = useListePaginee(filtres, 5);

  return (
    <>
      <BarreListe
        libelleFiltre="Rôles"
        optionsFiltre={[{ valeur: '', libelle: 'Tous' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Nom du rôle"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={occupe}
        onActualiser={onActualiser}
      />
      <ul className="ref-list">
        {liste.visibles.map((item) => (
          <li key={item.id}>
            <span className="titre-avec-info">
              <b>{item.label}</b>
              <IconeInformation titre={item.label} texte={item.meta?.explication || 'Aucune explication pour ce rôle.'} />
            </span>
            {peutModifier ? (
              <ActionsLigne onModifier={() => onModifier(item)} onSupprimer={() => onRetirer(item)} />
            ) : null}
          </li>
        ))}
      </ul>
      {liste.total === 0 ? <p className="muted">Aucun rôle. L’administrateur les ajoute ici.</p> : null}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </>
  );
}

/** Une liste du référentiel : recherche dans le filtre, pages, actualisation, retrait par icône. */
function CarteReferentiel({ titre, texte, lignes, brouillon, peutModifier, occupe, onBrouillon, onAjouter, onRetirer, onActualiser }) {
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const mot = recherche.trim().toLowerCase();
  const filtres = lignes.filter((item) => !mot || item.label.toLowerCase().includes(mot));
  const liste = useListePaginee(filtres, 5);

  return (
    <section className="card">
      <div className="titre-avec-info">
        <h2>{titre}</h2>
        <IconeInformation titre={titre} texte={texte} />
      </div>
      <BarreListe
        libelleFiltre="Liste"
        optionsFiltre={[{ valeur: '', libelle: 'Tous' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Libellé"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={occupe}
        onActualiser={onActualiser}
      />
      <ul className="ref-list">
        {liste.visibles.map((item) => (
          <li key={item.id}>
            <b>{item.label}</b>
            {peutModifier ? <ActionsLigne onSupprimer={() => onRetirer(item)} /> : null}
          </li>
        ))}
      </ul>
      {liste.total === 0 ? <p className="muted">Aucun élément.</p> : null}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
      {peutModifier ? <button className="btn" type="button" onClick={() => { onBrouillon(''); setOuvert(true); }}>Ajouter</button> : null}
      {ouvert ? (
        <Modal title={`Ajouter — ${titre}`} onClose={() => setOuvert(false)}>
          <form className="stack" onSubmit={async (event) => {
            event.preventDefault();
            const ok = await onAjouter();
            if (ok) setOuvert(false);
          }}>
            <Field label="Nom" wide>
              <input value={brouillon} onChange={(event) => onBrouillon(event.target.value)} required autoFocus />
            </Field>
            <button className="btn btn-primary" type="submit" disabled={occupe}>Ajouter</button>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
