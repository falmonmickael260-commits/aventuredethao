/**
 * Statistiques pour l'espace parent.
 * Tout est calculé à partir de ce qui a RÉELLEMENT été enregistré dans le
 * profil : aucun chiffre n'est inventé ni arrondi à l'avantage de l'enfant.
 */

import { MODULES, MODULE_PAR_ID } from '../../data/modules.js';
import { ETATS } from './progression.js';

const jourISO = (d) => d.toISOString().slice(0, 10);

/** Les `n` derniers jours, du plus ancien au plus récent. */
export function derniersJours(profil, n = 14) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const cle = jourISO(d);
    const v = profil.jours[cle] || { secondes: 0, exercices: 0, justes: 0 };
    out.push({
      jour: cle,
      libelle: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      minutes: Math.round(v.secondes / 60),
      exercices: v.exercices,
      justes: v.justes,
    });
  }
  return out;
}

/** Tableau par compétence : essais, réussite, maîtrise, état. */
export function parCompetence(profil) {
  return MODULES.map((m) => {
    const s = profil.competences[m.id];
    const hist = profil.historique.filter((h) => h.module === m.id);
    const justes = hist.filter((h) => h.statut === 'juste').length;
    return {
      id: m.id,
      numero: m.numero,
      titre: m.titre,
      court: m.court,
      monde: m.monde,
      essais: s.essais,
      reussites: s.reussites,
      reussite: s.essais ? Math.round((100 * justes) / Math.max(1, hist.length)) : 0,
      maitrise: s.maitrise,
      etat: s.etat,
      etatLibelle: ETATS[s.etat]?.libelle || s.etat,
      minutes: Math.round((s.secondes || 0) / 60),
      formats: Object.entries(s.formats || {}).map(([format, f]) => ({
        format,
        essais: f.essais,
        reussites: f.reussites,
        reussite: f.essais ? Math.round((100 * f.reussites) / f.essais) : 0,
      })),
    };
  });
}

/** Les erreurs qui reviennent le plus souvent. */
export function erreursFrequentes(profil, n = 6) {
  const compte = {};
  for (const h of profil.historique) {
    if (h.statut === 'juste') continue;
    const cle = `${h.module}|${h.format}`;
    compte[cle] = (compte[cle] || 0) + 1;
  }
  return Object.entries(compte)
    .map(([cle, nb]) => {
      const [module, format] = cle.split('|');
      return { module, titre: MODULE_PAR_ID[module]?.court || module, format, nb };
    })
    .sort((a, b) => b.nb - a.nb)
    .slice(0, n);
}

/** Les dernières séances. */
export function dernieresSeances(profil, n = 8) {
  return [...profil.missions.journal]
    .reverse()
    .slice(0, n)
    .map((m) => ({
      ...m,
      quand: new Date(m.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      reussite: m.total ? Math.round((100 * m.justes) / m.total) : 0,
      competences: (m.competences || []).map((id) => MODULE_PAR_ID[id]?.court || id),
    }));
}

/** Programme conseillé pour les prochains jours. */
export function programmeConseille(profil, jours = 3) {
  const comps = parCompetence(profil).sort((a, b) => {
    const oa = ETATS[a.etat]?.ordre ?? 4;
    const ob = ETATS[b.etat]?.ordre ?? 4;
    return oa - ob || a.maitrise - b.maitrise;
  });
  const out = [];
  for (let j = 0; j < jours; j++) {
    const principal = comps[j % comps.length];
    const secondaire = comps[(j + 1) % comps.length];
    const d = new Date(Date.now() + (j + 1) * 86400000);
    out.push({
      jour: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      principal: principal.titre,
      secondaire: secondaire.titre,
      duree: '15 minutes',
      pourquoi:
        principal.etat === 'fragile'
          ? 'Cette notion est encore fragile : des exercices faciles et des indices seront proposés.'
          : principal.etat === 'nouvelle'
            ? 'Cette notion n’a pas encore été travaillée.'
            : 'Révision pour consolider ce qui est en cours d’apprentissage.',
    });
  }
  return out;
}

/** Vue d'ensemble pour l'en-tête de l'espace parent. */
export function resume(profil) {
  const total = profil.historique.length;
  const justes = profil.historique.filter((h) => h.statut === 'juste').length;
  const secondes = Object.values(profil.jours).reduce((a, j) => a + j.secondes, 0);
  const comps = parCompetence(profil);
  const joursActifs = Object.values(profil.jours).filter((j) => j.exercices > 0).length;
  return {
    exercices: total,
    justes,
    reussite: total ? Math.round((100 * justes) / total) : 0,
    minutes: Math.round(secondes / 60),
    minutesParJour: joursActifs ? Math.round(secondes / 60 / joursActifs) : 0,
    joursActifs,
    serie: profil.serieJours?.courant || 0,
    record: profil.serieJours?.record || 0,
    maitrisees: comps.filter((c) => c.etat === 'maitrisee').length,
    enCours: comps.filter((c) => c.etat === 'en-cours').length,
    fragiles: comps.filter((c) => c.etat === 'fragile').length,
    nonCommencees: comps.filter((c) => c.etat === 'nouvelle').length,
    missions: profil.missions.terminees,
    badges: profil.badges.length,
    etoiles: profil.etoiles,
    niveau: profil.niveau,
  };
}
