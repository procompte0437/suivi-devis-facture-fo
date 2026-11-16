import { useEffect, useState } from 'react';
import { api, apiForm, errorText } from '../api';
import { useAuth } from '../auth';
import { ROLES } from '../format';
import { afficherToast } from '../components/Toasts';
import { Field, Modal } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, ListePaginee, PaginationListe, useListePaginee } from '../components/TableauDonnees';
import { ReferentielLists } from './ReferentielLists';

const EMPTY = {
  name: '', tagline: '', legal_form: '', address: '', city: '', postal_code: '',
  country: 'Gabon', email: '', phone: '', tax_id: '', capital: '', iban: '', payment_note: '', footer: '',
};

function withCurrent(values, current) {
  const list = values.filter(Boolean);
  if (current && !list.includes(current)) return [current, ...list];
  return list;
}

export default function Companies() {
  const { companies, company, unassigned, isPlatformAdmin, isManager, refresh, switchCompany, ready, can } = useAuth();
  const canCompany = can('companies');
  const [form, setForm] = useState(EMPTY);
  const [logoBusy, setLogoBusy] = useState(false);
  const [refs, setRefs] = useState(null);
  const [clientRows, setClientRows] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityDraft, setCityDraft] = useState('');
  const [cityBusy, setCityBusy] = useState(false);
  // Un seul bloc du référentiel est visible : les autres sont des onglets.
  const [onglet, setOnglet] = useState('entreprises');
  // Création d’entreprise et ajout d’une ville d’inscription : fenêtres, pas le formulaire de la fiche.
  const [creation, setCreation] = useState(null);
  const [villeOuverte, setVilleOuverte] = useState(false);

  useEffect(() => {
    if (company) setForm({ ...EMPTY, ...company });
  }, [company]);

  function loadRefs() {
    if (!company?.id) {
      setRefs(null);
      setClientRows([]);
      return Promise.resolve();
    }
    return Promise.all([api('/referentiel'), api('/clients')]).then(([lists, people]) => {
      setRefs(lists);
      setClientRows(people);
    });
  }

  useEffect(() => {
    loadRefs().catch((err) => afficherToast(errorText(err)));
  }, [company?.id]);

  function loadCities() {
    return api('/cities').then(setCities);
  }

  useEffect(() => {
    if (!isPlatformAdmin) return;
    loadCities().catch((err) => afficherToast(errorText(err)));
  }, [isPlatformAdmin]);

  async function addCity() {
    const label = cityDraft.trim();
    if (!label) return;
    setCityBusy(true);
    try {
      await api('/cities', { method: 'POST', body: { label } });
      setCityDraft('');
      setVilleOuverte(false);
      afficherToast(`La ville « ${label} » a été ajoutée. Elle apparaît dans le formulaire « Créer un compte ».`, 'succes');
      await loadCities();
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setCityBusy(false);
    }
  }

  async function removeCity(city) {
    setCityBusy(true);
    try {
      await api(`/cities/${city.id}`, { method: 'DELETE' });
      afficherToast(`La ville « ${city.label} » a été retirée du formulaire d’inscription.`, 'succes');
      await loadCities();
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setCityBusy(false);
    }
  }

  function set(key, value) {
    setForm({ ...form, [key]: value });
  }

  const shown = form.id && company?.id === form.id ? company : null;

  async function uploadLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !form.id) return;
    setLogoBusy(true);
    try {
      const body = new FormData();
      body.append('logo', file);
      await apiForm(`/companies/${form.id}/logo`, body);
      afficherToast('Logo enregistré. Il remplace l’initiale sur les devis et les factures de cette entreprise.', 'succes');
      await refresh();
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setLogoBusy(false);
    }
  }

  async function removeLogo() {
    if (!form.id) return;
    setLogoBusy(true);
    try {
      await api(`/companies/${form.id}/logo`, { method: 'DELETE' });
      afficherToast('Logo retiré. Les documents affichent de nouveau l’initiale de l’entreprise.', 'succes');
      await refresh();
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setLogoBusy(false);
    }
  }

  async function creerEntreprise(event) {
    event.preventDefault();
    try {
      const created = await api('/companies', { method: 'POST', body: creation });
      afficherToast(`L’entreprise « ${created.name || creation.name} » a été créée.`, 'succes');
      setCreation(null);
      await switchCompany(created.id);
    } catch (err) {
      afficherToast(errorText(err));
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!form.id) return;
    try {
      await api(`/companies/${form.id}`, { method: 'PUT', body: form });
      afficherToast(`L’entreprise « ${form.name} » a été enregistrée.`, 'succes');
      await refresh();
    } catch (err) {
      afficherToast(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Référentiel</p>
          <div className="titre-avec-info">
            <h1>Référentiel</h1>
            <IconeInformation titre="Référentiel" texte="Les listes de l’entreprise : la fiche, les sociétés, les rôles du personnel, les villes, les statuts, les formes et les pays. Chaque liste est un onglet." />
          </div>
        </div>
        {canCompany && onglet === 'entreprises' ? <button className="btn" type="button" onClick={() => setCreation({ ...EMPTY })}>Nouvelle entreprise</button> : null}
      </header>
      <div className="tabs" role="tablist" aria-label="Rubriques du référentiel">
        {[
          ['entreprises', 'Entreprises'],
          ['societes', 'Sociétés'],
          ['clients', 'Clients par société'],
          ['roles', 'Rôles du personnel'],
          ['ville', 'Villes'],
          ['statut', 'Statuts'],
          ['forme', 'Formes juridiques'],
          ['pays', 'Pays'],
        ].map(([valeur, libelle]) => (
          <button
            key={valeur}
            className={`chip${onglet === valeur ? ' on' : ''}`}
            type="button"
            role="tab"
            aria-selected={onglet === valeur}
            onClick={() => setOnglet(valeur)}
          >
            {libelle}
          </button>
        ))}
      </div>
      {onglet === 'entreprises' ? (
      <>
      {isPlatformAdmin ? (
        <section className="card" style={{ marginBottom: 14 }}>
          <div className="titre-avec-info">
            <h2>Villes de l’inscription</h2>
            <IconeInformation titre="Villes" texte="Liste proposée dans le formulaire « Créer un compte ». Seul l’administrateur de la plateforme la modifie." />
          </div>
          <ListeVilles villes={cities} occupe={cityBusy} onRetirer={removeCity} onActualiser={refresh} />
          <button className="btn" type="button" onClick={() => { setCityDraft(''); setVilleOuverte(true); }}>Ajouter une ville</button>
        </section>
      ) : null}
      <ListeEntreprises entreprises={companies} entrepriseActive={company} pret={ready} onChoisir={switchCompany} onActualiser={refresh} />
      {isPlatformAdmin ? (
        <section className="card" style={{ marginBottom: 14 }}>
          <div className="titre-avec-info">
            <h2>Comptes sans entreprise</h2>
            <IconeInformation titre="Comptes sans entreprise" texte="Ces personnes se sont inscrites sans rattacher d’entreprise." />
          </div>
          {unassigned == null ? <ChargementPourcentage actif libelle="Chargement des comptes" /> : (
            <ul className="link-list">
              <ListePaginee
                lignes={unassigned}
                vide="Aucun compte en attente."
                rendu={(account) => (
                  <li key={account.id}>
                    <span><b>{account.name}</b> · {ROLES[account.role] || account.role}</span>
                    <small className="muted">{account.email}</small>
                  </li>
                )}
              />
            </ul>
          )}
        </section>
      ) : null}
      <form className="card fields" onSubmit={save}>
        {!ready ? <ChargementPourcentage actif libelle="Chargement de l’entreprise" /> : (
          <>
        <div className="logo-box wide">
          {shown?.logo_url
            ? <img src={shown.logo_url} alt={`Logo de ${shown.name}`} />
            : <span className="company-mark">{(form.name || 'A').slice(0, 1)}</span>}
          <div>
            <strong>Logo</strong>
            <p>Une image par entreprise. Elle remplace l’initiale sur les devis et les factures.</p>
            {form.id && canCompany ? (
              <div className="logo-actions">
                <label className="btn btn-tiny">
                  {logoBusy ? 'Envoi…' : (shown?.logo_url ? 'Changer le logo' : 'Ajouter un logo')}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadLogo} disabled={logoBusy} hidden />
                </label>
                {shown?.logo_url ? <button className="btn btn-tiny" type="button" onClick={removeLogo} disabled={logoBusy}>Retirer</button> : null}
              </div>
            ) : form.id ? null : <p>Enregistrez d’abord l’entreprise, puis ajoutez son logo.</p>}
          </div>
        </div>
        <Field label="Nom"><input value={form.name} onChange={(event) => set('name', event.target.value)} required disabled={!canCompany} /></Field>
        <Field label="Signature"><input value={form.tagline} onChange={(event) => set('tagline', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Forme">
          <select value={form.legal_form || ''} onChange={(event) => set('legal_form', event.target.value)} disabled={!canCompany}>
            <option value="">Choisir</option>
            {withCurrent((refs?.forme || []).map((item) => item.label), form.legal_form).map((label) => <option key={label} value={label}>{label}</option>)}
          </select>
        </Field>
        <Field label="Adresse" wide><input value={form.address || ''} onChange={(event) => set('address', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Ville">
          <select value={form.city || ''} onChange={(event) => set('city', event.target.value)} disabled={!canCompany}>
            <option value="">Choisir</option>
            {withCurrent((refs?.ville || []).map((item) => item.label), form.city).map((label) => <option key={label} value={label}>{label}</option>)}
          </select>
        </Field>
        <Field label="Code postal"><input value={form.postal_code || ''} onChange={(event) => set('postal_code', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="E-mail"><input value={form.email || ''} onChange={(event) => set('email', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Téléphone"><input value={form.phone || ''} onChange={(event) => set('phone', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Identifiant fiscal"><input value={form.tax_id || ''} onChange={(event) => set('tax_id', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Capital"><input value={form.capital || ''} onChange={(event) => set('capital', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="IBAN" wide><input value={form.iban || ''} onChange={(event) => set('iban', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Règlement" wide><textarea value={form.payment_note || ''} onChange={(event) => set('payment_note', event.target.value)} disabled={!canCompany} /></Field>
        <Field label="Pied de page des documents" wide><textarea value={form.footer || ''} onChange={(event) => set('footer', event.target.value)} disabled={!canCompany} /></Field>
        {canCompany && form.id ? <button className="btn btn-primary wide" type="submit">Enregistrer</button> : null}
          </>
        )}
      </form>
      </>
      ) : !company?.id ? (
        <p className="muted">Choisissez une entreprise dans l’onglet Entreprises.</p>
      ) : !refs ? (
        <ChargementPourcentage actif libelle="Chargement du référentiel" />
      ) : (
        <ReferentielLists onglet={onglet} refs={refs} clients={clientRows} canEdit={can('referentiel')} peutDefinirRoles={isManager} onSaved={loadRefs} />
      )}
      {creation ? (
        <Modal title="Nouvelle entreprise" onClose={() => setCreation(null)} wide>
          <form className="fields" onSubmit={creerEntreprise}>
            <Field label="Nom"><input value={creation.name} onChange={(event) => setCreation({ ...creation, name: event.target.value })} required /></Field>
            <Field label="Signature"><input value={creation.tagline} onChange={(event) => setCreation({ ...creation, tagline: event.target.value })} /></Field>
            <Field label="E-mail"><input value={creation.email} onChange={(event) => setCreation({ ...creation, email: event.target.value })} /></Field>
            <Field label="Téléphone"><input value={creation.phone} onChange={(event) => setCreation({ ...creation, phone: event.target.value })} /></Field>
            <Field label="Ville"><input value={creation.city} onChange={(event) => setCreation({ ...creation, city: event.target.value })} /></Field>
            <Field label="Adresse" wide><input value={creation.address} onChange={(event) => setCreation({ ...creation, address: event.target.value })} /></Field>
            <button className="btn btn-primary wide" type="submit">Créer l’entreprise</button>
          </form>
        </Modal>
      ) : null}
      {villeOuverte ? (
        <Modal title="Nouvelle ville d’inscription" onClose={() => setVilleOuverte(false)}>
          <form className="stack" onSubmit={(event) => { event.preventDefault(); addCity(); }}>
            <Field label="Ville" wide>
              <input value={cityDraft} onChange={(event) => setCityDraft(event.target.value)} required autoFocus />
            </Field>
            <button className="btn btn-primary" type="submit" disabled={cityBusy}>Ajouter</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

/** Grille des entreprises, avec recherche dans le filtre et pages. */
function ListeEntreprises({ entreprises, entrepriseActive, pret, onChoisir, onActualiser }) {
  const [recherche, setRecherche] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = (entreprises || []).filter((item) => !mot || `${item.name} ${item.city || ''}`.toLowerCase().includes(mot));
  const liste = useListePaginee(filtres, 5);

  return (
    <div>
      <BarreListe
        libelleFiltre="Entreprises"
        optionsFiltre={[{ valeur: '', libelle: 'Toutes' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Nom, ville"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={!pret}
        onActualiser={onActualiser}
      />
      {!pret ? <ChargementPourcentage actif libelle="Chargement des entreprises" /> : (
        <div className="company-picks">
          {liste.visibles.map((item) => (
            <button key={item.id} type="button" className={entrepriseActive?.id === item.id ? 'on' : ''} onClick={() => onChoisir(item.id)}>
              {item.logo_url ? <img className="company-mark" src={item.logo_url} alt="" /> : <span className="company-mark">{item.name.slice(0, 1)}</span>}
              <span>
                <b>{item.name}</b>
                <small>{[item.city, item.users_count != null ? `${item.users_count} compte${item.users_count > 1 ? 's' : ''}` : null, item.projects_count != null ? `${item.projects_count} projet${item.projects_count > 1 ? 's' : ''}` : null].filter(Boolean).join(' · ')}</small>
              </span>
            </button>
          ))}
        </div>
      )}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </div>
  );
}

/** Villes proposées à l’inscription. */
function ListeVilles({ villes, occupe, onRetirer, onActualiser }) {
  const [recherche, setRecherche] = useState('');
  const mot = recherche.trim().toLowerCase();
  const filtres = (villes || []).filter((ville) => !mot || ville.label.toLowerCase().includes(mot));
  const liste = useListePaginee(filtres, 5);

  return (
    <>
      <BarreListe
        libelleFiltre="Villes"
        optionsFiltre={[{ valeur: '', libelle: 'Toutes' }]}
        filtre=""
        onFiltre={() => {}}
        recherche={recherche}
        onRecherche={setRecherche}
        placeholderRecherche="Ville"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={occupe}
        onActualiser={onActualiser}
      />
      <ul className="ref-list">
        {liste.visibles.map((ville) => (
          <li key={ville.id}>
            <b>{ville.label}</b>
            <ActionsLigne onSupprimer={() => onRetirer(ville)} />
          </li>
        ))}
      </ul>
      {liste.total === 0 ? <p className="muted">Aucune ville. L’inscription entreprise ne peut pas aboutir tant qu’il n’y en a pas une.</p> : null}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </>
  );
}
