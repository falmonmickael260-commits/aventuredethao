/**
 * Normalisation des réponses écrites.
 *
 * Principe : on pardonne ce qui n'est PAS l'objet de l'exercice (espaces en
 * trop, majuscule de début, apostrophe droite ou courbe, point final) et on
 * reste exigeant sur ce qui EST l'objet de l'exercice (l'orthographe de la
 * forme attendue, accents compris).
 */

/** Uniformise les apostrophes et les espaces insécables. */
export function normaliserSignes(s) {
  return String(s)
    .normalize('NFC')
    .replace(/['‘’ʼ´`]/g, '’')
    .replace(/[   ​]/g, ' ');
}

/** Retire les accents (sert à détecter une réponse « presque juste »). */
export function sansAccents(s) {
  return normaliserSignes(s)
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Normalise une saisie pour la comparaison.
 * @param {object} opts
 *   opts.casse        true = la majuscule compte (noms propres)
 *   opts.ponctuation  true = la ponctuation compte
 */
export function normaliser(s, opts = {}) {
  let t = normaliserSignes(s).trim().replace(/\s+/g, ' ');
  if (!opts.ponctuation) t = t.replace(/[.,;:!?…]+$/g, '').trim();
  if (!opts.casse) t = t.toLowerCase();
  return t;
}

/** Découpe une phrase saisie en mots (l'apostrophe sépare les mots). */
export function mots(s) {
  return normaliserSignes(s)
    .toLowerCase()
    .split(/[^0-9a-zà-öø-ÿœæ’-]+/)
    .flatMap((m) => m.split('’'))
    .map((m) => m.replace(/^-+|-+$/g, ''))
    .filter(Boolean);
}

/** La saisie est-elle vide ? */
export function estVide(s) {
  return !String(s ?? '').trim();
}

/**
 * Compare une saisie à une liste de formes acceptées.
 * @returns {{juste:boolean, accents:boolean, forme:string|null}}
 *   accents = true quand la seule erreur porte sur les accents.
 */
export function comparer(saisie, attendus, opts = {}) {
  const s = normaliser(saisie, opts);
  const liste = Array.isArray(attendus) ? attendus : [attendus];
  for (const a of liste) {
    if (s === normaliser(a, opts)) return { juste: true, accents: false, forme: a };
  }
  const sa = sansAccents(s);
  for (const a of liste) {
    if (sa === sansAccents(normaliser(a, opts))) {
      return { juste: false, accents: true, forme: a };
    }
  }
  return { juste: false, accents: false, forme: null };
}
