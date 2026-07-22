// Zero-dependency static dev server with SPA fallback (for the History-API
// router) and correct MIME types for native ES modules. Not for production —
// production is served by nginx (Phase 5). Usage: `node serve.mjs [port]`.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 3005);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

// Real files (with an extension) that exist are served directly; any other path
// falls back to index.html so client-side routes like /r/users resolve.
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    let filePath = normalize(join(ROOT, pathname));

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    // SPA fallback: no extension or missing file -> index.html
    if (!info) {
      if (extname(pathname)) {
        res.writeHead(404).end('Not found');
        return;
      }
      filePath = join(ROOT, 'index.html');
    }

    const body = await readFile(filePath);
    const type = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch (err) {
    res.writeHead(500).end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Player2 Admin dev server → http://localhost:${PORT}`);
});
