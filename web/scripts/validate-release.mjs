import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const requiredFiles = [
  "index.html",
  "package.json",
  "package-lock.json",
  "public/_redirects",
  "public/wildlife-director.js",
  "public/asset-recovery.js",
  "public/dinosaur-art.js",
  "public/sw.js",
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
  "src/AppShell.tsx",
  "src/app/AppStoreContext.tsx",
  "src/app/AppErrorBoundary.tsx",
  "src/app/app-shell.css",
  "src/FullApp.tsx",
  "src/FeatureArt.tsx",
  "src/NicoGuide.tsx",
  "src/ServiceWorkerRefresh.tsx",
  "src/hooks/useActiveProfileStore.ts",
  "src/hooks/useDialogFocusTrap.ts",
  "src/nico/approvedNicoArt.tsx",
  "src/nico/nicoDragArt.tsx",
  "src/nico/NicoPortalArt.tsx",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/AskNico.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
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
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    throw new Error(`Missing release file: ${relative}`);
  }
}

const director = read("public/wildlife-director.js");
const labels = [
  "Jaguar","Toucan","Sloth","Poison Dart Frog","Blue Whale","Giant Pacific Octopus","Sea Turtle","Manta Ray",
  "Lion","African Elephant","Giraffe","Meerkat","Polar Bear","Arctic Fox","Emperor Penguin","Walrus",
  "Fennec Fox","Camel","Roadrunner","Gila Monster","Red Panda","Flying Squirrel","Great Horned Owl","Beaver",
  "Axolotl","Capybara","Flamingo","Platypus","Snow Leopard","Mountain Goat","Andean Condor","Yak",
];
for (const label of labels) {
  if (!director.includes(`"${label}"`)) throw new Error(`Wildlife mapping missing: ${label}`);
}
if (!director.includes("window.fetch = async") || !director.includes("thumbnail?.source")) {
  throw new Error("Wildlife request normalization is incomplete");
}

const index = read("index.html");
const directorPos = index.indexOf("/wildlife-director.js");
const appPos = index.indexOf("/src/main.tsx");
if (directorPos < 0 || appPos < 0 || directorPos > appPos) {
  throw new Error("Wildlife director must load before React until its replacement is complete");
}

const main = read("src/main.tsx");
const appShell = read("src/AppShell.tsx");
const appStore = read("src/app/AppStoreContext.tsx");
const fullApp = read("src/FullApp.tsx");
const guide = read("src/NicoGuide.tsx");
const activeProfileHook = read("src/hooks/useActiveProfileStore.ts");
const portalArt = read("src/nico/NicoPortalArt.tsx");
const clubhouse = read("src/nico/NicoWorldExperience.tsx");
const focusTrap = read("src/hooks/useDialogFocusTrap.ts");
const hubRoute = read("src/nico/nicoHubRoute.ts");

if (!main.includes("<AppShell />") || main.includes("<FullAppSync") || main.includes("<NicoGuide")) {
  throw new Error("main.tsx must mount one AppShell and no independent product surfaces");
}
for (const surface of ["<ServiceWorkerRefresh />", "<FullApp />", "<NicoGuide />", "<NicoWorldExperience />", "<NicoPortalArt />"]) {
  if (!appShell.includes(surface)) throw new Error(`AppShell is missing: ${surface}`);
}
if (!appShell.includes("<AppStoreProvider>") || !appShell.includes("<AppErrorBoundary>")) {
  throw new Error("AppShell is missing its canonical store or recovery boundary");
}
if (!appStore.includes("useState<LocalSaveStore>") || !appStore.includes('saveLocalStore(store, "app")')) {
  throw new Error("AppStoreProvider does not own and persist the canonical store");
}
if (!appStore.includes("PROFILE_EVENT") || !appStore.includes('addEventListener("storage"')) {
  throw new Error("AppStoreProvider does not synchronize external browser changes");
}
if (!fullApp.includes("useAppStore()") || fullApp.includes("loadLocalStore") || fullApp.includes("saveLocalStore")) {
  throw new Error("FullApp creates or persists a second store");
}
if (!activeProfileHook.includes("useAppStore()") || activeProfileHook.includes("useState") || activeProfileHook.includes("loadLocalStore")) {
  throw new Error("Legacy profile hook is not a context-only adapter");
}
if (!guide.includes("useAppStore") || !guide.includes("openNicoWorld") || !guide.includes("useNicoDragArt")) {
  throw new Error("Nico guide is not connected to the canonical profile and art path");
}
if (guide.includes("GUIDE_LANGUAGE_KEY") || guide.includes("detectLanguage")) {
  throw new Error("Nico guide maintains a conflicting independent language state");
}
if (!portalArt.includes("useActiveProfileStore") || !portalArt.includes("profile.selectedSection")) {
  throw new Error("Nico portal art is not connected through the shared-store adapter");
}
if (!clubhouse.includes("useActiveProfileStore") || !clubhouse.includes("useDialogFocusTrap") || !clubhouse.includes('addEventListener("popstate"')) {
  throw new Error("Nico Clubhouse profile, focus, or history synchronization is incomplete");
}
if (!focusTrap.includes('event.key === "Tab"') || !focusTrap.includes('event.key === "Escape"')) {
  throw new Error("Accessible Clubhouse focus containment is incomplete");
}
if (!hubRoute.includes("nicosWorldHub") || !hubRoute.includes("parseNicoHubHash")) {
  throw new Error("Nico Clubhouse history markers are incomplete");
}

