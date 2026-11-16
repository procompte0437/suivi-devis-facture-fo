import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { formatDate, money, QUOTE_STATUS } from '../format';
import { Banner, Pill } from '../components/ui';
import { ActionsLigne, BarreListe, ChargementPourcentage, IconeInformation, PaginationListe, useListePaginee } from '../components/TableauDonnees';

const FILTRES = [
  { valeur: '', libelle: 'Tous' },
  { valeur: 'brouillon', libelle: 'Brouillons' },
  { valeur: 'envoye', libelle: 'Envoyés' },
  { valeur: 'accepte', libelle: 'Acceptés' },
  { valeur: 'refuse', libelle: 'Refusés' },
  { valeur: 'expire', libelle: 'Expirés' },
];

export default function Quotes() {
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
    api(`/quotes?${params.toString()}`)
      .then(setRows)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { charger(status); }, [status]);

  const liste = useListePaginee(rows);

  async function supprimer(devis) {
    if (!window.confirm(`Supprimer le brouillon ${devis.number} ?`)) return;
    try {
      await api(`/quotes/${devis.id}`, { method: 'DELETE' });
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
            <h1>Devis</h1>
            <IconeInformation titre="Devis" texte="Création, envoi et suivi des propositions commerciales. La recherche se trouve dans le filtre. Seul un brouillon sans facture peut être supprimé." />
          </div>
        </div>
        {can('quotes') ? <Link className="btn btn-primary" to="/devis/nouveau">Nouveau devis</Link> : null}
      </header>
      <Banner>{error}</Banner>
      <BarreListe
        libelleFiltre="Statut"
        optionsFiltre={FILTRES}
        filtre={status}
        recherche={query}
        onRecherche={setQuery}
        onValiderRecherche={() => charger()}
        placeholderRecherche="Numéro, client, titre"
        onFiltre={(valeur) => setStatus(valeur)}
        taille={liste.taille}
        onTaille={liste.changerTaille}
        chargement={loading}
        onActualiser={() => charger()}
      />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Numéro</th><th>Client</th><th>Intitulé</th><th>Émission</th><th className="num">Total</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7"><ChargementPourcentage actif libelle="Chargement des devis" /></td></tr>
            ) : liste.visibles.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.number}</td>
                <td>{quote.client?.company}</td>
                <td>{quote.title}</td>
                <td>{formatDate(quote.issue_date)}</td>
                <td className="num">{money(quote.total, settings?.currency)}</td>
                <td><Pill status={quote.display_status} map={QUOTE_STATUS} /></td>
                <td>
                  <ActionsLigne
                    onVoir={() => navigate(`/devis/${quote.id}`)}
                    onModifier={can('quotes') ? () => navigate(`/devis/${quote.id}`) : null}
                    onSupprimer={can('quotes') && quote.status === 'brouillon' ? () => supprimer(quote) : null}
                  />
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? <tr><td colSpan="7" className="muted">Aucun devis pour ce filtre.</td></tr> : null}
          </tbody>
        </table>
        <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
      </div>
    </div>
  );
}
