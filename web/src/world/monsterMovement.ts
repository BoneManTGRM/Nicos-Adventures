import type { PremiumMonsterBody } from "./monsterArt";

export const MONSTER_POSES = [
  "idle",
  "bounce",
  "spin",
  "roar",
  "fly",
  "dance",
  "sleep",
  "celebrate",
] as const;

export type MonsterPose = typeof MONSTER_POSES[number];
export type ActiveMonsterPose = Exclude<MonsterPose, "idle">;

export type MonsterMovementDefinition = Readonly<{
  pose: ActiveMonsterPose;
  icon: string;
  en: string;
  es: string;
  duration: number;
}>;

export const MONSTER_MOVEMENTS: readonly MonsterMovementDefinition[] = Object.freeze([
  { pose: "bounce", icon: "↟", en: "Bounce", es: "Rebotar", duration: 1750 },
  { pose: "spin", icon: "🌀", en: "Spin", es: "Girar", duration: 1850 },
  { pose: "roar", icon: "🔊", en: "Roar", es: "Rugir", duration: 1900 },
  { pose: "fly", icon: "🪽", en: "Fly", es: "Volar", duration: 2150 },
  { pose: "dance", icon: "♫", en: "Dance", es: "Bailar", duration: 2150 },
  { pose: "sleep", icon: "☾", en: "Sleep", es: "Dormir", duration: 2450 },
  { pose: "celebrate", icon: "✦", en: "Celebrate", es: "Celebrar", duration: 2200 },
]);

export type MonsterMotionMass = "light" | "medium" | "heavy";
export type MonsterLocomotion = "ground" | "winged" | "floating" | "swimming" | "slime" | "mechanical";
export type MonsterMotionTemperament = "playful" | "fierce" | "mystic" | "regal" | "tech" | "gentle" | "stoic";

export type MonsterMotionProfile = Readonly<{
  mass: MonsterMotionMass;
  locomotion: MonsterLocomotion;
  temperament: MonsterMotionTemperament;
}>;

export const MONSTER_MOTION_PROFILES = {
  Blob: { mass: "light", locomotion: "slime", temperament: "playful" },
  Dragon: { mass: "medium", locomotion: "winged", temperament: "fierce" },
  "Jungle Beast": { mass: "heavy", locomotion: "ground", temperament: "fierce" },
  "Stone Golem": { mass: "heavy", locomotion: "ground", temperament: "stoic" },
  Spirit: { mass: "light", locomotion: "floating", temperament: "mystic" },
  Cosmic: { mass: "light", locomotion: "floating", temperament: "mystic" },
  Aquatic: { mass: "medium", locomotion: "swimming", temperament: "playful" },
  Candy: { mass: "light", locomotion: "ground", temperament: "playful" },
  Mecha: { mass: "heavy", locomotion: "mechanical", temperament: "tech" },
  Royal: { mass: "medium", locomotion: "ground", temperament: "regal" },
  Volcano: { mass: "heavy", locomotion: "ground", temperament: "fierce" },
  "Ice Beast": { mass: "heavy", locomotion: "ground", temperament: "fierce" },
  Alien: { mass: "light", locomotion: "floating", temperament: "tech" },
  "Lizard Alien": { mass: "heavy", locomotion: "ground", temperament: "fierce" },
  Dinosaur: { mass: "heavy", locomotion: "ground", temperament: "fierce" },
  Cloud: { mass: "light", locomotion: "floating", temperament: "gentle" },
} as const satisfies Record<PremiumMonsterBody, MonsterMotionProfile>;

const DEFAULT_PROFILE: MonsterMotionProfile = MONSTER_MOTION_PROFILES.Blob;

export function monsterPose(action: string): MonsterPose {
  const normalized = action.trim().toLowerCase();
  return (MONSTER_POSES as readonly string[]).includes(normalized)
    ? normalized as MonsterPose
    : "idle";
}

export function monsterMovement(pose: MonsterPose): MonsterMovementDefinition | undefined {
  return MONSTER_MOVEMENTS.find((movement) => movement.pose === pose);
}

export function monsterMotionProfile(body: string): MonsterMotionProfile {
  return MONSTER_MOTION_PROFILES[body as PremiumMonsterBody] ?? DEFAULT_PROFILE;
}
