import type { MonsterRecord } from "../types";

export type MonsterTraitKey = Exclude<
  keyof MonsterRecord,
  "id" | "name" | "friendship"
>;

export type MonsterTraitGroup = "form" | "features" | "style";

export const MONSTER_TRAITS: ReadonlyArray<{
  key: MonsterTraitKey;
  icon: string;
  group: MonsterTraitGroup;
}> = [
  { key: "body", icon: "◉", group: "form" },
  { key: "color", icon: "🎨", group: "style" },
  { key: "pattern", icon: "▧", group: "style" },
  { key: "texture", icon: "✺", group: "style" },
  { key: "wings", icon: "🪽", group: "features" },
  { key: "horns", icon: "♨", group: "features" },
  { key: "tail", icon: "〰", group: "features" },
  { key: "arms", icon: "✦", group: "features" },
];

const BINARY_VISUAL_OPTIONS: Partial<Record<MonsterTraitKey, readonly string[]>> = {
  wings: ["No wings", "Star wings"],
  horns: ["No horns", "Crystal horns"],
  tail: ["No tail", "Dragon tail"],
};

export function monsterVisualTraits(monster: MonsterRecord) {
  return MONSTER_TRAITS.filter((trait) => {
    if (trait.key === "arms") return monster.body === "Alien";
    if (trait.key === "horns" || trait.key === "tail") return monster.body !== "Lizard Alien";
    return true;
  });
}

export function monsterVisualOptions(key: MonsterTraitKey, options: readonly string[]): readonly string[] {
  return BINARY_VISUAL_OPTIONS[key] ?? options;
}

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
