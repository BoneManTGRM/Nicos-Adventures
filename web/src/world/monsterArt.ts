import type { CSSProperties } from "react";
import alienBody from "../assets/monsters/reference/alien.webp";
import aquaticBody from "../assets/monsters/reference/aquatic.webp";
import blobBody from "../assets/monsters/reference/blob.webp";
import candyBody from "../assets/monsters/reference/candy.webp";
import cloudBody from "../assets/monsters/reference/cloud.webp";
import cosmicBody from "../assets/monsters/reference/cosmic.webp";
import dinosaurBody from "../assets/monsters/reference/dinosaur.webp";
import dragonBody from "../assets/monsters/reference/dragon.webp";
import iceBeastBody from "../assets/monsters/reference/ice-beast.webp";
import jungleBeastBody from "../assets/monsters/reference/jungle-beast.webp";
import lizardAlienBody from "../assets/monsters/reference/lizard-alien.webp";
import mechaBody from "../assets/monsters/reference/mecha.webp";
import royalBody from "../assets/monsters/reference/royal.webp";
import spiritBody from "../assets/monsters/reference/spirit.webp";
import stoneGolemBody from "../assets/monsters/reference/stone-golem.webp";
import volcanoBody from "../assets/monsters/reference/volcano.webp";

const MONSTER_BODY_ART = {
  Blob: blobBody,
  Dragon: dragonBody,
  "Jungle Beast": jungleBeastBody,
  "Stone Golem": stoneGolemBody,
  Spirit: spiritBody,
  Cosmic: cosmicBody,
  Aquatic: aquaticBody,
  Candy: candyBody,
  Mecha: mechaBody,
  Royal: royalBody,
  Volcano: volcanoBody,
  "Ice Beast": iceBeastBody,
  Alien: alienBody,
  "Lizard Alien": lizardAlienBody,
  Dinosaur: dinosaurBody,
  Cloud: cloudBody,
} as const;

export type PremiumMonsterBody = keyof typeof MONSTER_BODY_ART;

export const PREMIUM_MONSTER_BODIES = Object.freeze(Object.keys(MONSTER_BODY_ART) as PremiumMonsterBody[]);

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
  mouth: AccessoryFit;
  horns: AccessoryFit;
  wings: AccessoryFit;
  tail: AccessoryFit;
  core: AccessoryFit;
}>;

const STANDARD_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -118, scale: 0.42 },
  mouth: { x: 0, y: -150, scale: 0.38 },
  horns: { x: 0, y: -60, scale: 0.36 },
  wings: { x: 0, y: 24, scale: 0.6 },
  tail: { x: -12, y: -4, scale: 0.58 },
  core: { x: 0, y: -90, scale: 0.52 },
};

const COMPACT_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -120, scale: 0.38 },
  mouth: { x: 0, y: -154, scale: 0.36 },
  horns: { x: 0, y: -64, scale: 0.32 },
  wings: { x: 0, y: 28, scale: 0.54 },
  tail: { x: -14, y: -2, scale: 0.52 },
  core: { x: 0, y: -88, scale: 0.5 },
};

const TALL_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -126, scale: 0.38 },
  mouth: { x: 0, y: -158, scale: 0.36 },
  horns: { x: 0, y: -68, scale: 0.32 },
  wings: { x: 0, y: 22, scale: 0.56 },
  tail: { x: -14, y: -6, scale: 0.54 },
  core: { x: 0, y: -94, scale: 0.5 },
};

// These atlas cells have different head proportions even though their bodies
// use the same broad sizing families. Keep their permanent faces independent.
const DRAGON_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...TALL_ACCESSORY_LAYOUT,
  face: { x: 0, y: -124, scale: 0.42 },
  mouth: { x: 0, y: -184, scale: 0.36 },
  horns: { x: 0, y: -72, scale: 0.3 },
};

const JUNGLE_BEAST_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -90, scale: 0.62 },
  mouth: { x: 0, y: -145, scale: 0.56 },
};

const STONE_GOLEM_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -145, scale: 0.46 },
  mouth: { x: 0, y: -205, scale: 0.38 },
};

const ROYAL_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -88, scale: 0.6 },
  mouth: { x: 0, y: -158, scale: 0.52 },
  horns: { x: 0, y: 0, scale: 0 },
};

const SPIRIT_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...STANDARD_ACCESSORY_LAYOUT,
  face: { x: 0, y: -98, scale: 0.55 },
  mouth: { x: 0, y: -150, scale: 0.46 },
};

const COSMIC_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...STANDARD_ACCESSORY_LAYOUT,
  face: { x: 0, y: -92, scale: 0.56 },
  mouth: { x: 0, y: -148, scale: 0.48 },
};

