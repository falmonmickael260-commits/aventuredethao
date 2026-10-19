/**
 * MODULE 1 — Reconnaître les noms et les déterminants.
 *
 * Toutes les réponses sont extraites de l'annotation grammaticale du corpus
 * (data/corpus/phrases.js) : elles ne sont jamais saisies à la main ici, donc
 * elles ne peuvent pas être en désaccord avec l'analyse de la phrase.
 */

import { PHRASES, phrasesPour } from '../corpus/phrases.js';
import { DETERMINANTS, NOMS_COMMUNS, TOUS_DETERMINANTS } from '../corpus/noms.js';
import { exercice, enumerer, melanger, piocher, tokensAffichage, texteAvecBlancs } from './outils.js';

const M = 'm1';
const C = 'm1';

/** Le nom auquel se rapporte le déterminant placé en `i` (on saute les adjectifs). */
function nomApres(phrase, i) {
  for (let j = i + 1; j < phrase.tokens.length; j++) {
    const t = phrase.tokens[j];
    if (t.pos === 'nom') return { index: j, token: t };
    if (t.pos !== 'adj') return null;
  }
  return null;
}

const VOYELLE = /^[aeiouyàâäéèêëîïôöûüh]/i;

function difficulteSelon(n, niveau) {
  if (n <= 2 && niveau <= 2) return 1;
  if (n >= 4 || niveau >= 3) return 3;
  return 2;
}

