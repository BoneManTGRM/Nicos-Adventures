import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import { MONSTER_FAMILY_PRESETS, applyMonsterFamilyPreset } from "./monsterFamily";
import {
  MONSTER_TRAITS,
  monsterColorSwatch,
  monsterTrait,
  monsterVisualOptions,
  monsterVisualTraits,
} from "./monsterCreatureStudio";
import type { MonsterRecord } from "../types";

const monster = {
  id: "test",
  name: "Glimmer",
  body: "Lizard Alien",
  eyes: "Two eyes",
  horns: "No horns",
  wings: "No wings",
  color: "Aqua",
  pattern: "Solid",
  power: "Rainbow shield",
  personality: "Curious",
  friendship: 1,
  habitat: "Crystal Cave",
  mouth: "Dragon snout",
  arms: "Claw arms",
  legs: "Dinosaur legs",
  tail: "No tail",
  texture: "Smooth",
  animation: "Bounce",
} as MonsterRecord;

describe("Monster Lab permanent-face creature contract", () => {
  it("exposes only the two dependable simple controls", () => {
    const keys = MONSTER_TRAITS.map((trait) => trait.key);
    expect(keys).toEqual(["body", "color"]);
    expect(monsterVisualTraits(monster).map((trait) => trait.key)).toEqual(keys);
  });

  it("locks the body selector to the premium Lizard Alien family", () => {
    expect(monsterTrait("body")).toMatchObject({ icon: "◉", group: "form" });
    expect(monsterTrait("color")).toMatchObject({ icon: "●", group: "style" });
    expect(monsterVisualOptions("body", MONSTER_OPTIONS.body)).toEqual(["Lizard Alien"]);
  });

  it("ships a large family of permanent-face monsters", () => {
    expect(MONSTER_FAMILY_PRESETS.length).toBeGreaterThanOrEqual(18);
    expect(new Set(MONSTER_FAMILY_PRESETS.map((preset) => preset.id)).size).toBe(MONSTER_FAMILY_PRESETS.length);
    expect(new Set(MONSTER_FAMILY_PRESETS.map((preset) => preset.name)).size).toBe(MONSTER_FAMILY_PRESETS.length);
  });

  it("applies a family preset without replacing the permanent face species", () => {
    const preset = MONSTER_FAMILY_PRESETS.find((item) => item.name === "Ember")!;
    expect(applyMonsterFamilyPreset(monster, preset)).toMatchObject({
      name: "Ember",
      body: "Lizard Alien",
      color: "Orange",
      wings: "No wings",
      tail: "No tail",
      pattern: "Solid",
      texture: "Smooth",
    });
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
