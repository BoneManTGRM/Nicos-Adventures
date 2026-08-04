import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const photoParts = Array.from({ length: 6 }, (_, index) => `public/assets/nico/photo/nico-photo-body.part${index + 1}.b64`);
const requiredFiles = [
  ...photoParts,
  "scripts/validate-nico-photo-asset.mjs",
  "src/nico/wardrobe/catalog.ts",
  "src/nico/wardrobe/wardrobeSvg.ts",
  "src/nico/wardrobe/photoNicoBody.ts",
  "src/nico/wardrobe/photoWardrobeSvg.ts",
  "src/nico/wardrobe/photo-wardrobe.css",
  "src/nico/wardrobe/wardrobeReducer.ts",
  "src/nico/wardrobe/useWardrobeDrag.ts",
  "src/nico/wardrobe/NicoLayeredCharacter.tsx",
  "src/nico/wardrobe/WardrobeStudio.tsx",
  "src/nico/wardrobe/wardrobeCompatibility.ts",
  "src/nico/wardrobe/wardrobe.css",
  "src/nico/wardrobe/wardrobe.test.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/NicoCostumeFigure.tsx",
  "src/showtime/composeNicoImage.ts",
  "src/showtime/ShowtimeStudio.tsx",
];

for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing layered wardrobe file: ${relative}`);
}

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const types = read("src/types.ts");
const catalog = read("src/nico/wardrobe/catalog.ts");
const fallbackRenderer = read("src/nico/wardrobe/wardrobeSvg.ts");
const photoBody = read("src/nico/wardrobe/photoNicoBody.ts");
const photoRenderer = read("src/nico/wardrobe/photoWardrobeSvg.ts");
const reducer = read("src/nico/wardrobe/wardrobeReducer.ts");
const drag = read("src/nico/wardrobe/useWardrobeDrag.ts");
const character = read("src/nico/wardrobe/NicoLayeredCharacter.tsx");
const studio = read("src/nico/wardrobe/WardrobeStudio.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
const figure = read("src/nico/NicoCostumeFigure.tsx");
const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const css = `${read("src/nico/wardrobe/wardrobe.css")}\n${read("src/nico/wardrobe/photo-wardrobe.css")}`;
const tests = read("src/nico/wardrobe/wardrobe.test.tsx");

const slots = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"];
for (const slot of slots) {
  if (!types.includes(`${slot}: string | null`) && !types.includes(`| "${slot}"`)) throw new Error(`Wardrobe slot is missing: ${slot}`);
  if (!catalog.includes(`"${slot}"`)) throw new Error(`Wardrobe catalog lacks slot: ${slot}`);
}

const professions = [
  "explorer", "astronaut", "doctor", "scientist", "engineer", "builder", "veterinarian", "dinosaur", "suit",
  "firefighter", "chef", "artist", "pilot", "gardener", "teacher", "dentist", "police-officer", "zookeeper",
  "musician", "farmer", "lifeguard", "magician", "soccer-player", "tennis-player", "detective", "librarian",
];
for (const profession of professions) {
  if (!catalog.includes(`${profession}: preset(`) && !catalog.includes(`"${profession}": preset(`)) throw new Error(`Profession preset missing: ${profession}`);
}

for (const contract of ["PHOTO_NICO_BODY_PATHS", "part1.b64", "part6.b64", "Promise.all", "PHOTO_NICO_WIDTH = 510", "PHOTO_NICO_HEIGHT = 1467", "data:image/webp;base64"]) {
  if (!photoBody.includes(contract)) throw new Error(`Photo-body loader contract missing: ${contract}`);
}
for (const contract of ["PHOTO_NICO_VIEWBOX", "buildPhotoWardrobeBackgroundSvg", "buildPhotoWardrobeForegroundSvg", 'data-photo-fit="${item.slot}"', "PHOTO_BASE_ITEMS"]) {
  if (!photoRenderer.includes(contract)) throw new Error(`Photo wardrobe renderer contract missing: ${contract}`);
}
for (const contract of ["usePhotoNicoBody", "data-photo-nico-body", "nico-photo-layer--back", "nico-photo-layer--body", "nico-photo-layer--front", "nico-vector-fallback"]) {
  if (!character.includes(contract)) throw new Error(`Photo character contract missing: ${contract}`);
}
if (!fallbackRenderer.includes('data-nico-body="true"') || !fallbackRenderer.includes("loadNicoWardrobeImage")) throw new Error("Vector fallback renderer is incomplete");

for (const contract of ['type: "equip"', 'type: "remove"', 'type: "undo"', 'type: "redo"', 'type: "randomize"']) {
  if (!reducer.includes(contract)) throw new Error(`Wardrobe history contract missing: ${contract}`);
}
for (const contract of ["setPointerCapture", "elementFromPoint", "data-nico-wardrobe-stage"]) if (!drag.includes(contract)) throw new Error(`Drag contract missing: ${contract}`);
for (const contract of ["GarmentThumbnail", "EquippedGarmentList", "wardrobeReducer", "useWardrobeDrag", "onPointerDown", "onPointerMove", "onPointerUp"]) {
  if (!studio.includes(contract)) throw new Error(`Wardrobe Studio contract missing: ${contract}`);
}
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("nicoOutfitSpriteStyle")) throw new Error("Dress Up still uses flattened artwork");
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) throw new Error("Shared Nico surfaces bypass the wardrobe renderer");

if (!showtime.includes("composeNicoImage(profile.nico.wardrobe)") || !showtime.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Showtime live and recorded Nico differ");
for (const contract of ["loadPhotoNicoBodyImage", "photoWardrobeBackgroundDataUrl", "photoWardrobeForegroundDataUrl", "loadNicoWardrobeImage"]) {
  if (!compositor.includes(contract)) throw new Error(`Showtime compositor contract missing: ${contract}`);
}

for (const contract of ["data-photo-nico-body", "nico-photo-layer--back", "nico-photo-layer--body", "nico-photo-layer--front", "aspect-ratio:510/1467", "wardrobe-drag-ghost", "touch-action:none", "prefers-reduced-motion"]) {
  if (!css.includes(contract)) throw new Error(`Wardrobe style contract missing: ${contract}`);
}
for (const contract of ["supplied Nico photo body", "dedicated 510 by 1467 coordinate system", "does not redraw clothing", "keeps backpacks behind", "renders the supplied image between transparent clothing layers", "retains the vector renderer as a local offline fallback"]) {
  if (!tests.includes(contract)) throw new Error(`Photo wardrobe regression test missing: ${contract}`);
}

console.log(`Layered wardrobe validation passed for the supplied Nico photo body, ${slots.length} independent slots, ${professions.length} editable presets, touch drag, fallback rendering, and matching Showtime output.`);
