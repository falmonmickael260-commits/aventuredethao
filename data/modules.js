/**
 * Les neuf modules de français et les six mondes de l'aventure.
 * Un monde regroupe un ou plusieurs modules ; c'est l'unité de progression.
 */

export const MODULES = [
  {
    id: 'm1',
    numero: 1,
    titre: 'Les noms et les déterminants',
    court: 'Noms & déterminants',
    monde: 'w1',
    resume: 'Repérer les noms dans une phrase et le petit mot qui les annonce.',
    objectifs: [
      'Reconnaître un nom dans une phrase',
      'Reconnaître un déterminant',
      'Compléter une phrase avec le bon déterminant',
      'Distinguer le singulier du pluriel',
    ],
    rappel:
      'Un NOM désigne une personne, un animal, une chose ou un lieu. Devant lui, il y a souvent un petit mot qui l’annonce : le DÉTERMINANT (le, la, les, un, une, des, mon, ce…).',
  },
  {
    id: 'm2',
    numero: 2,
    titre: 'Noms propres et noms communs',
    court: 'Propre ou commun',
    monde: 'w1',
    resume: 'Faire la différence entre un nom qui désigne tout le monde et un nom qui désigne quelqu’un en particulier.',
    objectifs: [
      'Distinguer nom propre et nom commun',
      'Classer des noms dans deux colonnes',
      'Repérer les noms propres d’un texte',
      'Écrire un nom propre avec sa majuscule',
    ],
    rappel:
      'Le NOM COMMUN désigne tous les êtres ou toutes les choses de la même sorte : un chien, une ville. Le NOM PROPRE désigne une seule personne, un seul lieu : Thao, Lyon. Il commence toujours par une MAJUSCULE.',
  },
  {
    id: 'm3',
    numero: 3,
    titre: 'Accorder le nom et le déterminant',
    court: 'Les accords',
    monde: 'w1',
    resume: 'Mettre le déterminant au bon genre et au bon nombre, et corriger les phrases mal accordées.',
    objectifs: [
      'Choisir le déterminant qui convient',
      'Passer du singulier au pluriel',
      'Passer du pluriel au singulier',
      'Corriger un groupe mal accordé',
    ],
    rappel:
      'Le déterminant s’accorde avec son nom : même GENRE (masculin ou féminin) et même NOMBRE (singulier ou pluriel). Au pluriel, le nom prend presque toujours un -s : un chat → des chats. Attention aux pluriels spéciaux : un cheval → des chevaux.',
  },
  {
    id: 'm4',
    numero: 4,
    titre: 'Le groupe sujet et le groupe verbal',
    court: 'Sujet & groupe verbal',
    monde: 'w2',
    resume: 'Couper la phrase en deux : de qui on parle, et ce qu’on en dit.',
    objectifs: [
      'Trouver le groupe sujet',
      'Trouver le groupe verbal',
      'Couper une phrase en deux groupes',
      'Construire une phrase complète',
    ],
    rappel:
      'Pour trouver le GROUPE SUJET, on demande « De qui ou de quoi parle-t-on ? ». Tout le reste de la phrase forme le GROUPE VERBAL : le verbe et ce qui le complète.',
  },
  {
    id: 'm5',
    numero: 5,
    titre: 'Le verbe et son infinitif',
    court: 'Verbe & infinitif',
    monde: 'w3',
    resume: 'Repérer le verbe conjugué, puis retrouver son nom de famille : l’infinitif.',
    objectifs: [
      'Repérer le verbe conjugué',
      'Donner l’infinitif d’un verbe',
      'Distinguer le verbe des autres mots',
      'Trouver plusieurs verbes dans un texte',
    ],
    rappel:
      'Le VERBE dit ce que l’on fait ou ce que l’on est. Il change quand on change le sujet ou le temps. Son INFINITIF, c’est sa forme « non conjuguée », celle du dictionnaire : il court → courir.',
  },
  {
    id: 'm6',
    numero: 6,
    titre: 'L’imparfait de l’indicatif',
    court: 'L’imparfait',
    monde: 'w4',
    resume: 'Raconter ce qui se passait avant, avec les terminaisons -ais, -ais, -ait, -ions, -iez, -aient.',
    objectifs: [
      'Conjuguer les verbes en -er à l’imparfait',
      'Conjuguer être et avoir',
      'Transformer une phrase du présent à l’imparfait',
      'Corriger une forme fausse',
    ],
    rappel:
      'À l’imparfait, TOUS les verbes prennent les mêmes terminaisons : -ais, -ais, -ait, -ions, -iez, -aient. On s’en sert pour raconter une habitude passée : « Avant, je jouais dehors. »',
  },
  {
    id: 'm7',
    numero: 7,
    titre: 'Les familles de mots',
    court: 'Familles de mots',
    monde: 'w5',
    resume: 'Regrouper les mots qui partagent un morceau et une idée.',
    objectifs: [
      'Reconnaître les mots d’une même famille',
      'Trouver l’intrus',
      'Compléter une famille',
      'Expliquer le lien de sens',
    ],
    rappel:
      'Les mots d’une même FAMILLE partagent deux choses : un morceau commun (le radical) ET une idée commune. Attention aux pièges : « chantier » ressemble à « chanter », mais n’a rien à voir avec le chant !',
  },
  {
    id: 'm8',
    numero: 8,
    titre: 'L’ordre alphabétique',
    court: 'Ordre alphabétique',
    monde: 'w6',
    resume: 'Ranger les mots comme dans un dictionnaire, lettre après lettre.',
    objectifs: [
      'Ranger des mots dans l’ordre alphabétique',
      'Comparer deux mots',
      'Départager des mots qui commencent pareil',
      'Écrire une liste rangée',
    ],
    rappel:
      'On compare la 1re lettre. Si elle est la même, on passe à la 2e, puis à la 3e… « chat » vient avant « chaud » parce que t vient avant u.',
  },
  {
    id: 'm9',
    numero: 9,
    titre: 'Le dictionnaire et les mots repères',
    court: 'Le dictionnaire',
    monde: 'w6',
    resume: 'Trouver un mot dans le dictionnaire grâce aux mots repères en haut de page.',
    objectifs: [
      'Lire les mots repères d’une page',
      'Dire si un mot se trouve sur la page',
      'Choisir la bonne page',
      'Chercher un mot à partir de sa définition',
    ],
    rappel:
      'En haut de chaque page du dictionnaire, les MOTS REPÈRES indiquent le premier et le dernier mot de la page. Si le mot cherché se range entre les deux, il est sur cette page.',
  },
];

