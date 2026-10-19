/**
 * Sauvegarde locale de la progression de Thao.
 *
 * - Tout est enregistré sur l'appareil (localStorage). Aucun compte, aucune
 *   donnée envoyée sur Internet.
 * - La lecture est TOLÉRANTE : si la sauvegarde est absente, incomplète ou
 *   abîmée, on répare ce qui peut l'être et on repart d'un profil valide
 *   plutôt que de planter.
 * - `fusionner()` sert à recoller deux sauvegardes (import, ou synchronisation
 *   optionnelle) sans jamais faire perdre une récompense déjà gagnée.
 */

import { MODULES, MONDES } from '../../data/modules.js';

export const CLE = 'thao-aventure-v1';
export const VERSION = 1;
const MAX_HISTORIQUE = 400;

const aujourdhui = () => new Date().toISOString().slice(0, 10);

/** Un profil neuf, prêt à l'emploi. */
export function profilVide() {
  const competences = {};
  for (const m of MODULES) {
    competences[m.id] = {
      essais: 0,
      reussites: 0,
      score: 0,
      serie: 0,
      meilleureSerie: 0,
      derniers: [],
      niveauDifficulte: 1,
      formats: {},
      maitrise: 0,
      etat: 'nouvelle',
      secondes: 0,
    };
  }
  const mondes = {};
  MONDES.forEach((w, i) => {
    mondes[w.id] = { debloque: i === 0, termine: false, progression: 0, etoiles: 0 };
  });
  return {
    version: VERSION,
    prenom: 'Thao',
    cree: new Date().toISOString(),
    maj: new Date().toISOString(),
    xp: 0,
    etoiles: 0,
    niveau: 1,
    badges: [],
    tresors: [],
    coffresEnAttente: 0,
    mondes,
    competences,
    historique: [],
    revisions: [],
    missions: { terminees: 0, journal: [] },
    seance: null,
    jours: {},
    evaluation: { fait: false, resultats: {} },
    reglages: {
      sons: true,
      animations: true,
      grandePolice: false,
      contrasteFort: false,
    },
    parent: { code: null, dernierAcces: null },
    serieJours: { courant: 0, record: 0, dernierJour: null },
  };
}

const estObjet = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Valide et répare un profil chargé.
 * @returns {{profil: object, reparations: string[]}}
 */
