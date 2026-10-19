import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { corriger } from '../src/core/correction.js';
import { comparer, mots, normaliser, sansAccents } from '../src/core/normalisation.js';

const ex = (def) => ({ id: 't', module: 'm0', competence: 'm0', format: 'f', difficulte: 1, ...def });

describe('Normalisation des saisies', () => {
  test('les espaces et la casse sont pardonnés', () => {
    assert.equal(normaliser('  Le  Chat '), 'le chat');
    assert.equal(comparer('  JOUAIS ', ['jouais']).juste, true);
  });

  test('l’apostrophe droite et l’apostrophe courbe sont équivalentes', () => {
    assert.equal(comparer("j'étais", ['j’étais']).juste, true);
    assert.equal(comparer('j’étais', ["j'étais"]).juste, true);
  });

  test('le point final est pardonné, sauf si on le demande', () => {
    assert.equal(comparer('des chats.', ['des chats']).juste, true);
    assert.equal(comparer('des chats.', ['des chats'], { ponctuation: true }).juste, false);
  });

  test('la majuscule compte quand on l’exige (noms propres)', () => {
    assert.equal(comparer('paris', ['Paris'], { casse: true }).juste, false);
    assert.equal(comparer('Paris', ['Paris'], { casse: true }).juste, true);
  });

  test('un accent manquant est repéré comme « presque »', () => {
    const r = comparer('etais', ['étais']);
    assert.equal(r.juste, false);
    assert.equal(r.accents, true);
    assert.equal(r.forme, 'étais');
  });

  test('une vraie faute n’est jamais prise pour un accent', () => {
    assert.deepEqual(comparer('était', ['étiez']), { juste: false, accents: false, forme: null });
  });

  test('le découpage en mots gère l’apostrophe, le trait d’union et œ', () => {
    assert.deepEqual(mots("L'ogre dévore ma sœur et mon grand-père !"), [
      'l', 'ogre', 'dévore', 'ma', 'sœur', 'et', 'mon', 'grand-père',
    ]);
    assert.equal(sansAccents('cœur élève'), 'coeur eleve');
  });
});

describe('Clic sur les mots', () => {
  const e = ex({
    type: 'clic-mots',
    question: { tokens: [{ w: 'Le' }, { w: 'chat' }, { w: 'dort' }, { w: 'ici' }] },
    reponse: { indices: [1, 3] },
  });

  test('tout juste', () => assert.equal(corriger(e, [1, 3]).statut, 'juste'));
  test('l’ordre des clics n’a pas d’importance', () => assert.equal(corriger(e, [3, 1]).statut, 'juste'));
  test('un mot oublié → presque', () => {
    const r = corriger(e, [1]);
    assert.equal(r.statut, 'presque');
    assert.deepEqual(r.detail.manques, [3]);
  });
  test('un mot en trop → faux, et on nomme le mot', () => {
    const r = corriger(e, [1, 2, 3]);
    assert.equal(r.statut, 'faux');
    assert.ok(r.message.includes('dort'));
  });
  test('rien de cliqué → ne compte pas', () => assert.equal(corriger(e, []).vide, true));
});

describe('Réponses à choix', () => {
  const e = ex({ type: 'choix', question: { options: ['a', 'b', 'c'] }, reponse: { index: 1 } });
  test('bon choix', () => assert.equal(corriger(e, 1).statut, 'juste'));
  test('mauvais choix', () => assert.equal(corriger(e, 0).statut, 'faux'));
  test('aucun choix', () => assert.equal(corriger(e, null).vide, true));

  const vf = ex({ type: 'vrai-faux', reponse: { valeur: true } });
  test('vrai / faux', () => {
    assert.equal(corriger(vf, true).statut, 'juste');
    assert.equal(corriger(vf, false).statut, 'faux');
    assert.equal(corriger(vf, null).vide, true);
  });
});

