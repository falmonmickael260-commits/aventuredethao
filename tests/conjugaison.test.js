import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  imparfait,
  imparfaitAvecSujet,
  PERSONNES,
  presentNous,
  presentVous,
  radicalImparfait,
  tableauImparfait,
} from '../src/core/conjugaison.js';
import { PHRASES } from '../data/corpus/phrases.js';
import { PAR_MODULE } from '../data/bank/index.js';
import { corriger } from '../src/core/correction.js';

/**
 * Table de référence vérifiée à la main, dans l'ordre
 * je / tu / il / nous / vous / ils.
 */
const TABLE = {
  'être': ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  avoir: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  aller: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
  faire: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
  dire: ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient'],
  prendre: ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
  apprendre: ['apprenais', 'apprenais', 'apprenait', 'apprenions', 'appreniez', 'apprenaient'],
  venir: ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'],
  voir: ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient'],
  pouvoir: ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'],
  vouloir: ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient'],
  savoir: ['savais', 'savais', 'savait', 'savions', 'saviez', 'savaient'],
  devoir: ['devais', 'devais', 'devait', 'devions', 'deviez', 'devaient'],
  boire: ['buvais', 'buvais', 'buvait', 'buvions', 'buviez', 'buvaient'],
  lire: ['lisais', 'lisais', 'lisait', 'lisions', 'lisiez', 'lisaient'],
  'écrire': ['écrivais', 'écrivais', 'écrivait', 'écrivions', 'écriviez', 'écrivaient'],
  mettre: ['mettais', 'mettais', 'mettait', 'mettions', 'mettiez', 'mettaient'],
  courir: ['courais', 'courais', 'courait', 'courions', 'couriez', 'couraient'],
  dormir: ['dormais', 'dormais', 'dormait', 'dormions', 'dormiez', 'dormaient'],
  partir: ['partais', 'partais', 'partait', 'partions', 'partiez', 'partaient'],
  sortir: ['sortais', 'sortais', 'sortait', 'sortions', 'sortiez', 'sortaient'],
  ouvrir: ['ouvrais', 'ouvrais', 'ouvrait', 'ouvrions', 'ouvriez', 'ouvraient'],
  couvrir: ['couvrais', 'couvrais', 'couvrait', 'couvrions', 'couvriez', 'couvraient'],
  recouvrir: ['recouvrais', 'recouvrais', 'recouvrait', 'recouvrions', 'recouvriez', 'recouvraient'],
  finir: ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient'],
  grandir: ['grandissais', 'grandissais', 'grandissait', 'grandissions', 'grandissiez', 'grandissaient'],
  choisir: ['choisissais', 'choisissais', 'choisissait', 'choisissions', 'choisissiez', 'choisissaient'],
  jouer: ['jouais', 'jouais', 'jouait', 'jouions', 'jouiez', 'jouaient'],
  chanter: ['chantais', 'chantais', 'chantait', 'chantions', 'chantiez', 'chantaient'],
  danser: ['dansais', 'dansais', 'dansait', 'dansions', 'dansiez', 'dansaient'],
  manger: ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient'],
  ranger: ['rangeais', 'rangeais', 'rangeait', 'rangions', 'rangiez', 'rangeaient'],
  nager: ['nageais', 'nageais', 'nageait', 'nagions', 'nagiez', 'nageaient'],
  commencer: ['commençais', 'commençais', 'commençait', 'commencions', 'commenciez', 'commençaient'],
  crier: ['criais', 'criais', 'criait', 'criions', 'criiez', 'criaient'],
  plier: ['pliais', 'pliais', 'pliait', 'pliions', 'pliiez', 'pliaient'],
  nettoyer: ['nettoyais', 'nettoyais', 'nettoyait', 'nettoyions', 'nettoyiez', 'nettoyaient'],
  rire: ['riais', 'riais', 'riait', 'riions', 'riiez', 'riaient'],
  conduire: ['conduisais', 'conduisais', 'conduisait', 'conduisions', 'conduisiez', 'conduisaient'],
  construire: ['construisais', 'construisais', 'construisait', 'construisions', 'construisiez', 'construisaient'],
  'éteindre': ['éteignais', 'éteignais', 'éteignait', 'éteignions', 'éteigniez', 'éteignaient'],
  repeindre: ['repeignais', 'repeignais', 'repeignait', 'repeignions', 'repeigniez', 'repeignaient'],
  'disparaître': ['disparaissais', 'disparaissais', 'disparaissait', 'disparaissions', 'disparaissiez', 'disparaissaient'],
  descendre: ['descendais', 'descendais', 'descendait', 'descendions', 'descendiez', 'descendaient'],
  'défendre': ['défendais', 'défendais', 'défendait', 'défendions', 'défendiez', 'défendaient'],
  photographier: ['photographiais', 'photographiais', 'photographiait', 'photographiions', 'photographiiez', 'photographiaient'],
};

