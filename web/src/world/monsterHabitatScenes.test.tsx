import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import { MonsterHabitats } from "./MonsterWorkshop";
import { MONSTER_OPTIONS } from "./catalogs";

describe("monster habitat scenes", () => {
  it("gives every selectable habitat its own scene identity behind the saved monster art", () => {
    const profile = createProfile("Scene test");
    profile.monsters = MONSTER_OPTIONS.habitat.map((habitat, index) => ({
      id: `scene-monster-${index}`,
      name: `Monster ${index + 1}`,
      body: "Dragon",
      eyes: "Three eyes",
      horns: "Crystal horns",
      wings: "Star wings",
      color: "Aqua",
      pattern: "Galaxy",
      power: "Rainbow shield",
      personality: "Curious",
      friendship: 20,
      habitat,
      mouth: "Fang smile",
      arms: "Claw arms",
      legs: "Dinosaur legs",
      tail: "Dragon tail",
      texture: "Crystal",
      animation: "Bounce",
    }));

    const html = renderToStaticMarkup(createElement(MonsterHabitats, {
      profile,
      update: () => undefined,
      announce: () => undefined,
    }));

    expect((html.match(/data-monster-scenery="habitat"/g) ?? [])).toHaveLength(MONSTER_OPTIONS.habitat.length);
    for (const habitat of MONSTER_OPTIONS.habitat) {
      const slug = habitat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      expect(html).toContain(`data-monster-habitat="${slug}"`);
    }
  });
});
