import type { MonsterRecord } from "../types";

export type MonsterTraitKey = Exclude<
  keyof MonsterRecord,
  "id" | "name" | "friendship"
>;

export type MonsterTraitGroup = "form" | "features" | "style";

/**
 * The approved monsters are finished character illustrations. Monster Lab now
 * exposes only controls that can change those assets without replacing their
 * anatomy or permanent faces.
 */
export const MONSTER_TRAITS: ReadonlyArray<{
  key: MonsterTraitKey;
  icon: string;
  group: MonsterTraitGroup;
}> = [
  { key: "body", icon: "◉", group: "form" },
  { key: "color", icon: "●", group: "style" },
  { key: "pattern", icon: "▧", group: "style" },
  { key: "texture", icon: "✺", group: "style" },
];

export const MONSTER_COLOR_SWATCHES: Readonly<Record<string, string>> = Object.freeze({
  Aqua: "#22d3ee",
  Purple: "#8b5cf6",
  Lime: "#84cc16",
  Pink: "#ec4899",
  Orange: "#f97316",
  Silver: "#cbd5e1",
  "Midnight blue": "#1e3a8a",
  Red: "#ef4444",
  White: "#f8fafc",
  "Black and chrome": "#94a3b8",
});

const OPTION_CAPS: Readonly<Partial<Record<MonsterTraitKey, number>>> = Object.freeze({
  body: 16,
  color: 10,
  pattern: 8,
  texture: 8,
});

export function monsterTrait(key: MonsterTraitKey) {
  return MONSTER_TRAITS.find((trait) => trait.key === key) ?? MONSTER_TRAITS[0];
}

export function monsterVisualTraits(_monster: Pick<MonsterRecord, "body">) {
  return MONSTER_TRAITS;
}

export function monsterVisualOptions(key: MonsterTraitKey, options: readonly string[]) {
  return options.slice(0, OPTION_CAPS[key] ?? options.length);
}

export function monsterColorSwatch(color: string) {
  return MONSTER_COLOR_SWATCHES[color] ?? MONSTER_COLOR_SWATCHES.Aqua;
}
