import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/world/LocalWildlifeArt.tsx", "src/world/DinosaurArt.tsx", "src/world/local-media-art.css",
  "src/world/localMediaArt.test.tsx", "src/world/AnimalForest.tsx", "src/world/DinosaurValley.tsx",
  "src/nico/NicoCostumeFigure.tsx", "src/nico/NicoDressUp.tsx", "src/nico/AskNico.tsx",
  "src/nico/wardrobe/wardrobeSvg.ts", "src/nico/wardrobe/photoNicoBody.ts",
  "src/nico/wardrobe/photoWardrobeSvg.ts", "src/nico/wardrobe/NicoLayeredCharacter.tsx",
  "src/nico/wardrobe/wardrobe.css", "src/nico/wardrobe/photo-wardrobe.css",
  "public/assets/nico/photo/nico-photo-body.webp.b64",
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
const character = read("src/nico/wardrobe/NicoLayeredCharacter.tsx");
const photoBody = read("src/nico/wardrobe/photoNicoBody.ts");
const photoRenderer = read("src/nico/wardrobe/photoWardrobeSvg.ts");
const fallbackRenderer = read("src/nico/wardrobe/wardrobeSvg.ts");
const wardrobeCss = `${read("src/nico/wardrobe/wardrobe.css")}\n${read("src/nico/wardrobe/photo-wardrobe.css")}`;
const recovery = read("public/asset-recovery.js");
const css = read("src/world/local-media-art.css");
const tests = read("src/world/localMediaArt.test.tsx");

for (const modulePath of ["./world/ArtStudio", "./world/StoryCastle", "./world/RobotHome", "./world/Museum", "./world/Badges", "./world/Settings"]) {
  if (!fullApp.includes(modulePath)) throw new Error(`Completed world module is not integrated: ${modulePath}`);
}
for (const stalePath of ["./world/CreativeWorld", "./world/MemorySettings", "./world/AdventureWorld"]) {
  if (fullApp.includes(stalePath)) throw new Error(`Stale grouped world module returned: ${stalePath}`);
}
if (!fullApp.includes('import "./world/local-media-art.css"') || !fullApp.includes('import "./world/creative-memory.css"')) {
  throw new Error("Completed media styles are not loaded");
}

if (!animals.includes("LocalWildlifeArt") || !animals.includes('data-asset-recovery="ignore"') || !animals.includes("navigator.onLine")) {
  throw new Error("Animal Forest is not local-first with an optional protected photo");
}
if (!wildlifeArt.includes("local-wildlife-art__animal") || !wildlifeArt.includes("habitatPalette")) throw new Error("Local wildlife art is incomplete");
if (!dinosaurs.includes("DinosaurArt") || dinosaurs.includes("<div aria-hidden=\"true\">{dinosaur.emoji}</div>")) throw new Error("Dinosaur Valley still relies on emoji-only cards");
for (const dinosaurId of ["trex", "triceratops", "stegosaurus", "brachiosaurus", "ankylosaurus", "velociraptor"]) {
  if (!dinosaurArt.includes(`case "${dinosaurId}"`)) throw new Error(`Local dinosaur silhouette missing: ${dinosaurId}`);
}

if (!nicoFigure.includes("NicoLayeredCharacter") || !nicoFigure.includes('data-art-state="layered-wardrobe"')) throw new Error("Nico does not use the shared wardrobe renderer");
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("nicoOutfitSpriteStyle")) throw new Error("Dress Up still uses flattened art or legacy sprites");
if (!askNico.includes("NicoCostumeFigure") || !askNico.includes("wardrobe")) throw new Error("Ask Nico wardrobe sync is incomplete");
if (!character.includes("usePhotoNicoBody") || !character.includes('data-photo-nico-body') || !character.includes("nico-photo-layer--front")) {
  throw new Error("The supplied high-resolution Nico body is not the primary character renderer");
}
if (!photoBody.includes("nico-photo-body.webp.b64") || !photoBody.includes("PHOTO_NICO_HEIGHT = 1467")) throw new Error("Supplied Nico photo asset loader is incomplete");
if (!photoRenderer.includes("buildPhotoWardrobeBackgroundSvg") || !photoRenderer.includes("buildPhotoWardrobeForegroundSvg") || !photoRenderer.includes('PHOTO_NICO_VIEWBOX')) {
  throw new Error("Photo-calibrated Nico clothing layers are incomplete");
}
if (!fallbackRenderer.includes("buildNicoWardrobeSvg") || !fallbackRenderer.includes('data-nico-body="true"')) throw new Error("Offline vector fallback is incomplete");
if (!recovery.includes('img.dataset.recoverable !== "wildlife"') || !recovery.includes('img.dataset.assetRecovery === "ignore"')) throw new Error("Global image recovery is not safely scoped");

for (const contract of ["local-wildlife-art", "dinosaur-art"]) if (!css.includes(`.${contract}`)) throw new Error(`Local media style missing: ${contract}`);
for (const contract of ["nico-layered-character", "nico-photo-layer--body", "wardrobe-garment-thumbnail", "wardrobe-drag-ghost"]) {
  if (!wardrobeCss.includes(`.${contract}`)) throw new Error(`Nico media style missing: ${contract}`);
}
if (!tests.includes("without a network response") || !tests.includes("distinct sharp SVG silhouettes")) throw new Error("Local media regression coverage is incomplete");

console.log("Local media validation passed for the supplied Nico photo body with local clothing layers and fallback, offline wildlife art, distinct dinosaur SVGs, scoped recovery, and completed world modules.");
