/**
 * Les séances : mission du jour (mode vacances), entraînement libre d'un
 * module, exploration d'un monde, et petite évaluation de départ.
 *
 * Une séance de vacances dure 10 à 20 minutes : environ 13 exercices, mélangés
 * entre toutes les compétences, et adaptés à ce que Thao doit retravailler.
 */

import { MODULES, MODULE_PAR_ID, MONDE_PAR_ID } from '../../data/modules.js';
import { PAR_MODULE } from '../../data/bank/index.js';
import { choisirExercices, revisionsDues } from './progression.js';

/** La recette d'une mission du jour : combien d'exercices par domaine. */
export const RECETTE = [
  { domaine: 'Noms et déterminants', modules: ['m1', 'm2', 'm3'], n: 3 },
  { domaine: 'Phrases et verbes', modules: ['m4', 'm5'], n: 3 },
  { domaine: 'Conjugaison à l’imparfait', modules: ['m6'], n: 3 },
  { domaine: 'Familles de mots', modules: ['m7'], n: 2 },
  { domaine: 'Dictionnaire', modules: ['m8', 'm9'], n: 2 },
];

const dateJour = () => new Date().toISOString().slice(0, 10);

/** Modules accessibles (monde débloqué). */
export function modulesAccessibles(profil) {
  return MODULES.filter((m) => profil.mondes[m.monde]?.debloque).map((m) => m.id);
}

/** Crée la mission du jour. */
export function creerSeanceVacances(profil) {
  const accessibles = new Set(modulesAccessibles(profil));
  const ids = [];
  const dejaPris = [];

  for (const bloc of RECETTE) {
    const dispo = bloc.modules.filter((m) => accessibles.has(m));
    if (!dispo.length) continue;
    // On commence par le module le plus fragile du bloc.
    const classe = [...dispo].sort((a, b) => {
      const sa = profil.competences[a];
      const sb = profil.competences[b];
      const poids = (s) => (s.etat === 'fragile' ? 0 : s.etat === 'nouvelle' ? 1 : s.etat === 'en-cours' ? 2 : 3);
      return poids(sa) - poids(sb) || sa.maitrise - sb.maitrise;
    });
    let reste = bloc.n;
    for (let i = 0; i < classe.length && reste > 0; i++) {
      const part = i === classe.length - 1 ? reste : Math.ceil(bloc.n / classe.length);
      const lot = choisirExercices(profil, {
        module: classe[i],
        n: Math.min(part, reste),
        eviter: dejaPris,
        maxParFormat: 1,
      });
      lot.forEach((e) => {
        ids.push(e.id);
        dejaPris.push(e.id);
      });
      reste -= lot.length;
    }
  }

  return {
    type: 'vacances',
    titre: 'Ma mission du jour',
    sousTitre: `${ids.length} exercices, environ ${Math.max(10, Math.round(ids.length * 1.2))} minutes`,
    jour: dateJour(),
    ids,
    index: 0,
    reponses: {},
    debut: new Date().toISOString(),
    secondes: 0,
    fini: false,
  };
}

/** Séance d'entraînement sur un module précis. */
export function creerSeanceModule(profil, moduleId, n = 8) {
  const mod = MODULE_PAR_ID[moduleId];
  const lot = choisirExercices(profil, { module: moduleId, n });
  return {
    type: 'module',
    module: moduleId,
    titre: mod ? mod.titre : moduleId,
    sousTitre: `${lot.length} exercices choisis pour toi`,
    jour: dateJour(),
    ids: lot.map((e) => e.id),
    index: 0,
    reponses: {},
    debut: new Date().toISOString(),
    secondes: 0,
    fini: false,
  };
}

/** Séance d'exploration d'un monde. */
export function creerSeanceMonde(profil, mondeId, n = 10) {
  const monde = MONDE_PAR_ID[mondeId];
  const lot = choisirExercices(profil, { monde: mondeId, n });
  return {
    type: 'monde',
    monde: mondeId,
    titre: monde ? monde.titre : mondeId,
    sousTitre: `${lot.length} épreuves à relever`,
    jour: dateJour(),
    ids: lot.map((e) => e.id),
    index: 0,
    reponses: {},
    debut: new Date().toISOString(),
    secondes: 0,
    fini: false,
  };
}

