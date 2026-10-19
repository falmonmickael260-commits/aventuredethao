/** Point d'entrée : branche l'application sur la page. */

import { demarrer } from './app.js';

function lancer() {
  const racine = document.getElementById('app');
  if (!racine) return;
  try {
    demarrer(racine);
  } catch (erreur) {
    console.error(erreur);
    racine.innerHTML = `<div class="vue"><div class="carte"><div class="vide">
      <b>Thao Aventure n’a pas pu démarrer</b>
      <p>${String(erreur.message).replace(/[<>&]/g, '')}</p>
      <p>Essaie de recharger la page.</p></div></div></div>`;
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer);
else lancer();