const IDS = PERSONNES.map((p) => p.id);

describe('Imparfait de l’indicatif', () => {
  test('les 46 verbes de référence sont conjugués exactement', () => {
    for (const [inf, formes] of Object.entries(TABLE)) {
      IDS.forEach((personne, i) => {
        assert.equal(
          imparfait(inf, personne),
          formes[i],
          `${inf} / ${personne} : obtenu « ${imparfait(inf, personne)} », attendu « ${formes[i]} »`,
        );
      });
    }
  });

  test('toutes les terminaisons sont celles de l’imparfait', () => {
    const fins = { je: 'ais', tu: 'ais', il: 'ait', nous: 'ions', vous: 'iez', ils: 'aient' };
    for (const inf of Object.keys(TABLE)) {
      for (const p of IDS) {
        assert.ok(imparfait(inf, p).endsWith(fins[p]), `${inf}/${p}`);
      }
    }
  });

  test('« je » devient « j’ » devant une voyelle', () => {
    assert.equal(imparfaitAvecSujet('être', 'je'), 'j’étais');
    assert.equal(imparfaitAvecSujet('avoir', 'je'), 'j’avais');
    assert.equal(imparfaitAvecSujet('aller', 'je'), 'j’allais');
    assert.equal(imparfaitAvecSujet('écrire', 'je'), 'j’écrivais');
    assert.equal(imparfaitAvecSujet('éteindre', 'je'), 'j’éteignais');
    assert.equal(imparfaitAvecSujet('jouer', 'je'), 'je jouais');
    assert.equal(imparfaitAvecSujet('manger', 'je'), 'je mangeais');
  });

  test('le « e » des verbes en -ger et la cédille des verbes en -cer', () => {
    assert.equal(imparfait('manger', 'je'), 'mangeais');
    assert.equal(imparfait('manger', 'nous'), 'mangions');
    assert.equal(imparfait('commencer', 'ils'), 'commençaient');
    assert.equal(imparfait('commencer', 'vous'), 'commenciez');
  });

  test('le double i des verbes en -ier et -yer', () => {
    assert.equal(imparfait('crier', 'nous'), 'criions');
    assert.equal(imparfait('plier', 'vous'), 'pliiez');
    assert.equal(imparfait('voir', 'nous'), 'voyions');
    assert.equal(imparfait('nettoyer', 'vous'), 'nettoyiez');
  });

  test('le tableau complet contient six formes différentes', () => {
    const t = tableauImparfait('chanter');
    assert.equal(t.length, 6);
    assert.equal(new Set(t.map((x) => x.forme)).size, 5); // je et tu sont identiques
    assert.equal(t[0].complet, 'je chantais');
    assert.equal(t[5].complet, 'ils chantaient');
  });

  test('tous les verbes du corpus de phrases sont conjugables', () => {
    for (const p of PHRASES) {
      assert.doesNotThrow(
        () => radicalImparfait(p.infinitif),
        `radical introuvable pour « ${p.infinitif} » (${p.id})`,
      );
      for (const personne of IDS) {
        const f = imparfait(p.infinitif, personne);
        assert.ok(f.length > 3, `${p.infinitif}/${personne} → « ${f} »`);
      }
    }
  });
});

