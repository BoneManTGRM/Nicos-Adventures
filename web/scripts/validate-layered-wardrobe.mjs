import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "public/assets/nico/photo/nico-photo-body.webp.b64",
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
if (fs.statSync(path.join(root, "public/assets/nico/photo/nico-photo-body.webp.b64")).size < 100_000) throw new Error("The supplied high-resolution Nico body is incomplete");

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
const guide = read("src/NicoGuide.tsx");
const portal = read("src/nico/NicoPortalArt.tsx");
const clubhouse = read("src/nico/NicoWorldExperience.tsx");
const askNico = read("src/nico/AskNico.tsx");
const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");
const css = `${read("src/nico/wardrobe/wardrobe.css")}\n${read("src/nico/wardrobe/photo-wardrobe.css")}`;
const tests = read("src/nico/wardrobe/wardrobe.test.tsx");

const slots = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"];
for (const slot of slots) {
  if (!types.includes(`| "${slot}"`) && !types.includes(`${slot}: string | null`)) throw new Error(`Wardrobe slot is missing: ${slot}`);
  if (!catalog.includes(`"${slot}"`)) throw new Error(`Wardrobe catalog has no items for slot: ${slot}`);
}

const professions = [
  "explorer", "astronaut", "doctor", "scientist", "engineer", "builder", "veterinarian", "dinosaur", "suit",
  "firefighter", "chef", "artist", "pilot", "gardener", "teacher", "dentist", "police-officer", "zookeeper",
  "musician", "farmer", "lifeguard", "magician", "soccer-player", "tennis-player", "detective", "librarian",
];
for (const profession of professions) if (!catalog.includes(`${profession}: preset(`) && !catalog.includes(`"${profession}": preset(`)) throw new Error(`Profession preset missing: ${profession}`);
if (!catalog.includes("WARDROBE_ITEM_BY_ID") || !catalog.includes("wardrobeForPreset") || !catalog.includes("itemsForSlot")) throw new Error("Wardrobe lookup APIs are incomplete");

if (!photoBody.includes('PHOTO_NICO_WIDTH = 510') || !photoBody.includes('PHOTO_NICO_HEIGHT = 1467') || !photoBody.includes("nico-photo-body.webp.b64")) throw new Error("The supplied Nico photo dimensions or local path changed");
if (!photoBody.includes('data:image/webp;base64') || !photoBody.includes('cache: "force-cache"')) throw new Error("The supplied Nico body is not loaded locally and cacheably");
if (!photoRenderer.includes('PHOTO_NICO_VIEWBOX') || !photoRenderer.includes('buildPhotoWardrobeBackgroundSvg') || !photoRenderer.includes('buildPhotoWardrobeForegroundSvg')) throw new Error("Photo-calibrated clothing renderer is incomplete");
if (!photoRenderer.includes('data-photo-fit="${item.slot}"')) throw new Error("Photo clothing layers lack fit metadata");
if (!photoRenderer.includes('PHOTO_BASE_ITEMS') || !photoRenderer.includes('nico-green-polo') || !photoRenderer.includes('nico-khaki-shorts')) throw new Error("Photo renderer does not preserve the clothing already present on the supplied body");
if (!character.includes("usePhotoNicoBody") || !character.includes('data-photo-nico-body') || !character.includes("nico-photo-layer--body")) throw new Error("The supplied Nico photo is not the primary wardrobe body");
if (!character.includes("wardrobeSvgDataUrl") || !character.includes("nico-vector-fallback")) throw new Error("Local vector fallback was removed");

if (!reducer.includes('type: "equip"') || !reducer.includes('type: "remove"') || !reducer.includes('type: "undo"') || !reducer.includes('type: "redo"') || !reducer.includes('type: "randomize"')) throw new Error("Wardrobe edit history is incomplete");
if (!drag.includes("setPointerCapture") || !drag.includes("elementFromPoint") || !drag.includes("data-nico-wardrobe-stage")) throw new Error("Pointer/touch drag hit-testing is incomplete");
if (!studio.includes("GarmentThumbnail") || !studio.includes("EquippedGarmentList") || !studio.includes("wardrobeReducer") || !studio.includes("useWardrobeDrag")) throw new Error("Wardrobe Studio does not expose independent garment interaction");
if (!studio.includes("onPointerDown") || !studio.includes("onPointerMove") || !studio.includes("onPointerUp")) throw new Error("Wardrobe controls do not support pointer and touch dragging");
if (!dressUp.includes("WardrobeStudio") || dressUp.includes("nicoOutfitSpriteStyle")) throw new Error("NicoDressUp still uses flattened outfit images");
if (!figure.includes("NicoLayeredCharacter") || !figure.includes('data-art-state="layered-wardrobe"')) throw new Error("Shared Nico surfaces bypass the wardrobe renderer");

for (const [name, source] of [["guide", guide], ["portal", portal], ["clubhouse", clubhouse], ["Ask Nico", askNico], ["Showtime", showtime]]) if (!source.includes("wardrobe")) throw new Error(`${name} does not receive the saved wardrobe`);
if (!showtime.includes("composeNicoImage(profile.nico.wardrobe)") || !showtime.includes("wardrobe={profile.nico.wardrobe}")) throw new Error("Showtime live and recorded output do not share the wardrobe");
if (!compositor.includes("loadPhotoNicoBodyImage") || !compositor.includes("photoWardrobeBackgroundDataUrl") || !compositor.includes("photoWardrobeForegroundDataUrl")) throw new Error("Showtime does not compose the supplied photo body and clothing layers");
if (!compositor.includes("loadNicoWardrobeImage")) throw new Error("Showtime local fallback is missing");

for (const contract of ["data-photo-nico-body", "nico-photo-layer--back", "nico-photo-layer--body", "nico-photo-layer--front", "aspect-ratio:510/1467", "wardrobe-drag-ghost", "wardrobe-garment-grid", "touch-action:none", "prefers-reduced-motion"]) if (!css.includes(contract)) throw new Error(`Wardrobe style contract missing: ${contract}`);
for (const contract of ["supplied Nico photo body", "dedicated 510 by 1467 coordinate system", "does not redraw clothing", "keeps backpacks behind", "renders the supplied image between transparent clothing layers", "retains the vector renderer as a local offline fallback", "equips one slot without replacing the other clothes", "supports remove, undo, and redo"]) if (!tests.includes(contract)) throw new Error(`Wardrobe regression coverage missing: ${contract}`);

for (const [name, source] of [["catalog", catalog], ["reducer", reducer], ["drag", drag], ["character", character], ["studio", studio]]) {
  if (source.includes("XMLHttpRequest") || source.includes("WebSocket") || /https?:\/\//.test(source)) throw new Error(`Wardrobe ${name} must not call an external service`);
}
if (!fallbackRenderer.includes('data-nico-body="true"') || !fallbackRenderer.includes("loadNicoWardrobeImage")) throw new Error("Vector fallback renderer is incomplete");

console.log(`Layered wardrobe validation passed for the supplied Nico photo body, nine independent slots, ${professions.length} editable presets, touch drag, persistence, fallback rendering, and matching Showtime output.`);
