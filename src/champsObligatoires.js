/**
 * Champs obligatoires vides d’un devis ou d’une facture.
 * Les clés servent à souligner le champ ; les valeurs texte composent le message.
 */
export function champsDocumentManquants(formulaire, lignes) {
  const manque = {};
  if (!formulaire.client_id) manque.client = 'le client';
  if (!String(formulaire.title || '').trim()) manque.titre = 'l’intitulé';
  if (!formulaire.issue_date) manque.emission = 'la date d’émission';

  const avecDesignation = lignes.filter((ligne) => String(ligne.designation || '').trim());
  if (!avecDesignation.length) {
    manque.lignes = 'au moins une ligne (désignation, quantité et prix)';
    lignes.forEach((_, index) => {
      manque[`designation-${index}`] = true;
    });
  } else {
    lignes.forEach((ligne, index) => {
      if (!String(ligne.designation || '').trim()) return;
      if (!(Number(ligne.quantity) > 0)) manque[`quantite-${index}`] = 'la quantité de chaque ligne';
      if (ligne.unit_price === '' || ligne.unit_price == null) manque[`prix-${index}`] = 'le prix de chaque ligne';
    });
  }

  return manque;
}

/** Phrase qui nomme les champs encore vides. */
export function messageChampsManquants(manque, document = 'devis') {
  const noms = [...new Set(Object.values(manque).filter((valeur) => typeof valeur === 'string'))];
  if (!noms.length) return '';
  return `Le ${document} n’est pas enregistré. Complétez les champs soulignés en rouge : ${noms.join(', ')}.`;
}

/** Retire le soulignement d’un champ dès qu’on le corrige. */
export function oublierChamp(champs, cle) {
  if (!champs[cle]) return champs;
  const suivant = { ...champs };
  delete suivant[cle];
  return suivant;
}
