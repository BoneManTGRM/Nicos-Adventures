import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/world/LocalWildlifeArt.tsx",
  "src/world/DinosaurArt.tsx",
  "src/world/local-media-art.css",
  "src/world/localMediaArt.test.tsx",
  "src/world/AnimalForest.tsx",
  "src/world/DinosaurValley.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/AskNico.tsx",
];

for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing local media file: ${relative}`);
}

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const fullApp = read("src/FullApp.tsx");
const animals = read("src/world/AnimalForest.tsx");
const wildlifeArt = read("src/world/LocalWildlifeArt.tsx");
const dinosaurs = read("src/world/DinosaurValley.tsx");
const dinosaurArt = read("src/world/DinosaurArt.tsx");
const nicoFigure = read("src/nico/NicoCostumeFigure.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
const askNico = read("src/nico/AskNico.tsx");
const recovery = read("public/asset-recovery.js");
const css = read("src/world/local-media-art.css");
const tests = read("src/world/localMediaArt.test.tsx");

for (const modulePath of ["./world/ArtStudio", "./world/StoryCastle", "./world/RobotHome", "./world/Museum", "./world/Badges", "./world/Settings"]) {
  if (!fullApp.includes(modulePath)) throw new Error(`Completed world module is not integrated: ${modulePath}`);
}
for (const stalePath of ["./world/CreativeWorld", "./world/MemorySettings", "./world/AdventureWorld"]) {
  if (fullApp.includes(stalePath)) throw new Error(`Stale grouped world module returned: ${stalePath}`);
}
if (!fullApp.includes('import "./world/local-media-art.css"')) throw new Error("Local media art styles are not loaded");
if (!fullApp.includes('import "./world/creative-memory.css"')) throw new Error("Completed creative/memory styles are not loaded");

if (!animals.includes("LocalWildlifeArt") || !animals.includes('data-asset-recovery="ignore"') || !animals.includes("navigator.onLine")) {
  throw new Error("Animal Forest is not local-first with an optional protected online photograph");
}
if (!wildlifeArt.includes("local-wildlife-art__animal") || !wildlifeArt.includes("habitatPalette")) {
  throw new Error("Local wildlife illustration system is incomplete");
}
if (!dinosaurs.includes("DinosaurArt") || dinosaurs.includes("<div aria-hidden=\"true\">{dinosaur.emoji}</div>")) {
  throw new Error("Dinosaur Valley still relies on emoji-only cards");
}
for (const dinosaurId of ["trex", "triceratops", "stegosaurus", "brachiosaurus", "ankylosaurus", "velociraptor"]) {
  if (!dinosaurArt.includes(`case "${dinosaurId}"`)) throw new Error(`Local dinosaur silhouette is missing: ${dinosaurId}`);
}

if (!nicoFigure.includes("useApprovedNicoArt") || !nicoFigure.includes("showFinishedOutfit") || !nicoFigure.includes("showApprovedCharacter")) {
  throw new Error("Nico does not prioritize approved high-resolution artwork");
}
if (!dressUp.includes("approvedOutfitStyle") || !dressUp.includes("nico-outfit-thumbnail--approved") || !dressUp.includes("nico-drag-ghost__approved")) {
  throw new Error("Dress Up thumbnails or drag previews still depend only on the blurry sprite");
}
if (!askNico.includes("NicoCostumeFigure") || !askNico.includes("nico-ask-hero__art")) {
  throw new Error("Ask Nico does not use the shared sharp saved-outfit renderer");
}
if (!recovery.includes('img.dataset.recoverable === "wildlife"') || !recovery.includes('img.dataset.assetRecovery === "ignore"')) {
  throw new Error("Global image recovery is not safely scoped to explicit wildlife images");
}

for (const contract of ["local-wildlife-art", "dinosaur-art", "nico-outfit-thumbnail--approved", "nico-drag-ghost__approved"]) {
  if (!css.includes(`.${contract}`)) throw new Error(`Local media style contract missing: ${contract}`);
}
if (!tests.includes("without a network response") || !tests.includes("distinct sharp SVG silhouettes")) {
  throw new Error("Local media regression coverage is incomplete");
}

console.log("Local media validation passed for sharp Nico art, offline wildlife illustrations, distinct dinosaur SVGs, scoped recovery, and completed world-module integration.");
