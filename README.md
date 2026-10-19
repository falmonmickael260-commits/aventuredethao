# Thao Aventure — La Grande Aventure du Français

Application éducative pour réviser le français de CE2 pendant les vacances.
Conçue pour un enfant précis : **Thao**.

* **547 exercices** vérifiés, répartis sur **9 compétences** et **6 mondes**
* **57 types d'exercices** différents, **11 façons de répondre** (clic sur les mots,
  saisie au clavier, glisser-déposer, tri en colonnes, liaison, coupure de phrase,
  conjugaison en tableau, phrase libre…)
* **160 tests automatisés** qui vérifient chaque exercice de la banque, les règles
  de conjugaison, l'ordre alphabétique, la cohérence du dictionnaire, la
  sauvegarde et la progression
* Aucune dépendance, aucun compte, aucune donnée envoyée sur Internet

## Démarrer

```bash
npm test          # 160 tests (node --test, sans dépendance)
npm run serve     # serveur de développement sur http://localhost:4321
npm run build     # fabrique dist/index.html, un fichier autonome
```

`dist/index.html` fonctionne tout seul : on peut l'ouvrir directement depuis le
disque, l'envoyer par mail ou le déposer sur n'importe quel hébergement.

## Organisation

```
data/
  modules.js            les 9 compétences et les 6 mondes
  corpus/               DONNÉES LINGUISTIQUES VÉRIFIÉES
    phrases.js            90 phrases annotées (nature des mots, sujet, groupe verbal)
    noms.js               73 noms communs (genre, pluriel réel), 41 noms propres
    adjectifs.js          20 adjectifs avec leurs 4 formes
    familles.js           52 familles de mots + 104 intrus vérifiés
    lexique.js            listes pour l'ordre alphabétique
    dictionnaire.js       164 mots définis, pages et mots repères CALCULÉS
  bank/                 les 9 constructeurs d'exercices (m1 … m9)
src/core/               moteur, sans interface
  normalisation.js        tolérance sur les espaces, la casse, les apostrophes
  correction.js           correction des 11 types de réponses
  conjugaison.js          imparfait : radicaux, irréguliers, -ger / -cer / -ier
  alphabet.js             ordre alphabétique du dictionnaire
  progression.js          maîtrise, difficulté adaptative, file de révision
  recompenses.js          XP, niveaux, 21 badges, coffres, 12 trésors
  seance.js               mission du jour, entraînement libre, évaluation
  stockage.js             sauvegarde locale, réparation, export / import, fusion
  stats.js                statistiques de l'espace parent
src/ui/                 interface
  app.js                  navigation, barre du haut, notifications
  interactions.js         les 11 façons de répondre
  exercice.js             l'écran d'exercice et le parcours d'erreur
  ecrans.js               les 13 autres écrans
  art.js                  toutes les illustrations, en SVG
  fx.js                   ciel étoilé, confettis, sons synthétisés
tests/                  160 tests
tools/
  build.js                regroupement en un fichier autonome
  serve.js                serveur de développement
  harnais.js              harnais de test de l'interface, dans le navigateur
```

## Les garanties pédagogiques

Les réponses ne sont **jamais écrites à la main au petit bonheur** :

* les noms, déterminants, sujets et groupes verbaux viennent de l'annotation
  grammaticale du corpus de phrases ;
* toutes les formes de l'imparfait passent par le moteur de conjugaison, qui est
  comparé à une table de 46 verbes vérifiée à la main ;
* l'ordre alphabétique et les mots repères du dictionnaire sont **calculés**,
  jamais saisis — un mot repère incohérent est donc impossible ;
* les pluriels irréguliers (`cheval → chevaux`) et les quatre formes des
  adjectifs sont stockés explicitement ;
* chaque réponse libre est vérifiée par des **règles déclarées** (mot attendu,
  forme interdite, majuscule, point, ordre des mots), jamais par une
  ressemblance approximative ;
* `tests/banque.test.js` vérifie, pour **chacun des 547 exercices**, que la bonne
  réponse est acceptée et qu'une réponse fausse est refusée.

## Vie privée

La progression est enregistrée dans le `localStorage` du navigateur de
l'appareil. Elle n'est pas synchronisée entre plusieurs appareils : l'espace
parent le dit explicitement et propose un export / import de fichier pour
transférer la progression. Aucune autre donnée personnelle n'est demandée.
