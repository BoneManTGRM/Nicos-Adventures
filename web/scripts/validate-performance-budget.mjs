import { gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dist = path.resolve(import.meta.dirname, "../dist");
const assets = path.join(dist, "assets");
if (!existsSync(assets)) throw new Error("Production assets are missing; run Vite before validating performance budgets");

const files = readdirSync(assets).filter((name) => /\.(?:js|css)$/.test(name));
const gzipSize = (name) => gzipSync(readFileSync(path.join(assets, name))).byteLength;
const findOne = (pattern, label) => {
  const matches = files.filter((name) => pattern.test(name));
  if (matches.length !== 1) throw new Error(`Expected one ${label} chunk, found: ${matches.join(", ") || "none"}`);
  return matches[0];
};
const enforce = (name, maxBytes, label) => {
  const size = gzipSize(name);
  if (size > maxBytes) throw new Error(`${label} exceeds ${maxBytes} gzip bytes: ${name} is ${size}`);
  return size;
};

for (const [pattern, label] of [
  [/^game3d-[^.]+\.js$/, "orphaned shared 3D runtime"],
  [/^DinosaurValleyOverlook-[^.]+\.js$/, "3D Dinosaur Valley overlook"],
  [/^BrachiosaurusFossilExpedition-[^.]+\.js$/, "3D fossil expedition"],
]) {
  const matches = files.filter((name) => pattern.test(name));
  if (matches.length) throw new Error(`Unexpected ${label} chunk after the premium 2D migration: ${matches.join(", ")}`);
}

const measured = {
  mainJavaScript: enforce(findOne(/^index-[^.]+\.js$/, "main JavaScript"), 175_000, "Main JavaScript"),
  mainStyles: enforce(findOne(/^index-[^.]+\.css$/, "main stylesheet"), 30_000, "Main stylesheet"),
  livingWorldAtlas: enforce(findOne(/^LivingWorldAtlas-[^.]+\.js$/, "Living World Atlas"), 24_000, "Living World Atlas"),
  animalForestTrail: enforce(findOne(/^AnimalForestTrail-[^.]+\.js$/, "Animal Forest trail"), 24_000, "Animal Forest trail"),
  testChamber: enforce(findOne(/^BoltBotTestChamber-[^.]+\.js$/, "BoltBot test chamber"), 20_000, "BoltBot test chamber"),
  starBridge3d: enforce(findOne(/^BrokenStarBridge-[^.]+\.js$/, "Broken Star Bridge"), 285_000, "Remaining lazy Star Bridge 3D route"),
};

console.log(`Performance budgets passed: ${Object.entries(measured).map(([name, bytes]) => `${name}=${bytes}B gzip`).join(", ")}.`);