const AQUATIC_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...TALL_ACCESSORY_LAYOUT,
  face: { x: 0, y: -104, scale: 0.54 },
  mouth: { x: 0, y: -155, scale: 0.46 },
};

const CANDY_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -92, scale: 0.56 },
  mouth: { x: 0, y: -150, scale: 0.5 },
};

const MECHA_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...TALL_ACCESSORY_LAYOUT,
  face: { x: 0, y: -110, scale: 0.46 },
  mouth: { x: 0, y: -158, scale: 0.42 },
};

const VOLCANO_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -93, scale: 0.58 },
  mouth: { x: 0, y: -150, scale: 0.52 },
};

const ICE_BEAST_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -93, scale: 0.58 },
  mouth: { x: 0, y: -150, scale: 0.52 },
};

const DINOSAUR_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...TALL_ACCESSORY_LAYOUT,
  face: { x: 0, y: -105, scale: 0.56 },
  mouth: { x: 0, y: -158, scale: 0.5 },
};

const CLOUD_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  ...COMPACT_ACCESSORY_LAYOUT,
  face: { x: 0, y: -88, scale: 0.6 },
  mouth: { x: 0, y: -148, scale: 0.48 },
};

// The alien atlas uses a large round head and a narrow torso. Its permanent
// visor and speaker need to fill the head instead of reading as tiny stickers.
const ALIEN_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -105, scale: 0.46 },
  mouth: { x: 0, y: -155, scale: 0.5 },
  horns: { x: 0, y: -72, scale: 0.22 },
  wings: { x: 0, y: 16, scale: 0.46 },
  tail: { x: -18, y: -8, scale: 0.42 },
  core: { x: 0, y: -112, scale: 0.42 },
};

const LIZARD_ALIEN_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: -144, scale: 0.3 },
  mouth: { x: 0, y: -172, scale: 0.3 },
  horns: { x: 0, y: -76, scale: 0.24 },
  wings: { x: 0, y: 2, scale: 0.5 },
  tail: { x: 0, y: 0, scale: 0 },
  core: { x: 0, y: -104, scale: 0.4 },
};

const MONSTER_ACCESSORY_LAYOUTS: Record<PremiumMonsterBody, MonsterAccessoryLayout> = {
  Blob: STANDARD_ACCESSORY_LAYOUT,
  Dragon: DRAGON_ACCESSORY_LAYOUT,
  "Jungle Beast": JUNGLE_BEAST_ACCESSORY_LAYOUT,
  "Stone Golem": STONE_GOLEM_ACCESSORY_LAYOUT,
  Spirit: SPIRIT_ACCESSORY_LAYOUT,
  Cosmic: COSMIC_ACCESSORY_LAYOUT,
  Aquatic: AQUATIC_ACCESSORY_LAYOUT,
  Candy: CANDY_ACCESSORY_LAYOUT,
  Mecha: MECHA_ACCESSORY_LAYOUT,
  Royal: ROYAL_ACCESSORY_LAYOUT,
  Volcano: VOLCANO_ACCESSORY_LAYOUT,
  "Ice Beast": ICE_BEAST_ACCESSORY_LAYOUT,
  Alien: ALIEN_ACCESSORY_LAYOUT,
  "Lizard Alien": LIZARD_ALIEN_ACCESSORY_LAYOUT,
  Dinosaur: DINOSAUR_ACCESSORY_LAYOUT,
  Cloud: CLOUD_ACCESSORY_LAYOUT,
};

export function monsterAccessoryLayout(body: string): MonsterAccessoryLayout {
  return MONSTER_ACCESSORY_LAYOUTS[body as PremiumMonsterBody] ?? STANDARD_ACCESSORY_LAYOUT;
}

const ACCESSORY_ORIGINS = {
  face: [260, 246],
  mouth: [260, 330],
  horns: [260, 158],
  wings: [260, 250],
  tail: [388, 398],
  core: [260, 387],
} as const;

export function monsterAccessoryTransform(part: keyof MonsterAccessoryLayout, fit: AccessoryFit): string {
  const [originX, originY] = ACCESSORY_ORIGINS[part];
  return `translate(${fit.x} ${fit.y}) translate(${originX} ${originY}) scale(${fit.scale}) translate(${-originX} ${-originY})`;
}

export function monsterBodyArtStyle(body: string, color: string, _arms = "Tiny arms"): CSSProperties {
  const artwork = MONSTER_BODY_ART[body as PremiumMonsterBody] ?? MONSTER_BODY_ART.Blob;
  return {
    "--monster-body-image": `url("${artwork}")`,
    "--monster-body-position": "center",
    "--monster-body-size": "contain",
    "--monster-body-aspect": "1",
    "--monster-body-width": "100%",
    "--monster-body-color": color,
  } as CSSProperties;
}
