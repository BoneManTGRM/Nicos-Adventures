import type { MonsterRecord } from "../types";
import type { MonsterAccessoryLayout, PremiumMonsterBody } from "./monsterArt";

export const MONSTER_FACE_TREATMENTS = {
  Blob: "blob-mischief",
  Dragon: "sculpted-dragon",
  "Jungle Beast": "feral-guardian",
  "Stone Golem": "carved-golem",
  Spirit: "mystic-spirit",
  Cosmic: "cosmic-mask",
  Aquatic: "aqua-creature",
  Candy: "candy-smile",
  Mecha: "mecha-visor",
  Royal: "royal-crest",
  Volcano: "molten-beast",
  "Ice Beast": "frost-beast",
  Alien: "integrated-visor",
  "Lizard Alien": "integrated-lizard",
  Dinosaur: "dino-predator",
  Cloud: "cloud-dreamer",
} as const satisfies Record<PremiumMonsterBody, string>;

export type MonsterFaceTreatment = typeof MONSTER_FACE_TREATMENTS[PremiumMonsterBody];

export const PREMIUM_MONSTER_FACE_BODIES = Object.freeze(
  Object.keys(MONSTER_FACE_TREATMENTS) as PremiumMonsterBody[],
);

export function monsterFaceTreatment(body: string): MonsterFaceTreatment {
  return MONSTER_FACE_TREATMENTS[body as PremiumMonsterBody] ?? MONSTER_FACE_TREATMENTS.Blob;
}

/**
 * Every canonical body now comes directly from the approved reference image,
 * where the permanent face is already painted into the creature.
 */
export function monsterHasIntegratedFace(body: string): boolean {
  return PREMIUM_MONSTER_FACE_BODIES.includes(body as PremiumMonsterBody);
}

type MonsterFaceArtProps = Readonly<{
  body: MonsterRecord["body"] | string;
  monsterId: string;
  color: string;
  layout: MonsterAccessoryLayout;
}>;

/**
 * No generic SVG face is rendered. This prevents the sticker-like eyes and
 * mouths from being pasted over the actual approved monsters.
 */
export function MonsterFaceArt(_props: MonsterFaceArtProps) {
  return null;
}