describe('Présent, pour les transformations', () => {
  test('« nous » au présent', () => {
    const attendu = {
      jouer: 'nous jouons', manger: 'nous mangeons', commencer: 'nous commençons',
      'être': 'nous sommes', avoir: 'nous avons', aller: 'nous allons', faire: 'nous faisons',
      dire: 'nous disons', prendre: 'nous prenons', venir: 'nous venons', voir: 'nous voyons',
      finir: 'nous finissons', lire: 'nous lisons', 'écrire': 'nous écrivons',
    };
    for (const [inf, forme] of Object.entries(attendu)) {
      assert.equal(`nous ${presentNous(inf)}`, forme, inf);
    }
  });

  test('« vous » au présent, avec ses trois exceptions', () => {
    const attendu = {
      jouer: 'vous jouez', 'être': 'vous êtes', faire: 'vous faites', dire: 'vous dites',
      avoir: 'vous avez', aller: 'vous allez', prendre: 'vous prenez', voir: 'vous voyez',
      finir: 'vous finissez',
    };
    for (const [inf, forme] of Object.entries(attendu)) {
      assert.equal(`vous ${presentVous(inf)}`, forme, inf);
    }
  });
});

describe('Les exercices d’imparfait refusent les formes fausses', () => {
  const m6 = PAR_MODULE.m6;

  test('une forme d’une autre personne est refusée', () => {
    for (const e of m6.filter((x) => x.format === 'complete-imparfait')) {
      const bonnes = e.reponse.attendus.map((a) => a.toLowerCase());
      const fausses = IDS.map((p) => imparfait(e.question.verbe, p)).filter(
        (f) => !bonnes.includes(f.toLowerCase()) && !bonnes.some((b) => b.endsWith(f)),
      );
      assert.ok(fausses.length >= 2, `${e.id} : pas assez de formes fausses à tester`);
      for (const f of fausses) {
        const r = corriger(e, f);
        assert.notEqual(r.statut, 'juste', `${e.id} : « ${f} » accepté à tort`);
      }
    }
  });

  test('le présent est refusé là où l’imparfait est demandé', () => {
    for (const e of m6.filter((x) => x.format === 'transforme')) {
      const present = /nous (\S+)|vous (\S+)/.exec(e.question.depart);
      const forme = present ? (present[1] || present[2]) : null;
      assert.ok(forme, `${e.id} : forme du présent introuvable`);
      const r = corriger(e, e.question.depart.replace('Aujourd’hui', 'Avant'));
      assert.notEqual(r.statut, 'juste', `${e.id} : le présent a été accepté`);
    }
  });

  test('la forme fausse de départ reste refusée dans les exercices de correction', () => {
    for (const e of m6.filter((x) => x.format === 'corrige-imparfait')) {
      const r = corriger(e, e.question.faux);
      assert.notEqual(r.statut, 'juste', `${e.id} : la phrase fausse a été acceptée`);
    }
  });

  test('un tableau dont deux personnes sont échangées est refusé', () => {
    for (const e of m6.filter((x) => x.format === 'tableau')) {
      const saisie = Object.fromEntries(e.reponse.champs.map((c) => [c.cle, c.attendus[0]]));
      const a = e.reponse.champs[3].cle; // nous
      const b = e.reponse.champs[4].cle; // vous
      [saisie[a], saisie[b]] = [saisie[b], saisie[a]];
      const r = corriger(e, saisie);
      assert.notEqual(r.statut, 'juste', `${e.id} : tableau mélangé accepté`);
    }
  });

  test('les accents manquants donnent « presque », pas « juste »', () => {
    const e = m6.find((x) => x.format === 'tableau' && x.question.verbe === 'être');
    const saisie = Object.fromEntries(
      e.reponse.champs.map((c) => [c.cle, c.attendus[0].replace(/é/g, 'e').replace(/ê/g, 'e')]),
    );
    const r = corriger(e, saisie);
    assert.equal(r.statut, 'presque');
    assert.equal(r.accents, true);
  });
});
