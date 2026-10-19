/**
 * Tous les écrans de Thao Aventure, sauf l'écran d'exercice.
 */

import { h, svg, jauge, anneau, annoncer } from './dom.js';
import { icone, guide, decorMonde, constellation, medaille, coffre, rotateur } from './art.js';
import { confettis, pluieEtoiles, son } from './fx.js';
import { MODULES, MONDES, MODULE_PAR_ID, MONDE_PAR_ID } from '../../data/modules.js';
import { FORMATS_PAR_MODULE, PAR_MODULE, statsBanque } from '../../data/bank/index.js';
import { bilan, ETATS, progressionMonde, revisionsDues } from '../core/progression.js';
import { BADGES, TRESORS, jaugeNiveau, ouvrirCoffre, titreNiveau } from '../core/recompenses.js';
import {
  bilanSeance, archiverSeance, creerEvaluation, creerSeanceFormats, creerSeanceModule,
  creerSeanceMonde, creerSeanceVacances, RECETTE,
} from '../core/seance.js';
import { exporter, importer } from '../core/stockage.js';
import {
  derniersJours, dernieresSeances, erreursFrequentes, parCompetence, programmeConseille, resume,
} from '../core/stats.js';

const PUCE_ETAT = {
  maitrisee: 'puce--maitrise',
  'en-cours': 'puce--cours',
  fragile: 'puce--fragile',
  nouvelle: 'puce--neutre',
};

const NOMS_FORMAT = {
  'trouve-noms': 'Trouver les noms',
  'trouve-det': 'Trouver les déterminants',
  'complete-det': 'Compléter avec un déterminant',
  'tri-noms-det': 'Trier noms et déterminants',
  detective: 'Le détective grammatical',
  'singulier-pluriel': 'Singulier ou pluriel ?',
  'combien-noms': 'Compter les noms',
  'classe-nom': 'Propre ou commun ?',
  'tri-propre-commun': 'Trier propres et communs',
  'propres-dans-phrase': 'Les noms propres d’une phrase',
  'communs-dans-phrase': 'Les noms communs d’une phrase',
  'ecris-propre': 'Écrire un nom propre',
  'ecris-commun': 'Écrire un nom commun',
  'corrige-classement': 'Vrai ou faux ?',
  'pourquoi-majuscule': 'Pourquoi cette majuscule ?',
  'choisis-det': 'Choisir le déterminant',
  pluriel: 'Mettre au pluriel',
  singulier: 'Revenir au singulier',
  'corrige-groupe': 'Corriger un groupe',
  'detecte-erreur': 'Trouver le mot mal accordé',
  'tri-sing-plur': 'Trier singulier et pluriel',
  'accord-phrase': 'La phrase bien accordée',
  'clic-sujet': 'Trouver le groupe sujet',
  'clic-gv': 'Trouver le groupe verbal',
  coupe: 'Couper la phrase en deux',
  'associe-sujet-gv': 'Relier sujet et groupe verbal',
  'complete-sujet': 'Inventer un groupe sujet',
  'remets-ordre': 'Remettre la phrase en ordre',
  'invente-phrase': 'Inventer une phrase',
  'clic-verbe': 'Trouver le verbe',
  'ecris-infinitif': 'Écrire l’infinitif',
  'relie-inf': 'Relier verbe et infinitif',
  'verbes-texte': 'Les verbes d’un texte',
  'verbe-manquant': 'Le verbe qui manque',
  'intrus-verbe': 'L’intrus',
  'choisis-forme': 'Choisir la bonne forme',
  'complete-imparfait': 'Compléter à l’imparfait',
  tableau: 'Le tableau de conjugaison',
  transforme: 'Transformer au passé',
  'corrige-imparfait': 'Corriger la conjugaison',
  'texte-a-trous': 'Le texte à trous',
  intrus: 'Trouver l’intrus',
  regroupe: 'Regrouper les familles',
  'complete-famille': 'Compléter la famille',
  'ecris-famille': 'Écrire un mot de la famille',
  'lien-sens': 'Le lien de sens',
  range: 'Ranger dans l’ordre',
  'avant-apres': 'Où placer ce mot ?',
  compare: 'Comparer deux mots',
  'meme-lettre': 'Même début, quel ordre ?',
  'ecris-liste': 'Écrire la liste rangée',
  'entre-reperes': 'Entre les mots repères',
  'choisis-page': 'Choisir la bonne page',
  'trouve-dans-page': 'Chercher dans la page',
  'ordre-dico': 'L’ordre du dictionnaire',
  coffre: 'Le coffre à trois serrures',
  indices: 'Le mot mystère',
};

const nomFormat = (f) => NOMS_FORMAT[f] || f;

/* ================================================================== */
/* ACCUEIL                                                             */
/* ================================================================== */