describe('Plusieurs cases à remplir', () => {
  const e = ex({
    type: 'textes',
    question: { champs: [{ cle: 'a' }, { cle: 'b' }, { cle: 'c' }] },
    reponse: {
      champs: [
        { cle: 'a', attendus: ['étais'] },
        { cle: 'b', attendus: ['étions'] },
        { cle: 'c', attendus: ['étaient'] },
      ],
    },
  });

  test('tout juste', () => {
    assert.equal(corriger(e, { a: 'étais', b: 'étions', c: 'étaient' }).statut, 'juste');
  });

  test('deux sur trois → presque, et on dit combien', () => {
    const r = corriger(e, { a: 'étais', b: 'étions', c: 'étais' });
    assert.equal(r.statut, 'presque');
    assert.ok(r.message.includes('2 cases sur 3'));
    assert.equal(r.detail.find((d) => d.cle === 'c').statut, 'faux');
  });

  test('tout faux → faux', () => {
    assert.equal(corriger(e, { a: 'x', b: 'y', c: 'z' }).statut, 'faux');
  });

  test('seuls les accents manquent → presque', () => {
    const r = corriger(e, { a: 'etais', b: 'etions', c: 'etaient' });
    assert.equal(r.statut, 'presque');
    assert.equal(r.accents, true);
  });

  test('une case laissée vide est signalée, pas acceptée', () => {
    const r = corriger(e, { a: 'étais', b: '', c: 'étaient' });
    assert.equal(r.statut, 'presque');
    assert.equal(r.detail.find((d) => d.cle === 'b').statut, 'vide');
  });
});

describe('Tri en colonnes, remise en ordre et paires', () => {
  const col = ex({
    type: 'colonnes',
    question: { mots: ['chat', 'le', 'une'], colonnes: [{ id: 'n' }, { id: 'd' }] },
    reponse: { placement: { chat: 'n', le: 'd', une: 'd' } },
  });
  test('tout bien rangé', () => assert.equal(corriger(col, { chat: 'n', le: 'd', une: 'd' }).statut, 'juste'));
  test('un mot pas encore placé', () => {
    const r = corriger(col, { chat: 'n', le: 'd' });
    assert.equal(r.statut, 'presque');
    assert.ok(r.message.includes('1 mot'));
  });
  test('un mot mal placé → on le voit dans le détail', () => {
    const r = corriger(col, { chat: 'd', le: 'd', une: 'd' });
    assert.equal(r.statut, 'presque');
    assert.equal(r.detail.find((d) => d.mot === 'chat').statut, 'faux');
  });

  const ord = ex({ type: 'ordre', question: { mots: [] }, reponse: { ordre: ['a', 'b', 'c', 'd'] } });
  test('ordre exact', () => assert.equal(corriger(ord, ['a', 'b', 'c', 'd']).statut, 'juste'));
  test('deux voisins inversés → on propose l’échange', () => {
    const r = corriger(ord, ['a', 'c', 'b', 'd']);
    assert.equal(r.statut, 'presque');
    assert.ok(r.message.includes('échanger'));
  });
  test('ordre complètement inversé → faux', () => {
    assert.equal(corriger(ord, ['d', 'c', 'b', 'a']).statut, 'faux');
  });

  const pa = ex({
    type: 'paires',
    question: { gauche: [{ id: 'g1' }, { id: 'g2' }], droite: [{ id: 'd1' }, { id: 'd2' }] },
    reponse: { paires: { g1: 'd1', g2: 'd2' } },
  });
  test('paires justes', () => assert.equal(corriger(pa, { g1: 'd1', g2: 'd2' }).statut, 'juste'));
  test('paires croisées', () => assert.notEqual(corriger(pa, { g1: 'd2', g2: 'd1' }).statut, 'juste'));
});

