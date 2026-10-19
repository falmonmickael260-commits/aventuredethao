/**
 * MODULE 4 — Le groupe sujet et le groupe verbal.
 *
 * Le découpage sujet / groupe verbal est celui du corpus annoté : le groupe
 * verbal est TOUT ce qui n'est pas le groupe sujet (le verbe et ce qui le
 * complète), comme on l'enseigne au CE2.
 */

import { PHRASES } from '../corpus/phrases.js';
import { exercice, melanger, tokensAffichage } from './outils.js';

const M = 'm4';
const C = 'm4';

/** Texte d'un groupe de tokens, apostrophes collées. */
function texteGroupe(p, indices) {
  return indices
    .map((i, k) => (k === 0 || p.tokens[i].glue ? '' : ' ') + p.tokens[i].w + (k === indices.length - 1 ? '' : p.tokens[i].after))
    .join('')
    .trim();
}

/** Formes verbales conjuguées du corpus (servent de liste interdite). */
const FORMES_VERBALES = [...new Set(PHRASES.map((p) => p.tokens[p.verbe].w.toLowerCase()))];

/** Groupes de 4 phrases dont les sujets sont clairement différents :
 *  un seul appariement a du sens, l'exercice « relie » est donc sans ambiguïté. */
const GROUPES_PAIRES = [
  ['p012', 'p007', 'p019', 'p033'],
  ['p001', 'p011', 'p018', 'p040'],
  ['p023', 'p049', 'p061', 'p080'],
  ['p027', 'p017', 'p041', 'p054'],
  ['p015', 'p086', 'p005', 'p052'],
  ['p044', 'p068', 'p071', 'p084'],
];

