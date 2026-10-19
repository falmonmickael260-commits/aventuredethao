/**
 * Toutes les illustrations de Thao Aventure, dessinées en SVG.
 * Aucun fichier image : tout est vectoriel, net sur tous les écrans,
 * et fonctionne hors connexion.
 */

let compteur = 0;
const uid = () => `g${(compteur += 1)}`;

/* ------------------------------------------------------------------ */
/* Plume, la petite chouette qui accompagne Thao                      */
/* ------------------------------------------------------------------ */

const YEUX = {
  bonjour: '<circle cx="40" cy="44" r="4.6" fill="#141a45"/><circle cx="60" cy="44" r="4.6" fill="#141a45"/>',
  content: '<path d="M34 44q6-7 12 0" stroke="#141a45" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M54 44q6-7 12 0" stroke="#141a45" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
  pensif: '<circle cx="41" cy="45" r="4.2" fill="#141a45"/><circle cx="61" cy="45" r="4.2" fill="#141a45"/><path d="M33 34q7-4 14-1" stroke="#141a45" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  bravo: '<path d="M33 45q7-9 14 0" stroke="#141a45" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M53 45q7-9 14 0" stroke="#141a45" stroke-width="3.6" fill="none" stroke-linecap="round"/><circle cx="26" cy="56" r="4" fill="#ff9aa8" opacity=".6"/><circle cx="74" cy="56" r="4" fill="#ff9aa8" opacity=".6"/>',
  triste: '<circle cx="40" cy="46" r="4.2" fill="#141a45"/><circle cx="60" cy="46" r="4.2" fill="#141a45"/><path d="M34 37q6 3 12 0" stroke="#141a45" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M54 37q6 3 12 0" stroke="#141a45" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
};

