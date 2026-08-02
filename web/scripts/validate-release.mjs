import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "public/wildlife-director.js",
  "public/asset-recovery.js",
  "public/dinosaur-art.js",
  "public/sw.js",
  "src/FullApp.tsx",
  "src/FeatureArt.tsx"
];
for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing release file: ${relative}`);
}

const director = fs.readFileSync(path.join(root, "public/wildlife-director.js"), "utf8");
const labels = [
  "Jaguar","Toucan","Sloth","Poison Dart Frog","Blue Whale","Giant Pacific Octopus","Sea Turtle","Manta Ray",
  "Lion","African Elephant","Giraffe","Meerkat","Polar Bear","Arctic Fox","Emperor Penguin","Walrus",
  "Fennec Fox","Camel","Roadrunner","Gila Monster","Red Panda","Flying Squirrel","Great Horned Owl","Beaver",
  "Axolotl","Capybara","Flamingo","Platypus","Snow Leopard","Mountain Goat","Andean Condor","Yak"
];
for (const label of labels) {
  if (!director.includes(`\"${label}\"`)) throw new Error(`Wildlife mapping missing: ${label}`);
}
if (!director.includes("window.fetch = async")) throw new Error("Wildlife request interception is missing");
if (!director.includes("thumbnail?.source")) throw new Error("Thumbnail-first image normalization is missing");

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const directorPos = index.indexOf('/wildlife-director.js');
const appPos = index.indexOf('/src/main.tsx');
if (directorPos < 0 || appPos < 0 || directorPos > appPos) throw new Error("Wildlife director must load before React");

const sw = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");
if (!sw.includes("nicos-world-static-v11")) throw new Error("Release cache version is not v11");
if (!sw.includes('/wildlife-director.js')) throw new Error("Wildlife director is not in the offline shell");

console.log(`Release validation passed for ${labels.length} wildlife species.`);
