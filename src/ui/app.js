/**
 * Le chef d'orchestre : état, navigation, barre du haut, notifications.
 */

import { h, svg, vider, jauge, annoncer } from './dom.js';
import { icone, guide } from './art.js';
import { demarrerCiel, effacerFx, reglerEffets, son, pluieEtoiles } from './fx.js';
import { charger, marquerJour, profilVide, sauver, effacer } from '../core/stockage.js';
import { jaugeNiveau, titreNiveau, verifierBadges } from '../core/recompenses.js';
import { majMondes } from '../core/progression.js';
import { appliquerEvaluation, archiverSeance, bilanSeance } from '../core/seance.js';
import { ecranExercice } from './exercice.js';
import {
  ecranAccueil, ecranBadges, ecranCarte, ecranChargement, ecranChoisir, ecranErreur,
  ecranFin, ecranMonde, ecranParent, ecranProgres, ecranRecompenses, ecranReglages, ecranVacances,
} from './ecrans.js';

const ONGLETS = [
  { route: '#/accueil', nom: 'Accueil', ico: 'maison' },
  { route: '#/carte', nom: 'Carte', ico: 'carte' },
  { route: '#/vacances', nom: 'Mission', ico: 'mission' },
  { route: '#/progres', nom: 'Progrès', ico: 'progres' },
  { route: '#/recompenses', nom: 'Trésors', ico: 'coffre' },
];

export function demarrer(racine) {
  const { profil, reparations, disponible } = charger();

  const app = {
    profil,
    reparations,
    stockageDisponible: disponible,
    parentOuvert: false,
    fetePassee: false,
    archiveFaite: false,
    derniereSeance: null,
    route: location.hash || '#/accueil',

    sauver() {
      if (!sauver(this.profil) && this.stockageDisponible) {
        this.notifier({
          titre: 'Sauvegarde impossible',
          texte: 'Il n’y a plus de place dans la mémoire du navigateur.',
          glyphe: 'cadenas',
        });
      }
    },

    aller(route) {
      if (location.hash === route) this.rendre();
      else location.hash = route;
    },

    rendre() { rendre(app, racine); },

    ajouterTemps(secondes, exercices, justes) {
      marquerJour(this.profil, secondes, exercices, justes);
      verifierBadges(this.profil);
    },

    lancerSeance(seance) {
      if (!seance.ids.length) {
        this.notifier({
          titre: 'Aucun exercice disponible',
          texte: 'Essaie une autre compétence, ou reviens après une pause.',
          glyphe: 'indice',
        });
        return;
      }
      seance.etoiles = 0;
      this.profil.seance = seance;
      this.fetePassee = false;
      this.archiveFaite = false;
      this.derniereSeance = null;
      this.sauver();
      this.aller('#/exercice');
    },

    /** Archive la séance terminée, une seule fois. */
    archiverMaintenant(seance) {
      if (!this.archiveFaite) {
        this.archiveFaite = true;
        this.derniereSeance = { ...seance };
        if (seance.type === 'evaluation') {
          appliquerEvaluation(this.profil, seance);
          this.profil.seance = null;
          majMondes(this.profil);
        } else {
          archiverSeance(this.profil, seance);
        }
        verifierBadges(this.profil);
        this.sauver();
      }
      return { etoiles: this.derniereSeance?.etoiles || 0, bilan: bilanSeance(this.derniereSeance || seance) };
    },

    remplacerProfil(nouveau) {
      this.profil = nouveau;
      this.appliquerReglages();
      this.sauver();
    },

    reinitialiser() {
      effacer();
      this.profil = profilVide();
      this.parentOuvert = false;
      this.appliquerReglages();
      this.sauver();
      this.aller('#/accueil');
      this.rendre();
    },

    appliquerReglages() {
      const r = this.profil.reglages;
      const html = document.documentElement;
      html.dataset.police = r.grandePolice ? 'grande' : 'normale';
      html.dataset.contraste = r.contrasteFort ? 'fort' : 'normal';
      html.dataset.animations = r.animations ? 'oui' : 'non';
      reglerEffets({ animations: r.animations, sons: r.sons });
    },

    notifier({ titre, texte, glyphe = 'etoile', sonId }) {
      if (sonId) son(sonId);
      const bulle = h('div.surgit', { role: 'status' },
        h('span.surgit__icone', { 'aria-hidden': 'true' }, svg(icone(glyphe, 34))),
        h('div', null, h('b', null, titre), h('span', null, texte)));
      document.body.append(bulle);
      annoncer(`${titre}. ${texte}`);
      setTimeout(() => {
        bulle.style.transition = 'opacity .4s ease, transform .4s ease';
        bulle.style.opacity = '0';
        bulle.style.transform = 'translateY(20px)';
        setTimeout(() => bulle.remove(), 420);
      }, 3400);
    },
  };

  app.appliquerReglages();
  // Permet au harnais de test de piloter l'application depuis la console.
  if (typeof window !== 'undefined') window.__app = app;

  // Ciel étoilé
  const ciel = h('div.ciel', { 'aria-hidden': 'true' }, h('canvas'));
  document.body.prepend(ciel);
  demarrerCiel(ciel.firstElementChild);
  document.body.append(h('canvas', { id: 'fx', 'aria-hidden': 'true' }));

  window.addEventListener('hashchange', () => {
    effacerFx();
    app.route = location.hash || '#/accueil';
    app.rendre();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  });

  if (!location.hash) location.hash = '#/accueil';
  app.route = location.hash;
  rendre(app, racine);

  if (reparations.length) {
    setTimeout(() => {
      app.notifier({
        titre: 'Sauvegarde réparée',
        texte: reparations[0],
        glyphe: 'indice',
      });
    }, 900);
  }
  if (!disponible) {
    setTimeout(() => {
      app.notifier({
        titre: 'Progression non enregistrée',
        texte: 'Ce navigateur empêche la sauvegarde locale (navigation privée ?).',
        glyphe: 'cadenas',
      });
    }, 1200);
  }

  return app;
}

