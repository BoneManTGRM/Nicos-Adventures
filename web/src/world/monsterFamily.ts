import type { MonsterRecord } from "../types";

export type MonsterFamilyPreset = Readonly<{
  id: string;
  name: string;
  color: string;
  filter: string;
}>;

export const MONSTER_FAMILY_PRESETS: readonly MonsterFamilyPreset[] = Object.freeze([
  { id: "glimmer", name: "Glimmer", color: "Aqua", filter: "none" },
  { id: "volt", name: "Volt", color: "Gold", filter: "hue-rotate(158deg) saturate(1.55) brightness(1.05)" },
  { id: "ember", name: "Ember", color: "Orange", filter: "hue-rotate(185deg) saturate(2.15) brightness(.92)" },
  { id: "moss", name: "Moss", color: "Lime", filter: "hue-rotate(78deg) saturate(1.7) brightness(.88)" },
  { id: "nebula", name: "Nebula", color: "Purple", filter: "hue-rotate(244deg) saturate(1.7) brightness(.96)" },
  { id: "frost", name: "Frost", color: "Pearl", filter: "saturate(.32) brightness(1.22)" },
  { id: "coral", name: "Coral", color: "Pink", filter: "hue-rotate(208deg) saturate(1.75) brightness(1.08)" },
  { id: "cobalt", name: "Cobalt", color: "Blue", filter: "hue-rotate(320deg) saturate(1.65) brightness(.9)" },
  { id: "onyx", name: "Onyx", color: "Midnight", filter: "saturate(.55) brightness(.48) contrast(1.18)" },
  { id: "jade", name: "Jade", color: "Emerald", filter: "hue-rotate(98deg) saturate(1.75) brightness(.86)" },
  { id: "ruby", name: "Ruby", color: "Crimson", filter: "hue-rotate(196deg) saturate(2.2) brightness(.76)" },
  { id: "flare", name: "Flare", color: "Red", filter: "hue-rotate(190deg) saturate(2.35) brightness(.82)" },
  { id: "tide", name: "Tide", color: "Aqua", filter: "hue-rotate(338deg) saturate(1.35) brightness(.83)" },
  { id: "comet", name: "Comet", color: "Gold", filter: "hue-rotate(150deg) saturate(1.2) brightness(1.28)" },
  { id: "orchid", name: "Orchid", color: "Purple", filter: "hue-rotate(258deg) saturate(1.25) brightness(1.2)" },
  { id: "venom", name: "Venom", color: "Lime", filter: "hue-rotate(65deg) saturate(2.25) brightness(1.02)" },
  { id: "pearl", name: "Pearl", color: "Pearl", filter: "saturate(.18) brightness(1.42) contrast(.92)" },
  { id: "storm", name: "Storm", color: "Midnight", filter: "hue-rotate(305deg) saturate(.9) brightness(.62)" },
]);

export function applyMonsterFamilyPreset(monster: MonsterRecord, preset: MonsterFamilyPreset): MonsterRecord {
  return {
    ...monster,
    name: preset.name,
    body: "Lizard Alien",
    color: preset.color,
    eyes: "Two eyes",
    mouth: "Dragon snout",
    horns: "No horns",
    wings: "No wings",
    arms: "Claw arms",
    legs: "Dinosaur legs",
    tail: "No tail",
    pattern: "Solid",
    texture: "Smooth",
  };
}
