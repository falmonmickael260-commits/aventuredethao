import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  cleAlpha, compareAlpha, estEntre, estTrieAlpha, premiereDifference, trierAlpha,
} from '../src/core/alphabet.js';
import { GROUPES_ALPHA, PAIRES, RESERVOIR_ALPHA } from '../data/corpus/lexique.js';
import { PAR_MODULE } from '../data/bank/index.js';

describe('Ordre alphabétique', () => {
  test('exemple du cahier des charges', () => {
    assert.deepEqual(
      trierAlpha(['Pomme', 'Avion', 'Maison', 'Bateau']),
      ['Avion', 'Bateau', 'Maison', 'Pomme'],
    );
  });

  test('on compare lettre par lettre', () => {
    assert.deepEqual(trierAlpha(['chien', 'chat', 'chaud', 'cheval']), ['chat', 'chaud', 'cheval', 'chien']);
    assert.ok(compareAlpha('chat', 'chaud') < 0, 't vient avant u');
    assert.ok(compareAlpha('cheval', 'chien') < 0, 'e vient avant i');
  });

  test('le mot le plus court passe avant celui qui le prolonge', () => {
    assert.deepEqual(trierAlpha(['merle', 'mercredi', 'merci', 'mer']), ['mer', 'merci', 'mercredi', 'merle']);
    assert.deepEqual(trierAlpha(['table', 'tableau']), ['table', 'tableau']);
  });

  test('les accents et les majuscules ne changent pas le rangement', () => {
    assert.equal(cleAlpha('École'), 'ecole');
    assert.equal(cleAlpha('cœur'), 'coeur');
    assert.equal(cleAlpha('grand-père'), 'grandpere');
    assert.deepEqual(trierAlpha(['étoile', 'escargot', 'école', 'elle']), ['école', 'elle', 'escargot', 'étoile']);
    assert.equal(compareAlpha('eleve', 'élève'), 0);
  });

  test('le rang de la première différence', () => {
    assert.equal(premiereDifference('chat', 'chien'), 3);
    assert.equal(premiereDifference('chat', 'chaud'), 4);
    assert.equal(premiereDifference('mer', 'merci'), 4);
    assert.equal(premiereDifference('avion', 'bateau'), 1);
  });

  test('estEntre encadre bien un mot (bornes incluses)', () => {
    assert.equal(estEntre('maman', 'maison', 'manteau'), true);
    assert.equal(estEntre('malade', 'maison', 'manteau'), true);
    assert.equal(estEntre('maison', 'maison', 'manteau'), true);
    assert.equal(estEntre('manteau', 'maison', 'manteau'), true);
    assert.equal(estEntre('magie', 'maison', 'manteau'), false);
    assert.equal(estEntre('marché', 'maison', 'manteau'), false);
  });

  test('estTrieAlpha détecte une liste mal rangée', () => {
    assert.equal(estTrieAlpha(['abri', 'bulle', 'cerise']), true);
    assert.equal(estTrieAlpha(['bulle', 'abri']), false);
  });
});

describe('Le corpus alphabétique est cohérent', () => {
  test('le réservoir de mots est rangé', () => {
    assert.equal(estTrieAlpha(RESERVOIR_ALPHA), true);
    assert.equal(new Set(RESERVOIR_ALPHA).size, RESERVOIR_ALPHA.length, 'mot en double');
  });

  test('chaque groupe annonce le bon rang de comparaison', () => {
    for (const g of GROUPES_ALPHA) {
      assert.equal(estTrieAlpha(g.solution), true, `${g.id} : solution mal rangée`);
      let rang = 1;
      for (let i = 1; i < g.solution.length; i++) {
        rang = Math.max(rang, premiereDifference(g.solution[i - 1], g.solution[i]));
      }
      assert.equal(g.rang, rang, `${g.id} : rang annoncé ${g.rang}, réel ${rang}`);
      assert.equal(new Set(g.mots).size, g.mots.length, `${g.id} : mot en double`);
    }
  });

  test('chaque paire indique bien quel mot vient avant', () => {
    for (const p of PAIRES) {
      assert.equal(trierAlpha([p.a, p.b])[0], p.premier, p.id);
      assert.ok(compareAlpha(p.premier, p.second) < 0, p.id);
    }
  });
});

describe('Les exercices d’ordre alphabétique sont justes', () => {
  test('toutes les solutions sont réellement dans l’ordre alphabétique', () => {
    for (const e of PAR_MODULE.m8.filter((x) => x.type === 'ordre')) {
      assert.equal(estTrieAlpha(e.reponse.ordre), true, `${e.id} : ${e.reponse.ordre.join(',')}`);
    }
    for (const e of PAR_MODULE.m9.filter((x) => x.type === 'ordre')) {
      assert.equal(estTrieAlpha(e.reponse.ordre), true, `${e.id} : ${e.reponse.ordre.join(',')}`);
    }
  });

  test('les listes écrites attendent les mots dans l’ordre', () => {
    for (const e of PAR_MODULE.m8.filter((x) => x.format === 'ecris-liste')) {
      const attendus = e.reponse.champs.map((c) => c.attendus[0]);
      assert.equal(estTrieAlpha(attendus), true, `${e.id}`);
      assert.deepEqual([...attendus].sort(), [...e.question.mots].sort(), `${e.id} : mots différents`);
    }
  });

  test('« où placer ce mot » tombe toujours sur la bonne case', () => {
    for (const e of PAR_MODULE.m8.filter((x) => x.format === 'avant-apres')) {
      const complet = trierAlpha([...e.question.liste, e.question.mot]);
      assert.equal(complet.indexOf(e.question.mot), e.reponse.index, `${e.id}`);
      assert.equal(estTrieAlpha(e.question.liste), true, `${e.id} : liste de départ mal rangée`);
    }
  });

  test('« lequel vient avant » désigne bien le premier mot', () => {
    for (const e of PAR_MODULE.m8.filter((x) => x.format === 'compare')) {
      const bon = e.question.options[e.reponse.index];
      const autre = e.question.options.find((o) => o !== bon);
      assert.ok(compareAlpha(bon, autre) < 0, `${e.id} : ${bon} / ${autre}`);
    }
  });
});
