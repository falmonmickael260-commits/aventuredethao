/**
 * Corpus de phrases annotees pour le CE2.
 *
 * Chaque phrase est ecrite dans un petit langage d'annotation compact, ce qui
 * permet de verifier d'un coup d'oeil l'analyse grammaticale complete :
 *
 *   "[ Le|d petit|a chat|n.ms ] dort|v:dormir sur|p le|d canape.|n.ms"
 *
 *   mot|tag          -> un mot et sa nature
 *   [ ... ]          -> delimite le GROUPE SUJET (le reste est le groupe verbal)
 *   ponctuation      -> collee au mot, AVANT la barre : "canape.|n.ms"
 *
 * Tags :
 *   d       determinant
 *   a       adjectif
 *   n.gn    nom commun (g = m|f, n = s|p)   ex: n.ms, n.fp
 *   N.gn    nom propre
 *   v:inf   verbe conjugue, avec son infinitif
 *   p       preposition
 *   r       pronom
 *   A       adverbe
 *   c       conjonction
 *   x       autre / mot volontairement non classe (forme contractee, numeral...)
 *
 * `skip` liste les exercices a ne PAS generer depuis cette phrase quand une
 * reponse serait ambigue pour un eleve de CE2 (ex : "au", "du", "quatre").
 */

const PONCT = '.,;:!?';

/** Decoupe un mot annote "canape.|n.ms" en { w, after, tag }. */
function parseChunk(chunk) {
  const i = chunk.indexOf('|');
  if (i < 0) throw new Error(`Annotation manquante pour "${chunk}"`);
  let w = chunk.slice(0, i);
  const tag = chunk.slice(i + 1);
  let after = '';
  while (w.length && PONCT.includes(w[w.length - 1])) {
    after = w[w.length - 1] + after;
    w = w.slice(0, -1);
  }
  if (!w) throw new Error(`Mot vide dans "${chunk}"`);
  return { w, after, tag };
}

/** Transforme un tag en proprietes de token. */
function readTag(tag, chunk) {
  if (tag === 'd') return { pos: 'det' };
  if (tag === 'a') return { pos: 'adj' };
  if (tag === 'p') return { pos: 'prep' };
  if (tag === 'r') return { pos: 'pronom' };
  if (tag === 'A') return { pos: 'adverbe' };
  if (tag === 'c') return { pos: 'conj' };
  if (tag === 'x') return { pos: 'autre' };
  if (tag.startsWith('v:')) {
    const inf = tag.slice(2);
    if (!inf) throw new Error(`Infinitif manquant dans "${chunk}"`);
    return { pos: 'verbe', inf };
  }
  const m = /^(n|N)\.([mf])([sp])$/.exec(tag);
  if (m) {
    return {
      pos: 'nom',
      kind: m[1] === 'n' ? 'commun' : 'propre',
      genre: m[2],
      nombre: m[3],
    };
  }
  throw new Error(`Tag inconnu "${tag}" dans "${chunk}"`);
}