export function ecranAccueil(app) {
  const p = app.profil;
  const b = bilan(p);
  const j = jaugeNiveau(p.xp);
  const seanceEnCours = p.seance && !p.seance.fini;
  const revisions = revisionsDues(p).length;
  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Coucou' : 'Bonsoir';

  const motDuJour = !p.evaluation.fait
    ? 'On commence par quelques petites questions pour voir ce que tu sais déjà. Aucune note, promis !'
    : seanceEnCours
      ? `Ta mission « ${p.seance.titre} » n’est pas terminée. On la reprend ?`
      : revisions
        ? `J’ai gardé ${revisions} exercice${revisions > 1 ? 's' : ''} à revoir avec toi. Ça te dit ?`
        : b.fragiles.length
          ? `Aujourd’hui, on travaille « ${b.fragiles[0].titre} ». Tu vas voir, ce n’est pas si dur !`
          : `Prochaine étape conseillée : ${b.prochaine.titre}.`;

  const actions = [];
  if (!p.evaluation.fait) {
    actions.push(h('button.btn.btn--large', {
      type: 'button',
      onclick() { app.lancerSeance(creerEvaluation(p)); },
    }, svg(icone('etoile', 24)), 'Commencer mon aventure'));
  } else if (seanceEnCours) {
    actions.push(h('button.btn.btn--large', {
      type: 'button',
      onclick() { app.aller('#/exercice'); },
    }, svg(icone('suivant', 24)), 'Reprendre là où je me suis arrêté'));
    actions.push(h('button.btn.btn--2', {
      type: 'button',
      onclick() {
        if (!confirm('On abandonne la mission en cours et on en commence une nouvelle ?')) return;
        app.profil.seance = null;
        app.lancerSeance(creerSeanceVacances(app.profil));
      },
    }, 'Commencer une nouvelle mission'));
  } else {
    actions.push(h('button.btn.btn--large', {
      type: 'button',
      onclick() { app.lancerSeance(creerSeanceVacances(p)); },
    }, svg(icone('mission', 24)), 'Commencer ma mission du jour'));
  }
  actions.push(h('button.btn.btn--2', {
    type: 'button',
    onclick() { app.aller('#/choisir'); },
  }, svg(icone('cible', 22)), 'Choisir mes exercices'));

  const recette = RECETTE.map((r) => `${r.n} ${r.domaine.toLowerCase()}`).join(' · ');

  return h('div.vue', null,
    h('section.carte.carte--lueur.bonjour', null,
      h('div', null,
        h('p.sur-titre', null, `Niveau ${j.niveau} · ${titreNiveau(j.niveau)}`),
        h('h1', null, `${salut} ${p.prenom} !`),
        h('p', null, p.evaluation.fait
          ? 'Prêt à repartir à l’aventure ? Ton atlas t’attend.'
          : 'Je m’appelle Plume. Je serai ton guide dans les six mondes du français.'),
        h('div.bulle', null, motDuJour)),
      svg(guide(seanceEnCours ? 'pensif' : 'bonjour'), 'bonjour__guide flotte')),

    h('div.grille.grille--2', { style: { marginTop: '16px' } }, ...actions),

    h('section.carte', { style: { marginTop: '16px' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' } },
        h('div', null,
          h('p.sur-titre', null, 'Ma mission du jour'),
          h('h2', { style: { fontSize: '1.3rem' } }, '10 à 20 minutes, tous les jours')),
        h('span.puce', null, svg(icone('horloge', 16)), p.jours[new Date().toISOString().slice(0, 10)]
          ? `${Math.round((p.jours[new Date().toISOString().slice(0, 10)].secondes || 0) / 60)} min aujourd’hui`
          : 'pas encore commencé')),
      h('p', { style: { color: 'var(--texte-doux)', marginBottom: '14px' } }, recette, '.'),
      (() => {
        const faits = p.jours[new Date().toISOString().slice(0, 10)]?.exercices || 0;
        return jauge(
          Math.min(100, Math.round((faits / 13) * 100)),
          'Objectif du jour',
          faits >= 13 ? '✓ objectif atteint !' : `${faits} / 13 exercices`,
        );
      })(),
      h('div', { style: { marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        h('button.btn.btn--petit.btn--2', { type: 'button', onclick() { app.aller('#/vacances'); } },
          'Voir le mode vacances'),
        p.coffresEnAttente
          ? h('button.btn.btn--petit', { type: 'button', onclick() { app.aller('#/recompenses'); } },
              svg(icone('coffre', 18)), `${p.coffresEnAttente} coffre${p.coffresEnAttente > 1 ? 's' : ''} à ouvrir`)
          : null)),

    h('div.grille.grille--4', { style: { marginTop: '16px' } },
      h('div.stat.stat--or', null, h('span.stat__val', null, p.etoiles), h('span.stat__lib', null, 'étoiles gagnées')),
      h('div.stat.stat--turquoise', null, h('span.stat__val', null, `${b.progressionGlobale}%`), h('span.stat__lib', null, 'progression')),
      h('div.stat.stat--violet', null, h('span.stat__val', null, p.missions.terminees), h('span.stat__lib', null, 'missions terminées')),
      h('div.stat.stat--orange', null, h('span.stat__val', null, p.badges.length), h('span.stat__lib', null, 'badges')),
    ),

    h('div.titre-section', null, h('h2', null, 'Les mondes à explorer'), h('span', null, `${b.mondesDebloques} sur 6 ouverts`)),
    h('section.carte.atlas', { style: { padding: '10px' } },
      svg(constellation(MONDES, p.mondes)),
      h('button.btn.btn--2.btn--petit', {
        type: 'button',
        style: { width: '100%', marginTop: '6px' },
        onclick() { app.aller('#/carte'); },
      }, svg(icone('carte', 20)), 'Ouvrir la carte des mondes')),

    h('div.titre-section', null, h('h2', null, 'Mes progrès'), h('span', null, `${b.exercicesFaits} exercices faits`)),
    h('section.carte', null,
      h('div.grille.grille--3', null,
        h('div.stat', null, h('span.stat__val', { style: { color: 'var(--juste-nuit)' } }, b.maitrisees.length), h('span.stat__lib', null, 'notions maîtrisées')),
        h('div.stat', null, h('span.stat__val', { style: { color: 'var(--turquoise)' } }, b.enCours.length), h('span.stat__lib', null, 'en cours')),
        h('div.stat', null, h('span.stat__val', { style: { color: 'var(--presque-nuit)' } }, b.fragiles.length), h('span.stat__lib', null, 'à retravailler'))),
      h('button.btn.btn--2.btn--petit', {
        type: 'button',
        style: { width: '100%', marginTop: '14px' },
        onclick() { app.aller('#/progres'); },
      }, svg(icone('progres', 20)), 'Voir le détail de mes progrès')),
  );
}

/* ================================================================== */
/* CARTE DES MONDES                                                    */
/* ================================================================== */

export function ecranCarte(app) {
  const p = app.profil;
  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, 'La carte de l’aventure'),
      h('span', null, 'Six mondes, neuf compétences')),
    h('section.carte.atlas', { style: { padding: '10px', marginBottom: '18px' } }, svg(constellation(MONDES, p.mondes))),
    h('div.grille.grille--2', null,
      ...MONDES.map((monde) => {
        const etat = p.mondes[monde.id];
        const prog = progressionMonde(p, monde.id);
        const carte = h('button.monde-carte', {
          type: 'button',
          class: etat.debloque ? '' : 'monde-carte--ferme',
          disabled: !etat.debloque,
          'aria-label': etat.debloque ? `Entrer dans ${monde.titre}` : `${monde.titre} — encore fermé`,
          onclick() { if (etat.debloque) app.aller(`#/monde/${monde.id}`); },
        },
          h('div.monde-carte__image', null,
            svg(decorMonde(monde.decor, monde.palette)),
            h('span.monde-carte__num', null, `Monde ${monde.numero}`),
            !etat.debloque ? h('div.cadenas', null, svg(icone('cadenas', 40))) : null),
          h('div.monde-carte__corps', null,
            h('h3', null, monde.titre),
            h('p', null, monde.sousTitre),
            h('div', { style: { marginTop: '10px' } },
              jauge(prog, etat.termine ? 'Monde terminé' : `${monde.modules.length} compétence${monde.modules.length > 1 ? 's' : ''}`, `${prog}%`)),
            h('div', { style: { marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' } },
              etat.termine ? h('span.puce.puce--termine', null, svg(icone('etoile', 14)), 'terminé') : null,
              ...monde.modules.map((m) => h('span.puce', { class: PUCE_ETAT[p.competences[m].etat] },
                MODULE_PAR_ID[m].court)))));
        return carte;
      })),
    h('section.carte', { style: { marginTop: '18px' } },
      h('p.sur-titre', null, 'Bon à savoir'),
      h('p', { style: { color: 'var(--texte-doux)', margin: '6px 0 0' } },
        'Un monde s’ouvre dès que le précédent est bien avancé. Mais tu peux t’entraîner sur n’importe quelle compétence déjà ouverte quand tu veux, depuis « Choisir mes exercices ».')),
  );
}

/* ================================================================== */
/* UN MONDE                                                            */
/* ================================================================== */

export function ecranMonde(app, mondeId) {
  const monde = MONDE_PAR_ID[mondeId];
  const p = app.profil;
  if (!monde || !p.mondes[mondeId]?.debloque) {
    return h('div.vue', null, h('div.vide', null,
      svg(icone('cadenas', 48)),
      h('b', null, 'Ce monde n’est pas encore ouvert'),
      h('p', null, 'Avance un peu dans le monde précédent et il s’ouvrira tout seul.'),
      h('button.btn', { type: 'button', onclick() { app.aller('#/carte'); } }, 'Retour à la carte')));
  }
  const prog = progressionMonde(p, mondeId);

  return h('div.vue', null,
    h('section.carte', { style: { padding: 0, overflow: 'hidden', marginBottom: '16px' } },
      h('div', { style: { position: 'relative', aspectRatio: '16 / 7' } },
        svg(decorMonde(monde.decor, monde.palette)),
        h('div', {
          style: {
            position: 'absolute', inset: 'auto 0 0 0', padding: '18px',
            background: 'linear-gradient(0deg, rgba(7,10,34,.92), transparent)',
          },
        },
          h('p.sur-titre', { style: { color: monde.palette.lueur } }, `Monde ${monde.numero}`),
          h('h1', { style: { fontSize: 'clamp(1.4rem,4.6vw,2.1rem)' } }, monde.titre))),
      h('div', { style: { padding: '18px' } },
        h('p', { style: { margin: 0, color: 'var(--texte-doux)' } }, monde.histoire),
        h('p', { style: { margin: '10px 0 0', fontSize: '.88rem', color: 'var(--texte-faible)' } },
          'Gardien du monde : ', h('strong', { style: { color: monde.palette.lueur } }, monde.gardien)),
        h('div', { style: { marginTop: '14px' } }, jauge(prog, 'Progression du monde', `${prog}%`)),
        h('button.btn.btn--large', {
          type: 'button',
          style: { marginTop: '16px' },
          onclick() { app.lancerSeance(creerSeanceMonde(p, mondeId, 10)); },
        }, svg(icone('etoile', 24)), 'Partir à l’aventure dans ce monde'))),

    h('div.titre-section', null, h('h2', null, 'Les compétences de ce monde')),
    h('div.grille', null,
      ...monde.modules.map((id) => {
        const mod = MODULE_PAR_ID[id];
        const stat = p.competences[id];
        return h('section.carte', null,
          h('div', { style: { display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' } },
            h('div.comp-ligne__num', null, mod.numero),
            h('div', { style: { flex: '1 1 220px', minWidth: '0' } },
              h('h3', { style: { fontSize: '1.1rem' } }, mod.titre),
              h('p', { style: { margin: '4px 0 0', color: 'var(--texte-doux)', fontSize: '.92rem' } }, mod.resume)),
            h('span.puce', { class: PUCE_ETAT[stat.etat] }, ETATS[stat.etat].libelle)),
          h('div', { style: { marginTop: '12px' } },
            jauge(stat.maitrise, `${PAR_MODULE[id].length} exercices disponibles`, `${stat.maitrise}%`)),
          h('div.avis.avis--info', { style: { marginTop: '12px' } },
            h('strong', null, 'À retenir : '), mod.rappel),
          h('div', { style: { marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            h('button.btn.btn--petit', {
              type: 'button',
              onclick() { app.lancerSeance(creerSeanceModule(p, id, 8)); },
            }, 'M’entraîner (8 exercices)'),
            h('button.btn.btn--petit.btn--2', {
              type: 'button',
              onclick() { app.aller(`#/choisir/${id}`); },
            }, 'Choisir un type d’exercice')));
      })),
  );
}

/* ================================================================== */
/* CHOISIR SES EXERCICES                                               */
/* ================================================================== */

export function ecranChoisir(app, moduleId) {
  const p = app.profil;
  if (moduleId && MODULE_PAR_ID[moduleId]) {
    const mod = MODULE_PAR_ID[moduleId];
    const formats = FORMATS_PAR_MODULE[moduleId] || [];
    const ouvert = p.mondes[mod.monde]?.debloque;
    return h('div.vue.vue--etroite', null,
      h('button.btn.btn--3', { type: 'button', onclick() { app.aller('#/choisir'); } },
        svg(icone('retour', 18)), 'Toutes les compétences'),
      h('div.titre-section', { style: { marginTop: '8px' } },
        h('h2', null, mod.titre), h('span', null, `${PAR_MODULE[moduleId].length} exercices`)),
      h('section.carte', null,
        h('div.avis.avis--info', null, h('strong', null, 'À retenir : '), mod.rappel),
        h('ul', { style: { margin: '14px 0 0', paddingLeft: '20px', color: 'var(--texte-doux)' } },
          ...mod.objectifs.map((o) => h('li', null, o)))),
      !ouvert
        ? h('div.avis.avis--attention', { style: { marginTop: '14px' } },
            'Cette compétence appartient à un monde encore fermé, mais tu peux quand même t’entraîner ici.')
        : null,
      h('div.titre-section', null, h('h2', null, 'Quel type d’exercice ?')),
      h('div.grille', null,
        ...formats.map((f) => {
          const lot = PAR_MODULE[moduleId].filter((e) => e.format === f);
          const stat = p.competences[moduleId].formats[f];
          return h('button.carte.carte--plate', {
            type: 'button',
            style: { textAlign: 'left', color: 'inherit', cursor: 'pointer' },
            onclick() { app.lancerSeance(creerSeanceFormats(p, moduleId, [f], Math.min(8, lot.length))); },
          },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' } },
              h('div', null,
                h('b', { style: { fontFamily: 'var(--police-titre)', fontSize: '1.05rem' } }, nomFormat(f)),
                h('div', { style: { fontSize: '.8rem', color: 'var(--texte-faible)' } },
                  `${lot.length} exercices`,
                  stat ? ` · ${stat.reussites}/${stat.essais} réussis` : ' · jamais essayé')),
              svg(icone('suivant', 22))));
        })),
      h('button.btn.btn--large', {
        type: 'button',
        style: { marginTop: '16px' },
        onclick() { app.lancerSeance(creerSeanceModule(p, moduleId, 8)); },
      }, 'Mélange de tous les types'),
    );
  }

  const s = statsBanque();
  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, 'Choisir mes exercices'),
      h('span', null, `${s.total} exercices en tout`)),
    h('p', { style: { color: 'var(--texte-doux)', marginTop: '-6px' } },
      'Tu peux t’entraîner sur ce que tu veux, quand tu veux. Pas besoin d’attendre la mission du jour.'),
    h('div.grille.grille--2', { style: { marginTop: '16px' } },
      ...MODULES.map((mod) => {
        const stat = p.competences[mod.id];
        const monde = MONDE_PAR_ID[mod.monde];
        return h('button.carte', {
          type: 'button',
          style: { textAlign: 'left', color: 'inherit', cursor: 'pointer' },
          onclick() { app.aller(`#/choisir/${mod.id}`); },
        },
          h('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
            h('div.comp-ligne__num', { style: { background: `${monde.palette.accent}22`, color: monde.palette.lueur } }, mod.numero),
            h('div', { style: { flex: '1', minWidth: '0' } },
              h('b', { style: { fontFamily: 'var(--police-titre)', fontSize: '1.08rem' } }, mod.court),
              h('div', { style: { fontSize: '.8rem', color: 'var(--texte-faible)' } }, `${PAR_MODULE[mod.id].length} exercices · ${monde.titre}`)),
            h('span.puce', { class: PUCE_ETAT[stat.etat] }, `${stat.maitrise}%`)),
          h('p', { style: { margin: '10px 0 0', color: 'var(--texte-doux)', fontSize: '.92rem' } }, mod.resume),
          h('div', { style: { marginTop: '10px' } }, jauge(stat.maitrise)));
      })),
  );
}

/* ================================================================== */
/* FIN DE SÉANCE                                                       */
/* ================================================================== */

export function ecranFin(app) {
  const p = app.profil;
  const seance = p.seance || app.derniereSeance;
  if (!seance) {
    return h('div.vue', null, h('div.vide', null,
      svg(icone('mission', 48)),
      h('b', null, 'Aucune séance à afficher'),
      h('button.btn', { type: 'button', onclick() { app.aller('#/accueil'); } }, 'Retour à l’accueil')));
  }
  const b = bilanSeance(seance);
  const etaitEvaluation = seance.type === 'evaluation';
  const conseil = bilan(p).prochaine;

  if (!app.fetePassee) {
    app.fetePassee = true;
    pluieEtoiles(b.reussite >= 70 ? 110 : 60);
    son('fin');
  }

  const bilanArchive = app.archiverMaintenant(seance);

  return h('div.vue.vue--etroite', null,
    h('div.fanfare', null,
      svg(guide(b.reussite >= 70 ? 'bravo' : 'content'), 'bonjour__guide flotte'),
      h('h1', null, etaitEvaluation ? 'Merci Thao !' : b.reussite >= 70 ? 'Mission réussie !' : 'Mission terminée !'),
      h('p', null, etaitEvaluation
        ? 'Maintenant je sais par où commencer. Les exercices vont s’adapter à toi, et ils deviendront plus difficiles au fur et à mesure.'
        : b.reussite >= 70
          ? 'Tu as fait du très bon travail. Plume est fière de toi !'
          : 'L’important, c’est d’avoir essayé. On recommencera ces notions ensemble.')),

    h('section.carte.carte--lueur', null,
      h('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' } },
        anneau(b.reussite, `${b.justes}/${b.total}`, 'bonnes réponses', 'var(--juste-nuit)'),
        h('div.grille.grille--2', { style: { flex: '1 1 220px' } },
          h('div.stat.stat--turquoise', null, h('span.stat__val', null, b.minutes), h('span.stat__lib', null, 'minutes de travail')),
          h('div.stat.stat--or', null, h('span.stat__val', null, `+${bilanArchive.etoiles}`), h('span.stat__lib', null, 'étoiles gagnées')),
          h('div.stat.stat--violet', null, h('span.stat__val', null, b.presque), h('span.stat__lib', null, 'presque justes')),
          h('div.stat.stat--orange', null, h('span.stat__val', null, b.faux), h('span.stat__lib', null, 'à revoir')))),
      h('p', { style: { marginTop: '16px', marginBottom: 0, color: 'var(--texte-doux)' } },
        'Notions travaillées : ', b.competences.map((c) => c.court).join(' · '), '.')),

    h('section.carte', { style: { marginTop: '16px' } },
      h('p.sur-titre', null, 'Prochaine fois'),
      h('h2', { style: { fontSize: '1.2rem', marginBottom: '6px' } }, conseil.titre),
      h('p', { style: { color: 'var(--texte-doux)', margin: 0 } }, conseil.resume),
      h('div', { style: { marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        h('button.btn', {
          type: 'button',
          onclick() { app.lancerSeance(creerSeanceModule(p, conseil.id, 8)); },
        }, svg(icone('cible', 20)), 'Continuer tout de suite'),
        h('button.btn.btn--2', { type: 'button', onclick() { app.aller('#/accueil'); } }, 'Faire une pause'))),

    p.coffresEnAttente
      ? h('section.carte', { style: { marginTop: '16px', textAlign: 'center' } },
          h('div.coffre-zone', null,
            svg(coffre(false), 'pulse'),
            h('h2', null, `${p.coffresEnAttente} coffre${p.coffresEnAttente > 1 ? 's' : ''} à ouvrir !`),
            h('button.btn', { type: 'button', onclick() { app.aller('#/recompenses'); } }, 'Aller l’ouvrir')))
      : null,
  );
}

/* ================================================================== */
/* RÉCOMPENSES                                                         */
/* ================================================================== */

export function ecranRecompenses(app) {
  const p = app.profil;
  const j = jaugeNiveau(p.xp);
  const possedes = new Map(p.tresors.map((t) => [t.id, t]));
  const zoneCoffre = h('div.coffre-zone');

  function dessinerCoffre() {
    zoneCoffre.replaceChildren(
      p.coffresEnAttente
        ? h('div', null,
            svg(coffre(false), 'pulse'),
            h('h2', null, `${p.coffresEnAttente} coffre${p.coffresEnAttente > 1 ? 's' : ''} t’attend${p.coffresEnAttente > 1 ? 'ent' : ''} !`),
            h('p', { style: { color: 'var(--texte-doux)' } }, 'Chaque coffre contient un nouvel ami pour ta collection.'),
            h('button.btn.btn--large', {
              type: 'button',
              style: { marginTop: '12px' },
              onclick(e) {
                const gain = ouvrirCoffre(p);
                app.sauver();
                son('coffre');
                const r = e.currentTarget.getBoundingClientRect();
                confettis(r.left + r.width / 2, r.top, 70);
                zoneCoffre.replaceChildren(
                  svg(coffre(true)),
                  h('h2', null, gain.tresor ? `Tu as trouvé ${gain.tresor.nom} !` : 'Encore des étoiles !'),
                  h('p', { style: { color: 'var(--texte-doux)', maxWidth: '36ch' } },
                    gain.tresor ? gain.tresor.texte : 'Ta collection est déjà complète : voici des étoiles en plus.'),
                  h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
                    h('span.puce.puce--termine', null, `+${gain.etoiles} ★`),
                    h('span.puce.puce--termine', null, `+${gain.xp} XP`)),
                  h('button.btn', { type: 'button', style: { marginTop: '10px' }, onclick() { app.rendre(); } }, 'Super !'),
                );
                annoncer(gain.tresor ? `Tu as trouvé ${gain.tresor.nom}` : 'Étoiles gagnées');
              },
            }, svg(icone('coffre', 24)), 'Ouvrir un coffre'))
        : h('div', null,
            svg(coffre(false), ''),
            h('h2', null, 'Pas de coffre pour le moment'),
            h('p', { style: { color: 'var(--texte-doux)', maxWidth: '40ch' } },
              'Tu gagnes un coffre tous les 10 exercices réussis, à la fin d’une mission sur deux, et chaque fois qu’un monde est terminé.')),
    );
  }
  dessinerCoffre();

  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, 'Mes récompenses'), h('span', null, `${p.etoiles} étoiles au total`)),

    h('section.carte.carte--lueur', null,
      h('div', { style: { display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' } },
        anneau(j.pourcentage, j.niveau, 'niveau'),
        h('div', { style: { flex: '1 1 200px' } },
          h('p.sur-titre', null, titreNiveau(j.niveau)),
          h('h2', { style: { fontSize: '1.3rem', marginBottom: '10px' } }, `Niveau ${j.niveau}`),
          jauge(j.pourcentage, `${j.dansNiveau} XP`, `${j.pourNiveau} XP pour le niveau ${j.niveau + 1}`)))),

    h('div.grille.grille--4', { style: { marginTop: '16px' } },
      h('div.stat.stat--or', null, h('span.stat__val', null, p.etoiles), h('span.stat__lib', null, 'étoiles')),
      h('div.stat.stat--turquoise', null, h('span.stat__val', null, p.xp), h('span.stat__lib', null, 'points d’expérience')),
      h('div.stat.stat--violet', null, h('span.stat__val', null, `${p.badges.length}/${BADGES.length}`), h('span.stat__lib', null, 'badges')),
      h('div.stat.stat--orange', null, h('span.stat__val', null, `${p.tresors.length}/${TRESORS.length}`), h('span.stat__lib', null, 'trésors'))),

    h('div.titre-section', null, h('h2', null, 'Le coffre')),
    h('section.carte', null, zoneCoffre),

    h('div.titre-section', null, h('h2', null, 'Ma collection'), h('span', null, `${p.tresors.length} sur ${TRESORS.length}`)),
    h('div.grille.grille--2', null,
      ...TRESORS.map((t) => {
        const eu = possedes.has(t.id);
        return h('div.tresor-carte', { class: eu ? '' : 'tresor-carte--vide' },
          h('div', {
            style: {
              width: '46px', height: '46px', flex: '0 0 auto', borderRadius: '14px',
              background: eu ? `linear-gradient(150deg, ${t.couleur}, rgba(255,255,255,.15))` : 'rgba(255,255,255,.08)',
              display: 'grid', placeItems: 'center',
            },
          }, svg(icone(eu ? 'etoile' : 'cadenas', 22))),
          h('div', null,
            h('b', null, eu ? t.nom : '???'),
            h('p', null, eu ? t.texte : 'Ouvre un coffre pour le découvrir.')));
      })),

    h('div.titre-section', null, h('h2', null, 'Mes badges')),
    h('button.btn.btn--2', { type: 'button', onclick() { app.aller('#/badges'); } },
      svg(icone('etoile', 20)), `Voir mes ${p.badges.length} badges`),
  );
}

