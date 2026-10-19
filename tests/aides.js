/**
 * Fabrique, pour n'importe quel exercice, une réponse JUSTE et une réponse
 * FAUSSE. Sert à auditer automatiquement toute la banque.
 */

export function reponseJuste(ex) {
  switch (ex.type) {
    case 'clic-mots':
    case 'choix-multiple':
      return [...ex.reponse.indices];
    case 'choix':
      return ex.reponse.index;
    case 'vrai-faux':
      return ex.reponse.valeur;
    case 'texte':
      return ex.reponse.attendus[0];
    case 'textes':
      return Object.fromEntries(ex.reponse.champs.map((c) => [c.cle, c.attendus[0]]));
    case 'colonnes':
      return { ...ex.reponse.placement };
    case 'ordre':
      return [...ex.reponse.ordre];
    case 'paires':
      return { ...ex.reponse.paires };
    case 'coupe-phrase':
      return ex.reponse.coupe;
    case 'phrase':
      return ex.reponse.solution;
    default:
      throw new Error(`Type non géré par les tests : ${ex.type}`);
  }
}

export function reponseFausse(ex) {
  switch (ex.type) {
    case 'clic-mots':
    case 'choix-multiple': {
      const attendus = new Set(ex.reponse.indices);
      const total = ex.type === 'clic-mots' ? ex.question.tokens.length : ex.question.options.length;
      for (let i = 0; i < total; i++) if (!attendus.has(i)) return [i];
      return ex.reponse.indices.slice(0, -1);
    }
    case 'choix':
      return (ex.reponse.index + 1) % ex.question.options.length;
    case 'vrai-faux':
      return !ex.reponse.valeur;
    case 'texte':
      return 'xyzqwerty';
    case 'textes':
      return Object.fromEntries(ex.reponse.champs.map((c) => [c.cle, 'xyzqwerty']));
    case 'colonnes': {
      const ids = ex.question.colonnes.map((c) => c.id);
      return Object.fromEntries(
        Object.entries(ex.reponse.placement).map(([mot, col]) => [
          mot,
          ids.find((id) => id !== col) || col,
        ]),
      );
    }
    case 'ordre': {
      const bon = ex.reponse.ordre;
      const inverse = [...bon].reverse();
      if (inverse.join('|') !== bon.join('|')) return inverse;
      return [bon[1], bon[0], ...bon.slice(2)];
    }
    case 'paires': {
      const cles = Object.keys(ex.reponse.paires);
      const valeurs = cles.map((k) => ex.reponse.paires[k]);
      const decale = valeurs.slice(1).concat(valeurs[0]);
      return Object.fromEntries(cles.map((k, i) => [k, decale[i]]));
    }
    case 'coupe-phrase':
      return ex.reponse.coupe === 1 ? 2 : ex.reponse.coupe - 1;
    case 'phrase':
      return 'bla';
    default:
      throw new Error(`Type non géré par les tests : ${ex.type}`);
  }
}
