import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

/** Read-only, loopback-only mirror. Stopping this server never stops the real site. */
export async function ownedOrigin(upstream: string) {
  const base = new URL(upstream);
  let requests = 0;
  const server = createServer(async (request, response) => {
    requests++;
    try {
      const target = new URL(request.url ?? '/', base);
      if (target.origin !== base.origin || !['GET', 'HEAD'].includes(request.method ?? '')) {
        response.writeHead(405); response.end(); return;
      }
      // Reproduce the hosting service's canonical index redirect in previews too.
      if (target.pathname === '/index.html') {
        response.writeHead(307, { location: '/' + target.search }); response.end(); return;
      }
      const source = await fetch(target, { method: request.method, redirect: 'manual', signal: AbortSignal.timeout(15_000) });
      const location = source.headers.get('location');
      if (source.status >= 300 && source.status < 400 && location) {
        const next = new URL(location, target);
        if (next.origin !== base.origin) throw new Error('Cross-origin mirror redirect rejected');
        response.setHeader('location', next.pathname + next.search);
      }
      const bytes = Buffer.from(await source.arrayBuffer());
      if (response.destroyed) return;
      response.statusCode = source.status;
      for (const header of ['content-type', 'cache-control', 'content-security-policy', 'service-worker-allowed', 'referrer-policy', 'permissions-policy', 'x-content-type-options']) {
        const value = source.headers.get(header); if (value) response.setHeader(header, value);
      }
      // fetch has decoded the body; do not forward compressed content-length/encoding.
      response.end(bytes);
    } catch {
      if (!response.destroyed) { response.writeHead(502); response.end('Test origin unavailable'); }
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject); server.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    count: () => requests,
    listening: () => server.listening,
    stop: () => new Promise<void>((resolve, reject) => {
      if (!server.listening) { resolve(); return; }
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}
