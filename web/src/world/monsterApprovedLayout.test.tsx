import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MonsterRecord } from "../types";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";
import { PREMIUM_MONSTER_BODIES } from "./monsterArt";

const monster: MonsterRecord = {
  id: "approved-layout-glimmer",
  name: "Glimmer",
  body: "Dragon",
  eyes: "Three eyes",
  horns: "Crystal horns",
  wings: "Star wings",
  color: "Aqua",
  pattern: "Galaxy",
  power: "Rainbow shield",
  personality: "Curious",
  friendship: 1,
  habitat: "Crystal Cave",
  mouth: "Fang smile",
  arms: "Claw arms",
  legs: "Dinosaur legs",
  tail: "Dragon tail",
  texture: "Crystal",
  animation: "Bounce",
};

describe("approved compact Monster Lab layout", () => {
  it("shows all original bodies together as premium face portraits", () => {
    const html = renderToStaticMarkup(
      <MonsterCreatureStudio
        monster={monster}
        language="en"
        activeTrait="color"
        selectTrait={() => undefined}
        sculpt={() => undefined}
      />,
    );

    expect(html).toContain("1 · Choose body");
    expect(html).toContain("2 · Customize traits");
    expect(html).toContain('data-active-trait="color"');
    expect(html.match(/data-monster-portrait-body=/g)).toHaveLength(PREMIUM_MONSTER_BODIES.length);
    for (const body of PREMIUM_MONSTER_BODIES) {
      expect(html).toContain(`data-monster-portrait-body="${body}"`);
      expect(html).toContain(`data-option="${body}"`);
    }
    expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
    expect(html).toContain('data-monster-face-treatment="integrated-lizard"');
    expect(html).toContain('data-option="Aqua"');
  });

  it("keeps the body gallery visible while a different trait is selected", () => {
    const html = renderToStaticMarkup(
      <MonsterCreatureStudio
        monster={monster}
        language="es-MX"
        activeTrait="texture"
        selectTrait={() => undefined}
        sculpt={() => undefined}
      />,
    );

    expect(html).toContain("1 · Elige el cuerpo");
    expect(html).toContain("2 · Personaliza los rasgos");
    expect(html).toContain('data-active-trait="texture"');
    expect(html.match(/data-monster-portrait-body=/g)).toHaveLength(PREMIUM_MONSTER_BODIES.length);
    expect(html).toContain("Dragón");
    expect(html).toContain("Cristal");
  });
});
