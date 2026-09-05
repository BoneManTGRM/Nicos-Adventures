import wildlifeAtlasSource from "../assets/art/wildlife-premium-clean-atlas.webp";
import arcticFoxSource from "../assets/art/arctic-fox-premium-v2.webp";
import polarBearSource from "../assets/art/polar-bear-premium-v2.webp";
import { loadPremiumCutout } from "./artCutout";

export const WILDLIFE_IDS = [
  "jaguar", "toucan", "sloth", "poison-dart-frog", "blue-whale", "giant-pacific-octopus", "sea-turtle", "manta-ray",
  "lion", "african-elephant", "giraffe", "meerkat", "polar-bear", "arctic-fox", "emperor-penguin", "walrus",
  "fennec-fox", "camel", "roadrunner", "gila-monster", "red-panda", "flying-squirrel", "great-horned-owl", "beaver",
  "axolotl", "capybara", "flamingo", "platypus", "snow-leopard", "mountain-goat", "andean-condor", "yak",
] as const;
const wildlifeIndex = new Map<string, number>(WILDLIFE_IDS.map((id, index) => [id, index]));
const COLUMNS = 8;
const ROWS = 4;
export const PREMIUM_WILDLIFE_REPLACEMENTS = Object.freeze({
  "polar-bear": polarBearSource,
  "arctic-fox": arcticFoxSource,
});
let composedAtlas: Promise<HTMLCanvasElement> | null = null;
function replaceCell(atlas: HTMLCanvasElement, animalId: string, source: HTMLCanvasElement): void {
  const index = wildlifeIndex.get(animalId);
  const context = atlas.getContext("2d");
  if (index === undefined || !context) return;
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const cellWidth = atlas.width / COLUMNS;
  const cellHeight = atlas.height / ROWS;
  const padding = cellWidth * .04;
  const scale = Math.min((cellWidth - padding * 2) / source.width, (cellHeight - padding * 2) / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  const x = column * cellWidth + (cellWidth - width) / 2;
  const y = row * cellHeight + (cellHeight - height) / 2;
  context.clearRect(column * cellWidth, row * cellHeight, cellWidth, cellHeight);
  context.drawImage(source, x, y, width, height);
}
export function loadPremiumWildlifeAtlas(): Promise<HTMLCanvasElement> {
  if (composedAtlas) return composedAtlas;
  composedAtlas = Promise.all([
    loadPremiumCutout(wildlifeAtlasSource),
    loadPremiumCutout(PREMIUM_WILDLIFE_REPLACEMENTS["polar-bear"]),
    loadPremiumCutout(PREMIUM_WILDLIFE_REPLACEMENTS["arctic-fox"]),
  ]).then(([atlas, polarBear, arcticFox]) => {
    replaceCell(atlas, "polar-bear", polarBear);
    replaceCell(atlas, "arctic-fox", arcticFox);
    return atlas;
  }).catch((error: unknown) => {
    composedAtlas = null;
    throw error;
  });
  return composedAtlas;
}
export function drawWildlifeCell(context: CanvasRenderingContext2D, atlas: HTMLCanvasElement,
  animalId: string, destinationX: number, destinationY: number, destinationSize: number): void {
  const index = wildlifeIndex.get(animalId) ?? 0;
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const sourceWidth = atlas.width / COLUMNS;
  const sourceHeight = atlas.height / ROWS;
  const padding = destinationSize * .035;
  context.drawImage(atlas,column * sourceWidth,row * sourceHeight,sourceWidth,sourceHeight,
    destinationX + padding,destinationY + padding,destinationSize - padding * 2,destinationSize - padding * 2);
}
