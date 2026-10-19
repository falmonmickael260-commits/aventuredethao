/**
 * Moteur de conjugaison a l'imparfait de l'indicatif.
 *
 * Les terminaisons de l'imparfait sont les memes pour TOUS les verbes
 * francais : -ais, -ais, -ait, -ions, -iez, -aient.
 * La seule difficulte est le radical, pris sur la 1re personne du pluriel
 * du present ("nous chant-ons" -> "je chant-ais").
 *
 * Le fichier est teste exhaustivement : tests/conjugaison.test.js compare
 * la sortie du moteur a une table de formes verifiees a la main.
 */

export const PERSONNES = [
  { id: 'je', sujet: 'je', libelle: 'je / j’', rang: 1 },
  { id: 'tu', sujet: 'tu', libelle: 'tu', rang: 2 },
  { id: 'il', sujet: 'il', libelle: 'il / elle / on', rang: 3 },
  { id: 'nous', sujet: 'nous', libelle: 'nous', rang: 4 },
  { id: 'vous', sujet: 'vous', libelle: 'vous', rang: 5 },
  { id: 'ils', sujet: 'ils', libelle: 'ils / elles', rang: 6 },
];

const TERMINAISONS = {
  je: 'ais',
  tu: 'ais',
  il: 'ait',
  nous: 'ions',
  vous: 'iez',
  ils: 'aient',
};

/** Radicaux d'imparfait des verbes irreguliers (= radical du "nous" au present). */
export const RADICAUX_IRREGULIERS = {
  'être': 'ét',
  avoir: 'av',
  aller: 'all',
  faire: 'fais',
  dire: 'dis',
  prendre: 'pren',
  apprendre: 'appren',
  comprendre: 'compren',
  venir: 'ven',
  devenir: 'deven',
  revenir: 'reven',
  tenir: 'ten',
  voir: 'voy',
  croire: 'croy',
  pouvoir: 'pouv',
  vouloir: 'voul',
  savoir: 'sav',
  devoir: 'dev',
  recevoir: 'recev',
  boire: 'buv',
  lire: 'lis',
  écrire: 'écriv',
  mettre: 'mett',
  permettre: 'permett',
  battre: 'batt',
  vivre: 'viv',
  suivre: 'suiv',
  rire: 'ri',
  conduire: 'conduis',
  construire: 'construis',
  détruire: 'détruis',
  peindre: 'peign',
  éteindre: 'éteign',
  joindre: 'joign',
  craindre: 'craign',
  repeindre: 'repeign',
  connaître: 'connaiss',
  paraître: 'paraiss',
  disparaître: 'disparaiss',
  naître: 'naiss',
  attendre: 'attend',
  entendre: 'entend',
  répondre: 'répond',
  descendre: 'descend',
  rendre: 'rend',
  vendre: 'vend',
  perdre: 'perd',
  défendre: 'défend',
  courir: 'cour',
  ouvrir: 'ouvr',
  couvrir: 'couvr',
  recouvrir: 'recouvr',
  offrir: 'offr',
  souffrir: 'souffr',
  cueillir: 'cueill',
  partir: 'part',
  sortir: 'sort',
  dormir: 'dorm',
  servir: 'serv',
  sentir: 'sent',
  mentir: 'ment',
  mourir: 'mour',
};

/** Verbes en -ir qui prennent le radical long en -iss- (type "finir"). */
const IR_ISSANT = new Set([
  'finir', 'grandir', 'ralentir', 'réussir', 'remplir', 'choisir', 'bâtir',
  'rougir', 'pâlir', 'atterrir', 'applaudir', 'nourrir', 'salir', 'démolir',
  'guérir', 'obéir', 'punir', 'réfléchir', 'bondir', 'avertir', 'fleurir',
  'adoucir', 'élargir', 'alourdir', 'refroidir', 'éclaircir',
]);

const VOYELLES = 'aeiouyàâäéèêëîïôöûü';

