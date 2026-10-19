/**
 * Un petit dictionnaire adapté au CE2 : 168 mots courants avec une définition
 * courte et la nature du mot.
 *
 * Les PAGES et les MOTS REPÈRES ne sont jamais écrits à la main : ils sont
 * calculés à partir de la liste triée par `trierAlpha`. Impossible, donc,
 * qu'un mot repère soit incohérent avec l'ordre alphabétique réel.
 */

import { trierAlpha, compareAlpha } from '../../src/core/alphabet.js';

/** [mot, nature, définition] */
const ENTREES = [
  ['abeille', 'nom', 'Insecte jaune et noir qui fabrique le miel.'],
  ['abri', 'nom', 'Endroit où l’on se met pour être protégé.'],
  ['addition', 'nom', 'Calcul dans lequel on ajoute des nombres.'],
  ['aiguille', 'nom', 'Petite tige pointue qui sert à coudre.'],
  ['aile', 'nom', 'Partie du corps qui permet à l’oiseau de voler.'],
  ['album', 'nom', 'Livre dans lequel on range des images ou des photos.'],
  ['ami', 'nom', 'Personne que l’on aime bien et en qui on a confiance.'],
  ['ancre', 'nom', 'Lourde pièce de métal qui retient un bateau au fond de l’eau.'],
  ['animal', 'nom', 'Être vivant qui peut se déplacer tout seul.'],
  ['année', 'nom', 'Durée de douze mois.'],
  ['appétit', 'nom', 'Envie de manger.'],
  ['araignée', 'nom', 'Petite bête à huit pattes qui tisse une toile.'],
  ['arbre', 'nom', 'Grande plante avec un tronc et des branches.'],
  ['argent', 'nom', 'Métal gris et brillant ; sert aussi à acheter.'],
  ['armoire', 'nom', 'Grand meuble fermé où l’on range ses vêtements.'],
  ['automne', 'nom', 'Saison où les feuilles tombent.'],
  ['avion', 'nom', 'Appareil avec des ailes qui vole dans le ciel.'],
  ['balcon', 'nom', 'Petite plateforme devant une fenêtre.'],
  ['ballon', 'nom', 'Grosse boule avec laquelle on joue.'],
  ['bateau', 'nom', 'Engin qui flotte et avance sur l’eau.'],
  ['bavard', 'adjectif', 'Qui parle beaucoup.'],
  ['bibliothèque', 'nom', 'Lieu où l’on peut lire et emprunter des livres.'],
  ['biscuit', 'nom', 'Petit gâteau sec.'],
  ['blessure', 'nom', 'Endroit du corps qui a été abîmé.'],
  ['bois', 'nom', 'Matière dure que l’on prend dans les arbres.'],
  ['bonbon', 'nom', 'Friandise sucrée.'],
  ['bouclier', 'nom', 'Plaque que le chevalier tient pour se protéger.'],
  ['boulanger', 'nom', 'Personne qui fabrique et vend le pain.'],
  ['brouillard', 'nom', 'Nuage très bas qui empêche de voir loin.'],
  ['cabane', 'nom', 'Petite maison faite de planches ou de branches.'],
  ['cahier', 'nom', 'Feuilles attachées ensemble pour écrire.'],
  ['calme', 'adjectif', 'Qui est tranquille, sans agitation.'],
  ['campagne', 'nom', 'Endroit en dehors des villes, avec des champs.'],
  ['carnet', 'nom', 'Tout petit cahier que l’on garde sur soi.'],
  ['carotte', 'nom', 'Légume orange qui pousse sous la terre.'],
  ['cartable', 'nom', 'Sac dans lequel on porte ses affaires d’école.'],
  ['casquette', 'nom', 'Chapeau souple avec une visière.'],
  ['chaleur', 'nom', 'Ce que l’on ressent quand il fait chaud.'],
  ['chapeau', 'nom', 'Vêtement que l’on porte sur la tête.'],
  ['chat', 'nom', 'Petit animal domestique qui ronronne.'],
  ['château', 'nom', 'Très grande maison fortifiée d’autrefois.'],
  ['chaud', 'adjectif', 'Qui a une température élevée.'],
  ['chaussure', 'nom', 'Ce que l’on met à ses pieds pour marcher.'],
  ['chemin', 'nom', 'Petite route de terre.'],
  ['cheval', 'nom', 'Grand animal que l’on peut monter.'],
  ['chien', 'nom', 'Animal domestique qui aboie.'],
  ['ciel', 'nom', 'Grand espace que l’on voit au-dessus de sa tête.'],
  ['cloche', 'nom', 'Objet en métal qui sonne quand on le fait bouger.'],
  ['coffre', 'nom', 'Grande boîte solide avec un couvercle.'],
  ['colline', 'nom', 'Petite montagne arrondie.'],
  ['courage', 'nom', 'Force qui permet de faire ce qui fait peur.'],
  ['crayon', 'nom', 'Bâtonnet de bois avec une mine pour écrire.'],
  ['cuisine', 'nom', 'Pièce de la maison où l’on prépare les repas.'],
  ['danger', 'nom', 'Ce qui peut faire du mal.'],
  ['danse', 'nom', 'Suite de mouvements faits en musique.'],
  ['dauphin', 'nom', 'Animal marin très intelligent.'],
  ['dent', 'nom', 'Partie dure de la bouche qui sert à mâcher.'],
  ['dessin', 'nom', 'Image que l’on fait avec un crayon.'],
  ['dictionnaire', 'nom', 'Livre qui explique le sens des mots, rangés par ordre alphabétique.'],
  ['dragon', 'nom', 'Animal imaginaire qui crache du feu.'],
  ['eau', 'nom', 'Liquide transparent que l’on boit.'],
  ['école', 'nom', 'Lieu où les enfants apprennent.'],
  ['écureuil', 'nom', 'Petit animal roux à grande queue touffue.'],
  ['éléphant', 'nom', 'Très gros animal gris avec une trompe.'],
  ['épée', 'nom', 'Arme longue et pointue des chevaliers.'],
  ['étoile', 'nom', 'Point lumineux que l’on voit la nuit dans le ciel.'],
  ['famille', 'nom', 'Les personnes avec qui on vit et à qui on est lié.'],
  ['fenêtre', 'nom', 'Ouverture d’un mur fermée par une vitre.'],
  ['fer', 'nom', 'Métal gris très solide.'],
  ['ferme', 'nom', 'Maison avec des champs et des animaux.'],
  ['fête', 'nom', 'Jour où l’on se réunit pour s’amuser.'],
  ['feu', 'nom', 'Flammes qui éclairent et qui brûlent.'],
  ['feuille', 'nom', 'Partie plate et verte d’une plante ; page de papier.'],
  ['fleur', 'nom', 'Partie colorée et parfumée d’une plante.'],
  ['forêt', 'nom', 'Grand terrain couvert d’arbres.'],
  ['fourmi', 'nom', 'Tout petit insecte qui vit en colonie.'],
  ['fromage', 'nom', 'Aliment fabriqué avec du lait.'],
  ['fruit', 'nom', 'Partie sucrée d’une plante que l’on mange.'],
  ['gâteau', 'nom', 'Pâtisserie sucrée que l’on cuit au four.'],
  ['géant', 'nom', 'Personnage imaginaire très grand.'],
  ['glace', 'nom', 'Eau devenue dure à cause du froid ; dessert glacé.'],
  ['grenier', 'nom', 'Pièce tout en haut de la maison, sous le toit.'],
  ['grenouille', 'nom', 'Petit animal vert qui saute et nage.'],
  ['guitare', 'nom', 'Instrument de musique à cordes.'],
  ['herbe', 'nom', 'Petites plantes vertes qui couvrent le sol.'],
  ['hibou', 'nom', 'Oiseau de nuit aux grands yeux ronds.'],
  ['histoire', 'nom', 'Récit de ce qui est arrivé, vrai ou inventé.'],
  ['hiver', 'nom', 'Saison la plus froide de l’année.'],
  ['horloge', 'nom', 'Grand appareil qui donne l’heure.'],
  ['image', 'nom', 'Dessin ou photo que l’on regarde.'],
  ['île', 'nom', 'Terre entourée d’eau de tous les côtés.'],
  ['jambe', 'nom', 'Partie du corps qui sert à marcher.'],
  ['jardin', 'nom', 'Terrain où poussent des fleurs ou des légumes.'],
  ['jeu', 'nom', 'Activité que l’on fait pour s’amuser.'],
  ['jour', 'nom', 'Durée de vingt-quatre heures ; moment où il fait clair.'],
  ['journal', 'nom', 'Papier imprimé qui raconte les nouvelles.'],
  ['jumelles', 'nom', 'Appareil à deux tubes pour voir plus loin.'],
  ['lait', 'nom', 'Liquide blanc que donne la vache.'],
  ['lampe', 'nom', 'Objet qui donne de la lumière.'],
  ['lapin', 'nom', 'Petit animal à longues oreilles.'],
  ['lettre', 'nom', 'Signe de l’alphabet ; message que l’on envoie.'],
  ['libellule', 'nom', 'Insecte aux ailes transparentes qui vole près de l’eau.'],
  ['livre', 'nom', 'Pages réunies dans une couverture, que l’on lit.'],
  ['lune', 'nom', 'Astre qui éclaire la nuit.'],
  ['magie', 'nom', 'Art de faire des choses qui semblent impossibles.'],
  ['main', 'nom', 'Partie du corps au bout du bras, avec cinq doigts.'],
  ['maison', 'nom', 'Bâtiment dans lequel on habite.'],
  ['maître', 'nom', 'Personne qui enseigne à l’école.'],
  ['malade', 'adjectif', 'Qui n’est pas en bonne santé.'],
  ['maman', 'nom', 'Nom affectueux donné à sa mère.'],
  ['manteau', 'nom', 'Vêtement chaud que l’on met par-dessus.'],
  ['marché', 'nom', 'Endroit où des marchands vendent leurs produits.'],
  ['matin', 'nom', 'Début de la journée.'],
  ['mer', 'nom', 'Très grande étendue d’eau salée.'],
  ['merci', 'nom', 'Mot que l’on dit pour remercier.'],
  ['mercredi', 'nom', 'Troisième jour de la semaine.'],
  ['merle', 'nom', 'Oiseau noir au bec jaune.'],
  ['montagne', 'nom', 'Très grande hauteur de terre et de rochers.'],
  ['mouton', 'nom', 'Animal de la ferme couvert de laine.'],
  ['musique', 'nom', 'Art de faire des sons agréables ensemble.'],
  ['nage', 'nom', 'Façon de se déplacer dans l’eau.'],
  ['neige', 'nom', 'Eau gelée qui tombe en flocons blancs.'],
  ['nid', 'nom', 'Abri que l’oiseau construit pour ses œufs.'],
  ['noisette', 'nom', 'Petit fruit à coque dure.'],
  ['nuage', 'nom', 'Amas de gouttelettes qui flotte dans le ciel.'],
  ['nuit', 'nom', 'Moment où il fait sombre.'],
  ['océan', 'nom', 'Mer immense qui sépare les continents.'],
  ['oiseau', 'nom', 'Animal à plumes qui a deux ailes.'],
  ['orage', 'nom', 'Mauvais temps avec du tonnerre et des éclairs.'],
  ['ours', 'nom', 'Gros animal sauvage très fort.'],
  ['pain', 'nom', 'Aliment fait de farine et cuit au four.'],
  ['panier', 'nom', 'Sac rigide avec une poignée.'],
  ['papier', 'nom', 'Matière fine sur laquelle on écrit.'],
  ['parapluie', 'nom', 'Objet que l’on ouvre pour se protéger de la pluie.'],
  ['peinture', 'nom', 'Matière colorée que l’on étale ; tableau peint.'],
  ['plage', 'nom', 'Bord de mer couvert de sable.'],
  ['pluie', 'nom', 'Eau qui tombe des nuages.'],
  ['poème', 'nom', 'Texte court écrit en vers.'],
  ['pomme', 'nom', 'Fruit rond et sucré du pommier.'],
  ['pont', 'nom', 'Construction qui permet de passer au-dessus de l’eau.'],
  ['porte', 'nom', 'Panneau qui ferme l’entrée d’une pièce.'],
  ['poule', 'nom', 'Oiseau de la ferme qui pond des œufs.'],
  ['renard', 'nom', 'Animal sauvage roux à queue touffue.'],
  ['rivière', 'nom', 'Cours d’eau qui se jette dans un fleuve.'],
  ['robot', 'nom', 'Machine qui fait un travail toute seule.'],
  ['sable', 'nom', 'Poudre de petits grains de pierre.'],
  ['salade', 'nom', 'Plante verte que l’on mange crue.'],
  ['soleil', 'nom', 'Étoile qui éclaire et réchauffe la Terre.'],
  ['sorcière', 'nom', 'Personnage de conte qui fait de la magie.'],
  ['souris', 'nom', 'Tout petit animal gris à longue queue.'],
  ['tableau', 'nom', 'Grande surface où le maître écrit ; peinture.'],
  ['tempête', 'nom', 'Vent très violent accompagné de pluie.'],
  ['temps', 'nom', 'Ce que mesurent les horloges ; état du ciel.'],
  ['tortue', 'nom', 'Animal lent protégé par une carapace.'],
  ['train', 'nom', 'Longue suite de wagons tirés sur des rails.'],
  ['trésor', 'nom', 'Grande richesse cachée.'],
  ['trousse', 'nom', 'Petit étui où l’on range ses crayons.'],
  ['vacances', 'nom', 'Période où l’on ne va pas à l’école.'],
  ['vent', 'nom', 'Air qui se déplace.'],
  ['village', 'nom', 'Groupe de maisons à la campagne.'],
  ['ville', 'nom', 'Endroit où habitent beaucoup de personnes.'],
  ['voile', 'nom', 'Grande toile qui pousse le bateau grâce au vent.'],
  ['voiture', 'nom', 'Véhicule à quatre roues et à moteur.'],
  ['zèbre', 'nom', 'Animal à rayures noires et blanches.'],
];

