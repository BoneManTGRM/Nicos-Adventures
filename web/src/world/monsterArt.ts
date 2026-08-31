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