const approvedArt = read("src/nico/approvedNicoArt.tsx");
const dragArt = read("src/nico/nicoDragArt.tsx");
const costume = read("src/nico/NicoCostumeFigure.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
if (!approvedArt.includes("APPROVED_OUTFIT_INDEX") || !approvedArt.includes('backgroundSize: "600% 200%"')) {
  throw new Error("Approved Nico art mapping is incomplete");
}
if (!dragArt.includes("NICO_OUTFIT_ALIASES") || !dragArt.includes('backgroundSize: "400% 300%"')) {
  throw new Error("Draggable Nico fallback mapping is incomplete");
}
if (!costume.includes("data-composed-nico") || !costume.includes('data-art-state={artState}')) {
  throw new Error("Nico art-state rendering contract is incomplete");
}
if (!dressUp.includes("onPointerDown") || !dressUp.includes("onPointerMove") || !dressUp.includes("data-nico-drop-zone")) {
  throw new Error("Touch drag-and-drop outfit behavior is incomplete");
}
if (!dressUp.includes("applyNicoProfession") || !dressUp.includes("useNicoDragArt")) {
  throw new Error("Nico outfit persistence or local art loading is incomplete");
}

const characterPayload = [1, 2, 3]
  .map((part) => read(`public/assets/nico/approved/character.part${part}.b64`).trim())
  .join("");
const outfitPayload = [1, 2, 3, 4, 5]
  .map((part) => read(`public/assets/nico/approved/outfits.part${part}.b64`).trim())
  .join("");
const dragBasePayload = read("public/assets/nico/drag/nico-base.webp.b64").trim();
const dragOutfitPayload = read("public/assets/nico/drag/outfits.webp.b64").trim();
if (!characterPayload.startsWith("/9j/") || characterPayload.length < 15000) throw new Error("Approved Nico character artwork is incomplete");
if (!outfitPayload.startsWith("/9j/") || outfitPayload.length < 25000) throw new Error("Approved Nico outfit artwork is incomplete");
if (!dragBasePayload.startsWith("UklG") || dragBasePayload.length < 10000) throw new Error("Canonical Nico body artwork is incomplete");
if (!dragOutfitPayload.startsWith("UklG") || dragOutfitPayload.length < 10000) throw new Error("Draggable Nico outfit sprite is incomplete");

const recovery = read("public/asset-recovery.js");
if (!recovery.includes('dataset.recoverable !== "wildlife"')) {
  throw new Error("Asset recovery is not restricted to explicitly recoverable wildlife images");
}

const types = read("src/types.ts");
const storage = read("src/storage.ts");
if (!types.includes("schemaVersion: 3")) throw new Error("This foundation slice must preserve profile schema v3");
if (!types.includes("movieProjects: MovieProject[]")) throw new Error("Movie metadata is missing from the profile schema");
if (!storage.includes('nicos-world-local-save-v3') || !storage.includes('"nicos-world-local-save-v2"')) {
  throw new Error("Storage v3 or legacy migration support is missing");
}
if (!storage.includes("professionData.map") || !storage.includes("PROFILE_EVENT")) {
  throw new Error("Catalog-driven normalization or profile synchronization is missing");
}

const professions = JSON.parse(read("src/catalogs/nico-professions.json"));
if (!Array.isArray(professions) || professions.length < 26) {
  throw new Error("Nico must provide at least 26 bilingual outfit choices");
}
for (const required of ["gardener", "teacher", "dentist", "police-officer", "soccer-player", "tennis-player", "detective", "librarian"]) {
  if (!professions.some((item) => item.id === required)) throw new Error(`Missing Nico outfit: ${required}`);
}

const askNico = read("src/nico/AskNico.tsx");
if (!askNico.includes("NicoCostumeFigure") || !askNico.includes("baseArtSource") || !askNico.includes("outfitArtSource")) {
  throw new Error("Ask Nico is not using the synchronized saved-outfit renderer");
}

const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const recorder = read("src/showtime/recordMovie.ts");
if (!recorder.includes("captureStream") || !recorder.includes("MediaRecorder")) {
  throw new Error("Showtime client-side recording is incomplete");
}
if (showtime.includes("localStorage") || recorder.includes("localStorage")) {
  throw new Error("Showtime must not write video data to localStorage");
}
if (!showtime.includes("parentConfirmed") || !showtime.includes("composeNicoImage")) {
  throw new Error("Showtime parental confirmation or Nico composition is missing");
}
if (!compositor.includes("getNicoOutfitCell") || !compositor.includes("context.drawImage")) {
  throw new Error("Showtime Nico image composition is incomplete");
}

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
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

const sw = read("public/sw.js");
const swRefresh = read("src/ServiceWorkerRefresh.tsx");
if (!sw.includes("nicos-world-static-v19") || !swRefresh.includes('"v19"')) {
  throw new Error("Nico system cache version is not v19");
}
for (const asset of [
  "character.part1.b64", "character.part2.b64", "character.part3.b64",
  "outfits.part1.b64", "outfits.part2.b64", "outfits.part3.b64", "outfits.part4.b64", "outfits.part5.b64",
  "nico-base.webp.b64", "outfits.webp.b64", "about.webp.b64",
]) {
  if (!sw.includes(asset)) throw new Error(`Nico asset is not cached: ${asset}`);
}

console.log(`Release validation passed for one AppShell, ${labels.length} wildlife species, ${professions.length} Nico outfit choices, accessible Clubhouse routing, local profiles, and outfit-aware Showtime recording.`);
