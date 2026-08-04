import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const requiredFiles = [
  "index.html", "package.json", "package-lock.json", "public/_redirects", "public/wildlife-director.js",
  "public/asset-recovery.js", "public/dinosaur-art.js", "public/sw.js",
  "public/assets/nico/photo/nico-photo-body.webp.b64",
  "src/AppShell.tsx", "src/app/AppStoreContext.tsx", "src/app/AppErrorBoundary.tsx", "src/FullApp.tsx",
  "src/NicoGuide.tsx", "src/ServiceWorkerRefresh.tsx", "src/hooks/useActiveProfileStore.ts", "src/hooks/useDialogFocusTrap.ts",
  "src/nico/NicoPortalArt.tsx", "src/nico/NicoWorldExperience.tsx", "src/nico/AskNico.tsx", "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx", "src/nico/knowledge.ts", "src/nico/wardrobe/catalog.ts",
  "src/nico/wardrobe/wardrobeSvg.ts", "src/nico/wardrobe/photoNicoBody.ts", "src/nico/wardrobe/photoWardrobeSvg.ts",
  "src/nico/wardrobe/photo-wardrobe.css", "src/nico/wardrobe/WardrobeStudio.tsx", "src/nico/wardrobe/NicoLayeredCharacter.tsx",
  "src/showtime/ShowtimeStudio.tsx", "src/showtime/composeNicoImage.ts", "src/showtime/recordMovie.ts",
  "src/showtime/movieRenderer.ts", "src/showtime/NicoMovieLibrary.tsx", "src/catalogs/nico-knowledge.json",
  "src/catalogs/nico-professions.json", "src/catalogs/showtime.json", "scripts/validate-layered-wardrobe.mjs",
  "../docs/PROFILE_SCHEMA_V4.md",
];
for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing release file: ${relative}`);
}
if (fs.statSync(path.join(root, "public/assets/nico/photo/nico-photo-body.webp.b64")).size < 100_000) {
  throw new Error("Supplied Nico photo body asset is incomplete");
}

const director = read("public/wildlife-director.js");
const labels = [
  "Jaguar","Toucan","Sloth","Poison Dart Frog","Blue Whale","Giant Pacific Octopus","Sea Turtle","Manta Ray",
  "Lion","African Elephant","Giraffe","Meerkat","Polar Bear","Arctic Fox","Emperor Penguin","Walrus",
  "Fennec Fox","Camel","Roadrunner","Gila Monster","Red Panda","Flying Squirrel","Great Horned Owl","Beaver",
  "Axolotl","Capybara","Flamingo","Platypus","Snow Leopard","Mountain Goat","Andean Condor","Yak",
];
for (const label of labels) if (!director.includes(`"${label}"`)) throw new Error(`Wildlife mapping missing: ${label}`);
if (!read("index.html").includes("/src/main.tsx")) throw new Error("React entrypoint is missing");

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

if (!main.includes("<AppShell />") || main.includes("<FullAppSync") || main.includes("<NicoGuide")) throw new Error("main.tsx must mount one AppShell");
for (const surface of ["<ServiceWorkerRefresh />", "<FullApp />", "<NicoGuide />", "<NicoWorldExperience />", "<NicoPortalArt />"]) {
  if (!appShell.includes(surface)) throw new Error(`AppShell is missing: ${surface}`);
}
if (!appShell.includes("<AppStoreProvider>") || !appShell.includes("<AppErrorBoundary>")) throw new Error("AppShell foundation is incomplete");
if (!appStore.includes("useState<LocalSaveStore>") || !appStore.includes('saveLocalStore(store, "app")')) throw new Error("Canonical store is incomplete");
if (!fullApp.includes("useAppStore()") || fullApp.includes("loadLocalStore") || fullApp.includes("saveLocalStore")) throw new Error("FullApp creates a second store");
if (!activeProfileHook.includes("useAppStore()") || activeProfileHook.includes("useState") || activeProfileHook.includes("loadLocalStore")) throw new Error("Profile hook is not a context adapter");
if (!guide.includes("useAppStore") || !guide.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Guide wardrobe sync is incomplete");
if (!portalArt.includes("useActiveProfileStore") || !portalArt.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Portal wardrobe sync is incomplete");
if (!clubhouse.includes("useDialogFocusTrap") || !clubhouse.includes('addEventListener("popstate"') || !clubhouse.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Clubhouse synchronization is incomplete");
if (!focusTrap.includes('event.key === "Tab"') || !focusTrap.includes('event.key === "Escape"')) throw new Error("Clubhouse focus containment is incomplete");
if (!hubRoute.includes("nicosWorldHub") || !hubRoute.includes("parseNicoHubHash")) throw new Error("Clubhouse history markers are incomplete");

const types = read("src/types.ts");
const storage = read("src/storage.ts");
const schemaDocs = read("../docs/PROFILE_SCHEMA_V4.md");
for (const contract of ["schemaVersion: 4", "activeRobotId: string", "displayedArtworkId: string | null", "lastBackupAt: string | null", "wardrobe: NicoWardrobe", "headwear: string | null", "outerwear: string | null", "prop: string | null"]) {
  if (!types.includes(contract)) throw new Error(`Schema-v4 type contract missing: ${contract}`);
}
for (const contract of ["SCHEMA_VERSION = 4", "nicos-world-local-save-v4", "nicos-world-local-save-v3", "normalizeWardrobe", "completedMissions: uniqueNewest", "activeRobotId", "displayedArtworkId", "nicos-world-local-profile-v4"]) {
  if (!storage.includes(contract)) throw new Error(`Schema-v4 storage contract missing: ${contract}`);
}
if (!schemaDocs.includes("Nico wardrobe foundation")) throw new Error("Schema-v4 documentation is incomplete");

const professions = JSON.parse(read("src/catalogs/nico-professions.json"));
if (!Array.isArray(professions) || professions.length < 26) throw new Error("Nico must provide at least 26 professions");

const figure = read("src/nico/NicoCostumeFigure.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
const wardrobeStudio = read("src/nico/wardrobe/WardrobeStudio.tsx");
const character = read("src/nico/wardrobe/NicoLayeredCharacter.tsx");
const photoBody = read("src/nico/wardrobe/photoNicoBody.ts");
const photoRenderer = read("src/nico/wardrobe/photoWardrobeSvg.ts");
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) throw new Error("Shared Nico surfaces bypass the wardrobe renderer");
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("nicoOutfitSpriteStyle")) throw new Error("Dress Up still uses flattened outfit art");
if (!wardrobeStudio.includes("onPointerDown") || !wardrobeStudio.includes("wardrobeReducer") || !wardrobeStudio.includes("GarmentThumbnail")) throw new Error("Wardrobe drag or history is incomplete");
if (!character.includes("usePhotoNicoBody") || !character.includes('data-photo-nico-body') || !character.includes("nico-vector-fallback")) throw new Error("Supplied Nico photo body or local fallback is missing");
if (!photoBody.includes("nico-photo-body.webp.b64") || !photoBody.includes("PHOTO_NICO_HEIGHT = 1467")) throw new Error("Supplied Nico photo loader is incomplete");
if (!photoRenderer.includes("buildPhotoWardrobeBackgroundSvg") || !photoRenderer.includes("buildPhotoWardrobeForegroundSvg")) throw new Error("Photo-calibrated clothing layers are incomplete");

const askNico = read("src/nico/AskNico.tsx");
if (!askNico.includes("NicoCostumeFigure") || !askNico.includes("wardrobe")) throw new Error("Ask Nico wardrobe sync is missing");

const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const recorder = read("src/showtime/recordMovie.ts");
if (!recorder.includes("captureStream") || !recorder.includes("MediaRecorder")) throw new Error("Showtime recording is incomplete");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not store video blobs");
if (!showtime.includes("parentConfirmed") || !showtime.includes("composeNicoImage(profile.nico.wardrobe)")) throw new Error("Showtime confirmation or composition is missing");
if (!showtime.includes("wardrobe={profile.nico.wardrobe}") || !compositor.includes("loadPhotoNicoBodyImage") || !compositor.includes("photoWardrobeForegroundDataUrl")) throw new Error("Showtime does not use the supplied Nico photo wardrobe");
if (!compositor.includes("loadNicoWardrobeImage")) throw new Error("Showtime local fallback is missing");

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const allVersions = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [name, version] of Object.entries(allVersions)) {
  if (version === "latest" || String(version).startsWith("^") || String(version).startsWith("~")) throw new Error(`Dependency is not pinned: ${name}@${version}`);
  const locked = packageLock.packages?.[""]?.dependencies?.[name] ?? packageLock.packages?.[""]?.devDependencies?.[name];
  if (locked !== version) throw new Error(`Lockfile mismatch: ${name}@${locked} !== ${version}`);
}
if (packageLock.lockfileVersion !== 3) throw new Error("Web lockfile must be version 3");
if (!packageJson.scripts?.["validate:release"]?.includes("validate-layered-wardrobe.mjs")) throw new Error("Wardrobe validation is not in the build");

if (!read("public/asset-recovery.js").includes('dataset.recoverable !== "wildlife"')) throw new Error("Asset recovery is not restricted to wildlife");
const sw = read("public/sw.js");
const swRefresh = read("src/ServiceWorkerRefresh.tsx");
if (!sw.includes("nicos-world-static-v20") || !sw.includes("nico-photo-body.webp.b64") || !swRefresh.includes('"v20"')) throw new Error("Supplied Nico photo release is not cached as v20");

console.log(`Release validation passed for one AppShell, schema v4, the supplied Nico photo wardrobe, ${labels.length} wildlife species, ${professions.length} profession presets, accessible Clubhouse routing, and matching Showtime output.`);
