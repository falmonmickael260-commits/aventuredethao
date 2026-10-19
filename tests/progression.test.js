import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { profilVide } from '../src/core/stockage.js';
import {
  bilan, choisirExercices, enregistrerReponse, evaluerCompetence, majMondes,
  prochaineCompetence, revisionsDues,
} from '../src/core/progression.js';
import { ouvrirCoffre, recompenser, verifierBadges, jaugeNiveau, niveauPour } from '../src/core/recompenses.js';
import {
  appliquerEvaluation, archiverSeance, bilanSeance, creerEvaluation, creerSeanceModule,
  creerSeanceVacances, noterEtAvancer, progressionSeance,
} from '../src/core/seance.js';
import { exerciceParId, PAR_MODULE } from '../data/bank/index.js';
import { MODULES } from '../data/modules.js';

const juste = { statut: 'juste', score: 1 };
const faux = { statut: 'faux', score: 0 };

function repondre(profil, exercices, resultat, premier = true) {
  for (const e of exercices) {
    enregistrerReponse(profil, e, resultat, { premierEssai: premier, essais: premier ? 1 : 3, secondes: 20 });
  }
}

function toutDebloquer(profil) {
  for (const w of Object.keys(profil.mondes)) profil.mondes[w].debloque = true;
  return profil;
}

/**
 * Joue normalement (via le choix adaptatif des exercices) en répondant juste,
 * jusqu'à la maîtrise. Vérifie du même coup que la maîtrise est ATTEIGNABLE
 * en jouant, et pas seulement en théorie.
 */
function jouerJusquAMaitrise(profil, moduleId, maxTours = 12) {
  for (let tour = 0; tour < maxTours; tour++) {
    if (profil.competences[moduleId].etat === 'maitrisee') return tour;
    const lot = choisirExercices(profil, { module: moduleId, n: 5 });
    if (!lot.length) break;
    repondre(profil, lot, juste);
  }
  return profil.competences[moduleId].etat === 'maitrisee' ? maxTours : -1;
}

describe('Maîtrise d’une compétence', () => {
  test('une seule bonne réponse ne suffit pas', () => {
    const p = profilVide();
    repondre(p, choisirExercices(p, { module: 'm1', n: 1 }), juste);
    assert.notEqual(p.competences.m1.etat, 'maitrisee');
  });

  test('réussir dix fois le même type d’exercice ne suffit pas', () => {
    const p = profilVide();
    const faciles = PAR_MODULE.m1.filter((e) => e.difficulte === 1 && e.format === 'trouve-noms').slice(0, 10);
    repondre(p, faciles, juste);
    const s = p.competences.m1;
    assert.equal(Object.keys(s.formats).length, 1, 'un seul format travaillé');
    assert.notEqual(s.etat, 'maitrisee', 'un seul format ne donne pas la maîtrise');
  });

  test('il faut aussi réussir des exercices difficiles', () => {
    const p = profilVide();
    // Que des exercices faciles, mais sur trois formats différents.
    const formats = [...new Set(PAR_MODULE.m1.filter((e) => e.difficulte === 1).map((e) => e.format))];
    for (const f of formats) {
      repondre(p, PAR_MODULE.m1.filter((e) => e.difficulte === 1 && e.format === f).slice(0, 3), juste);
    }
    const s = p.competences.m1;
    assert.ok(Object.keys(s.formats).length >= 3, 'au moins trois formats travaillés');
    assert.ok(s.essais >= 6);
    assert.notEqual(s.etat, 'maitrisee', 'sans exercice difficile, pas de maîtrise');
  });

  test('la maîtrise est atteignable en jouant normalement', () => {
    for (const m of MODULES) {
      const p = toutDebloquer(profilVide());
      const tours = jouerJusquAMaitrise(p, m.id);
      assert.notEqual(tours, -1, `${m.id} : maîtrise jamais atteinte`);
      assert.equal(p.competences[m.id].etat, 'maitrisee', m.id);
      assert.ok(p.competences[m.id].maitrise >= 80, `${m.id} : ${p.competences[m.id].maitrise}%`);
    }
  });

  test('plusieurs erreurs rendent la compétence « à retravailler »', () => {
    const p = profilVide();
    repondre(p, choisirExercices(p, { module: 'm6', n: 5 }), faux);
    assert.equal(p.competences.m6.etat, 'fragile');
  });

  test('une bonne réponse après plusieurs essais compte moins qu’une réussite directe', () => {
    const a = profilVide();
    const b = profilVide();
    const lot = PAR_MODULE.m5.slice(0, 6);
    repondre(a, lot, juste, true);
    repondre(b, lot, juste, false);
    assert.ok(a.competences.m5.maitrise > b.competences.m5.maitrise);
  });

  test('evaluerCompetence ne dépasse jamais 100', () => {
    const p = profilVide();
    repondre(p, PAR_MODULE.m1.slice(0, 30), juste);
    const r = evaluerCompetence(p.competences.m1, 'm1');
    assert.ok(r.maitrise <= 100);
  });
});

