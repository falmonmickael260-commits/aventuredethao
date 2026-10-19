/**
 * MODULE 6 — L'imparfait de l'indicatif.
 *
 * Aucune forme verbale n'est écrite à la main dans ce fichier : toutes passent
 * par `imparfait()` / `presentNous()` / `presentVous()`, dont chaque sortie est
 * comparée à une table vérifiée dans tests/conjugaison.test.js.
 */

import {
  imparfait,
  imparfaitAvecSujet,
  PERSONNES,
  presentNous,
  presentVous,
} from '../../src/core/conjugaison.js';
import { exercice, melanger } from './outils.js';

const M = 'm6';
const C = 'm6';

const VOYELLE = /^[aeiouyàâäéèêëîïôöûü]/i;

/** Affichage du pronom devant un trou : « je » ou « j’ » selon le verbe. */
function amorcePronom(pronomAffiche, infinitif, personne) {
  const forme = imparfait(infinitif, personne);
  if (personne === 'je' && VOYELLE.test(forme)) return 'j’';
  return `${pronomAffiche} `;
}

/** Réponses acceptées pour un trou de conjugaison. */
function attendusPour(infinitif, personne, pronomAffiche) {
  const forme = imparfait(infinitif, personne);
  const avec = imparfaitAvecSujet(infinitif, personne);
  const liste = new Set([forme, avec]);
  if (personne === 'il' || personne === 'ils') {
    // « elle chantait », « elles chantaient » sont aussi justes.
    liste.add(`${pronomAffiche} ${forme}`);
  }
  return [...liste];
}

/* --- 20 contextes de phrases, chacun avec sa personne et son verbe --- */
const CONTEXTES = [
  { avant: 'Quand j’étais petit,', pronom: 'je', personne: 'je', inf: 'jouer', apres: 'dans le jardin.' },
  { avant: 'Chaque matin,', pronom: 'tu', personne: 'tu', inf: 'chanter', apres: 'sous la douche.' },
  { avant: 'Avant, mon frère', pronom: 'il', personne: 'il', inf: 'manger', apres: 'beaucoup trop vite.', sansPronom: true },
  { avant: 'L’été dernier,', pronom: 'nous', personne: 'nous', inf: 'aller', apres: 'à la mer tous les jours.' },
  { avant: 'Sur la photo,', pronom: 'vous', personne: 'vous', inf: 'être', apres: 'tout petits.' },
  { avant: 'À cette époque, les enfants', pronom: 'ils', personne: 'ils', inf: 'avoir', apres: 'de grands cahiers.', sansPronom: true },
  { avant: 'Quand', pronom: 'je', personne: 'je', inf: 'être', apres: 'en CP, je ne savais pas lire.' },
  { avant: 'L’année dernière,', pronom: 'tu', personne: 'tu', inf: 'avoir', apres: 'une maîtresse très drôle.' },
  { avant: 'Le dimanche, ma grand-mère', pronom: 'elle', personne: 'il', inf: 'faire', apres: 'des crêpes.', sansPronom: true },
  { avant: 'Autrefois,', pronom: 'nous', personne: 'nous', inf: 'dire', apres: '« bonjour » à tout le monde.' },
  { avant: 'Avant,', pronom: 'vous', personne: 'vous', inf: 'prendre', apres: 'le bus pour aller à l’école.' },
  { avant: 'Chaque été, mes cousins', pronom: 'ils', personne: 'ils', inf: 'venir', apres: 'nous voir.', sansPronom: true },
  { avant: 'De ma fenêtre,', pronom: 'je', personne: 'je', inf: 'voir', apres: 'la montagne.' },
  { avant: 'Quand il était bébé,', pronom: 'il', personne: 'il', inf: 'dormir', apres: 'toute la journée.' },
  { avant: 'L’an dernier,', pronom: 'nous', personne: 'nous', inf: 'finir', apres: 'l’école à 16 h 30.' },
  { avant: 'Le soir,', pronom: 'tu', personne: 'tu', inf: 'lire', apres: 'une histoire à ton petit frère.' },
  { avant: 'Pendant la fête, les danseuses', pronom: 'elles', personne: 'ils', inf: 'danser', apres: 'sans s’arrêter.', sansPronom: true },
  { avant: 'À la piscine,', pronom: 'je', personne: 'je', inf: 'nager', apres: 'comme un petit poisson.' },
  { avant: 'Chaque soir,', pronom: 'nous', personne: 'nous', inf: 'ranger', apres: 'nos jouets.' },
  { avant: 'En CE1,', pronom: 'vous', personne: 'vous', inf: 'écrire', apres: 'avec un crayon de papier.' },
];

