/**
 * Outils communs aux neuf banques d'exercices.
 *
 * Tous les tirages sont DÉTERMINISTES : la même graine donne toujours la même
 * suite. La banque d'exercices est donc identique d'une session à l'autre,
 * ce qui permet de l'auditer, de la tester et de garder des identifiants
 * stables pour l'historique de Thao.
 */

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function graine(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange une liste de façon déterministe. */
export function melanger(liste, cle) {
  const r = graine(cle);
  const out = [...liste];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Prend `n` éléments, de façon déterministe. */
export function piocher(liste, n, cle) {
  return melanger(liste, cle).slice(0, n);
}

/** Récompense liée à la difficulté. */
export function recompense(difficulte) {
  return {
    1: { xp: 10, etoiles: 1 },
    2: { xp: 15, etoiles: 1 },
    3: { xp: 20, etoiles: 2 },
  }[difficulte];
}

/** Tokens d'affichage d'une phrase du corpus. */
export function tokensAffichage(phrase) {
  return phrase.tokens.map((t) => ({ w: t.w, after: t.after, glue: t.glue }));
}

/** Transforme une phrase en texte avec des blancs aux indices donnés. */
export function texteAvecBlancs(phrase, indices, marque = '____') {
  return phrase.tokens
    .map((t, i) => {
      const mot = indices.includes(i) ? marque : t.w;
      return (i === 0 || t.glue ? '' : ' ') + mot + t.after;
    })
    .join('')
    .trim();
}

/** Construit un exercice en remplissant les champs obligatoires. */
export function exercice(def) {
  const manquants = ['id', 'module', 'competence', 'format', 'difficulte', 'type', 'consigne', 'reponse']
    .filter((k) => def[k] === undefined || def[k] === null);
  if (manquants.length) {
    throw new Error(`Exercice incomplet (${def.id || '?'}) : champs manquants ${manquants.join(', ')}`);
  }
  return {
    indice: 'Relis bien la consigne, puis essaie encore.',
    explication: '',
    question: {},
    ...def,
    recompense: def.recompense || recompense(def.difficulte),
  };
}

/** Numérote les identifiants d'une série. */
export function idSerie(module, format, i) {
  return `${module}-${format}-${String(i + 1).padStart(2, '0')}`;
}

/** Jolie énumération : « a, b et c ». */
export function enumerer(liste) {
  if (liste.length <= 1) return liste.join('');
  return `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`;
}

/** Article indéfini correct devant un mot. */
export function unUne(nom, genre) {
  return genre === 'f' ? `une ${nom}` : `un ${nom}`;
}