/** Séance ciblée sur une liste de formats (exercices libres). */
export function creerSeanceFormats(profil, moduleId, formats, n = 8) {
  const lot = choisirExercices(profil, { module: moduleId, formats, n, maxParFormat: n });
  const mod = MODULE_PAR_ID[moduleId];
  return {
    type: 'libre',
    module: moduleId,
    titre: mod ? mod.titre : moduleId,
    sousTitre: 'Entraînement choisi par toi',
    jour: dateJour(),
    ids: lot.map((e) => e.id),
    index: 0,
    reponses: {},
    debut: new Date().toISOString(),
    secondes: 0,
    fini: false,
  };
}

/**
 * Petite évaluation de départ : une question facile par compétence.
 * Aucune note n'est affichée — elle sert seulement à régler la difficulté.
 */
export function creerEvaluation(profil) {
  const ids = [];
  for (const m of MODULES) {
    const faciles = (PAR_MODULE[m.id] || []).filter((e) => e.difficulte === 1);
    const pool = faciles.length ? faciles : PAR_MODULE[m.id] || [];
    const choisi = pool[Math.floor(pool.length / 2)];
    if (choisi) ids.push(choisi.id);
  }
  return {
    type: 'evaluation',
    titre: 'On fait connaissance !',
    sousTitre: '9 petites questions, sans note. Juste pour savoir par où commencer.',
    jour: dateJour(),
    ids,
    index: 0,
    reponses: {},
    debut: new Date().toISOString(),
    secondes: 0,
    fini: false,
  };
}

/** Règle la difficulté de départ d'après l'évaluation. */
export function appliquerEvaluation(profil, seance) {
  profil.evaluation = { fait: true, resultats: {} };
  for (const [exId, rep] of Object.entries(seance.reponses)) {
    const mod = exId.split('-')[0];
    if (!profil.competences[mod]) continue;
    profil.evaluation.resultats[mod] = rep.statut;
    profil.competences[mod].niveauDifficulte = rep.statut === 'juste' ? 2 : 1;
  }
  return profil;
}

/* ------------------------------------------------------------------ */
/* Déroulement                                                         */
/* ------------------------------------------------------------------ */

export function progressionSeance(seance) {
  const total = seance.ids.length || 1;
  const faits = Object.keys(seance.reponses).length;
  return {
    total,
    faits,
    restants: Math.max(0, total - faits),
    pourcentage: Math.round((100 * faits) / total),
  };
}

export function idCourant(seance) {
  if (!seance || seance.fini) return null;
  return seance.ids[seance.index] || null;
}

/** Note la réponse dans la séance et avance. */
export function noterEtAvancer(seance, exId, statut, essais, secondes) {
  seance.reponses[exId] = { statut, essais, secondes };
  seance.secondes = (seance.secondes || 0) + (secondes || 0);
  seance.index += 1;
  if (seance.index >= seance.ids.length) seance.fini = true;
  return seance;
}

/** Bilan de fin de séance. */
export function bilanSeance(seance) {
  const reps = Object.values(seance.reponses);
  const justes = reps.filter((r) => r.statut === 'juste').length;
  const presque = reps.filter((r) => r.statut === 'presque').length;
  const competences = [...new Set(seance.ids.map((id) => id.split('-')[0]))];
  return {
    total: seance.ids.length,
    repondus: reps.length,
    justes,
    presque,
    faux: reps.length - justes - presque,
    reussite: reps.length ? Math.round((100 * justes) / reps.length) : 0,
    minutes: Math.max(1, Math.round((seance.secondes || 0) / 60)),
    competences: competences.map((id) => MODULE_PAR_ID[id]).filter(Boolean),
  };
}

/** Enregistre la séance terminée dans le journal des missions. */
export function archiverSeance(profil, seance) {
  const bilan = bilanSeance(seance);
  profil.missions.terminees += 1;
  profil.missions.journal.push({
    date: new Date().toISOString(),
    jour: seance.jour,
    type: seance.type,
    titre: seance.titre,
    total: bilan.total,
    justes: bilan.justes,
    minutes: bilan.minutes,
    competences: bilan.competences.map((c) => c.id),
  });
  if (profil.missions.journal.length > 120) {
    profil.missions.journal = profil.missions.journal.slice(-120);
  }
  // Une mission terminée ouvre un coffre une fois sur deux.
  if (profil.missions.terminees % 2 === 0) profil.coffresEnAttente += 1;
  profil.seance = null;
  return bilan;
}

/** Nombre d'exercices de révision qui attendent. */
export function revisionsEnAttente(profil) {
  return revisionsDues(profil).length;
}