export function valider(brut) {
  const reparations = [];
  const base = profilVide();
  if (!estObjet(brut)) {
    return { profil: base, reparations: ['sauvegarde illisible : nouveau profil créé'] };
  }

  const profil = { ...base };

  // Champs simples, avec contrôle de type.
  const nombre = (v, def, min = 0) =>
    typeof v === 'number' && Number.isFinite(v) && v >= min ? v : def;
  profil.prenom = typeof brut.prenom === 'string' && brut.prenom.trim() ? brut.prenom.trim() : 'Thao';
  profil.xp = nombre(brut.xp, 0);
  profil.etoiles = nombre(brut.etoiles, 0);
  profil.niveau = nombre(brut.niveau, 1, 1);
  profil.coffresEnAttente = nombre(brut.coffresEnAttente, 0);
  profil.cree = typeof brut.cree === 'string' ? brut.cree : base.cree;
  profil.maj = typeof brut.maj === 'string' ? brut.maj : base.maj;

  profil.badges = Array.isArray(brut.badges)
    ? brut.badges.filter((b) => estObjet(b) && typeof b.id === 'string')
    : [];
  if (Array.isArray(brut.badges) && profil.badges.length !== brut.badges.length) {
    reparations.push('badges abîmés ignorés');
  }
  profil.tresors = Array.isArray(brut.tresors)
    ? brut.tresors.filter((t) => estObjet(t) && typeof t.id === 'string')
    : [];

  // Mondes
  profil.mondes = {};
  MONDES.forEach((w, i) => {
    const src = estObjet(brut.mondes) ? brut.mondes[w.id] : null;
    profil.mondes[w.id] = {
      debloque: src ? !!src.debloque || i === 0 : i === 0,
      termine: src ? !!src.termine : false,
      progression: src ? Math.min(100, nombre(src.progression, 0)) : 0,
      etoiles: src ? nombre(src.etoiles, 0) : 0,
    };
  });

  // Compétences
  profil.competences = {};
  for (const m of MODULES) {
    const src = estObjet(brut.competences) ? brut.competences[m.id] : null;
    const vide = base.competences[m.id];
    if (!estObjet(src)) {
      profil.competences[m.id] = { ...vide };
      continue;
    }
    profil.competences[m.id] = {
      essais: nombre(src.essais, 0),
      reussites: nombre(src.reussites, 0),
      score: nombre(src.score, 0),
      serie: nombre(src.serie, 0),
      meilleureSerie: nombre(src.meilleureSerie, 0),
      derniers: Array.isArray(src.derniers)
        ? src.derniers.filter((x) => typeof x === 'number').slice(-12)
        : [],
      niveauDifficulte: Math.min(3, Math.max(1, nombre(src.niveauDifficulte, 1, 1))),
      formats: estObjet(src.formats) ? src.formats : {},
      maitrise: Math.min(100, nombre(src.maitrise, 0)),
      etat: typeof src.etat === 'string' ? src.etat : 'nouvelle',
      secondes: nombre(src.secondes, 0),
    };
    if (profil.competences[m.id].reussites > profil.competences[m.id].essais) {
      profil.competences[m.id].reussites = profil.competences[m.id].essais;
      reparations.push(`compteurs incohérents corrigés pour ${m.id}`);
    }
  }

  profil.historique = Array.isArray(brut.historique)
    ? brut.historique
        .filter((h) => estObjet(h) && typeof h.id === 'string')
        .slice(-MAX_HISTORIQUE)
    : [];
  profil.revisions = Array.isArray(brut.revisions)
    ? brut.revisions.filter((r) => estObjet(r) && typeof r.exId === 'string')
    : [];
  profil.missions = estObjet(brut.missions)
    ? {
        terminees: nombre(brut.missions.terminees, 0),
        journal: Array.isArray(brut.missions.journal)
          ? brut.missions.journal.filter(estObjet).slice(-120)
          : [],
      }
    : { terminees: 0, journal: [] };

  profil.seance = estObjet(brut.seance) && Array.isArray(brut.seance.ids) ? brut.seance : null;
  if (brut.seance && !profil.seance) reparations.push('séance en cours illisible : repartie de zéro');

  profil.jours = {};
  if (estObjet(brut.jours)) {
    for (const [jour, v] of Object.entries(brut.jours)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(jour) || !estObjet(v)) continue;
      profil.jours[jour] = {
        secondes: nombre(v.secondes, 0),
        exercices: nombre(v.exercices, 0),
        justes: nombre(v.justes, 0),
      };
    }
  }

  profil.evaluation = estObjet(brut.evaluation)
    ? { fait: !!brut.evaluation.fait, resultats: estObjet(brut.evaluation.resultats) ? brut.evaluation.resultats : {} }
    : { fait: false, resultats: {} };

  profil.reglages = { ...base.reglages, ...(estObjet(brut.reglages) ? brut.reglages : {}) };
  profil.parent = estObjet(brut.parent)
    ? {
        code: typeof brut.parent.code === 'string' ? brut.parent.code : null,
        dernierAcces: typeof brut.parent.dernierAcces === 'string' ? brut.parent.dernierAcces : null,
      }
    : { code: null, dernierAcces: null };

  profil.serieJours = estObjet(brut.serieJours)
    ? {
        courant: nombre(brut.serieJours.courant, 0),
        record: nombre(brut.serieJours.record, 0),
        dernierJour: typeof brut.serieJours.dernierJour === 'string' ? brut.serieJours.dernierJour : null,
      }
    : { courant: 0, record: 0, dernierJour: null };

  if (brut.version !== VERSION) reparations.push(`sauvegarde migrée depuis la version ${brut.version ?? '?'}`);
  profil.version = VERSION;

  return { profil, reparations };
}

/* ------------------------------------------------------------------ */
/* Accès au stockage du navigateur (sans planter côté Node)            */
/* ------------------------------------------------------------------ */

function stockage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const test = '__thao_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return localStorage;
  } catch {
    return null;
  }
}

export function charger() {
  const ls = stockage();
  if (!ls) return { profil: profilVide(), reparations: [], disponible: false };
  let brut = null;
  try {
    const texte = ls.getItem(CLE);
    brut = texte ? JSON.parse(texte) : null;
  } catch {
    return {
      profil: profilVide(),
      reparations: ['sauvegarde abîmée : un nouveau profil a été créé'],
      disponible: true,
    };
  }
  const { profil, reparations } = valider(brut);
  return { profil, reparations, disponible: true, existait: !!brut };
}

export function sauver(profil) {
  const ls = stockage();
  if (!ls) return false;
  try {
    profil.maj = new Date().toISOString();
    ls.setItem(CLE, JSON.stringify(profil));
    return true;
  } catch {
    return false;
  }
}

export function effacer() {
  const ls = stockage();
  if (ls) ls.removeItem(CLE);
}

/* ------------------------------------------------------------------ */
/* Export / import                                                     */
/* ------------------------------------------------------------------ */

export function exporter(profil) {
  return JSON.stringify({ application: 'thao-aventure', version: VERSION, profil }, null, 2);
}

export function importer(texte) {
  let data;
  try {
    data = JSON.parse(texte);
  } catch {
    return { ok: false, erreur: 'Ce fichier n’est pas une sauvegarde Thao Aventure.' };
  }
  const brut = data && data.profil ? data.profil : data;
  if (!estObjet(brut)) return { ok: false, erreur: 'Le fichier ne contient pas de progression.' };
  const { profil, reparations } = valider(brut);
  return { ok: true, profil, reparations };
}

