/**
 * MODULE 7 — Les familles de mots.
 *
 * Les pièges sont volontaires et vérifiés : « chantier » n'est PAS de la
 * famille de « chanter », « jouer » n'est PAS de la famille de « jour ».
 * Avant de fabriquer un exercice qui mélange deux familles, on vérifie
 * qu'aucun mot n'appartient aux deux : sinon l'exercice aurait deux réponses.
 */

import { FAMILLES } from '../corpus/familles.js';
import { exercice, enumerer, melanger, piocher } from './outils.js';

const M = 'm7';
const C = 'm7';

/** Deux familles sont compatibles si aucun mot (ni intrus) n'est partagé. */
function compatibles(a, b) {
  const motsA = new Set([...a.mots, ...a.intrus]);
  return ![...b.mots, ...b.intrus].some((m) => motsA.has(m));
}

/** Construit des paires de familles sans aucun mot en commun. */
function pairesDeFamilles(n) {
  const out = [];
  const ordre = melanger(FAMILLES, 'm7-paires');
  const pris = new Set();
  for (const a of ordre) {
    if (out.length >= n) break;
    if (pris.has(a.id)) continue;
    const b = ordre.find((x) => x.id !== a.id && !pris.has(x.id) && compatibles(a, x));
    if (!b) continue;
    pris.add(a.id);
    pris.add(b.id);
    out.push([a, b]);
  }
  return out;
}

