/**
 * MODULE 3 — Accorder le nom et le déterminant.
 *
 * Toutes les formes du pluriel sont lues dans le corpus (« un cheval → des
 * chevaux »), et toutes les formes d'adjectifs viennent d'une table à quatre
 * entrées : aucune forme n'est fabriquée en ajoutant un -s à l'aveugle.
 */

import { NOMS_NON_ELIDES, SERIES_DET } from '../corpus/noms.js';
import { ADJECTIFS } from '../corpus/adjectifs.js';
import { exercice, melanger, piocher } from './outils.js';

const M = 'm3';
const C = 'm3';

const MAJ = (s) => s[0].toUpperCase() + s.slice(1);

/**
 * Adjectifs dont la forme CHANGE entre singulier et pluriel pour ce genre.
 * Indispensable : avec « gros » ou « vieux » au masculin, la marque du pluriel
 * ne se voit pas, et un exercice « trouve le mot mal accordé » n'aurait alors
 * aucune réponse visible.
 */
function adjQuiVarie(nom) {
  return ADJECTIFS.filter(
    (a) => a[`${nom.genre}s`] !== a[`${nom.genre}p`] && (!a.anime || nom.anime),
  );
}

/** Un adjectif qui va avec ce nom (un chou n'est pas « gentil »). */
function adjPour(nom, i) {
  const ok = ADJECTIFS.filter((a) => !a.anime || nom.anime);
  return ok[i % ok.length];
}

/** Construit un groupe nominal correct : déterminant + adjectif + nom. */
function groupe(det, adj, nom, gn) {
  const pluriel = gn.endsWith('p');
  const motNom = pluriel ? nom.pluriel : nom.mot;
  const motAdj = adj[gn];
  return adj.place === 'avant'
    ? `${det} ${motAdj} ${motNom}`
    : `${det} ${motNom} ${motAdj}`;
}

