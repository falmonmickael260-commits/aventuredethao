/** Petit serveur de développement, sans dépendance. */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let chemin = decodeURIComponent(url.pathname);
    if (chemin === '/') chemin = '/index.html';
    const cible = join(racine, normalize(chemin).replace(/^(\.\.[/\\])+/, ''));
    if (!cible.startsWith(racine)) {
      res.writeHead(403).end('Interdit');
      return;
    }
    const infos = await stat(cible);
    if (infos.isDirectory()) {
      res.writeHead(404).end('Introuvable');
      return;
    }
    const contenu = await readFile(cible);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(cible)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}).listen(PORT, () => {
  console.log(`Thao Aventure : http://localhost:${PORT}/`);
  console.log(`Version autonome : http://localhost:${PORT}/dist/index.html`);
});
