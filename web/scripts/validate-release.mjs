import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const photoParts = Array.from({ length: 6 }, (_, index) => `public/assets/nico/photo/nico-photo-body.part${index + 1}.b64`);
const requiredFiles = [
  "index.html", "package.json", "package-lock.json", "public/_redirects", "public/wildlife-director.js",
  "public/asset-recovery.js", "public/dinosaur-art.js", "public/sw.js", ...photoParts,
  "scripts/validate-nico-photo-asset.mjs", "scripts/validate-layered-wardrobe.mjs",
  "src/AppShell.tsx", "src/app/AppStoreContext.tsx", "src/app/AppErrorBoundary.tsx", "src/FullApp.tsx",
  "src/NicoGuide.tsx", "src/ServiceWorkerRefresh.tsx", "src/hooks/useActiveProfileStore.ts", "src/hooks/useDialogFocusTrap.ts",
  "src/nico/NicoPortalArt.tsx", "src/nico/NicoWorldExperience.tsx", "src/nico/AskNico.tsx", "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx", "src/nico/wardrobe/catalog.ts", "src/nico/wardrobe/wardrobeSvg.ts",
  "src/nico/wardrobe/photoNicoBody.ts", "src/nico/wardrobe/photoWardrobeSvg.ts", "src/nico/wardrobe/photo-wardrobe.css",
  "src/nico/wardrobe/WardrobeStudio.tsx", "src/nico/wardrobe/NicoLayeredCharacter.tsx",
  "src/showtime/ShowtimeStudio.tsx", "src/showtime/composeNicoImage.ts", "src/showtime/recordMovie.ts",
  "src/showtime/movieRenderer.ts", "src/showtime/NicoMovieLibrary.tsx", "src/catalogs/nico-professions.json",
  "src/catalogs/nico-knowledge.json", "src/catalogs/showtime.json", "../docs/PROFILE_SCHEMA_V4.md",
];
for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing release file: ${relative}`);
}

const wildlife = read("public/wildlife-director.js");
const animalLabels = [
  "Jaguar", "Toucan", "Sloth", "Poison Dart Frog", "Blue Whale", "Giant Pacific Octopus", "Sea Turtle", "Manta Ray",
  "Lion", "African Elephant", "Giraffe", "Meerkat", "Polar Bear", "Arctic Fox", "Emperor Penguin", "Walrus",
  "Fennec Fox", "Camel", "Roadrunner", "Gila Monster", "Red Panda", "Flying Squirrel", "Great Horned Owl", "Beaver",
  "Axolotl", "Capybara", "Flamingo", "Platypus", "Snow Leopard", "Mountain Goat", "Andean Condor", "Yak",
];
for (const label of animalLabels) if (!wildlife.includes(`"${label}"`)) throw new Error(`Wildlife mapping missing: ${label}`);
if (!read("index.html").includes("/src/main.tsx")) throw new Error("React entrypoint is missing");

const main = read("src/main.tsx");
const appShell = read("src/AppShell.tsx");
const appStore = read("src/app/AppStoreContext.tsx");
const fullApp = read("src/FullApp.tsx");
const profileHook = read("src/hooks/useActiveProfileStore.ts");
const guide = read("src/NicoGuide.tsx");
const portal = read("src/nico/NicoPortalArt.tsx");
const clubhouse = read("src/nico/NicoWorldExperience.tsx");
const focusTrap = read("src/hooks/useDialogFocusTrap.ts");
if (!main.includes("<AppShell />") || main.includes("<FullAppSync") || main.includes("<NicoGuide")) throw new Error("main.tsx must mount one AppShell");
for (const surface of ["<ServiceWorkerRefresh />", "<FullApp />", "<NicoGuide />", "<NicoWorldExperience />", "<NicoPortalArt />"]) {
  if (!appShell.includes(surface)) throw new Error(`AppShell is missing: ${surface}`);
}
if (!appShell.includes("<AppStoreProvider>") || !appShell.includes("<AppErrorBoundary>")) throw new Error("AppShell foundation is incomplete");
if (!appStore.includes("useState<LocalSaveStore>") || !appStore.includes('saveLocalStore(store, "app")')) throw new Error("Canonical store is incomplete");
if (!fullApp.includes("useAppStore()") || fullApp.includes("loadLocalStore") || fullApp.includes("saveLocalStore")) throw new Error("FullApp creates a second store");
if (!profileHook.includes("useAppStore()") || profileHook.includes("useState") || profileHook.includes("loadLocalStore")) throw new Error("Profile hook is not a context adapter");
for (const [name, source] of [["guide", guide], ["portal", portal], ["clubhouse", clubhouse]]) {
  if (!source.includes("wardrobe")) throw new Error(`${name} is not synchronized with Nico's wardrobe`);
}
if (!focusTrap.includes('event.key === "Tab"') || !focusTrap.includes('event.key === "Escape"')) throw new Error("Clubhouse focus containment is incomplete");