export function construireM3() {
  const ex = [];
  const noms = NOMS_NON_ELIDES;

  /* ---- A. Quel déterminant va avec ce nom ? ------------------------ */
  const pourChoix = piocher(noms, 14, 'm3-choix');
  pourChoix.forEach((n, i) => {
    const serie = SERIES_DET[i % SERIES_DET.length];
    const pluriel = i % 3 === 2 && n.pluriel !== n.mot;
    const gn = `${n.genre}${pluriel ? 'p' : 's'}`;
    const mot = pluriel ? n.pluriel : n.mot;
    const options = [...new Set([serie.ms, serie.fs, serie.mp])];
    const bon = serie[gn];
    ex.push(
      exercice({
        id: `m3-choisis-det-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'choisis-det',
        difficulte: pluriel ? 2 : 1,
        type: 'choix',
        consigne: `Choisis le déterminant qui va avec « ${mot} ».`,
        question: { trou: `_____ ${mot}`, options, serie: serie.libelle },
        reponse: {
          index: options.indexOf(bon),
          bravo: 'Bien accordé !',
          rate: `« ${mot} » est ${n.genre === 'f' ? 'féminin' : 'masculin'} ${pluriel ? 'pluriel' : 'singulier'} : il lui faut « ${bon} ».`,
        },
        indice: `Demande-toi : est-ce que je dis « un ${n.mot} » ou « une ${n.mot} » ? Et y en a-t-il un seul ou plusieurs ?`,
        explication: `On écrit « ${bon} ${mot} » : ${n.genre === 'f' ? 'féminin' : 'masculin'}, ${pluriel ? 'pluriel' : 'singulier'}.`,
      }),
    );
  });

  /* ---- B. Passe au pluriel ----------------------------------------- */
  const pourPluriel = piocher(noms.filter((n) => n.pluriel !== n.mot), 12, 'm3-pluriel');
  pourPluriel.forEach((n, i) => {
    const defini = i % 2 === 0;
    const det = defini ? (n.genre === 'f' ? 'la' : 'le') : n.genre === 'f' ? 'une' : 'un';
    const attendus = [`des ${n.pluriel}`, `les ${n.pluriel}`];
    const special = !n.pluriel.endsWith('s') || n.pluriel.endsWith('aux') || n.pluriel.endsWith('oux');
    ex.push(
      exercice({
        id: `m3-pluriel-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'pluriel',
        difficulte: special ? 3 : 1,
        type: 'texte',
        consigne: 'Écris ce groupe de mots au pluriel.',
        question: { depart: `${det} ${n.mot}`, exemple: 'un chat → des chats', court: true },
        reponse: {
          attendus,
          bravo: 'Parfait, le déterminant ET le nom sont au pluriel !',
          rate: 'Attention : au pluriel, le déterminant change ET le nom change.',
        },
        indice: special
          ? `Ce nom a un pluriel spécial. Il ne prend pas simplement un -s. Essaie de le dire à voix haute : « des… »`
          : 'Au pluriel, « un » devient « des », « le » devient « les », et le nom prend un -s.',
        explication: `${det} ${n.mot} → des ${n.pluriel}${special ? ' (pluriel spécial : ce nom ne prend pas un simple -s)' : ''}.`,
      }),
    );
  });

  /* ---- C. Reviens au singulier ------------------------------------- */
  const pourSing = piocher(noms.filter((n) => n.pluriel !== n.mot), 10, 'm3-sing');
  pourSing.forEach((n, i) => {
    const det = i % 2 === 0 ? 'les' : 'des';
    const attendus = [
      `${n.genre === 'f' ? 'la' : 'le'} ${n.mot}`,
      `${n.genre === 'f' ? 'une' : 'un'} ${n.mot}`,
    ];
    ex.push(
      exercice({
        id: `m3-singulier-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'singulier',
        difficulte: i < 3 ? 1 : 2,
        type: 'texte',
        consigne: 'Écris ce groupe de mots au singulier.',
        question: { depart: `${det} ${n.pluriel}`, exemple: 'des chats → un chat', court: true },
        reponse: {
          attendus,
          bravo: 'Très bien ! Tout est revenu au singulier.',
          rate: 'Le nom aussi doit revenir au singulier, pas seulement le déterminant.',
        },
        indice: `Il n’y en a plus qu’un seul. Dis-tu « un ${n.mot} » ou « une ${n.mot} » ?`,
        explication: `${det} ${n.pluriel} → ${attendus[0]} (ou « ${attendus[1]} »).`,
      }),
    );
  });

  /* ---- D. Corrige le groupe mal accordé ---------------------------- */
  const pourCorr = piocher(noms.filter((n) => n.pluriel !== n.mot), 10, 'm3-corr');
  pourCorr.forEach((n, i) => {
    const adj = adjPour(n, i);
    const gns = `${n.genre}s`;
    const gnp = `${n.genre}p`;
    const detS = n.genre === 'f' ? 'La' : 'Le';
    const detP = 'Les';
    // Groupe fautif : déterminant pluriel, mais adjectif et nom au singulier.
    const faux = MAJ(groupe(detP.toLowerCase(), adj, n, gns));
    const versSingulier = MAJ(groupe(detS.toLowerCase(), adj, n, gns));
    const versPluriel = MAJ(groupe(detP.toLowerCase(), adj, n, gnp));
    ex.push(
      exercice({
        id: `m3-corrige-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'corrige-groupe',
        difficulte: 3,
        type: 'phrase',
        consigne: 'Ce groupe de mots est mal accordé. Réécris-le correctement.',
        question: { faux, court: true, exemple: 'Deux corrections sont possibles : tout au singulier, ou tout au pluriel.' },
        reponse: {
          regles: [
            {
              type: 'phraseExacte',
              mots: [versSingulier, versPluriel],
              message: `Il faut que les TROIS mots s’accordent ensemble : soit « ${versSingulier} », soit « ${versPluriel} ».`,
            },
          ],
          bravo: 'Bravo ! Les trois mots s’accordent maintenant.',
          solution: versPluriel,
        },
        indice: `Si tu gardes « ${detP} », le nom et l’adjectif doivent aussi passer au pluriel. Si tu préfères « ${detS} », tout reste au singulier.`,
        explication: `« ${faux} » est faux. Les deux corrections possibles : « ${versSingulier} » ou « ${versPluriel} ».`,
      }),
    );
  });

  /* ---- E. Trouve le mot mal accordé -------------------------------- */
  const pourErreur = piocher(noms.filter((n) => n.pluriel !== n.mot), 8, 'm3-err');
  pourErreur.forEach((n, i) => {
    const varies = adjQuiVarie(n);
    const adj = varies[(i + 3) % varies.length];
    const pluriel = i % 2 === 0;
    const gn = `${n.genre}${pluriel ? 'p' : 's'}`;
    const gnFaux = `${n.genre}${pluriel ? 's' : 'p'}`;
    const det = pluriel ? 'Les' : n.genre === 'f' ? 'La' : 'Le';
    // Deux mots sur trois sont corrects ; un seul est fautif.
    const erreurSurNom = i % 4 < 2;
    const motNom = erreurSurNom
      ? (pluriel ? n.mot : n.pluriel)
      : (pluriel ? n.pluriel : n.mot);
    const motAdj = erreurSurNom ? adj[gn] : adj[gnFaux];
    const mots = adj.place === 'avant' ? [det, motAdj, motNom] : [det, motNom, motAdj];
    const indexFaux = adj.place === 'avant'
      ? (erreurSurNom ? 2 : 1)
      : (erreurSurNom ? 1 : 2);
    const bonne = erreurSurNom ? (pluriel ? n.pluriel : n.mot) : adj[gn];
    ex.push(
      exercice({
        id: `m3-detecte-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'detecte-erreur',
        difficulte: 3,
        type: 'clic-mots',
        consigne: 'Un seul mot est mal accordé. Clique dessus.',
        question: {
          phrase: mots.join(' '),
          tokens: mots.map((w, j) => ({ w, after: j === mots.length - 1 ? '.' : '', glue: false })),
        },
        reponse: {
          indices: [indexFaux],
          bravo: 'Œil de lynx ! C’était bien ce mot-là.',
        },
        indice: `Le déterminant « ${det} » donne le ton : tout le groupe doit être au ${pluriel ? 'pluriel' : 'singulier'}.`,
        explication: `« ${mots[indexFaux]} » est mal accordé : il faut écrire « ${bonne} », car le groupe est au ${pluriel ? 'pluriel' : 'singulier'}.`,
      }),
    );
  });

  /* ---- F. Range les groupes : singulier / pluriel ------------------ */
  for (let i = 0; i < 8; i++) {
    const choix = piocher(noms.filter((n) => n.pluriel !== n.mot), 6, `m3-tri-${i}`);
    const placement = {};
    const mots = choix.map((n, j) => {
      const pluriel = j % 2 === 0;
      const g = pluriel
        ? `des ${n.pluriel}`
        : `${n.genre === 'f' ? 'une' : 'un'} ${n.mot}`;
      placement[g] = pluriel ? 'pluriel' : 'singulier';
      return g;
    });
    ex.push(
      exercice({
        id: `m3-tri-nombre-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'tri-sing-plur',
        difficulte: i < 4 ? 1 : 2,
        type: 'colonnes',
        consigne: 'Range chaque groupe dans la bonne colonne.',
        question: {
          mots: melanger(mots, `m3-tri-mix-${i}`),
          colonnes: [
            { id: 'singulier', titre: 'Singulier', aide: 'un seul' },
            { id: 'pluriel', titre: 'Pluriel', aide: 'plusieurs' },
          ],
        },
        reponse: { placement, bravo: 'Tout est bien rangé !' },
        indice: 'Regarde le déterminant : « un », « une », « le », « la » → singulier. « des », « les » → pluriel.',
        explication: 'Le déterminant et le nom portent tous les deux la marque du nombre.',
      }),
    );
  }

  /* ---- G. Quelle phrase est bien accordée ? ------------------------ */
  const pourPhrase = piocher(noms.filter((n) => n.pluriel !== n.mot), 8, 'm3-phrase');
  pourPhrase.forEach((n, i) => {
    const varies = adjQuiVarie(n);
    const adj = varies[(i + 7) % varies.length];
    const gnp = `${n.genre}p`;
    const gns = `${n.genre}s`;
    const juste = MAJ(`${groupe('les', adj, n, gnp)} sont là.`);
    const faux1 = MAJ(`${groupe('les', adj, n, gns)} sont là.`);
    const faux2 = MAJ(`${adj.place === 'avant' ? `les ${adj[gnp]} ${n.mot}` : `les ${n.mot} ${adj[gnp]}`} sont là.`);
    const options = melanger([juste, faux1, faux2], `m3-ph-${i}`);
    ex.push(
      exercice({
        id: `m3-bonne-phrase-${String(i + 1).padStart(2, '0')}`,
        module: M,
        competence: C,
        format: 'accord-phrase',
        difficulte: 3,
        type: 'choix',
        consigne: 'Une seule de ces phrases est bien accordée. Laquelle ?',
        question: { options },
        reponse: {
          index: options.indexOf(juste),
          bravo: 'Oui ! Tous les mots du groupe sont au pluriel.',
          rate: 'Dans un groupe au pluriel, le déterminant, le nom ET l’adjectif prennent la marque du pluriel.',
        },
        indice: 'Vérifie les trois mots du groupe, un par un.',
        explication: `La bonne phrase est « ${juste} » : les trois mots sont au pluriel.`,
      }),
    );
  });

  return ex;
}
