import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import { MONSTER_TRAITS, monsterColorSwatch, monsterTrait } from "./monsterCreatureStudio";

describe("Monster Lab visual creature contract", () => {
  it("offers only controls that have a dependable visual result", () => {
    const keys = MONSTER_TRAITS.map((trait) => trait.key);
    expect(keys).not.toContain("eyes");
    expect(keys).not.toContain("mouth");
    expect(keys).not.toContain("horns");
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => key in MONSTER_OPTIONS)).toBe(true);
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
