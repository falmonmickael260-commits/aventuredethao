/** Mini-outils d'affichage : créer des éléments sans bibliothèque. */

/**
 * Crée un élément.
 * h('div.carte', { onclick: f }, 'texte', autreElement)
 * Le premier argument accepte « balise.classe1.classe2 ».
 */
export function h(selecteur, attrs, ...enfants) {
  const [balise, ...classes] = String(selecteur).split('.');
  const el = document.createElement(balise || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (attrs && (typeof attrs !== 'object' || Array.isArray(attrs) || attrs instanceof Node)) {
    enfants.unshift(attrs);
    attrs = null;
  }
  for (const [cle, valeur] of Object.entries(attrs || {})) {
    if (valeur === null || valeur === undefined || valeur === false) continue;
    if (cle === 'class') el.className = `${el.className} ${valeur}`.trim();
    else if (cle === 'html') el.innerHTML = valeur;
    else if (cle === 'style' && typeof valeur === 'object') Object.assign(el.style, valeur);
    else if (cle === 'data') for (const [d, v] of Object.entries(valeur)) el.dataset[d] = v;
    else if (cle.startsWith('on') && typeof valeur === 'function') {
      el.addEventListener(cle.slice(2), valeur);
    } else el.setAttribute(cle, valeur === true ? '' : valeur);
  }
  ajouter(el, enfants);
  return el;
}

function ajouter(el, enfants) {
  for (const enfant of enfants.flat(4)) {
    if (enfant === null || enfant === undefined || enfant === false) continue;
    el.append(enfant instanceof Node ? enfant : document.createTextNode(String(enfant)));
  }
}

/** Remplace tout le contenu d'un élément. */
export function vider(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

/** Insère du SVG brut. */
export function svg(code, classe) {
  const span = document.createElement('span');
  span.innerHTML = code;
  const el = span.firstElementChild;
  if (el && classe) el.setAttribute('class', classe);
  return el || span;
}

/** Jauge de progression accessible. */
export function jauge(pourcentage, texteGauche, texteDroite) {
  return h(
    'div',
    null,
    h('div.jauge', { role: 'progressbar', 'aria-valuenow': Math.round(pourcentage), 'aria-valuemin': 0, 'aria-valuemax': 100 },
      h('div.jauge__plein', { style: { width: `${Math.max(0, Math.min(100, pourcentage))}%` } })),
    (texteGauche || texteDroite) && h('div.jauge__texte', null, h('span', null, texteGauche || ''), h('span', null, texteDroite || '')),
  );
}

/** Anneau de progression (grande valeur centrale). */
export function anneau(pourcentage, valeur, libelle, couleur = 'var(--or)') {
  const r = 62;
  const c = 2 * Math.PI * r;
  const rempli = (Math.max(0, Math.min(100, pourcentage)) / 100) * c;
  return h('div.anneau', null,
    svg(`<svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="12"/>
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="${couleur}" stroke-width="12"
        stroke-linecap="round" stroke-dasharray="${rempli} ${c}"/>
    </svg>`),
    h('div.anneau__val', null, h('b', null, valeur), h('span', null, libelle)),
  );
}

/** Met le focus sur le premier élément interactif d'un conteneur. */
export function focusPremier(conteneur) {
  const cible = conteneur.querySelector('input, button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (cible && typeof cible.focus === 'function') cible.focus({ preventScroll: true });
}

/** Annonce un message aux lecteurs d'écran. */
let zoneAnnonce = null;
export function annoncer(texte) {
  if (!zoneAnnonce) {
    zoneAnnonce = h('div.pour-lecteur', { role: 'status', 'aria-live': 'polite' });
    document.body.append(zoneAnnonce);
  }
  zoneAnnonce.textContent = '';
  setTimeout(() => { zoneAnnonce.textContent = texte; }, 60);
}
