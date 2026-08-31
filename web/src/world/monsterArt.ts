import type { CSSProperties } from "react";
import alienArmsAtlas from "../assets/monsters/premium-alien-arms-atlas.webp";
import monsterBodiesAtlas from "../assets/monsters/premium-monster-bodies-atlas.webp";

const MONSTER_BODY_CELLS = {
  Blob: { column: 0, row: 0 },
  Dragon: { column: 1, row: 0 },
  "Jungle Beast": { column: 2, row: 0 },
  "Stone Golem": { column: 3, row: 0 },
  Spirit: { column: 4, row: 0 },
  Cosmic: { column: 0, row: 1 },
  Aquatic: { column: 1, row: 1 },
  Candy: { column: 2, row: 1 },
  Mecha: { column: 3, row: 1 },
  Royal: { column: 4, row: 1 },
  Volcano: { column: 0, row: 2 },
  "Ice Beast": { column: 1, row: 2 },
  Alien: { column: 2, row: 2 },
  Dinosaur: { column: 3, row: 2 },
  Cloud: { column: 4, row: 2 },
} as const;

export type PremiumMonsterBody = keyof typeof MONSTER_BODY_CELLS;

export const PREMIUM_MONSTER_BODIES = Object.freeze(Object.keys(MONSTER_BODY_CELLS) as PremiumMonsterBody[]);

const ALIEN_ARM_CELLS = {
  "Tiny arms": { column: 0, row: 0 },
  "Claw arms": { column: 1, row: 0 },
  "Four arms": { column: 2, row: 0 },
  Tentacles: { column: 3, row: 0 },
  "Giant hands": { column: 0, row: 1 },
  "Robot arms": { column: 1, row: 1 },
  "Wing arms": { column: 2, row: 1 },
} as const;

export type PremiumAlienArms = keyof typeof ALIEN_ARM_CELLS;

export const PREMIUM_ALIEN_ARMS = Object.freeze(Object.keys(ALIEN_ARM_CELLS) as PremiumAlienArms[]);

type AccessoryFit = Readonly<{ x: number; y: number; scale: number }>;

export type MonsterAccessoryLayout = Readonly<{
  face: AccessoryFit;
  horns: AccessoryFit;
  wings: AccessoryFit;
  tail: AccessoryFit;
  core: AccessoryFit;
}>;

const STANDARD_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -88, scale: 0.72 },
  horns: { x: 0, y: -4, scale: 0.6 },
  wings: { x: 0, y: 26, scale: 0.72 },
  tail: { x: -10, y: -4, scale: 0.68 },
  core: { x: 0, y: -66, scale: 0.72 },
};

const COMPACT_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -88, scale: 0.64 },
  horns: { x: 0, y: 0, scale: 0.54 },
  wings: { x: 0, y: 30, scale: 0.62 },
  tail: { x: -12, y: -2, scale: 0.6 },
  core: { x: 0, y: -64, scale: 0.64 },
};

const TALL_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -92, scale: 0.66 },
  horns: { x: 0, y: -8, scale: 0.55 },
  wings: { x: 0, y: 24, scale: 0.66 },
  tail: { x: -12, y: -6, scale: 0.63 },
  core: { x: 0, y: -70, scale: 0.66 },
};

const MONSTER_ACCESSORY_LAYOUTS: Record<PremiumMonsterBody, MonsterAccessoryLayout> = {
  Blob: STANDARD_ACCESSORY_LAYOUT,
  Dragon: TALL_ACCESSORY_LAYOUT,
  "Jungle Beast": COMPACT_ACCESSORY_LAYOUT,
  "Stone Golem": COMPACT_ACCESSORY_LAYOUT,
  Spirit: STANDARD_ACCESSORY_LAYOUT,
  Cosmic: STANDARD_ACCESSORY_LAYOUT,
  Aquatic: TALL_ACCESSORY_LAYOUT,
  Candy: COMPACT_ACCESSORY_LAYOUT,
  Mecha: TALL_ACCESSORY_LAYOUT,
  Royal: COMPACT_ACCESSORY_LAYOUT,
  Volcano: COMPACT_ACCESSORY_LAYOUT,
  "Ice Beast": COMPACT_ACCESSORY_LAYOUT,
  Alien: TALL_ACCESSORY_LAYOUT,
  Dinosaur: TALL_ACCESSORY_LAYOUT,
  Cloud: COMPACT_ACCESSORY_LAYOUT,
};

export function monsterAccessoryLayout(body: string): MonsterAccessoryLayout {
  return MONSTER_ACCESSORY_LAYOUTS[body as PremiumMonsterBody] ?? STANDARD_ACCESSORY_LAYOUT;
}

const ACCESSORY_ORIGINS = {
  face: [260, 246],
  horns: [260, 158],
  wings: [260, 250],
  tail: [388, 398],
  core: [260, 387],
} as const;

export function monsterAccessoryTransform(part: keyof MonsterAccessoryLayout, fit: AccessoryFit): string {
  const [originX, originY] = ACCESSORY_ORIGINS[part];
  return `translate(${fit.x} ${fit.y}) translate(${originX} ${originY}) scale(${fit.scale}) translate(${-originX} ${-originY})`;
}

export function monsterBodyArtStyle(body: string, color: string, arms = "Tiny arms"): CSSProperties {
  if (body === "Alien") {
    const cell = ALIEN_ARM_CELLS[arms as PremiumAlienArms] ?? ALIEN_ARM_CELLS["Tiny arms"];
    return {
      "--monster-body-image": `url("${alienArmsAtlas}")`,
      "--monster-body-position": `${cell.column * (100 / 3)}% ${cell.row * 100}%`,
      "--monster-body-size": "400% 200%",
      "--monster-body-aspect": "1",
      "--monster-body-color": color,
    } as CSSProperties;
  }

  const cell = MONSTER_BODY_CELLS[body as PremiumMonsterBody] ?? MONSTER_BODY_CELLS.Blob;
  return {
    "--monster-body-image": `url("${monsterBodiesAtlas}")`,
    "--monster-body-position": `${cell.column * 25}% ${cell.row * 50}%`,
    "--monster-body-size": "500% 300%",
    "--monster-body-aspect": "9 / 10",
    "--monster-body-color": color,
  } as CSSProperties;
}