/** Le personnage-guide. `expression` : bonjour | content | pensif | bravo | triste */
export function guide(expression = 'bonjour', classe = '') {
  const g = uid();
  return `<svg viewBox="0 0 100 112" class="${classe}" role="img" aria-label="Plume, la chouette qui guide Thao">
    <defs>
      <linearGradient id="${g}c" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b78bf5"/><stop offset="1" stop-color="#6a49d6"/>
      </linearGradient>
      <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff6e6"/><stop offset="1" stop-color="#ffd98a"/>
      </linearGradient>
      <radialGradient id="${g}l"><stop offset="0" stop-color="#ffc24b" stop-opacity=".55"/><stop offset="1" stop-color="#ffc24b" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="50" cy="58" rx="48" ry="48" fill="url(#${g}l)"/>
    <path d="M18 70q-9-7-6-16 4 4 8 4z" fill="#6a49d6"/>
    <path d="M82 70q9-7 6-16-4 4-8 4z" fill="#6a49d6"/>
    <ellipse cx="50" cy="60" rx="33" ry="36" fill="url(#${g}c)"/>
    <path d="M24 32q6-16 26-16t26 16q-10-6-26-6t-26 6z" fill="#8b6cf0"/>
    <path d="M26 24l6-13 7 11z" fill="#6a49d6"/><path d="M74 24l-6-13-7 11z" fill="#6a49d6"/>
    <ellipse cx="50" cy="70" rx="21" ry="23" fill="url(#${g}v)"/>
    <circle cx="40" cy="44" r="13" fill="#fff6e6"/><circle cx="60" cy="44" r="13" fill="#fff6e6"/>
    ${YEUX[expression] || YEUX.bonjour}
    <path d="M50 52l6 7h-12z" fill="#ffc24b"/>
    <path d="M42 95l-5 11h7l3-8z" fill="#ffc24b"/><path d="M58 95l5 11h-7l-3-8z" fill="#ffc24b"/>
    <path d="M88 20l2.6 6 6 2.6-6 2.6-2.6 6-2.6-6-6-2.6 6-2.6z" fill="#2fd6c4"/>
    <path d="M12 12l1.8 4.2L18 18l-4.2 1.8L12 24l-1.8-4.2L6 18l4.2-1.8z" fill="#ffe2a3"/>
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Icônes de l'interface                                              */
/* ------------------------------------------------------------------ */

const T = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

const ICONES = {
  maison: `<path d="M3 10.5 12 3l9 7.5" ${T}/><path d="M5.5 9.5V20h13V9.5" ${T}/><path d="M9.5 20v-5h5v5" ${T}/>`,
  carte: `<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" ${T}/><path d="M9 4v13.5M15 6.5V20" ${T}/>`,
  mission: `<path d="M5 3v18" ${T}/><path d="M5 4h11l-1.5 4L16 12H5z" ${T}/>`,
  progres: `<path d="M4 20V10M10 20V5M16 20v-7M22 20H2" ${T}/>`,
  coffre: `<path d="M3 9.5 12 5l9 4.5V19H3z" ${T}/><path d="M3 12.5h18" ${T}/><path d="M10.5 12.5h3v3h-3z" ${T}/>`,
  etoile: `<path d="m12 3.5 2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17.4l-5.5 2.9 1.1-6.1-4.4-4.3 6.1-.8z" fill="currentColor" stroke="none"/>`,
  eclair: `<path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5z" fill="currentColor" stroke="none"/>`,
  'son-on': `<path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" ${T}/><path d="M16.5 8.5a5 5 0 0 1 0 7" ${T}/><path d="M19 6a8.5 8.5 0 0 1 0 12" ${T}/>`,
  'son-off': `<path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" ${T}/><path d="m17 9.5 4 5M21 9.5l-4 5" ${T}/>`,
  cadenas: `<rect x="5" y="10.5" width="14" height="10" rx="2.5" ${T}/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" ${T}/>`,
  indice: `<path d="M12 3a6 6 0 0 1 3.5 10.9V17h-7v-3.1A6 6 0 0 1 12 3z" ${T}/><path d="M9.5 20.5h5" ${T}/>`,
  parent: `<circle cx="9" cy="8" r="3.5" ${T}/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" ${T}/><circle cx="17.5" cy="10" r="2.5" ${T}/><path d="M15 20c0-2.2 1.3-4 3-4s3 1.3 3 4" ${T}/>`,
  reglages: `<circle cx="12" cy="12" r="3" ${T}/><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3" ${T}/>`,
  retour: `<path d="M15 5l-7 7 7 7" ${T}/>`,
  suivant: `<path d="M9 5l7 7-7 7" ${T}/>`,
  haut: `<path d="M6 14l6-6 6 6" ${T}/>`,
  bas: `<path d="M6 10l6 6 6-6" ${T}/>`,
  check: `<path d="m4.5 12.5 5 5 10-11" ${T}/>`,
  croix: `<path d="M6 6l12 12M18 6 6 18" ${T}/>`,
  pause: `<path d="M9 5v14M15 5v14" ${T}/>`,
  livre: `<path d="M4 4.5h6a2.5 2.5 0 0 1 2 2.2 2.5 2.5 0 0 1 2-2.2h6v14h-6a2.5 2.5 0 0 0-2 1.8 2.5 2.5 0 0 0-2-1.8H4z" ${T}/>`,
  loupe: `<circle cx="10.5" cy="10.5" r="6" ${T}/><path d="m15 15 5 5" ${T}/>`,
  horloge: `<circle cx="12" cy="12" r="8.5" ${T}/><path d="M12 7.5V12l3.5 2" ${T}/>`,
  feu: `<path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5s1 1.5 2 1.5c0-3 2-7 2-7z" ${T}/>`,
  cible: `<circle cx="12" cy="12" r="8.5" ${T}/><circle cx="12" cy="12" r="4.5" ${T}/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  exporter: `<path d="M12 16V4M8 8l4-4 4 4" ${T}/><path d="M4 16v3.5h16V16" ${T}/>`,
  importer: `<path d="M12 4v12M8 12l4 4 4-4" ${T}/><path d="M4 16v3.5h16V16" ${T}/>`,
  plume: `<path d="M19 4c-8 1-13 6-14 14l3-3h4c5 0 7-4 7-11z" ${T}/><path d="M5 19 8 15" ${T}/>`,
  coeur: `<path d="M12 20s-7-4.4-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z" ${T}/>`,
};

export function icone(nom, taille = 22) {
  const d = ICONES[nom] || ICONES.etoile;
  return `<svg viewBox="0 0 24 24" width="${taille}" height="${taille}" aria-hidden="true" focusable="false">${d}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Les six mondes                                                      */
/* ------------------------------------------------------------------ */

function etoiles(n, graine = 1) {
  let out = '';
  let s = graine * 9301;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const x = 4 + ((s / 233280) * 312) % 312;
    s = (s * 9301 + 49297) % 233280;
    const y = 4 + ((s / 233280) * 90) % 90;
    s = (s * 9301 + 49297) % 233280;
    const r = 0.6 + ((s / 233280) * 1.4);
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.25 + (r / 3)).toFixed(2)}"/>`;
  }
  return out;
}