const types = read("src/types.ts");
const storage = read("src/storage.ts");
for (const contract of ["schemaVersion: 4", "activeRobotId: string", "displayedArtworkId: string | null", "lastBackupAt: string | null", "wardrobe: NicoWardrobe", "headwear: string | null", "outerwear: string | null", "prop: string | null"]) {
  if (!types.includes(contract)) throw new Error(`Schema-v4 type contract missing: ${contract}`);
}
for (const contract of ["SCHEMA_VERSION = 4", "nicos-world-local-save-v4", "normalizeWardrobe", "completedMissions: uniqueNewest", "activeRobotId", "displayedArtworkId"]) {
  if (!storage.includes(contract)) throw new Error(`Schema-v4 storage contract missing: ${contract}`);
}

const professions = JSON.parse(read("src/catalogs/nico-professions.json"));
if (!Array.isArray(professions) || professions.length < 26) throw new Error("Nico must provide at least 26 professions");
const figure = read("src/nico/NicoCostumeFigure.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
const studio = read("src/nico/wardrobe/WardrobeStudio.tsx");
const character = read("src/nico/wardrobe/NicoLayeredCharacter.tsx");
const photoBody = read("src/nico/wardrobe/photoNicoBody.ts");
const photoRenderer = read("src/nico/wardrobe/photoWardrobeSvg.ts");
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) throw new Error("Shared Nico surfaces bypass the wardrobe renderer");
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("nicoOutfitSpriteStyle")) throw new Error("Dress Up still uses flattened artwork");
for (const contract of ["onPointerDown", "wardrobeReducer", "GarmentThumbnail"]) if (!studio.includes(contract)) throw new Error(`Wardrobe Studio contract missing: ${contract}`);
for (const contract of ["usePhotoNicoBody", "data-photo-nico-body", "nico-photo-layer--body", "nico-vector-fallback"]) if (!character.includes(contract)) throw new Error(`Photo Nico contract missing: ${contract}`);
for (const contract of ["PHOTO_NICO_BODY_PATHS", "part1.b64", "part6.b64", "PHOTO_NICO_HEIGHT = 1467"]) if (!photoBody.includes(contract)) throw new Error(`Photo loader contract missing: ${contract}`);
for (const contract of ["buildPhotoWardrobeBackgroundSvg", "buildPhotoWardrobeForegroundSvg", "PHOTO_NICO_VIEWBOX"]) if (!photoRenderer.includes(contract)) throw new Error(`Photo clothing contract missing: ${contract}`);

const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const recorder = read("src/showtime/recordMovie.ts");
if (!recorder.includes("captureStream") || !recorder.includes("MediaRecorder")) throw new Error("Showtime recording is incomplete");
if (showtime.includes("localStorage") || recorder.includes("localStorage")) throw new Error("Showtime must not store video blobs");
if (!showtime.includes("parentConfirmed") || !showtime.includes("composeNicoImage(profile.nico.wardrobe)") || !showtime.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Showtime wardrobe or parent confirmation is incomplete");
for (const contract of ["loadPhotoNicoBodyImage", "photoWardrobeBackgroundDataUrl", "photoWardrobeForegroundDataUrl", "loadNicoWardrobeImage"]) if (!compositor.includes(contract)) throw new Error(`Showtime compositor contract missing: ${contract}`);

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const versions = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [name, version] of Object.entries(versions)) {
  if (version === "latest" || String(version).startsWith("^") || String(version).startsWith("~")) throw new Error(`Dependency is not pinned: ${name}@${version}`);
  const locked = packageLock.packages?.[""]?.dependencies?.[name] ?? packageLock.packages?.[""]?.devDependencies?.[name];
  if (locked !== version) throw new Error(`Lockfile mismatch: ${name}@${locked} !== ${version}`);
}
if (packageLock.lockfileVersion !== 3) throw new Error("Web lockfile must be version 3");
for (const validator of ["validate-nico-photo-asset.mjs", "validate-layered-wardrobe.mjs"]) {
  if (!packageJson.scripts?.["validate:release"]?.includes(validator)) throw new Error(`Production build omits ${validator}`);
}

if (!read("public/asset-recovery.js").includes('dataset.recoverable !== "wildlife"')) throw new Error("Asset recovery is not restricted to wildlife");
const sw = read("public/sw.js");
const refresh = read("src/ServiceWorkerRefresh.tsx");
if (!sw.includes("nicos-world-static-v20") || !sw.includes("nico-photo-body.part1.b64") || !sw.includes("nico-photo-body.part6.b64") || !refresh.includes('"v20"')) throw new Error("Photo Nico release is not cached as v20");

console.log(`Release validation passed for one AppShell, schema v4, the verified supplied Nico photo wardrobe, ${animalLabels.length} wildlife species, ${professions.length} profession presets, and matching Showtime output.`);