/* ------------------------------------------------------------------ */

function barre(app) {
  const p = app.profil;
  const j = jaugeNiveau(p.xp);
  const btnSon = h('button.bouton-icone', {
    type: 'button',
    'aria-pressed': p.reglages.sons ? 'true' : 'false',
    'aria-label': p.reglages.sons ? 'Couper les sons' : 'Activer les sons',
    title: p.reglages.sons ? 'Couper les sons' : 'Activer les sons',
    onclick() {
      p.reglages.sons = !p.reglages.sons;
      app.appliquerReglages();
      app.sauver();
      if (p.reglages.sons) son('juste');
      app.rendre();
    },
  }, svg(icone(p.reglages.sons ? 'son-on' : 'son-off', 20)));

  return h('header.barre', null,
    h('button.barre__id', {
      type: 'button',
      'aria-label': 'Retour à l’accueil',
      onclick() { app.aller('#/accueil'); },
    },
      h('span.barre__avatar', { 'aria-hidden': 'true' }, svg(guide('content'), '')),
      h('span.barre__texte', null,
        h('span.barre__nom', null, p.prenom),
        h('span.barre__titre', null, `Niveau ${j.niveau} · ${titreNiveau(j.niveau)}`))),
    h('div.barre__jauge', null, jauge(j.pourcentage, `${j.dansNiveau} XP`, `niv. ${j.niveau + 1}`)),
    h('div.compteurs', null,
      h('span.compteur.compteur--or', { title: `${p.etoiles} étoiles` },
        svg(icone('etoile', 17)), h('span', null, p.etoiles)),
      h('span.compteur.compteur--turquoise', { title: `${p.badges.length} badges` },
        svg(icone('coffre', 17)), h('span', null, p.badges.length)),
      btnSon,
      h('button.bouton-icone', {
        type: 'button',
        'aria-label': 'Paramètres',
        title: 'Paramètres',
        onclick() { app.aller('#/reglages'); },
      }, svg(icone('reglages', 20)))),
  );
}

function navigation(app) {
  const courant = app.route.split('/').slice(0, 2).join('/');
  return h('nav.nav', { 'aria-label': 'Navigation principale' },
    ...ONGLETS.map((o) => h('a.nav__item', {
      href: o.route,
      'aria-current': courant === o.route ? 'page' : null,
    }, svg(icone(o.ico, 22)), h('span', null, o.nom))),
  );
}

function ecranPour(app) {
  const route = app.route;
  if (route.startsWith('#/monde/')) return ecranMonde(app, route.split('/')[2]);
  if (route.startsWith('#/choisir/')) return ecranChoisir(app, route.split('/')[2]);
  switch (route) {
    case '#/accueil': return ecranAccueil(app);
    case '#/carte': return ecranCarte(app);
    case '#/choisir': return ecranChoisir(app, null);
    case '#/exercice': return ecranExercice(app);
    case '#/fin': return ecranFin(app);
    case '#/recompenses': return ecranRecompenses(app);
    case '#/badges': return ecranBadges(app);
    case '#/progres': return ecranProgres(app);
    case '#/vacances': return ecranVacances(app);
    case '#/parent': return ecranParent(app);
    case '#/reglages': return ecranReglages(app);
    case '#/chargement': return ecranChargement();
    default: return ecranAccueil(app);
  }
}

function rendre(app, racine) {
  let contenu;
  try {
    contenu = ecranPour(app);
  } catch (erreur) {
    console.error(erreur);
    contenu = ecranErreur(
      `Plume n’a pas réussi à ouvrir cet écran. (${erreur.message})`,
      app,
    );
  }
  const enExercice = app.route === '#/exercice';
  vider(racine);
  racine.append(
    h('div.coque', null,
      barre(app),
      !enExercice ? navigation(app) : null,
      h('main', { id: 'vue', tabindex: '-1' }, contenu)),
  );
  document.title = 'Thao Aventure';
}

export { pluieEtoiles };
