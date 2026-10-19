import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { BANQUE, PAR_MODULE, statsBanque } from '../data/bank/index.js';
import { corriger, TYPES_SUPPORTES } from '../src/core/correction.js';
import { MODULES } from '../data/modules.js';
import { reponseFausse, reponseJuste } from './aides.js';

describe('Taille et couverture de la banque', () => {
  test('au moins 450 exercices au total', () => {
    assert.ok(BANQUE.length >= 450, `seulement ${BANQUE.length} exercices`);
  });

  test('au moins 50 exercices par module', () => {
    for (const m of MODULES) {
      const n = (PAR_MODULE[m.id] || []).length;
      assert.ok(n >= 50, `${m.id} n'a que ${n} exercices`);
    }
  });

  test('chaque module propose au moins 5 formats différents', () => {
    for (const m of MODULES) {
      const formats = new Set((PAR_MODULE[m.id] || []).map((e) => e.format));
      assert.ok(formats.size >= 5, `${m.id} n'a que ${formats.size} formats`);
    }
  });

  test('les trois niveaux de difficulté sont représentés partout', () => {
    for (const m of MODULES) {
      const niveaux = new Set((PAR_MODULE[m.id] || []).map((e) => e.difficulte));
      assert.ok(niveaux.size >= 2, `${m.id} n'a que les difficultés ${[...niveaux]}`);
    }
    const s = statsBanque();
    for (const d of [1, 2, 3]) assert.ok(s.difficultes[d] >= 50, `difficulté ${d} : ${s.difficultes[d]}`);
  });

  test('chaque module a de quoi démarrer en douceur et de quoi se dépasser', () => {
    for (const m of MODULES) {
      const liste = PAR_MODULE[m.id] || [];
      const faciles = new Set(liste.filter((e) => e.difficulte === 1).map((e) => e.format));
      const durs = new Set(liste.filter((e) => e.difficulte === 3).map((e) => e.format));
      assert.ok(faciles.size >= 3, `${m.id} : seulement ${faciles.size} formats faciles (${[...faciles]})`);
      assert.ok(durs.size >= 2, `${m.id} : seulement ${durs.size} formats difficiles`);
    }
  });

  test('les identifiants sont uniques', () => {
    const vus = new Set();
    for (const e of BANQUE) {
      assert.ok(!vus.has(e.id), `identifiant en double : ${e.id}`);
      vus.add(e.id);
    }
  });

  test('la banque est déterministe (deux chargements identiques)', async () => {
    const autre = await import(`../data/bank/m1.js?v=${Date.now()}`);
    const a = autre.construireM1().map((e) => e.id).join(',');
    const b = PAR_MODULE.m1.map((e) => e.id).join(',');
    assert.equal(a, b);
  });
});