describe('Difficulté adaptative', () => {
  test('deux réussites directes font monter la difficulté', () => {
    const p = profilVide();
    assert.equal(p.competences.m3.niveauDifficulte, 1);
    repondre(p, PAR_MODULE.m3.slice(0, 2), juste);
    assert.equal(p.competences.m3.niveauDifficulte, 2);
  });

  test('deux erreurs font redescendre la difficulté', () => {
    const p = profilVide();
    p.competences.m3.niveauDifficulte = 3;
    repondre(p, PAR_MODULE.m3.slice(0, 2), faux);
    assert.equal(p.competences.m3.niveauDifficulte, 2);
  });

  test('la difficulté reste entre 1 et 3', () => {
    const p = profilVide();
    repondre(p, PAR_MODULE.m3.slice(0, 20), juste);
    assert.equal(p.competences.m3.niveauDifficulte, 3);
    repondre(p, PAR_MODULE.m3.slice(0, 20), faux);
    assert.equal(p.competences.m3.niveauDifficulte, 1);
  });

  test('les exercices proposés suivent le niveau atteint', () => {
    const p = profilVide();
    const debut = choisirExercices(p, { module: 'm1', n: 6 });
    assert.ok(debut.filter((e) => e.difficulte === 1).length >= 4, 'on commence facile');
    repondre(p, PAR_MODULE.m1.slice(0, 6), juste);
    const apres = choisirExercices(p, { module: 'm1', n: 6 });
    const moyenneApres = apres.reduce((s, e) => s + e.difficulte, 0) / apres.length;
    const moyenneAvant = debut.reduce((s, e) => s + e.difficulte, 0) / debut.length;
    assert.ok(moyenneApres > moyenneAvant, 'la difficulté a augmenté');
  });
});

describe('Choix des exercices', () => {
  test('on ne repose pas tout de suite le même exercice', () => {
    const p = profilVide();
    const premiers = choisirExercices(p, { module: 'm1', n: 8 });
    repondre(p, premiers, juste);
    const seconds = choisirExercices(p, { module: 'm1', n: 8 });
    const communs = seconds.filter((e) => premiers.some((x) => x.id === e.id));
    assert.equal(communs.length, 0, 'des exercices sont reposés immédiatement');
  });

  test('la séance mélange les formats', () => {
    const p = profilVide();
    const lot = choisirExercices(p, { module: 'm1', n: 8 });
    assert.ok(new Set(lot.map((e) => e.format)).size >= 4, 'trop peu de formats différents');
  });

  test('on peut travailler un seul format si on le demande', () => {
    const p = profilVide();
    const lot = choisirExercices(p, { module: 'm6', formats: ['tableau'], n: 5, maxParFormat: 5 });
    assert.ok(lot.length >= 5);
    assert.ok(lot.every((e) => e.format === 'tableau'));
  });

  test('une erreur revient en révision, mais plus tard', () => {
    const p = profilVide();
    const e = PAR_MODULE.m7[0];
    enregistrerReponse(p, e, faux, { premierEssai: true, secondes: 10 });
    assert.equal(p.revisions.length, 1);
    assert.equal(revisionsDues(p).length, 0, 'pas tout de suite');
    assert.equal(revisionsDues(p, Date.now() + 86400000).length, 1, 'le lendemain');
  });

  test('une réussite retire l’exercice de la file de révision', () => {
    const p = profilVide();
    const e = PAR_MODULE.m7[0];
    enregistrerReponse(p, e, faux, { premierEssai: true });
    enregistrerReponse(p, e, juste, { premierEssai: true });
    assert.equal(p.revisions.length, 0);
  });
});

