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
    expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
    expect(html).toContain("monster-texture--crystal");
    expect(html).toContain("monster-traits monster-traits--rear");
    expect(html).toContain("monster-traits monster-traits--front");
    expect(html).not.toContain("<canvas");
    expect(monster).toMatchObject({ body: "Dragon", pattern: "Galaxy", power: "Rainbow shield" });
  });

  it("renders an alien's saved arm choice with the dedicated 2D atlas", () => {
    const alien = { ...monster, id: "orbit", name: "Orbit", body: "Alien", arms: "Four arms" };
    const html = renderToStaticMarkup(<MonsterStage monster={alien} language="en" />);

    expect(html).toContain('data-monster-body-art="Alien"');
    expect(html).toContain('data-monster-arms-art="Four arms"');
    expect(html).toContain('data-monster-face-treatment="integrated-visor"');
    expect(html).toContain("premium-alien-arms-atlas");
    expect(html).toContain("400% 200%");
    expect(html).not.toContain("<canvas");
  });

  it("uses a compact fit for a Stone Golem and keeps its mouth on its face", () => {
    const golem = { ...monster, id: "golem", body: "Stone Golem" };
    const html = renderToStaticMarkup(<MonsterStage monster={golem} language="en" />);

    expect(html).toContain('class="monster-wings" transform="translate(0 28) translate(260 250) scale(0.54)');
    expect(html).toContain('class="monster-tail" transform="translate(-14 -2) translate(388 398) scale(0.52)');
    expect(html).not.toContain('class="monster-horns"');
    expect(html).toContain('class="monster-face" transform="translate(0 -145) translate(260 246) scale(0.46)');
    expect(html).toContain('class="monster-mouth" transform="translate(0 -205) translate(260 330) scale(0.38)');
    expect(html).toContain('class="monster-core" transform="translate(0 -88) translate(260 387) scale(0.5)');
    expect(html).toContain('data-monster-face-treatment="carved-golem"');
    expect(html).toContain('rx="18" ry="16"');
    expect(html).not.toContain("M238 317Q260 328");
    expect(html).toContain("M236 319Q260 337 284 319");
  });

  it("gives a Dragon a readable face without crowding its horns", () => {
    const dragon = { ...monster, id: "dragon", body: "Dragon" };
    const html = renderToStaticMarkup(<MonsterStage monster={dragon} language="en" />);

    expect(html).toContain('class="monster-horns" transform="translate(0 -72) translate(260 158) scale(0.3)');
    expect(html).toContain('class="monster-face" transform="translate(0 -124) translate(260 246) scale(0.42)');
    expect(html).toContain('class="monster-mouth" transform="translate(0 -184) translate(260 330) scale(0.36)');
    expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
  });
});
