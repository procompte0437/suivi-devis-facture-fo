import { useEffect, useState } from 'react';
import { Modal } from './ui';

/**
 * Anneau de chargement avec un pourcentage.
 * Tant que les données arrivent, le pourcentage avance jusqu’à 90.
 * À la fin de la requête, il passe à 100 puis disparaît.
 */
export function ChargementPourcentage({ actif, libelle = 'Chargement des données' }) {
  const [pourcentage, setPourcentage] = useState(0);

  useEffect(() => {
    if (!actif) {
      setPourcentage(100);
      return undefined;
    }
    setPourcentage(6);
    const minuteur = setInterval(() => {
      setPourcentage((valeur) => (valeur >= 90 ? valeur : Math.min(90, valeur + 4 + Math.round(Math.random() * 6))));
    }, 160);
    return () => clearInterval(minuteur);
  }, [actif]);

  if (!actif) return null;

  const rayon = 28;
  const tour = 2 * Math.PI * rayon;
  const trait = (Math.min(100, pourcentage) / 100) * tour;

  return (
    <div className="chargement-pourcentage" role="status" aria-live="polite">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="piste" cx="36" cy="36" r={rayon} />
        <circle className="avance" cx="36" cy="36" r={rayon} strokeDasharray={`${trait} ${tour - trait}`} />
      </svg>
      <strong>{Math.round(pourcentage)} %</strong>
      <p>{libelle}</p>
    </div>
  );
}

/**
 * Icône « i » : le texte explicatif s’ouvre dans une fenêtre, pas dans la page.
 */
export function IconeInformation({ titre = 'Information', texte }) {
  const [ouvert, setOuvert] = useState(false);
  if (!texte) return null;
  return (
    <>
      <button className="icone-info" type="button" aria-label={titre} title={titre} onClick={() => setOuvert(true)}>i</button>
      {ouvert ? (
        <Modal title={titre} onClose={() => setOuvert(false)}>
          {String(texte).split('\n').filter((ligne) => ligne.trim()).map((ligne, index) => (
            <p className="lead" key={index} style={{ margin: '0 0 8px' }}>{ligne}</p>
          ))}
        </Modal>
      ) : null}
    </>
  );
}

/**
 * Liste déroulante dont la recherche est à l’intérieur du menu.
 */
