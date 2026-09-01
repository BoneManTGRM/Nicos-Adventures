import wildlifeAtlasSource from "../assets/art/wildlife-premium-atlas.webp";
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
const boundsCache = new WeakMap<HTMLCanvasElement, Map<number, SourceBounds>>();

type SourceBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function loadPremiumWildlifeAtlas(): Promise<HTMLCanvasElement> {
  return loadPremiumCutout(wildlifeAtlasSource);
}

export function drawWildlifeCell(
  context: CanvasRenderingContext2D,
  atlas: HTMLCanvasElement,
  animalId: string,
  destinationX: number,
  destinationY: number,
  destinationSize: number,
): void {
  const index = wildlifeIndex.get(animalId) ?? 0;
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const sourceWidth = atlas.width / COLUMNS;
  const sourceHeight = atlas.height / ROWS;
  const bounds = wildlifeCellBounds(atlas, index, column, row, sourceWidth, sourceHeight);
  const padding = destinationSize * .055;
  const available = destinationSize - padding * 2;
  const scale = Math.min(available / bounds.width, available / bounds.height);
  const renderedWidth = bounds.width * scale;
  const renderedHeight = bounds.height * scale;
  const renderedX = destinationX + (destinationSize - renderedWidth) / 2;
  const renderedY = destinationY + destinationSize - padding - renderedHeight;
  context.drawImage(
    atlas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    renderedX,
    renderedY,
    renderedWidth,
    renderedHeight,
  );
}

function wildlifeCellBounds(
  atlas: HTMLCanvasElement,
  index: number,
  column: number,
  row: number,
  sourceWidth: number,
  sourceHeight: number,
): SourceBounds {
  let cache = boundsCache.get(atlas);
  if (!cache) {
    cache = new Map();
    boundsCache.set(atlas, cache);
  }
  const cached = cache.get(index);
  if (cached) return cached;

  const startX = Math.round(column * sourceWidth);
  const startY = Math.round(row * sourceHeight);
  const width = Math.max(1, Math.round((column + 1) * sourceWidth) - startX);
  const height = Math.max(1, Math.round((row + 1) * sourceHeight) - startY);
  const context = atlas.getContext("2d", { willReadFrequently: true });
  if (!context) return { x: startX, y: startY, width, height };

  const pixels = context.getImageData(startX, startY, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] < 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  const inset = 2;
  const bounds = maxX < minX || maxY < minY
    ? { x: startX, y: startY, width, height }
    : {
        x: startX + Math.max(0, minX - inset),
        y: startY + Math.max(0, minY - inset),
        width: Math.min(width - Math.max(0, minX - inset), maxX - minX + inset * 2 + 1),
        height: Math.min(height - Math.max(0, minY - inset), maxY - minY + inset * 2 + 1),
      };
  cache.set(index, bounds);
  return bounds;
}
