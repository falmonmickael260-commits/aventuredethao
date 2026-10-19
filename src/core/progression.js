/**
 * Progression adaptative.
 *
 * Idée pédagogique : une compétence n'est jamais déclarée « maîtrisée » sur
 * une seule bonne réponse. Il faut plusieurs réussites, sur plusieurs FORMATS
 * d'exercice différents, et au moins deux réussites sur des exercices
 * difficiles. À l'inverse, une erreur ne fait jamais perdre de progression :
 * elle place simplement l'exercice dans la file de révision.
 */

import { BANQUE, PAR_MODULE, PAR_MONDE } from '../../data/bank/index.js';
import { MODULES, MONDES, MONDE_PAR_ID } from '../../data/modules.js';

const FENETRE = 8; // on regarde les 8 dernières réponses d'une compétence
const MAX_REVISIONS = 40;

export const ETATS = {
  nouvelle: { libelle: 'Pas encore commencé', couleur: 'neutre', ordre: 4 },
  'en-cours': { libelle: 'En cours d’apprentissage', couleur: 'cours', ordre: 2 },
  fragile: { libelle: 'À retravailler', couleur: 'fragile', ordre: 1 },
  maitrisee: { libelle: 'Maîtrisée', couleur: 'maitrise', ordre: 3 },
};

/** Moyenne des dernières réponses (0 → 1). */
function moyenneRecente(stat) {
  const d = stat.derniers.slice(-FENETRE);
  if (!d.length) return 0;
  return d.reduce((a, b) => a + b, 0) / d.length;
}

/** Calcule le pourcentage de maîtrise et l'état d'une compétence. */
export function evaluerCompetence(stat, module) {
  const recent = moyenneRecente(stat);
  const formatsVus = Object.keys(stat.formats || {}).length;
  const formatsTotal = Math.max(1, (PAR_MODULE[module] || []).reduce((s, e, i, arr) => (arr.findIndex((x) => x.format === e.format) === i ? s + 1 : s), 0));
  const couverture = Math.min(1, formatsVus / Math.min(4, formatsTotal));
  const volume = Math.min(1, stat.essais / 8);
  const durs = stat.formats ? Object.values(stat.formats).reduce((n, f) => n + (f.dur || 0), 0) : 0;

  const maitrise = Math.round(100 * recent * (0.55 + 0.25 * couverture + 0.2 * volume));

  let etat = 'nouvelle';
  if (stat.essais === 0) etat = 'nouvelle';
  else if (recent >= 0.8 && stat.essais >= 6 && formatsVus >= 3 && durs >= 2) etat = 'maitrisee';
  else if (recent < 0.5 && stat.essais >= 3) etat = 'fragile';
  else etat = 'en-cours';

  return { maitrise: Math.min(100, maitrise), etat, recent, formatsVus, durs };
}

/**
 * Enregistre une réponse et met à jour la progression.
 * @param {object} profil
 * @param {object} exercice
 * @param {object} resultat  sortie de corriger()
 * @param {object} info      { essais, premierEssai, secondes }
 */