describe('Forme de chaque exercice', () => {
  test('tous les champs obligatoires sont remplis', () => {
    for (const e of BANQUE) {
      assert.ok(e.id, 'id manquant');
      assert.ok(TYPES_SUPPORTES.includes(e.type), `${e.id} : type inconnu ${e.type}`);
      assert.ok(e.competence, `${e.id} : compétence manquante`);
      assert.ok(e.format, `${e.id} : format manquant`);
      assert.ok([1, 2, 3].includes(e.difficulte), `${e.id} : difficulté ${e.difficulte}`);
      assert.ok(e.consigne && e.consigne.length > 10, `${e.id} : consigne trop courte`);
      assert.ok(e.indice && e.indice.length > 10, `${e.id} : indice manquant`);
      assert.ok(e.explication && e.explication.length > 5, `${e.id} : explication manquante`);
      assert.ok(e.recompense && e.recompense.xp > 0 && e.recompense.etoiles > 0, `${e.id} : récompense`);
    }
  });

  test('les exercices à choix ont des options distinctes et une bonne réponse valide', () => {
    for (const e of BANQUE.filter((x) => x.type === 'choix')) {
      const o = e.question.options;
      assert.ok(Array.isArray(o) && o.length >= 2, `${e.id} : options manquantes`);
      assert.equal(new Set(o).size, o.length, `${e.id} : options en double (${o})`);
      assert.ok(
        e.reponse.index >= 0 && e.reponse.index < o.length,
        `${e.id} : index de réponse hors limites`,
      );
    }
  });

  test('les clics portent sur des mots qui existent vraiment', () => {
    for (const e of BANQUE.filter((x) => x.type === 'clic-mots')) {
      const n = e.question.tokens.length;
      assert.ok(n > 0, `${e.id} : aucun mot`);
      assert.ok(e.reponse.indices.length > 0, `${e.id} : aucune bonne réponse`);
      for (const i of e.reponse.indices) {
        assert.ok(i >= 0 && i < n, `${e.id} : indice ${i} hors de la phrase`);
      }
      assert.ok(
        e.reponse.indices.length < n || e.format === 'detective',
        `${e.id} : tous les mots sont la réponse`,
      );
    }
  });

  test('les colonnes existent et reçoivent tous les mots', () => {
    for (const e of BANQUE.filter((x) => x.type === 'colonnes')) {
      const ids = e.question.colonnes.map((c) => c.id);
      assert.ok(ids.length >= 2, `${e.id} : il faut au moins deux colonnes`);
      const mots = e.question.mots;
      assert.equal(new Set(mots).size, mots.length, `${e.id} : mot en double`);
      for (const mot of mots) {
        assert.ok(e.reponse.placement[mot], `${e.id} : « ${mot} » sans colonne attendue`);
        assert.ok(ids.includes(e.reponse.placement[mot]), `${e.id} : colonne inconnue`);
      }
      assert.equal(Object.keys(e.reponse.placement).length, mots.length);
    }
  });

  test('les listes à ranger contiennent exactement les mots proposés', () => {
    for (const e of BANQUE.filter((x) => x.type === 'ordre')) {
      assert.deepEqual(
        [...e.question.mots].sort(),
        [...e.reponse.ordre].sort(),
        `${e.id} : les mots proposés ne correspondent pas à la solution`,
      );
      assert.notEqual(
        e.question.mots.join('|'),
        e.reponse.ordre.join('|'),
        `${e.id} : la liste est déjà rangée au départ`,
      );
    }
  });

  test('les paires relient chaque élément de gauche à un élément de droite', () => {
    for (const e of BANQUE.filter((x) => x.type === 'paires')) {
      const gauche = e.question.gauche.map((g) => g.id);
      const droite = e.question.droite.map((d) => d.id);
      assert.equal(gauche.length, droite.length, `${e.id} : colonnes déséquilibrées`);
      const cibles = new Set();
      for (const g of gauche) {
        const cible = e.reponse.paires[g];
        assert.ok(droite.includes(cible), `${e.id} : cible inconnue pour ${g}`);
        assert.ok(!cibles.has(cible), `${e.id} : deux fois la même cible`);
        cibles.add(cible);
      }
      const textes = e.question.droite.map((d) => d.texte);
      assert.equal(new Set(textes).size, textes.length, `${e.id} : réponses identiques à droite`);
    }
  });

  test('les réponses écrites attendent au moins une forme', () => {
    for (const e of BANQUE.filter((x) => x.type === 'texte')) {
      assert.ok(e.reponse.attendus.length >= 1, `${e.id} : aucune forme attendue`);
      for (const a of e.reponse.attendus) assert.ok(a && a.trim(), `${e.id} : forme vide`);
    }
    for (const e of BANQUE.filter((x) => x.type === 'textes')) {
      assert.ok(e.reponse.champs.length >= 2, `${e.id} : il faut plusieurs cases`);
      const cles = e.reponse.champs.map((c) => c.cle);
      assert.equal(new Set(cles).size, cles.length, `${e.id} : clé en double`);
      for (const c of e.reponse.champs) {
        assert.ok(c.attendus.length >= 1 && c.attendus[0].trim(), `${e.id} : case ${c.cle} sans réponse`);
      }
      const affichees = e.question.champs.map((c) => c.cle).sort();
      assert.deepEqual(affichees, [...cles].sort(), `${e.id} : cases affichées ≠ cases corrigées`);
    }
  });

  test('les champs de question qui doivent être des listes en sont vraiment', () => {
    // Un drapeau booléen portant le nom d'une liste casserait l'affichage.
    const LISTES = ['liste', 'mots', 'options', 'pages', 'champs', 'tokens',
      'indices', 'montres', 'parts', 'gauche', 'droite', 'entrees'];
    for (const e of BANQUE) {
      for (const cle of LISTES) {
        const v = e.question[cle];
        if (v === undefined) continue;
        assert.ok(Array.isArray(v), `${e.id} : question.${cle} devrait être une liste (reçu ${typeof v})`);
      }
    }
  });

  test('chaque exercice déclare ce qu’il faut pour être affiché', () => {
    const EXIGENCES = {
      'clic-mots': ['tokens'],
      'coupe-phrase': ['tokens'],
      choix: ['options'],
      'choix-multiple': ['options'],
      textes: ['champs'],
      colonnes: ['mots', 'colonnes'],
      ordre: ['mots'],
      paires: ['gauche', 'droite'],
    };
    for (const e of BANQUE) {
      for (const cle of EXIGENCES[e.type] || []) {
        assert.ok(
          Array.isArray(e.question[cle]) && e.question[cle].length,
          `${e.id} (${e.type}) : question.${cle} manquant`,
        );
      }
      if (e.type === 'vrai-faux') {
        assert.ok(e.question.affirmation, `${e.id} : pas d'affirmation à juger`);
      }
    }
  });

  test('les réponses libres ont des règles et une solution modèle', () => {
    for (const e of BANQUE.filter((x) => x.type === 'phrase')) {
      assert.ok(e.reponse.regles.length >= 1, `${e.id} : aucune règle de correction`);
      for (const r of e.reponse.regles) {
        assert.ok(r.message && r.message.length > 10, `${e.id} : règle ${r.type} sans message clair`);
      }
      assert.ok(e.reponse.solution, `${e.id} : pas de solution modèle`);
    }
  });
});

