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
  context.drawImage(
    atlas,
    column * sourceWidth,
    row * sourceHeight,
    sourceWidth,
    sourceHeight,
    destinationX,
    destinationY,
    destinationSize,
    destinationSize,
  );
}
