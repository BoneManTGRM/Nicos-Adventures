import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { MonsterRecord } from "../types";
import { MONSTER_OPTIONS } from "./catalogs";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";

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

function render(language: "en" | "es-MX" = "en") {
  return renderToStaticMarkup(
    <MonsterCreatureStudio
      monster={monster}
      language={language}
      activeTrait="color"
      selectTrait={vi.fn()}
      sculpt={vi.fn()}
    />,
  );
}

describe("approved Monster Lab layout", () => {
  it("shows every original body as a visual portrait without hiding customization", () => {
    const html = render();
    const portraitCount = (html.match(/data-monster-portrait-body=/g) ?? []).length;
    expect(portraitCount).toBe(MONSTER_OPTIONS.body.length);
    expect(html).toContain('aria-label="Monster body gallery"');
    expect(html).toContain("1 · Choose body");
    expect(html).toContain("2 · Customize traits");
    expect(html).toContain('data-active-trait="color"');
    expect(html).toContain('class="monster-studio__choice monster-studio__choice--color"');
  });

  it("keeps canonical bodies unique and includes the approved Lizard Alien", () => {
    expect(new Set(MONSTER_OPTIONS.body).size).toBe(MONSTER_OPTIONS.body.length);
    expect(MONSTER_OPTIONS.body).toContain("Lizard Alien");
    const html = render();
    for (const body of MONSTER_OPTIONS.body) {
      expect(html).toContain(`data-monster-portrait-body="${body}"`);
    }
  });

  it("localizes the compact studio for Mexican Spanish", () => {
    const html = render("es-MX");
    expect(html).toContain("Construye tu monstruo");
    expect(html).toContain("1 · Elige el cuerpo");
    expect(html).toContain("2 · Personaliza los rasgos");
    expect(html).toContain('aria-label="Galería de cuerpos de monstruos"');
  });
});
