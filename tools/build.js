/**
 * Fabrique une version autonome de Thao Aventure : un seul fichier HTML,
 * avec le style et tout le code à l'intérieur. Il fonctionne sans serveur,
 * hors connexion, et peut être hébergé n'importe où.
 *
 * Aucune dépendance : le regroupement des modules est fait ici, à la main.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const racine = resolve(ici, '..');
const ENTREE = 'src/ui/demarrage.js';

const IMPORT = /^import\s+(?:(\*\s+as\s+[A-Za-z_$][\w$]*)|(\{[\s\S]*?\})|([A-Za-z_$][\w$]*))\s+from\s+['"]([^'"]+)['"];?[ \t]*\r?\n?/gm;
const IMPORT_SEUL = /^import\s+['"]([^'"]+)['"];?[ \t]*\r?\n?/gm;

const modules = new Map(); // chemin relatif -> { code, exports, deps }

function lire(cheminRelatif) {
  return readFileSync(join(racine, cheminRelatif), 'utf8');
}

/** Transforme un module ES en fonction, et note ce qu'il exporte. */
function analyser(cheminRelatif) {
  if (modules.has(cheminRelatif)) return modules.get(cheminRelatif);
  let code = lire(cheminRelatif);
  const deps = [];
  const exports = new Set();

  code = code.replace(IMPORT_SEUL, (_, spec) => {
    const cible = resoudre(cheminRelatif, spec);
    deps.push(cible);
    return `__charger(${JSON.stringify(cible)});\n`;
  });

  code = code.replace(IMPORT, (_, etoile, accolades, defaut, spec) => {
    const cible = resoudre(cheminRelatif, spec);
    deps.push(cible);
    const ref = `__charger(${JSON.stringify(cible)})`;
    if (etoile) {
      const nom = etoile.split(/\s+as\s+/)[1];
      return `const ${nom} = ${ref};\n`;
    }
    if (defaut) return `const ${defaut} = ${ref}.default;\n`;
    const liste = accolades
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => {
        const m = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(x);
        return m ? `${m[1]}: ${m[2]}` : x;
      });
    return `const { ${liste.join(', ')} } = ${ref};\n`;
  });

  code = code.replace(/^export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (_, type, nom) => {
    exports.add(nom);
    return `${type} ${nom}`;
  });
  code = code.replace(/^export\s+(async\s+)?function\s+(\*?\s*)([A-Za-z_$][\w$]*)/gm, (_, asy, gen, nom) => {
    exports.add(nom);
    return `${asy || ''}function ${gen || ''}${nom}`;
  });
  code = code.replace(/^export\s+class\s+([A-Za-z_$][\w$]*)/gm, (_, nom) => {
    exports.add(nom);
    return `class ${nom}`;
  });
  code = code.replace(/^export\s+\{([^}]*)\};?[ \t]*\r?\n?/gm, (_, liste) => {
    for (const brut of liste.split(',')) {
      const x = brut.trim();
      if (!x) continue;
      const m = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(x);
      exports.add(m ? `${m[2]}: ${m[1]}` : x);
    }
    return '';
  });
  if (/^export\s+default/m.test(code)) {
    throw new Error(`${cheminRelatif} : « export default » n'est pas géré par ce regroupeur.`);
  }
  if (/^\s*export\s/m.test(code)) {
    throw new Error(`${cheminRelatif} : il reste une exportation non traitée.`);
  }

  const entree = { code, exports: [...exports], deps };
  modules.set(cheminRelatif, entree);
  for (const d of deps) analyser(d);
  return entree;
}

function resoudre(depuis, spec) {
  if (!spec.startsWith('.')) throw new Error(`Import externe interdit : ${spec}`);
  const absolu = resolve(racine, dirname(depuis), spec);
  return relative(racine, absolu).split('\\').join('/');
}

analyser(ENTREE);

const corps = [...modules.entries()]
  .map(([chemin, m]) => `__def(${JSON.stringify(chemin)}, function (__exports) {\n${m.code}\nreturn { ${m.exports.join(', ')} };\n});`)
  .join('\n\n');

const js = `/* Thao Aventure — version autonome, fabriquée par tools/build.js */
(function () {
  'use strict';
  var __fabriques = {};
  var __cache = {};
  function __def(nom, fabrique) { __fabriques[nom] = fabrique; }
  function __charger(nom) {
    if (__cache[nom]) return __cache[nom];
    var f = __fabriques[nom];
    if (!f) throw new Error('Module introuvable : ' + nom);
    __cache[nom] = {};
    var sortie = f();
    __cache[nom] = sortie;
    return sortie;
  }

${corps}

  __charger(${JSON.stringify(ENTREE)});
})();
`;

const css = lire('styles/app.css');
let html = lire('index.html');
html = html
  .replace('<link rel="stylesheet" href="styles/app.css">', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="src/ui/demarrage.js"></script>', `<script>\n${js}\n</script>`);

mkdirSync(join(racine, 'dist'), { recursive: true });

// 1. Fragment prêt pour une publication en Artifact (sans <html>/<head>/<body>).
writeFileSync(join(racine, 'dist/artifact.html'), html, 'utf8');

// 2. Page complète, ouvrable directement depuis le disque.
const complet = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b1033">
${html}
</body>
</html>
`.replace('<div id="app">', '</head>\n<body>\n<div id="app">');

writeFileSync(join(racine, 'dist/index.html'), complet, 'utf8');

const ko = (n) => `${Math.round(n / 1024)} ko`;
console.log(`Modules regroupés : ${modules.size}`);
console.log(`dist/index.html   : ${ko(Buffer.byteLength(complet))} (page autonome)`);
console.log(`dist/artifact.html: ${ko(Buffer.byteLength(html))} (fragment pour Artifact)`);
