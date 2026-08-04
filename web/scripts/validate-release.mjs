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
  "public/assets/nico/approved/character.part1.b64",
  "public/assets/nico/approved/character.part2.b64",
  "public/assets/nico/approved/character.part3.b64",
  "public/assets/nico/approved/outfits.part1.b64",
  "public/assets/nico/approved/outfits.part2.b64",
  "public/assets/nico/approved/outfits.part3.b64",
  "public/assets/nico/approved/outfits.part4.b64",
  "public/assets/nico/approved/outfits.part5.b64",
  "public/assets/nico/drag/nico-base.webp.b64",
  "public/assets/nico/drag/outfits.webp.b64",
  "public/assets/nico/drag/about.webp.b64",
  "public/sw.js",
  "src/FullApp.tsx",
  "src/FullAppSync.tsx",
  "src/FeatureArt.tsx",
  "src/NicoGuide.tsx",
  "src/ServiceWorkerRefresh.tsx",
  "src/hooks/useActiveProfileStore.ts",
  "src/hooks/useDialogFocusTrap.ts",
  "src/nico-guide.css",
  "src/nico/approvedNicoArt.tsx",
  "src/nico/approved-nico-art.css",
  "src/nico/nicoDragArt.tsx",
  "src/nico/nico-drag-studio.css",
  "src/nico/nico-about.css",
  "src/nico/system-stabilization.css",
  "src/nico/nicoHubRoute.ts",
  "src/nico/NicoPortalArt.tsx",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/AskNico.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/nico-phase2.css",
  "src/nico/knowledge.ts",
  "src/showtime/ShowtimeStudio.tsx",
  "src/showtime/composeNicoImage.ts",
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
if (!main.includes("<NicoGuide />")) throw new Error("The single Nico guide launcher is not mounted");
if (!main.includes("<NicoWorldExperience />")) throw new Error("Nico Clubhouse is not mounted");
if (!main.includes("<NicoPortalArt />")) throw new Error("World Map and Robot Home are not using the synchronized Nico character");
if (!main.includes("<ServiceWorkerRefresh />")) throw new Error("Service worker refresh is not mounted");
if (main.includes("NicoRestoreLauncher")) throw new Error("The duplicate Nico Clubhouse launcher must not be mounted or imported");
for (const stylesheet of ["approved-nico-art.css", "nico-drag-studio.css", "nico-about.css", "system-stabilization.css"]) {
  if (!main.includes(stylesheet)) throw new Error(`Nico stylesheet is not loaded: ${stylesheet}`);
}

const guide = fs.readFileSync(path.join(root, "src/NicoGuide.tsx"), "utf8");
const approvedArt = fs.readFileSync(path.join(root, "src/nico/approvedNicoArt.tsx"), "utf8");
const dragArt = fs.readFileSync(path.join(root, "src/nico/nicoDragArt.tsx"), "utf8");
const costume = fs.readFileSync(path.join(root, "src/nico/NicoCostumeFigure.tsx"), "utf8");
const dressUp = fs.readFileSync(path.join(root, "src/nico/NicoDressUp.tsx"), "utf8");
const portalArt = fs.readFileSync(path.join(root, "src/nico/NicoPortalArt.tsx"), "utf8");
const clubhouse = fs.readFileSync(path.join(root, "src/nico/NicoWorldExperience.tsx"), "utf8");
const activeProfileHook = fs.readFileSync(path.join(root, "src/hooks/useActiveProfileStore.ts"), "utf8");
const focusTrap = fs.readFileSync(path.join(root, "src/hooks/useDialogFocusTrap.ts"), "utf8");
const hubRoute = fs.readFileSync(path.join(root, "src/nico/nicoHubRoute.ts"), "utf8");

