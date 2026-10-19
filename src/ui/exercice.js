/**
 * L'écran d'exercice : la pièce maîtresse.
 *
 * Déroulement d'une erreur, comme demandé :
 *   1er essai raté  → message bienveillant + « Réessayer »
 *   2e essai raté   → l'indice s'affiche tout seul
 *   3e essai raté   → l'explication et la bonne réponse apparaissent,
 *                     avec la possibilité de refaire un exercice du même genre.
 * Une erreur ne retire jamais d'étoiles ni de badges.
 */

import { h, svg, annoncer, jauge, focusPremier } from './dom.js';
import { icone, guide } from './art.js';
import { confettis, pluieEtoiles, son, vibrer } from './fx.js';
import { creerInteraction } from './interactions.js';
import { corriger } from '../core/correction.js';
import { MODULE_PAR_ID } from '../../data/modules.js';
import { BANQUE, exerciceParId } from '../../data/bank/index.js';
import { enregistrerReponse, majMondes } from '../core/progression.js';
import { recompenser } from '../core/recompenses.js';
import { idCourant, noterEtAvancer, progressionSeance } from '../core/seance.js';

const TITRES_JUSTE = [
  'Bravo Thao !', 'Parfait !', 'Excellent !', 'Tu assures !', 'Magnifique !', 'Tout juste !',
];
const TITRES_PRESQUE = ['Tu y es presque !', 'Presque !', 'Tout près du but !'];
const TITRES_FAUX = ['Pas tout à fait…', 'Essaie encore !', 'Ce n’est pas encore ça…'];

const auHasard = (liste, graine) => liste[graine % liste.length];