export const MOTS_DICO = trierAlpha(ENTREES.map((e) => e[0]));

export const DEFINITIONS = Object.fromEntries(
  ENTREES.map(([mot, nature, def]) => [mot, { mot, nature, def }]),
);

/** Découpe le dictionnaire en pages de `parPage` mots. */
export function pagesDico(parPage = 6) {
  const pages = [];
  for (let i = 0; i < MOTS_DICO.length; i += parPage) {
    const mots = MOTS_DICO.slice(i, i + parPage);
    if (mots.length < 2) {
      // On ne laisse jamais une page orpheline : on la fusionne avec la précédente.
      if (pages.length) {
        pages[pages.length - 1].mots.push(...mots);
        const p = pages[pages.length - 1];
        p.repereDroit = p.mots[p.mots.length - 1];
      }
      continue;
    }
    pages.push({
      numero: pages.length + 1,
      mots,
      repereGauche: mots[0],
      repereDroit: mots[mots.length - 1],
    });
  }
  return pages;
}

/** Sur quelle page se trouve ce mot ? (null s'il n'est pas dans le dico) */
export function pageDuMot(mot, pages = pagesDico()) {
  return (
    pages.find(
      (p) =>
        compareAlpha(mot, p.repereGauche) >= 0 &&
        compareAlpha(mot, p.repereDroit) <= 0,
    ) || null
  );
}
