import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const assets = path.join(dist, "assets");

if (!existsSync(path.join(dist, "index.html")) || !existsSync(assets)) {
  throw new Error("Production output is missing; run Vite before generating the offline manifest");
}

const bundleUrls = readdirSync(assets, { withFileTypes: true })
  .filter((entry) => entry.isFile() && (
    /\.(?:js|css)$/.test(entry.name)
    || /^nico-(?:explorer-atlas|professions(?:-[a-z]+)?-atlas|librarian)-.*\.webp$/.test(entry.name)
    || /^boltbot-premium-poses-atlas-.*\.webp$/.test(entry.name)
    || /^crew-[a-z-]+-v3-.*\.webp$/.test(entry.name)
    || /^sparky-(?:idle|sit|high-five|fetch-tool)-v2-.*\.webp$/.test(entry.name)
    || /^animal-forest-premium-habitats-atlas-.*\.webp$/.test(entry.name)
    || /^(?:alien|aquatic|blob|candy|cloud|cosmic|dinosaur|dragon|ice-beast|jungle-beast|lizard-alien|mecha|royal|spirit|stone-golem|volcano)-.*\.webp$/.test(entry.name)
  ))
  .map((entry) => `/assets/${entry.name}`);
const canonicalAssets = [
  "/assets/3d/boltbot/canonical-boltbot.glb",
  "/assets/3d/nico/canonical-nico.glb",
];

for (const url of canonicalAssets) {
  const absolute = path.join(dist, url.slice(1));
  if (!existsSync(absolute) || readFileSync(absolute).byteLength === 0) {
    throw new Error(`Required Golden Adventure offline asset is missing: ${url}`);
  }
}

// Keep the fishing page and its relative scripts, sprites and fonts available offline.
const fishingRoot = "games/starfall-anglers";
const fishingFiles = readdirSync(path.join(dist, fishingRoot), { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name !== "index.html")
  .map(entry => "/" + path.relative(dist, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"));
// Cache the hunting shell and built-in wildlife. Additional landscape and
// animation sheets enter the runtime cache as the player explores.
const hunt = "/games/timberline-hunt/";
const huntHtml = readFileSync(path.join(dist, hunt, "index.html"), "utf8");
const huntAssets = [...huntHtml.matchAll(/<(?:script|link)\b[^>]+?(?:src|href)="([^"]+)"/g)]
  .map(([, url]) => hunt + url);
huntAssets.push(hunt, hunt + "assets/trails/north.webp");
const manifest = {
  version: 1,
  assets: [...new Set([...bundleUrls, ...canonicalAssets, "/" + fishingRoot + "/", ...fishingFiles, ...huntAssets])].sort(),
};
writeFileSync(path.join(dist, "offline-assets.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Generated offline-assets.json with ${manifest.assets.length} Golden Adventure assets.`);