export function ecranBadges(app) {
  const p = app.profil;
  const gagnes = new Map(p.badges.map((b) => [b.id, b]));
  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, 'Mes badges'), h('span', null, `${p.badges.length} sur ${BADGES.length}`)),
    h('p', { style: { color: 'var(--texte-doux)', marginTop: '-6px' } },
      'Un badge gagné est gagné pour toujours : même une mauvaise journée ne te le reprendra pas.'),
    h('div.grille.grille--3', { style: { marginTop: '16px' } },
      ...BADGES.map((badge) => {
        const eu = gagnes.get(badge.id);
        return h('div.badge-vignette', { class: eu ? 'badge-vignette--gagne' : '' },
          svg(medaille(badge.icone, !!eu)),
          h('b', null, badge.nom),
          h('span', null, eu
            ? `Gagné le ${new Date(eu.date).toLocaleDateString('fr-FR')}`
            : badge.texte));
      })),
  );
}

/* ================================================================== */
/* PROGRÈS                                                             */
/* ================================================================== */

export function ecranProgres(app) {
  const p = app.profil;
  const comps = parCompetence(p);
  const b = bilan(p);
  const jours = derniersJours(p, 14);
  const maxMinutes = Math.max(10, ...jours.map((j) => j.minutes));
  const erreurs = erreursFrequentes(p, 5);

  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, `Les progrès de ${p.prenom}`), h('span', null, `${b.exercicesFaits} exercices`)),

    h('section.carte.carte--lueur', null,
      h('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } },
        anneau(b.progressionGlobale, `${b.progressionGlobale}%`, 'progression', 'var(--turquoise)'),
        h('div.grille.grille--2', { style: { flex: '1 1 240px' } },
          h('div.stat', null, h('span.stat__val', { style: { color: 'var(--juste-nuit)' } }, b.maitrisees.length), h('span.stat__lib', null, 'maîtrisées')),
          h('div.stat', null, h('span.stat__val', { style: { color: 'var(--turquoise)' } }, b.enCours.length), h('span.stat__lib', null, 'en cours')),
          h('div.stat', null, h('span.stat__val', { style: { color: 'var(--presque-nuit)' } }, b.fragiles.length), h('span.stat__lib', null, 'à retravailler')),
          h('div.stat', null, h('span.stat__val', null, `${b.reussite}%`), h('span.stat__lib', null, 'de réussite'))))),

    h('div.titre-section', null, h('h2', null, 'Mes 14 derniers jours')),
    h('section.carte', null,
      h('div.histo', null,
        ...jours.map((j) => h('div.histo__col', { title: `${j.libelle} : ${j.exercices} exercices, ${j.minutes} min` },
          h('span.histo__val', null, j.minutes ? j.minutes : ''),
          h('div.histo__barre', {
            class: j.minutes ? '' : 'histo__barre--vide',
            style: { height: `${Math.max(3, (j.minutes / maxMinutes) * 92)}px` },
          }),
          h('span.histo__jour', null, j.libelle.split(' ')[0])))),
      h('p', { style: { color: 'var(--texte-faible)', fontSize: '.82rem', margin: '10px 0 0' } },
        'Chaque barre montre le temps passé ce jour-là. Un jour sans aventure, ce n’est pas grave : ce sont les vacances !')),

    h('div.titre-section', null, h('h2', null, 'Compétence par compétence')),
    h('div.grille', null,
      ...comps.map((c) => h('div.comp-ligne', null,
        h('div.comp-ligne__num', null, c.numero),
        h('div', { style: { minWidth: '0' } },
          h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' } },
            h('b', null, c.court),
            h('span.puce', { class: PUCE_ETAT[c.etat] }, c.etatLibelle)),
          h('div.comp-ligne__barre', null, jauge(c.maitrise, `${c.essais} exercices faits`, c.essais ? `${c.reussite}% de réussite` : 'jamais essayé')),
          h('div', { style: { marginTop: '8px' } },
            h('button.btn.btn--3', {
              type: 'button',
              onclick() { app.lancerSeance(creerSeanceModule(p, c.id, 8)); },
            }, 'M’entraîner', svg(icone('suivant', 16))))),
        h('span.comp-ligne__chiffre', null, `${c.maitrise}%`))),
    ),

    erreurs.length
      ? h('div', null,
          h('div.titre-section', null, h('h2', null, 'Ce qui me demande encore des efforts')),
          h('section.carte', null,
            h('div.grille', null,
              ...erreurs.map((e) => h('div', {
                style: { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--trait)' },
              },
                h('span', null, h('strong', null, nomFormat(e.format)), ` — ${e.titre}`),
                h('span.puce.puce--fragile', null, `${e.nb} erreur${e.nb > 1 ? 's' : ''}`)))),
            h('p', { style: { color: 'var(--texte-doux)', fontSize: '.88rem', margin: '12px 0 0' } },
              'Ces exercices reviendront tout seuls dans tes prochaines missions, avec des indices.')))
      : null,

    h('div.titre-section', null, h('h2', null, 'Ma prochaine mission conseillée')),
    h('section.carte', null,
      h('h3', { style: { fontSize: '1.15rem' } }, b.prochaine.titre),
      h('p', { style: { color: 'var(--texte-doux)' } }, b.prochaine.resume),
      h('button.btn', { type: 'button', onclick() { app.lancerSeance(creerSeanceModule(p, b.prochaine.id, 8)); } },
        svg(icone('mission', 20)), 'C’est parti !')),
  );
}

