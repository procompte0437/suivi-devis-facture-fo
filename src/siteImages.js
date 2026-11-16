import { useEffect, useState } from 'react';
import { api } from './api';

/*
 * Images du site public. Chaque emplacement a une photo par défaut (dossier public/home) ;
 * l'administrateur de la plateforme peut la remplacer depuis « Images du site ».
 */
export const SITE_IMAGE_SLOTS = [
  { slot: 'hero_1', page: 'Accueil', label: 'Accroche — vue 1 « Suivre chaque dossier »', src: '/home/atelier.jpg', alt: 'Menuisier souriant au travail dans son atelier', shape: 'rond' },
  { slot: 'hero_2', page: 'Accueil', label: 'Accroche — vue 2 « Un planning de chantier »', src: '/home/chantier.jpg', alt: 'Construction d’un bâtiment, ouvriers sur le chantier', shape: 'rond' },
  { slot: 'hero_3', page: 'Accueil', label: 'Accroche — vue 3 « Vos clients suivent en ligne »', src: '/home/clientes.jpg', alt: 'Trois femmes consultent un dossier sur un ordinateur portable', shape: 'rond' },
  { slot: 'project_cta', page: 'Accueil', label: 'Bandeau « Vous gérez des devis et des projets ? »', src: '/home/ouvrier.jpg', alt: 'Ouvrier en gilet de sécurité sur un chantier', shape: 'arche' },
  { slot: 'sector_artisans', page: 'Secteurs', label: 'Secteur Artisans', src: '/home/artisan.jpg', alt: 'Artisan au travail à son établi', shape: 'portrait' },
  { slot: 'sector_agences', page: 'Secteurs', label: 'Secteur Agences et bureaux', src: '/home/reunion.jpg', alt: 'Réunion d’équipe autour d’une table', shape: 'portrait' },
  { slot: 'sector_btp', page: 'Secteurs', label: 'Secteur BTP et chantiers', src: '/home/chantier.jpg', alt: 'Construction d’un bâtiment, ouvriers sur le chantier', shape: 'portrait' },
  { slot: 'sector_independants', page: 'Secteurs', label: 'Secteur Indépendants', src: '/home/bureau.jpg', alt: 'Femme souriante travaillant à son ordinateur', shape: 'portrait' },
  { slot: 'about', page: 'À propos', label: 'Photo de la page À propos', src: '/home/equipe.jpg', alt: 'Une équipe souriante réunie en extérieur', shape: 'paysage' },
  { slot: 'login', page: 'Connexion', label: 'Photo de la page Connexion', src: '/home/atelier.jpg', alt: 'Menuisier souriant au travail dans son atelier', shape: 'paysage' },
  { slot: 'banner', page: 'Toutes les pages', label: 'Fond des bandeaux de titre (pages intérieures)', src: '/home/atelier.jpg', alt: '', shape: 'bandeau' },
];

const DEFAULTS = Object.fromEntries(SITE_IMAGE_SLOTS.map((item) => [item.slot, item]));

// Cache partagé : une seule requête par chargement de page, mise à jour après une modification.
let cache = null;
let pending = null;
const listeners = new Set();

function load(force = false) {
  if (!force && (cache || pending)) return pending || Promise.resolve(cache);
  pending = api('/site-images')
    .then((data) => {
      cache = Array.isArray(data) ? {} : data || {};
      return cache;
    })
    .catch(() => {
      cache = {};
      return cache;
    })
    .finally(() => {
      pending = null;
      listeners.forEach((listener) => listener(cache));
    });
  return pending;
}

/** À appeler après une modification dans l'administration. */
export function refreshSiteImages() {
  return load(true);
}

/** Renvoie, pour chaque emplacement, l'image en place ({ src, alt }) : remplacée ou par défaut. */
export function useSiteImages() {
  const [overrides, setOverrides] = useState(cache || {});

  useEffect(() => {
    listeners.add(setOverrides);
    load();
    return () => listeners.delete(setOverrides);
  }, []);

  return Object.fromEntries(SITE_IMAGE_SLOTS.map(({ slot }) => {
    const custom = overrides[slot];
    return [slot, {
      src: custom?.url || DEFAULTS[slot].src,
      alt: custom?.alt ?? DEFAULTS[slot].alt,
      custom: Boolean(custom?.url),
    }];
  }));
}