export function construireM7() {
  const ex = [];

  /* ---- A. Trouve l'intrus ------------------------------------------ */
  melanger(FAMILLES.filter((f) => f.mots.length >= 3), 'm7-intrus')
    .slice(0, 14)
    .forEach((f, i) => {
      const trois = piocher(f.mots, 3, `m7-i-${f.id}`);
      const intrus = f.intrus[i % f.intrus.length];
      const options = melanger([...trois, intrus], `m7-imix-${f.id}`);
      ex.push(
        exercice({
          id: `m7-intrus-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'intrus',
          difficulte: i < 6 ? 1 : 2,
          type: 'choix',
          consigne: 'Trois mots sont de la même famille. Clique sur l’intrus.',
          question: { options },
          reponse: {
            index: options.indexOf(intrus),
            bravo: 'Bien joué, l’intrus est démasqué !',
            rate: `Attention au piège : ce mot est bien de la famille de « ${f.radical} ».`,
          },
          indice: `Cherche le morceau commun et surtout l’IDÉE commune : ici, ${f.sens}.`,
          explication: `${enumerer(trois)} sont de la famille de « ${f.radical} » (${f.sens}). « ${intrus} » ressemble un peu, mais n’a rien à voir avec cette idée.`,
        }),
      );
    });

  /* ---- B. Regroupe les deux familles ------------------------------- */
  pairesDeFamilles(12).forEach(([a, b], i) => {
    const motsA = piocher(a.mots, 3, `m7-ra-${a.id}`);
    const motsB = piocher(b.mots, 3, `m7-rb-${b.id}`);
    const placement = {};
    motsA.forEach((m) => { placement[m] = a.id; });
    motsB.forEach((m) => { placement[m] = b.id; });
    ex.push(
      exercice({
        id: `m7-regroupe-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'regroupe',
        difficulte: i < 6 ? 1 : i < 10 ? 2 : 3,
        type: 'colonnes',
        consigne: 'Range chaque mot dans sa famille.',
        question: {
          mots: melanger([...motsA, ...motsB], `m7-rmix-${i}`),
          colonnes: [
            { id: a.id, titre: `Famille de « ${a.radical} »`, aide: a.sens },
            { id: b.id, titre: `Famille de « ${b.radical} »`, aide: b.sens },
          ],
        },
        reponse: { placement, bravo: 'Les deux familles sont bien rangées !' },
        indice: 'Regarde le morceau de mot qui revient dans chaque famille.',
        explication: `Famille de « ${a.radical} » : ${enumerer(motsA)}. Famille de « ${b.radical} » : ${enumerer(motsB)}.`,
      }),
    );
  });

  /* ---- C. Complète la famille -------------------------------------- */
  melanger(FAMILLES, 'm7-complete')
    .slice(0, 12)
    .forEach((f, i) => {
      const montres = piocher(f.mots, 2, `m7-cm-${f.id}`);
      const bon = f.mots.find((m) => !montres.includes(m));
      const autres = melanger(
        FAMILLES.filter((x) => x.id !== f.id && compatibles(f, x)).flatMap((x) => x.mots),
        `m7-cd-${f.id}`,
      ).slice(0, 2);
      const options = melanger([bon, f.intrus[0], ...autres], `m7-cmix-${f.id}`);
      ex.push(
        exercice({
          id: `m7-complete-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'complete-famille',
          difficulte: i < 5 ? 1 : 2,
          type: 'choix',
          consigne: `Quel mot appartient à la même famille que ${enumerer(montres.map((m) => `« ${m} »`))} ?`,
          question: { options, montres },
          reponse: {
            index: options.indexOf(bon),
            bravo: 'Oui ! Même radical, même idée.',
            rate: `Ce mot n’a pas le même radical que « ${f.radical} ».`,
          },
          indice: `Les mots de cette famille tournent autour de cette idée : ${f.sens}.`,
          explication: `« ${bon} » est de la famille de « ${f.radical} », comme ${enumerer(montres)}. Attention, « ${f.intrus[0]} » est un faux ami !`,
        }),
      );
    });

  /* ---- D. Écris un mot de la famille ------------------------------- */
  melanger(FAMILLES.filter((f) => f.mots.length >= 4), 'm7-ecris')
    .slice(0, 10)
    .forEach((f, i) => {
      const montres = piocher(f.mots, 2, `m7-em-${f.id}`);
      const attendus = f.mots.filter((m) => !montres.includes(m));
      ex.push(
        exercice({
          id: `m7-ecris-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'ecris-famille',
          difficulte: i < 2 ? 2 : 3,
          type: 'texte',
          consigne: `Écris un AUTRE mot de la famille de ${enumerer(montres.map((m) => `« ${m} »`))}.`,
          question: { montres, court: true, exemple: `Un mot différent de ${enumerer(montres)}.` },
          reponse: {
            attendus,
            bravo: 'Super ! Ce mot fait bien partie de la famille.',
            rate: `Ce mot ne fait pas partie de la famille de « ${f.radical} ». Essaie encore !`,
          },
          indice: `Le radical de la famille est « ${f.radical} ». Tu peux ajouter un morceau devant ou derrière.`,
          explication: `Mots de cette famille : ${enumerer(f.mots)}.`,
        }),
      );
    });

  /* ---- E. Quel est le lien de sens ? ------------------------------- */
  melanger(FAMILLES, 'm7-sens')
    .slice(0, 8)
    .forEach((f, i) => {
      const deux = piocher(f.mots, 2, `m7-s-${f.id}`);
      const faux = melanger(FAMILLES.filter((x) => x.id !== f.id), `m7-sf-${f.id}`)
        .slice(0, 2)
        .map((x) => x.sens);
      const options = melanger([f.sens, ...faux], `m7-smix-${f.id}`);
      ex.push(
        exercice({
          id: `m7-lien-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'lien-sens',
          difficulte: i < 3 ? 1 : 2,
          type: 'choix',
          consigne: `Quel est le lien de sens entre « ${deux[0]} » et « ${deux[1]} » ?`,
          question: { options, mots: deux },
          reponse: {
            index: options.indexOf(f.sens),
            bravo: 'Exactement ! C’est bien l’idée commune de la famille.',
            rate: 'Relis les deux mots et demande-toi de quoi ils parlent tous les deux.',
          },
          indice: 'Les mots d’une famille partagent un morceau ET une idée. Cherche l’idée.',
          explication: `« ${deux[0]} » et « ${deux[1]} » sont de la famille de « ${f.radical} » : ${f.sens}.`,
        }),
      );
    });

  return ex;
}