export function construireM4() {
  const ex = [];
  const parId = Object.fromEntries(PHRASES.map((p) => [p.id, p]));

  /* ---- A. Clique sur le groupe sujet ------------------------------- */
  const pourSujet = melanger(PHRASES, 'm4-sujet');
  pourSujet.slice(0, 18).forEach((p, i) => {
    ex.push(
      exercice({
        id: `m4-clic-sujet-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'clic-sujet',
        difficulte: p.sujet.length >= 3 ? 3 : p.sujet.length === 1 ? 1 : 2,
        type: 'clic-mots',
        consigne: 'Clique sur tous les mots du groupe sujet.',
        question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
        reponse: {
          indices: p.sujet,
          bravo: 'Bravo Thao ! C’est bien de ça qu’on parle dans la phrase.',
        },
        indice: 'Demande-toi : « De qui ou de quoi parle-t-on ? ». Tu peux aussi essayer « C’est … qui … ».',
        explication: `Groupe sujet : « ${texteGroupe(p, p.sujet)} ». On peut dire : « C’est ${texteGroupe(p, p.sujet).toLowerCase()} qui ${texteGroupe(p, p.gv)} ».`,
      }),
    );
  });

  /* ---- B. Clique sur le groupe verbal ------------------------------ */
  const pourGv = melanger(PHRASES, 'm4-gv');
  pourGv.slice(0, 14).forEach((p, i) => {
    ex.push(
      exercice({
        id: `m4-clic-gv-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'clic-gv',
        difficulte: p.gv.length >= 5 ? 3 : p.gv.length <= 3 ? 1 : 2,
        type: 'clic-mots',
        consigne: 'Clique sur tous les mots du groupe verbal.',
        question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
        reponse: {
          indices: p.gv,
          bravo: 'Parfait ! Tu as pris le verbe et tout ce qui le complète.',
        },
        indice: 'Le groupe verbal, c’est tout ce qui RESTE quand on a enlevé le groupe sujet : le verbe et ce qui le complète.',
        explication: `Groupe sujet : « ${texteGroupe(p, p.sujet)} ». Groupe verbal : « ${texteGroupe(p, p.gv)} ».`,
      }),
    );
  });

  /* ---- C. Coupe la phrase en deux ---------------------------------- */
  melanger(PHRASES.filter((p) => p.sujet.length >= 2), 'm4-coupe')
    .slice(0, 8)
    .forEach((p, i) => {
      ex.push(
        exercice({
          id: `m4-coupe-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'coupe',
          difficulte: p.tokens.length <= 6 ? 1 : 2,
          type: 'coupe-phrase',
          consigne: 'Clique entre deux mots pour séparer le groupe sujet du groupe verbal.',
          question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
          reponse: {
            coupe: p.sujet.length,
            bravo: 'Coupure parfaite ! À gauche le sujet, à droite le groupe verbal.',
          },
          indice: 'La coupure se place juste avant le verbe.',
          explication: `« ${texteGroupe(p, p.sujet)} » / « ${texteGroupe(p, p.gv)} ».`,
        }),
      );
    });

  /* ---- D. Relie le sujet et son groupe verbal ---------------------- */
  GROUPES_PAIRES.forEach((ids, i) => {
    const phrases = ids.map((id) => parId[id]);
    const gauche = phrases.map((p, k) => ({ id: `s${k}`, texte: texteGroupe(p, p.sujet) }));
    const droite = melanger(
      phrases.map((p, k) => ({ id: `v${k}`, texte: texteGroupe(p, p.gv) })),
      `m4-paires-${i}`,
    );
    const paires = {};
    phrases.forEach((_, k) => { paires[`s${k}`] = `v${k}`; });
    ex.push(
      exercice({
        id: `m4-relie-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'associe-sujet-gv',
        difficulte: i < 2 ? 1 : 2,
        type: 'paires',
        consigne: 'Relie chaque groupe sujet au groupe verbal qui lui va.',
        question: { gauche, droite, titreGauche: 'Groupes sujets', titreDroite: 'Groupes verbaux' },
        reponse: { paires, bravo: 'Toutes les phrases sont reconstituées !' },
        indice: 'Lis la phrase entière dans ta tête : est-ce que ça veut dire quelque chose ?',
        explication: phrases.map((p) => `• ${p.texte}`).join('\n'),
      }),
    );
  });

  /* ---- E. Complète avec un groupe sujet ---------------------------- */
  melanger(PHRASES.filter((p) => p.personne === '3s' && p.sujet.length >= 2), 'm4-complete')
    .slice(0, 6)
    .forEach((p, i) => {
      const gv = texteGroupe(p, p.gv);
      ex.push(
        exercice({
          id: `m4-complete-sujet-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'complete-sujet',
          difficulte: 3,
          type: 'phrase',
          consigne: 'Invente un groupe sujet pour compléter cette phrase.',
          question: {
            texteTrous: `_________ ${gv}.`,
            court: true,
            exemple: 'Par exemple : « Le gros dragon », « Ma voisine », « Trois enfants »…',
          },
          reponse: {
            regles: [
              { type: 'minMots', n: 2, message: 'Écris un vrai groupe sujet : un déterminant et un nom, par exemple « Le chien ».' },
              { type: 'pasDansListe', mots: FORMES_VERBALES, message: 'Ton groupe sujet ne doit pas contenir de verbe conjugué : le verbe est déjà dans la phrase.' },
              { type: 'lettresSeules', message: 'Utilise seulement des lettres.' },
              { type: 'majuscule', message: 'La phrase commence par une majuscule.' },
            ],
            bravo: 'Super groupe sujet ! Ta phrase est complète.',
            solution: texteGroupe(p, p.sujet),
          },
          indice: 'Un groupe sujet contient souvent un déterminant et un nom : « le chat », « mon frère », « la vieille sorcière ».',
          explication: `Dans la phrase d’origine, le groupe sujet était « ${texteGroupe(p, p.sujet)} ». Mais beaucoup d’autres réponses sont possibles !`,
        }),
      );
    });

  /* ---- F. Remets la phrase dans l'ordre ---------------------------- */
  melanger(PHRASES.filter((p) => p.tokens.length >= 4 && p.tokens.length <= 6 && !p.tokens.some((t) => t.glue)), 'm4-ordre')
    .slice(0, 5)
    .forEach((p, i) => {
      const bon = p.tokens.map((t) => t.w);
      let brouille = melanger(bon, `m4-brouille-${i}`);
      if (brouille.join(' ') === bon.join(' ')) brouille = [...bon].reverse();
      ex.push(
        exercice({
          id: `m4-remets-ordre-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'remets-ordre',
          difficulte: 3,
          type: 'ordre',
          consigne: 'Remets les mots dans l’ordre pour reconstruire la phrase.',
          question: { mots: brouille, source: p.id },
          reponse: { ordre: bon, bravo: 'La phrase est reconstruite !' },
          indice: 'Commence par le groupe sujet (de qui on parle), puis place le verbe, puis la fin.',
          explication: `La phrase était : « ${p.texte} ».`,
        }),
      );
    });

  /* ---- G. Invente une phrase complète ------------------------------ */
  const sujets = [
    { sujet: 'Le petit dragon', verbe: 'vole', aide: 'au-dessus du château' },
    { sujet: 'Ma sœur', verbe: 'dessine', aide: 'un bateau' },
    { sujet: 'Les pirates', verbe: 'cherchent', aide: 'un trésor' },
    { sujet: 'Le robot', verbe: 'range', aide: 'la cuisine' },
  ];
  sujets.forEach((s, i) => {
    ex.push(
      exercice({
        id: `m4-invente-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'invente-phrase',
        difficulte: 3,
        type: 'phrase',
        consigne: `Invente une phrase complète avec le groupe sujet « ${s.sujet} » et le verbe « ${s.verbe} ».`,
        question: {
          exemple: `Par exemple : « ${s.sujet} ${s.verbe} ${s.aide}. »`,
          aide: 'N’oublie pas la majuscule au début et le point à la fin !',
        },
        reponse: {
          regles: [
            { type: 'contient', mots: [s.sujet.split(' ').pop()], message: `Ta phrase doit contenir le groupe sujet « ${s.sujet} ».` },
            { type: 'contient', mots: [s.verbe], message: `Ta phrase doit contenir le verbe « ${s.verbe} ».` },
            { type: 'ordre', avant: s.sujet.split(' ').pop(), apres: s.verbe, message: 'Le groupe sujet se place avant le verbe.' },
            { type: 'minMots', n: 4, message: 'Ajoute un petit complément pour faire une vraie phrase.' },
            { type: 'majuscule', message: 'Une phrase commence par une majuscule.' },
            { type: 'point', message: 'N’oublie pas le point à la fin de ta phrase.' },
          ],
          bravo: 'Quelle belle phrase, Thao ! Groupe sujet + groupe verbal : c’est exactement ça.',
          solution: `${s.sujet} ${s.verbe} ${s.aide}.`,
        },
        indice: `Écris d’abord « ${s.sujet} », puis « ${s.verbe} », puis ajoute ce que tu veux.`,
        explication: `Une phrase complète = un groupe sujet + un groupe verbal, une majuscule au début et un point à la fin.`,
      }),
    );
  });

  return ex;
}
