/**
 * MODULE 2 — Nom propre et nom commun.
 */

import { PHRASES } from '../corpus/phrases.js';
import { NOMS_COMMUNS, NOMS_PROPRES } from '../corpus/noms.js';
import { exercice, enumerer, melanger, piocher, tokensAffichage } from './outils.js';

const M = 'm2';
const C = 'm2';

/** Listes acceptées pour les réponses libres « écris un nom commun qui… ». */
const LISTES_COMMUNS = {
  animaux: [
    'chat', 'chien', 'cheval', 'vache', 'mouton', 'chèvre', 'cochon', 'poule',
    'coq', 'canard', 'oie', 'lapin', 'souris', 'rat', 'hamster', 'écureuil',
    'renard', 'loup', 'ours', 'cerf', 'biche', 'sanglier', 'hérisson', 'taupe',
    'lion', 'tigre', 'girafe', 'éléphant', 'zèbre', 'singe', 'hippopotame',
    'crocodile', 'serpent', 'tortue', 'grenouille', 'poisson', 'requin',
    'dauphin', 'baleine', 'oiseau', 'moineau', 'hibou', 'chouette', 'aigle',
    'pie', 'merle', 'pigeon', 'abeille', 'fourmi', 'araignée', 'papillon',
    'escargot', 'libellule', 'coccinelle', 'poney', 'âne', 'chaton', 'chiot',
  ],
  classe: [
    'crayon', 'stylo', 'gomme', 'règle', 'trousse', 'cahier', 'livre', 'cartable',
    'feutre', 'ciseaux', 'colle', 'ardoise', 'tableau', 'bureau', 'chaise',
    'table', 'carte', 'dictionnaire', 'classeur', 'feuille', 'compas', 'équerre',
    'taille-crayon', 'agenda', 'calculatrice', 'craie', 'éponge', 'casier',
  ],
  aliments: [
    'pain', 'fromage', 'pomme', 'poire', 'banane', 'orange', 'fraise', 'cerise',
    'raisin', 'carotte', 'salade', 'tomate', 'pomme de terre', 'riz', 'pâtes',
    'soupe', 'gâteau', 'bonbon', 'chocolat', 'yaourt', 'lait', 'eau', 'jus',
    'poulet', 'poisson', 'œuf', 'beurre', 'confiture', 'miel', 'biscuit',
    'crêpe', 'pizza', 'glace', 'noisette', 'prune', 'abricot', 'melon',
  ],
};

const MOTS_COMMUNS_CONNUS = [
  ...new Set([
    ...NOMS_COMMUNS.map((n) => n.mot),
    ...Object.values(LISTES_COMMUNS).flat(),
  ]),
];