/** Compile une phrase annotee en objet exploitable. */
export function compilePhrase(entry) {
  const tokens = [];
  let sujet = null;
  let open = -1;
  for (const chunk of entry.dsl.trim().split(/\s+/)) {
    if (chunk === '[') {
      open = tokens.length;
      continue;
    }
    if (chunk === ']') {
      if (open < 0) throw new Error(`"]" sans "[" dans ${entry.id}`);
      sujet = [];
      for (let i = open; i < tokens.length; i++) sujet.push(i);
      open = -2;
      continue;
    }
    const { w, after, tag } = parseChunk(chunk);
    const props = readTag(tag, chunk);
    const prev = tokens[tokens.length - 1];
    // Un determinant elide ("L'") se colle au mot suivant.
    const glue = prev && /['’]$/.test(prev.w);
    tokens.push({ w, after, glue: !!glue, ...props });
  }
  if (!sujet) throw new Error(`Groupe sujet non delimite dans ${entry.id}`);

  const texte = tokens
    .map((t, i) => (i === 0 || t.glue ? '' : ' ') + t.w + t.after)
    .join('')
    .trim();

  const gv = tokens.map((_, i) => i).filter((i) => !sujet.includes(i));

  // Personne du sujet : utile pour fabriquer des exercices grammaticalement sûrs.
  let personne = '3s';
  const pron = sujet.map((i) => tokens[i]).find((t) => t.pos === 'pronom');
  if (pron) {
    personne = { je: 'je', j: 'je', tu: 'tu', nous: 'nous', vous: 'vous', il: '3s', elle: '3s', ils: '3p', elles: '3p' }[
      pron.w.toLowerCase()
    ] || '3s';
  } else {
    const tete = sujet.map((i) => tokens[i]).find((t) => t.pos === 'nom');
    personne = tete && tete.nombre === 'p' ? '3p' : '3s';
  }
  const verbe = tokens.findIndex((t) => t.pos === 'verbe');
  if (verbe < 0) throw new Error(`Aucun verbe conjugue dans ${entry.id}`);

  return {
    id: entry.id,
    texte,
    tokens,
    sujet,
    gv,
    verbe,
    personne,
    infinitif: tokens[verbe].inf,
    niveau: entry.niv || 1,
    skip: entry.skip || [],
    theme: entry.theme || 'vie quotidienne',
    noms: tokens.map((t, i) => (t.pos === 'nom' ? i : -1)).filter((i) => i >= 0),
    dets: tokens.map((t, i) => (t.pos === 'det' ? i : -1)).filter((i) => i >= 0),
    propres: tokens
      .map((t, i) => (t.pos === 'nom' && t.kind === 'propre' ? i : -1))
      .filter((i) => i >= 0),
    communs: tokens
      .map((t, i) => (t.pos === 'nom' && t.kind === 'commun' ? i : -1))
      .filter((i) => i >= 0),
  };
}

const BRUT = [
  { id: 'p001', niv: 1, theme: 'animaux', dsl: "[ Le|d petit|a chat|n.ms ] dort|v:dormir sur|p le|d canapé.|n.ms" },
  { id: 'p002', niv: 1, theme: 'jardin', dsl: "[ Une|d jolie|a fleur|n.fs ] pousse|v:pousser dans|p le|d jardin.|n.ms" },
  { id: 'p003', niv: 1, theme: 'école', dsl: "[ Les|d enfants|n.mp ] jouent|v:jouer dans|p la|d cour.|n.fs" },
  { id: 'p004', niv: 2, theme: 'famille', dsl: "[ Mon|d frère|n.ms ] répare|v:réparer son|d vélo|n.ms rouge.|a" },
  { id: 'p005', niv: 2, theme: 'école', skip: ['det'], dsl: "[ La|d maîtresse|n.fs ] écrit|v:écrire la|d date|n.fs au|x tableau.|n.ms" },
  { id: 'p006', niv: 1, theme: 'école', dsl: "[ Léa|N.fs ] dessine|v:dessiner un|d énorme|a dragon.|n.ms" },
  { id: 'p007', niv: 2, theme: 'village', dsl: "[ Le|d facteur|n.ms ] apporte|v:apporter une|d lettre|n.fs importante.|a" },
  { id: 'p008', niv: 2, theme: 'école', dsl: "[ Nous|r ] rangeons|v:ranger nos|d cahiers|n.mp dans|p le|d casier.|n.ms" },
  { id: 'p009', niv: 1, theme: 'école', dsl: "[ Tu|r ] finis|v:finir ton|d exercice|n.ms de|p français.|n.ms" },
  { id: 'p010', niv: 2, theme: 'nature', skip: ['det'], dsl: "[ Les|d oiseaux|n.mp ] chantent|v:chanter au|x lever|n.ms du|x soleil.|n.ms" },
  { id: 'p011', niv: 1, theme: 'animaux', dsl: "[ Mon|d chien|n.ms ] court|v:courir derrière|p le|d ballon.|n.ms" },
  { id: 'p012', niv: 2, theme: 'village', dsl: "[ Le|d boulanger|n.ms ] prépare|v:préparer des|d croissants|n.mp chauds.|a" },
  { id: 'p013', niv: 2, theme: 'animaux', dsl: "[ Cette|d grande|a girafe|n.fs ] mange|v:manger des|d feuilles.|n.fp" },
  { id: 'p014', niv: 2, theme: 'famille', dsl: "[ Papa|N.ms ] conduit|v:conduire la|d voiture|n.fs avec|p prudence.|n.fs" },
  { id: 'p015', niv: 2, theme: 'école', dsl: "[ Les|d élèves|n.mp ] écoutent|v:écouter une|d belle|a histoire.|n.fs" },
  { id: 'p016', niv: 1, theme: 'maison', dsl: "[ Thao|N.ms ] range|v:ranger sa|d chambre|n.fs le|d samedi.|n.ms" },
  { id: 'p017', niv: 3, theme: 'nature', skip: ['det'], dsl: "[ Le|d vent|n.ms ] agite|v:agiter les|d branches|n.fp du|x chêne.|n.ms" },
  { id: 'p018', niv: 2, theme: 'animaux', dsl: "[ Une|d araignée|n.fs ] tisse|v:tisser sa|d toile|n.fs fragile.|a" },
  { id: 'p019', niv: 2, theme: 'village', dsl: "[ Les|d pompiers|n.mp ] éteignent|v:éteindre un|d grand|a feu.|n.ms" },
  { id: 'p020', niv: 2, theme: 'famille', dsl: "[ Ma|d sœur|n.fs ] apprend|v:apprendre une|d nouvelle|a chanson.|n.fs" },
  { id: 'p021', niv: 3, theme: 'mer', dsl: "[ Le|d vieux|a pêcheur|n.ms ] répare|v:réparer son|d filet.|n.ms" },
  { id: 'p022', niv: 2, theme: 'nature', dsl: "[ Des|d nuages|n.mp gris|a ] cachent|v:cacher la|d lune.|n.fs" },
  { id: 'p023', niv: 1, theme: 'aventure', dsl: "[ Le|d dragon|n.ms ] garde|v:garder un|d trésor|n.ms magique.|a" },
  { id: 'p024', niv: 2, theme: 'voyage', dsl: "[ Nous|r ] visitons|v:visiter le|d château|n.ms de|p Blois.|N.ms" },
  { id: 'p025', niv: 3, theme: 'nature', skip: ['det'], dsl: "[ Les|d abeilles|n.fp ] butinent|v:butiner les|d fleurs|n.fp du|x pré.|n.ms" },
  { id: 'p026', niv: 3, theme: 'famille', dsl: "[ Mon|d cousin|n.ms ] collectionne|v:collectionner des|d timbres|n.mp anciens.|a" },
  { id: 'p027', niv: 3, theme: 'village', dsl: "[ La|d rivière|n.fs ] traverse|v:traverser le|d village|n.ms endormi.|a" },
  { id: 'p028', niv: 1, theme: 'école', dsl: "[ Tu|r ] ranges|v:ranger tes|d crayons|n.mp dans|p la|d trousse.|n.fs" },
  { id: 'p029', niv: 2, theme: 'cirque', skip: ['det'], dsl: "[ Le|d clown|n.ms ] amuse|v:amuser tous|d les|d spectateurs.|n.mp" },
  { id: 'p030', niv: 2, theme: 'animaux', dsl: "[ Les|d souris|n.fp ] grignotent|v:grignoter un|d morceau|n.ms de|p fromage.|n.ms" },
  { id: 'p031', niv: 2, theme: 'lecture', dsl: "[ Ce|d livre|n.ms ] raconte|v:raconter une|d aventure|n.fs extraordinaire.|a" },
  { id: 'p032', niv: 2, theme: 'famille', skip: ['det'], dsl: "[ Julie|N.fs ] prend|v:prendre son|d goûter|n.ms à|p quatre|x heures.|n.fp" },
  { id: 'p033', niv: 3, theme: 'jardin', dsl: "[ Le|d jardinier|n.ms ] arrose|v:arroser ses|d jeunes|a salades.|n.fp" },
  { id: 'p034', niv: 3, theme: 'ciel', dsl: "[ Les|d savants|n.mp ] observent|v:observer les|d étoiles|n.fp filantes.|a" },
  { id: 'p035', niv: 2, theme: 'famille', dsl: "[ Mon|d grand-père|n.ms ] raconte|v:raconter des|d histoires|n.fp drôles.|a" },
  { id: 'p036', niv: 3, theme: 'mer', dsl: "[ Une|d tempête|n.fs ] approche|v:approcher de|p la|d côte|n.fs bretonne.|a" },
  { id: 'p037', niv: 2, theme: 'sport', dsl: "[ Les|d joueurs|n.mp ] marquent|v:marquer un|d but|n.ms magnifique.|a" },
  { id: 'p038', niv: 2, theme: 'école', dsl: "[ Le|d maître|n.ms ] corrige|v:corriger nos|d dictées|n.fp difficiles.|a" },
  { id: 'p039', niv: 1, theme: 'aventure', skip: ['det'], dsl: "[ Nous|r ] dessinons|v:dessiner une|d carte|n.fs au|x trésor.|n.ms" },
  { id: 'p040', niv: 2, theme: 'animaux', dsl: "[ Le|d hibou|n.ms ] chasse|v:chasser pendant|p la|d nuit.|n.fs" },
  { id: 'p041', niv: 2, theme: 'nature', dsl: "[ Les|d feuilles|n.fp ] tombent|v:tomber doucement|A en|p automne.|n.ms" },
  { id: 'p042', niv: 2, theme: 'aventure', dsl: "[ Paul|N.ms ] construit|v:construire une|d cabane|n.fs dans|p les|d bois.|n.mp" },
  { id: 'p043', niv: 2, theme: 'animaux', dsl: "[ Cette|d petite|a souris|n.fs ] cherche|v:chercher une|d noisette.|n.fs" },
  { id: 'p044', niv: 3, theme: 'mer', skip: ['det'], dsl: "[ Les|d dauphins|n.mp ] nagent|v:nager près|p du|x bateau.|n.ms" },
  { id: 'p045', niv: 3, theme: 'jardin', dsl: "[ Ma|d mère|n.fs ] plante|v:planter des|d rosiers|n.mp parfumés.|a" },
  { id: 'p046', niv: 3, theme: 'aventure', dsl: "[ Le|d voleur|n.ms ] disparaît|v:disparaître dans|p la|d nuit|n.fs noire.|a" },
  { id: 'p047', niv: 1, theme: 'lecture', dsl: "[ Tu|r ] lis|v:lire une|d bande|n.fs dessinée|a passionnante.|a" },
  { id: 'p048', niv: 2, theme: 'village', skip: ['det'], dsl: "[ Les|d cloches|n.fp ] sonnent|v:sonner dans|p tout|d le|d village.|n.ms" },
  { id: 'p049', niv: 2, theme: 'aventure', dsl: "[ Le|d chevalier|n.ms ] défend|v:défendre la|d reine|n.fs courageuse.|a" },
  { id: 'p050', niv: 3, theme: 'village', dsl: "[ Nos|d voisins|n.mp ] repeignent|v:repeindre leur|d vieille|a barrière.|n.fs" },
  { id: 'p051', niv: 2, theme: 'conte', skip: ['det'], dsl: "[ L\'|d ogre|n.ms ] dévore|v:dévorer trois|x énormes|a gâteaux.|n.mp" },
  { id: 'p052', niv: 2, theme: 'école', dsl: "[ Les|d enfants|n.mp ] fabriquent|v:fabriquer des|d masques|n.mp colorés.|a" },
  { id: 'p053', niv: 3, theme: 'animaux', dsl: "[ Un|d écureuil|n.ms ] cache|v:cacher des|d noisettes|n.fp sous|p l\'|d arbre.|n.ms" },
  { id: 'p054', niv: 3, theme: 'nature', skip: ['det'], dsl: "[ La|d neige|n.fs ] recouvre|v:recouvrir les|d toits|n.mp du|x hameau.|n.ms" },
  { id: 'p055', niv: 2, theme: 'animaux', skip: ['det'], dsl: "[ Mon|d chat|n.ms ] griffe|v:griffer le|d pied|n.ms du|x fauteuil.|n.ms" },
  { id: 'p056', niv: 3, theme: 'cuisine', dsl: "[ Les|d cuisiniers|n.mp ] goûtent|v:goûter la|d soupe|n.fs brûlante.|a" },
  { id: 'p057', niv: 1, theme: 'sport', dsl: "[ Thao|N.ms ] gagne|v:gagner la|d course|n.fs de|p vélo.|n.ms" },
  { id: 'p058', niv: 2, theme: 'maison', dsl: "[ Le|d robot|n.ms ] nettoie|v:nettoyer la|d cuisine|n.fs tout|A seul.|a" },
  { id: 'p059', niv: 3, theme: 'voyage', dsl: "[ Des|d touristes|n.mp ] photographient|v:photographier la|d tour|n.fs Eiffel.|N.fs" },
  { id: 'p060', niv: 3, theme: 'nature', skip: ['det'], dsl: "[ Les|d grenouilles|n.fp ] coassent|v:coasser au|x bord|n.ms de|p l\'|d étang.|n.ms" },
  { id: 'p061', niv: 2, theme: 'conte', dsl: "[ Cette|d sorcière|n.fs ] mélange|v:mélanger une|d potion|n.fs verte.|a" },
  { id: 'p062', niv: 3, theme: 'montagne', dsl: "[ Le|d troupeau|n.ms ] descend|v:descendre de|p la|d montagne.|n.fs" },
  { id: 'p063', niv: 2, theme: 'maison', dsl: "[ Nous|r ] plions|v:plier nos|d vêtements|n.mp propres.|a" },
  { id: 'p064', niv: 2, theme: 'école', dsl: "[ Les|d élèves|n.mp ] récitent|v:réciter un|d poème|n.ms ensemble.|A" },
  { id: 'p065', niv: 3, theme: 'village', dsl: "[ Un|d vieux|a chêne|n.ms ] ombrage|v:ombrager la|d petite|a place.|n.fs" },
  { id: 'p066', niv: 3, theme: 'mer', dsl: "[ Le|d marin|n.ms ] hisse|v:hisser la|d grande|a voile.|n.fs" },
  { id: 'p067', niv: 2, theme: 'famille', dsl: "[ Ma|d tante|n.fs ] habite|v:habiter près|p de|p Bordeaux.|N.fs" },
  { id: 'p068', niv: 3, theme: 'animaux', dsl: "[ Les|d fourmis|n.fp ] transportent|v:transporter des|d miettes|n.fp de|p pain.|n.ms" },
  { id: 'p069', niv: 2, theme: 'nature', dsl: "[ Des|d flocons|n.mp blancs|a ] couvrent|v:couvrir le|d jardin.|n.ms" },
  { id: 'p070', niv: 2, theme: 'voyage', dsl: "[ Le|d train|n.ms ] entre|v:entrer dans|p la|d gare|n.fs bruyante.|a" },
  { id: 'p071', niv: 2, theme: 'animaux', dsl: "[ Les|d singes|n.mp ] sautent|v:sauter de|p branche|n.fs en|p branche.|n.fs" },
  { id: 'p072', niv: 1, theme: 'famille', dsl: "[ Mon|d ami|n.ms Paul|N.ms ] habite|v:habiter à|p Lyon.|N.fs" },
  { id: 'p073', niv: 1, theme: 'école', dsl: "[ Lucas|N.ms ] dessine|v:dessiner un|d bateau|n.ms sur|p son|d cahier.|n.ms" },
  { id: 'p074', niv: 3, theme: 'géographie', dsl: "[ La|d Loire|N.fs ] traverse|v:traverser plusieurs|d villes|n.fp françaises.|a" },
  { id: 'p075', niv: 3, theme: 'école', dsl: "[ Les|d élèves|n.mp ] rangent|v:ranger la|d bibliothèque|n.fs de|p la|d classe.|n.fs" },
  { id: 'p076', niv: 2, theme: 'aventure', dsl: "[ Un|d gentil|a monstre|n.ms ] surveille|v:surveiller le|d coffre|n.ms doré.|a" },
  { id: 'p077', niv: 3, theme: 'animaux', dsl: "[ Le|d vétérinaire|n.ms ] soigne|v:soigner un|d petit|a lapin.|n.ms" },
  { id: 'p078', niv: 3, theme: 'cuisine', skip: ['det'], dsl: "[ Nos|d cousines|n.fp ] préparent|v:préparer un|d gâteau|n.ms au|x chocolat.|n.ms" },
  { id: 'p079', niv: 3, theme: 'maison', dsl: "[ Le|d soleil|n.ms ] réchauffe|v:réchauffer la|d terrasse|n.fs en|p pierre.|n.fs" },
  { id: 'p080', niv: 2, theme: 'aventure', dsl: "[ Les|d pirates|n.mp ] cherchent|v:chercher une|d île|n.fs mystérieuse.|a" },
  { id: 'p081', niv: 3, theme: 'maison', dsl: "[ Cette|d vieille|a horloge|n.fs ] sonne|v:sonner chaque|d heure.|n.fs" },
  { id: 'p082', niv: 2, theme: 'famille', dsl: "[ Mon|d petit|a frère|n.ms ] construit|v:construire une|d tour|n.fs de|p cubes.|n.mp" },
  { id: 'p083', niv: 3, theme: 'sport', dsl: "[ Les|d nageurs|n.mp ] plongent|v:plonger dans|p le|d grand|a bassin.|n.ms" },
  { id: 'p084', niv: 2, theme: 'montagne', dsl: "[ Le|d berger|n.ms ] compte|v:compter ses|d moutons|n.mp blancs.|a" },
  { id: 'p085', niv: 3, theme: 'ciel', dsl: "[ Une|d fusée|n.fs ] décolle|v:décoller vers|p la|d planète|n.fs Mars.|N.fs" },
  { id: 'p086', niv: 3, theme: 'lecture', dsl: "[ Les|d bibliothécaires|n.mp ] classent|v:classer les|d livres|n.mp neufs.|a" },
  { id: 'p087', niv: 1, theme: 'famille', dsl: "[ Thao|N.ms ] écrit|v:écrire une|d lettre|n.fs à|p sa|d grand-mère.|n.fs" },
  { id: 'p088', niv: 3, theme: 'animaux', skip: ['det'], dsl: "[ Le|d renard|n.ms ] observe|v:observer les|d poules|n.fp du|x voisin.|n.ms" },
  { id: 'p089', niv: 2, theme: 'mer', dsl: "[ Des|d enfants|n.mp ] ramassent|v:ramasser des|d coquillages|n.mp dorés.|a" },
  { id: 'p090', niv: 1, theme: 'école', dsl: "[ La|d cloche|n.fs ] annonce|v:annoncer la|d récréation.|n.fs" },
];

export const PHRASES = BRUT.map(compilePhrase);

/** Retourne les phrases utilisables pour un type d'exercice donne. */
export function phrasesPour(tag) {
  return PHRASES.filter((p) => !p.skip.includes(tag));
}
