/**
 * Correction des exercices.
 *
 * Chaque type d'exercice possède sa propre logique de vérification : il n'y a
 * aucune comparaison « approximative » qui pourrait valider une réponse
 * fausse. Les réponses libres sont vérifiées par des RÈGLES explicites
 * déclarées dans l'exercice (mot attendu, forme interdite, majuscule, point…).
 *
 * Résultat renvoyé :
 *   statut  'juste' | 'presque' | 'faux'
 *   message phrase à afficher à Thao
 *   detail  informations par item, pour colorier la réponse
 *   score   1 pour juste, 0.5 pour presque, 0 pour faux (sert à la progression)
 *   vide    true si rien n'a été saisi (ne compte pas comme un essai)
 */

import { comparer, estVide, mots as motsDe, normaliser, sansAccents } from './normalisation.js';

const SCORE = { juste: 1, presque: 0.5, faux: 0 };

function resultat(statut, message, detail = null, extra = {}) {
  return { statut, message, detail, score: SCORE[statut], vide: false, ...extra };
}

function rien(message = 'Écris ta réponse avant de valider.') {
  return { statut: 'faux', message, detail: null, score: 0, vide: true };
}

/* ------------------------------------------------------------------ */
/* Règles pour les réponses libres (phrases inventées, transformations) */
/* ------------------------------------------------------------------ */

const REGLES = {
  /** La phrase doit contenir tous ces mots (forme exacte, accents compris). */
  contient(regle, saisie) {
    const liste = motsDe(saisie).map((m) => normaliser(m));
    return regle.mots.every((attendu) => {
      const cible = normaliser(attendu);
      if (cible.includes(' ')) return normaliser(saisie).includes(cible);
      return liste.includes(cible);
    });
  },
  /** La phrase doit contenir au moins un mot de la liste. */
  unDe(regle, saisie) {
    const liste = motsDe(saisie).map((m) => normaliser(m));
    return regle.mots.some((attendu) => {
      const cible = normaliser(attendu);
      if (cible.includes(' ')) return normaliser(saisie).includes(cible);
      return liste.includes(cible);
    });
  },
  /** Aucun de ces mots ne doit apparaître (formes fausses typiques). */
  interdit(regle, saisie) {
    const liste = motsDe(saisie).map((m) => normaliser(m));
    return !regle.mots.some((interdit) => {
      const cible = normaliser(interdit);
      if (cible.includes(' ')) return normaliser(saisie).includes(cible);
      return liste.includes(cible);
    });
  },
  /** La phrase commence par une majuscule. */
  majuscule(regle, saisie) {
    const t = saisie.trim();
    if (!t) return false;
    const c = t[0];
    return c === c.toLocaleUpperCase('fr') && c !== c.toLocaleLowerCase('fr');
  },
  /** La phrase finit par un point, un point d'exclamation ou d'interrogation. */
  point(regle, saisie) {
    return /[.!?…]\s*$/.test(saisie.trim());
  },
  /** Nombre minimum de mots. */
  minMots(regle, saisie) {
    return motsDe(saisie).length >= regle.n;
  },
  /** Un mot doit apparaître avant un autre. */
  ordre(regle, saisie) {
    const liste = motsDe(saisie).map((m) => normaliser(m));
    const i = liste.indexOf(normaliser(regle.avant));
    const j = liste.indexOf(normaliser(regle.apres));
    return i >= 0 && j >= 0 && i < j;
  },
  /** La réponse ne contient qu'un seul mot. */
  motUnique(regle, saisie) {
    return motsDe(saisie).length === 1;
  },
  /** Aucun mot de la réponse n'appartient à cette liste. */
  pasDansListe(regle, saisie) {
    const liste = new Set(regle.mots.map((m) => normaliser(m)));
    return !motsDe(saisie).some((m) => liste.has(normaliser(m)));
  },
  /** La réponse ne contient que des lettres (pas de chiffre, pas de symbole). */
  lettresSeules(regle, saisie) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ’' -]+$/.test(saisie.trim());
  },
  /** La réponse compte au moins `n` lettres. */
  minLettres(regle, saisie) {
    return sansAccents(saisie).replace(/[^A-Za-z]/g, '').length >= regle.n;
  },
  /** La phrase, mot pour mot, est l'une des phrases acceptées. */
  phraseExacte(regle, saisie) {
    return regle.mots.some(
      (p) => motsDe(p).join(' ') === motsDe(saisie).join(' '),
    );
  },
};

