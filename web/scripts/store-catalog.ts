/** Build-only: never import catalog source or source photos into client modules.
 * Container rules: https://developers.google.com/speed/webp/docs/riff_container
 */
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import type { Plugin } from "vite";
import { readCatalog } from "../src/store/model";
import type { Catalog, Photo } from "../src/store/types";

function validateImage(bytes: Buffer, photo: Photo): void {
  if (bytes.length < 30 || bytes.length > 2_000_000 || bytes.toString("ascii", 0, 4) !== "RIFF"
    || bytes.toString("ascii", 8, 12) !== "WEBP" || bytes.readUInt32LE(4) + 8 !== bytes.length) throw new Error("Store photo must be a bounded, sanitized WebP without trailing data");
  let offset = 12, frames = 0, width = 0, height = 0;
  let canvas: [number, number] | null = null;
  const seen = new Set<string>();
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error("Truncated WebP chunk");
    const tag = bytes.toString("ascii", offset, offset + 4), size = bytes.readUInt32LE(offset + 4), start = offset + 8;
    if (start + size + (size % 2) > bytes.length || seen.has(tag) || !["VP8 ", "VP8L", "VP8X", "ALPH"].includes(tag)) throw new Error("Remove metadata, animation and unknown WebP chunks before publication");
    seen.add(tag);
    if (tag === "VP8X") {
      if (offset !== 12 || size !== 10 || (bytes[start] & ~0x10) !== 0 || bytes.readUIntLE(start + 1, 3) !== 0) throw new Error("Only still, metadata-free sRGB WebP photos are accepted");
      canvas = [bytes.readUIntLE(start + 4, 3) + 1, bytes.readUIntLE(start + 7, 3) + 1];
    } else if (tag === "VP8L") {
      if (size < 5 || bytes[start] !== 0x2f || (bytes[start + 4] & 0xe0) !== 0) throw new Error("Invalid lossless WebP header");
      const packed = bytes.readUInt32LE(start + 1);
      width = (packed & 0x3fff) + 1; height = ((packed >>> 14) & 0x3fff) + 1; frames++;
    } else if (tag === "VP8 ") {
      if (size < 10 || bytes.toString("hex", start + 3, start + 6) !== "9d012a" || (bytes[start] & 1) !== 0) throw new Error("Invalid WebP key frame");
      width = bytes.readUInt16LE(start + 6) & 0x3fff; height = bytes.readUInt16LE(start + 8) & 0x3fff; frames++;
    } else if (!canvas || frames !== 0) throw new Error("Invalid alpha chunk order");
    offset = start + size + (size % 2);
  }
  if (frames !== 1 || width !== photo.width || height !== photo.height || (canvas && (canvas[0] !== width || canvas[1] !== height))) throw new Error("Store photo dimensions do not match the catalog");
}
export async function compileStore(root: string): Promise<{ catalog: Catalog; images: Map<string, Buffer> }> {
  const inputPath = path.join(root, "store/catalog.json");
  if ((await stat(inputPath)).size > 1_000_000) throw new Error("Store catalog exceeds its size limit");
  const input = JSON.parse(await readFile(inputPath, "utf8"));
  const catalog = readCatalog(input);
  const expectedPublished = input.products.filter((item: { publication?: unknown } | null) => item?.publication === "published").length;
  if (catalog.products.length !== expectedPublished) throw new Error("An explicitly published store entry is invalid or lacks listing/photo approval");
  if (input.salesEnabled === true && !catalog.salesEnabled) throw new Error("Opening sales requires approved adult seller information and market review");
  const images = new Map<string, Buffer>();
  // Only published photo references are visited. No directory glob or public copy.
  for (const product of catalog.products) {
    for (const photo of product.photos) {
      const imageRoot = await realpath(path.join(root, "store/images"));
      const filename = path.basename(photo.src);
      const file = await realpath(path.join(imageRoot, filename));
      if (!file.startsWith(`${imageRoot}${path.sep}`) || !(await stat(file)).isFile() || (await stat(file)).size > 2_000_000) throw new Error("Store photo escapes its approved directory or size limit");
      const bytes = await readFile(file); validateImage(bytes, photo);
      const url = `/store-images/${createHash("sha256").update(bytes).digest("hex").slice(0, 24)}.webp`;
      images.set(url, bytes); photo.src = url;
    }
  }
  return { catalog, images };
}
export function storeCatalogPlugin(): Plugin {
  let root = "";
  return {
    name: "approved-public-toy-catalog",
    configResolved(config) { root = config.root; },
    async generateBundle() {
      const result = await compileStore(root);
      this.emitFile({ type: "asset", fileName: "store-catalog.json", source: JSON.stringify(result.catalog) });
      for (const [url, bytes] of result.images) this.emitFile({ type: "asset", fileName: url.slice(1), source: bytes });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url || "/", "http://localhost").pathname;
        if (pathname.startsWith("/store/") && pathname !== "/store/") { res.statusCode = 404; res.end(); return; }
        if (pathname !== "/store-catalog.json" && !pathname.startsWith("/store-images/")) return next();
        void compileStore(root).then(result => {
          res.setHeader("Cache-Control", "no-store");
          if (pathname === "/store-catalog.json") { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(result.catalog)); return; }
          const bytes = result.images.get(pathname);
          if (!bytes) { res.statusCode = 404; res.end(); return; }
          res.setHeader("Content-Type", "image/webp"); res.end(bytes);
        }).catch(() => { res.statusCode = 503; res.end("Catalog unavailable"); });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (new URL(req.url || "/", "http://localhost").pathname === "/store-catalog.json") res.setHeader("Cache-Control", "no-store");
        next();
      });
    },
  };
}
