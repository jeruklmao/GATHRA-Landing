import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const distDirectory = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '4321', 10);
const host = process.env.HOST ?? '127.0.0.1';

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

async function firstReadable(paths) {
  for (const path of paths) {
    try {
      await access(path);
      return path;
    } catch {
      // Continue to the next static-route candidate.
    }
  }

  return undefined;
}

function routeCandidates(pathname) {
  if (pathname === '/') {
    return [resolve(distDirectory, 'index.html')];
  }

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  if (extname(cleanPath)) {
    return [resolve(distDirectory, cleanPath)];
  }

  return [
    resolve(distDirectory, `${cleanPath}.html`),
    resolve(distDirectory, cleanPath, 'index.html'),
  ];
}

const server = createServer(async (request, response) => {
  let pathname;

  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const candidates = routeCandidates(pathname).filter(
    (candidate) => candidate === distDirectory || candidate.startsWith(`${distDirectory}${sep}`),
  );
  const requestedFile = await firstReadable(candidates);
  const fallbackFile = resolve(distDirectory, '404.html');
  const file = requestedFile ?? (await firstReadable([fallbackFile]));

  if (!file) {
    response.writeHead(404).end('Not found');
    return;
  }

  response.writeHead(requestedFile ? 200 : 404, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes.get(extname(file)) ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static preview ready at http://${host}:${port}`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
