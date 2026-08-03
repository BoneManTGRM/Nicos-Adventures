import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "package.json",
  "public/wildlife-director.js",
  "public/asset-recovery.js",
  "public/dinosaur-art.js",
  "public/assets/nico/nico-guide-art.b64",
  "public/sw.js",
  "src/FullApp.tsx",
  "src/FeatureArt.tsx",
  "src/NicoGuide.tsx",
  "src/nico-guide.css",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/AskNico.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/knowledge.ts",
  "src/showtime/ShowtimeStudio.tsx",
  "src/showtime/recordMovie.ts",
  "src/showtime/movieRenderer.ts",
  "src/showtime/NicoMovieLibrary.tsx",
  "src/catalogs/nico-knowledge.json",
  "src/catalogs/nico-professions.json",
  "src/catalogs/showtime.json",
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

const main = fs.readFileSync(path.join(root, "src/main.tsx"), "utf8");
if (!main.includes("<NicoGuide />")) throw new Error("Nico guide is not mounted in the website shell");
if (!main.includes("<NicoWorldExperience />")) throw new Error("Nico Clubhouse is not mounted in the website shell");

const nicoGuide = fs.readFileSync(path.join(root, "src/NicoGuide.tsx"), "utf8");
if (!nicoGuide.includes("data:image/jpeg;base64")) throw new Error("Nico guide is not decoding the Safari-safe JPEG");
if (!nicoGuide.includes('data-asset-recovery="ignore"')) throw new Error("Nico artwork is not protected from wildlife fallback replacement");
if (!nicoGuide.includes("nicos-world-open-nico")) throw new Error("Nico guide is not connected to the Clubhouse");

const nicoPayload = fs.readFileSync(path.join(root, "public/assets/nico/nico-guide-art.b64"), "utf8").trim();
if (!nicoPayload.startsWith("/9j/") || nicoPayload.length < 10000) throw new Error("Nico's approved JPEG payload is missing or invalid");

const recovery = fs.readFileSync(path.join(root, "public/asset-recovery.js"), "utf8");
if (!recovery.includes('dataset.assetRecovery === "ignore"')) throw new Error("Asset recovery does not exempt Nico artwork");

const types = fs.readFileSync(path.join(root, "src/types.ts"), "utf8");
const storage = fs.readFileSync(path.join(root, "src/storage.ts"), "utf8");
if (!types.includes("schemaVersion: 3")) throw new Error("Web profile type is not on schema v3");
if (!types.includes("movieProjects: MovieProject[]")) throw new Error("Movie project metadata is missing from the profile schema");
if (!storage.includes('nicos-world-local-save-v3')) throw new Error("Storage migration is not using the v3 key");
if (!storage.includes('"nicos-world-local-save-v2"')) throw new Error("The v2 migration path is missing");

const showtime = fs.readFileSync(path.join(root, "src/showtime/ShowtimeStudio.tsx"), "utf8");
const recorder = fs.readFileSync(path.join(root, "src/showtime/recordMovie.ts"), "utf8");
if (!recorder.includes("captureStream")) throw new Error("Showtime is not using canvas.captureStream");
if (!recorder.includes("MediaRecorder")) throw new Error("Showtime is not using MediaRecorder");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not write video data to localStorage");
if (!showtime.includes("parentConfirmed")) throw new Error("Showtime parental confirmation is missing");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const allVersions = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [name, version] of Object.entries(allVersions)) {
  if (version === "latest" || String(version).startsWith("^") || String(version).startsWith("~")) {
    throw new Error(`Dependency is not exactly pinned: ${name}@${version}`);
  }
}
if (!packageJson.scripts?.test?.includes("vitest")) throw new Error("Vitest test script is missing");

const sw = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");
if (!sw.includes("nicos-world-static-v14")) throw new Error("Release cache version is not v14");
if (!sw.includes('/wildlife-director.js')) throw new Error("Wildlife director is not in the offline shell");
if (!sw.includes('/assets/nico/nico-guide-art.b64')) throw new Error("Nico JPEG payload is not in the offline shell");

console.log(`Release validation passed for ${labels.length} wildlife species, Ask Nico, Nico Clubhouse, and Showtime Studio.`);