/** Évalue les règles d'une réponse libre. */
function corrigerRegles(exercice, saisie) {
  if (estVide(saisie)) return rien();
  const echecs = [];
  for (const regle of exercice.reponse.regles) {
    const test = REGLES[regle.type];
    if (!test) throw new Error(`Règle inconnue : ${regle.type}`);
    if (!test(regle, saisie)) echecs.push(regle);
  }
  if (!echecs.length) {
    return resultat('juste', exercice.reponse.bravo || 'Parfait, ta phrase est juste !');
  }
  // Une seule petite chose à corriger (majuscule ou point) : c'est « presque ».
  const legers = echecs.every((r) => r.type === 'majuscule' || r.type === 'point');
  return resultat(
    legers ? 'presque' : 'faux',
    echecs[0].message,
    echecs.map((r) => ({ regle: r.type, message: r.message })),
  );
}

/* ------------------------------------------------------------------ */
/* Correction par type d'exercice                                      */
/* ------------------------------------------------------------------ */

const CORRECTEURS = {
  /** Cliquer sur des mots dans une phrase. saisie = tableau d'indices. */
  'clic-mots'(exercice, saisie) {
    const choisis = new Set(saisie || []);
    if (!choisis.size) return rien('Clique sur au moins un mot.');
    const attendus = new Set(exercice.reponse.indices);
    const bons = [...choisis].filter((i) => attendus.has(i));
    const trop = [...choisis].filter((i) => !attendus.has(i));
    const manques = [...attendus].filter((i) => !choisis.has(i));
    const detail = { bons, trop, manques, attendus: [...attendus] };
    const nom = (i) => exercice.question.tokens[i].w;

    if (!trop.length && !manques.length) {
      return resultat('juste', exercice.reponse.bravo || 'Tu as trouvé tous les bons mots !', detail);
    }
    if (trop.length) {
      return resultat(
        'faux',
        `« ${nom(trop[0])} » n’est pas la bonne réponse. Regarde encore ce mot.`,
        detail,
      );
    }
    return resultat(
      'presque',
      manques.length === 1
        ? 'Tu y es presque : il manque encore un mot.'
        : `Tu y es presque : il manque encore ${manques.length} mots.`,
      detail,
    );
  },

  /** Choix unique. saisie = index de l'option. */
  choix(exercice, saisie) {
    if (saisie === null || saisie === undefined) return rien('Choisis une réponse.');
    const bon = exercice.reponse.index;
    const detail = { choisi: saisie, bon };
    if (saisie === bon) {
      return resultat('juste', exercice.reponse.bravo || 'Bonne réponse !', detail);
    }
    return resultat('faux', exercice.reponse.rate || 'Ce n’est pas la bonne réponse.', detail);
  },

  /** Vrai / faux. saisie = booléen. */
  'vrai-faux'(exercice, saisie) {
    if (typeof saisie !== 'boolean') return rien('Réponds par oui ou par non.');
    const bon = exercice.reponse.valeur;
    const detail = { choisi: saisie, bon };
    if (saisie === bon) {
      return resultat('juste', exercice.reponse.bravo || 'C’est exactement ça !', detail);
    }
    return resultat('faux', exercice.reponse.rate || 'Non, ce n’est pas ça. Réfléchis encore.', detail);
  },

  /** Plusieurs bonnes réponses parmi des cases. saisie = tableau d'indices. */
  'choix-multiple'(exercice, saisie) {
    const choisis = new Set(saisie || []);
    if (!choisis.size) return rien('Coche au moins une réponse.');
    const attendus = new Set(exercice.reponse.indices);
    const trop = [...choisis].filter((i) => !attendus.has(i));
    const manques = [...attendus].filter((i) => !choisis.has(i));
    const detail = { bons: [...choisis].filter((i) => attendus.has(i)), trop, manques, attendus: [...attendus] };
    if (!trop.length && !manques.length) {
      return resultat('juste', exercice.reponse.bravo || 'Tout juste !', detail);
    }
    if (trop.length) {
      return resultat('faux', 'Il y a une réponse en trop. Relis bien chaque proposition.', detail);
    }
    return resultat('presque', 'Tu y es presque : il manque une réponse.', detail);
  },

  /** Une seule réponse écrite au clavier. */
  texte(exercice, saisie) {
    if (estVide(saisie)) return rien();
    const opts = exercice.reponse.options || {};
    const r = comparer(saisie, exercice.reponse.attendus, opts);
    const detail = { saisie, attendu: exercice.reponse.attendus[0] };
    if (r.juste) {
      return resultat('juste', exercice.reponse.bravo || 'C’est la bonne réponse !', detail);
    }
    if (r.accents) {
      return resultat('presque', `Attention aux accents : ce n’est pas tout à fait « ${r.forme} ».`, detail, { accents: true });
    }
    return resultat('faux', exercice.reponse.rate || 'Ce n’est pas encore la bonne réponse.', detail);
  },

  /** Plusieurs réponses écrites (tableau de conjugaison, liste de mots). */
  textes(exercice, saisie) {
    const valeurs = saisie || {};
    const champs = exercice.reponse.champs;
    if (champs.every((c) => estVide(valeurs[c.cle]))) return rien('Remplis les cases.');
    const detail = [];
    let justes = 0;
    let accents = 0;
    for (const champ of champs) {
      const brut = valeurs[champ.cle] ?? '';
      if (estVide(brut)) {
        detail.push({ cle: champ.cle, statut: 'vide', attendu: champ.attendus[0] });
        continue;
      }
      const r = comparer(brut, champ.attendus, champ.options || exercice.reponse.options || {});
      if (r.juste) {
        justes += 1;
        detail.push({ cle: champ.cle, statut: 'juste', attendu: champ.attendus[0] });
      } else if (r.accents) {
        accents += 1;
        detail.push({ cle: champ.cle, statut: 'accents', attendu: r.forme });
      } else {
        detail.push({ cle: champ.cle, statut: 'faux', attendu: champ.attendus[0] });
      }
    }
    if (justes === champs.length) {
      return resultat('juste', exercice.reponse.bravo || 'Tout le tableau est juste !', detail);
    }
    const restants = champs.length - justes;
    if (accents && justes + accents === champs.length) {
      return resultat('presque', 'Tout est bon, sauf les accents. Regarde les cases orange.', detail, { accents: true });
    }
    if (justes > 0) {
      return resultat(
        'presque',
        `${justes} case${justes > 1 ? 's' : ''} sur ${champs.length} ${justes > 1 ? 'sont justes' : 'est juste'}. Il en reste ${restants} à corriger.`,
        detail,
      );
    }
    return resultat('faux', exercice.reponse.rate || 'Aucune case n’est juste pour l’instant. Prends un indice !', detail);
  },

  /** Ranger des mots dans des colonnes. saisie = { mot: idColonne }. */
  colonnes(exercice, saisie) {
    const place = saisie || {};
    const attendu = exercice.reponse.placement;
    const liste = Object.keys(attendu);
    if (!liste.some((m) => place[m])) return rien('Place les mots dans les colonnes.');
    const detail = liste.map((mot) => ({
      mot,
      place: place[mot] ?? null,
      bon: attendu[mot],
      statut: !place[mot] ? 'vide' : place[mot] === attendu[mot] ? 'juste' : 'faux',
    }));
    const justes = detail.filter((d) => d.statut === 'juste').length;
    const restants = detail.filter((d) => d.statut === 'vide').length;
    if (justes === liste.length) {
      return resultat('juste', exercice.reponse.bravo || 'Tous les mots sont bien rangés !', detail);
    }
    if (restants) {
      return resultat('presque', `Il reste ${restants} mot${restants > 1 ? 's' : ''} à placer.`, detail);
    }
    const faux = detail.filter((d) => d.statut === 'faux').length;
    return resultat(
      justes >= liste.length - 1 ? 'presque' : 'faux',
      `${faux} mot${faux > 1 ? 's sont' : ' est'} dans la mauvaise colonne.`,
      detail,
    );
  },

  /** Remettre des mots dans l'ordre. saisie = tableau de mots. */
  ordre(exercice, saisie) {
    const liste = saisie || [];
    const bon = exercice.reponse.ordre;
    if (liste.length !== bon.length) return rien('Place tous les mots.');
    const detail = liste.map((mot, i) => ({ mot, position: i, statut: mot === bon[i] ? 'juste' : 'faux' }));
    const justes = detail.filter((d) => d.statut === 'juste').length;
    if (justes === bon.length) {
      return resultat('juste', exercice.reponse.bravo || 'La liste est parfaitement rangée !', detail);
    }
    // Deux mots voisins inversés : c'est presque gagné.
    const fauxIdx = detail.filter((d) => d.statut === 'faux').map((d) => d.position);
    const inversionSimple =
      fauxIdx.length === 2 &&
      fauxIdx[1] === fauxIdx[0] + 1 &&
      liste[fauxIdx[0]] === bon[fauxIdx[1]] &&
      liste[fauxIdx[1]] === bon[fauxIdx[0]];
    if (inversionSimple) {
      return resultat('presque', `Il suffit d’échanger « ${liste[fauxIdx[0]]} » et « ${liste[fauxIdx[1]]} ».`, detail);
    }
    return resultat(
      justes >= bon.length - 2 ? 'presque' : 'faux',
      `${justes} mot${justes > 1 ? 's' : ''} sur ${bon.length} ${justes > 1 ? 'sont' : 'est'} à la bonne place.`,
      detail,
    );
  },

  /** Relier deux colonnes. saisie = { idGauche: idDroite }. */
  paires(exercice, saisie) {
    const liens = saisie || {};
    const attendu = exercice.reponse.paires;
    const cles = Object.keys(attendu);
    if (!cles.some((k) => liens[k])) return rien('Relie au moins une paire.');
    const detail = cles.map((k) => ({
      gauche: k,
      relie: liens[k] ?? null,
      bon: attendu[k],
      statut: !liens[k] ? 'vide' : liens[k] === attendu[k] ? 'juste' : 'faux',
    }));
    const justes = detail.filter((d) => d.statut === 'juste').length;
    if (justes === cles.length) {
      return resultat('juste', exercice.reponse.bravo || 'Toutes les paires sont bonnes !', detail);
    }
    const restants = detail.filter((d) => d.statut === 'vide').length;
    if (restants) {
      return resultat('presque', `Il reste ${restants} paire${restants > 1 ? 's' : ''} à relier.`, detail);
    }
    return resultat(
      justes >= cles.length - 1 ? 'presque' : 'faux',
      `${justes} paire${justes > 1 ? 's' : ''} sur ${cles.length} ${justes > 1 ? 'sont justes' : 'est juste'}.`,
      detail,
    );
  },

  /** Couper une phrase entre le groupe sujet et le groupe verbal. */
  'coupe-phrase'(exercice, saisie) {
    if (saisie === null || saisie === undefined) return rien('Clique entre deux mots pour couper la phrase.');
    const bon = exercice.reponse.coupe;
    const detail = { coupe: saisie, bon };
    if (saisie === bon) {
      return resultat('juste', exercice.reponse.bravo || 'Tu as coupé au bon endroit !', detail);
    }
    const sens = saisie < bon ? 'un peu plus loin' : 'un peu avant';
    return resultat('faux', `Pas tout à fait : la coupure est ${sens}. Le groupe sujet répond à « De qui on parle ? ».`, detail);
  },

  /** Réponse libre vérifiée par des règles. */
  phrase: corrigerRegles,
};

/**
 * Corrige un exercice.
 * @param {object} exercice  l'exercice tel qu'il sort de la banque
 * @param {*} saisie         la réponse de Thao (format selon le type)
 */
export function corriger(exercice, saisie) {
  const correcteur = CORRECTEURS[exercice.type];
  if (!correcteur) throw new Error(`Type d'exercice inconnu : ${exercice.type}`);
  const r = correcteur(exercice, saisie);
  return { ...r, exercice: exercice.id };
}

export const TYPES_SUPPORTES = Object.keys(CORRECTEURS);
