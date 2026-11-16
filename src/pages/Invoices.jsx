import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, INVOICE_STATUS, money } from '../format';
import { Banner, Pill } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const FILTRES = [
  { valeur: '', libelle: 'Toutes' },
  { valeur: 'brouillon', libelle: 'Brouillons' },
  { valeur: 'emise', libelle: 'Émises' },
  { valeur: 'partielle', libelle: 'Partielles' },
  { valeur: 'payee', libelle: 'Payées' },
  { valeur: 'en_retard', libelle: 'En retard' },
  { valeur: 'annulee', libelle: 'Annulées' },
];

export default function Invoices() {
  const navigate = useNavigate();
  const { settings, can } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function charger(prochainStatut = status) {
    const params = new URLSearchParams();
    if (prochainStatut) params.set('status', prochainStatut);
    if (query) params.set('q', query);
    setLoading(true);
    api(`/invoices?${params.toString()}`)
      .then(setRows)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { charger(status); }, [status]);

  const liste = useListePaginee(rows);

  async function supprimer(facture) {
    if (!window.confirm(`Supprimer le brouillon ${facture.number} ?`)) return;
    try {
      await api(`/invoices/${facture.id}`, { method: 'DELETE' });
      charger();
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Relation</p>
          <div className="titre-avec-info">
            <h1>Factures</h1>
            <IconeInformation titre="Factures" texte="Factures émises, échéances et paiements reçus. La recherche est dans le filtre. Seul un brouillon sans règlement peut être supprimé." />
          </div>
        </div>
        {can('invoices') ? <Link className="btn btn-primary" to="/factures/nouvelle">Nouvelle facture</Link> : null}
      </header>
      <Banner>{error}</Banner>
      <BarreListe
        libelleFiltre="Statut"
        optionsFiltre={FILTRES}
        filtre={status}
        onFiltre={setStatus}
        recherche={query}
        onRecherche={setQuery}
        onValiderRecherche={() => charger()}
        placeholderRecherche="Numéro, client, titre"
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={loading}
        onActualiser={() => charger()}
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Numéro</th><th>Client</th><th>Intitulé</th><th>Échéance</th><th className="num">Total</th><th className="num">Solde</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8"><ChargementPourcentage actif libelle="Chargement des factures" /></td></tr>
            ) : liste.visibles.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.number}</td>
                <td>{invoice.client?.company}</td>
                <td>{invoice.title}</td>
                <td>{formatDate(invoice.due_date)}</td>
                <td className="num">{money(invoice.total, settings?.currency)}</td>
                <td className="num">{money(invoice.balance, settings?.currency)}</td>
                <td><Pill status={invoice.display_status} map={INVOICE_STATUS} /></td>
                <td>
                  <ActionsLigne
                    onVoir={() => navigate(`/factures/${invoice.id}`)}
                    onModifier={can('invoices') ? () => navigate(`/factures/${invoice.id}`) : null}
                    onSupprimer={can('invoices') && invoice.status === 'brouillon' ? () => supprimer(invoice) : null}
                  />
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? <tr><td colSpan="8" className="muted">Aucune facture pour ce filtre.</td></tr> : null}
          </tbody>
        </table>
        <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
      </div>
    </div>
  );
}
