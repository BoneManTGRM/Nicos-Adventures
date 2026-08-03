import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "package.json",
  "package-lock.json",
  "public/_redirects",
  "public/wildlife-director.js",
  "public/asset-recovery.js",
  "public/dinosaur-art.js",
  "public/assets/nico/nico-guide-art.b64",
  "public/sw.js",
  "src/FullApp.tsx",
  "src/FullAppSync.tsx",
  "src/FeatureArt.tsx",
  "src/NicoGuide.tsx",
  "src/ServiceWorkerRefresh.tsx",
  "src/nico-guide.css",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/NicoRestoreLauncher.tsx",
  "src/nico/nico-restore-launcher.css",
  "src/nico/AskNico.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/nico-phase2.css",
  "src/nico/useLocalBase64Asset.ts",
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
if (!main.includes("<FullAppSync />")) throw new Error("The synchronized FullApp boundary is not mounted");
if (!main.includes("<NicoGuide />")) throw new Error("Nico guide is not mounted in the website shell");
if (!main.includes("<NicoWorldExperience />")) throw new Error("Nico Clubhouse is not mounted in the website shell");
if (!main.includes("<NicoRestoreLauncher />")) throw new Error("Permanent Nico Clubhouse restoration launcher is not mounted");
if (!main.includes("<ServiceWorkerRefresh />")) throw new Error("Service worker restoration refresh is not mounted");
if (!main.includes("nico-phase2.css")) throw new Error("Phase 2 Nico art styles are not loaded");

const nicoGuide = fs.readFileSync(path.join(root, "src/NicoGuide.tsx"), "utf8");
if (!nicoGuide.includes("data:image/jpeg;base64")) throw new Error("Nico guide is not decoding the Safari-safe JPEG");
if (!nicoGuide.includes('data-asset-recovery="ignore"')) throw new Error("Nico artwork is not protected from wildlife fallback replacement");
if (!nicoGuide.includes("nicos-world-open-nico")) throw new Error("Nico guide is not connected to the Clubhouse");

const restoreLauncher = fs.readFileSync(path.join(root, "src/nico/NicoRestoreLauncher.tsx"), "utf8");
const swRefresh = fs.readFileSync(path.join(root, "src/ServiceWorkerRefresh.tsx"), "utf8");
if (!restoreLauncher.includes("#nico/ask") || !restoreLauncher.includes("NicoCostumeFigure")) throw new Error("Permanent Clubhouse launcher is incomplete");
if (!swRefresh.includes('updateViaCache: "none"') || !swRefresh.includes("v16")) throw new Error("Stale service worker refresh safeguard is incomplete");

const nicoPayload = fs.readFileSync(path.join(root, "public/assets/nico/nico-guide-art.b64"), "utf8").trim();
if (!nicoPayload.startsWith("/9j/") || nicoPayload.length < 10000) throw new Error("Nico's approved JPEG payload is missing or invalid");

const recovery = fs.readFileSync(path.join(root, "public/asset-recovery.js"), "utf8");
if (!recovery.includes('dataset.assetRecovery === "ignore"')) throw new Error("Asset recovery does not exempt Nico artwork");

const types = fs.readFileSync(path.join(root, "src/types.ts"), "utf8");
const storage = fs.readFileSync(path.join(root, "src/storage.ts"), "utf8");
const syncBoundary = fs.readFileSync(path.join(root, "src/FullAppSync.tsx"), "utf8");
if (!types.includes("schemaVersion: 3")) throw new Error("Web profile type is not on schema v3");
if (!types.includes("movieProjects: MovieProject[]")) throw new Error("Movie project metadata is missing from the profile schema");
if (!types.includes('"gardener"') || !types.includes('"tennis-player"') || !types.includes('"librarian"')) throw new Error("Phase 2 Nico profession types are incomplete");
if (!storage.includes('nicos-world-local-save-v3')) throw new Error("Storage migration is not using the v3 key");
if (!storage.includes('"nicos-world-local-save-v2"')) throw new Error("The v2 migration path is missing");
if (!storage.includes("professionData.map")) throw new Error("Profession normalization is not catalog-driven");
if (!storage.includes("PROFILE_EVENT")) throw new Error("Same-tab profile synchronization events are missing");
if (!syncBoundary.includes("PROFILE_EVENT")) throw new Error("FullApp is not subscribed to Clubhouse profile synchronization");

const professions = JSON.parse(fs.readFileSync(path.join(root, "src/catalogs/nico-professions.json"), "utf8"));
if (!Array.isArray(professions) || professions.length < 26) throw new Error("Phase 2 must provide at least 26 Nico outfits");
for (const required of ["gardener", "teacher", "dentist", "police-officer", "soccer-player", "tennis-player", "detective", "librarian"]) {
  if (!professions.some((item) => item.id === required)) throw new Error(`Missing Phase 2 Nico outfit: ${required}`);
}

const artLoader = fs.readFileSync(path.join(root, "src/nico/useLocalBase64Asset.ts"), "utf8");
const costumeFigure = fs.readFileSync(path.join(root, "src/nico/NicoCostumeFigure.tsx"), "utf8");
const redirects = fs.readFileSync(path.join(root, "public/_redirects"), "utf8");
if (!artLoader.includes("NICO_GUIDE_FALLBACK") || !artLoader.includes('cache: "no-store"')) throw new Error("Nico art loader is not using the reliable local fallback");
if (!costumeFigure.includes("imageFailed") || !costumeFigure.includes("nico-costume__fallback-face")) throw new Error("Nico art failure does not have a visible character fallback");
if (!redirects.includes("nico-fullbody.b64 /assets/nico/nico-guide-art.b64")) throw new Error("Cloudflare Nico art rewrite is missing");

const showtime = fs.readFileSync(path.join(root, "src/showtime/ShowtimeStudio.tsx"), "utf8");
const recorder = fs.readFileSync(path.join(root, "src/showtime/recordMovie.ts"), "utf8");
if (!recorder.includes("captureStream")) throw new Error("Showtime is not using canvas.captureStream");
if (!recorder.includes("MediaRecorder")) throw new Error("Showtime is not using MediaRecorder");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not write video data to localStorage");
if (!showtime.includes("parentConfirmed")) throw new Error("Showtime parental confirmation is missing");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const allVersions = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [name, version] of Object.entries(allVersions)) {
  if (version === "latest" || String(version).startsWith("^") || String(version).startsWith("~")) {
    throw new Error(`Dependency is not exactly pinned: ${name}@${version}`);
  }
  const locked = packageLock.packages?.[""]?.dependencies?.[name] ?? packageLock.packages?.[""]?.devDependencies?.[name];
  if (locked !== version) throw new Error(`Lockfile version mismatch: ${name}@${locked} !== ${version}`);
}
if (packageLock.lockfileVersion !== 3) throw new Error("Web package lock must use lockfileVersion 3");
if (!packageJson.scripts?.test?.includes("vitest")) throw new Error("Vitest test script is missing");

const sw = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");
if (!sw.includes("nicos-world-static-v16")) throw new Error("Release cache version is not v16");
if (!sw.includes('/wildlife-director.js')) throw new Error("Wildlife director is not in the offline shell");
if (!sw.includes("nico-fullbody.b64") || !sw.includes("NICO_ART")) throw new Error("Service worker Nico art alias is missing");
if (!sw.includes('/assets/nico/nico-guide-art.b64')) throw new Error("Nico JPEG payload is not in the offline shell");

console.log(`Release validation passed for ${labels.length} wildlife species, ${professions.length} Nico outfits, Ask Nico, Clubhouse restoration, and Showtime Studio.`);
