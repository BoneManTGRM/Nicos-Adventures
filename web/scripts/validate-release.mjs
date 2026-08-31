import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const requiredFiles = [
  "index.html",
  "package.json",
  "package-lock.json",
  "public/_redirects",
  "public/asset-recovery.js",
  "public/dinosaur-art.js",
  "public/sw.js",
  "src/AppShell.tsx",
  "src/app/AppStoreContext.tsx",
  "src/app/AppErrorBoundary.tsx",
  "src/FullApp.tsx",
  "src/NicoGuide.tsx",
  "src/ServiceWorkerRefresh.tsx",
  "src/hooks/useActiveProfileStore.ts",
  "src/hooks/useDialogFocusTrap.ts",
  "src/nico/NicoPortalArt.tsx",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/AskNico.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/knowledge.ts",
  "src/nico/wardrobe/catalog.ts",
  "src/nico/wardrobe/wardrobeSvg.ts",
  "src/nico/wardrobe/WardrobeStudio.tsx",
  "src/nico/wardrobe/NicoLayeredCharacter.tsx",
  "src/showtime/ShowtimeStudio.tsx",
  "src/showtime/composeNicoImage.ts",
  "src/showtime/recordMovie.ts",
  "src/showtime/movieRenderer.ts",
  "src/showtime/NicoMovieLibrary.tsx",
  "src/catalogs/nico-knowledge.json",
  "src/catalogs/nico-professions.json",
  "src/catalogs/showtime.json",
  "scripts/validate-layered-wardrobe.mjs",
  "scripts/generate-offline-manifest.mjs",
  "scripts/generate-release-manifest.mjs",
  "scripts/validate-performance-budget.mjs",
  "playwright.config.ts",
  "tsconfig.e2e.json",
  "e2e/golden-adventure.e2e.ts",
  "../docs/PROFILE_SCHEMA_V4.md",
];
for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing release file: ${relative}`);
}

const labels = [
  "Jaguar","Toucan","Sloth","Poison Dart Frog","Blue Whale","Giant Pacific Octopus","Sea Turtle","Manta Ray",
  "Lion","African Elephant","Giraffe","Meerkat","Polar Bear","Arctic Fox","Emperor Penguin","Walrus",
  "Fennec Fox","Camel","Roadrunner","Gila Monster","Red Panda","Flying Squirrel","Great Horned Owl","Beaver",
  "Axolotl","Capybara","Flamingo","Platypus","Snow Leopard","Mountain Goat","Andean Condor","Yak",
];
const featureArt = read("src/FeatureArt.tsx");
for (const label of labels) if (!featureArt.includes(`"${label}"`)) throw new Error(`Wildlife catalog entry missing: ${label}`);

const index = read("index.html");
if (!index.includes("/src/main.tsx")) throw new Error("React entrypoint is missing");
if (index.includes("wildlife-director")) throw new Error("External wildlife fetch interceptor must not ship");
const animalForest = read("src/world/AnimalForest.tsx");
if (animalForest.includes("wikipedia.org") || animalForest.includes("Wikimedia")) {
  throw new Error("Animal Forest must not request third-party wildlife content");
}
if (!animalForest.includes("private local illustration")) throw new Error("Animal Forest local-art contract is missing");

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
if (!fullApp.includes("useAppStore()") || fullApp.includes("loadLocalStore") || fullApp.includes("saveLocalStore")) {
  throw new Error("FullApp creates or persists a second store");
}
if (!fullApp.includes('window.history.scrollRestoration = "manual"')) {
  throw new Error("Saved destinations must not reopen at a stale browser scroll position");
}
if (!activeProfileHook.includes("useAppStore()") || activeProfileHook.includes("useState") || activeProfileHook.includes("loadLocalStore")) {
  throw new Error("Legacy profile hook is not a context-only adapter");
}
if (!guide.includes("useAppStore") || !guide.includes("profession={profile.nico.profession}")) {
  throw new Error("Nico guide is not connected to the canonical profile profession");
}
if (!portalArt.includes("useActiveProfileStore") || !portalArt.includes("profession={profile.nico.profession}")) {
  throw new Error("Nico portal art is not connected to the canonical profile profession");
}
if (!clubhouse.includes("useDialogFocusTrap") || !clubhouse.includes('addEventListener("popstate"') || !clubhouse.includes("NicoDressUp")) {
  throw new Error("Nico Clubhouse focus, history, or premium Wardrobe integration is incomplete");
}
if (!focusTrap.includes('event.key === "Tab"') || !focusTrap.includes('event.key === "Escape"')) {
  throw new Error("Accessible Clubhouse focus containment is incomplete");
}
if (!hubRoute.includes("nicosWorldHub") || !hubRoute.includes("parseNicoHubHash")) {
  throw new Error("Nico Clubhouse history markers are incomplete");
}

const types = read("src/types.ts");
const storage = read("src/storage.ts");
const schemaDocs = read("../docs/PROFILE_SCHEMA_V4.md");
for (const contract of [
  "schemaVersion: 4", "activeRobotId: string", "displayedArtworkId: string | null", "lastBackupAt: string | null",
  "wardrobe: NicoWardrobe", "headwear: string | null", "outerwear: string | null", "prop: string | null",
]) {
  if (!types.includes(contract)) throw new Error(`Schema-v4 type contract is missing: ${contract}`);
}
for (const contract of [
  "SCHEMA_VERSION = 4", "nicos-world-local-save-v4", "nicos-world-local-save-v3", "normalizeWardrobe",
  "completedMissions: uniqueNewest", "activeRobotId", "displayedArtworkId", "nicos-world-local-profile-v4",
]) {
  if (!storage.includes(contract)) throw new Error(`Schema-v4 storage contract is missing: ${contract}`);
}
if (!schemaDocs.includes("Nico wardrobe foundation")) throw new Error("Schema-v4 documentation is incomplete");

const professions = JSON.parse(read("src/catalogs/nico-professions.json"));
if (!Array.isArray(professions) || professions.length < 26) throw new Error("Nico must provide at least 26 bilingual profession choices");

const figure = read("src/nico/NicoCostumeFigure.tsx");
if (!figure.includes("canonicalNicoPresetArt") || !figure.includes('"canonical-2d"') || figure.includes("wardrobeForDisplay")) {
  throw new Error("Shared Nico surfaces are not locked to canonical premium art");
}
const askNico = read("src/nico/AskNico.tsx");
if (!askNico.includes("NicoCostumeFigure")) throw new Error("Ask Nico is not using canonical Nico art");

const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const recorder = read("src/showtime/recordMovie.ts");
if (!recorder.includes("captureStream") || !recorder.includes("MediaRecorder")) throw new Error("Showtime client-side recording is incomplete");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not write video data to localStorage");
if (!showtime.includes("parentConfirmed") || !showtime.includes("composeNicoImage(profile.nico.profession)")) {
  throw new Error("Showtime parental confirmation or canonical Nico composition is missing");
}
if (!compositor.includes("loadCanonicalNicoImage") || compositor.includes("loadNicoWardrobeImage")) {
  throw new Error("Showtime does not use canonical Nico art");
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
if (!packageJson.scripts?.validate?.includes?.("")) {
  // The project uses validate:release rather than a generic validate command.
}
if (!packageJson.scripts?.["validate:release"]?.includes("validate-layered-wardrobe.mjs")) {
  throw new Error("Layered wardrobe validation is not part of the production build");
}
if (!packageJson.scripts?.build?.includes("generate-release-manifest.mjs --verify")) {
  throw new Error("Exact release identity generation and verification are not part of the production build");
}
if (!packageJson.scripts?.build?.includes("validate-performance-budget.mjs")) {
  throw new Error("Golden Adventure production performance budgets are not part of the build");
}
if (!packageJson.scripts?.build?.includes("generate-offline-manifest.mjs")) {
  throw new Error("The generated Golden Adventure offline asset manifest is not part of the build");
}
if (!packageJson.scripts?.build?.includes("vite build --emptyOutDir")) {
  throw new Error("Production output must be cleared before release hashes and performance budgets are measured");
}
if (packageJson.devDependencies?.["@playwright/test"] !== "1.62.1" ||
    packageJson.devDependencies?.["@types/node"] !== "22.20.1" ||
    packageJson.scripts?.["test:e2e"] !== "playwright test" ||
    packageJson.scripts?.["typecheck:e2e"] !== "tsc --noEmit -p tsconfig.e2e.json") {
  throw new Error("The pinned Golden Adventure browser gate is missing");
}

const releaseGenerator = read("scripts/generate-release-manifest.mjs");
for (const field of [
  "appVersion",
  "profileSchema",
  "commitSha",
  "buildTimestamp",
  "assetManifestHash",
  "serviceWorkerHash",
  "buildHash",
]) {
  if (!releaseGenerator.includes(field)) throw new Error(`release.json contract is missing: ${field}`);
}
if (!releaseGenerator.includes('execFileSync("git", ["rev-parse", "HEAD"]') ||
    !releaseGenerator.includes("release.commitSha !== resolveCommitSha()")) {
  throw new Error("release.json does not prove its checked-out deployment commit");
}
const headers = read("public/_headers");
if (!headers.includes("/release.json\n  Cache-Control: no-store")) {
  throw new Error("release.json must not be served through a stale HTTP cache");
}

const recovery = read("public/asset-recovery.js");
if (!recovery.includes('dataset.recoverable !== "wildlife"')) throw new Error("Asset recovery is not restricted to explicit wildlife images");

const sw = read("public/sw.js");
const swRefresh = read("src/ServiceWorkerRefresh.tsx");
if (!sw.includes("nicos-world-static-v22") || !swRefresh.includes('"v22"')) throw new Error("Nico system cache version is not v22");
if (swRefresh.includes("window.location.reload")) {
  throw new Error("Service-worker updates must not force a reload during active play");
}
if (!sw.includes('await cache.put("/index.html", copy)') || !sw.includes("await cache.put(event.request, copy)")) {
  throw new Error("Service-worker cache writes must remain attached to the fetch lifecycle");
}
if (!sw.includes("OFFLINE_ASSET_MANIFEST") || !sw.includes("await cache.addAll")) {
  throw new Error("The generated Golden Adventure asset manifest is not precached");
}
if (!sw.includes("caches.match(event.request, { ignoreSearch: true, ignoreVary: true })")) {
  throw new Error("Offline requests must fall back to the generated Golden Adventure cache");
}

console.log(`Release validation passed for one AppShell, schema v4, canonical Nico art, ${labels.length} wildlife species, ${professions.length} profession presets, accessible Clubhouse routing, and canonical Showtime recording.`);
