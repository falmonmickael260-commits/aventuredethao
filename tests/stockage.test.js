import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  CLE, charger, effacer, exporter, fusionner, importer, marquerJour, profilVide, sauver, valider,
} from '../src/core/stockage.js';
import { MODULES, MONDES } from '../data/modules.js';

/** Faux localStorage, pour tester la sauvegarde hors navigateur. */
function installerLocalStorage() {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
    get length() { return data.size; },
  };
  return data;
}

describe('Profil neuf', () => {
  test('toutes les compétences et tous les mondes existent', () => {
    const p = profilVide();
    assert.equal(Object.keys(p.competences).length, MODULES.length);
    assert.equal(Object.keys(p.mondes).length, MONDES.length);
    assert.equal(p.prenom, 'Thao');
    assert.equal(p.xp, 0);
  });

  test('seul le premier monde est ouvert au départ', () => {
    const p = profilVide();
    assert.equal(p.mondes.w1.debloque, true);
    assert.equal(p.mondes.w2.debloque, false);
  });
});

describe('Réparation des sauvegardes abîmées', () => {
  test('une sauvegarde vide donne un profil neuf', () => {
    const { profil, reparations } = valider(null);
    assert.equal(profil.xp, 0);
    assert.ok(reparations.length >= 1);
  });

  test('les mauvais types sont remplacés par des valeurs sûres', () => {
    const { profil } = valider({ xp: 'beaucoup', etoiles: -5, niveau: 0, badges: 'non', historique: 42 });
    assert.equal(profil.xp, 0);
    assert.equal(profil.etoiles, 0);
    assert.equal(profil.niveau, 1);
    assert.deepEqual(profil.badges, []);
    assert.deepEqual(profil.historique, []);
  });

  test('les compteurs impossibles sont corrigés', () => {
    const { profil, reparations } = valider({ competences: { m1: { essais: 3, reussites: 99 } } });
    assert.equal(profil.competences.m1.reussites, 3);
    assert.ok(reparations.some((r) => r.includes('m1')));
  });

  test('les badges mal formés sont ignorés mais les bons sont gardés', () => {
    const { profil } = valider({ badges: [{ id: 'ok', date: 'x' }, 'bof', null, { pas: 'id' }] });
    assert.deepEqual(profil.badges.map((b) => b.id), ['ok']);
  });

  test('une séance illisible est abandonnée sans tout casser', () => {
    const { profil, reparations } = valider({ seance: { nimporte: 'quoi' } });
    assert.equal(profil.seance, null);
    assert.ok(reparations.some((r) => r.includes('séance')));
  });

  test('un monde déjà débloqué le reste', () => {
    const { profil } = valider({ mondes: { w3: { debloque: true, progression: 42 } } });
    assert.equal(profil.mondes.w3.debloque, true);
    assert.equal(profil.mondes.w3.progression, 42);
    assert.equal(profil.mondes.w1.debloque, true);
  });

  test('les clés de jours invalides sont écartées', () => {
    const { profil } = valider({ jours: { '2026-10-19': { secondes: 60, exercices: 2, justes: 2 }, 'hier': { secondes: 1 } } });
    assert.deepEqual(Object.keys(profil.jours), ['2026-10-19']);
  });
});

describe('Sauvegarde et rechargement', () => {
  beforeEach(() => { installerLocalStorage(); });

  test('on retrouve exactement ce qu’on a enregistré', () => {
    const p = profilVide();
    p.xp = 320;
    p.etoiles = 44;
    p.badges.push({ id: 'premiers-pas', date: '2026-10-19' });
    assert.equal(sauver(p), true);
    const { profil, existait } = charger();
    assert.equal(existait, true);
    assert.equal(profil.xp, 320);
    assert.equal(profil.etoiles, 44);
    assert.deepEqual(profil.badges.map((b) => b.id), ['premiers-pas']);
  });

  test('une sauvegarde corrompue ne fait pas planter l’application', () => {
    localStorage.setItem(CLE, '{ ceci n’est pas du JSON');
    const { profil, reparations } = charger();
    assert.equal(profil.xp, 0);
    assert.ok(reparations.length >= 1);
  });

  test('effacer repart de zéro', () => {
    const p = profilVide();
    p.xp = 10;
    sauver(p);
    effacer();
    assert.equal(charger().existait, false);
  });

  test('sans localStorage, l’application fonctionne quand même', () => {
    delete globalThis.localStorage;
    const { profil, disponible } = charger();
    assert.equal(disponible, false);
    assert.equal(profil.prenom, 'Thao');
    assert.equal(sauver(profil), false);
  });
});