export function enregistrerReponse(profil, exercice, resultat, info = {}) {
  const stat = profil.competences[exercice.competence];
  if (!stat) return { profil, nouvelEtat: null };

  const premier = info.premierEssai !== false;
  const reussi = resultat.statut === 'juste';
  const valeur = reussi ? (premier ? 1 : 0.6) : resultat.statut === 'presque' ? 0.3 : 0;

  stat.essais += 1;
  if (reussi) stat.reussites += 1;
  stat.score += valeur;
  stat.derniers = [...stat.derniers, valeur].slice(-12);
  stat.serie = reussi ? stat.serie + 1 : 0;
  stat.meilleureSerie = Math.max(stat.meilleureSerie, stat.serie);
  stat.secondes += info.secondes || 0;

  const f = stat.formats[exercice.format] || { essais: 0, reussites: 0, dur: 0 };
  f.essais += 1;
  if (reussi) {
    f.reussites += 1;
    if (exercice.difficulte === 3) f.dur += 1;
  }
  stat.formats[exercice.format] = f;

  // Difficulté adaptative : deux réussites d'affilée du premier coup → on monte.
  if (reussi && premier) {
    stat.montees = (stat.montees || 0) + 1;
    stat.descentes = 0;
    if (stat.montees >= 2 && stat.niveauDifficulte < 3) {
      stat.niveauDifficulte += 1;
      stat.montees = 0;
    }
  } else if (!reussi) {
    stat.descentes = (stat.descentes || 0) + 1;
    stat.montees = 0;
    if (stat.descentes >= 2 && stat.niveauDifficulte > 1) {
      stat.niveauDifficulte -= 1;
      stat.descentes = 0;
    }
  }

  const avant = stat.etat;
  const bilan = evaluerCompetence(stat, exercice.competence);
  stat.maitrise = bilan.maitrise;
  stat.etat = bilan.etat;

  // Historique
  profil.historique.push({
    id: exercice.id,
    module: exercice.module,
    format: exercice.format,
    difficulte: exercice.difficulte,
    statut: resultat.statut,
    essais: info.essais || 1,
    secondes: info.secondes || 0,
    date: new Date().toISOString(),
  });
  if (profil.historique.length > 400) profil.historique = profil.historique.slice(-400);

  // File de révision : une erreur revient plus tard, jamais tout de suite.
  if (!reussi) {
    const demain = new Date(Date.now() + 20 * 3600 * 1000).toISOString();
    profil.revisions = [
      ...profil.revisions.filter((r) => r.exId !== exercice.id),
      { exId: exercice.id, competence: exercice.competence, revoirLe: demain },
    ].slice(-MAX_REVISIONS);
  } else if (premier) {
    profil.revisions = profil.revisions.filter((r) => r.exId !== exercice.id);
  }

  return {
    profil,
    nouvelEtat: stat.etat !== avant ? stat.etat : null,
    maitrise: stat.maitrise,
  };
}

/* ------------------------------------------------------------------ */
/* Choix des exercices                                                 */
/* ------------------------------------------------------------------ */

/** Les ids vus récemment, pour éviter de reposer la même question. */
function vusRecemment(profil, combien = 60) {
  return new Set(profil.historique.slice(-combien).map((h) => h.id));
}

/** Révisions arrivées à échéance. */
export function revisionsDues(profil, maintenant = Date.now()) {
  return profil.revisions.filter((r) => new Date(r.revoirLe).getTime() <= maintenant);
}

/**
 * Choisit une série d'exercices adaptée à Thao.
 * @param {object} profil
 * @param {object} opts { module, monde, n, difficulte, formats, eviter }
 */
export function choisirExercices(profil, opts = {}) {
  const n = opts.n || 8;
  let pool = BANQUE;
  if (opts.module) pool = PAR_MODULE[opts.module] || [];
  else if (opts.monde) pool = PAR_MONDE[opts.monde] || [];
  if (opts.formats && opts.formats.length) pool = pool.filter((e) => opts.formats.includes(e.format));
  if (!pool.length) return [];

  const vus = vusRecemment(profil, opts.memoire ?? 60);
  const eviter = new Set(opts.eviter || []);
  const choix = [];
  const pris = new Set();
  const comptesFormat = {};
  // On ne veut pas huit fois le même type d'exercice dans une séance.
  const maxParFormat = opts.maxParFormat ?? 2;

  const ajouter = (e, strict = true) => {
    if (!e || pris.has(e.id) || eviter.has(e.id)) return false;
    if (strict && (comptesFormat[e.format] || 0) >= maxParFormat) return false;
    pris.add(e.id);
    comptesFormat[e.format] = (comptesFormat[e.format] || 0) + 1;
    choix.push(e);
    return true;
  };

  // 1. Les révisions dues, en priorité (mais au maximum un tiers de la séance).
  const maxRevisions = Math.max(1, Math.floor(n / 3));
  for (const r of revisionsDues(profil)) {
    if (choix.length >= maxRevisions) break;
    const e = pool.find((x) => x.id === r.exId);
    if (e) ajouter(e, false);
  }

  // 2. Le reste : difficulté visée par compétence, formats pas encore vus d'abord.
  const scoreDe = (e) => {
    const stat = profil.competences[e.competence] || { niveauDifficulte: 1, formats: {} };
    const cible = opts.difficulte || stat.niveauDifficulte;
    let s = 0;
    s -= Math.abs(e.difficulte - cible) * 10; // proche de la difficulté visée
    if (!stat.formats[e.format]) s += 8; // format nouveau : on découvre
    else s -= Math.min(6, stat.formats[e.format].essais); // format déjà beaucoup vu
    if (vus.has(e.id)) s -= 40; // déjà posé très récemment
    if (stat.etat === 'fragile' && e.difficulte === 1) s += 6; // on rassure
    return s;
  };

  const restants = pool
    .filter((e) => !pris.has(e.id) && !eviter.has(e.id))
    .map((e) => ({ e, s: scoreDe(e), h: hachage(e.id + (profil.historique.length || 0)) }))
    .sort((a, b) => b.s - a.s || a.h - b.h);

  for (const { e } of restants) {
    if (choix.length >= n) break;
    ajouter(e);
  }
  // S'il manque encore des exercices (peu de formats disponibles), on relâche.
  if (choix.length < n) {
    for (const { e } of restants) {
      if (choix.length >= n) break;
      ajouter(e, false);
    }
  }
  return choix;
}