export const MONDES = [
  {
    id: 'w1',
    numero: 1,
    titre: 'Le village des noms',
    sousTitre: 'Là où chaque chose a un nom',
    modules: ['m1', 'm2', 'm3'],
    palette: { fond: '#13204A', accent: '#2FD6C4', lueur: '#5BE5D6' },
    decor: 'village',
    gardien: 'Mo, le marchand de mots',
    histoire:
      'Dans le village des noms, chaque maison porte une pancarte. Mais le vent a tout mélangé ! Aide Mo à remettre chaque nom à sa place.',
  },
  {
    id: 'w2',
    numero: 2,
    titre: 'La forêt des phrases',
    sousTitre: 'Deux groupes, un chemin',
    modules: ['m4'],
    palette: { fond: '#0F2A2E', accent: '#5FD98A', lueur: '#A8F0B5' },
    decor: 'foret',
    gardien: 'Brindille, l’esprit des sentiers',
    histoire:
      'Les sentiers de la forêt se séparent toujours en deux : d’un côté celui dont on parle, de l’autre ce qu’il fait. Trouve la bonne coupure et le chemin s’ouvrira.',
  },
  {
    id: 'w3',
    numero: 3,
    titre: 'Le château des verbes',
    sousTitre: 'Chaque verbe cache son vrai nom',
    modules: ['m5'],
    palette: { fond: '#2A1740', accent: '#B78BF5', lueur: '#D9C2FF' },
    decor: 'chateau',
    gardien: 'Sire Verbo',
    histoire:
      'Dans ce château, les verbes se déguisent : « il court », « nous courons », « tu courais »… Sous chaque déguisement, un seul vrai nom : l’infinitif.',
  },
  {
    id: 'w4',
    numero: 4,
    titre: 'La montagne de l’imparfait',
    sousTitre: 'Les souvenirs du sommet',
    modules: ['m6'],
    palette: { fond: '#102A4C', accent: '#7FC8FF', lueur: '#C6E8FF' },
    decor: 'montagne',
    gardien: 'Vieux Tempo',
    histoire:
      'Tout en haut, le vent raconte ce qui se passait AVANT. Pour l’écouter, il faut parler sa langue : -ais, -ais, -ait, -ions, -iez, -aient.',
  },
  {
    id: 'w5',
    numero: 5,
    titre: 'La fabrique des mots',
    sousTitre: 'Une racine, toute une famille',
    modules: ['m7'],
    palette: { fond: '#3A1C2A', accent: '#FF9A6C', lueur: '#FFC9AE' },
    decor: 'fabrique',
    gardien: 'Rouille, la machine à mots',
    histoire:
      'La fabrique assemble les mots autour d’une racine. Mais des intrus se glissent sur le tapis roulant. À toi de les démasquer !',
  },
  {
    id: 'w6',
    numero: 6,
    titre: 'La bibliothèque magique',
    sousTitre: 'De A à Z, et au-delà',
    modules: ['m8', 'm9'],
    palette: { fond: '#2B2410', accent: '#FFC24B', lueur: '#FFE2A3' },
    decor: 'bibliotheque',
    gardien: 'Plume, la gardienne des pages',
    histoire:
      'Des milliers de mots, tous rangés dans le bon ordre. Celui qui sait lire les mots repères peut ouvrir n’importe quel livre.',
  },
];

export const MODULE_PAR_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]));
export const MONDE_PAR_ID = Object.fromEntries(MONDES.map((m) => [m.id, m]));

/** Le monde précédent doit être terminé pour débloquer le suivant. */
export function mondeSuivant(id) {
  const i = MONDES.findIndex((m) => m.id === id);
  return i >= 0 && i < MONDES.length - 1 ? MONDES[i + 1] : null;
}