export function construireM2() {
  const ex = [];

  /* ---- A. Nom propre ou nom commun ? ------------------------------- */
  const melange = melanger(
    [
      ...piocher(NOMS_PROPRES, 8, 'm2-pr').map((n) => ({ mot: n.mot, propre: true, info: n.type })),
      ...piocher(NOMS_COMMUNS, 8, 'm2-co').map((n) => ({ mot: n.mot, propre: false, info: 'nom commun' })),
    ],
    'm2-classe',
  );
  melange.forEach((item, i) => {
    ex.push(
      exercice({
        id: `m2-classe-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'classe-nom',
        difficulte: 1,
        type: 'choix',
        consigne: 'Ce nom est-il un nom propre ou un nom commun ?',
        question: { mot: item.mot, options: ['Un nom propre', 'Un nom commun'] },
        reponse: {
          index: item.propre ? 0 : 1,
          bravo: 'Exact !',
          rate: 'Regarde la première lettre, puis demande-toi si ce mot désigne UNE SEULE chose ou toutes les choses pareilles.',
        },
        indice: 'Un nom propre commence par une majuscule et désigne une seule personne, un seul lieu, un seul animal.',
        explication: item.propre
          ? `« ${item.mot} » est un NOM PROPRE (c’est ${item.info === 'prénom' ? 'un prénom' : `un nom de ${item.info}`}). Il garde toujours sa majuscule.`
          : `« ${item.mot} » est un NOM COMMUN : il désigne tous les ${item.mot}s de la même sorte, pas un seul en particulier.`,
      }),
    );
  });

  /* ---- B. Le tri des deux colonnes --------------------------------- */
  for (let i = 0; i < 10; i++) {
    const propres = piocher(NOMS_PROPRES.map((n) => n.mot), 3, `m2-tri-p-${i}`);
    const communs = piocher(NOMS_COMMUNS.map((n) => n.mot), 3, `m2-tri-c-${i}`);
    const placement = {};
    propres.forEach((m) => { placement[m] = 'propres'; });
    communs.forEach((m) => { placement[m] = 'communs'; });
    ex.push(
      exercice({
        id: `m2-tri-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'tri-propre-commun',
        difficulte: i < 5 ? 1 : 2,
        type: 'colonnes',
        consigne: 'Range chaque nom dans la bonne colonne.',
        question: {
          mots: melanger([...propres, ...communs], `m2-tri-mix-${i}`),
          colonnes: [
            { id: 'propres', titre: 'Noms propres', aide: 'une seule personne, un seul lieu' },
            { id: 'communs', titre: 'Noms communs', aide: 'toutes les choses de la même sorte' },
          ],
        },
        reponse: { placement, bravo: 'Parfait, les deux colonnes sont justes !' },
        indice: 'La majuscule est un indice très utile… mais réfléchis aussi au sens du mot.',
        explication: `Noms propres : ${enumerer(propres)}. Noms communs : ${enumerer(communs)}.`,
      }),
    );
  }

  /* ---- C. Repérer dans une phrase ---------------------------------- */
  const avecPropres = melanger(PHRASES.filter((p) => p.propres.length >= 1), 'm2-phrases');
  avecPropres.slice(0, 8).forEach((p, i) => {
    ex.push(
      exercice({
        id: `m2-propres-phrase-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'propres-dans-phrase',
        difficulte: p.propres.length > 1 ? 3 : i < 4 ? 1 : 2,
        type: 'clic-mots',
        consigne: 'Clique sur tous les noms propres de cette phrase.',
        question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
        reponse: {
          indices: p.propres,
          bravo: 'Bien vu Thao ! Les noms propres n’ont aucun secret pour toi.',
        },
        indice: 'Cherche les majuscules à l’intérieur de la phrase (pas celle du tout premier mot !).',
        explication: `Nom${p.propres.length > 1 ? 's' : ''} propre${p.propres.length > 1 ? 's' : ''} : ${enumerer(p.propres.map((j) => p.tokens[j].w))}.`,
      }),
    );
  });

  avecPropres
    .filter((p) => p.communs.length >= 1)
    .slice(0, 6)
    .forEach((p, i) => {
      ex.push(
        exercice({
          id: `m2-communs-phrase-${String(i + 1).padStart(2, '0')}`,
          module: M,
          competence: C,
          format: 'communs-dans-phrase',
          difficulte: 2,
          type: 'clic-mots',
          consigne: 'Clique seulement sur les noms COMMUNS de cette phrase.',
          question: { phrase: p.texte, tokens: tokensAffichage(p), source: p.id },
          reponse: {
            indices: p.communs,
            bravo: 'Très bien ! Tu as laissé les noms propres de côté.',
          },
          indice: 'Les noms propres ont une majuscule : ne clique pas dessus cette fois-ci.',
          explication: `Noms communs : ${enumerer(p.communs.map((j) => p.tokens[j].w))}. Ils ne prennent pas de majuscule.`,
        }),
      );
    });

  /* ---- D. Écris un nom propre / un nom commun ---------------------- */
  const consignesPropres = [
    { id: 1, texte: 'Écris le prénom d’une personne de ta famille ou d’un ami. C’est un nom propre !', aide: 'prénom' },
    { id: 2, texte: 'Écris le nom d’une ville que tu connais.', aide: 'ville' },
    { id: 3, texte: 'Écris le nom d’un pays.', aide: 'pays' },
  ];
  consignesPropres.forEach((c, i) => {
    ex.push(
      exercice({
        id: `m2-ecris-propre-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'ecris-propre',
        difficulte: 2,
        type: 'phrase',
        consigne: c.texte,
        question: { court: true, exemple: 'Un seul mot, avec une MAJUSCULE au début.' },
        reponse: {
          regles: [
            { type: 'motUnique', message: 'Écris un seul mot, s’il te plaît.' },
            { type: 'lettresSeules', message: 'Utilise seulement des lettres (pas de chiffre, pas de symbole).' },
            { type: 'minLettres', n: 2, message: 'C’est un peu court : écris le nom en entier.' },
            { type: 'majuscule', message: 'Un nom propre commence TOUJOURS par une majuscule.' },
            { type: 'pasDansListe', mots: MOTS_COMMUNS_CONNUS, message: 'Ce mot est un nom commun. Un nom propre désigne une seule personne ou un seul lieu.' },
          ],
          bravo: 'Super ! Majuscule bien placée : c’est un vrai nom propre.',
          solution: { prénom: 'Camille', ville: 'Lyon', pays: 'Italie' }[c.aide],
        },
        indice: 'Un nom propre désigne UNE SEULE personne ou UN SEUL lieu, et il commence par une majuscule.',
        explication: 'Les noms propres gardent leur majuscule partout dans la phrase : Thao, Lyon, la Loire, Mars…',
      }),
    );
  });

  [
    { cle: 'animaux', texte: 'Écris un nom commun qui désigne un animal.' },
    { cle: 'classe', texte: 'Écris un nom commun qui désigne un objet de la classe.' },
    { cle: 'aliments', texte: 'Écris un nom commun qui désigne quelque chose qui se mange.' },
  ].forEach((c, i) => {
    ex.push(
      exercice({
        id: `m2-ecris-commun-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'ecris-commun',
        difficulte: 2,
        type: 'phrase',
        consigne: c.texte,
        question: { court: true, exemple: 'Un seul mot, sans majuscule.' },
        reponse: {
          regles: [
            { type: 'motUnique', message: 'Un seul mot suffit.' },
            { type: 'unDe', mots: LISTES_COMMUNS[c.cle], message: `Hmm, ce mot ne va pas ici. Pense à ${c.cle === 'animaux' ? 'un animal que tu connais' : c.cle === 'classe' ? 'ce qu’il y a dans ta trousse' : 'ce que tu manges au goûter'}.` },
            { type: 'pasDansListe', mots: NOMS_PROPRES.map((n) => n.mot), message: 'Attention, c’est un nom propre. Ici, on cherche un nom commun.' },
          ],
          bravo: 'Oui ! C’est bien un nom commun.',
          solution: LISTES_COMMUNS[c.cle][0],
        },
        indice: 'Un nom commun ne prend pas de majuscule et désigne toutes les choses de la même sorte.',
        explication: 'Un nom commun peut être précédé d’un déterminant : un chat, le crayon, des pommes.',
      }),
    );
  });

  /* ---- E. Vrai ou faux ? (corriger un classement) ------------------ */
  const pourVF = melanger(PHRASES.filter((p) => p.propres.length && p.communs.length), 'm2-vf');
  for (let i = 0; i < 8; i++) {
    const p = pourVF[i % pourVF.length];
    const vrai = i % 2 === 0;
    const motPropre = p.tokens[p.propres[0]].w;
    const motCommun = p.tokens[p.communs[0]].w;
    const mot = vrai ? motPropre : motCommun;
    ex.push(
      exercice({
        id: `m2-vf-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'corrige-classement',
        difficulte: i < 4 ? 2 : 3,
        type: 'vrai-faux',
        consigne: 'Lis la phrase, puis dis si l’affirmation est vraie ou fausse.',
        question: {
          phrase: p.texte,
          affirmation: `Dans cette phrase, « ${mot} » est un nom propre.`,
          source: p.id,
        },
        reponse: {
          valeur: vrai,
          bravo: vrai ? 'Oui, bien vu !' : 'Bien joué, tu ne t’es pas laissé piéger !',
          rate: vrai
            ? `Si, « ${mot} » est un nom propre : il désigne une seule personne ou un seul lieu, et il garde sa majuscule.`
            : `Non : « ${mot} » est un nom commun. Le nom propre de cette phrase, c’est « ${motPropre} ».`,
        },
        indice: 'Un nom propre désigne quelqu’un ou quelque part en particulier, et il a une majuscule.',
        explication: `Dans « ${p.texte} », le nom propre est « ${motPropre} » et « ${motCommun} » est un nom commun.`,
      }),
    );
  }

  /* ---- F. Pourquoi cette majuscule ? ------------------------------- */
  const pourMaj = melanger(PHRASES.filter((p) => p.propres.length && !p.propres.includes(0)), 'm2-maj').slice(0, 5);
  pourMaj.forEach((p, i) => {
    const mot = p.tokens[p.propres[0]].w;
    ex.push(
      exercice({
        id: `m2-majuscule-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'pourquoi-majuscule',
        difficulte: i < 3 ? 1 : 2,
        type: 'choix',
        consigne: `Pourquoi « ${mot} » prend-il une majuscule au milieu de la phrase ?`,
        question: {
          phrase: p.texte,
          options: [
            'Parce que c’est un nom propre.',
            'Parce que c’est le premier mot de la phrase.',
            'Parce que c’est un nom commun important.',
          ],
          source: p.id,
        },
        reponse: {
          index: 0,
          bravo: 'Exactement ! La majuscule est la marque du nom propre.',
          rate: `« ${mot} » n’est pas au début de la phrase, et pourtant il a une majuscule : c’est donc un nom propre.`,
        },
        indice: 'Le premier mot de la phrase a déjà sa majuscule. Ce mot-là en a une pour une autre raison.',
        explication: `« ${mot} » désigne une seule personne ou un seul lieu : c’est un nom propre, il garde sa majuscule partout.`,
      }),
    );
  });

  return ex;
}
