/**
 * Récompenses : expérience, niveaux, badges, coffres et collection.
 *
 * Règle d'or : une récompense gagnée ne se perd JAMAIS. Une erreur ou une
 * mauvaise séance ne retire ni étoile, ni badge, ni trésor.
 */

const PALIERS = (() => {
  const liste = [0];
  let pas = 80;
  for (let i = 1; i <= 40; i++) {
    liste.push(liste[i - 1] + pas);
    pas += 20;
  }
  return liste;
})();

/** Niveau correspondant à une quantité d'expérience. */
export function niveauPour(xp) {
  let n = 1;
  while (n < PALIERS.length && xp >= PALIERS[n]) n += 1;
  return n;
}

/** Infos d'affichage de la barre d'expérience. */
export function jaugeNiveau(xp) {
  const niveau = niveauPour(xp);
  const bas = PALIERS[niveau - 1] ?? 0;
  const haut = PALIERS[niveau] ?? bas + 100;
  return {
    niveau,
    xp,
    bas,
    haut,
    dansNiveau: xp - bas,
    pourNiveau: haut - bas,
    pourcentage: Math.min(100, Math.round((100 * (xp - bas)) / (haut - bas))),
  };
}

export const TITRES_NIVEAU = [
  'Apprenti des mots',
  'Chercheur de noms',
  'Éclaireur de phrases',
  'Compagnon des verbes',
  'Gardien de l’imparfait',
  'Bâtisseur de familles',
  'Lecteur d’étoiles',
  'Maître des pages',
  'Grand explorateur',
  'Légende de l’Atlas',
];

export function titreNiveau(niveau) {
  return TITRES_NIVEAU[Math.min(TITRES_NIVEAU.length - 1, Math.floor((niveau - 1) / 2))];
}

/* ------------------------------------------------------------------ */
/* Badges                                                             */
/* ------------------------------------------------------------------ */

const justesDe = (profil, module) =>
  profil.historique.filter((h) => h.module === module && h.statut === 'juste').length;

