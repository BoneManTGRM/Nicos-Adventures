import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterStage } from "../FeatureArt";
import type { MonsterRecord } from "../types";

const monster: MonsterRecord = {
  id: "glimmer",
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

describe("Monster Lab localized preview", () => {
  it("localizes displayed traits without changing canonical values", () => {
    const html = renderToStaticMarkup(<MonsterStage monster={monster} language="es-MX" />);
    expect(html).toContain("Dragón · Galaxia · Escudo arcoíris");
    expect(html).toContain("Glimmer, Dragón monstruo");
    expect(html).toContain("monster-stage__environment");
    expect(html).toContain("monster-ground-shadow");
    expect(html).toContain('data-monster-body-art="Dragon"');
    expect(html).toContain('data-monster-pattern="galaxy"');
    expect(html).toContain("premium-monster-bodies-atlas");
    expect(html).toContain("monster-premium-body__pattern");
    expect(html).toContain("monster-texture--crystal");
    expect(html).not.toContain("<canvas");
    expect(monster).toMatchObject({ body: "Dragon", pattern: "Galaxy", power: "Rainbow shield" });
  });
});
