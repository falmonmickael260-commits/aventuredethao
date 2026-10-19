/**
 * Familles de mots vérifiées pour le CE2.
 *
 * Pour chaque famille :
 *   radical  — la partie commune que l'enfant doit reconnaître
 *   sens     — le lien de sens, formulé pour un enfant de 8 ans
 *   mots     — mots de la famille (même radical ET même idée)
 *   intrus   — mots qui RESSEMBLENT mais n'appartiennent pas à la famille.
 *              C'est le piège classique : « chantier » n'a rien à voir avec
 *              « chanter », « jouer » n'a rien à voir avec « jour ».
 */

export const FAMILLES = [
  { id: 'f01', radical: 'jardin', sens: 'tout tourne autour du jardin', mots: ['jardin', 'jardinier', 'jardinage', 'jardiner', 'jardinière'], intrus: ['journal', 'jarre'] },
  { id: 'f02', radical: 'chant', sens: 'tout tourne autour du chant', mots: ['chant', 'chanter', 'chanteur', 'chanson', 'chantonner'], intrus: ['chantier', 'chandelle'] },
  { id: 'f03', radical: 'dent', sens: 'tout tourne autour des dents', mots: ['dent', 'dentiste', 'dentaire', 'dentier'], intrus: ['dedans', 'dindon'] },
  { id: 'f04', radical: 'fleur', sens: 'tout tourne autour des fleurs', mots: ['fleur', 'fleuriste', 'fleurir', 'fleuri', 'fleurette'], intrus: ['flèche', 'fleuve'] },
  { id: 'f05', radical: 'terr', sens: 'tout tourne autour de la terre', mots: ['terre', 'terrain', 'terrasse', 'enterrer', 'souterrain'], intrus: ['terrible', 'terminer'] },
  { id: 'f06', radical: 'lait', sens: 'tout tourne autour du lait', mots: ['lait', 'laitier', 'laitage', 'laiterie'], intrus: ['laisse', 'laine'] },
  { id: 'f07', radical: 'mer / mar', sens: 'tout tourne autour de la mer', mots: ['mer', 'marin', 'marée', 'maritime'], intrus: ['marcher', 'mardi'] },
  { id: 'f08', radical: 'neig', sens: 'tout tourne autour de la neige', mots: ['neige', 'neiger', 'enneigé', 'déneiger'], intrus: ['nageoire', 'nerf'] },
  { id: 'f09', radical: 'soleil', sens: 'tout tourne autour du soleil', mots: ['soleil', 'ensoleillé', 'ensoleillement'], intrus: ['solide', 'solitaire'] },
  { id: 'f10', radical: 'chaud / chauff', sens: 'tout tourne autour de la chaleur', mots: ['chaud', 'chaleur', 'chauffer', 'chauffage', 'réchauffer'], intrus: ['chaussette', 'chausson'] },
  { id: 'f11', radical: 'froid', sens: 'tout tourne autour du froid', mots: ['froid', 'froideur', 'refroidir'], intrus: ['fromage', 'froisser'] },
  { id: 'f12', radical: 'fruit', sens: 'tout tourne autour des fruits', mots: ['fruit', 'fruitier', 'fruité'], intrus: ['frite', 'fruste'] },
  { id: 'f13', radical: 'lav', sens: 'tout tourne autour du lavage', mots: ['laver', 'lavage', 'lavabo', 'laverie'], intrus: ['lavande', 'lapin'] },
  { id: 'f14', radical: 'dessin', sens: 'tout tourne autour du dessin', mots: ['dessin', 'dessiner', 'dessinateur', 'redessiner'], intrus: ['dessert', 'dessous'] },
  { id: 'f15', radical: 'dans', sens: 'tout tourne autour de la danse', mots: ['danse', 'danser', 'danseur', 'danseuse'], intrus: ['dentiste', 'danger'] },
  { id: 'f16', radical: 'nag', sens: 'tout tourne autour de la nage', mots: ['nage', 'nager', 'nageur', 'nageoire'], intrus: ['navet', 'nappe'] },
  { id: 'f17', radical: 'port', sens: 'tout tourne autour du fait de porter', mots: ['porter', 'porteur', 'portable', 'transporter', 'apporter'], intrus: ['portion', 'portrait'] },
  { id: 'f18', radical: 'vol', sens: 'tout tourne autour du vol dans les airs', mots: ['voler', 'volant', 'envol', 'survoler', 's’envoler'], intrus: ['volume', 'volcan'] },
  { id: 'f19', radical: 'jeu / jou', sens: 'tout tourne autour du jeu', mots: ['jeu', 'jouer', 'joueur', 'jouet'], intrus: ['journée', 'joue'] },
  { id: 'f20', radical: 'écol', sens: 'tout tourne autour de l’école', mots: ['école', 'écolier', 'écolière'], intrus: ['écorce', 'écureuil'] },
  { id: 'f21', radical: 'maison', sens: 'tout tourne autour de la maison', mots: ['maison', 'maisonnette', 'maisonnée'], intrus: ['maïs', 'maigre'] },
  { id: 'f22', radical: 'villag', sens: 'tout tourne autour du village', mots: ['village', 'villageois', 'villageoise'], intrus: ['vilain', 'vitrail'] },
  { id: 'f23', radical: 'arbr', sens: 'tout tourne autour de l’arbre', mots: ['arbre', 'arbuste', 'arbrisseau', 'arboriculture'], intrus: ['arbitre', 'arche'] },
  { id: 'f24', radical: 'pêch', sens: 'tout tourne autour de la pêche', mots: ['pêche', 'pêcher', 'pêcheur', 'pêcherie'], intrus: ['pétale', 'peigne'] },
  { id: 'f25', radical: 'cuisin', sens: 'tout tourne autour de la cuisine', mots: ['cuisine', 'cuisiner', 'cuisinier', 'cuisinière'], intrus: ['cuir', 'cuillère'] },
  { id: 'f26', radical: 'coiff', sens: 'tout tourne autour des cheveux', mots: ['coiffer', 'coiffeur', 'coiffure', 'décoiffer'], intrus: ['coffre', 'coin'] },
  { id: 'f27', radical: 'montagn', sens: 'tout tourne autour de la montagne', mots: ['montagne', 'montagnard', 'montagneux'], intrus: ['mouton', 'monstre'] },
  { id: 'f28', radical: 'peint / peign', sens: 'tout tourne autour de la peinture', mots: ['peindre', 'peinture', 'peintre', 'repeindre'], intrus: ['peine', 'peigne'] },
  { id: 'f29', radical: 'chass', sens: 'tout tourne autour de la chasse', mots: ['chasse', 'chasser', 'chasseur', 'chasseresse'], intrus: ['chaussure', 'châssis'] },
  { id: 'f30', radical: 'fer', sens: 'tout tourne autour du fer', mots: ['fer', 'ferrer', 'ferraille', 'ferronnerie'], intrus: ['ferme', 'fermer'] },
  { id: 'f31', radical: 'bois', sens: 'tout tourne autour du bois', mots: ['bois', 'boisé', 'boiserie', 'déboiser'], intrus: ['boisson', 'boîte'] },
  { id: 'f32', radical: 'glac', sens: 'tout tourne autour de la glace', mots: ['glace', 'glacier', 'glacé', 'glaçon', 'glacière'], intrus: ['glande', 'gland'] },
  { id: 'f33', radical: 'mont', sens: 'tout tourne autour du fait de monter', mots: ['monter', 'montée', 'remonter', 'monteur'], intrus: ['monstre', 'montre'] },
  { id: 'f34', radical: 'jour', sens: 'tout tourne autour du jour', mots: ['jour', 'journée', 'journal', 'journalier', 'bonjour'], intrus: ['jouer', 'joue'] },
  { id: 'f35', radical: 'an / ann', sens: 'tout tourne autour de l’année', mots: ['an', 'année', 'annuel', 'anniversaire'], intrus: ['anneau', 'âne'] },
  { id: 'f36', radical: 'feuill', sens: 'tout tourne autour des feuilles', mots: ['feuille', 'feuillage', 'feuilleter', 'feuillu'], intrus: ['fauteuil', 'feutre'] },
  { id: 'f37', radical: 'plant', sens: 'tout tourne autour des plantes', mots: ['plante', 'planter', 'plantation', 'replanter', 'plantoir'], intrus: ['plancher', 'planète'] },
  { id: 'f38', radical: 'roul', sens: 'tout tourne autour du fait de rouler', mots: ['rouler', 'roulette', 'roulade', 'rouleau'], intrus: ['route', 'rouge'] },
  { id: 'f39', radical: 'saut', sens: 'tout tourne autour du saut', mots: ['saut', 'sauter', 'sauteur', 'sursauter'], intrus: ['sauce', 'saucisse'] },
  { id: 'f40', radical: 'chauss', sens: 'tout tourne autour de ce qu’on met aux pieds', mots: ['chausser', 'chaussure', 'chaussette', 'chausson'], intrus: ['chausser-pied', 'chaume'] },
  { id: 'f41', radical: 'grand', sens: 'tout tourne autour de la grandeur', mots: ['grand', 'grandir', 'grandeur', 'agrandir'], intrus: ['grange', 'grappe'] },
  { id: 'f42', radical: 'long', sens: 'tout tourne autour de la longueur', mots: ['long', 'longueur', 'allonger', 'rallonger'], intrus: ['lundi', 'lotion'] },
  { id: 'f43', radical: 'larg', sens: 'tout tourne autour de la largeur', mots: ['large', 'largeur', 'élargir'], intrus: ['larme', 'lard'] },
  { id: 'f44', radical: 'clair', sens: 'tout tourne autour de la lumière', mots: ['clair', 'éclairer', 'éclaircir', 'clairière'], intrus: ['clavier', 'clou'] },
  { id: 'f45', radical: 'doux / douc', sens: 'tout tourne autour de la douceur', mots: ['doux', 'douceur', 'adoucir', 'doucement'], intrus: ['douche', 'douzaine'] },
  { id: 'f46', radical: 'fort / forc', sens: 'tout tourne autour de la force', mots: ['fort', 'force', 'fortifier', 'renforcer'], intrus: ['fortune', 'forêt'] },
  { id: 'f47', radical: 'sel / sal', sens: 'tout tourne autour du sel', mots: ['sel', 'saler', 'salé', 'salière'], intrus: ['salon', 'salle'] },
  { id: 'f48', radical: 'gard', sens: 'tout tourne autour du fait de garder', mots: ['garder', 'gardien', 'garderie', 'gardiennage'], intrus: ['jardin', 'gare'] },
  { id: 'f49', radical: 'boulang', sens: 'tout tourne autour du pain', mots: ['boulanger', 'boulangerie', 'boulangère'], intrus: ['boulon', 'boule'] },
  { id: 'f50', radical: 'lourd', sens: 'tout tourne autour du poids', mots: ['lourd', 'lourdeur', 'alourdir'], intrus: ['loupe', 'loup'] },
  { id: 'f51', radical: 'camp', sens: 'tout tourne autour du campement', mots: ['camp', 'camper', 'campeur', 'camping', 'campement'], intrus: ['canapé', 'canard'] },
  { id: 'f52', radical: 'livr', sens: 'tout tourne autour du livre', mots: ['livre', 'livret', 'livresque'], intrus: ['lièvre', 'livide'] },
];

/** Corrige une faute de frappe repérée : « chausser-pied » n'existe pas. */
FAMILLES.find((f) => f.id === 'f40').intrus = ['chaume', 'chaudron'];

export const FAMILLE_PAR_MOT = (() => {
  const index = new Map();
  for (const f of FAMILLES) for (const m of f.mots) index.set(m, f.id);
  return index;
})();

export function familleDe(mot) {
  const id = FAMILLE_PAR_MOT.get(mot);
  return id ? FAMILLES.find((f) => f.id === id) : null;
}