/* --- 12 verbes dont on fait conjuguer le tableau complet --- */
const VERBES_TABLEAU = ['être', 'avoir', 'aller', 'faire', 'dire', 'prendre', 'venir', 'voir', 'jouer', 'chanter', 'manger', 'finir'];

/* --- 10 transformations présent -> imparfait --- */
const TRANSFOS = [
  { personne: 'nous', inf: 'jouer', suite: 'dehors' },
  { personne: 'vous', inf: 'chanter', suite: 'dans la chorale' },
  { personne: 'nous', inf: 'manger', suite: 'à la cantine' },
  { personne: 'vous', inf: 'aller', suite: 'à la piscine le mardi' },
  { personne: 'nous', inf: 'être', suite: 'dans la même classe' },
  { personne: 'vous', inf: 'avoir', suite: 'un petit chien' },
  { personne: 'nous', inf: 'faire', suite: 'du vélo le dimanche' },
  { personne: 'vous', inf: 'prendre', suite: 'le train pour aller à Lyon' },
  { personne: 'nous', inf: 'voir', suite: 'les étoiles depuis le jardin' },
  { personne: 'vous', inf: 'dire', suite: 'des poèmes par cœur' },
];

/* --- 10 phrases à corriger : la forme fausse est indiquée --- */
const A_CORRIGER = [
  { phrase: 'Vous était contents de partir.', faux: 'était', personne: 'vous', inf: 'être' },
  { phrase: 'Avant, nous jouons dehors tous les soirs.', faux: 'jouons', personne: 'nous', inf: 'jouer' },
  { phrase: 'Ils mangeait des bonbons en cachette.', faux: 'mangeait', personne: 'ils', inf: 'manger' },
  { phrase: 'Tu avait un vélo rouge.', faux: 'avait', personne: 'tu', inf: 'avoir' },
  { phrase: 'Nous allion à la piscine le mardi.', faux: 'allion', personne: 'nous', inf: 'aller' },
  { phrase: 'Vous faisez beaucoup de bruit.', faux: 'faisez', personne: 'vous', inf: 'faire' },
  { phrase: 'Elle prenais le bus chaque matin.', faux: 'prenais', personne: 'il', inf: 'prendre' },
  { phrase: 'Avant, nous voyons la mer de la fenêtre.', faux: 'voyons', personne: 'nous', inf: 'voir' },
  { phrase: 'Ils venaits nous voir le dimanche.', faux: 'venaits', personne: 'ils', inf: 'venir' },
  { phrase: 'Je finissait toujours mon assiette.', faux: 'finissait', personne: 'je', inf: 'finir' },
];

