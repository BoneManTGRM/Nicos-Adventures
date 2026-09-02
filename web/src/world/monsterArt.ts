import type { CSSProperties } from "react";
import approvedMonsterRow1 from "../assets/monsters/reference/reference-monsters-row-1.webp";
import approvedMonsterRow2 from "../assets/monsters/reference/reference-monsters-row-2.webp";
import approvedMonsterRow3 from "../assets/monsters/reference/reference-monsters-row-3.webp";
import approvedMonsterRow4 from "../assets/monsters/reference/reference-monsters-row-4.webp";

export const PREMIUM_MONSTER_BODIES = [
  "Blob",
  "Dragon",
  "Jungle Beast",
  "Stone Golem",
  "Spirit",
  "Cosmic",
  "Aquatic",
  "Candy",
  "Mecha",
  "Royal",
  "Volcano",
  "Ice Beast",
  "Alien",
  "Lizard Alien",
  "Dinosaur",
  "Cloud",
] as const;

export type PremiumMonsterBody = typeof PREMIUM_MONSTER_BODIES[number];

export type MonsterBodyArtSpec = Readonly<{
  image: string;
  portraitImage: string;
  position: string;
  size: string;
  aspect: string;
  width: string;
  source: "approved-user-reference";
}>;

const BODY_POSITIONS = ["0% 50%", "33.333333% 50%", "66.666667% 50%", "100% 50%"] as const;

function approvedBody(image: string, column: 0 | 1 | 2 | 3): MonsterBodyArtSpec {
  return {
    image,
    portraitImage: image,
    position: BODY_POSITIONS[column],
    size: "400% 100%",
    aspect: "1 / 1",
    width: "100%",
    source: "approved-user-reference",
  };
}

export const MONSTER_BODY_ART = {
  Blob: approvedBody(approvedMonsterRow1, 0),
  Dragon: approvedBody(approvedMonsterRow1, 1),
  "Jungle Beast": approvedBody(approvedMonsterRow1, 2),
  "Stone Golem": approvedBody(approvedMonsterRow1, 3),
  Spirit: approvedBody(approvedMonsterRow2, 0),
  Cosmic: approvedBody(approvedMonsterRow2, 1),
  Aquatic: approvedBody(approvedMonsterRow2, 2),
  Candy: approvedBody(approvedMonsterRow2, 3),
  Mecha: approvedBody(approvedMonsterRow3, 0),
  Royal: approvedBody(approvedMonsterRow3, 1),
  Volcano: approvedBody(approvedMonsterRow3, 2),
  "Ice Beast": approvedBody(approvedMonsterRow3, 3),
  Alien: approvedBody(approvedMonsterRow4, 0),
  "Lizard Alien": approvedBody(approvedMonsterRow4, 1),
  Dinosaur: approvedBody(approvedMonsterRow4, 2),
  Cloud: approvedBody(approvedMonsterRow4, 3),
} as const satisfies Record<PremiumMonsterBody, MonsterBodyArtSpec>;

const DEFAULT_BODY_ART = MONSTER_BODY_ART.Blob;

export function monsterBodyArt(body: string): MonsterBodyArtSpec {
  return MONSTER_BODY_ART[body as PremiumMonsterBody] ?? DEFAULT_BODY_ART;
}

export const PREMIUM_ALIEN_ARMS = ["Tiny arms", "Claw arms", "Tentacle arms", "Robot arms"] as const;
export type PremiumAlienArms = typeof PREMIUM_ALIEN_ARMS[number];

export type MonsterAlienArmArtSpec = Readonly<{
  image: string;
  position: string;
  size: string;
  aspect: string;
  width: string;
}>;