export const BADGES = [
  {
    id: 'premiers-pas',
    nom: 'Premiers pas',
    texte: 'Ton tout premier exercice terminé !',
    icone: 'etoile',
    test: (p) => p.historique.length >= 1,
  },
  {
    id: 'detective-des-noms',
    nom: 'Détective des noms',
    texte: '15 exercices réussis au village des noms.',
    icone: 'loupe',
    test: (p) => justesDe(p, 'm1') >= 15,
  },
  {
    id: 'oeil-de-majuscule',
    nom: 'Œil de majuscule',
    texte: 'Tu ne confonds plus noms propres et noms communs.',
    icone: 'maj',
    test: (p) => p.competences.m2.etat === 'maitrisee',
  },
  {
    id: 'gardien-des-accords',
    nom: 'Gardien des accords',
    texte: '20 accords réussis sans faute.',
    icone: 'bouclier',
    test: (p) => justesDe(p, 'm3') >= 20,
  },
  {
    id: 'coupeur-de-phrases',
    nom: 'Coupeur de phrases',
    texte: '15 phrases coupées au bon endroit.',
    icone: 'ciseaux',
    test: (p) => justesDe(p, 'm4') >= 15,
  },
  {
    id: 'chasseur-de-verbes',
    nom: 'Chasseur de verbes',
    texte: '20 verbes démasqués au château.',
    icone: 'epee',
    test: (p) => justesDe(p, 'm5') >= 20,
  },
  {
    id: 'champion-imparfait',
    nom: 'Champion de l’imparfait',
    texte: 'La montagne de l’imparfait est à toi.',
    icone: 'montagne',
    test: (p) => p.competences.m6.etat === 'maitrisee',
  },
  {
    id: 'maitre-des-familles',
    nom: 'Maître des familles',
    texte: '15 familles de mots reconstituées.',
    icone: 'engrenage',
    test: (p) => justesDe(p, 'm7') >= 15,
  },
  {
    id: 'maitre-de-alphabet',
    nom: 'Maître de l’alphabet',
    texte: 'De A à Z, plus aucune hésitation.',
    icone: 'abc',
    test: (p) => p.competences.m8.etat === 'maitrisee',
  },
  {
    id: 'explorateur-du-dictionnaire',
    nom: 'Explorateur du dictionnaire',
    texte: '20 recherches réussies dans la bibliothèque.',
    icone: 'livre',
    test: (p) => justesDe(p, 'm9') >= 20,
  },
  {
    id: 'super-observateur',
    nom: 'Super observateur',
    texte: '25 exercices de repérage réussis.',
    icone: 'oeil',
    test: (p) =>
      p.historique.filter((h) => h.statut === 'juste' && String(h.format).startsWith('clic')).length >= 10 ||
      p.historique.filter((h) => h.statut === 'juste' && ['trouve-noms', 'trouve-det', 'detective', 'clic-sujet', 'clic-gv', 'clic-verbe', 'verbes-texte', 'detecte-erreur'].includes(h.format)).length >= 25,
  },
  {
    id: 'perseverant',
    nom: 'Persévérant',
    texte: '5 fois, tu as réussi après plusieurs essais. Bravo de ne pas abandonner !',
    icone: 'coeur',
    test: (p) => p.historique.filter((h) => h.statut === 'juste' && h.essais >= 3).length >= 5,
  },
  {
    id: 'ecrivain',
    nom: 'Plume d’écrivain',
    texte: '20 réponses écrites au clavier, justes du premier coup.',
    icone: 'plume',
    test: (p) =>
      p.historique.filter(
        (h) => h.statut === 'juste' && ['transforme', 'invente-phrase', 'corrige-imparfait', 'corrige-groupe', 'complete-sujet', 'ecris-propre', 'ecris-commun', 'ecris-famille', 'ecris-liste', 'ecris-infinitif', 'mystere', 'indices'].includes(h.format),
      ).length >= 20,
  },
  {
    id: 'sans-faute',
    nom: 'Dix sur dix',
    texte: '10 bonnes réponses d’affilée.',
    icone: 'eclair',
    test: (p) => {
      let serie = 0;
      let max = 0;
      for (const h of p.historique) {
        serie = h.statut === 'juste' ? serie + 1 : 0;
        max = Math.max(max, serie);
      }
      return max >= 10;
    },
  },
  {
    id: 'regulier',
    nom: 'Régulier',
    texte: '3 jours d’aventure de suite.',
    icone: 'calendrier',
    test: (p) => (p.serieJours?.record || 0) >= 3,
  },
  {
    id: 'marathonien',
    nom: 'Marathonien des vacances',
    texte: '7 jours d’aventure de suite !',
    icone: 'trophee',
    test: (p) => (p.serieJours?.record || 0) >= 7,
  },
  {
    id: 'cent-exercices',
    nom: 'Centenaire',
    texte: '100 exercices terminés.',
    icone: 'cent',
    test: (p) => p.historique.length >= 100,
  },
  {
    id: 'explorateur',
    nom: 'Explorateur',
    texte: '3 mondes débloqués.',
    icone: 'carte',
    test: (p) => Object.values(p.mondes).filter((w) => w.debloque).length >= 3,
  },
  {
    id: 'grand-voyageur',
    nom: 'Grand voyageur',
    texte: 'Les six mondes sont ouverts !',
    icone: 'boussole',
    test: (p) => Object.values(p.mondes).filter((w) => w.debloque).length >= 6,
  },
  {
    id: 'collectionneur',
    nom: 'Collectionneur',
    texte: '6 trésors dans ta collection.',
    icone: 'coffre',
    test: (p) => p.tresors.length >= 6,
  },
  {
    id: 'missionnaire',
    nom: 'Dix missions',
    texte: '10 missions du jour terminées.',
    icone: 'drapeau',
    test: (p) => (p.missions?.terminees || 0) >= 10,
  },
];

/** Vérifie tous les badges et renvoie ceux qui viennent d'être gagnés. */
export function verifierBadges(profil) {
  const deja = new Set(profil.badges.map((b) => b.id));
  const gagnes = [];
  for (const badge of BADGES) {
    if (deja.has(badge.id)) continue;
    let ok = false;
    try {
      ok = badge.test(profil);
    } catch {
      ok = false;
    }
    if (ok) {
      profil.badges.push({ id: badge.id, date: new Date().toISOString() });
      gagnes.push(badge);
    }
  }
  return gagnes;
}

export const BADGE_PAR_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/* ------------------------------------------------------------------ */
/* Coffres et collection de trésors                                    */
/* ------------------------------------------------------------------ */

