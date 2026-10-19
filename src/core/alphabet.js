/**
 * Ordre alphabetique francais, tel qu'on l'apprend au CE2 et tel qu'il est
 * utilise dans un dictionnaire :
 *   - on ne tient pas compte des majuscules ;
 *   - on ne tient pas compte des accents (e, e accent aigu, e accent grave
 *     se rangent au meme endroit) ;
 *   - les traits d'union et les apostrophes sont ignores ;
 *   - quand deux mots commencent pareil, on compare la lettre suivante ;
 *   - un mot plus court passe avant le mot plus long qui commence pareil
 *     ("mer" avant "merci").
 */

/** Cle de comparaison : minuscules, sans accent, lettres seulement. */
export function cleAlpha(mot) {
  return String(mot)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

/** Compare deux mots. < 0 si a vient avant b, > 0 sinon, 0 si meme rang. */
export function compareAlpha(a, b) {
  const ka = cleAlpha(a);
  const kb = cleAlpha(b);
  if (ka < kb) return -1;
  if (ka > kb) return 1;
  return 0;
}

/** Trie une liste de mots dans l'ordre alphabetique (copie). */
export function trierAlpha(mots) {
  return [...mots].sort((a, b) => compareAlpha(a, b) || (a < b ? -1 : a > b ? 1 : 0));
}

/** La liste est-elle rangee dans l'ordre alphabetique ? */
export function estTrieAlpha(mots) {
  for (let i = 1; i < mots.length; i++) {
    if (compareAlpha(mots[i - 1], mots[i]) > 0) return false;
  }
  return true;
}

/** Rang de la premiere lettre qui differe (1 = la premiere lettre). */
export function premiereDifference(a, b) {
  const ka = cleAlpha(a);
  const kb = cleAlpha(b);
  const n = Math.min(ka.length, kb.length);
  for (let i = 0; i < n; i++) {
    if (ka[i] !== kb[i]) return i + 1;
  }
  return n + 1; // l'un est le debut de l'autre
}

/**
 * Le mot se trouve-t-il entre les deux mots reperes d'une page de
 * dictionnaire ? Les mots reperes eux-memes sont sur la page (bornes incluses).
 */
export function estEntre(mot, repereGauche, repereDroit) {
  return (
    compareAlpha(mot, repereGauche) >= 0 && compareAlpha(mot, repereDroit) <= 0
  );
}