/* --- 8 petits textes à trous --- */
const TEXTES = [
  {
    titre: 'Les vacances chez mamie',
    parts: ['Chaque été, nous ', ' chez notre grand-mère. Le matin, je ', ' avec mon cousin, et le soir elle nous ', ' une histoire.'],
    trous: [
      { personne: 'nous', inf: 'aller', pronom: 'nous' },
      { personne: 'je', inf: 'jouer', pronom: 'je' },
      { personne: 'il', inf: 'lire', pronom: 'elle' },
    ],
  },
  {
    titre: 'Quand j’étais en CP',
    parts: ['Quand j’', ' en CP, je ne ', ' pas encore lire. La maîtresse ', ' très patiente.'],
    trous: [
      { personne: 'je', inf: 'être', pronom: 'je' },
      { personne: 'je', inf: 'savoir', pronom: 'je' },
      { personne: 'il', inf: 'être', pronom: 'elle' },
    ],
  },
  {
    titre: 'Le vieux village',
    parts: ['Autrefois, les villageois ', ' de l’eau au puits. Ils ', ' leur pain eux-mêmes et ', ' tous les voisins le dimanche.'],
    trous: [
      { personne: 'ils', inf: 'prendre', pronom: 'ils' },
      { personne: 'ils', inf: 'faire', pronom: 'ils' },
      { personne: 'ils', inf: 'inviter', pronom: 'ils' },
    ],
  },
  {
    titre: 'Mon chat Caramel',
    parts: ['Mon chat ', ' sur le canapé toute la journée. Quand je rentrais, il ', ' les yeux et ', ' tout doucement.'],
    trous: [
      { personne: 'il', inf: 'dormir', pronom: 'il' },
      { personne: 'il', inf: 'ouvrir', pronom: 'il' },
      { personne: 'il', inf: 'miauler', pronom: 'il' },
    ],
  },
  {
    titre: 'La récréation d’avant',
    parts: ['Dans la cour, nous ', ' à l’élastique. Tu ', ' toujours le premier et vous ', ' beaucoup de bruit.'],
    trous: [
      { personne: 'nous', inf: 'jouer', pronom: 'nous' },
      { personne: 'tu', inf: 'arriver', pronom: 'tu' },
      { personne: 'vous', inf: 'faire', pronom: 'vous' },
    ],
  },
  {
    titre: 'Le marché du samedi',
    parts: ['Chaque samedi, mes parents ', ' au marché. Ils ', ' des fruits et moi, je ', ' le panier.'],
    trous: [
      { personne: 'ils', inf: 'aller', pronom: 'ils' },
      { personne: 'ils', inf: 'choisir', pronom: 'ils' },
      { personne: 'je', inf: 'porter', pronom: 'je' },
    ],
  },
  {
    titre: 'Avant la tempête',
    parts: ['Le ciel ', ' tout gris. Les oiseaux ne ', ' plus et le vent ', ' les branches du vieux chêne.'],
    trous: [
      { personne: 'il', inf: 'être', pronom: 'il' },
      { personne: 'ils', inf: 'chanter', pronom: 'ils' },
      { personne: 'il', inf: 'agiter', pronom: 'il' },
    ],
  },
  {
    titre: 'La bibliothèque de l’école',
    parts: ['Le jeudi, nous ', ' à la bibliothèque. Vous ', ' un livre chacun et la maîtresse ', ' les titres.'],
    trous: [
      { personne: 'nous', inf: 'descendre', pronom: 'nous' },
      { personne: 'vous', inf: 'prendre', pronom: 'vous' },
      { personne: 'il', inf: 'noter', pronom: 'elle' },
    ],
  },
];