export const TRESORS = [
  { id: 'glouby', nom: 'Glouby', texte: 'Un petit monstre qui avale les fautes d’accord.', couleur: '#2FD6C4' },
  { id: 'pilou', nom: 'Pilou', texte: 'Ce lutin colle les déterminants devant les noms.', couleur: '#8B6CF0' },
  { id: 'zibou', nom: 'Zibou', texte: 'Il ronronne quand une phrase est bien coupée.', couleur: '#FFC24B' },
  { id: 'rouly', nom: 'Rouly', texte: 'Un robot qui conjugue en dormant.', couleur: '#FF8A4C' },
  { id: 'mousse', nom: 'Mousse', texte: 'Un arbuste bavard, cousin de l’arbre et de l’arbrisseau.', couleur: '#5FD98A' },
  { id: 'lampyre', nom: 'Lampyre', texte: 'Une luciole qui éclaire les mots repères.', couleur: '#FFE2A3' },
  { id: 'grimoire', nom: 'Grimoire', texte: 'Un livre qui se range tout seul par ordre alphabétique.', couleur: '#B78BF5' },
  { id: 'brindille', nom: 'Brindille', texte: 'L’esprit des sentiers de la forêt des phrases.', couleur: '#A8F0B5' },
  { id: 'tempo', nom: 'Vieux Tempo', texte: 'Il raconte toujours ce qui se passait AVANT.', couleur: '#7FC8FF' },
  { id: 'mo', nom: 'Mo', texte: 'Le marchand de mots du village.', couleur: '#5BE5D6' },
  { id: 'verbo', nom: 'Sire Verbo', texte: 'Il connaît l’infinitif de tous les verbes du royaume.', couleur: '#D9C2FF' },
  { id: 'plume-or', nom: 'Plume d’or', texte: 'La plume de la gardienne de la bibliothèque.', couleur: '#FFC24B' },
];

/** Ouvre un coffre : donne un trésor pas encore possédé, et des étoiles. */
export function ouvrirCoffre(profil) {
  if (profil.coffresEnAttente <= 0) return null;
  profil.coffresEnAttente -= 1;
  const possedes = new Set(profil.tresors.map((t) => t.id));
  const restants = TRESORS.filter((t) => !possedes.has(t.id));
  const bonusEtoiles = 3;
  profil.etoiles += bonusEtoiles;
  if (!restants.length) {
    return { tresor: null, etoiles: bonusEtoiles, xp: 20, deja: true };
  }
  const index = (profil.tresors.length * 7 + profil.historique.length) % restants.length;
  const tresor = restants[index];
  profil.tresors.push({ id: tresor.id, date: new Date().toISOString() });
  profil.xp += 20;
  return { tresor, etoiles: bonusEtoiles, xp: 20, deja: false };
}

/* ------------------------------------------------------------------ */
/* Attribution après un exercice                                       */
/* ------------------------------------------------------------------ */

/**
 * Ajoute les gains d'un exercice réussi.
 * @returns {{xp:number, etoiles:number, niveauGagne:number|null, badges:object[], coffre:boolean}}
 */
export function recompenser(profil, exercice, resultat, premierEssai = true) {
  if (resultat.statut !== 'juste') {
    // Aucune perte : on encourage simplement l'effort.
    const badges = verifierBadges(profil);
    return { xp: 0, etoiles: 0, niveauGagne: null, badges, coffre: false };
  }
  const base = exercice.recompense;
  const xp = premierEssai ? base.xp : Math.max(5, Math.round(base.xp * 0.6));
  const etoiles = premierEssai ? base.etoiles : Math.max(1, base.etoiles - 1);
  const niveauAvant = niveauPour(profil.xp);
  profil.xp += xp;
  profil.etoiles += etoiles;
  const niveauApres = niveauPour(profil.xp);
  profil.niveau = niveauApres;

  // Un coffre tous les 10 exercices réussis.
  const justes = profil.historique.filter((h) => h.statut === 'juste').length;
  let coffre = false;
  if (justes > 0 && justes % 10 === 0) {
    profil.coffresEnAttente += 1;
    coffre = true;
  }

  const badges = verifierBadges(profil);
  return {
    xp,
    etoiles,
    niveauGagne: niveauApres > niveauAvant ? niveauApres : null,
    badges,
    coffre,
  };
}
