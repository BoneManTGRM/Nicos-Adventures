import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterStage } from "../FeatureArt";
import type { MonsterRecord } from "../types";
import { MONSTER_MOVEMENTS } from "./monsterMovement";

const monster: MonsterRecord = {
  id: "movement-glimmer",
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

describe("Monster Lab movement images", () => {
  it("renders every movement as a distinct stage pose without replacing the monster", () => {
    for (const movement of MONSTER_MOVEMENTS) {
      const html = renderToStaticMarkup(
        <MonsterStage monster={monster} action={movement.pose} language="en" />,
      );

      expect(html).toContain(`monster-stage monster-stage--${movement.pose}`);
      expect(html).toContain('data-monster-body-art="Dragon"');
      expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
      expect(html).toContain('data-monster-face-signature="sculpted-dragon"');
      expect(html).toContain("premium-monster-bodies-atlas");
    }
  });

  it("keeps the Lizard Alien's integrated premium face in every pose", () => {
    const lizard = {
      ...monster,
      id: "movement-lizard",
      body: "Lizard Alien",
      name: "Rexon",
    };

    for (const movement of MONSTER_MOVEMENTS) {
      const html = renderToStaticMarkup(
        <MonsterStage monster={lizard} action={movement.pose} language="es-MX" />,
      );

      expect(html).toContain(`monster-stage monster-stage--${movement.pose}`);
      expect(html).toContain('data-monster-body-art="Lizard Alien"');
      expect(html).toContain('data-monster-face-treatment="integrated-lizard"');
      expect(html).toContain("premium-lizard-alien");
      expect(html).not.toContain('class="monster-face"');
      expect(html).not.toContain('class="monster-mouth"');
    }
  });

  it("preserves body-specific identity across contrasting movement profiles", () => {
    const bodies = [
      ["Blob", "blob-mischief"],
      ["Stone Golem", "carved-golem"],
      ["Spirit", "mystic-spirit"],
      ["Aquatic", "aqua-creature"],
      ["Mecha", "mecha-visor"],
      ["Cloud", "cloud-dreamer"],
    ] as const;

    for (const [body, treatment] of bodies) {
      const html = renderToStaticMarkup(
        <MonsterStage monster={{ ...monster, id: `movement-${body}`, body }} action="celebrate" language="en" />,
      );

      expect(html).toContain(`data-monster-body-art="${body}"`);
      expect(html).toContain(`data-monster-face-treatment="${treatment}"`);
      expect(html).toContain(`data-monster-face-signature="${treatment}"`);
      expect(html).toContain("monster-stage--celebrate");
    }
  });
});
