import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Test-owned static origin. Serves the actual build, never a substitute worker.
 * Shutting it down must not interrupt the shared preview or another test.
 */
export async function startStoreOrigin(root: string) {
  const dist = path.resolve(root);
  const mime: Record<string, string> = {
    ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
    ".json": "application/json", ".webmanifest": "application/manifest+json",
    ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
    ".svg": "image/svg+xml", ".b64": "text/plain", ".glb": "model/gltf-binary",
    ".woff2": "font/woff2", ".mp4": "video/mp4",
  };
  const server = createServer((request, response) => {
    void (async () => {
      if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
      const target = path.resolve(dist, `.${pathname}`);
      if (target !== dist && !target.startsWith(`${dist}${path.sep}`)) { response.writeHead(404).end(); return; }
      const extension = path.extname(target);
      const file = extension ? target : path.join(dist, "index.html");
      const bytes = await readFile(file);
      response.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      response.end(request.method === "HEAD" ? undefined : bytes);
    })().catch(() => { if (!response.headersSent) response.writeHead(404); response.end(); });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test origin did not bind a TCP port");
  return {
    url: `http://127.0.0.1:${address.port}`,
    listening: () => server.listening,
    stop: () => new Promise<void>((resolve, reject) => {
      if (!server.listening) { resolve(); return; }
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}
