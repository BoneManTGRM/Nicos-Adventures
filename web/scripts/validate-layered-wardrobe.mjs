import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const required = [
  "src/nico/NicoCostumeFigure.tsx",
  "src/nico/NicoWorldExperience.tsx",
  "src/nico/NicoDressUp.tsx",
  "src/nico/nicoHubRoute.ts",
  "src/nico/canonicalNicoArt.ts",
  "src/showtime/ShowtimeStudio.tsx",
  "src/showtime/composeNicoImage.ts",
  "src/assets/nico/nico-explorer-atlas.webp",
  "src/assets/nico/nico-professions-atlas.webp",
  "src/assets/nico/nico-professions-community-atlas.webp",
  "src/assets/nico/nico-professions-world-atlas.webp",
  "src/assets/nico/nico-librarian.webp",
];
for (const relative of required) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing canonical Nico file: ${relative}`);
}

const figure = read("src/nico/NicoCostumeFigure.tsx");
const clubhouse = read("src/nico/NicoWorldExperience.tsx");
const wardrobe = read("src/nico/NicoDressUp.tsx");
const route = read("src/nico/nicoHubRoute.ts");
const canonical = read("src/nico/canonicalNicoArt.ts");
const showtime = read("src/showtime/ShowtimeStudio.tsx");
const compositor = read("src/showtime/composeNicoImage.ts");

if (!figure.includes("canonicalNicoPresetArt") || !figure.includes('data-art-state="canonical-2d"') || figure.includes("wardrobeForDisplay")) {
  throw new Error("Shared Nico surfaces are not locked to canonical premium art");
}
if (!clubhouse.includes("NicoDressUp") || !clubhouse.includes('["dress"') || !clubhouse.includes('["ask"')) {
  throw new Error("The premium Wardrobe tab is not exposed in Nico's Clubhouse");
}
if (!wardrobe.includes("NicoCostumeFigure") || !wardrobe.includes("wardrobeForPreset") || wardrobe.includes("NicoLayeredCharacter") || wardrobe.includes("WardrobeStudio")) {
  throw new Error("Wardrobe must use complete premium Nico presets without legacy garment layers");
}
if (!route.includes('NicoHubTab = "ask" | "dress" | "showtime" | "movies"') || !route.includes("ask|dress|showtime|movies")) {
  throw new Error("Nico Clubhouse route does not include the premium Wardrobe");
}
if (!canonical.includes("loadCanonicalNicoImage") || !showtime.includes("composeNicoImage(profile.nico.profession)") || !compositor.includes("loadCanonicalNicoImage")) {
  throw new Error("Showtime is not recording the same canonical Nico art shown on screen");
}
for (const source of [figure, clubhouse, canonical, showtime, compositor]) {
  if (/fetch\(|XMLHttpRequest|WebSocket/.test(source)) throw new Error("Canonical Nico art must remain local and private");
}

console.log("Canonical Nico validation passed: premium art restored, preset-only Wardrobe live, and Showtime synchronized.");
