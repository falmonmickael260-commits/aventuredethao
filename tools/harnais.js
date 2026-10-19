/**
 * Harnais de test d'interface, chargé dans la page par l'outil de
 * prévisualisation. Il remplit les exercices avec les bonnes réponses de la
 * banque, en utilisant les VRAIS contrôles de l'interface.
 */

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function ecrire(input, valeur) {
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, valeur);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function appliquer(ex) {
  const page = $('.page-travail');
  switch (ex.type) {
    case 'clic-mots': { const c = $$('.mot--cliquable', page); for (const i of ex.reponse.indices) c[i].click(); break; }
    case 'choix-multiple': { const c = $$('.option', page); for (const i of ex.reponse.indices) c[i].click(); break; }
    case 'choix': $$('.option', page)[ex.reponse.index].click(); break;
    case 'vrai-faux': $$('.option', page)[ex.reponse.valeur ? 0 : 1].click(); break;
    case 'texte': ecrire($('.saisie', page), ex.reponse.attendus[0]); break;
    case 'phrase': ecrire($('.saisie', page), ex.reponse.solution); break;
    case 'textes': { const ch = $$('input.saisie', page); ex.reponse.champs.forEach((c, i) => ch[i] && ecrire(ch[i], c.attendus[0])); break; }
    case 'coupe-phrase': $$('.coupure', page).find((x) => Number(x.dataset.pos) === ex.reponse.coupe).click(); break;
    case 'colonnes':
      for (const [mot, col] of Object.entries(ex.reponse.placement)) {
        $$('.etiquette', page).find((e) => e.textContent.trim() === mot).click();
        $(`.colonne[data-col="${col}"]`, page).click();
      }
      break;
    case 'ordre': {
      const vise = ex.reponse.ordre;
      for (let t = 0; t < 80; t++) {
        const act = $$('.rangee__item .etiquette > span:first-child', page).map((s) => s.textContent);
        let bouge = false;
        for (let i = 0; i < act.length - 1; i++) {
          if (vise.indexOf(act[i]) > vise.indexOf(act[i + 1])) {
            $$('.rangee__item', page)[i + 1].querySelector('.fleche').click();
            bouge = true;
            break;
          }
        }
        if (!bouge) break;
      }
      break;
    }
    case 'paires': {
      const cols = $$('.paires__col', page);
      for (const [g, d] of Object.entries(ex.reponse.paires)) {
        const ig = ex.question.gauche.findIndex((x) => x.id === g);
        const idr = ex.question.droite.findIndex((x) => x.id === d);
        $$('.lien-btn', cols[0])[ig].click();
        $$('.lien-btn', cols[1])[idr].click();
      }
      break;
    }
    default: throw new Error(`type non géré : ${ex.type}`);
  }
}

export async function jouerSeance(banque, max = 20) {
  const r = { joues: 0, justes: 0, echecs: [], types: {} };
  for (let i = 0; i < max; i++) {
    await pause(25);
    const page = $('.page-travail');
    if (!page || !page.dataset.exercice) break;
    const ex = banque.exerciceParId(page.dataset.exercice);
    r.types[ex.type] = (r.types[ex.type] || 0) + 1;
    try {
      await appliquer(ex);
    } catch (e) {
      r.echecs.push({ id: ex.id, type: ex.type, msg: `interface : ${e.message}` });
      break;
    }
    const valider = $('.actions button');
    if (valider.disabled) {
      r.echecs.push({ id: ex.id, type: ex.type, msg: 'le bouton Vérifier est resté désactivé' });
      break;
    }
    valider.click();
    await pause(35);
    const retour = $('.retour');
    r.joues += 1;
    if (retour && retour.className.includes('retour--juste')) r.justes += 1;
    else r.echecs.push({ id: ex.id, type: ex.type, msg: $('.retour__texte')?.textContent || 'aucun retour affiché' });
    const suivant = $$('.actions button').find((b) => /suivant|résultats/i.test(b.textContent));
    if (!suivant) break;
    suivant.click();
  }
  return r;
}

export async function jouerModule(banque, mod, n = 10) {
  location.hash = `#/choisir/${mod}`;
  await pause(120);
  $$('button').find((b) => b.textContent.includes('Mélange de tous les types')).click();
  await pause(150);
  return jouerSeance(banque, n);
}

export async function jouerFormat(banque, mod, format, n = 6) {
  const { creerSeanceFormats } = await import('/src/core/seance.js');
  location.hash = '#/accueil';
  await pause(80);
  const app = window.__app;
  app.lancerSeance(creerSeanceFormats(app.profil, mod, [format], n));
  await pause(160);
  return jouerSeance(banque, n);
}
