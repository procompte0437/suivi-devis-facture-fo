import { useState } from 'react';
import { errorText, telechargerFichier } from '../api';
import { afficherToast } from '../components/Toasts';
import { IconeInformation } from '../components/TableauDonnees';

/** Enchaînement complet d’un dossier, de la préparation jusqu’au suivi. */
const PARCOURS = [
  ['Référentiel', 'Fiche de l’entreprise, sociétés, rôles, villes, statuts, formes et pays.'],
  ['Personnel', 'Les personnes qui recevront les tâches. Le rôle vient du référentiel.'],
  ['Client', 'Une fiche entreprise, rattachée à une société, ou un particulier.'],
  ['Devis', 'Rédaction, PDF, envoi, puis accord ou refus du client.'],
  ['Facture', 'Le devis accepté devient une facture. Les paiements sont saisis au fil de l’eau.'],
  ['Projet', 'Jalons, tâches datées, budget, et avancement publié au client.'],
];

/** Détail de chaque pièce : devis, facture, projet. */
const VOLETS = [
  {
    titre: 'Devis',
    etapes: [
      'Nouveau devis : client, intitulé, date d’émission et au moins une ligne (désignation, quantité, prix).',
      'Enregistrer. Le devis reste en brouillon.',
      'Générer le PDF, puis marquer « Envoyé » quand il part chez le client.',
      'Le client accepte ou refuse dans son espace. Le commercial peut aussi enregistrer la décision.',
      'Seul un devis accepté, pas encore facturé, peut devenir une facture.',
    ],
  },
  {
    titre: 'Factures',
    etapes: [
      'Le comptable ouvre le devis accepté et choisit « Créer la facture ». Une facture peut aussi être créée directement.',
      'Émettre la facture. Tant qu’elle est en brouillon, le client ne la voit pas.',
      'Générer le PDF et le transmettre.',
      'Enregistrer chaque paiement : montant, date, mode et référence.',
      'Le statut passe à « Partielle », puis à « Payée » quand le solde est nul.',
    ],
  },
  {
    titre: 'Projets',
    etapes: [
      'Nouveau projet : client, nom, budget et dates.',
      'Jalons de départ : Cadrage, Production, Livraison. D’autres jalons s’ajoutent au besoin.',
      'Tâches avec une personne et des dates de début et de fin. Ces dates dessinent le planning.',
      'Postes de budget : prévu et dépensé.',
      'Enregistrer le projet, puis publier une mise à jour. Le client la voit dans son espace.',
    ],
  },
];

export default function Aide() {
  const [occupe, setOccupe] = useState(false);

  async function telecharger() {
    setOccupe(true);
    try {
      await telechargerFichier('/aide/guide', 'guide-utilisateur-doukou.pdf');
      afficherToast('Le guide utilisateur a été téléchargé.', 'succes');
    } catch (err) {
      afficherToast(errorText(err));
    } finally {
      setOccupe(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Aide</p>
          <div className="titre-avec-info">
            <h1>Aide</h1>
            <IconeInformation
              titre="Aide"
              texte="Le parcours d’un dossier, du référentiel jusqu’au projet. Le guide reprend ces étapes et se télécharge en PDF."
            />
          </div>
          <p className="lead">Le chemin d’un dossier : préparer l’entreprise, ouvrir le client, envoyer le devis, facturer, puis suivre le projet.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={telecharger} disabled={occupe}>
          {occupe ? 'Préparation…' : 'Télécharger le guide (PDF)'}
        </button>
      </header>

      <section className="card aide-bloc">
        <h2>Parcours d’un dossier</h2>
        <ol className="chaine">
          {PARCOURS.map(([titre, texte], index) => (
            <li key={titre}>
              <b>{index + 1}</b>
              <strong>{titre}</strong>
              <span>{texte}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="aide-volets">
        {VOLETS.map((volet) => (
          <section className="card" key={volet.titre}>
            <h2>{volet.titre}</h2>
            <ol className="aide-etapes">
              {volet.etapes.map((etape) => <li key={etape}>{etape}</li>)}
            </ol>
          </section>
        ))}
      </div>

      <section className="card aide-bloc">
        <h2>Qui fait quoi</h2>
        <p>L’administrateur et le dirigeant peuvent tout modifier. Les autres rôles lisent l’ensemble, et n’écrivent que dans leur module.</p>
        <ul className="aide-roles">
          <li><strong>Responsable commercial</strong> — clients, devis et référentiel.</li>
          <li><strong>Comptable</strong> — factures, et transformation d’un devis accepté en facture.</li>
          <li><strong>Chef de projet</strong> — projets et personnel.</li>
          <li><strong>Client</strong> — ses devis déjà envoyés, ses factures émises et l’avancement de ses projets.</li>
        </ul>
      </section>
    </div>
  );
}