const DECORS = {
  village: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(26, 3)}
    <circle cx="258" cy="36" r="17" fill="#ffe2a3" opacity=".9"/>
    <circle cx="252" cy="32" r="14" fill="url(#${g}s)"/>
    <path d="M0 132q50-26 104-10t106-16 110 14v60H0z" fill="#0f1a3c"/>
    <path d="M0 150q60-18 112-4t104-12 104 10v36H0z" fill="#16255a"/>
    <g fill="#2fd6c4">
      <path d="M44 128l20-17 20 17v30H44z" opacity=".95"/><path d="M118 134l17-15 17 15v26h-34z" opacity=".8"/>
      <path d="M186 130l19-16 19 16v28h-38z" opacity=".9"/><path d="M252 136l15-13 15 13v24h-30z" opacity=".72"/>
    </g>
    <g fill="#ffc24b"><rect x="56" y="136" width="9" height="9" rx="1.5"/><rect x="129" y="141" width="8" height="8" rx="1.5"/><rect x="197" y="138" width="9" height="9" rx="1.5"/><rect x="261" y="143" width="7" height="7" rx="1.5"/></g>
    <g stroke="#ffe2a3" stroke-width="2"><path d="M96 158v-14"/><path d="M160 160v-12"/></g>
    <g fill="#fff6e6"><rect x="86" y="132" width="22" height="9" rx="2"/><rect x="151" y="136" width="20" height="8" rx="2"/></g>`,
  foret: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(20, 7)}
    <path d="M0 148q58-10 106 2t106-6 108 8v28H0z" fill="#07241f"/>
    <g fill="#0f3a32">
      <path d="M40 150 62 86l22 64z"/><path d="M96 152l26-74 26 74z"/><path d="M164 150l20-58 20 58z"/><path d="M222 154l24-68 24 68z"/>
    </g>
    <g fill="#5fd98a" opacity=".85">
      <path d="M52 134 62 102l10 32z"/><path d="M108 132l14-38 14 38z"/><path d="M174 134l10-28 10 28z"/><path d="M234 138l12-32 12 32z"/>
    </g>
    <path d="M150 180q6-26 24-34t34-6" stroke="#ffe2a3" stroke-width="3" fill="none" stroke-dasharray="7 8" opacity=".8"/>
    <path d="M150 180q-4-24-22-32T96 142" stroke="#ffe2a3" stroke-width="3" fill="none" stroke-dasharray="7 8" opacity=".5"/>
    <g fill="#a8f0b5"><circle cx="86" cy="118" r="2.6"/><circle cx="198" cy="110" r="2.2"/><circle cx="142" cy="126" r="2"/><circle cx="262" cy="120" r="2.4"/></g>`,
  chateau: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(24, 11)}
    <path d="M0 160q80-16 160 0t160 0v20H0z" fill="#1b0f2c"/>
    <g fill="#3b2558">
      <rect x="96" y="76" width="128" height="86"/><rect x="74" y="58" width="30" height="104"/><rect x="216" y="58" width="30" height="104"/>
      <rect x="140" y="44" width="40" height="118"/>
    </g>
    <g fill="#2a1740">
      <path d="M74 58h30l-15-20z"/><path d="M216 58h30l-15-20z"/><path d="M140 44h40l-20-24z"/>
    </g>
    <g fill="#ffc24b"><rect x="84" y="80" width="10" height="14" rx="4"/><rect x="226" y="80" width="10" height="14" rx="4"/><rect x="154" y="68" width="12" height="16" rx="5"/>
      <rect x="116" y="100" width="12" height="16" rx="5"/><rect x="192" y="100" width="12" height="16" rx="5"/></g>
    <path d="M148 162v-32a12 12 0 0 1 24 0v32z" fill="#1b0f2c"/>
    <g fill="#b78bf5"><path d="M160 20v-12l20 6-20 6z"/><path d="M89 38V28l16 5-16 5z"/><path d="M231 38V28l16 5-16 5z"/></g>`,
  montagne: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(30, 13)}
    <g fill="#16305c"><path d="M-10 168 76 58l78 110z"/><path d="M118 168 206 44l92 124z"/></g>
    <g fill="#c6e8ff"><path d="M76 58l26 34q-14 6-26-2t-26 6z"/><path d="M206 44l30 40q-16 8-30-2t-30 8z"/></g>
    <g fill="#7fc8ff" opacity=".45"><ellipse cx="68" cy="116" rx="40" ry="8"/><ellipse cx="240" cy="100" rx="46" ry="9"/></g>
    <path d="M206 44v-22" stroke="#ffe2a3" stroke-width="2.6"/><path d="M206 22l22 7-22 7z" fill="#ffc24b"/>
    <path d="M0 170q60-12 160 0t160-2v14H0z" fill="#0d2447"/>`,
  fabrique: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(18, 17)}
    <path d="M0 156h320v24H0z" fill="#2a0f18"/>
    <rect x="40" y="76" width="112" height="80" fill="#4b2030"/>
    <rect x="166" y="94" width="104" height="62" fill="#3d1a27"/>
    <g fill="#ff9a6c"><rect x="56" y="94" width="18" height="18" rx="3"/><rect x="86" y="94" width="18" height="18" rx="3"/><rect x="116" y="94" width="18" height="18" rx="3"/>
      <rect x="182" y="110" width="16" height="16" rx="3"/><rect x="212" y="110" width="16" height="16" rx="3"/><rect x="242" y="110" width="16" height="16" rx="3"/></g>
    <rect x="62" y="48" width="18" height="28" fill="#4b2030"/><rect x="112" y="40" width="18" height="36" fill="#4b2030"/>
    <g fill="#ffc9ae" opacity=".55"><circle cx="71" cy="36" r="10"/><circle cx="121" cy="26" r="13"/></g>
    <g stroke="#ffc9ae" stroke-width="4" fill="none"><circle cx="96" cy="136" r="17"/><circle cx="96" cy="136" r="5"/></g>
    <g stroke="#ffc9ae" stroke-width="3" fill="none"><circle cx="132" cy="146" r="10"/></g>
    <rect x="166" y="150" width="140" height="7" rx="3" fill="#ffc9ae" opacity=".5"/>
    <g fill="#fff6e6"><rect x="178" y="138" width="20" height="12" rx="2"/><rect x="210" y="138" width="20" height="12" rx="2"/><rect x="244" y="138" width="20" height="12" rx="2"/></g>`,
  bibliotheque: (g) => `
    <rect width="320" height="180" fill="url(#${g}s)"/>
    ${etoiles(22, 19)}
    <path d="M30 170V60q0-34 130-34t130 34v110z" fill="#241d0d"/>
    <g fill="#3b2f16">
      <rect x="48" y="78" width="98" height="26"/><rect x="48" y="112" width="98" height="26"/><rect x="48" y="146" width="98" height="24"/>
      <rect x="174" y="78" width="98" height="26"/><rect x="174" y="112" width="98" height="26"/><rect x="174" y="146" width="98" height="24"/>
    </g>
    <g fill="#ffc24b">
      <rect x="54" y="84" width="9" height="16" rx="1"/><rect x="66" y="82" width="7" height="18" rx="1"/><rect x="76" y="86" width="10" height="14" rx="1"/>
      <rect x="180" y="84" width="8" height="16" rx="1"/><rect x="191" y="82" width="10" height="18" rx="1"/><rect x="204" y="86" width="7" height="14" rx="1"/>
    </g>
    <g fill="#5be5d6">
      <rect x="54" y="118" width="10" height="16" rx="1"/><rect x="68" y="116" width="8" height="18" rx="1"/>
      <rect x="180" y="118" width="9" height="16" rx="1"/><rect x="193" y="120" width="8" height="14" rx="1"/>
    </g>
    <g fill="#b78bf5">
      <rect x="96" y="150" width="9" height="16" rx="1"/><rect x="108" y="148" width="8" height="18" rx="1"/>
      <rect x="220" y="150" width="9" height="16" rx="1"/><rect x="232" y="152" width="8" height="14" rx="1"/>
    </g>
    <g transform="translate(160 96)">
      <path d="M-22 0h18a4 4 0 0 1 4 3 4 4 0 0 1 4-3h18v22h-18a4 4 0 0 0-4 3 4 4 0 0 0-4-3h-18z" fill="#fff6e6"/>
    </g>
    <g fill="#ffe2a3" opacity=".8"><circle cx="112" cy="58" r="2.4"/><circle cx="208" cy="52" r="2"/><circle cx="160" cy="44" r="2.6"/></g>`,
};

/** Illustration d'un monde. `palette` = { fond, accent, lueur } */
export function decorMonde(decor, palette) {
  const g = uid();
  const fonction = DECORS[decor] || DECORS.village;
  return `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
    <defs><linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.fond}"/><stop offset="1" stop-color="#070a22"/>
    </linearGradient></defs>
    ${fonction(g)}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Médailles de badges                                                 */