describe('Mondes', () => {
  test('le monde suivant s’ouvre quand le précédent est bien avancé', () => {
    const p = profilVide();
    assert.equal(p.mondes.w2.debloque, false);
    for (const mod of ['m1', 'm2', 'm3']) jouerJusquAMaitrise(p, mod);
    const ouverts = majMondes(p);
    assert.equal(p.mondes.w2.debloque, true);
    assert.ok(ouverts.some((w) => w.id === 'w2'));
    assert.ok(p.mondes.w1.progression >= 60);
  });

  test('un monde terminé donne un coffre, une seule fois', () => {
    const p = toutDebloquer(profilVide());
    jouerJusquAMaitrise(p, 'm4');
    majMondes(p);
    assert.equal(p.mondes.w2.termine, true);
    const coffres = p.coffresEnAttente;
    majMondes(p);
    majMondes(p);
    assert.equal(p.coffresEnAttente, coffres, 'le coffre a été donné deux fois');
  });

  test('on conseille d’abord ce qui est fragile', () => {
    const p = toutDebloquer(profilVide());
    repondre(p, PAR_MODULE.m9.slice(0, 5), faux);
    repondre(p, PAR_MODULE.m1.slice(0, 5), juste);
    assert.equal(prochaineCompetence(p).id, 'm9');
  });

  test('on ne conseille jamais un monde encore fermé', () => {
    const p = profilVide();
    for (let i = 0; i < 20; i++) {
      assert.equal(p.mondes[prochaineCompetence(p).monde].debloque, true);
      repondre(p, PAR_MODULE.m1.slice(i, i + 1), juste);
    }
  });
});

describe('Récompenses', () => {
  test('les niveaux montent avec l’expérience', () => {
    assert.equal(niveauPour(0), 1);
    assert.equal(niveauPour(80), 2);
    assert.equal(jaugeNiveau(100).niveau, 2);
    assert.ok(jaugeNiveau(100).pourcentage > 0 && jaugeNiveau(100).pourcentage < 100);
  });

  test('une erreur ne retire ni étoile, ni expérience, ni badge', () => {
    const p = profilVide();
    p.xp = 150;
    p.etoiles = 20;
    p.badges = [{ id: 'premiers-pas', date: 'x' }];
    const r = recompenser(p, PAR_MODULE.m1[0], faux, true);
    assert.equal(r.xp, 0);
    assert.equal(p.xp, 150);
    assert.equal(p.etoiles, 20);
    assert.equal(p.badges.length, 1);
  });

  test('réussir du premier coup rapporte davantage', () => {
    const a = profilVide();
    const b = profilVide();
    const e = PAR_MODULE.m1.find((x) => x.difficulte === 3);
    const ra = recompenser(a, e, juste, true);
    const rb = recompenser(b, e, juste, false);
    assert.ok(ra.xp > rb.xp);
    assert.ok(ra.etoiles >= rb.etoiles);
  });

  test('les badges sont donnés une seule fois', () => {
    const p = profilVide();
    p.historique.push({ id: 'x', module: 'm1', format: 'f', statut: 'juste', date: 'x' });
    const premiers = verifierBadges(p);
    assert.ok(premiers.some((b) => b.id === 'premiers-pas'));
    assert.deepEqual(verifierBadges(p), []);
  });

  test('un coffre donne un trésor différent à chaque fois', () => {
    const p = profilVide();
    p.coffresEnAttente = 5;
    const obtenus = [];
    for (let i = 0; i < 5; i++) obtenus.push(ouvrirCoffre(p).tresor.id);
    assert.equal(new Set(obtenus).size, 5);
    assert.equal(p.tresors.length, 5);
  });

  test('sans coffre en attente, on n’ouvre rien', () => {
    const p = profilVide();
    assert.equal(ouvrirCoffre(p), null);
  });
});

