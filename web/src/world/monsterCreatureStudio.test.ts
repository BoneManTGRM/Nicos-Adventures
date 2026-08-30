import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import { MONSTER_TRAITS, monsterColorSwatch, monsterTrait } from "./monsterCreatureStudio";

describe("Monster Lab visual creature contract", () => {
  it("keeps every schema-v4 monster trait available exactly once", () => {
    expect(MONSTER_TRAITS.map((trait) => trait.key)).toEqual(Object.keys(MONSTER_OPTIONS));
    expect(new Set(MONSTER_TRAITS.map((trait) => trait.key)).size).toBe(MONSTER_TRAITS.length);
  });

  it("routes traits to stable visual groups", () => {
    expect(monsterTrait("body")).toMatchObject({ icon: "◉", group: "form" });
    expect(monsterTrait("wings")).toMatchObject({ icon: "🪽", group: "features" });
    expect(monsterTrait("habitat")).toMatchObject({ icon: "⌂", group: "story" });
  });

  it("gives every catalog color a distinct visible swatch", () => {
    const colors = MONSTER_OPTIONS.color.map(monsterColorSwatch);
    expect(new Set(colors).size).toBe(MONSTER_OPTIONS.color.length);
    expect(colors.every((value) => /^#[0-9a-f]{6}$/i.test(value))).toBe(true);
  });

  it("preserves a custom color from an existing profile", () => {
    expect(monsterColorSwatch("#123456")).toBe("#123456");
  });
});