/* ------------------------------------------------------------------ */

const GLYPHES = {
  etoile: '<path d="M24 12l3.6 7.4 8.1 1.1-5.9 5.7 1.5 8.1L24 30.5 16.7 34.4l1.5-8.1-5.9-5.7 8.1-1.1z"/>',
  loupe: '<circle cx="21" cy="21" r="8" fill="none" stroke-width="3.4" stroke="currentColor"/><path d="M27 27l7 7" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/>',
  maj: '<path d="M14 34l10-22 10 22h-5l-2-5H21l-2 5z"/>',
  bouclier: '<path d="M24 10l12 5v10c0 7-5 11-12 14-7-3-12-7-12-14V15z"/>',
  ciseaux: '<circle cx="16" cy="32" r="4.4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="4.4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 29 32 12M30 29 16 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  epee: '<path d="M24 8l4 4-10 18-4-4z"/><path d="M14 30l-4 8 8-4z"/><path d="M26 10h8v4h-8z"/>',
  montagne: '<path d="M8 34 20 14l8 12 4-5 8 13z"/>',
  engrenage: '<circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M24 8v5M24 35v5M10 24h5M33 24h5M14 14l3.5 3.5M30.5 30.5 34 34M14 34l3.5-3.5M30.5 17.5 34 14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  abc: '<text x="24" y="30" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="17" font-weight="800" fill="currentColor">ABC</text>',
  livre: '<path d="M10 12h10a4 4 0 0 1 4 3 4 4 0 0 1 4-3h10v24H28a4 4 0 0 0-4 3 4 4 0 0 0-4-3H10z"/>',
  oeil: '<path d="M24 15c8 0 13 9 13 9s-5 9-13 9-13-9-13-9 5-9 13-9z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="4"/>',
  coeur: '<path d="M24 36s-11-7-11-15a5.8 5.8 0 0 1 11-2.6A5.8 5.8 0 0 1 35 21c0 8-11 15-11 15z"/>',
  plume: '<path d="M36 10c-13 2-20 10-22 24l5-5h6c8 0 11-7 11-19z"/><path d="M14 36l6-6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  eclair: '<path d="M26 8 14 26h8l-2 14 14-20h-9z"/>',
  calendrier: '<rect x="10" y="14" width="28" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 21h28M17 10v6M31 10v6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  trophee: '<path d="M16 10h16v8a8 8 0 0 1-16 0z"/><path d="M22 26h4v8h-4z"/><path d="M14 36h20v3H14z"/><path d="M16 12h-4v3a5 5 0 0 0 5 5M32 12h4v3a5 5 0 0 1-5 5" fill="none" stroke="currentColor" stroke-width="2.6"/>',
  cent: '<text x="24" y="31" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="19" font-weight="800" fill="currentColor">100</text>',
  carte: '<path d="M10 14l8-3 10 4 10-3v22l-10 3-10-4-8 3z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 11v22M28 15v22" stroke="currentColor" stroke-width="2.4"/>',
  boussole: '<circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="3"/><path d="M29 19l-3 8-8 3 3-8z"/>',
  coffre: '<path d="M11 19 24 13l13 6v17H11z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M11 25h26" stroke="currentColor" stroke-width="3"/><rect x="21" y="24" width="6" height="7" rx="1"/>',
  drapeau: '<path d="M15 10v28" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><path d="M15 12h17l-3 6 3 6H15z"/>',
};