/* ================================================================== */
/* MODE VACANCES                                                       */
/* ================================================================== */

export function ecranVacances(app) {
  const p = app.profil;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const jour = p.jours[aujourdhui] || { secondes: 0, exercices: 0, justes: 0 };
  const minutes = Math.round(jour.secondes / 60);
  const seanceEnCours = p.seance && !p.seance.fini;
  const journal = dernieresSeances(p, 6);
  const serie = p.serieJours || { courant: 0, record: 0 };

  return h('div.vue.vue--etroite', null,
    h('section.carte.carte--lueur.bonjour', null,
      h('div', null,
        h('p.sur-titre', null, 'Mode vacances'),
        h('h1', null, 'Mes vacances intelligentes'),
        h('p', null, '10 à 20 minutes par jour, un mélange de toutes les compétences, et zéro pression. Si tu rates un jour, tu ne perds rien du tout.')),
      svg(guide('content'), 'bonjour__guide flotte')),

    h('div.grille.grille--3', { style: { marginTop: '16px' } },
      h('div.stat.stat--turquoise', null, h('span.stat__val', null, minutes), h('span.stat__lib', null, 'minutes aujourd’hui')),
      h('div.stat.stat--or', null, h('span.stat__val', null, serie.courant), h('span.stat__lib', null, 'jours de suite')),
      h('div.stat.stat--violet', null, h('span.stat__val', null, serie.record), h('span.stat__lib', null, 'record de jours'))),

    h('section.carte', { style: { marginTop: '16px' } },
      h('p.sur-titre', null, 'La recette de la mission du jour'),
      h('div.grille', { style: { marginTop: '10px' } },
        ...RECETTE.map((r) => h('div', {
          style: { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--trait)' },
        },
          h('span', null, r.domaine),
          h('span.puce', null, `${r.n} exercice${r.n > 1 ? 's' : ''}`)))),
      h('p', { style: { color: 'var(--texte-doux)', fontSize: '.9rem', marginTop: '12px' } },
        'La sélection s’adapte à toi : les notions fragiles passent en premier, et les exercices ratés reviennent un jour plus tard.'),
      seanceEnCours
        ? h('div', { style: { display: 'grid', gap: '10px', marginTop: '14px' } },
            h('button.btn.btn--large', { type: 'button', onclick() { app.aller('#/exercice'); } },
              svg(icone('suivant', 24)), 'Reprendre ma mission'),
            h('button.btn.btn--3', {
              type: 'button',
              onclick() {
                if (!confirm('On abandonne la mission en cours ?')) return;
                p.seance = null;
                app.lancerSeance(creerSeanceVacances(p));
              },
            }, 'Commencer une nouvelle mission'))
        : h('button.btn.btn--large', {
            type: 'button',
            style: { marginTop: '14px' },
            onclick() { app.lancerSeance(creerSeanceVacances(p)); },
          }, svg(icone('mission', 24)), 'Commencer la mission du jour')),

    h('div.titre-section', null, h('h2', null, 'Mes dernières séances')),
    journal.length
      ? h('div.grille', null, ...journal.map((m) => h('section.carte.carte--plate', null,
          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' } },
            h('div', null, h('b', null, m.titre), h('div', { style: { fontSize: '.8rem', color: 'var(--texte-faible)' } }, m.quand)),
            h('span.puce', { class: m.reussite >= 70 ? 'puce--maitrise' : 'puce--fragile' }, `${m.justes}/${m.total}`)),
          h('p', { style: { margin: '8px 0 0', fontSize: '.86rem', color: 'var(--texte-doux)' } },
            `${m.minutes} min · ${m.competences.join(' · ')}`))))
      : h('div.vide', null, svg(icone('mission', 42)), h('b', null, 'Aucune séance pour l’instant'),
          h('p', null, 'Lance ta première mission du jour, elle n’attend que toi !')),
  );
}

