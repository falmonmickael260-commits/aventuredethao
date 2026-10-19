/**
 * Listes de mots pour le travail sur l'ordre alphabétique.
 *
 * `rang` n'est jamais écrit à la main : il est CALCULÉ à partir du tri réel
 * (1 = la première lettre suffit pour ranger le groupe, 3 = il faut aller
 * jusqu'à la troisième lettre). Aucune difficulté annoncée ne peut donc être
 * en désaccord avec l'ordre alphabétique véritable.
 */

import { trierAlpha, premiereDifference } from '../../src/core/alphabet.js';

/** Jusqu'à quelle lettre faut-il comparer pour ranger cette liste ? */
export function rangDeComparaison(mots) {
  const tri = trierAlpha(mots);
  let rang = 1;
  for (let i = 1; i < tri.length; i++) {
    rang = Math.max(rang, premiereDifference(tri[i - 1], tri[i]));
  }
  return rang;
}

const GROUPES_BRUTS = [
  { id: 'g01', mots: ['pomme', 'avion', 'maison', 'bateau'] },
  { id: 'g02', mots: ['tortue', 'girafe', 'lion', 'éléphant'] },
  { id: 'g03', mots: ['soleil', 'nuage', 'pluie', 'vent'] },
  { id: 'g04', mots: ['jardin', 'forêt', 'rivière', 'montagne'] },
  { id: 'g05', mots: ['dragon', 'sorcière', 'fée', 'ogre'] },
  { id: 'g06', mots: ['crayon', 'gomme', 'règle', 'trousse'] },
  { id: 'g07', mots: ['hiver', 'automne', 'printemps', 'été'] },
  { id: 'g08', mots: ['violon', 'guitare', 'piano', 'tambour'] },
  { id: 'g09', mots: ['chat', 'cheval', 'cochon', 'canard'] },
  { id: 'g10', mots: ['bateau', 'bibliothèque', 'bonbon', 'brouillard'] },
  { id: 'g11', mots: ['mer', 'montagne', 'musique', 'maison'] },
  { id: 'g12', mots: ['panier', 'pluie', 'poire', 'prune'] },
  { id: 'g13', mots: ['tapis', 'tigre', 'tortue', 'trésor'] },
  { id: 'g14', mots: ['fleur', 'fromage', 'fusée', 'facteur'] },
  { id: 'g15', mots: ['chat', 'chaud', 'chemin', 'cheval'] },
  { id: 'g16', mots: ['balle', 'ballon', 'banane', 'bateau'] },
  { id: 'g17', mots: ['poire', 'poisson', 'pomme', 'poule'] },
  { id: 'g18', mots: ['lapin', 'large', 'lavabo', 'laine'] },
  { id: 'g19', mots: ['mardi', 'marin', 'marché', 'marteau'] },
  { id: 'g20', mots: ['chat', 'chaud', 'chasse', 'chapeau'] },
  { id: 'g21', mots: ['mer', 'merci', 'mercredi', 'merle'] },
  { id: 'g22', mots: ['porte', 'portail', 'portion', 'portrait'] },
  { id: 'g23', mots: ['jardin', 'jardinier', 'jarre', 'jardinage'] },
  { id: 'g24', mots: ['danse', 'danger', 'dauphin', 'date'] },
  { id: 'g25', mots: ['école', 'éléphant', 'étoile', 'écureuil'] },
  { id: 'g26', mots: ['abeille', 'arbre', 'avion', 'ami'] },
  { id: 'g27', mots: ['zèbre', 'koala', 'wagon', 'yaourt'] },
  { id: 'g28', mots: ['neige', 'nid', 'noisette', 'nuage'] },
];

export const GROUPES_ALPHA = GROUPES_BRUTS.map((g) => ({
  ...g,
  rang: rangDeComparaison(g.mots),
  solution: trierAlpha(g.mots),
}));

/** Paires de mots à comparer (le plus dur en premier dans la liste). */
export const PAIRES_ALPHA = [
  ['chat', 'chien'], ['maison', 'manteau'], ['pomme', 'poire'],
  ['bateau', 'ballon'], ['fleur', 'flèche'], ['soleil', 'sorcière'],
  ['jardin', 'jarre'], ['mer', 'merci'], ['train', 'trésor'],
  ['grenouille', 'grenier'], ['danse', 'danger'], ['lune', 'lundi'],
  ['porte', 'portail'], ['neige', 'nid'], ['étoile', 'été'],
  ['chaud', 'chausson'], ['renard', 'renne'], ['table', 'tableau'],
  ['village', 'ville'], ['bois', 'boisson'],
];

/** Mots isolés servant de réservoir, toujours rendu dans l'ordre alphabétique. */
export const RESERVOIR_ALPHA = trierAlpha([
  'abri', 'ancre', 'aigle', 'balcon', 'banc', 'bulle', 'cabane', 'carotte',
  'cerise', 'colline', 'dauphin', 'dessin', 'dune', 'écharpe', 'épée',
  'étang', 'fenêtre', 'ferme', 'flocon', 'fourmi', 'galet', 'gant', 'glace',
  'hibou', 'horloge', 'image', 'île', 'jouet', 'jumelles', 'kiwi', 'lampe',
  'lettre', 'loupe', 'main', 'marché', 'moulin', 'nage', 'navire', 'océan',
  'ombre', 'orage', 'panier', 'phare', 'plage', 'quille', 'radis', 'roue',
  'sable', 'statue', 'sucre', 'tambour', 'tapis', 'tulipe', 'usine', 'vague',
  'valise', 'vitre', 'wagon', 'xylophone', 'yaourt', 'zèbre',
]);

/** Paires, avec la réponse (quel mot vient avant) calculée, jamais devinée. */
export const PAIRES = PAIRES_ALPHA.map(([a, b], i) => {
  const tri = trierAlpha([a, b]);
  return { id: `pa${String(i + 1).padStart(2, '0')}`, a, b, premier: tri[0], second: tri[1] };
});