export function construireM6() {
  const ex = [];

  /* ---- A. Complète avec le verbe à l'imparfait --------------------- */
  CONTEXTES.forEach((c, i) => {
    const amorce = c.sansPronom ? `${c.avant} ` : `${c.avant} ${amorcePronom(c.pronom, c.inf, c.personne)}`;
    const forme = imparfait(c.inf, c.personne);
    ex.push(
      exercice({
        id: `m6-complete-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'complete-imparfait',
        difficulte: ['être', 'avoir', 'aller', 'faire', 'dire', 'prendre', 'venir', 'voir'].includes(c.inf) ? 3 : 1,
        type: 'texte',
        consigne: `Complète la phrase avec le verbe « ${c.inf} » à l’imparfait.`,
        question: {
          avant: amorce,
          apres: ` ${c.apres}`,
          verbe: c.inf,
          court: true,
          enLigne: true,
        },
        reponse: {
          attendus: attendusPour(c.inf, c.personne, c.pronom),
          bravo: `Excellent travail, Thao ! Tu maîtrises de mieux en mieux l’imparfait.`,
          rate: `Ce n’est pas encore la bonne terminaison. À l’imparfait, « ${c.pronom} » prend « -${forme.slice(forme.length - (c.personne === 'ils' ? 5 : c.personne === 'nous' ? 4 : c.personne === 'vous' ? 3 : 3))} ».`,
        },
        indice: `Terminaisons de l’imparfait : je -ais, tu -ais, il -ait, nous -ions, vous -iez, ils -aient. Ici, c’est « ${c.pronom} ».`,
        explication: `${c.avant} ${imparfaitAvecSujet(c.inf, c.personne)} ${c.apres}`.replace('  ', ' '),
      }),
    );
  });

  /* ---- A bis. Choisis la bonne forme (entrée en douceur) ----------- */
  const FORMES_FACILES = [
    { personne: 'je', pronom: 'je', inf: 'jouer' },
    { personne: 'tu', pronom: 'tu', inf: 'chanter' },
    { personne: 'il', pronom: 'il', inf: 'regarder' },
    { personne: 'nous', pronom: 'nous', inf: 'manger' },
    { personne: 'vous', pronom: 'vous', inf: 'danser' },
    { personne: 'ils', pronom: 'ils', inf: 'marcher' },
    { personne: 'je', pronom: 'je', inf: 'être' },
    { personne: 'tu', pronom: 'tu', inf: 'avoir' },
    { personne: 'nous', pronom: 'nous', inf: 'aller' },
    { personne: 'vous', pronom: 'vous', inf: 'faire' },
  ];
  FORMES_FACILES.forEach((c, i) => {
    const bonne = imparfait(c.inf, c.personne);
    const autres = PERSONNES.map((x) => imparfait(c.inf, x.id)).filter((f) => f !== bonne);
    const present = c.personne === 'nous' ? presentNous(c.inf) : c.personne === 'vous' ? presentVous(c.inf) : null;
    const distracteurs = [...new Set([autres[0], autres[autres.length - 1], present].filter((f) => f && f !== bonne))].slice(0, 2);
    const options = melanger([bonne, ...distracteurs], `m6-cf-${i}`);
    ex.push(
      exercice({
        id: `m6-choisis-forme-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'choisis-forme',
        difficulte: 1,
        type: 'choix',
        consigne: `Avec « ${c.pronom} », quelle est la bonne forme du verbe « ${c.inf} » à l’imparfait ?`,
        question: { trou: `${amorcePronom(c.pronom, c.inf, c.personne)}_____`, options, verbe: c.inf },
        reponse: {
          index: options.indexOf(bonne),
          bravo: 'Oui ! C’est la terminaison qui va avec ce sujet.',
          rate: `Avec « ${c.pronom} », la terminaison de l’imparfait n’est pas celle-là.`,
        },
        indice: 'je -ais · tu -ais · il -ait · nous -ions · vous -iez · ils -aient',
        explication: `On écrit « ${imparfaitAvecSujet(c.inf, c.personne)} ».`,
      }),
    );
  });

  /* ---- B. Le tableau de conjugaison -------------------------------- */
  VERBES_TABLEAU.forEach((inf, i) => {
    const champs = PERSONNES.map((p) => ({
      cle: p.id,
      etiquette: p.id === 'je' && VOYELLE.test(imparfait(inf, 'je')) ? 'j’' : p.libelle,
      attendus: attendusPour(inf, p.id, p.sujet),
    }));
    ex.push(
      exercice({
        id: `m6-tableau-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'tableau',
        difficulte: ['jouer', 'chanter', 'manger'].includes(inf) ? 1 : i < 4 ? 3 : 2,
        type: 'textes',
        consigne: `Conjugue le verbe « ${inf} » à l’imparfait.`,
        question: {
          verbe: inf,
          tableau: true,
          champs: champs.map((c) => ({ cle: c.cle, etiquette: c.etiquette })),
        },
        reponse: {
          champs,
          bravo: `Tout le tableau de « ${inf} » est juste. Champion !`,
        },
        indice: 'Les six terminaisons, toujours les mêmes : -ais, -ais, -ait, -ions, -iez, -aient.',
        explication: PERSONNES.map((p) => imparfaitAvecSujet(inf, p.id)).join(' · '),
      }),
    );
  });

  /* ---- C. Transforme le présent en imparfait ----------------------- */
  TRANSFOS.forEach((t, i) => {
    const present = t.personne === 'nous' ? presentNous(t.inf) : presentVous(t.inf);
    const passe = imparfait(t.inf, t.personne);
    const depart = `Aujourd’hui, ${t.personne} ${present} ${t.suite}.`;
    const arrivee = `Avant, ${t.personne} ${passe} ${t.suite}.`;
    ex.push(
      exercice({
        id: `m6-transforme-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'transforme',
        difficulte: i < 2 ? 2 : 3,
        type: 'phrase',
        consigne: 'Récris cette phrase pour raconter une habitude du passé. Commence par « Avant, ».',
        question: { depart, exemple: 'Aujourd’hui, nous jouons dehors. → Avant, nous jouions dehors.' },
        reponse: {
          regles: [
            { type: 'contient', mots: ['avant'], message: 'Commence ta phrase par « Avant, ».' },
            { type: 'contient', mots: [t.personne], message: `Garde le même sujet : « ${t.personne} ».` },
            { type: 'contient', mots: [passe], message: `Il manque le verbe à l’imparfait : « ${passe} ».` },
            { type: 'interdit', mots: [present], message: `« ${present} », c’est le présent. On raconte le passé : « ${passe} ».` },
            { type: 'majuscule', message: 'Une phrase commence par une majuscule.' },
            { type: 'point', message: 'N’oublie pas le point à la fin.' },
          ],
          bravo: 'Parfait ! Tu racontes maintenant une habitude du passé.',
          solution: arrivee,
        },
        indice: `Le sujet ne change pas. Seul le verbe change : « ${present} » devient « ${passe} ».`,
        explication: `${depart} → ${arrivee}`,
      }),
    );
  });

  /* ---- D. Corrige la phrase ---------------------------------------- */
  A_CORRIGER.forEach((c, i) => {
    const juste = imparfait(c.inf, c.personne);
    if (!c.phrase.toLowerCase().includes(c.faux.toLowerCase())) {
      throw new Error(`m6 : « ${c.faux} » absent de « ${c.phrase} »`);
    }
    const phraseJuste = c.phrase.replace(new RegExp(c.faux, 'i'), juste);
    ex.push(
      exercice({
        id: `m6-corrige-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'corrige-imparfait',
        difficulte: i < 2 ? 2 : 3,
        type: 'phrase',
        consigne: 'Cette phrase contient une erreur de conjugaison. Récris-la correctement.',
        question: { faux: c.phrase, exemple: 'Attention au sujet : qui fait l’action ?' },
        reponse: {
          regles: [
            { type: 'contient', mots: [juste], message: `Le verbe doit s’écrire « ${juste} » avec ce sujet.` },
            { type: 'interdit', mots: [c.faux], message: `« ${c.faux} » n’est pas la bonne forme. Regarde bien le sujet.` },
            { type: 'minMots', n: 4, message: 'Récris la phrase en entier.' },
          ],
          bravo: 'Erreur réparée ! Bravo Thao.',
          solution: phraseJuste,
        },
        indice: `Le sujet est « ${c.personne === 'il' ? 'il / elle' : c.personne} ». Quelle terminaison lui faut-il à l’imparfait ?`,
        explication: `Phrase correcte : « ${phraseJuste} »`,
      }),
    );
  });

  /* ---- E. Le texte à trous ----------------------------------------- */
  TEXTES.forEach((t, i) => {
    const champs = t.trous.map((trou, k) => ({
      cle: `t${k}`,
      etiquette: `${trou.pronom} + ${trou.inf}`,
      attendus: attendusPour(trou.inf, trou.personne, trou.pronom),
    }));
    ex.push(
      exercice({
        id: `m6-texte-trous-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'texte-a-trous',
        difficulte: i < 2 ? 2 : 3,
        type: 'textes',
        consigne: 'Complète ce texte : tous les verbes sont à l’imparfait.',
        question: {
          titre: t.titre,
          parts: t.parts,
          enLigneTexte: true,
          champs: champs.map((c, k) => ({ cle: c.cle, etiquette: c.etiquette, verbe: t.trous[k].inf })),
        },
        reponse: {
          champs,
          bravo: 'Tout le texte est à l’imparfait. Magnifique !',
        },
        indice: 'Repère bien le sujet de chaque verbe avant de choisir la terminaison.',
        explication: t.parts
          .map((part, k) => part + (t.trous[k] ? imparfait(t.trous[k].inf, t.trous[k].personne) : ''))
          .join(''),
      }),
    );
  });

  return ex;
}
