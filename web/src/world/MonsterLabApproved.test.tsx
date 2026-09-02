import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { MonsterRecord } from "../types";
import { MONSTER_OPTIONS } from "./catalogs";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";
import { MonsterPortrait } from "./MonsterPortrait";
import { MONSTER_MOVEMENTS, MONSTER_MOTION_PROFILES } from "./monsterMovement";

const monster: MonsterRecord = {
  id: "approved-glimmer",
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

describe("approved Monster Lab", () => {
  it("keeps every original monster as a visual body card", () => {
    const html = renderToStaticMarkup(
      <MonsterCreatureStudio
        monster={monster}
        language="en"
        activeTrait="color"
        selectTrait={vi.fn()}
        sculpt={vi.fn()}
      />,
    );

    expect((html.match(/data-monster-portrait-body=/g) ?? [])).toHaveLength(MONSTER_OPTIONS.body.length);
    expect(MONSTER_OPTIONS.body).toHaveLength(16);
    expect(new Set(MONSTER_OPTIONS.body).size).toBe(16);
    expect(html).toContain('aria-label="Monster body gallery"');
    expect(html).toContain("1 · Choose body");
    expect(html).toContain("2 · Customize traits");
    expect(html).toContain('data-active-trait="color"');
  });

  it("keeps the approved Lizard Alien face integrated in its portrait", () => {
    const html = renderToStaticMarkup(
      <MonsterPortrait body="Lizard Alien" color="Aqua" label="Lizard Alien preview" />,
    );
    expect(html).toContain('data-monster-face-treatment="integrated-lizard"');
    expect(html).toContain("lizard-alien.webp");
    expect(html).not.toContain('class="monster-portrait__face"');
  });

  it("gives all 16 bodies a motion profile and seven actions plus idle", () => {
    expect(Object.keys(MONSTER_MOTION_PROFILES)).toHaveLength(16);
    expect(MONSTER_MOVEMENTS.map((movement) => movement.pose)).toEqual([
      "bounce", "spin", "roar", "fly", "dance", "sleep", "celebrate",
    ]);
  });

  it("localizes the compact visual studio for Mexican Spanish", () => {
    const html = renderToStaticMarkup(
      <MonsterCreatureStudio
        monster={monster}
        language="es-MX"
        activeTrait="color"
        selectTrait={vi.fn()}
        sculpt={vi.fn()}
      />,
    );
    expect(html).toContain("Construye tu monstruo");
    expect(html).toContain("1 · Elige el cuerpo");
    expect(html).toContain("2 · Personaliza los rasgos");
    expect(html).toContain('aria-label="Galería de cuerpos de monstruos"');
  });
});
