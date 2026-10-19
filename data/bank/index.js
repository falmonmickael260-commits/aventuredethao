/**
 * La banque d'exercices complète.
 *
 * Elle est construite une seule fois, de façon déterministe : même ordre,
 * mêmes identifiants, mêmes réponses à chaque chargement. On peut donc
 * l'auditer entièrement (voir tests/banque.test.js).
 */

import { construireM1 } from './m1.js';
import { construireM2 } from './m2.js';
import { construireM3 } from './m3.js';
import { construireM4 } from './m4.js';
import { construireM5 } from './m5.js';
import { construireM6 } from './m6.js';
import { construireM7 } from './m7.js';
import { construireM8 } from './m8.js';
import { construireM9 } from './m9.js';
import { MODULES, MODULE_PAR_ID, MONDES } from '../modules.js';

const CONSTRUCTEURS = {
  m1: construireM1,
  m2: construireM2,
  m3: construireM3,
  m4: construireM4,
  m5: construireM5,
  m6: construireM6,
  m7: construireM7,
  m8: construireM8,
  m9: construireM9,
};

function construire() {
  const tous = [];
  for (const m of MODULES) {
    const lot = CONSTRUCTEURS[m.id]();
    if (lot.length < 50) {
      throw new Error(`Le module ${m.id} ne contient que ${lot.length} exercices (50 minimum).`);
    }
    tous.push(...lot);
  }
  const vus = new Set();
  for (const e of tous) {
    if (vus.has(e.id)) throw new Error(`Identifiant d'exercice en double : ${e.id}`);
    vus.add(e.id);
  }
  return tous;
}

export const BANQUE = construire();

export const PAR_ID = new Map(BANQUE.map((e) => [e.id, e]));

export const PAR_MODULE = (() => {
  const index = {};
  for (const e of BANQUE) {
    index[e.module] = index[e.module] || [];
    index[e.module].push(e);
  }
  return index;
})();

export const PAR_MONDE = (() => {
  const index = {};
  for (const w of MONDES) {
    index[w.id] = w.modules.flatMap((m) => PAR_MODULE[m] || []);
  }
  return index;
})();

export const FORMATS_PAR_MODULE = (() => {
  const index = {};
  for (const [mod, liste] of Object.entries(PAR_MODULE)) {
    index[mod] = [...new Set(liste.map((e) => e.format))];
  }
  return index;
})();

/** Statistiques de la banque, affichées dans l'espace parent. */
export function statsBanque() {
  const parModule = Object.fromEntries(
    Object.entries(PAR_MODULE).map(([k, v]) => [k, v.length]),
  );
  const parDifficulte = { 1: 0, 2: 0, 3: 0 };
  const parType = {};
  for (const e of BANQUE) {
    parDifficulte[e.difficulte] += 1;
    parType[e.type] = (parType[e.type] || 0) + 1;
  }
  return {
    total: BANQUE.length,
    modules: parModule,
    difficultes: parDifficulte,
    types: parType,
    formats: Object.values(FORMATS_PAR_MODULE).reduce((n, f) => n + f.length, 0),
  };
}

export function exerciceParId(id) {
  return PAR_ID.get(id) || null;
}

export function titreModule(id) {
  return MODULE_PAR_ID[id]?.titre || id;
}