/** "je" devient "j’" devant une voyelle ou un h muet. */
export function elide(sujet, forme) {
  if (sujet !== 'je') return `${sujet} ${forme}`;
  const c = forme[0].toLowerCase();
  if (VOYELLES.includes(c) || c === 'h') return `j’${forme}`;
  return `je ${forme}`;
}

/** Calcule le radical d'imparfait d'un infinitif. */
export function radicalImparfait(infinitif) {
  const inf = infinitif.normalize('NFC');
  if (RADICAUX_IRREGULIERS[inf]) return RADICAUX_IRREGULIERS[inf];
  if (inf.endsWith('er')) return inf.slice(0, -2);
  if (inf.endsWith('ir')) {
    const base = inf.slice(0, -2);
    if (IR_ISSANT.has(inf)) return `${base}iss`;
    return base;
  }
  if (inf.endsWith('re')) return inf.slice(0, -2);
  throw new Error(`Radical d'imparfait inconnu pour "${infinitif}"`);
}

/**
 * Conjugue un verbe a l'imparfait.
 * @returns {string} la forme verbale seule, sans pronom.
 */
export function imparfait(infinitif, personne) {
  const term = TERMINAISONS[personne];
  if (!term) throw new Error(`Personne inconnue : ${personne}`);
  const inf = infinitif.normalize('NFC');
  let radical = radicalImparfait(inf);

  // Verbes en -ger : le "e" est conserve devant a/o pour garder le son [j].
  if (inf.endsWith('ger') && !RADICAUX_IRREGULIERS[inf] && term.startsWith('a')) {
    radical += 'e';
  }
  // Verbes en -cer : le "c" devient "c cedille" devant a/o.
  if (inf.endsWith('cer') && !RADICAUX_IRREGULIERS[inf] && term.startsWith('a')) {
    radical = `${radical.slice(0, -1)}ç`;
  }
  return radical + term;
}

/** Conjugue avec le pronom : "je jouais", "j’étais", "nous jouions". */
export function imparfaitAvecSujet(infinitif, personne) {
  const p = PERSONNES.find((x) => x.id === personne);
  return elide(p.sujet, imparfait(infinitif, personne));
}

/** Le tableau complet des six personnes. */
export function tableauImparfait(infinitif) {
  return PERSONNES.map((p) => ({
    personne: p.id,
    libelle: p.libelle,
    sujet: p.sujet,
    forme: imparfait(infinitif, p.id),
    complet: imparfaitAvecSujet(infinitif, p.id),
  }));
}

/* ------------------------------------------------------------------ */
/* Présent : seulement les deux personnes utiles aux transformations   */
/* ------------------------------------------------------------------ */

/**
 * « nous » au présent. Le radical de l'imparfait EST celui du présent à la
 * 1re personne du pluriel : « nous chant-ons » → « je chant-ais ». La règle
 * se retourne donc, avec une seule exception en français : le verbe être.
 */
const PRESENT_NOUS_EXCEPTIONS = { 'être': 'sommes' };
const PRESENT_VOUS_EXCEPTIONS = { 'être': 'êtes', faire: 'faites', dire: 'dites' };

export function presentNous(infinitif) {
  const inf = infinitif.normalize('NFC');
  if (PRESENT_NOUS_EXCEPTIONS[inf]) return PRESENT_NOUS_EXCEPTIONS[inf];
  let radical = radicalImparfait(inf);
  // « nous mangeons », « nous commençons » : le son est conservé devant -ons.
  if (inf.endsWith('ger') && !RADICAUX_IRREGULIERS[inf]) radical += 'e';
  if (inf.endsWith('cer') && !RADICAUX_IRREGULIERS[inf]) radical = `${radical.slice(0, -1)}ç`;
  return `${radical}ons`;
}

export function presentVous(infinitif) {
  const inf = infinitif.normalize('NFC');
  if (PRESENT_VOUS_EXCEPTIONS[inf]) return PRESENT_VOUS_EXCEPTIONS[inf];
  return `${radicalImparfait(inf)}ez`;
}