describe('Export et import', () => {
  test('aller-retour sans perte', () => {
    const p = profilVide();
    p.xp = 777;
    p.tresors.push({ id: 'glouby', date: 'x' });
    const r = importer(exporter(p));
    assert.equal(r.ok, true);
    assert.equal(r.profil.xp, 777);
    assert.deepEqual(r.profil.tresors.map((t) => t.id), ['glouby']);
  });

  test('un fichier qui n’est pas du JSON est refusé poliment', () => {
    const r = importer('bonjour');
    assert.equal(r.ok, false);
    assert.ok(r.erreur.includes('sauvegarde'));
  });

  test('un JSON sans progression est refusé', () => {
    assert.equal(importer('"coucou"').ok, false);
  });

  test('un profil nu (sans enveloppe) est accepté', () => {
    const r = importer(JSON.stringify({ xp: 12 }));
    assert.equal(r.ok, true);
    assert.equal(r.profil.xp, 12);
  });
});

describe('Fusion de deux sauvegardes', () => {
  test('aucune récompense n’est perdue', () => {
    const a = profilVide();
    a.xp = 100; a.etoiles = 5; a.badges = [{ id: 'b1', date: '1' }]; a.tresors = [{ id: 't1', date: '1' }];
    a.maj = '2026-10-18T10:00:00.000Z';
    const b = profilVide();
    b.xp = 60; b.etoiles = 12; b.badges = [{ id: 'b2', date: '2' }]; b.tresors = [{ id: 't2', date: '2' }];
    b.maj = '2026-10-19T10:00:00.000Z';
    const f = fusionner(a, b);
    assert.equal(f.xp, 100);
    assert.equal(f.etoiles, 12);
    assert.deepEqual(f.badges.map((x) => x.id).sort(), ['b1', 'b2']);
    assert.deepEqual(f.tresors.map((x) => x.id).sort(), ['t1', 't2']);
  });

  test('un monde débloqué d’un côté reste débloqué', () => {
    const a = profilVide();
    const b = profilVide();
    b.mondes.w4.debloque = true;
    b.mondes.w4.progression = 70;
    const f = fusionner(a, b);
    assert.equal(f.mondes.w4.debloque, true);
    assert.equal(f.mondes.w4.progression, 70);
  });

  test('on garde la compétence la mieux travaillée', () => {
    const a = profilVide();
    a.competences.m1 = { ...a.competences.m1, essais: 10, reussites: 8, maitrise: 70, formats: { x: { essais: 2, reussites: 2 } } };
    const b = profilVide();
    b.competences.m1 = { ...b.competences.m1, essais: 3, reussites: 1, maitrise: 20, formats: { y: { essais: 1, reussites: 0 } } };
    const f = fusionner(a, b);
    assert.equal(f.competences.m1.essais, 10);
    assert.equal(f.competences.m1.maitrise, 70);
    assert.deepEqual(Object.keys(f.competences.m1.formats).sort(), ['x', 'y']);
  });

  test('l’historique est réuni sans doublon', () => {
    const a = profilVide();
    a.historique = [{ id: 'e1', date: '2026-10-18T10:00:00.000Z', statut: 'juste' }];
    const b = profilVide();
    b.historique = [
      { id: 'e1', date: '2026-10-18T10:00:00.000Z', statut: 'juste' },
      { id: 'e2', date: '2026-10-19T10:00:00.000Z', statut: 'faux' },
    ];
    const f = fusionner(a, b);
    assert.equal(f.historique.length, 2);
  });

  test('fusionner avec rien renvoie l’autre profil', () => {
    const a = profilVide();
    assert.equal(fusionner(a, null), a);
    assert.equal(fusionner(null, a), a);
  });
});

describe('Suivi des jours', () => {
  test('le temps et les exercices s’additionnent', () => {
    const p = profilVide();
    marquerJour(p, 300, 5, 4);
    marquerJour(p, 120, 2, 2);
    const jour = new Date().toISOString().slice(0, 10);
    assert.equal(p.jours[jour].secondes, 420);
    assert.equal(p.jours[jour].exercices, 7);
    assert.equal(p.jours[jour].justes, 6);
  });

  test('la série de jours démarre à 1 et garde son record', () => {
    const p = profilVide();
    marquerJour(p, 60, 1, 1);
    assert.equal(p.serieJours.courant, 1);
    assert.equal(p.serieJours.record, 1);
    marquerJour(p, 60, 1, 1);
    assert.equal(p.serieJours.courant, 1, 'deux séances le même jour ne comptent qu’une fois');
  });

  test('une journée manquée ne fait rien perdre d’autre que la série', () => {
    const p = profilVide();
    p.xp = 200;
    p.badges = [{ id: 'b', date: 'x' }];
    p.serieJours = { courant: 5, record: 5, dernierJour: '2026-01-01' };
    marquerJour(p, 60, 1, 1);
    assert.equal(p.serieJours.courant, 1);
    assert.equal(p.serieJours.record, 5);
    assert.equal(p.xp, 200);
    assert.equal(p.badges.length, 1);
  });
});
