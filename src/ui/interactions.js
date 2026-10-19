/**
 * Les onze façons de répondre.
 *
 * Chaque interaction est une petite fabrique qui renvoie :
 *   el()            l'élément à afficher
 *   saisie()        la réponse de Thao, au format attendu par la correction
 *   pret()          y a-t-il de quoi valider ?
 *   marquer(res)    colorie la réponse après correction (jamais la couleur
 *                   seule : il y a toujours une icône ✓ ✕ ! et un mot)
 *   verrouiller()   empêche de modifier après validation
 *   reinitialiser() pour un nouvel essai
 *
 * Tout fonctionne au doigt, à la souris ET au clavier.
 */

import { h, svg, vider } from './dom.js';
import { icone } from './art.js';
import { son, vibrer } from './fx.js';

const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ------------------------------------------------------------------ */
/* Décorations partagées : page de dictionnaire, phrase de départ…     */
/* ------------------------------------------------------------------ */

function pageDico(page, titre = 'Page du dictionnaire') {
  return h('div.dico', null,
    h('div.dico__haut', null,
      h('span', null, page.repereGauche),
      h('span.dico__num', null, page.numero ? `page ${page.numero}` : titre),
      h('span', null, page.repereDroit)),
    page.entrees
      ? h('dl.dico__entrees', null, ...page.entrees.map((e) => h('div.dico__entree', null,
          h('dt.dico__mot', null, e.mot, e.nature ? h('span', null, e.nature) : null),
          h('dd.dico__def', { style: { margin: 0 } }, e.def))))
      : page.mots
        ? h('div.dico__liste', null, ...page.mots.map((m) => h('span.etiquette', null, m)))
        : null,
  );
}

function decorations(ex) {
  const q = ex.question;
  const blocs = [];
  if (q.pageComplete) blocs.push(pageDico(q.pageComplete));
  if (q.page) blocs.push(pageDico(q.page));
  if (q.definition) blocs.push(h('div.depart', null, '« ', q.definition, ' »'));
  if (q.affirmation) blocs.push(h('p.phrase-travail', null, q.affirmation));
  if (q.phrase && !q.tokens) blocs.push(h('p.phrase-travail', null, q.phrase));
  if (q.depart) blocs.push(h('div.depart', null, q.depart));
  if (q.faux) blocs.push(h('div.depart', { style: { borderLeftColor: 'var(--faux)' } }, q.faux));
  if (q.trou) blocs.push(h('div.depart', null, q.trou));
  if (q.groupe) blocs.push(h('div.depart', null, q.groupe));
  if (q.mot && !q.options) blocs.push(h('div.depart', null, q.mot));
  if (q.texteTrous && !q.champs) blocs.push(h('p.phrase-travail', null, q.texteTrous));
  if (Array.isArray(q.liste)) {
    blocs.push(h('div.reserve', null, ...q.liste.map((m) => h('span.etiquette', null, m))));
  }
  if (q.enListe && Array.isArray(q.mots)) {
    blocs.push(h('div.reserve', null, ...q.mots.map((m) => h('span.etiquette', null, m))));
  }
  if (q.indices) {
    blocs.push(h('ul', { style: { margin: '0 0 16px', paddingLeft: '20px', color: 'var(--encre-moyenne)' } },
      ...q.indices.map((i) => h('li', { style: { marginBottom: '6px' } }, i))));
  }
  if (q.montres && !q.options) {
    blocs.push(h('div.reserve', null, ...q.montres.map((m) => h('span.etiquette', null, m))));
  }
  if (q.pages && !q.options && !q.coffre) {
    blocs.push(h('div.grille.grille--3', { style: { marginBottom: '16px' } },
      ...q.pages.map((p) => pageDico(p))));
  }
  return blocs;
}

/* ------------------------------------------------------------------ */
/* 1. Cliquer sur des mots                                             */
/* ------------------------------------------------------------------ */

