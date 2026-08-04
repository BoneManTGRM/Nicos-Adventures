import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/nico/wardrobe/catalog.ts",
  "src/nico/wardrobe/wardrobeSvg.ts",
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
const renderer = read("src/nico/wardrobe/wardrobeSvg.ts");
const reducer = read("src/nico/wardrobe/wardrobeReducer.ts");
const drag = read("src/nico/wardrobe/useWardrobeDrag.ts");
const character = read("src/nico/wardrobe/NicoLayeredCharacter.tsx");
const studio = read("src/nico/wardrobe/WardrobeStudio.tsx");
const dressUp = read("src/nico/NicoDressUp.tsx");
const figure = read("src/nico/NicoCostumeFigure.tsx");
const guide = read("src/NicoGuide.tsx");
const portal = read("src/nico/NicoPortalArt.tsx");
const clubhouse = read("src/nico/NicoWorldExperience.tsx");
const askNico = read("src/nico/AskNico.tsx");
const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const css = read("src/nico/wardrobe/wardrobe.css");
const tests = read("src/nico/wardrobe/wardrobe.test.tsx");

for (const slot of ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"]) {
  if (!types.includes(`| "${slot}"`) && !types.includes(`${slot}: string | null`)) {
    throw new Error(`Wardrobe slot is missing from schema v4: ${slot}`);
  }
  if (!catalog.includes(`"${slot}"`)) throw new Error(`Wardrobe catalog has no items for slot: ${slot}`);
}

const professions = [
  "explorer", "astronaut", "doctor", "scientist", "engineer", "builder", "veterinarian", "dinosaur", "suit",
  "firefighter", "chef", "artist", "pilot", "gardener", "teacher", "dentist", "police-officer", "zookeeper",
  "musician", "farmer", "lifeguard", "magician", "soccer-player", "tennis-player", "detective", "librarian",
];
for (const profession of professions) {
  const unquoted = `${profession}: preset(`;
  const quoted = `"${profession}": preset(`;
  if (!catalog.includes(unquoted) && !catalog.includes(quoted)) throw new Error(`Layered profession preset is missing: ${profession}`);
}
if (!catalog.includes("WARDROBE_ITEM_BY_ID") || !catalog.includes("wardrobeForPreset") || !catalog.includes("itemsForSlot")) {
  throw new Error("Wardrobe catalog lookup or preset APIs are incomplete");
}

if (!renderer.includes('data-nico-body="true"') || !renderer.includes("slotsInPaintOrder") || !renderer.includes("buildGarmentSvg")) {
  throw new Error("The vector renderer does not separate one body from independent garment layers");
}
if (!renderer.includes("loadNicoWardrobeImage") || !renderer.includes("wardrobeSvgDataUrl")) {
  throw new Error("The shared on-screen and canvas wardrobe renderer is incomplete");
}
if (!reducer.includes('type: "equip"') || !reducer.includes('type: "remove"') || !reducer.includes('type: "undo"') || !reducer.includes('type: "redo"') || !reducer.includes('type: "randomize"')) {
  throw new Error("Wardrobe edit history is incomplete");
}
if (!drag.includes("setPointerCapture") || !drag.includes("elementFromPoint") || !drag.includes("data-nico-wardrobe-stage")) {
  throw new Error("Pointer/touch wardrobe drag hit-testing is incomplete");
}
if (!character.includes('data-layered-nico="true"') || !character.includes("highlightedSlot")) {
  throw new Error("The reusable layered character or slot highlighting is incomplete");
}
if (!studio.includes("GarmentThumbnail") || !studio.includes("EquippedGarmentList") || !studio.includes("wardrobeReducer") || !studio.includes("useWardrobeDrag")) {
  throw new Error("Wardrobe Studio does not expose independent garment interaction");
}
for (const behavior of ["undo", "redo", "randomize", "reset", "preset", "equip", "remove"]) {
  if (!studio.toLowerCase().includes(behavior)) throw new Error(`Wardrobe Studio behavior is missing: ${behavior}`);
}
if (!studio.includes("onPointerDown") || !studio.includes("onPointerMove") || !studio.includes("onPointerUp")) {
  throw new Error("Wardrobe garment controls do not support pointer and touch dragging");
}
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("approvedOutfitStyle") || dressUp.includes("nicoOutfitSpriteStyle")) {
  throw new Error("NicoDressUp still uses flattened outfit images instead of the wardrobe studio");
}
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) {
  throw new Error("Shared Nico surfaces are not using the layered renderer");
}

for (const [name, source] of [["guide", guide], ["portal", portal], ["clubhouse", clubhouse], ["Ask Nico", askNico], ["Showtime", showtime]]) {
  if (!source.includes("wardrobe")) throw new Error(`${name} does not receive the saved wardrobe`);
}
if (!showtime.includes("composeNicoImage(profile.nico.wardrobe)") || !showtime.includes("wardrobe={profile.nico.wardrobe}")) {
  throw new Error("Showtime live and recorded Nico output are not using the same wardrobe");
}
if (!compositor.includes("loadNicoWardrobeImage") || compositor.includes("getNicoOutfitCell")) {
  throw new Error("Showtime still uses the legacy outfit sprite compositor");
}
if (clubhouse.includes("useNicoDragArt") || clubhouse.includes("nicoBaseSource=") || clubhouse.includes("nicoOutfitSource=")) {
  throw new Error("Clubhouse still loads or passes the legacy Nico sprite pipeline");
}

for (const cssContract of [
  "nico-layered-character__slot--headwear", "nico-layered-character__slot--top", "nico-layered-character__slot--shoes",
  "wardrobe-drag-ghost", "wardrobe-garment-grid", "touch-action:none", "prefers-reduced-motion",
]) {
  if (!css.includes(cssContract)) throw new Error(`Layered wardrobe style contract is missing: ${cssContract}`);
}
for (const testContract of [
  "one body plus independent selected garment layers",
  "dragged garment without the Nico body",
  "equips one slot without replacing the other clothes",
  "supports remove, undo, and redo",
  "applies a preset and remains editable piece by piece",
  "legacy wardrobe compatibility",
]) {
  if (!tests.includes(testContract)) throw new Error(`Layered wardrobe regression test is missing: ${testContract}`);
}

for (const [name, source] of [["catalog", catalog], ["reducer", reducer], ["drag", drag], ["character", character], ["studio", studio]]) {
  if (source.includes("fetch(") || source.includes("XMLHttpRequest") || source.includes("WebSocket")) {
    throw new Error(`Layered wardrobe ${name} must not call an external service`);
  }
}

console.log(`Layered wardrobe validation passed for one body, nine independent slots, ${professions.length} editable profession presets, pointer/touch drag, undo/redo, synchronized surfaces, and recorded Showtime output.`);