if (!guide.includes("useActiveProfileStore") || !guide.includes("useNicoDragArt") || !guide.includes("openNicoWorld")) {
  throw new Error("Nico guide is not synchronized with the active profile and canonical art");
}
if (guide.includes("GUIDE_LANGUAGE_KEY") || guide.includes("detectLanguage")) {
  throw new Error("Nico guide still maintains a conflicting independent language state");
}
if (!approvedArt.includes("APPROVED_OUTFIT_INDEX") || !approvedArt.includes("backgroundSize: \"600% 200%\"")) throw new Error("Legacy approved Nico art fallback is incomplete");
if (!dragArt.includes("NICO_OUTFIT_ALIASES") || !dragArt.includes('backgroundSize: "400% 300%"') || !dragArt.includes("ABOUT_ART_PATH")) {
  throw new Error("Draggable Nico art mapping is incomplete");
}
if (!costume.includes("data-composed-nico") || !costume.includes('data-art-state={artState}')) throw new Error("Nico is not rendered from one body plus an outfit layer");
if (!dressUp.includes("onPointerDown") || !dressUp.includes("onPointerMove") || !dressUp.includes("data-nico-drop-zone")) throw new Error("Touch drag-and-drop outfit behavior is incomplete");
if (!dressUp.includes("applyNicoProfession") || !dressUp.includes("useNicoDragArt")) throw new Error("Nico outfit persistence or local art loading is incomplete");
if (!portalArt.includes("useActiveProfileStore") || !portalArt.includes("openNicoWorld") || !portalArt.includes("profile.selectedSection")) {
  throw new Error("Nico world entry points are not owned by the synchronized section-aware portal");
}
if (!portalArt.includes('className="fw-destination nico-world-destination"') || !portalArt.includes('className="nico-room-entry"')) {
  throw new Error("Nico portal does not create both supported entry buttons");
}
if (clubhouse.includes("FULL_BODY_ASSET") || clubhouse.includes("useLocalBase64Asset")) {
  throw new Error("Nico Clubhouse still depends on the stale full-body asset path");
}
if (clubhouse.includes("nico-world-destination") || clubhouse.includes("nico-room-entry")) {
  throw new Error("Nico Clubhouse still duplicates World Map or Robot Home entry buttons");
}
if (!clubhouse.includes("useActiveProfileStore") || !clubhouse.includes("useDialogFocusTrap") || !clubhouse.includes('addEventListener("popstate"')) {
  throw new Error("Nico Clubhouse profile, focus, or browser-history synchronization is incomplete");
}
if (!clubhouse.includes("onPointerDown") || !clubhouse.includes("parseNicoHubHash")) {
  throw new Error("Nico Clubhouse dismissal or route handling is incomplete");
}
if (!activeProfileHook.includes("PROFILE_EVENT") || !activeProfileHook.includes("commitProfile")) {
  throw new Error("Shared active-profile synchronization hook is incomplete");
}
if (!focusTrap.includes('event.key === "Tab"') || !focusTrap.includes('event.key === "Escape"')) {
  throw new Error("Accessible dialog focus containment is incomplete");
}
if (!hubRoute.includes("nicosWorldHub") || !hubRoute.includes("parseNicoHubHash")) {
  throw new Error("Nico Clubhouse history markers are incomplete");
}

const characterPayload = [1, 2, 3]
  .map((part) => fs.readFileSync(path.join(root, `public/assets/nico/approved/character.part${part}.b64`), "utf8").trim())
  .join("");
const outfitPayload = [1, 2, 3, 4, 5]
  .map((part) => fs.readFileSync(path.join(root, `public/assets/nico/approved/outfits.part${part}.b64`), "utf8").trim())
  .join("");
const dragBasePayload = fs.readFileSync(path.join(root, "public/assets/nico/drag/nico-base.webp.b64"), "utf8").trim();
const dragOutfitPayload = fs.readFileSync(path.join(root, "public/assets/nico/drag/outfits.webp.b64"), "utf8").trim();
const aboutPayload = fs.readFileSync(path.join(root, "public/assets/nico/drag/about.webp.b64"), "utf8").trim();
if (!characterPayload.startsWith("/9j/") || characterPayload.length < 15000) throw new Error("Approved Nico character artwork is missing or incomplete");
if (!outfitPayload.startsWith("/9j/") || outfitPayload.length < 25000) throw new Error("Approved Nico outfit artwork is missing or incomplete");
if (!dragBasePayload.startsWith("UklG") || dragBasePayload.length < 10000) throw new Error("Canonical Nico body artwork is missing or incomplete");
if (!dragOutfitPayload.startsWith("UklG") || dragOutfitPayload.length < 10000) throw new Error("Draggable Nico outfit sprite is missing or incomplete");
if (!aboutPayload.startsWith("UklG") || aboutPayload.length < 10000) throw new Error("Nico About artwork is missing or incomplete");

const recovery = fs.readFileSync(path.join(root, "public/asset-recovery.js"), "utf8");
if (!recovery.includes('dataset.assetRecovery === "ignore"')) throw new Error("Asset recovery does not exempt protected artwork");

