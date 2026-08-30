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

const director = read("public/wildlife-director.js");
const labels = [
  "Jaguar","Toucan","Sloth","Poison Dart Frog","Blue Whale","Giant Pacific Octopus","Sea Turtle","Manta Ray",
  "Lion","African Elephant","Giraffe","Meerkat","Polar Bear","Arctic Fox","Emperor Penguin","Walrus",
  "Fennec Fox","Camel","Roadrunner","Gila Monster","Red Panda","Flying Squirrel","Great Horned Owl","Beaver",
  "Axolotl","Capybara","Flamingo","Platypus","Snow Leopard","Mountain Goat","Andean Condor","Yak",
];
for (const label of labels) if (!director.includes(`"${label}"`)) throw new Error(`Wildlife mapping missing: ${label}`);

const index = read("index.html");
if (!index.includes("/src/main.tsx")) throw new Error("React entrypoint is missing");

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
if (!activeProfileHook.includes("useAppStore()") || activeProfileHook.includes("useState") || activeProfileHook.includes("loadLocalStore")) {
  throw new Error("Legacy profile hook is not a context-only adapter");
}
if (!guide.includes("useAppStore") || !guide.includes("wardrobe={profile.nico.wardrobe}")) {
  throw new Error("Nico guide is not connected to the canonical profile and wardrobe");
}
if (!portalArt.includes("useActiveProfileStore") || !portalArt.includes("wardrobe={profile.nico.wardrobe}")) {
  throw new Error("Nico portal art is not connected to the shared profile wardrobe");
}
if (!clubhouse.includes("useDialogFocusTrap") || !clubhouse.includes('addEventListener("popstate"') || !clubhouse.includes("wardrobe={profile.nico.wardrobe}")) {
  throw new Error("Nico Clubhouse profile, focus, history, or wardrobe synchronization is incomplete");
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
const dressUp = read("src/nico/NicoDressUp.tsx");
const wardrobeStudio = read("src/nico/wardrobe/WardrobeStudio.tsx");
const wardrobeSvg = read("src/nico/wardrobe/wardrobeSvg.ts");
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) {
  throw new Error("Shared Nico surfaces are not using the layered wardrobe renderer");
}
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("approvedOutfitStyle") || dressUp.includes("nicoOutfitSpriteStyle")) {
  throw new Error("NicoDressUp still uses flattened outfit art");
}
if (!wardrobeStudio.includes("onPointerDown") || !wardrobeStudio.includes("wardrobeReducer") || !wardrobeStudio.includes("GarmentThumbnail")) {
  throw new Error("True garment drag, edit history, or garment-only thumbnails are incomplete");
}
if (!wardrobeSvg.includes('data-nico-body="true"') || !wardrobeSvg.includes("buildGarmentSvg")) {
  throw new Error("One-body or garment-only SVG rendering is incomplete");
}

const askNico = read("src/nico/AskNico.tsx");
if (!askNico.includes("NicoCostumeFigure") || !askNico.includes("wardrobe")) {
  throw new Error("Ask Nico is not using the synchronized saved wardrobe renderer");
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
if (!showtime.includes("parentConfirmed") || !showtime.includes("composeNicoImage(profile.nico.wardrobe)")) {
  throw new Error("Showtime parental confirmation or layered Nico composition is missing");
}
if (!showtime.includes("wardrobe={profile.nico.wardrobe}") || !compositor.includes("loadNicoWardrobeImage")) {
  throw new Error("Showtime live and recorded Nico output do not share the wardrobe renderer");
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
if (!sw.includes("nicos-world-static-v20") || !swRefresh.includes('"v20"')) throw new Error("Nico system cache version is not v20");
if (!sw.includes('await cache.put("/index.html", copy)') || !sw.includes("await cache.put(event.request, copy)")) {
  throw new Error("Service-worker cache writes must remain attached to the fetch lifecycle");
}

console.log(`Release validation passed for one AppShell, schema v4, one-body layered Nico wardrobe, ${labels.length} wildlife species, ${professions.length} profession presets, accessible Clubhouse routing, and wardrobe-aware Showtime recording.`);