export const MONSTER_ALIEN_ARM_ART = {
  "Tiny arms": { image: approvedMonsterRow4, position: BODY_POSITIONS[0], size: "400% 100%", aspect: "1 / 1", width: "100%" },
  "Claw arms": { image: approvedMonsterRow4, position: BODY_POSITIONS[0], size: "400% 100%", aspect: "1 / 1", width: "100%" },
  "Tentacle arms": { image: approvedMonsterRow4, position: BODY_POSITIONS[0], size: "400% 100%", aspect: "1 / 1", width: "100%" },
  "Robot arms": { image: approvedMonsterRow4, position: BODY_POSITIONS[0], size: "400% 100%", aspect: "1 / 1", width: "100%" },
} as const satisfies Record<PremiumAlienArms, MonsterAlienArmArtSpec>;

const DEFAULT_ALIEN_ARM_ART = MONSTER_ALIEN_ARM_ART["Tiny arms"];

export function monsterAlienArmArt(arms: string): MonsterAlienArmArtSpec {
  return MONSTER_ALIEN_ARM_ART[arms as PremiumAlienArms] ?? DEFAULT_ALIEN_ARM_ART;
}

export type MonsterAccessoryPlacement = Readonly<{
  x: number;
  y: number;
  scale: number;
  rotate?: number;
}>;

export type MonsterAccessoryLayout = Readonly<{
  face: MonsterAccessoryPlacement;
  mouth: MonsterAccessoryPlacement;
  core: MonsterAccessoryPlacement;
  horns: MonsterAccessoryPlacement;
  wings: MonsterAccessoryPlacement;
  tail: MonsterAccessoryPlacement;
}>;

const DEFAULT_ACCESSORY_LAYOUT: MonsterAccessoryLayout = {
  face: { x: 0, y: 0, scale: 1 },
  mouth: { x: 0, y: 0, scale: 1 },
  core: { x: 0, y: 0, scale: 1 },
  horns: { x: 0, y: 0, scale: 1 },
  wings: { x: 0, y: 0, scale: 1 },
  tail: { x: 0, y: 0, scale: 1 },
};

export const MONSTER_ACCESSORY_LAYOUT = Object.fromEntries(
  PREMIUM_MONSTER_BODIES.map((body) => [body, DEFAULT_ACCESSORY_LAYOUT]),
) as Record<PremiumMonsterBody, MonsterAccessoryLayout>;

export type MonsterAccessoryKind = keyof MonsterAccessoryLayout;

export function monsterAccessoryLayout(body: string): MonsterAccessoryLayout {
  return MONSTER_ACCESSORY_LAYOUT[body as PremiumMonsterBody] ?? DEFAULT_ACCESSORY_LAYOUT;
}

export function monsterAccessoryTransform(
  kind: MonsterAccessoryKind,
  placement: MonsterAccessoryPlacement,
): string {
  const anchors: Record<MonsterAccessoryKind, Readonly<{ x: number; y: number }>> = {
    face: { x: 260, y: 226 },
    mouth: { x: 260, y: 322 },
    core: { x: 260, y: 387 },
    horns: { x: 260, y: 160 },
    wings: { x: 260, y: 270 },
    tail: { x: 380, y: 390 },
  };
  const anchor = anchors[kind];
  const rotation = placement.rotate ?? 0;
  return [
    `translate(${placement.x} ${placement.y})`,
    `translate(${anchor.x} ${anchor.y})`,
    `rotate(${rotation})`,
    `scale(${placement.scale})`,
    `translate(${-anchor.x} ${-anchor.y})`,
  ].join(" ");
}

export function monsterBodyArtStyle(
  body: string,
  color: string,
  _arms = "Tiny arms",
): CSSProperties {
  const art = monsterBodyArt(body);
  return {
    "--monster-body-image": `url(${art.image})`,
    "--monster-portrait-image": `url(${art.portraitImage})`,
    "--monster-body-position": art.position,
    "--monster-body-size": art.size,
    "--monster-body-aspect": art.aspect,
    "--monster-body-width": art.width,
    "--monster-body-color": color,
    "--monster-reference-source": art.source,
  } as CSSProperties;
}