export function construireM1() {
  const ex = [];

  /* ---- A. Trouve le nom (clic sur les mots) ------------------------- */
  const pourNoms = melanger(PHRASES.filter((p) => p.noms.length >= 2), 'm1-noms');
  pourNoms.slice(0, 22).forEach((p, i) => {
    const noms = p.noms.map((j) => p.tokens[j].w);
    ex.push(
      exercice({
        id: `m1-trouve-noms-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'trouve-noms',
        difficulte: difficulteSelon(p.noms.length, p.niveau),
        type: 'clic-mots',
        consigne: 'Clique sur tous les noms de cette phrase.',
        question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
        reponse: {
          indices: p.noms,
          bravo: 'Bravo Thao ! Tu as trouvé tous les noms !',
        },
        indice:
          'Un nom désigne une personne, un animal, une chose ou un lieu. Essaie de mettre « le », « la » ou « une » devant le mot : si ça sonne juste, c’est souvent un nom.',
        explication: `Dans cette phrase, il y a ${p.noms.length} noms : ${enumerer(noms)}.`,
      }),
    );
  });

  /* ---- B. Trouve le déterminant ------------------------------------ */
  const pourDets = melanger(
    phrasesPour('det').filter((p) => p.dets.length >= 2),
    'm1-dets',
  );
  pourDets.slice(0, 10).forEach((p, i) => {
    const dets = p.dets.map((j) => p.tokens[j].w);
    ex.push(
      exercice({
        id: `m1-trouve-det-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'trouve-det',
        difficulte: difficulteSelon(p.dets.length, p.niveau),
        type: 'clic-mots',
        consigne: 'Clique sur tous les déterminants de cette phrase.',
        question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
        reponse: { indices: p.dets, bravo: 'Parfait ! Tu repères très bien les déterminants.' },
        indice:
          'Le déterminant est le petit mot placé juste avant le nom : le, la, les, un, une, des, mon, ma, mes, ce, cette, ces…',
        explication: `Les déterminants sont : ${enumerer(dets)}. Chacun annonce un nom.`,
      }),
    );
  });

  /* ---- C. Complète la phrase avec le bon déterminant --------------- */
  const candidatsBlancs = phrasesPour('det')
    .map((p) => {
      const bons = p.dets.filter((i) => {
        const n = nomApres(p, i);
        return n && !VOYELLE.test(n.token.w) && p.tokens[i].w.length > 1;
      });
      return { p, bons };
    })
    .filter((c) => c.bons.length >= 2);

  melanger(candidatsBlancs, 'm1-blancs')
    .slice(0, 8)
    .forEach(({ p, bons }, i) => {
      const trous = bons.slice(0, 2);
      const champs = trous.map((idx) => {
        const n = nomApres(p, idx);
        const cle = `d${idx}`;
        const gn = `${n.token.genre}${n.token.nombre}`;
        return {
          cle,
          etiquette: `avant « ${n.token.w} »`,
          attendus: [...new Set([p.tokens[idx].w.toLowerCase(), ...DETERMINANTS[gn]])],
          gn,
        };
      });
      ex.push(
        exercice({
          id: `m1-complete-det-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'complete-det',
          difficulte: p.niveau >= 3 ? 3 : 2,
          type: 'textes',
          consigne: 'Écris un déterminant qui convient dans chaque case.',
          question: {
            texteTrous: texteAvecBlancs(p, trous),
            champs: champs.map((c) => ({ cle: c.cle, etiquette: c.etiquette })),
            source: p.id,
          },
          reponse: {
            champs,
            bravo: 'Très bien ! Tes déterminants vont parfaitement avec les noms.',
          },
          indice:
            'Regarde le nom qui suit : est-il masculin ou féminin ? singulier ou pluriel ? Le déterminant doit s’accorder avec lui.',
          explication: `La phrase complète peut s’écrire : « ${p.texte} » — mais d’autres déterminants du même genre et du même nombre marchent aussi.`,
        }),
      );
    });

  /* ---- D. Le tri magique (noms / déterminants) --------------------- */
  const reservoirNoms = NOMS_COMMUNS.map((n) => n.mot);
  for (let i = 0; i < 7; i++) {
    const noms = piocher(reservoirNoms, 3, `m1-tri-n-${i}`);
    const dets = piocher(TOUS_DETERMINANTS, 3, `m1-tri-d-${i}`);
    const placement = {};
    noms.forEach((m) => { placement[m] = 'noms'; });
    dets.forEach((m) => { placement[m] = 'dets'; });
    ex.push(
      exercice({
        id: `m1-tri-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'tri-noms-det',
        difficulte: i < 3 ? 1 : 2,
        type: 'colonnes',
        consigne: 'Range chaque mot dans la bonne colonne.',
        question: {
          mots: melanger([...noms, ...dets], `m1-tri-mix-${i}`),
          colonnes: [
            { id: 'noms', titre: 'Noms', aide: 'une chose, un animal, une personne' },
            { id: 'dets', titre: 'Déterminants', aide: 'le petit mot devant le nom' },
          ],
        },
        reponse: { placement, bravo: 'Tout est bien rangé, Thao !' },
        indice: 'Un déterminant ne peut pas être tout seul : il attend toujours un nom derrière lui.',
        explication: `Noms : ${enumerer(noms)}. Déterminants : ${enumerer(dets)}.`,
      }),
    );
  }

  /* ---- E. Le détective grammatical (petit texte) ------------------- */
  const paires = melanger(PHRASES.filter((p) => p.noms.length >= 2 && p.noms.length <= 3), 'm1-detective');
  for (let i = 0; i < 5; i++) {
    const a = paires[i * 2];
    const b = paires[i * 2 + 1];
    const tokens = [...tokensAffichage(a), ...tokensAffichage(b).map((t, j) => (j === 0 ? { ...t, glue: false } : t))];
    const indices = [...a.noms, ...b.noms.map((j) => j + a.tokens.length)];
    ex.push(
      exercice({
        id: `m1-detective-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'detective',
        difficulte: 3,
        type: 'clic-mots',
        consigne: 'Mène l’enquête : clique sur TOUS les noms de ce petit texte.',
        question: {
          phrase: `${a.texte} ${b.texte}`,
          tokens,
          source: `${a.id}+${b.id}`,
          enquete: true,
        },
        reponse: { indices, bravo: 'Enquête réussie, détective Thao !' },
        indice: 'Il y a des noms dans les deux phrases. Relis-les une par une, lentement.',
        explication: `Il y avait ${indices.length} noms à trouver : ${enumerer(indices.map((j) => tokens[j].w))}.`,
      }),
    );
  }

  /* ---- F. Singulier ou pluriel ? ----------------------------------- */
  const pourNombre = piocher(NOMS_COMMUNS.filter((n) => n.pluriel !== n.mot), 8, 'm1-nombre');
  pourNombre.forEach((n, i) => {
    const pluriel = i % 2 === 1;
    const groupe = pluriel
      ? `${n.genre === 'f' ? 'des' : 'des'} ${n.pluriel}`
      : `${n.genre === 'f' ? 'une' : 'un'} ${n.mot}`;
    ex.push(
      exercice({
        id: `m1-nombre-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'singulier-pluriel',
        difficulte: 1,
        type: 'choix',
        consigne: `Ce groupe de mots est-il au singulier ou au pluriel ?`,
        question: { groupe, options: ['Au singulier', 'Au pluriel'] },
        reponse: {
          index: pluriel ? 1 : 0,
          bravo: 'Exact ! Tu entends bien le nombre.',
          rate: 'Regarde la fin du nom et le déterminant qui l’annonce.',
        },
        indice: 'Au pluriel, il y a plusieurs choses : le déterminant devient les, des, ces… et le nom prend souvent un -s ou un -x.',
        explication: pluriel
          ? `« ${groupe} » est au PLURIEL : il y a plusieurs ${n.pluriel}.`
          : `« ${groupe} » est au SINGULIER : il n’y a qu’${n.genre === 'f' ? 'une' : 'un'} ${n.mot}.`,
      }),
    );
  });

  /* ---- G. Combien de noms ? ---------------------------------------- */
  melanger(PHRASES.filter((p) => p.noms.length >= 2 && p.noms.length <= 4), 'm1-combien')
    .slice(0, 5)
    .forEach((p, i) => {
      const n = p.noms.length;
      const options = ['1 nom', '2 noms', '3 noms', '4 noms'];
      ex.push(
        exercice({
          id: `m1-combien-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'combien-noms',
          difficulte: 2,
          type: 'choix',
          consigne: 'Compte les noms, puis choisis la bonne réponse.',
          question: { phrase: p.texte, options, source: p.id },
          reponse: {
            index: n - 1,
            bravo: 'Compté juste !',
            rate: 'Recompte en montrant chaque nom avec ton doigt.',
          },
          indice: 'Attention : les adjectifs (petit, joli, rouge…) ne sont pas des noms.',
          explication: `Il y a ${n} noms : ${enumerer(p.noms.map((j) => p.tokens[j].w))}.`,
        }),
      );
    });

  return ex;
}