/* ================================================================== */
/* ESPACE PARENT                                                       */
/* ================================================================== */

export function ecranParent(app) {
  const p = app.profil;

  if (!app.parentOuvert) {
    const definir = !p.parent.code;
    const champs = [0, 1, 2, 3].map(() => h('input', {
      type: 'tel',
      inputmode: 'numeric',
      maxlength: '1',
      'aria-label': 'chiffre du code',
      pattern: '[0-9]',
    }));
    const message = h('div');

    champs.forEach((c, i) => {
      c.addEventListener('input', () => {
        c.value = c.value.replace(/\D/g, '').slice(0, 1);
        if (c.value && i < 3) champs[i + 1].focus();
      });
      c.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !c.value && i > 0) champs[i - 1].focus();
        if (e.key === 'Enter') valider();
      });
    });

    function valider() {
      const code = champs.map((c) => c.value).join('');
      if (code.length < 4) {
        message.replaceChildren(h('div.avis.avis--attention', null, 'Il faut les quatre chiffres.'));
        return;
      }
      if (definir) {
        p.parent.code = code;
        p.parent.dernierAcces = new Date().toISOString();
        app.sauver();
        app.parentOuvert = true;
        app.rendre();
        return;
      }
      if (code === p.parent.code) {
        p.parent.dernierAcces = new Date().toISOString();
        app.sauver();
        app.parentOuvert = true;
        app.rendre();
      } else {
        message.replaceChildren(h('div.avis.avis--erreur', null, 'Ce n’est pas le bon code.'));
        champs.forEach((c) => { c.value = ''; });
        champs[0].focus();
      }
    }

    setTimeout(() => champs[0].focus(), 80);

    return h('div.vue.vue--etroite', null,
      h('section.carte.carte--lueur', { style: { textAlign: 'center' } },
        svg(icone('parent', 46)),
        h('h1', { style: { marginTop: '10px' } }, 'Espace parent'),
        h('p', { style: { color: 'var(--texte-doux)', maxWidth: '40ch', margin: '10px auto 20px' } },
          definir
            ? 'Choisissez un code à quatre chiffres. Il servira à ouvrir cet espace, pour que votre enfant n’y entre pas par hasard.'
            : 'Entrez votre code à quatre chiffres.'),
        h('div.code-saisie', null, ...champs),
        message,
        h('button.btn', { type: 'button', style: { marginTop: '18px' }, onclick: valider },
          definir ? 'Enregistrer ce code' : 'Entrer'),
        h('button.btn.btn--3', { type: 'button', onclick() { app.aller('#/accueil'); } }, 'Retour à l’aventure')),
      definir
        ? null
        : h('p', { style: { textAlign: 'center', color: 'var(--texte-faible)', fontSize: '.84rem', marginTop: '14px' } },
            'Code oublié ? Il est enregistré avec la progression, sur cet appareil. Vous pouvez tout réinitialiser depuis les paramètres.'),
    );
  }

  const r = resume(p);
  const comps = parCompetence(p);
  const jours = derniersJours(p, 14);
  const maxMinutes = Math.max(10, ...jours.map((x) => x.minutes));
  const programme = programmeConseille(p, 3);
  const seances = dernieresSeances(p, 8);
  const erreurs = erreursFrequentes(p, 6);
  const s = statsBanque();

  const zoneImport = h('div');

  return h('div.vue', null,
    h('div.titre-section', { style: { marginTop: 0 } },
      h('h2', null, 'Espace parent'),
      h('span', null, `progression de ${p.prenom}`)),

    h('div.grille.grille--4', null,
      h('div.stat.stat--turquoise', null, h('span.stat__val', null, r.minutes), h('span.stat__lib', null, 'minutes au total')),
      h('div.stat.stat--or', null, h('span.stat__val', null, r.exercices), h('span.stat__lib', null, 'questions réalisées')),
      h('div.stat.stat--violet', null, h('span.stat__val', null, `${r.reussite}%`), h('span.stat__lib', null, 'de réussite')),
      h('div.stat.stat--orange', null, h('span.stat__val', null, r.joursActifs), h('span.stat__lib', null, 'jours d’activité'))),

    h('div.grille.grille--4', { style: { marginTop: '12px' } },
      h('div.stat', null, h('span.stat__val', { style: { color: 'var(--juste-nuit)' } }, r.maitrisees), h('span.stat__lib', null, 'notions maîtrisées')),
      h('div.stat', null, h('span.stat__val', { style: { color: 'var(--turquoise)' } }, r.enCours), h('span.stat__lib', null, 'en cours')),
      h('div.stat', null, h('span.stat__val', { style: { color: 'var(--presque-nuit)' } }, r.fragiles), h('span.stat__lib', null, 'à retravailler')),
      h('div.stat', null, h('span.stat__val', { style: { color: 'var(--texte-faible)' } }, r.nonCommencees), h('span.stat__lib', null, 'non commencées'))),

    h('div.titre-section', null, h('h2', null, 'Temps passé, 14 derniers jours')),
    h('section.carte', null,
      h('div.histo', null,
        ...jours.map((j) => h('div.histo__col', { title: `${j.libelle} : ${j.exercices} questions, ${j.minutes} min` },
          h('span.histo__val', null, j.minutes || ''),
          h('div.histo__barre', {
            class: j.minutes ? '' : 'histo__barre--vide',
            style: { height: `${Math.max(3, (j.minutes / maxMinutes) * 92)}px` },
          }),
          h('span.histo__jour', null, j.libelle)))),
      h('p', { style: { color: 'var(--texte-faible)', fontSize: '.82rem', margin: '10px 0 0' } },
        `Moyenne sur les jours travaillés : ${r.minutesParJour} minutes. Série en cours : ${r.serie} jour(s), record ${r.record}.`)),

    h('div.titre-section', null, h('h2', null, 'Taux de réussite par compétence')),
    h('section.carte.defile', null,
      h('table.tableau', null,
        h('thead', null, h('tr', null,
          h('th', null, 'Compétence'),
          h('th', null, 'Questions'),
          h('th', null, 'Réussite'),
          h('th', null, 'Maîtrise'),
          h('th', null, 'État'),
          h('th', null, 'Temps'))),
        h('tbody', null,
          ...comps.map((c) => h('tr', null,
            h('td', null, `${c.numero}. ${c.court}`),
            h('td', null, c.essais),
            h('td', null, c.essais ? `${c.reussite}%` : '—'),
            h('td', null, `${c.maitrise}%`),
            h('td', null, h('span.puce', { class: PUCE_ETAT[c.etat] }, c.etatLibelle)),
            h('td', null, c.minutes ? `${c.minutes} min` : '—')))))),

    h('div.titre-section', null, h('h2', null, 'Détail par type d’exercice')),
    h('section.carte', null,
      h('div.grille', null,
        ...comps.filter((c) => c.formats.length).map((c) => h('div', null,
          h('b', null, `${c.numero}. ${c.court}`),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' } },
            ...c.formats.map((f) => h('span.puce', {
              class: f.reussite >= 70 ? 'puce--maitrise' : f.reussite >= 40 ? 'puce--cours' : 'puce--fragile',
            }, `${nomFormat(f.format)} ${f.reussites}/${f.essais}`))))),
      ),
      comps.every((c) => !c.formats.length)
        ? h('p', { style: { color: 'var(--texte-doux)', margin: 0 } }, 'Aucun exercice réalisé pour l’instant.')
        : null),

    erreurs.length
      ? h('div', null,
          h('div.titre-section', null, h('h2', null, 'Erreurs les plus fréquentes')),
          h('section.carte', null, h('div.grille', null,
            ...erreurs.map((e) => h('div', {
              style: { display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--trait)' },
            },
              h('span', null, h('strong', null, nomFormat(e.format)), ` — ${e.titre}`),
              h('span.puce.puce--fragile', null, `${e.nb}`))))))
      : null,

    h('div.titre-section', null, h('h2', null, 'Dernières séances')),
    seances.length
      ? h('section.carte.defile', null,
          h('table.tableau', null,
            h('thead', null, h('tr', null,
              h('th', null, 'Date'), h('th', null, 'Séance'), h('th', null, 'Questions'),
              h('th', null, 'Réussite'), h('th', null, 'Durée'))),
            h('tbody', null, ...seances.map((m) => h('tr', null,
              h('td', null, m.quand),
              h('td', null, m.titre),
              h('td', null, `${m.justes}/${m.total}`),
              h('td', null, `${m.reussite}%`),
              h('td', null, `${m.minutes} min`))))))
      : h('section.carte', null, h('p', { style: { margin: 0, color: 'var(--texte-doux)' } }, 'Aucune séance enregistrée.')),

    h('div.titre-section', null, h('h2', null, 'Programme conseillé')),
    h('div.grille.grille--3', null,
      ...programme.map((j) => h('section.carte.carte--plate', null,
        h('p.sur-titre', null, j.jour),
        h('h3', { style: { fontSize: '1.05rem', margin: '4px 0 6px' } }, j.principal),
        h('p', { style: { margin: 0, fontSize: '.86rem', color: 'var(--texte-doux)' } },
          'Puis : ', j.secondaire, ' · ', j.duree),
        h('p', { style: { margin: '8px 0 0', fontSize: '.82rem', color: 'var(--texte-faible)' } }, j.pourquoi)))),

    h('div.titre-section', null, h('h2', null, 'Sauvegarde')),
    h('section.carte', null,
      h('div.avis.avis--attention', null,
        h('strong', null, 'Important : '),
        'la progression est enregistrée dans le navigateur de cet appareil (stockage local). Elle n’est ',
        h('strong', null, 'pas'),
        ' synchronisée automatiquement entre plusieurs appareils ou plusieurs navigateurs. Pour transférer la progression, utilisez l’export puis l’import ci-dessous.'),
      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' } },
        h('button.btn.btn--petit', {
          type: 'button',
          onclick() {
            const texte = exporter(p);
            const blob = new Blob([texte], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            zoneImport.replaceChildren(
              h('div.avis.avis--info', { style: { marginTop: '12px' } },
                h('p', { style: { marginTop: 0 } }, 'Sauvegarde prête. Enregistrez ce fichier dans un endroit sûr :'),
                h('a.btn.btn--petit', { href: url, download: `thao-aventure-${new Date().toISOString().slice(0, 10)}.json` },
                  svg(icone('exporter', 18)), 'Télécharger la sauvegarde'),
                h('details', { style: { marginTop: '12px' } },
                  h('summary', null, 'Ou copier le texte de la sauvegarde'),
                  h('textarea.saisie', {
                    readonly: true,
                    rows: '6',
                    style: { marginTop: '10px', fontSize: '.8rem', fontFamily: 'monospace' },
                  }, texte))),
            );
          },
        }, svg(icone('exporter', 18)), 'Exporter la progression'),
        h('button.btn.btn--petit.btn--2', {
          type: 'button',
          onclick() {
            const zone = h('textarea.saisie', { rows: '5', placeholder: 'Collez ici le contenu du fichier de sauvegarde…', style: { fontSize: '.8rem', fontFamily: 'monospace' } });
            const fichier = h('input', { type: 'file', accept: '.json,application/json' });
            const retour = h('div');
            const appliquer = (texte) => {
              const res = importer(texte);
              if (!res.ok) {
                retour.replaceChildren(h('div.avis.avis--erreur', null, res.erreur));
                return;
              }
              if (!confirm('Remplacer la progression actuelle par celle du fichier ?')) return;
              app.remplacerProfil(res.profil);
              retour.replaceChildren(h('div.avis.avis--info', null,
                'Progression importée.',
                res.reparations.length ? ` (${res.reparations.join(' · ')})` : ''));
              setTimeout(() => app.rendre(), 900);
            };
            fichier.addEventListener('change', () => {
              const f = fichier.files[0];
              if (!f) return;
              const lecteur = new FileReader();
              lecteur.onload = () => appliquer(String(lecteur.result));
              lecteur.readAsText(f);
            });
            zoneImport.replaceChildren(
              h('div.avis.avis--info', { style: { marginTop: '12px' } },
                h('p', { style: { marginTop: 0 } }, 'Choisissez le fichier de sauvegarde :'),
                fichier,
                h('p', { style: { margin: '12px 0 6px' } }, 'ou collez son contenu :'),
                zone,
                h('button.btn.btn--petit', { type: 'button', style: { marginTop: '10px' }, onclick() { appliquer(zone.value); } }, 'Importer'),
                retour),
            );
          },
        }, svg(icone('importer', 18)), 'Importer une progression')),
      zoneImport),

    h('div.titre-section', null, h('h2', null, 'À propos')),
    h('section.carte', null,
      h('p', { style: { marginTop: 0, color: 'var(--texte-doux)' } },
        `Thao Aventure contient ${s.total} exercices répartis sur 9 compétences du programme de CE2, avec ${s.formats} types d’exercices différents. `,
        'Aucune publicité, aucun compte, aucune donnée envoyée sur Internet : seuls le prénom et la progression sont enregistrés localement.'),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('span.puce', null, `${s.difficultes[1]} exercices faciles`),
        h('span.puce', null, `${s.difficultes[2]} intermédiaires`),
        h('span.puce', null, `${s.difficultes[3]} difficiles`)),
      h('button.btn.btn--3', { type: 'button', style: { marginTop: '14px' }, onclick() { app.parentOuvert = false; app.aller('#/accueil'); } },
        svg(icone('retour', 18)), 'Quitter l’espace parent')),
  );
}