const types = fs.readFileSync(path.join(root, "src/types.ts"), "utf8");
const storage = fs.readFileSync(path.join(root, "src/storage.ts"), "utf8");
const syncBoundary = fs.readFileSync(path.join(root, "src/FullAppSync.tsx"), "utf8");
if (!types.includes("schemaVersion: 3")) throw new Error("Web profile type is not on schema v3");
if (!types.includes("movieProjects: MovieProject[]")) throw new Error("Movie project metadata is missing from the profile schema");
if (!storage.includes('nicos-world-local-save-v3')) throw new Error("Storage migration is not using the v3 key");
if (!storage.includes('"nicos-world-local-save-v2"')) throw new Error("The v2 migration path is missing");
if (!storage.includes("professionData.map")) throw new Error("Profession normalization is not catalog-driven");
if (!storage.includes("PROFILE_EVENT") || !syncBoundary.includes("PROFILE_EVENT")) throw new Error("Profile synchronization is incomplete");

const professions = JSON.parse(fs.readFileSync(path.join(root, "src/catalogs/nico-professions.json"), "utf8"));
if (!Array.isArray(professions) || professions.length < 26) throw new Error("Nico must provide at least 26 bilingual outfit choices");
for (const required of ["gardener", "teacher", "dentist", "police-officer", "soccer-player", "tennis-player", "detective", "librarian"]) {
  if (!professions.some((item) => item.id === required)) throw new Error(`Missing Nico outfit: ${required}`);
}

const askNico = fs.readFileSync(path.join(root, "src/nico/AskNico.tsx"), "utf8");
if (!askNico.includes("nico-ask-hero__art") || !askNico.includes("aboutSource") || !askNico.includes("NicoCostumeFigure")) {
  throw new Error("Ask Nico is not using the character artwork with a composed fallback");
}

const showtime = fs.readFileSync(path.join(root, "src/showtime/ShowtimeStudio.tsx"), "utf8");
const compositor = fs.readFileSync(path.join(root, "src/showtime/composeNicoImage.ts"), "utf8");
const recorder = fs.readFileSync(path.join(root, "src/showtime/recordMovie.ts"), "utf8");
if (!recorder.includes("captureStream") || !recorder.includes("MediaRecorder")) throw new Error("Showtime client-side recording is incomplete");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not write video data to localStorage");
if (!showtime.includes("parentConfirmed")) throw new Error("Showtime parental confirmation is missing");
if (!showtime.includes("nicoBaseSource") || !showtime.includes("nicoOutfitSource") || !showtime.includes("composeNicoImage")) {
  throw new Error("Showtime is not previewing and recording Nico's saved outfit");
}
if (!compositor.includes("getNicoOutfitCell") || !compositor.includes("context.drawImage")) {
  throw new Error("Showtime Nico image composition is incomplete");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const allVersions = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [name, version] of Object.entries(allVersions)) {
  if (version === "latest" || String(version).startsWith("^") || String(version).startsWith("~")) throw new Error(`Dependency is not exactly pinned: ${name}@${version}`);
  const locked = packageLock.packages?.[""]?.dependencies?.[name] ?? packageLock.packages?.[""]?.devDependencies?.[name];
  if (locked !== version) throw new Error(`Lockfile version mismatch: ${name}@${locked} !== ${version}`);
}
if (packageLock.lockfileVersion !== 3) throw new Error("Web package lock must use lockfileVersion 3");
if (!packageJson.scripts?.test?.includes("vitest")) throw new Error("Vitest test script is missing");

const sw = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");
const swRefresh = fs.readFileSync(path.join(root, "src/ServiceWorkerRefresh.tsx"), "utf8");
if (!sw.includes("nicos-world-static-v18") || !swRefresh.includes('"v18"')) throw new Error("Nico system cache version is not v18");
for (const asset of [
  "character.part1.b64", "character.part2.b64", "character.part3.b64",
  "outfits.part1.b64", "outfits.part2.b64", "outfits.part3.b64", "outfits.part4.b64", "outfits.part5.b64",
  "nico-base.webp.b64", "outfits.webp.b64", "about.webp.b64",
]) {
  if (!sw.includes(asset)) throw new Error(`Nico asset is not cached: ${asset}`);
}

console.log(`Release validation passed for ${labels.length} wildlife species, ${professions.length} Nico outfit choices, one synchronized Nico profile/art path, accessible Clubhouse routing, World Map, Robot Home, Ask Nico, and outfit-aware Showtime recording.`);
