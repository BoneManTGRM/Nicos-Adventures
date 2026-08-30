import type { MonsterRecord } from "../types";

export type MonsterTraitKey = Exclude<
  keyof MonsterRecord,
  "id" | "name" | "friendship"
>;

export type MonsterTraitGroup = "form" | "features" | "style" | "story";

export const MONSTER_TRAITS: ReadonlyArray<{
  key: MonsterTraitKey;
  icon: string;
  group: MonsterTraitGroup;
}> = [
  { key: "body", icon: "◉", group: "form" },
  { key: "eyes", icon: "◉◉", group: "form" },
  { key: "mouth", icon: "⌣", group: "form" },
  { key: "horns", icon: "♈", group: "features" },
  { key: "wings", icon: "🪽", group: "features" },
  { key: "arms", icon: "✦", group: "features" },
  { key: "legs", icon: "⌁", group: "features" },
  { key: "tail", icon: "〰", group: "features" },
  { key: "color", icon: "●", group: "style" },
  { key: "pattern", icon: "▧", group: "style" },
  { key: "texture", icon: "✺", group: "style" },
  { key: "power", icon: "⚡", group: "story" },
  { key: "personality", icon: "♥", group: "story" },
  { key: "habitat", icon: "⌂", group: "story" },
  { key: "animation", icon: "▶", group: "story" },
];

const MONSTER_COLORS: Record<string, string> = {
  Aqua: "#22d3ee",
  Purple: "#8b5cf6",
  Lime: "#84cc16",
  Orange: "#fb923c",
  Pink: "#f472b6",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Gold: "#facc15",
  Midnight: "#172554",
  Pearl: "#e2e8f0",
  Emerald: "#10b981",
  Crimson: "#be123c",
};

export function monsterTrait(key: MonsterTraitKey) {
  return MONSTER_TRAITS.find((trait) => trait.key === key) ?? MONSTER_TRAITS[0];
}

export function monsterColorSwatch(color: string) {
  return MONSTER_COLORS[color] ?? (color || "#22d3ee");
}
