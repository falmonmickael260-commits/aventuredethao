/**
 * MODULE 5 — Trouver le verbe et son infinitif.
 */

import { PHRASES } from '../corpus/phrases.js';
import { NOMS_COMMUNS } from '../corpus/noms.js';
import { ADJECTIFS } from '../corpus/adjectifs.js';
import { exercice, enumerer, melanger, piocher, tokensAffichage } from './outils.js';

const M = 'm5';
const C = 'm5';

const GROUPE_INF = (inf) => {
  if (inf.endsWith('er')) return '1er groupe (verbes en -er)';
  if (inf.endsWith('ir')) return '2e ou 3e groupe (verbes en -ir)';
  return '3e groupe';
};

export function construireM5() {
  const ex = [];

  /* ---- A. Clique sur le verbe conjugué ----------------------------- */
  melanger(PHRASES, 'm5-verbe')
    .slice(0, 18)
    .forEach((p, i) => {
      const v = p.tokens[p.verbe];
      ex.push(
        exercice({
          id: `m5-clic-verbe-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'clic-verbe',
          difficulte: p.niveau,
          type: 'clic-mots',
          consigne: 'Clique sur le verbe conjugué de cette phrase.',
          question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
          reponse: {
            indices: [p.verbe],
            bravo: 'Oui ! C’est bien le mot qui dit ce qui se passe.',
          },
          indice:
            'Le verbe dit ce que l’on FAIT. Essaie de changer le temps : « Hier, … » ou « Demain, … ». Le mot qui change, c’est le verbe.',
          explication: `Le verbe est « ${v.w} ». Son infinitif est « ${p.infinitif} ».`,
        }),
      );
    });

  /* ---- B. Écris l'infinitif ---------------------------------------- */
  const pourInf = melanger(PHRASES, 'm5-inf').slice(0, 16);
  pourInf.forEach((p, i) => {
    const v = p.tokens[p.verbe];
    ex.push(
      exercice({
        id: `m5-ecris-infinitif-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'ecris-infinitif',
        difficulte: p.infinitif.endsWith('er') ? 1 : 3,
        type: 'texte',
        consigne: `Écris l’infinitif du verbe « ${v.w} ».`,
        question: { phrase: p.texte, verbe: v.w, court: true, exemple: 'il court → courir' },
        reponse: {
          attendus: [p.infinitif],
          bravo: 'Exact ! Tu as trouvé son vrai nom.',
          rate: 'Essaie de dire : « il est en train de… ». Ce que tu dis après, c’est l’infinitif.',
        },
        indice:
          'Pour trouver l’infinitif, dis : « il faut … » ou « je vais … ». Exemple : il mange → il faut MANGER.',
        explication: `« ${v.w} » vient du verbe « ${p.infinitif} » — ${GROUPE_INF(p.infinitif)}.`,
      }),
    );
  });

  /* ---- C. Relie le verbe conjugué à son infinitif ------------------ */
  const pool = melanger(
    PHRASES.filter((p, i, arr) => arr.findIndex((q) => q.infinitif === p.infinitif) === i),
    'm5-relie-pool',
  );
  for (let i = 0; i < 8; i++) {
    const lot = pool.slice(i * 4, i * 4 + 4);
    const gauche = lot.map((p, k) => ({ id: `c${k}`, texte: `${p.personne === '3p' ? 'ils' : p.personne === 'nous' ? 'nous' : p.personne === 'tu' ? 'tu' : 'il'} ${p.tokens[p.verbe].w}` }));
    const droite = melanger(lot.map((p, k) => ({ id: `i${k}`, texte: p.infinitif })), `m5-relie-${i}`);
    const paires = {};
    lot.forEach((_, k) => { paires[`c${k}`] = `i${k}`; });
    ex.push(
      exercice({
        id: `m5-relie-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'relie-inf',
        difficulte: i < 3 ? 1 : 2,
        type: 'paires',
        consigne: 'Relie chaque verbe conjugué à son infinitif.',
        question: { gauche, droite, titreGauche: 'Verbes conjugués', titreDroite: 'Infinitifs' },
        reponse: { paires, bravo: 'Tous les verbes ont retrouvé leur vrai nom !' },
        indice: 'Dis « il faut … » devant chaque infinitif pour vérifier.',
        explication: lot.map((p) => `• ${p.tokens[p.verbe].w} → ${p.infinitif}`).join('\n'),
      }),
    );
  }

  /* ---- D. Plusieurs verbes dans un texte --------------------------- */
  const pourTexte = melanger(PHRASES, 'm5-texte');
  for (let i = 0; i < 6; i++) {
    const a = pourTexte[i * 2];
    const b = pourTexte[i * 2 + 1];
    const tokens = [...tokensAffichage(a), ...tokensAffichage(b).map((t, j) => (j === 0 ? { ...t, glue: false } : t))];
    const indices = [a.verbe, b.verbe + a.tokens.length];
    ex.push(
      exercice({
        id: `m5-verbes-texte-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'verbes-texte',
        difficulte: 3,
        type: 'clic-mots',
        consigne: 'Ce texte contient DEUX verbes conjugués. Clique sur les deux.',
        question: { phrase: `${a.texte} ${b.texte}`, tokens, source: `${a.id}+${b.id}` },
        reponse: { indices, bravo: 'Les deux verbes sont trouvés !' },
        indice: 'Il y a une phrase, puis une autre. Chaque phrase a son propre verbe.',
        explication: `Les verbes sont « ${a.tokens[a.verbe].w} » (${a.infinitif}) et « ${b.tokens[b.verbe].w} » (${b.infinitif}).`,
      }),
    );
  }

  /* ---- E. Quel verbe manque ? -------------------------------------- */
  const parPersonne = {};
  for (const p of PHRASES) {
    parPersonne[p.personne] = parPersonne[p.personne] || [];
    parPersonne[p.personne].push(p);
  }
  const pourManquant = melanger(parPersonne['3s'], 'm5-manquant').slice(0, 6);
  pourManquant.forEach((p, i) => {
    const autres = melanger(
      parPersonne['3s'].filter((q) => q.infinitif !== p.infinitif),
      `m5-distract-${i}`,
    ).slice(0, 3);
    const options = melanger(
      [p.tokens[p.verbe].w, ...autres.map((q) => q.tokens[q.verbe].w)],
      `m5-opt-${i}`,
    );
    const trou = p.tokens
      .map((t, j) => (j === 0 || t.glue ? '' : ' ') + (j === p.verbe ? '______' : t.w) + t.after)
      .join('')
      .trim();
    ex.push(
      exercice({
        id: `m5-verbe-manquant-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'verbe-manquant',
        difficulte: 2,
        type: 'choix',
        consigne: 'Choisis le verbe qui convient dans cette phrase.',
        question: { texteTrous: trou, options, source: p.id },
        reponse: {
          index: options.indexOf(p.tokens[p.verbe].w),
          bravo: 'Oui, c’est le verbe qui a du sens ici !',
          rate: 'Relis la phrase en entier avec le verbe que tu as choisi : est-ce que ça veut dire quelque chose ?',
        },
        indice: 'Les quatre verbes sont bien conjugués. Un seul raconte quelque chose de possible.',
        explication: `La phrase complète est : « ${p.texte} ».`,
      }),
    );
  });

  /* ---- F. L'intrus : lequel n'est pas un verbe ? ------------------- */
  const infinitifs = [...new Set(PHRASES.map((p) => p.infinitif))];
  const nonVerbes = [
    ...NOMS_COMMUNS.map((n) => ({ mot: n.mot, nature: 'un nom' })),
    ...ADJECTIFS.map((a) => ({ mot: a.ms, nature: 'un adjectif' })),
  ];
  for (let i = 0; i < 6; i++) {
    const verbes = piocher(infinitifs, 3, `m5-intrus-v-${i}`);
    const intrus = piocher(nonVerbes, 1, `m5-intrus-n-${i}`)[0];
    const options = melanger([...verbes, intrus.mot], `m5-intrus-mix-${i}`);
    ex.push(
      exercice({
        id: `m5-intrus-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'intrus-verbe',
        difficulte: 1,
        type: 'choix',
        consigne: 'Trouve l’intrus : lequel de ces mots n’est PAS un verbe ?',
        question: { options },
        reponse: {
          index: options.indexOf(intrus.mot),
          bravo: 'Bien repéré !',
          rate: 'Essaie de dire « il faut … » devant chaque mot. Avec un verbe, ça marche.',
        },
        indice: 'Devant un verbe à l’infinitif, on peut dire « il faut … ». Devant un nom, non.',
        explication: `« ${intrus.mot} » est ${intrus.nature}, pas un verbe. Les trois autres sont des verbes à l’infinitif : ${enumerer(verbes)}.`,
      }),
    );
  }

  return ex;
}