/* ================================================================== */
/* PARAMÈTRES                                                          */
/* ================================================================== */

export function ecranReglages(app) {
  const p = app.profil;

  const bascule = (cle, titre, texte) => {
    const b = h('button.bascule', {
      type: 'button',
      'aria-pressed': p.reglages[cle] ? 'true' : 'false',
      onclick() {
        p.reglages[cle] = !p.reglages[cle];
        b.setAttribute('aria-pressed', p.reglages[cle] ? 'true' : 'false');
        app.appliquerReglages();
        app.sauver();
        if (cle === 'sons' && p.reglages.sons) son('juste');
      },
    },
      h('div.bascule__texte', null, h('b', null, titre), h('span', null, texte)),
      h('span.interrupteur', { 'aria-hidden': 'true' }));
    return b;
  };

  return h('div.vue.vue--etroite', null,
    h('div.titre-section', { style: { marginTop: 0 } }, h('h2', null, 'Paramètres')),
    h('div.grille', null,
      bascule('sons', 'Les sons', 'Petites musiques de réussite et de récompense.'),
      bascule('animations', 'Les animations', 'Confettis, étoiles qui bougent, transitions.'),
      bascule('grandePolice', 'Écriture plus grande', 'Pour lire plus facilement.'),
      bascule('contrasteFort', 'Contraste renforcé', 'Des couleurs plus franches et plus lisibles.')),

    h('div.titre-section', null, h('h2', null, 'Accessibilité')),
    h('section.carte', null,
      h('ul', { style: { margin: 0, paddingLeft: '20px', color: 'var(--texte-doux)' } },
        h('li', null, 'Tous les exercices se font au doigt, à la souris ou au clavier (tabulation puis Entrée).'),
        h('li', null, 'Une bonne ou une mauvaise réponse n’est jamais signalée par la couleur seule : il y a toujours un symbole (✓ ✕ !) et une phrase.'),
        h('li', null, 'Si ton appareil demande de réduire les animations, elles s’arrêtent automatiquement.'),
        h('li', null, 'Aucune réponse n’est limitée dans le temps.'))),

    h('div.titre-section', null, h('h2', null, 'Espace parent')),
    h('section.carte', null,
      h('p', { style: { marginTop: 0, color: 'var(--texte-doux)' } },
        'Le suivi détaillé, le temps passé, les taux de réussite et la sauvegarde se trouvent dans l’espace parent, protégé par un code.'),
      h('button.btn.btn--2', { type: 'button', onclick() { app.aller('#/parent'); } },
        svg(icone('parent', 20)), 'Ouvrir l’espace parent')),

    h('div.titre-section', null, h('h2', null, 'Recommencer à zéro')),
    h('section.carte', null,
      h('div.avis.avis--erreur', null,
        'Cette action efface toute la progression de ', p.prenom, ' sur cet appareil : étoiles, badges, trésors et résultats. Elle est définitive.'),
      h('button.btn.btn--2', {
        type: 'button',
        style: { marginTop: '14px' },
        onclick() {
          if (!confirm(`Effacer TOUTE la progression de ${p.prenom} ? Cette action est définitive.`)) return;
          if (!confirm('Dernière vérification : on efface vraiment tout ?')) return;
          app.reinitialiser();
        },
      }, 'Effacer la progression')),
  );
}

/* ================================================================== */

export function ecranChargement() {
  return h('div.vue', null, h('div.chargement', null,
    svg(rotateur()),
    h('p', null, 'Plume prépare ton aventure…')));
}

export function ecranErreur(message, app) {
  return h('div.vue.vue--etroite', null,
    h('section.carte', null,
      h('div.vide', null,
        svg(guide('triste'), 'bonjour__guide'),
        h('b', null, 'Oups, quelque chose n’a pas marché'),
        h('p', null, message),
        h('button.btn', { type: 'button', onclick() { app.aller('#/accueil'); } }, 'Retour à l’accueil'))));
}
