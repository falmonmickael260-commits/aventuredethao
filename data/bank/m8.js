/**
 * MODULE 8 — L'ordre alphabétique.
 *
 * Toutes les solutions sont produites par `trierAlpha` (src/core/alphabet.js),
 * qui applique les règles du dictionnaire : accents et majuscules ignorés,
 * comparaison lettre par lettre, mot court avant mot long.
 */

import { GROUPES_ALPHA, PAIRES, RESERVOIR_ALPHA } from '../corpus/lexique.js';
import { compareAlpha, premiereDifference, trierAlpha } from '../../src/core/alphabet.js';
import { exercice, melanger, piocher } from './outils.js';

const M = 'm8';
const C = 'm8';

const ORDINAL = ['1re', '2e', '3e', '4e', '5e', '6e', '7e'];

function aideRang(rang) {
  if (rang === 1) return 'La première lettre suffit pour ranger ces mots.';
  return `Ces mots commencent pareil : il faut comparer la ${ORDINAL[rang - 1]} lettre.`;
}

export function construireM8() {
  const ex = [];

  /* ---- A. Range les mots dans l'ordre ------------------------------ */
  const faciles = GROUPES_ALPHA.filter((g) => g.rang <= 2);
  const durs = GROUPES_ALPHA.filter((g) => g.rang >= 3);
  const pourRanger = [...melanger(faciles, 'm8-f'), ...melanger(durs, 'm8-d')].slice(0, 16);
  pourRanger.forEach((g, i) => {
    let depart = melanger(g.mots, `m8-start-${g.id}`);
    if (depart.join('|') === g.solution.join('|')) depart = [...g.solution].reverse();
    ex.push(
      exercice({
        id: `m8-range-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'range',
        difficulte: g.rang === 1 ? 1 : g.rang === 2 ? 2 : 3,
        type: 'ordre',
        consigne: 'Déplace les mots pour les ranger dans l’ordre alphabétique.',
        question: { mots: depart, rang: g.rang },
        reponse: { ordre: g.solution, bravo: 'Rangé comme dans un vrai dictionnaire !' },
        indice: aideRang(g.rang),
        explication: `Ordre correct : ${g.solution.join(' — ')}.`,
      }),
    );
  });

  /* ---- B. Où placer ce mot ? --------------------------------------- */
  for (let i = 0; i < 12; i++) {
    const trois = trierAlpha(piocher(RESERVOIR_ALPHA, 3, `m8-place-${i}`));
    const candidats = RESERVOIR_ALPHA.filter((m) => !trois.includes(m));
    const mot = piocher(candidats, 1, `m8-mot-${i}`)[0];
    const place = trierAlpha([...trois, mot]).indexOf(mot);
    const options = [
      `Avant « ${trois[0]} »`,
      `Entre « ${trois[0]} » et « ${trois[1]} »`,
      `Entre « ${trois[1]} » et « ${trois[2]} »`,
      `Après « ${trois[2]} »`,
    ];
    ex.push(
      exercice({
        id: `m8-place-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'avant-apres',
        difficulte: i < 5 ? 1 : 2,
        type: 'choix',
        consigne: `Où faut-il placer le mot « ${mot} » dans cette liste rangée ?`,
        question: { liste: trois, mot, options },
        reponse: {
          index: place,
          bravo: 'Pile au bon endroit !',
          rate: 'Compare la première lettre de chaque mot, puis la deuxième si besoin.',
        },
        indice: `Regarde la première lettre de « ${mot} » et compare-la à celles de la liste.`,
        explication: `Liste complète : ${trierAlpha([...trois, mot]).join(' — ')}.`,
      }),
    );
  }

  /* ---- C. Lequel vient avant ? ------------------------------------- */
  melanger(PAIRES, 'm8-compare')
    .slice(0, 10)
    .forEach((pa, i) => {
      const options = melanger([pa.a, pa.b], `m8-cmp-${pa.id}`);
      const rang = premiereDifference(pa.a, pa.b);
      ex.push(
        exercice({
          id: `m8-compare-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'compare',
          difficulte: rang >= 3 ? 3 : 1,
          type: 'choix',
          consigne: 'Lequel de ces deux mots vient en premier dans le dictionnaire ?',
          question: { options },
          reponse: {
            index: options.indexOf(pa.premier),
            bravo: 'Bien comparé !',
            rate: 'Compare les lettres une par une, depuis le début.',
          },
          indice: aideRang(rang),
          explication: `« ${pa.premier} » vient avant « ${pa.second} » : à la ${ORDINAL[rang - 1]} lettre, ${
            pa.premier.toLowerCase()[rang - 1] ? `« ${pa.premier.toLowerCase()[rang - 1]} » passe avant « ${pa.second.toLowerCase()[rang - 1]} »` : 'le mot le plus court passe devant'
          }.`,
        }),
      );
    });

  /* ---- D. Les mots qui commencent pareil --------------------------- */
  melanger(durs, 'm8-meme')
    .slice(0, 8)
    .forEach((g, i) => {
      let depart = melanger(g.mots, `m8-mstart-${g.id}`);
      if (depart.join('|') === g.solution.join('|')) depart = [...g.solution].reverse();
      ex.push(
        exercice({
          id: `m8-meme-lettre-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'meme-lettre',
          difficulte: 3,
          type: 'ordre',
          consigne: `Ces mots commencent par les mêmes lettres. Range-les quand même dans l’ordre !`,
          question: { mots: depart, rang: g.rang },
          reponse: { ordre: g.solution, bravo: 'Champion ! Tu compares jusqu’au bout.' },
          indice: aideRang(g.rang),
          explication: `Ordre correct : ${g.solution.join(' — ')}. Il fallait aller jusqu’à la ${ORDINAL[g.rang - 1]} lettre.`,
        }),
      );
    });

  /* ---- E. Écris la liste rangée ------------------------------------ */
  for (let i = 0; i < 8; i++) {
    const mots = piocher(RESERVOIR_ALPHA, 4, `m8-ecris-${i}`);
    const solution = trierAlpha(mots);
    const champs = solution.map((mot, k) => ({
      cle: `r${k}`,
      etiquette: `${ORDINAL[k]}`,
      attendus: [mot],
    }));
    ex.push(
      exercice({
        id: `m8-ecris-liste-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'ecris-liste',
        difficulte: i < 3 ? 1 : i < 6 ? 2 : 3,
        type: 'textes',
        consigne: 'Recopie ces quatre mots dans l’ordre alphabétique.',
        question: {
          mots: melanger(mots, `m8-emix-${i}`),
          enListe: true,
          champs: champs.map((c) => ({ cle: c.cle, etiquette: c.etiquette })),
        },
        reponse: { champs, bravo: 'Liste parfaitement rangée et bien orthographiée !' },
        indice: 'Commence par chercher le mot dont la première lettre est la plus proche de A.',
        explication: `Ordre correct : ${solution.join(' — ')}.`,
      }),
    );
  }

  return ex;
}