export function ListeDeroulante({ libelle, options, valeur, onChange, recherche = '', onRecherche, onValider, placeholderRecherche = 'Rechercher…', filtrerOptions = false }) {
  const [ouvert, setOuvert] = useState(false);
  const choisi = options.find((option) => option.valeur === valeur) || options[0];
  const mot = recherche.trim().toLowerCase();
  // Dans un choix de valeur, la recherche filtre les options. Dans une liste de données, elle interroge les lignes.
  const visibles = filtrerOptions && mot
    ? options.filter((option) => option.libelle.toLowerCase().includes(mot))
    : options;

  return (
    <div className={`liste-deroulante${ouvert ? ' ouverte' : ''}`}>
      <button type="button" aria-expanded={ouvert} aria-label={libelle} onClick={() => setOuvert((etat) => !etat)}>
        <small>{libelle}</small>
        <b>{choisi?.libelle || '—'}</b>
      </button>
      {ouvert ? (
        <div className="liste-panneau" role="listbox">
          <input
            autoFocus
            value={recherche}
            placeholder={placeholderRecherche}
            aria-label={`Rechercher dans ${libelle}`}
            onChange={(evenement) => onRecherche?.(evenement.target.value)}
            onKeyDown={(evenement) => { if (evenement.key === 'Enter') { onValider?.(); setOuvert(false); } }}
          />
          {visibles.length === 0 ? <p>Aucun résultat.</p> : visibles.map((option) => (
            <button
              key={option.valeur || 'tous'}
              type="button"
              role="option"
              aria-selected={option.valeur === valeur}
              className={option.valeur === valeur ? 'on' : ''}
              onClick={() => { onChange(option.valeur); setOuvert(false); }}
            >
              {option.libelle}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Découpe une liste déjà chargée en pages de 3, 5, 10 ou 20 lignes. */
export function useListePaginee(lignes, tailleInitiale = 10) {
  const [page, setPage] = useState(1);
  const [taille, setTaille] = useState(tailleInitiale);
  const total = lignes.length;
  const pages = Math.max(1, Math.ceil(total / taille) || 1);
  const pageCourante = Math.min(page, pages);
  const debut = (pageCourante - 1) * taille;

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  return {
    visibles: lignes.slice(debut, debut + taille),
    page: pageCourante,
    taille,
    pages,
    total,
    aller: setPage,
    changerTaille: (prochaine) => { setTaille(Number(prochaine)); setPage(1); },
  };
}

/**
 * Barre commune : filtre (avec recherche interne), nombre de lignes, actualisation.
 */
export function BarreListe({ libelleFiltre, optionsFiltre, filtre, onFiltre, recherche, onRecherche, onValiderRecherche, placeholderRecherche, taille, onTaille, onActualiser, chargement }) {
  return (
    <div className="barre-liste">
      {optionsFiltre ? (
        <ListeDeroulante
          libelle={libelleFiltre || 'Filtre'}
          options={optionsFiltre}
          valeur={filtre}
          onChange={onFiltre}
          recherche={recherche}
          onRecherche={onRecherche}
          placeholderRecherche={placeholderRecherche}
          onValider={onValiderRecherche}
        />
      ) : <span />}
      <label className="taille-liste">
        <span>Afficher</span>
        <select value={taille} aria-label="Nombre d’éléments affichés" onChange={(evenement) => onTaille(evenement.target.value)}>
          {[3, 5, 10, 20].map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
        </select>
      </label>
      <button className="icone-actualiser" type="button" aria-label="Actualiser les données" title="Actualiser" disabled={chargement} onClick={onActualiser}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.2-5.5M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

/**
 * Liste déjà en mémoire, paginée, avec le rendu de chaque ligne.
 * Sert aux annuaires et aux listes de liens (devis d’un client, etc.).
 */
export function ListePaginee({ lignes = [], vide = 'Aucun élément.', rendu, tailleInitiale = 5 }) {
  const liste = useListePaginee(lignes, tailleInitiale);
  return (
    <>
      {liste.visibles.map(rendu)}
      {liste.total === 0 ? <p className="muted">{vide}</p> : null}
      <PaginationListe page={liste.page} pages={liste.pages} total={liste.total} aller={liste.aller} />
    </>
  );
}

/** Pied de pagination : page précédente, numéro, page suivante. */
export function PaginationListe({ page, pages, total, aller }) {
  return (
    <div className="pagination-liste">
      <span>{total} élément{total > 1 ? 's' : ''}</span>
      <div>
        <button type="button" disabled={page <= 1} onClick={() => aller(page - 1)} aria-label="Page précédente">‹</button>
        <b>{page} / {pages}</b>
        <button type="button" disabled={page >= pages} onClick={() => aller(page + 1)} aria-label="Page suivante">›</button>
      </div>
    </div>
  );
}

/**
 * Actions d’une ligne : voir, modifier (crayon), supprimer.
 * Uniquement des icônes, avec un nom accessible pour le lecteur d’écran.
 */
export function ActionsLigne({ onVoir, onModifier, onSupprimer }) {
  function isoler(action) {
    return (evenement) => {
      evenement.stopPropagation();
      action();
    };
  }
  return (
    <span className="actions-ligne">
      {onVoir ? (
        <button type="button" aria-label="Voir le détail" title="Voir le détail" onClick={isoler(onVoir)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      ) : null}
      {onModifier ? (
        <button type="button" aria-label="Modifier" title="Modifier" onClick={isoler(onModifier)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </button>
      ) : null}
      {onSupprimer ? (
        <button type="button" className="danger" aria-label="Supprimer" title="Supprimer" onClick={isoler(onSupprimer)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ) : null}
    </span>
  );
}
