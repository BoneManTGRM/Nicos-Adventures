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

const measured = {
  mainJavaScript: enforce(findOne(/^index-[^.]+\.js$/, "main JavaScript"), 175_000, "Main JavaScript"),
  mainStyles: enforce(findOne(/^index-[^.]+\.css$/, "main stylesheet"), 30_000, "Main stylesheet"),
  shared3d: enforce(findOne(/^game3d-[^.]+\.js$/, "shared 3D"), 300_000, "Shared lazy 3D runtime"),
  livingWorldAtlas: enforce(findOne(/^LivingWorldAtlas-[^.]+\.js$/, "Living World Atlas"), 24_000, "Living World Atlas"),
  animalForestTrail: enforce(findOne(/^AnimalForestTrail-[^.]+\.js$/, "Animal Forest trail"), 24_000, "Animal Forest trail"),
  testChamber: enforce(findOne(/^BoltBotTestChamber-[^.]+\.js$/, "BoltBot test chamber"), 20_000, "BoltBot test chamber"),
  starBridge: enforce(findOne(/^BrokenStarBridge-[^.]+\.js$/, "Broken Star Bridge"), 20_000, "Broken Star Bridge"),
  dinosaurValley: enforce(findOne(/^DinosaurValleyOverlook-[^.]+\.js$/, "Dinosaur Valley overlook"), 20_000, "Dinosaur Valley overlook"),
  brachiosaurusExpedition: enforce(findOne(/^BrachiosaurusFossilExpedition-[^.]+\.js$/, "Brachiosaurus fossil expedition"), 20_000, "Brachiosaurus fossil expedition"),
};

console.log(`Performance budgets passed: ${Object.entries(measured).map(([name, bytes]) => `${name}=${bytes}B gzip`).join(", ")}.`);
