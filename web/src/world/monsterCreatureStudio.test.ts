import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import {
  MONSTER_TRAITS,
  monsterColorSwatch,
  monsterTrait,
  monsterVisualOptions,
  monsterVisualTraits,
} from "./monsterCreatureStudio";
import type { MonsterRecord } from "../types";

const monster = {
  body: "Dragon",
} as MonsterRecord;

describe("Monster Lab visual creature contract", () => {
  it("offers only controls that have a dependable visual result", () => {
    const keys = MONSTER_TRAITS.map((trait) => trait.key);
    expect(keys).toEqual(["body", "wings", "arms", "tail", "color", "pattern", "texture"]);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((key) => key in MONSTER_OPTIONS)).toBe(true);
  });

  it("routes traits to stable visual groups", () => {
    expect(monsterTrait("body")).toMatchObject({ icon: "◉", group: "form" });
    expect(monsterTrait("wings")).toMatchObject({ icon: "🪽", group: "features" });
    expect(monsterTrait("texture")).toMatchObject({ icon: "✺", group: "style" });
  });

  it("shows arm variants only for the body atlas that supports them", () => {
    expect(monsterVisualTraits(monster).map((trait) => trait.key)).not.toContain("arms");
    expect(monsterVisualTraits({ ...monster, body: "Alien" }).map((trait) => trait.key)).toContain("arms");
  });

  it("does not offer duplicate wing and tail variants that render identically", () => {
    expect(monsterVisualOptions("wings", MONSTER_OPTIONS.wings)).toEqual(["No wings", "Star wings"]);
    expect(monsterVisualOptions("tail", MONSTER_OPTIONS.tail)).toEqual(["No tail", "Dragon tail"]);
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