/** Médaille hexagonale d'un badge. */
export function medaille(glyphe, gagne = true, classe = 'medaille') {
  const g = uid();
  const d = GLYPHES[glyphe] || GLYPHES.etoile;
  return `<svg viewBox="0 0 48 52" class="${classe}" aria-hidden="true">
    <defs><linearGradient id="${g}m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${gagne ? '#ffe2a3' : '#8a8fbf'}"/>
      <stop offset="1" stop-color="${gagne ? '#ff8a4c' : '#5a5f8c'}"/>
    </linearGradient></defs>
    <path d="M24 1 45 13v26L24 51 3 39V13z" fill="url(#${g}m)"/>
    <path d="M24 5.5 41 15.5v21L24 46.5 7 36.5v-21z" fill="rgba(11,16,51,.82)"/>
    <g fill="${gagne ? '#ffe2a3' : '#b3b9ec'}" color="${gagne ? '#ffe2a3' : '#b3b9ec'}" transform="translate(0 2)">${d}</g>
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Coffre au trésor                                                    */
/* ------------------------------------------------------------------ */

export function coffre(ouvert = false) {
  const g = uid();
  return `<svg viewBox="0 0 200 160" class="coffre-svg" aria-hidden="true">
    <defs>
      <linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd98a"/><stop offset="1" stop-color="#c47a1e"/></linearGradient>
      <radialGradient id="${g}r"><stop offset="0" stop-color="#ffe2a3" stop-opacity=".9"/><stop offset="1" stop-color="#ffc24b" stop-opacity="0"/></radialGradient>
    </defs>
    ${ouvert ? `<circle cx="100" cy="74" r="76" fill="url(#${g}r)"/>` : ''}
    <ellipse cx="100" cy="150" rx="62" ry="8" fill="rgba(0,0,0,.35)"/>
    <g transform="translate(100 ${ouvert ? 58 : 74}) rotate(${ouvert ? -28 : 0}) translate(-100 ${ouvert ? -58 : -74})">
      <path d="M44 76q0-30 56-30t56 30v6H44z" fill="url(#${g}b)"/>
      <path d="M44 76q0-30 56-30t56 30" fill="none" stroke="#7a4a0c" stroke-width="3"/>
      <rect x="92" y="60" width="16" height="22" rx="3" fill="#7a4a0c"/>
    </g>
    <path d="M44 82h112v52a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8z" fill="url(#${g}b)"/>
    <path d="M44 82h112v10H44z" fill="#7a4a0c" opacity=".55"/>
    <rect x="90" y="92" width="20" height="26" rx="4" fill="#7a4a0c"/>
    <circle cx="100" cy="104" r="4" fill="#ffe2a3"/>
    ${ouvert ? `<g fill="#fff6e6"><circle cx="72" cy="66" r="4"/><circle cx="128" cy="62" r="3"/><circle cx="100" cy="52" r="3.4"/></g>
      <g fill="#2fd6c4"><circle cx="86" cy="54" r="2.6"/><circle cx="116" cy="70" r="2.2"/></g>` : ''}
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Carte des mondes : une constellation                                */
/* ------------------------------------------------------------------ */

const NOEUDS = [
  { x: 60, y: 210 }, { x: 160, y: 148 }, { x: 268, y: 196 },
  { x: 372, y: 132 }, { x: 470, y: 188 }, { x: 568, y: 118 },
];

/** Le chemin de l'aventure, avec un nœud par monde. */
export function constellation(mondes, etats) {
  const g = uid();
  let traits = '';
  for (let i = 1; i < NOEUDS.length; i++) {
    const a = NOEUDS[i - 1];
    const b = NOEUDS[i];
    const ouvert = etats[mondes[i].id]?.debloque;
    traits += `<path d="M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 36} ${b.x} ${b.y}"
      fill="none" stroke="${ouvert ? '#ffc24b' : 'rgba(255,255,255,.18)'}" stroke-width="3"
      stroke-dasharray="2 10" stroke-linecap="round"/>`;
  }
  const points = mondes
    .map((m, i) => {
      const n = NOEUDS[i];
      const etat = etats[m.id] || {};
      const couleur = etat.debloque ? m.palette.accent : '#5a5f8c';
      return `<g>
        <circle cx="${n.x}" cy="${n.y}" r="26" fill="rgba(7,10,34,.75)" stroke="${couleur}" stroke-width="3"/>
        ${etat.termine ? `<circle cx="${n.x}" cy="${n.y}" r="33" fill="none" stroke="#ffc24b" stroke-width="2" stroke-dasharray="4 6"/>` : ''}
        <text x="${n.x}" y="${n.y + 7}" text-anchor="middle" font-family="Baloo 2, sans-serif"
          font-size="20" font-weight="800" fill="${couleur}">${m.numero}</text>
        <text x="${n.x}" y="${n.y + 48}" text-anchor="middle" font-family="Lexend, sans-serif"
          font-size="12" fill="${etat.debloque ? '#e9ebff' : '#7d83bc'}">${m.titre.length > 20 ? `${m.titre.slice(0, 19)}…` : m.titre}</text>
      </g>`;
    })
    .join('');
  return `<svg viewBox="0 0 628 270" role="img" aria-label="Carte des six mondes de l'aventure">
    <defs><radialGradient id="${g}n"><stop offset="0" stop-color="#8b6cf0" stop-opacity=".3"/><stop offset="1" stop-color="#8b6cf0" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="314" cy="150" rx="320" ry="140" fill="url(#${g}n)"/>
    ${etoiles(34, 23)}
    ${traits}${points}
  </svg>`;
}

/** Petit sablier / rotateur de chargement. */
export function rotateur() {
  return `<svg viewBox="0 0 48 48" class="rotateur" aria-hidden="true">
    <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="5"/>
    <path d="M24 5a19 19 0 0 1 19 19" fill="none" stroke="#ffc24b" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}