function clicMots(ex, ctx) {
  const choisis = new Set();
  const boutons = [];
  const phrase = h('p.phrase-travail');

  ex.question.tokens.forEach((t, i) => {
    if (!t.glue && i > 0) phrase.append(document.createTextNode(' '));
    const b = h('button.mot.mot--cliquable', {
      type: 'button',
      'aria-pressed': 'false',
      'aria-label': `le mot ${t.w}`,
      onclick() {
        if (ctx.verrouille) return;
        if (choisis.has(i)) choisis.delete(i);
        else choisis.add(i);
        b.classList.toggle('mot--choisi', choisis.has(i));
        b.setAttribute('aria-pressed', choisis.has(i) ? 'true' : 'false');
        son('clic');
        vibrer(10);
        ctx.change();
      },
    }, t.w, t.after ? h('span.mot__ponct', null, t.after) : null);
    boutons.push(b);
    phrase.append(b);
  });

  return {
    el: h('div', null, ...decorations(ex), phrase),
    saisie: () => [...choisis],
    pret: () => choisis.size > 0,
    marquer(res, reveler) {
      const d = res.detail || {};
      boutons.forEach((b, i) => {
        b.classList.remove('mot--choisi');
        if ((d.bons || []).includes(i)) b.classList.add('mot--juste');
        else if ((d.trop || []).includes(i)) b.classList.add('mot--faux');
        else if (reveler && (d.manques || []).includes(i)) b.classList.add('mot--oublie');
      });
    },
    verrouiller() { boutons.forEach((b) => { b.disabled = true; b.classList.remove('mot--cliquable'); }); },
    reinitialiser() {
      choisis.clear();
      boutons.forEach((b) => {
        b.disabled = false;
        b.className = 'mot mot--cliquable';
        b.setAttribute('aria-pressed', 'false');
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 2. Choix unique                                                     */
/* ------------------------------------------------------------------ */

function choix(ex, ctx) {
  let choisi = null;
  const boutons = [];
  const options = ex.question.options;
  const serre = options.every((o) => String(o).length < 16);
  const liste = h('div.options', { class: serre ? 'options--serre' : '', role: 'radiogroup', 'aria-label': ex.consigne });

  options.forEach((texte, i) => {
    const b = h('button.option', {
      type: 'button',
      role: 'radio',
      'aria-checked': 'false',
      onclick() {
        if (ctx.verrouille) return;
        choisi = i;
        boutons.forEach((x, j) => {
          x.classList.toggle('option--choisie', j === i);
          x.setAttribute('aria-checked', j === i ? 'true' : 'false');
        });
        son('clic');
        vibrer(10);
        ctx.change();
      },
    }, h('span.option__lettre', null, LETTRES[i] || i + 1), h('span', null, texte));
    boutons.push(b);
    liste.append(b);
  });

  return {
    el: h('div', null, ...decorations(ex), liste),
    saisie: () => choisi,
    pret: () => choisi !== null,
    marquer(res, reveler) {
      boutons.forEach((b, i) => {
        b.classList.remove('option--choisie');
        if (i === ex.reponse.index && (res.statut === 'juste' || reveler)) {
          b.classList.add('option--juste');
          b.append(h('span.option__marque', null, res.statut === 'juste' ? '✓ bonne réponse' : '✓ c’était ça'));
        } else if (i === res.detail?.choisi && res.statut !== 'juste') {
          b.classList.add('option--faux');
          b.append(h('span.option__marque', null, '✕ non'));
        }
      });
    },
    verrouiller() { boutons.forEach((b) => { b.disabled = true; }); },
    reinitialiser() {
      choisi = null;
      boutons.forEach((b) => {
        b.disabled = false;
        b.className = 'option';
        b.setAttribute('aria-checked', 'false');
        b.querySelector('.option__marque')?.remove();
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 3. Oui / Non                                                        */
/* ------------------------------------------------------------------ */

function vraiFaux(ex, ctx) {
  let choisi = null;
  const libelles = ex.question.libelles || ['Oui', 'Non'];
  const boutons = [];
  const liste = h('div.options.options--serre', { role: 'radiogroup', 'aria-label': ex.consigne });

  [true, false].forEach((valeur, i) => {
    const b = h('button.option', {
      type: 'button',
      role: 'radio',
      'aria-checked': 'false',
      style: { justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700' },
      onclick() {
        if (ctx.verrouille) return;
        choisi = valeur;
        boutons.forEach((x, j) => {
          x.classList.toggle('option--choisie', j === i);
          x.setAttribute('aria-checked', j === i ? 'true' : 'false');
        });
        son('clic');
        ctx.change();
      },
    }, svg(icone(valeur ? 'check' : 'croix', 24)), h('span', null, libelles[i]));
    boutons.push(b);
    liste.append(b);
  });

  return {
    el: h('div', null, ...decorations(ex), liste),
    saisie: () => choisi,
    pret: () => choisi !== null,
    marquer(res, reveler) {
      const bonIndex = ex.reponse.valeur ? 0 : 1;
      boutons.forEach((b, i) => {
        b.classList.remove('option--choisie');
        if (i === bonIndex && (res.statut === 'juste' || reveler)) {
          b.classList.add('option--juste');
          b.append(h('span.option__marque', null, '✓'));
        } else if ((i === 0) === res.detail?.choisi && res.statut !== 'juste') {
          b.classList.add('option--faux');
          b.append(h('span.option__marque', null, '✕'));
        }
      });
    },
    verrouiller() { boutons.forEach((b) => { b.disabled = true; }); },
    reinitialiser() {
      choisi = null;
      boutons.forEach((b) => {
        b.disabled = false;
        b.className = 'option';
        b.style.justifyContent = 'center';
        b.setAttribute('aria-checked', 'false');
        b.querySelector('.option__marque')?.remove();
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 4. Cases à cocher (plusieurs bonnes réponses)                       */
/* ------------------------------------------------------------------ */

function choixMultiple(ex, ctx) {
  const choisis = new Set();
  const boutons = [];
  const liste = h('div.options', { role: 'group', 'aria-label': ex.consigne });
  ex.question.options.forEach((texte, i) => {
    const b = h('button.option', {
      type: 'button',
      'aria-pressed': 'false',
      onclick() {
        if (ctx.verrouille) return;
        if (choisis.has(i)) choisis.delete(i); else choisis.add(i);
        b.classList.toggle('option--choisie', choisis.has(i));
        b.setAttribute('aria-pressed', choisis.has(i) ? 'true' : 'false');
        son('clic');
        ctx.change();
      },
    }, h('span.option__lettre', null, choisis.has(i) ? '✓' : LETTRES[i]), h('span', null, texte));
    boutons.push(b);
    liste.append(b);
  });
  return {
    el: h('div', null, ...decorations(ex), liste),
    saisie: () => [...choisis],
    pret: () => choisis.size > 0,
    marquer(res, reveler) {
      const d = res.detail || {};
      boutons.forEach((b, i) => {
        b.classList.remove('option--choisie');
        if ((d.bons || []).includes(i)) b.classList.add('option--juste');
        else if ((d.trop || []).includes(i)) b.classList.add('option--faux');
        else if (reveler && (d.manques || []).includes(i)) b.classList.add('option--juste');
      });
    },
    verrouiller() { boutons.forEach((b) => { b.disabled = true; }); },
    reinitialiser() {
      choisis.clear();
      boutons.forEach((b, i) => { b.disabled = false; b.className = 'option'; });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 5. Une réponse écrite                                               */
/* ------------------------------------------------------------------ */

function champ(placeholder, classes = '') {
  return h('input.saisie', {
    type: 'text',
    class: classes,
    placeholder,
    autocomplete: 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    inputmode: 'text',
    enterkeyhint: 'done',
  });
}

function texte(ex, ctx) {
  const q = ex.question;
  const entree = champ('Écris ici…', q.court ? 'saisie--courte' : '');
  entree.addEventListener('input', () => ctx.change());
  entree.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); ctx.valider(); }
  });

  let bloc;
  if (q.enLigne) {
    bloc = h('div.ligne-saisie', null, q.avant, entree, q.apres);
  } else {
    bloc = h('div', null, entree);
  }

  return {
    el: h('div', null,
      ...decorations(ex),
      bloc,
      q.exemple && h('p.exemple', null, 'Exemple : ', q.exemple)),
    saisie: () => entree.value,
    pret: () => entree.value.trim().length > 0,
    marquer(res) {
      entree.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
      entree.classList.add(
        res.statut === 'juste' ? 'saisie--juste' : res.accents ? 'saisie--accents' : 'saisie--faux',
      );
    },
    verrouiller() { entree.disabled = true; },
    reinitialiser() {
      entree.disabled = false;
      entree.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
      entree.focus();
    },
    focus() { entree.focus(); },
  };
}

/* ------------------------------------------------------------------ */
/* 6. Plusieurs réponses écrites                                       */
/* ------------------------------------------------------------------ */

function textes(ex, ctx) {
  const q = ex.question;
  const entrees = new Map();
  const marques = new Map();

  const creerChamp = (cle, taille = '') => {
    const e = champ('…', taille);
    e.setAttribute('aria-label', `réponse ${cle}`);
    e.addEventListener('input', () => ctx.change());
    e.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const suivants = [...entrees.values()];
        const i = suivants.indexOf(e);
        if (i >= 0 && i < suivants.length - 1) suivants[i + 1].focus();
        else ctx.valider();
      }
    });
    entrees.set(cle, e);
    return e;
  };

  let corps;
  if (q.tableau) {
    corps = h('div.tableau-conj', null,
      ...q.champs.map((c) => {
        const m = h('span.marque-case');
        marques.set(c.cle, m);
        return h('div.conj-ligne', null,
          h('span.conj-ligne__pronom', null, c.etiquette),
          creerChamp(c.cle, 'saisie--mini'),
          m);
      }));
  } else if (q.parts) {
    const ligne = h('div.ligne-saisie');
    q.parts.forEach((part, i) => {
      ligne.append(document.createTextNode(part));
      const c = q.champs[i];
      if (c) {
        const bloc = h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } });
        const e = creerChamp(c.cle, 'saisie--mini');
        e.style.minWidth = '130px';
        e.placeholder = c.verbe || '…';
        const m = h('span.marque-case');
        marques.set(c.cle, m);
        bloc.append(e, m);
        ligne.append(bloc);
      }
    });
    corps = h('div', null, q.titre && h('h3', { style: { marginBottom: '12px', color: 'var(--encre-sombre)' } }, q.titre), ligne);
  } else if (q.enListe) {
    corps = h('div.tableau-conj', null,
      ...q.champs.map((c) => {
        const m = h('span.marque-case');
        marques.set(c.cle, m);
        return h('div.conj-ligne', null,
          h('span.conj-ligne__pronom', { style: { flexBasis: '46px' } }, c.etiquette),
          creerChamp(c.cle, 'saisie--mini'),
          m);
      }));
  } else if (q.coffre) {
    corps = h('div', null,
      h('div.grille.grille--3', { style: { marginBottom: '16px' } },
        ...q.pages.slice(0, 30).map((p) => h('div.dico', null,
          h('div.dico__haut', null,
            h('span', { style: { fontSize: '.86rem' } }, p.repereGauche),
            h('span.dico__num', null, p.numero),
            h('span', { style: { fontSize: '.86rem' } }, p.repereDroit))))),
      h('div.tableau-conj', null,
        ...q.champs.map((c) => {
          const m = h('span.marque-case');
          marques.set(c.cle, m);
          const e = creerChamp(c.cle, 'saisie--mini');
          e.inputMode = 'numeric';
          e.placeholder = 'n°';
          return h('div.conj-ligne', null,
            svg(icone('cadenas', 20)),
            h('span.conj-ligne__pronom', null, c.etiquette),
            e, m);
        })),
    );
  } else {
    corps = h('div', null,
      q.texteTrous && h('p.phrase-travail', null, q.texteTrous),
      h('div.tableau-conj', null,
        ...q.champs.map((c) => {
          const m = h('span.marque-case');
          marques.set(c.cle, m);
          return h('div.conj-ligne', null,
            h('span.conj-ligne__pronom', { style: { flexBasis: '130px' } }, c.etiquette),
            creerChamp(c.cle, 'saisie--mini'),
            m);
        })),
    );
  }

  const MARQUES = { juste: '✓', faux: '✕', accents: '!', vide: '·' };

  return {
    el: h('div', null, ...decorations(ex), corps, q.exemple && h('p.exemple', null, q.exemple)),
    saisie: () => Object.fromEntries([...entrees].map(([k, e]) => [k, e.value])),
    pret: () => [...entrees.values()].some((e) => e.value.trim().length > 0),
    marquer(res) {
      for (const d of res.detail || []) {
        const e = entrees.get(d.cle);
        const m = marques.get(d.cle);
        if (e) {
          e.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
          if (d.statut === 'juste') e.classList.add('saisie--juste');
          else if (d.statut === 'accents') e.classList.add('saisie--accents');
          else if (d.statut === 'faux') e.classList.add('saisie--faux');
        }
        if (m) {
          m.textContent = MARQUES[d.statut] || '';
          m.className = `marque-case marque-case--${d.statut === 'accents' ? 'accents' : d.statut === 'juste' ? 'juste' : 'faux'}`;
          m.title = d.statut === 'juste' ? 'juste' : d.statut === 'accents' ? 'accent manquant' : 'à corriger';
        }
      }
    },
    verrouiller() { entrees.forEach((e) => { e.disabled = true; }); },
    reinitialiser() {
      entrees.forEach((e) => {
        e.disabled = false;
        e.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
      });
      marques.forEach((m) => { m.textContent = ''; m.className = 'marque-case'; });
      entrees.values().next().value?.focus();
    },
    focus() { entrees.values().next().value?.focus(); },
  };
}

/* ------------------------------------------------------------------ */
/* Déplacement d'étiquettes (doigt, souris et clavier)                 */
/* ------------------------------------------------------------------ */

function rendreDeplacable(etiquette, { surDepot, ciblesSelector, ctx }) {
  let pris = false;
  let clone = null;
  let depart = null;
  let vientDeGlisser = false;

  const choisir = (valeur) => {
    pris = valeur;
    etiquette.classList.toggle('etiquette--prise', valeur);
    etiquette.setAttribute('aria-grabbed', valeur ? 'true' : 'false');
    if (valeur) ctx.selection = etiquette;
    else if (ctx.selection === etiquette) ctx.selection = null;
  };

  const toutDeselectionner = () => {
    document.querySelectorAll('.etiquette--prise').forEach((x) => {
      x.classList.remove('etiquette--prise');
      x.setAttribute('aria-grabbed', 'false');
    });
  };

  etiquette.addEventListener('pointerdown', (e) => {
    if (ctx.verrouille || e.button > 0) return;
    depart = { x: e.clientX, y: e.clientY, bouge: false };
    etiquette.setPointerCapture?.(e.pointerId);
  });

  etiquette.addEventListener('pointermove', (e) => {
    if (!depart || ctx.verrouille) return;
    const dx = e.clientX - depart.x;
    const dy = e.clientY - depart.y;
    if (!depart.bouge && Math.hypot(dx, dy) < 8) return;
    if (!depart.bouge) {
      depart.bouge = true;
      const r = etiquette.getBoundingClientRect();
      clone = etiquette.cloneNode(true);
      clone.classList.add('etiquette--vole');
      clone.style.width = `${r.width}px`;
      clone.style.left = `${r.left}px`;
      clone.style.top = `${r.top}px`;
      depart.ox = e.clientX - r.left;
      depart.oy = e.clientY - r.top;
      document.body.append(clone);
      etiquette.style.opacity = '0.35';
    }
    clone.style.left = `${e.clientX - depart.ox}px`;
    clone.style.top = `${e.clientY - depart.oy}px`;
    const sous = document.elementFromPoint(e.clientX, e.clientY);
    document.querySelectorAll('.colonne--survol').forEach((c) => c.classList.remove('colonne--survol'));
    sous?.closest(ciblesSelector)?.classList.add('colonne--survol');
  });

  const nettoyer = () => {
    if (clone) { clone.remove(); clone = null; }
    etiquette.style.opacity = '';
    document.querySelectorAll('.colonne--survol').forEach((c) => c.classList.remove('colonne--survol'));
  };

  etiquette.addEventListener('pointerup', (e) => {
    if (!depart) return;
    const aGlisse = depart.bouge;
    const point = { x: e.clientX, y: e.clientY };
    depart = null;
    nettoyer();
    if (ctx.verrouille || !aGlisse) return;
    // Un vrai glisser-déposer : on dépose, et on ignore le clic qui suivra.
    vientDeGlisser = true;
    setTimeout(() => { vientDeGlisser = false; }, 350);
    const cible = document.elementFromPoint(point.x, point.y)?.closest(ciblesSelector);
    if (cible) {
      surDepot(cible);
      son('clic');
      vibrer(12);
    }
    choisir(false);
  });

  etiquette.addEventListener('pointercancel', () => { depart = null; nettoyer(); });

  // Un simple clic (souris, tape, clavier ou lecteur d'écran) sélectionne
  // l'étiquette ; on touche ensuite la colonne de destination.
  etiquette.addEventListener('click', (e) => {
    if (ctx.verrouille || vientDeGlisser) return;
    e.preventDefault();
    // Sans cela, le clic remonterait jusqu'à la colonne qui contient
    // l'étiquette, et la reposerait aussitôt.
    e.stopPropagation();
    const dejaPris = pris;
    toutDeselectionner();
    ctx.selection = null;
    choisir(!dejaPris);
    son('clic');
  });

  return { choisir, estPris: () => pris };
}

/* ------------------------------------------------------------------ */
/* 7. Ranger en colonnes                                               */
/* ------------------------------------------------------------------ */

function colonnes(ex, ctx) {
  const placement = {};
  const etiquettes = new Map();
  const zones = new Map();
  const ctxLocal = { verrouille: false, selection: null };

  const reserve = h('div.reserve.colonne', { data: { col: '' }, 'aria-label': 'mots à placer' });
  const videMsg = h('span.reserve__vide', null, 'Tous les mots sont placés ✓');

  function rafraichir() {
    const dansReserve = ex.question.mots.filter((m) => !placement[m]);
    vider(reserve);
    if (!dansReserve.length) reserve.append(videMsg);
    dansReserve.forEach((m) => reserve.append(etiquettes.get(m)));
    zones.forEach((zone, col) => {
      vider(zone);
      ex.question.mots.filter((m) => placement[m] === col).forEach((m) => zone.append(etiquettes.get(m)));
    });
    ctx.change();
  }

  function deposer(mot, col) {
    placement[mot] = col || null;
    if (!col) delete placement[mot];
    rafraichir();
  }

  for (const mot of ex.question.mots) {
    const et = h('button.etiquette', { type: 'button', 'aria-grabbed': 'false' }, mot);
    etiquettes.set(mot, et);
    rendreDeplacable(et, {
      ctx: ctxLocal,
      ciblesSelector: '.colonne',
      surDepot: (cible) => deposer(mot, cible.dataset.col),
    });
  }

  const grille = h('div.colonnes', null,
    ...ex.question.colonnes.map((c) => {
      const zone = h('div.colonne__zone');
      zones.set(c.id, zone);
      const colonne = h('div.colonne', {
        data: { col: c.id },
        tabindex: '0',
        role: 'button',
        'aria-label': `colonne ${c.titre}`,
        onclick() {
          if (ctxLocal.verrouille) return;
          const prise = ctxLocal.selection;
          if (!prise) return;
          const mot = prise.textContent;
          prise.classList.remove('etiquette--prise');
          prise.setAttribute('aria-grabbed', 'false');
          ctxLocal.selection = null;
          deposer(mot, c.id);
          son('clic');
        },
        onkeydown(e) {
          if ((e.key === 'Enter' || e.key === ' ') && ctxLocal.selection) {
            e.preventDefault();
            colonne.click();
          }
        },
      },
        h('div.colonne__titre', null, c.titre),
        c.aide && h('div.colonne__aide', null, c.aide),
        zone);
      return colonne;
    }));

  reserve.addEventListener('click', () => {
    if (ctxLocal.verrouille) return;
    const prise = ctxLocal.selection;
    if (!prise) return;
    const mot = prise.textContent;
    prise.classList.remove('etiquette--prise');
    ctxLocal.selection = null;
    deposer(mot, null);
  });

  rafraichir();

  return {
    el: h('div.tri', null,
      ...decorations(ex),
      h('p.exemple', { style: { marginTop: 0 } }, 'Fais glisser les mots, ou touche un mot puis la colonne.'),
      reserve,
      grille),
    saisie: () => ({ ...placement }),
    pret: () => Object.keys(placement).length > 0,
    marquer(res) {
      for (const d of res.detail || []) {
        const et = etiquettes.get(d.mot);
        if (!et) continue;
        et.classList.remove('etiquette--prise');
        if (d.statut === 'juste') { et.classList.add('etiquette--juste'); et.append(' ✓'); }
        else if (d.statut === 'faux') { et.classList.add('etiquette--faux'); et.append(' ✕'); }
      }
    },
    verrouiller() {
      ctxLocal.verrouille = true;
      etiquettes.forEach((e) => { e.disabled = true; });
    },
    reinitialiser() {
      ctxLocal.verrouille = false;
      for (const mot of Object.keys(placement)) delete placement[mot];
      etiquettes.forEach((e, mot) => {
        e.disabled = false;
        e.className = 'etiquette';
        e.textContent = mot;
      });
      rafraichir();
    },
  };
}

/* ------------------------------------------------------------------ */
/* 8. Remettre dans l'ordre                                            */
/* ------------------------------------------------------------------ */

function ordre(ex, ctx) {
  let liste = [...ex.question.mots];
  const conteneur = h('div.rangee');
  const ctxLocal = { verrouille: false, selection: null };

  function rafraichir() {
    vider(conteneur);
    liste.forEach((mot, i) => {
      const et = h('button.etiquette', {
        type: 'button',
        'aria-grabbed': 'false',
        style: { flex: '1', justifyContent: 'space-between' },
      }, h('span', null, mot), h('span.etiquette__num', null, i + 1));
      rendreDeplacable(et, {
        ctx: ctxLocal,
        ciblesSelector: '.rangee__item',
        surDepot: (cible) => {
          const cibleIndex = Number(cible.dataset.pos);
          const de = liste.indexOf(mot);
          if (de === cibleIndex) return;
          liste.splice(de, 1);
          liste.splice(cibleIndex, 0, mot);
          rafraichir();
        },
      });
      const monter = h('button.fleche', {
        type: 'button',
        'aria-label': `monter ${mot}`,
        disabled: i === 0 || ctxLocal.verrouille,
        onclick() { echanger(i, i - 1); },
      }, svg(icone('haut', 18)));
      const descendre = h('button.fleche', {
        type: 'button',
        'aria-label': `descendre ${mot}`,
        disabled: i === liste.length - 1 || ctxLocal.verrouille,
        onclick() { echanger(i, i + 1); },
      }, svg(icone('bas', 18)));
      conteneur.append(h('div.rangee__item', { data: { pos: i } }, et, h('div.fleches', null, monter, descendre)));
    });
    ctx.change();
  }

  function echanger(a, b) {
    if (b < 0 || b >= liste.length || ctxLocal.verrouille) return;
    [liste[a], liste[b]] = [liste[b], liste[a]];
    son('clic');
    vibrer(10);
    rafraichir();
  }

  rafraichir();

  return {
    el: h('div', null,
      ...decorations(ex),
      h('p.exemple', { style: { marginTop: 0 } }, 'Utilise les flèches, ou fais glisser les mots.'),
      conteneur),
    saisie: () => [...liste],
    pret: () => true,
    marquer(res, reveler) {
      const items = [...conteneur.querySelectorAll('.rangee__item')];
      (res.detail || []).forEach((d, i) => {
        const et = items[i]?.querySelector('.etiquette');
        if (!et) return;
        et.classList.add(d.statut === 'juste' ? 'etiquette--juste' : 'etiquette--faux');
        et.querySelector('.etiquette__num').textContent = d.statut === 'juste' ? '✓' : '✕';
      });
      if (res.statut !== 'juste' && reveler) {
        conteneur.append(h('p.exemple', null, 'Ordre attendu : ', ex.reponse.ordre.join(' — ')));
      }
    },
    verrouiller() {
      ctxLocal.verrouille = true;
      conteneur.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    },
    reinitialiser() {
      ctxLocal.verrouille = false;
      liste = [...ex.question.mots];
      rafraichir();
    },
  };
}

/* ------------------------------------------------------------------ */
/* 9. Relier deux colonnes                                             */
/* ------------------------------------------------------------------ */

function paires(ex, ctx) {
  const liens = {};
  let actif = null;
  const boutonsG = new Map();
  const boutonsD = new Map();
  const couleurs = ['#8b6cf0', '#2fd6c4', '#ff8a4c', '#5fd98a', '#ffc24b'];

  function rafraichir() {
    boutonsG.forEach((b, id) => {
      const lie = liens[id];
      b.classList.toggle('lien-btn--relie', !!lie);
      b.classList.toggle('lien-btn--actif', actif === id);
      const p = b.querySelector('.pastille');
      const i = Object.keys(liens).indexOf(id);
      if (lie) {
        p.textContent = String(i + 1);
        p.style.background = couleurs[i % couleurs.length];
        p.style.color = '#fff';
      } else {
        p.textContent = '•';
        p.style.background = '';
        p.style.color = '';
      }
    });
    boutonsD.forEach((b, id) => {
      const gauche = Object.keys(liens).find((g) => liens[g] === id);
      b.classList.toggle('lien-btn--relie', !!gauche);
      const p = b.querySelector('.pastille');
      if (gauche) {
        const i = Object.keys(liens).indexOf(gauche);
        p.textContent = String(i + 1);
        p.style.background = couleurs[i % couleurs.length];
        p.style.color = '#fff';
      } else {
        p.textContent = '•';
        p.style.background = '';
        p.style.color = '';
      }
    });
    ctx.change();
  }

  ex.question.gauche.forEach((g) => {
    const b = h('button.lien-btn', {
      type: 'button',
      onclick() {
        if (ctx.verrouille) return;
        if (liens[g.id]) { delete liens[g.id]; actif = null; }
        else actif = actif === g.id ? null : g.id;
        son('clic');
        rafraichir();
      },
    }, h('span.pastille', null, '•'), h('span', null, g.texte));
    boutonsG.set(g.id, b);
  });

  ex.question.droite.forEach((d) => {
    const b = h('button.lien-btn', {
      type: 'button',
      onclick() {
        if (ctx.verrouille) return;
        if (!actif) {
          const gauche = Object.keys(liens).find((g) => liens[g] === d.id);
          if (gauche) { delete liens[gauche]; rafraichir(); }
          return;
        }
        for (const g of Object.keys(liens)) if (liens[g] === d.id) delete liens[g];
        liens[actif] = d.id;
        actif = null;
        son('clic');
        vibrer(12);
        rafraichir();
      },
    }, h('span.pastille', null, '•'), h('span', null, d.texte));
    boutonsD.set(d.id, b);
  });

  rafraichir();

  return {
    el: h('div', null,
      ...decorations(ex),
      h('p.exemple', { style: { marginTop: 0 } }, 'Touche un élément à gauche, puis celui de droite qui lui va.'),
      h('div.paires', null,
        h('div.paires__col', null,
          h('div.paires__titre', null, ex.question.titreGauche || 'À relier'),
          ...boutonsG.values()),
        h('div.paires__traits', null, svg(`<svg viewBox="0 0 40 100" preserveAspectRatio="none" style="width:100%;height:100%;opacity:.35" aria-hidden="true"><path d="M2 20h36M2 50h36M2 80h36" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 5" fill="none"/></svg>`)),
        h('div.paires__col', null,
          h('div.paires__titre', null, ex.question.titreDroite || 'Réponses'),
          ...boutonsD.values()))),
    saisie: () => ({ ...liens }),
    pret: () => Object.keys(liens).length > 0,
    marquer(res, reveler) {
      for (const d of res.detail || []) {
        const bg = boutonsG.get(d.gauche);
        if (bg && d.statut !== 'vide') {
          bg.classList.add(d.statut === 'juste' ? 'lien-btn--juste' : 'lien-btn--faux');
        }
        if (d.statut === 'juste') {
          boutonsD.get(d.bon)?.classList.add('lien-btn--juste');
        } else if (reveler) {
          boutonsD.get(d.bon)?.classList.add('lien-btn--juste');
          if (d.relie && d.relie !== d.bon) boutonsD.get(d.relie)?.classList.add('lien-btn--faux');
        }
      }
    },
    verrouiller() {
      boutonsG.forEach((b) => { b.disabled = true; });
      boutonsD.forEach((b) => { b.disabled = true; });
    },
    reinitialiser() {
      for (const k of Object.keys(liens)) delete liens[k];
      actif = null;
      boutonsG.forEach((b) => { b.disabled = false; b.className = 'lien-btn'; });
      boutonsD.forEach((b) => { b.disabled = false; b.className = 'lien-btn'; });
      rafraichir();
    },
  };
}

/* ------------------------------------------------------------------ */
/* 10. Couper la phrase                                                */
/* ------------------------------------------------------------------ */

function coupePhrase(ex, ctx) {
  let coupe = null;
  const coupures = [];
  const phrase = h('p.phrase-travail');

  ex.question.tokens.forEach((t, i) => {
    if (i > 0 && !t.glue) {
      const c = h('button.coupure', {
        type: 'button',
        'aria-label': `couper avant le mot ${t.w}`,
        onclick() {
          if (ctx.verrouille) return;
          coupe = i;
          coupures.forEach((x) => x.classList.toggle('coupure--choisie', Number(x.dataset.pos) === i));
          son('clic');
          vibrer(12);
          ctx.change();
        },
      });
      c.dataset.pos = String(i);
      coupures.push(c);
      phrase.append(c);
    }
    phrase.append(h('span.mot.mot--fixe', null, t.w + (t.after || '')));
  });

  return {
    el: h('div', null,
      ...decorations(ex),
      h('p.exemple', { style: { marginTop: 0 } }, 'Clique sur le trait vertical entre deux mots.'),
      phrase),
    saisie: () => coupe,
    pret: () => coupe !== null,
    marquer(res, reveler) {
      coupures.forEach((c) => {
        const pos = Number(c.dataset.pos);
        c.classList.remove('coupure--choisie');
        if (pos === ex.reponse.coupe && (res.statut === 'juste' || reveler)) {
          c.classList.add('coupure--juste');
        } else if (pos === res.detail?.coupe && res.statut !== 'juste') {
          c.classList.add('coupure--faux');
        }
      });
    },
    verrouiller() { coupures.forEach((c) => { c.disabled = true; }); },
    reinitialiser() {
      coupe = null;
      coupures.forEach((c) => { c.disabled = false; c.className = 'coupure'; });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 11. Écrire une phrase                                               */
/* ------------------------------------------------------------------ */

function phrase(ex, ctx) {
  const q = ex.question;
  const court = !!q.court;
  const zone = court
    ? champ('Écris ta réponse…', 'saisie--courte')
    : h('textarea.saisie', {
        rows: '3',
        placeholder: 'Écris ta phrase ici…',
        autocapitalize: 'sentences',
        spellcheck: 'false',
        style: { resize: 'vertical', lineHeight: '1.6' },
      });
  zone.addEventListener('input', () => ctx.change());
  if (court) {
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); ctx.valider(); }
    });
  }

  return {
    el: h('div', null,
      ...decorations(ex),
      q.texteTrous && h('p.phrase-travail', null, q.texteTrous),
      zone,
      q.aide && h('p.exemple', null, q.aide),
      q.exemple && h('p.exemple', null, q.exemple)),
    saisie: () => zone.value,
    pret: () => zone.value.trim().length > 0,
    marquer(res) {
      zone.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
      zone.classList.add(res.statut === 'juste' ? 'saisie--juste' : res.statut === 'presque' ? 'saisie--accents' : 'saisie--faux');
    },
    verrouiller() { zone.disabled = true; },
    reinitialiser() {
      zone.disabled = false;
      zone.classList.remove('saisie--juste', 'saisie--faux', 'saisie--accents');
      zone.focus();
    },
    focus() { zone.focus(); },
  };
}

/* ------------------------------------------------------------------ */

const FABRIQUES = {
  'clic-mots': clicMots,
  choix,
  'vrai-faux': vraiFaux,
  'choix-multiple': choixMultiple,
  texte,
  textes,
  colonnes,
  ordre,
  paires,
  'coupe-phrase': coupePhrase,
  phrase,
};

/** Construit l'interaction correspondant au type d'exercice. */
export function creerInteraction(exercice, ctx) {
  const fabrique = FABRIQUES[exercice.type];
  if (!fabrique) throw new Error(`Interaction manquante pour le type « ${exercice.type} »`);
  return fabrique(exercice, ctx);
}

export const TYPES_INTERACTIFS = Object.keys(FABRIQUES);
