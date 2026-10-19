/**
 * Adjectifs qualificatifs avec leurs QUATRE formes vérifiées.
 * `place` indique si l'adjectif se met avant ou après le nom en français
 * courant : c'est indispensable pour fabriquer des groupes nominaux corrects.
 */

export const ADJECTIFS = [
  { ms: 'petit', fs: 'petite', mp: 'petits', fp: 'petites', place: 'avant' },
  { ms: 'grand', fs: 'grande', mp: 'grands', fp: 'grandes', place: 'avant' },
  { ms: 'joli', fs: 'jolie', mp: 'jolis', fp: 'jolies', place: 'avant' },
  { ms: 'gros', fs: 'grosse', mp: 'gros', fp: 'grosses', place: 'avant' },
  { ms: 'beau', fs: 'belle', mp: 'beaux', fp: 'belles', place: 'avant' },
  { ms: 'vieux', fs: 'vieille', mp: 'vieux', fp: 'vieilles', place: 'avant' },
  { ms: 'nouveau', fs: 'nouvelle', mp: 'nouveaux', fp: 'nouvelles', place: 'avant' },
  { ms: 'long', fs: 'longue', mp: 'longs', fp: 'longues', place: 'avant' },
  { ms: 'noir', fs: 'noire', mp: 'noirs', fp: 'noires', place: 'apres' },
  { ms: 'vert', fs: 'verte', mp: 'verts', fp: 'vertes', place: 'apres' },
  { ms: 'gris', fs: 'grise', mp: 'gris', fp: 'grises', place: 'apres' },
  { ms: 'blanc', fs: 'blanche', mp: 'blancs', fp: 'blanches', place: 'apres' },
  { ms: 'doré', fs: 'dorée', mp: 'dorés', fp: 'dorées', place: 'apres' },
  { anime: true, ms: 'gentil', fs: 'gentille', mp: 'gentils', fp: 'gentilles', place: 'apres' },
  { ms: 'rouge', fs: 'rouge', mp: 'rouges', fp: 'rouges', place: 'apres' },
  { ms: 'jaune', fs: 'jaune', mp: 'jaunes', fp: 'jaunes', place: 'apres' },
  { ms: 'magique', fs: 'magique', mp: 'magiques', fp: 'magiques', place: 'apres' },
  { anime: true, ms: 'sage', fs: 'sage', mp: 'sages', fp: 'sages', place: 'apres' },
  { ms: 'rapide', fs: 'rapide', mp: 'rapides', fp: 'rapides', place: 'apres' },
  { anime: true, ms: 'drôle', fs: 'drôle', mp: 'drôles', fp: 'drôles', place: 'apres' },
];

/** Forme d'un adjectif pour un genre/nombre donné ('ms', 'fp'…). */
export function formeAdj(adj, gn) {
  return adj[gn];
}