/** Petit hachage stable pour départager sans vrai hasard. */
function hachage(texte) {
  let h = 0;
  for (let i = 0; i < texte.length; i++) h = (Math.imul(h, 31) + texte.charCodeAt(i)) | 0;
  return Math.abs(h) % 1000;
}

/* ------------------------------------------------------------------ */
/* Mondes : déblocage et progression                                   */
/* ------------------------------------------------------------------ */

/** Pourcentage de progression d'un monde = moyenne de la maîtrise de ses modules. */
export function progressionMonde(profil, mondeId) {
  const monde = MONDE_PAR_ID[mondeId];
  if (!monde) return 0;
  const vals = monde.modules.map((m) => profil.competences[m]?.maitrise || 0);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** Met à jour l'état des mondes : progression, achèvement, déblocage du suivant. */
export function majMondes(profil) {
  const debloques = [];
  MONDES.forEach((w, i) => {
    const etat = profil.mondes[w.id];
    etat.progression = progressionMonde(profil, w.id);
    const tousMaitrises = w.modules.every((m) => profil.competences[m]?.etat === 'maitrisee');
    if (tousMaitrises && !etat.termine) {
      etat.termine = true;
      profil.coffresEnAttente += 1;
    }
    etat.etoiles = w.modules.reduce((n, m) => n + (profil.competences[m]?.reussites || 0), 0);
    // Le monde suivant s'ouvre dès que celui-ci est bien entamé (60 %).
    const suivant = MONDES[i + 1];
    if (suivant && etat.progression >= 60 && !profil.mondes[suivant.id].debloque) {
      profil.mondes[suivant.id].debloque = true;
      debloques.push(suivant);
    }
  });
  return debloques;
}

/* ------------------------------------------------------------------ */
/* Conseils                                                            */
/* ------------------------------------------------------------------ */

/** La compétence la plus utile à travailler maintenant. */
export function prochaineCompetence(profil) {
  const classees = MODULES.map((m) => {
    const stat = profil.competences[m.id];
    const monde = profil.mondes[m.monde];
    return { module: m, stat, accessible: monde?.debloque };
  })
    .filter((x) => x.accessible)
    .sort((a, b) => {
      const oa = ETATS[a.stat.etat]?.ordre ?? 4;
      const ob = ETATS[b.stat.etat]?.ordre ?? 4;
      if (oa !== ob) return oa - ob;
      return a.stat.maitrise - b.stat.maitrise;
    });
  return classees[0]?.module || MODULES[0];
}

/** Petit bilan global, affiché sur l'accueil. */
export function bilan(profil) {
  const comps = MODULES.map((m) => ({ id: m.id, titre: m.court, ...profil.competences[m.id] }));
  const maitrisees = comps.filter((c) => c.etat === 'maitrisee');
  const fragiles = comps.filter((c) => c.etat === 'fragile');
  const enCours = comps.filter((c) => c.etat === 'en-cours');
  const total = profil.historique.length;
  const justes = profil.historique.filter((h) => h.statut === 'juste').length;
  return {
    progressionGlobale: Math.round(comps.reduce((a, c) => a + c.maitrise, 0) / comps.length),
    maitrisees,
    fragiles,
    enCours,
    exercicesFaits: total,
    reussite: total ? Math.round((100 * justes) / total) : 0,
    mondesDebloques: Object.values(profil.mondes).filter((w) => w.debloque).length,
    prochaine: prochaineCompetence(profil),
  };
}
