/**
 * MODULE 9 — Le dictionnaire et les mots repères.
 *
 * Les pages du dictionnaire sont découpées par `pagesDico()` à partir de la
 * liste triée : les mots repères affichés sont donc TOUJOURS cohérents avec
 * l'ordre alphabétique réel, et les réponses sont calculées, jamais écrites.
 */

import { DEFINITIONS, MOTS_DICO, pagesDico, pageDuMot } from '../corpus/dictionnaire.js';
import { compareAlpha, estEntre, trierAlpha } from '../../src/core/alphabet.js';
import { exercice, melanger, piocher } from './outils.js';

const M = 'm9';
const C = 'm9';

const PAGES = pagesDico(6);

/** Un mot du dictionnaire choisi hors de la page donnée. */
function motHorsPage(page, cle) {
  const dehors = MOTS_DICO.filter((m) => !estEntre(m, page.repereGauche, page.repereDroit));
  return piocher(dehors, 1, cle)[0];
}

export function construireM9() {
  const ex = [];

  /* ---- A. Le mot est-il sur cette page ? --------------------------- */
  const pagesVF = melanger(PAGES, 'm9-vf');
  for (let i = 0; i < 12; i++) {
    const page = pagesVF[i % pagesVF.length];
    const dedans = i % 2 === 0;
    const mot = dedans
      ? piocher(page.mots.slice(1, -1).length ? page.mots.slice(1, -1) : page.mots, 1, `m9-vfd-${i}`)[0]
      : motHorsPage(page, `m9-vfh-${i}`);
    const vraiment = estEntre(mot, page.repereGauche, page.repereDroit);
    ex.push(
      exercice({
        id: `m9-entre-reperes-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'entre-reperes',
        difficulte: i < 5 ? 1 : 2,
        type: 'vrai-faux',
        consigne: 'Regarde les mots repères, puis réponds.',
        question: {
          page: { repereGauche: page.repereGauche, repereDroit: page.repereDroit, numero: page.numero },
          affirmation: `Les mots repères de cette page sont « ${page.repereGauche} » et « ${page.repereDroit} ». Le mot « ${mot} » se trouve-t-il sur cette page ?`,
        },
        reponse: {
          valeur: vraiment,
          bravo: vraiment ? 'Oui ! Il se range bien entre les deux repères.' : 'Bravo, il n’est pas sur cette page.',
          rate: vraiment
            ? `Si : « ${mot} » se range entre « ${page.repereGauche} » et « ${page.repereDroit} ».`
            : `Non : « ${mot} » se range ${compareAlpha(mot, page.repereGauche) < 0 ? 'AVANT' : 'APRÈS'} les mots repères de cette page.`,
        },
        indice: 'Compare la première lettre du mot avec celles des deux mots repères, puis la deuxième.',
        explication: `Sur cette page, on trouve : ${page.mots.join(', ')}.`,
      }),
    );
  }

  /* ---- B. Choisis la bonne page ------------------------------------ */
  for (let i = 0; i < 10; i++) {
    const bonnePage = PAGES[(i * 3 + 2) % PAGES.length];
    const mot = piocher(bonnePage.mots, 1, `m9-cp-${i}`)[0];
    const autres = melanger(PAGES.filter((p) => p.numero !== bonnePage.numero), `m9-cpa-${i}`).slice(0, 2);
    const options = melanger([bonnePage, ...autres], `m9-cpmix-${i}`);
    ex.push(
      exercice({
        id: `m9-choisis-page-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'choisis-page',
        difficulte: i < 4 ? 1 : 2,
        type: 'choix',
        consigne: `Sur quelle page du dictionnaire se trouve le mot « ${mot} » ?`,
        question: {
          mot,
          pages: options.map((p) => ({ repereGauche: p.repereGauche, repereDroit: p.repereDroit })),
          options: options.map((p) => `${p.repereGauche} — ${p.repereDroit}`),
        },
        reponse: {
          index: options.findIndex((p) => p.numero === bonnePage.numero),
          bravo: 'Bonne page ! Tu sais lire les mots repères.',
          rate: 'Le mot cherché doit se ranger ENTRE les deux mots repères de la page.',
        },
        indice: `« ${mot} » commence par « ${mot[0]} ». Cherche la page dont les repères encadrent cette lettre.`,
        explication: `« ${mot} » se range entre « ${bonnePage.repereGauche} » et « ${bonnePage.repereDroit} ».`,
      }),
    );
  }

  /* ---- C. Trouve le mot dans la page ------------------------------- */
  for (let i = 0; i < 10; i++) {
    const page = PAGES[(i * 5 + 1) % PAGES.length];
    const avecDef = page.mots.filter((m) => DEFINITIONS[m]);
    const mot = piocher(avecDef, 1, `m9-td-${i}`)[0];
    ex.push(
      exercice({
        id: `m9-trouve-page-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'trouve-dans-page',
        difficulte: i < 4 ? 1 : 2,
        type: 'choix',
        consigne: 'Voici une page du dictionnaire. Quel mot correspond à cette définition ?',
        question: {
          definition: DEFINITIONS[mot].def,
          pageComplete: {
            numero: page.numero,
            repereGauche: page.repereGauche,
            repereDroit: page.repereDroit,
            entrees: page.mots.map((m) => ({
              mot: m,
              nature: DEFINITIONS[m]?.nature || 'nom',
              def: DEFINITIONS[m]?.def || '',
            })),
          },
          options: page.mots,
        },
        reponse: {
          index: page.mots.indexOf(mot),
          bravo: 'Trouvé ! C’est comme ça qu’on utilise un dictionnaire.',
          rate: 'Relis les définitions de la page, une par une.',
        },
        indice: 'Lis chaque définition de la page et compare-la à celle de la question.',
        explication: `${mot} : ${DEFINITIONS[mot].def}`,
      }),
    );
  }

  /* ---- D. Range comme dans le dictionnaire ------------------------- */
  for (let i = 0; i < 8; i++) {
    const mots = piocher(MOTS_DICO, 4, `m9-ordre-${i}`);
    const solution = trierAlpha(mots);
    let depart = melanger(mots, `m9-ostart-${i}`);
    if (depart.join('|') === solution.join('|')) depart = [...solution].reverse();
    ex.push(
      exercice({
        id: `m9-ordre-dico-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'ordre-dico',
        difficulte: i < 3 ? 2 : 3,
        type: 'ordre',
        consigne: 'Range ces mots comme ils apparaissent dans le dictionnaire.',
        question: { mots: depart },
        reponse: { ordre: solution, bravo: 'Exactement l’ordre du dictionnaire !' },
        indice: 'Le dictionnaire ne tient pas compte des accents : « école » se range à la lettre E.',
        explication: `Ordre du dictionnaire : ${solution.join(' — ')}.`,
      }),
    );
  }

  /* ---- E. Le coffre à trois serrures ------------------------------- */
  for (let i = 0; i < 6; i++) {
    const trois = piocher(MOTS_DICO, 3, `m9-coffre-${i}`);
    const champs = trois.map((mot, k) => ({
      cle: `c${k}`,
      etiquette: mot,
      attendus: [String(pageDuMot(mot, PAGES).numero)],
    }));
    ex.push(
      exercice({
        id: `m9-coffre-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'coffre',
        difficulte: 3,
        type: 'textes',
        consigne: 'Trois serrures, trois mots à chercher. Écris le numéro de la page de chaque mot pour ouvrir le coffre !',
        question: {
          coffre: true,
          pages: PAGES.map((p) => ({ numero: p.numero, repereGauche: p.repereGauche, repereDroit: p.repereDroit })),
          champs: champs.map((c) => ({ cle: c.cle, etiquette: c.etiquette })),
        },
        reponse: { champs, bravo: 'CLIC ! Le coffre s’ouvre. Bravo Thao !' },
        indice: 'Pour chaque mot, cherche la page dont les deux mots repères l’encadrent.',
        explication: trois
          .map((mot) => {
            const p = pageDuMot(mot, PAGES);
            return `${mot} → page ${p.numero} (${p.repereGauche} — ${p.repereDroit})`;
          })
          .join('\n'),
      }),
    );
  }

  /* ---- F. Le mot mystère ------------------------------------------- */
  const avecDefinition = MOTS_DICO.filter((m) => DEFINITIONS[m]);
  piocher(avecDefinition, 6, 'm9-mystere').forEach((mot, i) => {
    const page = pageDuMot(mot, PAGES);
    ex.push(
      exercice({
        id: `m9-mystere-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'indices',
        difficulte: 3,
        type: 'texte',
        consigne: 'Trouve le mot mystère grâce aux indices, puis écris-le.',
        question: {
          court: true,
          indices: [
            `Définition : ${DEFINITIONS[mot].def}`,
            `Il est sur la page dont les mots repères sont « ${page.repereGauche} » et « ${page.repereDroit} ».`,
            `Il commence par la lettre « ${mot[0].toUpperCase()} » et compte ${mot.length} lettres.`,
          ],
        },
        reponse: {
          attendus: [mot],
          bravo: 'Mot mystère trouvé ! Tu es un vrai explorateur du dictionnaire.',
          rate: 'Relis les trois indices : la définition, la page, et la première lettre.',
        },
        indice: `Le mot commence par « ${mot.slice(0, 2)} ».`,
        explication: `Le mot mystère était « ${mot} » : ${DEFINITIONS[mot].def}`,
      }),
    );
  });

  return ex;
}