describe('Correction de TOUS les exercices de la banque', () => {
  test('la bonne réponse est acceptée pour chacun des 537 exercices', () => {
    const echecs = [];
    for (const e of BANQUE) {
      const r = corriger(e, reponseJuste(e));
      if (r.statut !== 'juste') echecs.push(`${e.id} (${e.type}) → ${r.statut} : ${r.message}`);
    }
    assert.deepEqual(echecs, [], `exercices dont la bonne réponse est refusée :\n${echecs.join('\n')}`);
  });

  test('une réponse fausse est refusée pour chacun des exercices', () => {
    const echecs = [];
    for (const e of BANQUE) {
      const r = corriger(e, reponseFausse(e));
      if (r.statut === 'juste') echecs.push(`${e.id} (${e.type}) : réponse fausse acceptée`);
    }
    assert.deepEqual(echecs, [], `exercices trop permissifs :\n${echecs.join('\n')}`);
  });

  test('une réponse vide ne compte jamais comme un essai', () => {
    const vides = { 'clic-mots': [], 'choix-multiple': [], choix: null, 'vrai-faux': null, texte: '  ', textes: {}, colonnes: {}, ordre: [], paires: {}, 'coupe-phrase': null, phrase: '' };
    for (const e of BANQUE) {
      const r = corriger(e, vides[e.type]);
      assert.equal(r.vide, true, `${e.id} : la réponse vide n'est pas signalée`);
      assert.equal(r.score, 0);
    }
  });

  test('toutes les formes acceptées d’une réponse écrite sont bien acceptées', () => {
    for (const e of BANQUE.filter((x) => x.type === 'texte')) {
      for (const forme of e.reponse.attendus) {
        const r = corriger(e, forme);
        assert.equal(r.statut, 'juste', `${e.id} : « ${forme} » devrait être acceptée`);
      }
    }
    for (const e of BANQUE.filter((x) => x.type === 'textes')) {
      for (const champ of e.reponse.champs) {
        for (const forme of champ.attendus) {
          const saisie = Object.fromEntries(
            e.reponse.champs.map((c) => [c.cle, c.cle === champ.cle ? forme : c.attendus[0]]),
          );
          const r = corriger(e, saisie);
          assert.equal(r.statut, 'juste', `${e.id}/${champ.cle} : « ${forme} » refusée`);
        }
      }
    }
  });
});