/* ------------------------------------------------------------------ */
/* Fusion de deux sauvegardes                                          */
/* ------------------------------------------------------------------ */

/**
 * Fusionne deux profils sans perte : on garde le meilleur de chaque compteur,
 * l'union des badges et des trésors, et l'historique le plus riche.
 * Une récompense gagnée ne peut jamais disparaître à cause d'une fusion.
 */
export function fusionner(a, b) {
  if (!a) return b;
  if (!b) return a;
  const out = valider(a).profil;
  const autre = valider(b).profil;
  const plusRecent = new Date(autre.maj) > new Date(out.maj) ? autre : out;

  out.prenom = plusRecent.prenom;
  out.xp = Math.max(out.xp, autre.xp);
  out.etoiles = Math.max(out.etoiles, autre.etoiles);
  out.niveau = Math.max(out.niveau, autre.niveau);
  out.coffresEnAttente = Math.max(out.coffresEnAttente, autre.coffresEnAttente);
  out.cree = out.cree < autre.cree ? out.cree : autre.cree;
  out.maj = plusRecent.maj;

  const parId = (liste) => new Map(liste.map((x) => [x.id, x]));
  out.badges = [...parId([...out.badges, ...autre.badges]).values()];
  out.tresors = [...parId([...out.tresors, ...autre.tresors]).values()];

  for (const id of Object.keys(out.mondes)) {
    const x = out.mondes[id];
    const y = autre.mondes[id] || x;
    out.mondes[id] = {
      debloque: x.debloque || y.debloque,
      termine: x.termine || y.termine,
      progression: Math.max(x.progression, y.progression),
      etoiles: Math.max(x.etoiles, y.etoiles),
    };
  }

  for (const id of Object.keys(out.competences)) {
    const x = out.competences[id];
    const y = autre.competences[id] || x;
    const riche = y.essais > x.essais ? y : x;
    out.competences[id] = {
      ...riche,
      essais: Math.max(x.essais, y.essais),
      reussites: Math.max(x.reussites, y.reussites),
      score: Math.max(x.score, y.score),
      meilleureSerie: Math.max(x.meilleureSerie, y.meilleureSerie),
      maitrise: Math.max(x.maitrise, y.maitrise),
      secondes: Math.max(x.secondes, y.secondes),
      niveauDifficulte: Math.max(x.niveauDifficulte, y.niveauDifficulte),
      formats: { ...x.formats, ...y.formats },
    };
  }

  const clefHist = (h) => `${h.id}|${h.date}`;
  const hist = new Map([...out.historique, ...autre.historique].map((h) => [clefHist(h), h]));
  out.historique = [...hist.values()]
    .sort((p, q) => String(p.date).localeCompare(String(q.date)))
    .slice(-MAX_HISTORIQUE);

  out.jours = { ...out.jours };
  for (const [jour, v] of Object.entries(autre.jours)) {
    const x = out.jours[jour];
    out.jours[jour] = x
      ? {
          secondes: Math.max(x.secondes, v.secondes),
          exercices: Math.max(x.exercices, v.exercices),
          justes: Math.max(x.justes, v.justes),
        }
      : v;
  }

  out.missions = {
    terminees: Math.max(out.missions.terminees, autre.missions.terminees),
    journal: [...out.missions.journal, ...autre.missions.journal]
      .filter((m, i, arr) => arr.findIndex((x) => x.date === m.date) === i)
      .slice(-120),
  };

  const revs = new Map([...out.revisions, ...autre.revisions].map((r) => [r.exId, r]));
  out.revisions = [...revs.values()];

  out.seance = plusRecent.seance;
  out.evaluation = out.evaluation.fait ? out.evaluation : autre.evaluation;
  out.reglages = plusRecent.reglages;
  out.parent = out.parent.code ? out.parent : autre.parent;
  out.serieJours = {
    courant: plusRecent.serieJours.courant,
    record: Math.max(out.serieJours.record, autre.serieJours.record),
    dernierJour: plusRecent.serieJours.dernierJour,
  };
  return out;
}

/** Enregistre le passage d'une journée (série de jours, temps passé). */
export function marquerJour(profil, secondes = 0, exercices = 0, justes = 0) {
  const jour = aujourdhui();
  const j = profil.jours[jour] || { secondes: 0, exercices: 0, justes: 0 };
  j.secondes += secondes;
  j.exercices += exercices;
  j.justes += justes;
  profil.jours[jour] = j;

  const s = profil.serieJours;
  if (s.dernierJour !== jour) {
    const hier = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.courant = s.dernierJour === hier ? s.courant + 1 : 1;
    s.dernierJour = jour;
    s.record = Math.max(s.record, s.courant);
  }
  return profil;
}