describe('Couper une phrase', () => {
  const e = ex({
    type: 'coupe-phrase',
    question: { tokens: [{ w: 'Le' }, { w: 'chat' }, { w: 'dort' }] },
    reponse: { coupe: 2 },
  });
  test('au bon endroit', () => assert.equal(corriger(e, 2).statut, 'juste'));
  test('trop tôt → on indique le sens', () => {
    const r = corriger(e, 1);
    assert.equal(r.statut, 'faux');
    assert.ok(r.message.includes('plus loin'));
  });
  test('trop tard', () => assert.ok(corriger(e, 3).message.includes('avant')));
});

describe('Réponses libres vérifiées par des règles', () => {
  const e = ex({
    type: 'phrase',
    reponse: {
      regles: [
        { type: 'contient', mots: ['jouions'], message: 'Il manque le verbe « jouions ».' },
        { type: 'interdit', mots: ['jouons'], message: '« jouons » est au présent.' },
        { type: 'majuscule', message: 'Majuscule au début.' },
        { type: 'point', message: 'Point à la fin.' },
        { type: 'minMots', n: 3, message: 'Écris une phrase complète.' },
      ],
      solution: 'Avant, nous jouions dehors.',
    },
  });

  test('la solution modèle est acceptée', () => assert.equal(corriger(e, e.reponse.solution).statut, 'juste'));

  test('le présent est refusé, même avec la bonne forme ailleurs', () => {
    const r = corriger(e, 'Avant, nous jouons et nous jouions dehors.');
    assert.equal(r.statut, 'faux');
    assert.ok(r.message.includes('présent'));
  });

  test('majuscule ou point oubliés → presque (la grammaire est juste)', () => {
    const r = corriger(e, 'avant, nous jouions dehors');
    assert.equal(r.statut, 'presque');
    assert.equal(r.detail.length, 2);
  });

  test('un mot à moitié écrit ne passe pas', () => {
    assert.equal(corriger(e, 'Avant, nous jouion dehors.').statut, 'faux');
  });

  test('règle « un mot unique » et « pas dans la liste »', () => {
    const p = ex({
      type: 'phrase',
      reponse: {
        regles: [
          { type: 'motUnique', message: 'Un seul mot.' },
          { type: 'majuscule', message: 'Majuscule obligatoire.' },
          { type: 'pasDansListe', mots: ['chien', 'chat'], message: 'C’est un nom commun.' },
          { type: 'minLettres', n: 3, message: 'Trop court.' },
        ],
        solution: 'Lyon',
      },
    });
    assert.equal(corriger(p, 'Lyon').statut, 'juste');
    assert.equal(corriger(p, 'lyon').statut, 'presque');
    assert.equal(corriger(p, 'Chien').statut, 'faux');
    assert.equal(corriger(p, 'Lyon et Paris').statut, 'faux');
    assert.equal(corriger(p, 'Ly').statut, 'faux');
  });

  test('règle « ordre » : le sujet avant le verbe', () => {
    const p = ex({
      type: 'phrase',
      reponse: {
        regles: [{ type: 'ordre', avant: 'dragon', apres: 'vole', message: 'Le sujet d’abord.' }],
        solution: 'Le dragon vole.',
      },
    });
    assert.equal(corriger(p, 'Le dragon vole haut.').statut, 'juste');
    assert.equal(corriger(p, 'Vole le dragon.').statut, 'faux');
  });
});

describe('Garde-fous', () => {
  test('un type inconnu lève une erreur explicite', () => {
    assert.throws(() => corriger(ex({ type: 'inconnu', reponse: {} }), 1), /Type d'exercice inconnu/);
  });
  test('une règle inconnue lève une erreur explicite', () => {
    assert.throws(
      () => corriger(ex({ type: 'phrase', reponse: { regles: [{ type: 'zzz', message: 'x' }] } }), 'test'),
      /Règle inconnue/,
    );
  });
  test('le score suit le statut', () => {
    const e = ex({ type: 'vrai-faux', reponse: { valeur: true } });
    assert.equal(corriger(e, true).score, 1);
    assert.equal(corriger(e, false).score, 0);
  });
});