export function ecranExercice(app) {
  const seance = app.profil.seance;
  if (!seance || seance.fini) {
    app.aller('#/fin');
    return h('div');
  }
  const exId = idCourant(seance);
  const ex = exId ? exerciceParId(exId) : null;
  if (!ex) {
    seance.fini = true;
    app.sauver();
    app.aller('#/fin');
    return h('div');
  }

  const mod = MODULE_PAR_ID[ex.module];
  const prog = progressionSeance(seance);
  const etat = { essais: 0, indiceVu: false, resolu: false, verrouille: false, debut: Date.now() };

  const zoneRetour = h('div');
  const zoneIndice = h('div');
  const zoneActions = h('div.actions');

  // L'interaction est créée APRÈS les boutons : certaines interactions
  // (colonnes, ordre, paires) préviennent l'écran dès leur construction.
  let interaction = null;

  const ctx = {
    get verrouille() { return etat.verrouille; },
    change() { majBoutons(); },
    valider() { if (!etat.verrouille && interaction && interaction.pret()) validerReponse(); },
  };

  const btnValider = h('button.btn.btn--turquoise', {
    type: 'button',
    disabled: true,
    onclick: validerReponse,
  }, svg(icone('check', 22)), 'Vérifier ma réponse');

  const btnIndice = h('button.btn.btn--2.btn--petit', {
    type: 'button',
    onclick: montrerIndice,
  }, svg(icone('indice', 20)), 'Un indice');

  function majBoutons() {
    if (!interaction) return;
    btnValider.disabled = etat.verrouille || !interaction.pret();
  }

  interaction = creerInteraction(ex, ctx);
  majBoutons();

  function montrerIndice() {
    if (etat.indiceVu) return;
    etat.indiceVu = true;
    son('indice');
    zoneIndice.replaceChildren(
      h('div.indice', null,
        svg(icone('indice', 24), 'indice__icone'),
        h('div', null, h('strong', null, 'Indice : '), ex.indice)),
    );
    annoncer(`Indice : ${ex.indice}`);
    btnIndice.disabled = true;
  }

  function dessinerActions(boutons) {
    zoneActions.replaceChildren(...boutons.filter(Boolean));
  }

  /** Enregistre définitivement la réponse dans la progression. */
  function enregistrer(resultat) {
    const secondes = Math.min(600, Math.round((Date.now() - etat.debut) / 1000));
    const premier = etat.essais <= 1;
    enregistrerReponse(app.profil, ex, resultat, {
      essais: etat.essais,
      premierEssai: premier,
      secondes,
    });
    const gains = recompenser(app.profil, ex, resultat, premier);
    seance.etoiles = (seance.etoiles || 0) + gains.etoiles;
    noterEtAvancer(seance, ex.id, resultat.statut, etat.essais, secondes);
    app.ajouterTemps(secondes, 1, resultat.statut === 'juste' ? 1 : 0);
    const mondesOuverts = majMondes(app.profil);
    app.sauver();

    if (gains.niveauGagne) {
      app.notifier({
        titre: `Niveau ${gains.niveauGagne} atteint !`,
        texte: 'Ton aventure continue de grandir.',
        glyphe: 'eclair',
        sonId: 'niveau',
      });
    }
    for (const badge of gains.badges) {
      app.notifier({
        titre: `Badge « ${badge.nom} »`,
        texte: badge.texte,
        glyphe: badge.icone,
        sonId: 'badge',
      });
    }
    for (const monde of mondesOuverts) {
      app.notifier({
        titre: `${monde.titre} est ouvert !`,
        texte: 'Un nouveau monde t’attend sur la carte.',
        glyphe: 'carte',
        sonId: 'coffre',
      });
    }
    if (gains.coffre) {
      app.notifier({
        titre: 'Un coffre t’attend !',
        texte: 'Va l’ouvrir dans tes récompenses.',
        glyphe: 'coffre',
        sonId: 'coffre',
      });
    }
    return gains;
  }

  function continuer() {
    app.aller(seance.fini ? '#/fin' : '#/exercice');
  }

  function exerciceSimilaire() {
    const dejaVus = new Set(seance.ids);
    const candidat =
      BANQUE.find((e) => e.format === ex.format && e.difficulte === 1 && !dejaVus.has(e.id)) ||
      BANQUE.find((e) => e.module === ex.module && e.difficulte === 1 && !dejaVus.has(e.id));
    if (candidat) {
      seance.ids.splice(seance.index, 0, candidat.id);
      seance.fini = false;
      app.sauver();
    }
    app.aller('#/exercice');
  }

  function validerReponse() {
    if (etat.verrouille) return;
    const resultat = corriger(ex, interaction.saisie());
    if (resultat.vide) {
      zoneRetour.replaceChildren(h('div.retour.retour--presque', null,
        h('div.retour__icone', null, '?'),
        h('div', null,
          h('div.retour__titre', null, 'Il manque ta réponse'),
          h('div.retour__texte', null, resultat.message))));
      return;
    }

    etat.essais += 1;
    // On ne dévoile la solution qu'à la réussite ou après le 3e essai :
    // sinon, le premier essai raté donnerait la réponse.
    const reveler = resultat.statut === 'juste' || etat.essais >= 3;
    interaction.marquer(resultat, reveler);

    if (resultat.statut === 'juste') {
      etat.resolu = true;
      etat.verrouille = true;
      interaction.verrouiller();
      const gains = enregistrer(resultat);
      son('juste');
      vibrer(22);
      const r = btnValider.getBoundingClientRect();
      confettis(r.left + r.width / 2, r.top, 54);
      afficherRetour('juste', resultat, gains);
      dessinerActions([
        h('button.btn', { type: 'button', onclick: continuer },
          seance.index >= seance.ids.length ? 'Voir mes résultats' : 'Exercice suivant',
          svg(icone('suivant', 22))),
      ]);
      annoncer(`Bonne réponse. ${resultat.message}`);
      return;
    }

    // Réponse incorrecte ou incomplète
    son(resultat.statut === 'presque' ? 'presque' : 'faux');
    afficherRetour(resultat.statut, resultat, null);
    annoncer(resultat.message);

    if (etat.essais >= 3) {
      etat.resolu = true;
      etat.verrouille = true;
      interaction.verrouiller();
      enregistrer(resultat);
      montrerIndice();
      zoneRetour.append(
        h('div.retour__plus', null,
          h('strong', null, 'La bonne réponse : '),
          ex.explication,
          ex.reponse.solution ? h('div', { style: { marginTop: '6px' } }, h('em', null, `Exemple : « ${ex.reponse.solution} »`)) : null),
      );
      dessinerActions([
        h('button.btn.btn--violet', { type: 'button', onclick: exerciceSimilaire },
          svg(icone('cible', 20)), 'Un exercice du même genre'),
        h('button.btn.btn--2', { type: 'button', onclick: continuer }, 'Continuer', svg(icone('suivant', 20))),
      ]);
      return;
    }

    if (etat.essais === 2) montrerIndice();

    dessinerActions([
      h('button.btn.btn--turquoise', {
        type: 'button',
        onclick() {
          etat.verrouille = false;
          interaction.reinitialiser();
          zoneRetour.replaceChildren();
          dessinerActions([btnValider, !etat.indiceVu && btnIndice]);
          majBoutons();
          if (interaction.focus) interaction.focus();
        },
      }, svg(icone('retour', 20)), 'Réessayer'),
      !etat.indiceVu && btnIndice,
    ]);
    etat.verrouille = true;
  }

  function afficherRetour(statut, resultat, gains) {
    const graine = etat.essais + ex.id.length;
    const titres = statut === 'juste' ? TITRES_JUSTE : statut === 'presque' ? TITRES_PRESQUE : TITRES_FAUX;
    const marque = statut === 'juste' ? '✓' : statut === 'presque' ? '!' : '✕';
    zoneRetour.replaceChildren(
      h(`div.retour.retour--${statut}`, { role: 'status' },
        h('div.retour__icone', { 'aria-hidden': 'true' }, marque),
        h('div', { style: { flex: '1' } },
          h('div.retour__titre', null, auHasard(titres, graine)),
          h('div.retour__texte', null, resultat.message),
          statut === 'juste' && ex.explication
            ? h('div.retour__plus', null, ex.explication)
            : null,
          gains && gains.xp
            ? h('div', { style: { marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
                h('span.puce.puce--termine', null, `+${gains.xp} XP`),
                h('span.puce.puce--termine', null, `+${gains.etoiles} ★`))
            : null)),
    );
  }

  dessinerActions([btnValider, btnIndice]);

  const quitter = h('button.bouton-icone', {
    type: 'button',
    'aria-label': 'Mettre en pause et revenir à l’accueil',
    title: 'Pause',
    onclick() {
      app.sauver();
      app.aller('#/accueil');
    },
  }, svg(icone('pause', 20)));

  const page = h('section.page-travail.apparait', { data: { exercice: ex.id, type: ex.type } },
    h('p.consigne', null, h('strong', null, ex.consigne)),
    interaction.el,
    zoneIndice,
    zoneRetour,
  );

  const vue = h('div.vue.vue--etroite', null,
    h('div.ex-haut', null,
      quitter,
      h('div', { style: { minWidth: '0' } },
        h('div.ex-haut__titre', null, mod ? mod.court : ex.module),
        h('div.ex-haut__sous', null, `Exercice ${Math.min(prog.faits + 1, prog.total)} sur ${prog.total} · ${seance.titre}`)),
      h('div.ex-haut__jauge', null, jauge(prog.pourcentage)),
      h('div.points', { title: `Difficulté ${ex.difficulte} sur 3`, 'aria-label': `Difficulté ${ex.difficulte} sur 3` },
        ...[1, 2, 3].map((n) => h('span.point', { class: n <= ex.difficulte ? 'point--plein' : '' })))),
    page,
    zoneActions,
  );

  setTimeout(() => {
    if (interaction.focus) interaction.focus();
    else focusPremier(page);
  }, 60);

  return vue;
}

/** Petit encart « Plume » qui félicite en fin de séance. */
export function motDePlume(texte, expression = 'content') {
  return h('div.bonjour.carte', null,
    h('div', null, h('p', { style: { margin: 0 } }, texte)),
    svg(guide(expression), 'bonjour__guide flotte'));
}

export { pluieEtoiles };