describe('Séances', () => {
  test('la mission du jour mélange les compétences disponibles', () => {
    const p = toutDebloquer(profilVide());
    const s = creerSeanceVacances(p);
    assert.ok(s.ids.length >= 10 && s.ids.length <= 16, `${s.ids.length} exercices`);
    const modules = new Set(s.ids.map((id) => exerciceParId(id).module));
    assert.ok(modules.size >= 5, `seulement ${modules.size} compétences`);
    assert.equal(new Set(s.ids).size, s.ids.length, 'exercice en double dans la séance');
  });

  test('au début, la mission ne propose que le premier monde', () => {
    const p = profilVide();
    const s = creerSeanceVacances(p);
    assert.ok(s.ids.length >= 3);
    for (const id of s.ids) {
      assert.ok(['m1', 'm2', 'm3'].includes(exerciceParId(id).module), id);
    }
  });

  test('la mission s’adapte : la compétence fragile passe en premier', () => {
    const p = toutDebloquer(profilVide());
    repondre(p, PAR_MODULE.m3.slice(0, 6), faux);
    repondre(p, PAR_MODULE.m1.slice(0, 6), juste);
    repondre(p, PAR_MODULE.m2.slice(0, 6), juste);
    const s = creerSeanceVacances(p);
    const premiers3 = s.ids.slice(0, 3).map((id) => exerciceParId(id).module);
    assert.ok(premiers3.includes('m3'), `premiers modules : ${premiers3}`);
  });

  test('la progression de la séance se calcule bien', () => {
    const p = profilVide();
    const s = creerSeanceModule(p, 'm1', 5);
    assert.equal(progressionSeance(s).pourcentage, 0);
    noterEtAvancer(s, s.ids[0], 'juste', 1, 10);
    assert.equal(progressionSeance(s).faits, 1);
    assert.equal(progressionSeance(s).pourcentage, 20);
    for (let i = 1; i < 5; i++) noterEtAvancer(s, s.ids[i], 'juste', 1, 10);
    assert.equal(s.fini, true);
  });

  test('le bilan compte justes, presque et faux', () => {
    const p = profilVide();
    const s = creerSeanceModule(p, 'm1', 4);
    noterEtAvancer(s, s.ids[0], 'juste', 1, 10);
    noterEtAvancer(s, s.ids[1], 'presque', 2, 20);
    noterEtAvancer(s, s.ids[2], 'faux', 3, 30);
    noterEtAvancer(s, s.ids[3], 'juste', 1, 15);
    const b = bilanSeance(s);
    assert.equal(b.justes, 2);
    assert.equal(b.presque, 1);
    assert.equal(b.faux, 1);
    assert.equal(b.reussite, 50);
    assert.ok(b.minutes >= 1);
  });

  test('archiver une séance la retire des séances en cours', () => {
    const p = profilVide();
    const s = creerSeanceModule(p, 'm1', 3);
    p.seance = s;
    for (const id of s.ids) noterEtAvancer(s, id, 'juste', 1, 10);
    archiverSeance(p, s);
    assert.equal(p.seance, null);
    assert.equal(p.missions.terminees, 1);
    assert.equal(p.missions.journal.length, 1);
  });

  test('l’évaluation de départ règle la difficulté sans donner de note', () => {
    const p = profilVide();
    const ev = creerEvaluation(p);
    assert.equal(ev.ids.length, MODULES.length);
    ev.ids.forEach((id, i) => noterEtAvancer(ev, id, i % 2 === 0 ? 'juste' : 'faux', 1, 10));
    appliquerEvaluation(p, ev);
    assert.equal(p.evaluation.fait, true);
    assert.equal(p.competences.m1.niveauDifficulte, 2);
    assert.equal(p.competences.m2.niveauDifficulte, 1);
  });
});

describe('Bilan d’accueil', () => {
  test('les compteurs correspondent à ce qui a été fait', () => {
    const p = toutDebloquer(profilVide());
    repondre(p, PAR_MODULE.m1.slice(0, 8), juste);
    repondre(p, PAR_MODULE.m9.slice(0, 4), faux);
    const b = bilan(p);
    assert.equal(b.exercicesFaits, 12);
    assert.equal(b.reussite, 67);
    assert.ok(b.progressionGlobale > 0 && b.progressionGlobale < 100);
    assert.ok(b.fragiles.some((c) => c.id === 'm9'));
  });
});
