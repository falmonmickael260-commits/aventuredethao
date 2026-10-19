import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { DEFINITIONS, MOTS_DICO, pagesDico, pageDuMot } from '../data/corpus/dictionnaire.js';
import { compareAlpha, estEntre, estTrieAlpha } from '../src/core/alphabet.js';
import { PAR_MODULE } from '../data/bank/index.js';

const PAGES = pagesDico(6);

describe('Le dictionnaire est cohérent', () => {
  test('la liste des mots est rangée et sans doublon', () => {
    assert.equal(estTrieAlpha(MOTS_DICO), true);
    assert.equal(new Set(MOTS_DICO).size, MOTS_DICO.length);
    assert.ok(MOTS_DICO.length >= 150, `seulement ${MOTS_DICO.length} mots`);
  });

  test('chaque mot a une définition et une nature', () => {
    for (const mot of MOTS_DICO) {
      const d = DEFINITIONS[mot];
      assert.ok(d, `pas de définition pour ${mot}`);
      assert.ok(d.def.length > 12, `définition trop courte pour ${mot}`);
      assert.ok(['nom', 'verbe', 'adjectif'].includes(d.nature), `nature inconnue pour ${mot}`);
      assert.ok(/[.!?]$/.test(d.def), `la définition de ${mot} ne finit pas par un point`);
    }
  });

  test('les mots repères encadrent exactement les mots de leur page', () => {
    for (const page of PAGES) {
      assert.equal(page.repereGauche, page.mots[0]);
      assert.equal(page.repereDroit, page.mots[page.mots.length - 1]);
      assert.ok(compareAlpha(page.repereGauche, page.repereDroit) <= 0, `page ${page.numero}`);
      for (const mot of page.mots) {
        assert.equal(estEntre(mot, page.repereGauche, page.repereDroit), true, `${mot} / page ${page.numero}`);
      }
    }
  });

  test('les pages se suivent sans trou ni chevauchement', () => {
    const concat = PAGES.flatMap((p) => p.mots);
    assert.deepEqual(concat, MOTS_DICO);
    for (let i = 1; i < PAGES.length; i++) {
      assert.ok(
        compareAlpha(PAGES[i - 1].repereDroit, PAGES[i].repereGauche) < 0,
        `pages ${i} et ${i + 1} se chevauchent`,
      );
    }
    assert.ok(PAGES.every((p) => p.mots.length >= 2));
  });

  test('pageDuMot trouve la page de chaque mot', () => {
    for (const mot of MOTS_DICO) {
      const page = pageDuMot(mot, PAGES);
      assert.ok(page, `page introuvable pour ${mot}`);
      assert.ok(page.mots.includes(mot), `${mot} n'est pas sur la page ${page.numero}`);
    }
  });

  test('un mot absent du dictionnaire ne renvoie aucune page… sauf s’il s’y rangerait', () => {
    const page = pageDuMot('zzzzzz', PAGES);
    assert.equal(page, null);
  });
});

describe('Les exercices de dictionnaire disent vrai', () => {
  test('« le mot est-il sur cette page ? » a toujours la bonne réponse', () => {
    for (const e of PAR_MODULE.m9.filter((x) => x.format === 'entre-reperes')) {
      const { repereGauche, repereDroit } = e.question.page;
      const mot = /« ([^»]+) » se trouve/.exec(e.question.affirmation)[1];
      assert.equal(
        estEntre(mot, repereGauche, repereDroit),
        e.reponse.valeur,
        `${e.id} : ${mot} entre ${repereGauche} et ${repereDroit}`,
      );
    }
  });

  test('« choisis la bonne page » désigne la page qui contient le mot', () => {
    for (const e of PAR_MODULE.m9.filter((x) => x.format === 'choisis-page')) {
      const bonne = e.question.pages[e.reponse.index];
      assert.equal(estEntre(e.question.mot, bonne.repereGauche, bonne.repereDroit), true, `${e.id}`);
      e.question.pages.forEach((p, i) => {
        if (i === e.reponse.index) return;
        assert.equal(
          estEntre(e.question.mot, p.repereGauche, p.repereDroit),
          false,
          `${e.id} : deux pages possibles pour « ${e.question.mot} »`,
        );
      });
    }
  });

  test('les pages affichées sont rangées et complètes', () => {
    for (const e of PAR_MODULE.m9.filter((x) => x.format === 'trouve-dans-page')) {
      const p = e.question.pageComplete;
      const mots = p.entrees.map((x) => x.mot);
      assert.equal(estTrieAlpha(mots), true, `${e.id}`);
      assert.equal(p.repereGauche, mots[0]);
      assert.equal(p.repereDroit, mots[mots.length - 1]);
      for (const entree of p.entrees) {
        assert.ok(entree.def.length > 5, `${e.id} : ${entree.mot} sans définition`);
      }
      const bon = e.question.options[e.reponse.index];
      assert.equal(
        p.entrees.find((x) => x.mot === bon).def,
        e.question.definition,
        `${e.id} : la définition ne correspond pas au mot attendu`,
      );
      const memeDef = p.entrees.filter((x) => x.def === e.question.definition);
      assert.equal(memeDef.length, 1, `${e.id} : deux mots ont la même définition`);
    }
  });

  test('le coffre demande les vrais numéros de page', () => {
    for (const e of PAR_MODULE.m9.filter((x) => x.format === 'coffre')) {
      for (const champ of e.reponse.champs) {
        const attendu = pageDuMot(champ.etiquette, PAGES);
        assert.equal(String(attendu.numero), champ.attendus[0], `${e.id} / ${champ.etiquette}`);
      }
    }
  });

  test('le mot mystère correspond bien à sa définition et à sa page', () => {
    for (const e of PAR_MODULE.m9.filter((x) => x.format === 'indices')) {
      const mot = e.reponse.attendus[0];
      assert.ok(DEFINITIONS[mot], `${e.id}`);
      assert.ok(e.question.indices[0].includes(DEFINITIONS[mot].def), `${e.id} : définition`);
      const repere = /« ([^»]+) » et « ([^»]+) »/.exec(e.question.indices[1]);
      assert.equal(estEntre(mot, repere[1], repere[2]), true, `${e.id} : page annoncée fausse`);
      assert.ok(e.question.indices[2].includes(String(mot.length)), `${e.id} : nombre de lettres`);
    }
  });
});
