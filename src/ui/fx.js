/**
 * Effets : ciel étoilé, particules de célébration et petits sons.
 * Les sons sont SYNTHÉTISÉS (aucun fichier audio à télécharger) et peuvent
 * être coupés depuis les paramètres. Tout est désactivé si l'appareil
 * demande à réduire les animations.
 */

const reductionDemandee = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let animationsActives = true;
let sonsActifs = true;

export function reglerEffets({ animations, sons }) {
  if (animations !== undefined) animationsActives = animations && !reductionDemandee();
  if (sons !== undefined) sonsActifs = sons;
}

/* ------------------------------------------------------------------ */
/* Ciel étoilé                                                         */
/* ------------------------------------------------------------------ */

export function demarrerCiel(canvas) {
  const ctx = canvas.getContext('2d');
  let etoiles = [];
  let largeur = 0;
  let hauteur = 0;
  let brut = null;

  function dimensionner() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    largeur = canvas.clientWidth;
    hauteur = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(largeur * dpr));
    canvas.height = Math.max(1, Math.floor(hauteur * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(150, Math.round((largeur * hauteur) / 11000));
    etoiles = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * largeur,
      y: Math.random() * hauteur,
      r: 0.4 + Math.random() * 1.5,
      v: 0.02 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
      teinte: i % 7 === 0 ? '255,226,163' : i % 5 === 0 ? '91,229,214' : '233,235,255',
    }));
  }

  function dessiner(t) {
    ctx.clearRect(0, 0, largeur, hauteur);
    for (const e of etoiles) {
      if (animationsActives) {
        e.y -= e.v;
        if (e.y < -2) e.y = hauteur + 2;
      }
      const scintille = animationsActives ? 0.55 + 0.45 * Math.sin(t / 900 + e.phase) : 0.75;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${e.teinte},${(scintille * 0.85).toFixed(3)})`;
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    brut = requestAnimationFrame(dessiner);
  }

  dimensionner();
  window.addEventListener('resize', dimensionner);
  brut = requestAnimationFrame(dessiner);
  return () => { if (brut) cancelAnimationFrame(brut); window.removeEventListener('resize', dimensionner); };
}

/* ------------------------------------------------------------------ */
/* Particules de fête                                                  */
/* ------------------------------------------------------------------ */

const COULEURS = ['#ffc24b', '#2fd6c4', '#8b6cf0', '#ff8a4c', '#ffe2a3', '#5fd98a'];
let toile = null;
let contexte = null;
let particules = [];
let boucle = null;

function preparerToile() {
  if (toile && toile.isConnected) return;
  toile = document.getElementById('fx');
  if (!toile) return;
  contexte = toile.getContext('2d');
  const ajuster = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    toile.width = Math.floor(toile.clientWidth * dpr);
    toile.height = Math.floor(toile.clientHeight * dpr);
    contexte.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  ajuster();
  window.addEventListener('resize', ajuster);
}

function animer() {
  if (!contexte) return;
  contexte.clearRect(0, 0, toile.clientWidth, toile.clientHeight);
  particules = particules.filter((p) => p.vie > 0);
  for (const p of particules) {
    p.vie -= 1;
    p.vx *= 0.99;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vrot;
    contexte.save();
    contexte.translate(p.x, p.y);
    contexte.rotate(p.rot);
    contexte.globalAlpha = Math.max(0, Math.min(1, p.vie / 40));
    contexte.fillStyle = p.couleur;
    if (p.forme === 'etoile') {
      contexte.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        contexte[i ? 'lineTo' : 'moveTo'](Math.cos(a) * p.t, Math.sin(a) * p.t);
      }
      contexte.closePath();
      contexte.fill();
    } else if (p.forme === 'rond') {
      contexte.beginPath();
      contexte.arc(0, 0, p.t / 1.6, 0, Math.PI * 2);
      contexte.fill();
    } else {
      contexte.fillRect(-p.t / 2, -p.t / 3, p.t, p.t / 1.6);
    }
    contexte.restore();
  }
  if (particules.length) boucle = requestAnimationFrame(animer);
  else {
    boucle = null;
    contexte.clearRect(0, 0, toile.clientWidth, toile.clientHeight);
  }
}

/** Efface immédiatement les particules (changement d'écran). */
export function effacerFx() {
  particules = [];
  if (boucle) {
    cancelAnimationFrame(boucle);
    boucle = null;
  }
  if (contexte && toile) contexte.clearRect(0, 0, toile.clientWidth, toile.clientHeight);
}

/** Petite gerbe de confettis à un endroit donné. */
export function confettis(x, y, nombre = 46) {
  if (!animationsActives) return;
  preparerToile();
  if (!contexte) return;
  for (let i = 0; i < nombre; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
    const force = 4 + Math.random() * 9;
    particules.push({
      x, y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      g: 0.19 + Math.random() * 0.1,
      t: 5 + Math.random() * 7,
      rot: Math.random() * 6,
      vrot: (Math.random() - 0.5) * 0.4,
      vie: 60 + Math.random() * 45,
      couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
      forme: ['carre', 'rond', 'etoile'][Math.floor(Math.random() * 3)],
    });
  }
  if (!boucle) boucle = requestAnimationFrame(animer);
}

/** Grande célébration : pluie d'étoiles sur tout l'écran. */
export function pluieEtoiles(nombre = 90) {
  if (!animationsActives) return;
  preparerToile();
  if (!contexte) return;
  const l = toile.clientWidth;
  for (let i = 0; i < nombre; i++) {
    particules.push({
      x: Math.random() * l,
      y: -20 - Math.random() * 180,
      vx: (Math.random() - 0.5) * 1.6,
      vy: 1.5 + Math.random() * 3,
      g: 0.035,
      t: 5 + Math.random() * 9,
      rot: Math.random() * 6,
      vrot: (Math.random() - 0.5) * 0.22,
      vie: 150 + Math.random() * 110,
      couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
      forme: Math.random() > 0.45 ? 'etoile' : 'rond',
    });
  }
  if (!boucle) boucle = requestAnimationFrame(animer);
}

/* ------------------------------------------------------------------ */
/* Sons synthétisés                                                    */
/* ------------------------------------------------------------------ */

let audio = null;

function contexteAudio() {
  if (!sonsActifs) return null;
  if (audio) return audio;
  const Classe = window.AudioContext || window.webkitAudioContext;
  if (!Classe) return null;
  try {
    audio = new Classe();
  } catch {
    audio = null;
  }
  return audio;
}

function note(frequence, debut, duree, volume = 0.16, forme = 'sine') {
  const ctx = contexteAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = forme;
  osc.frequency.value = frequence;
  const t = ctx.currentTime + debut;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duree + 0.02);
}

const MELODIES = {
  clic: [[520, 0, 0.06, 0.05]],
  juste: [[659, 0, 0.14, 0.13], [784, 0.09, 0.16, 0.13], [1047, 0.19, 0.3, 0.12]],
  presque: [[587, 0, 0.14, 0.11], [699, 0.1, 0.22, 0.1]],
  faux: [[392, 0, 0.17, 0.09, 'triangle'], [349, 0.12, 0.26, 0.08, 'triangle']],
  indice: [[880, 0, 0.1, 0.08], [1175, 0.08, 0.18, 0.07]],
  badge: [[523, 0, 0.14, 0.12], [659, 0.1, 0.14, 0.12], [784, 0.2, 0.14, 0.12], [1047, 0.3, 0.42, 0.13]],
  niveau: [[440, 0, 0.12, 0.11], [554, 0.1, 0.12, 0.11], [659, 0.2, 0.12, 0.11], [880, 0.3, 0.5, 0.12]],
  coffre: [[294, 0, 0.2, 0.1, 'triangle'], [392, 0.14, 0.18, 0.11], [523, 0.26, 0.2, 0.11], [784, 0.38, 0.55, 0.12]],
  fin: [[523, 0, 0.16, 0.12], [659, 0.12, 0.16, 0.12], [784, 0.24, 0.18, 0.12], [1047, 0.38, 0.3, 0.12], [1319, 0.5, 0.5, 0.1]],
};

/** Joue un petit son. Silencieux si les sons sont coupés. */
export function son(nom) {
  if (!sonsActifs) return;
  const melodie = MELODIES[nom];
  if (!melodie) return;
  const ctx = contexteAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  for (const [f, d, duree, v, forme] of melodie) note(f, d, duree, v, forme);
}

/** Vibration courte (si l'appareil le permet). */
export function vibrer(ms = 18) {
  if (!animationsActives) return;
  if (navigator.vibrate) {
    try { navigator.vibrate(ms); } catch { /* sans importance */ }
  }
}
