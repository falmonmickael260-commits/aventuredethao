/**
 * Noms communs et noms propres, avec genre, nombre et pluriel vérifiés.
 *
 * Le pluriel est toujours écrit en entier : impossible d'écrire par erreur
 * « des chevals » ou « des bateaus », puisque la forme correcte est stockée.
 * `voyelle: true` signale un nom qui commence par une voyelle (ou un h muet) :
 * le déterminant s'élide (« l’arbre »), ce qui cacherait le genre. Ces noms
 * sont donc écartés des exercices « le ou la ? ».
 */

export const NOMS_COMMUNS = [
  { mot: 'chat', anime: true, genre: 'm', pluriel: 'chats' },
  { mot: 'chien', anime: true, genre: 'm', pluriel: 'chiens' },
  { mot: 'cheval', anime: true, genre: 'm', pluriel: 'chevaux' },
  { mot: 'oiseau', anime: true, genre: 'm', pluriel: 'oiseaux', voyelle: true },
  { mot: 'bateau', genre: 'm', pluriel: 'bateaux' },
  { mot: 'château', genre: 'm', pluriel: 'châteaux' },
  { mot: 'gâteau', genre: 'm', pluriel: 'gâteaux' },
  { mot: 'journal', genre: 'm', pluriel: 'journaux' },
  { mot: 'animal', genre: 'm', pluriel: 'animaux', voyelle: true },
  { mot: 'hibou', anime: true, genre: 'm', pluriel: 'hiboux' },
  { mot: 'caillou', genre: 'm', pluriel: 'cailloux' },
  { mot: 'bijou', genre: 'm', pluriel: 'bijoux' },
  { mot: 'genou', genre: 'm', pluriel: 'genoux' },
  { mot: 'chou', genre: 'm', pluriel: 'choux' },
  { mot: 'jeu', genre: 'm', pluriel: 'jeux' },
  { mot: 'feu', genre: 'm', pluriel: 'feux' },
  { mot: 'manteau', genre: 'm', pluriel: 'manteaux' },
  { mot: 'tableau', genre: 'm', pluriel: 'tableaux' },
  { mot: 'nez', genre: 'm', pluriel: 'nez' },
  { mot: 'bras', genre: 'm', pluriel: 'bras' },
  { mot: 'tapis', genre: 'm', pluriel: 'tapis' },
  { mot: 'livre', genre: 'm', pluriel: 'livres' },
  { mot: 'crayon', genre: 'm', pluriel: 'crayons' },
  { mot: 'cahier', genre: 'm', pluriel: 'cahiers' },
  { mot: 'jardin', genre: 'm', pluriel: 'jardins' },
  { mot: 'village', genre: 'm', pluriel: 'villages' },
  { mot: 'ballon', genre: 'm', pluriel: 'ballons' },
  { mot: 'vélo', genre: 'm', pluriel: 'vélos' },
  { mot: 'train', genre: 'm', pluriel: 'trains' },
  { mot: 'dragon', genre: 'm', pluriel: 'dragons' },
  { mot: 'trésor', genre: 'm', pluriel: 'trésors' },
  { mot: 'coffre', genre: 'm', pluriel: 'coffres' },
  { mot: 'renard', anime: true, genre: 'm', pluriel: 'renards' },
  { mot: 'lapin', anime: true, genre: 'm', pluriel: 'lapins' },
  { mot: 'mouton', anime: true, genre: 'm', pluriel: 'moutons' },
  { mot: 'arbre', genre: 'm', pluriel: 'arbres', voyelle: true },
  { mot: 'écureuil', anime: true, genre: 'm', pluriel: 'écureuils', voyelle: true },
  { mot: 'éléphant', anime: true, genre: 'm', pluriel: 'éléphants', voyelle: true },
  { mot: 'ours', anime: true, genre: 'm', pluriel: 'ours', voyelle: true },
  { mot: 'maison', genre: 'f', pluriel: 'maisons' },
  { mot: 'fleur', genre: 'f', pluriel: 'fleurs' },
  { mot: 'table', genre: 'f', pluriel: 'tables' },
  { mot: 'chaise', genre: 'f', pluriel: 'chaises' },
  { mot: 'porte', genre: 'f', pluriel: 'portes' },
  { mot: 'fenêtre', genre: 'f', pluriel: 'fenêtres' },
  { mot: 'voiture', genre: 'f', pluriel: 'voitures' },
  { mot: 'trousse', genre: 'f', pluriel: 'trousses' },
  { mot: 'règle', genre: 'f', pluriel: 'règles' },
  { mot: 'gomme', genre: 'f', pluriel: 'gommes' },
  { mot: 'souris', anime: true, genre: 'f', pluriel: 'souris' },
  { mot: 'brebis', anime: true, genre: 'f', pluriel: 'brebis' },
  { mot: 'perdrix', anime: true, genre: 'f', pluriel: 'perdrix' },
  { mot: 'montagne', genre: 'f', pluriel: 'montagnes' },
  { mot: 'rivière', genre: 'f', pluriel: 'rivières' },
  { mot: 'forêt', genre: 'f', pluriel: 'forêts' },
  { mot: 'étoile', genre: 'f', pluriel: 'étoiles', voyelle: true },
  { mot: 'école', genre: 'f', pluriel: 'écoles', voyelle: true },
  { mot: 'araignée', genre: 'f', pluriel: 'araignées', voyelle: true },
  { mot: 'histoire', genre: 'f', pluriel: 'histoires', voyelle: true },
  { mot: 'armoire', genre: 'f', pluriel: 'armoires', voyelle: true },
  { mot: 'chanson', genre: 'f', pluriel: 'chansons' },
  { mot: 'bougie', genre: 'f', pluriel: 'bougies' },
  { mot: 'cabane', genre: 'f', pluriel: 'cabanes' },
  { mot: 'poule', anime: true, genre: 'f', pluriel: 'poules' },
  { mot: 'vache', anime: true, genre: 'f', pluriel: 'vaches' },
  { mot: 'tortue', anime: true, genre: 'f', pluriel: 'tortues' },
  { mot: 'grenouille', anime: true, genre: 'f', pluriel: 'grenouilles' },
  { mot: 'sorcière', anime: true, genre: 'f', pluriel: 'sorcières' },
  { mot: 'lune', genre: 'f', pluriel: 'lunes' },
  { mot: 'carte', genre: 'f', pluriel: 'cartes' },
  { mot: 'clé', genre: 'f', pluriel: 'clés' },
  { mot: 'pomme', genre: 'f', pluriel: 'pommes' },
  { mot: 'noisette', genre: 'f', pluriel: 'noisettes' },
];

