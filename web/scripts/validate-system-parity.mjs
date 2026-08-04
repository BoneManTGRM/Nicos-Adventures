import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/i18n/core.ts",
  "src/i18n/options.ts",
  "src/i18n/display.ts",
  "src/i18n/animals.ts",
  "src/i18n/animalsCompat.ts",
  "src/world/catalogs.ts",
  "src/world/common.tsx",
  "src/world/WorldMap.tsx",
  "src/world/RoboLab.tsx",
  "src/world/AnimalForest.tsx",
  "src/world/MonsterWorld.tsx",
  "src/world/CreativeWorld.tsx",
  "src/world/AdventureWorld.tsx",
  "src/world/MemorySettings.tsx",
  "src/world/system-parity.css",
  "src/world/systemParity.test.tsx",
];

for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    throw new Error(`Missing system parity file: ${relative}`);
  }
}

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const fullApp = read("src/FullApp.tsx");
const storage = read("src/storage.ts");
const syncBoundary = read("src/FullAppSync.tsx");
const core = read("src/i18n/core.ts");
const display = read("src/i18n/display.ts");
const animalCopy = read("src/i18n/animals.ts");
const catalogs = read("src/world/catalogs.ts");
const common = read("src/world/common.tsx");
const animalForest = read("src/world/AnimalForest.tsx");
const memorySettings = read("src/world/MemorySettings.tsx");
const parityCss = read("src/world/system-parity.css");
const parityTests = read("src/world/systemParity.test.tsx");

for (const staleDefinition of [
  "function WorldMap(",
  "function RoboLab(",
  "function AnimalForest(",
  "function MonsterLab(",
  "function MonsterHabitats(",
  "function ArtStudio(",
  "function StoryCastle(",
  "function Arcade(",
  "function DinosaurValley(",
  "function PetWorkshop(",
  "function RobotHome(",
  "function Museum(",
  "function Badges(",
  "function Settings(",
]) {
  if (fullApp.includes(staleDefinition)) {
    throw new Error(`FullApp contains a stale embedded destination: ${staleDefinition}`);
  }
}

for (const importedDestination of [
  "WorldMap",
  "RoboLab",
  "AnimalForest",
  "MonsterLab",
  "MonsterHabitats",
  "ArtStudio",
  "StoryCastle",
  "Arcade",
  "DinosaurValley",
  "PetWorkshop",
  "RobotHome",
  "Museum",
  "Badges",
  "Settings",
]) {
  if (!fullApp.includes(importedDestination)) {
    throw new Error(`Modular world destination is not integrated: ${importedDestination}`);
  }
}

if (!fullApp.includes('className="fw-skip-link"') || !fullApp.includes('aria-live="polite"')) {
  throw new Error("The world shell is missing skip navigation or polite status announcements");
}
if (!fullApp.includes('data-section-id={profile.selectedSection}') || !fullApp.includes('id="main-content"')) {
  throw new Error("The world shell is missing stable main-content and section identifiers");
}
if (!fullApp.includes('saveLocalStore(store, "app")')) {
  throw new Error("App-originated saves are not marked and may remount the active activity");
}
if (!storage.includes('source: "app" | "shared"') || !storage.includes("CustomEvent<ProfileEventDetail>")) {
  throw new Error("Profile save events do not expose a typed synchronization source");
}
if (!syncBoundary.includes('detail?.source === "app"')) {
  throw new Error("FullAppSync does not ignore app-originated saves");
}

for (const key of ["skipToContent", "mainNavigation", "restoreSuccess", "noAnimalResults", "saveMonster", "saveStory"]) {
  if (!core.includes(`${key}:`) || !core.includes('"es-MX"')) {
    throw new Error(`Bilingual core UI key is missing: ${key}`);
  }
}
if (!display.includes('"Spider legs": "Patas de araña"') || !display.includes("fossilLabel")) {
  throw new Error("Legacy profile display compatibility is incomplete");
}
if (!animalCopy.includes("Rana dardo venenosa") || !animalCopy.includes("Leopardo de las nieves")) {
  throw new Error("Mexican-Spanish animal facts are incomplete");
}

const sectionIds = [
  "world-map", "robo-lab", "animal-forest", "monster-lab", "monster-habitats",
  "art-studio", "story-castle", "game-arcade", "dinosaur-valley", "pet-workshop",
  "robot-home", "memory-book", "badge-book", "parent-settings",
];
for (const sectionId of sectionIds) {
  if (!catalogs.includes(`id: "${sectionId}"`)) {
    throw new Error(`World destination is missing from the shared catalog: ${sectionId}`);
  }
}

if (!common.includes('aria-current={active ? "page" : undefined}') || !common.includes('tabIndex={-1}')) {
  throw new Error("World navigation does not expose the active page or focusable destination heading");
}
if (!animalForest.includes("localizeAnimalCompat") || !animalForest.includes('aria-pressed={sourceAnimal.favorite}')) {
  throw new Error("Animal Forest bilingual or favorite accessibility behavior is incomplete");
}
if (!memorySettings.includes("fossilLabel") || !memorySettings.includes("restoreSuccess")) {
  throw new Error("Memory Museum or backup/restore bilingual display is incomplete");
}

for (const cssContract of ["min-height:44px", ":focus-visible", "env(safe-area-inset", "prefers-reduced-motion"]) {
  if (!parityCss.includes(cssContract)) {
    throw new Error(`System accessibility style contract is missing: ${cssContract}`);
  }
}
if (!parityTests.includes("bilingual catalog coverage") || !parityTests.includes("aria-current")) {
  throw new Error("Bilingual and accessible navigation regression tests are missing");
}

console.log(`System parity validation passed for ${sectionIds.length} destinations, bilingual identifiers, legacy profile display, app-save synchronization, keyboard focus, touch targets, safe areas, and reduced motion.`);
