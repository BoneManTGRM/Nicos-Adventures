import wildlifeAtlasSource from "../assets/art/wildlife-premium-clean-atlas.webp";
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
  const padding = destinationSize * .035;
  context.save();
  clipPaleWildlife(context, animalId, destinationX, destinationY, destinationSize);
  context.drawImage(
    atlas,
    column * sourceWidth,
    row * sourceHeight,
    sourceWidth,
    sourceHeight,
    destinationX + padding,
    destinationY + padding,
    destinationSize - padding * 2,
    destinationSize - padding * 2,
  );
  context.restore();
}

function clipPaleWildlife(
  context: CanvasRenderingContext2D,
  animalId: string,
  x: number,
  y: number,
  size: number,
): void {
  if (animalId !== "polar-bear" && animalId !== "arctic-fox") return;
  const point = (horizontal: number, vertical: number) => [x + size * horizontal, y + size * vertical] as const;
  const move = (horizontal: number, vertical: number) => context.moveTo(...point(horizontal, vertical));
  const line = (horizontal: number, vertical: number) => context.lineTo(...point(horizontal, vertical));
  const curve = (...values: [number, number, number, number, number, number]) => context.bezierCurveTo(
    ...point(values[0], values[1]),
    ...point(values[2], values[3]),
    ...point(values[4], values[5]),
  );

  context.beginPath();
  if (animalId === "polar-bear") {
    move(.13, .86);
    curve(.18, .75, .16, .60, .23, .51);
    curve(.19, .39, .24, .24, .35, .22);
    curve(.44, .18, .53, .28, .54, .41);
    curve(.66, .39, .78, .44, .82, .54);
    curve(.86, .65, .82, .77, .80, .84);
    curve(.64, .90, .38, .90, .13, .86);
  } else {
    move(.18, .87);
    curve(.25, .75, .25, .62, .31, .54);
    curve(.24, .45, .25, .31, .34, .25);
    line(.42, .14);
    line(.49, .29);
    curve(.57, .27, .63, .36, .60, .49);
    curve(.70, .48, .78, .55, .79, .64);
    curve(.88, .67, .87, .77, .78, .80);
    curve(.62, .88, .39, .90, .18, .87);
  }
  context.closePath();
  context.clip();
}