export const NOMS_PROPRES = [
  { mot: 'Thao', type: 'prénom' },
  { mot: 'Lucas', type: 'prénom' },
  { mot: 'Julie', type: 'prénom' },
  { mot: 'Paul', type: 'prénom' },
  { mot: 'Léa', type: 'prénom' },
  { mot: 'Emma', type: 'prénom' },
  { mot: 'Hugo', type: 'prénom' },
  { mot: 'Noah', type: 'prénom' },
  { mot: 'Chloé', type: 'prénom' },
  { mot: 'Gabriel', type: 'prénom' },
  { mot: 'Jade', type: 'prénom' },
  { mot: 'Maël', type: 'prénom' },
  { mot: 'Paris', type: 'ville' },
  { mot: 'Lyon', type: 'ville' },
  { mot: 'Marseille', type: 'ville' },
  { mot: 'Bordeaux', type: 'ville' },
  { mot: 'Nantes', type: 'ville' },
  { mot: 'Toulouse', type: 'ville' },
  { mot: 'Strasbourg', type: 'ville' },
  { mot: 'Lille', type: 'ville' },
  { mot: 'Blois', type: 'ville' },
  { mot: 'Rennes', type: 'ville' },
  { mot: 'France', type: 'pays' },
  { mot: 'Espagne', type: 'pays' },
  { mot: 'Italie', type: 'pays' },
  { mot: 'Belgique', type: 'pays' },
  { mot: 'Japon', type: 'pays' },
  { mot: 'Canada', type: 'pays' },
  { mot: 'Vietnam', type: 'pays' },
  { mot: 'Loire', type: 'fleuve' },
  { mot: 'Seine', type: 'fleuve' },
  { mot: 'Rhône', type: 'fleuve' },
  { mot: 'Garonne', type: 'fleuve' },
  { mot: 'Mars', type: 'planète' },
  { mot: 'Jupiter', type: 'planète' },
  { mot: 'Terre', type: 'planète' },
  { mot: 'Médor', type: 'animal' },
  { mot: 'Filou', type: 'animal' },
  { mot: 'Caramel', type: 'animal' },
  { mot: 'Noël', type: 'fête' },
  { mot: 'Pâques', type: 'fête' },
];

/** Déterminants possibles pour un genre et un nombre donnés. */
export const DETERMINANTS = {
  ms: ['le', 'un', 'ce', 'mon', 'ton', 'son', 'notre', 'votre', 'leur'],
  fs: ['la', 'une', 'cette', 'ma', 'ta', 'sa', 'notre', 'votre', 'leur'],
  mp: ['les', 'des', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs'],
  fp: ['les', 'des', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs'],
};

/** Tous les déterminants, sans doublon (sert aux exercices de tri). */
export const TOUS_DETERMINANTS = [
  ...new Set([...DETERMINANTS.ms, ...DETERMINANTS.fs, ...DETERMINANTS.mp]),
];

/** Les trois séries de déterminants utilisées dans les exercices à choix. */
export const SERIES_DET = [
  { id: 'defini', libelle: 'le / la / les', ms: 'le', fs: 'la', mp: 'les', fp: 'les' },
  { id: 'indefini', libelle: 'un / une / des', ms: 'un', fs: 'une', mp: 'des', fp: 'des' },
  { id: 'demonstratif', libelle: 'ce / cette / ces', ms: 'ce', fs: 'cette', mp: 'ces', fp: 'ces' },
  { id: 'possessif', libelle: 'mon / ma / mes', ms: 'mon', fs: 'ma', mp: 'mes', fp: 'mes' },
];

export const NOMS_PAR_MOT = new Map(NOMS_COMMUNS.map((n) => [n.mot, n]));

/** Nom commun au singulier dont le déterminant ne s'élide pas. */
export const NOMS_NON_ELIDES = NOMS_COMMUNS.filter((n) => !n.voyelle);
