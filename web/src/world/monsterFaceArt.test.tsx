import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterStage } from "../FeatureArt";
import type { MonsterRecord } from "../types";
import { MONSTER_OPTIONS } from "./catalogs";
import {
  MONSTER_FACE_TREATMENTS,
  PREMIUM_MONSTER_FACE_BODIES,
  monsterFaceTreatment,
  monsterHasIntegratedFace,
} from "./monsterFaceArt";

const baseMonster: MonsterRecord = {
  id: "face-contract",
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

describe("permanent body-specific monster faces", () => {
  it("covers every original monster body with one unique face treatment", () => {
    expect(PREMIUM_MONSTER_FACE_BODIES).toEqual(MONSTER_OPTIONS.body);
    expect(Object.keys(MONSTER_FACE_TREATMENTS)).toHaveLength(MONSTER_OPTIONS.body.length);
    expect(new Set(Object.values(MONSTER_FACE_TREATMENTS)).size).toBe(MONSTER_OPTIONS.body.length);
  });

  it.each(MONSTER_OPTIONS.body)("renders %s with its permanent face signature", (body) => {
    const monster = { ...baseMonster, id: `face-${body}`, body };
    const treatment = monsterFaceTreatment(body);
    const html = renderToStaticMarkup(<MonsterStage monster={monster} language="en" />);

    expect(html).toContain(`data-monster-body-art="${body}"`);
    expect(html).toContain(`data-monster-face-treatment="${treatment}"`);

    if (monsterHasIntegratedFace(body)) {
      expect(body).toBe("Lizard Alien");
      expect(html).not.toContain('class="monster-face');
      expect(html).not.toContain('class="monster-mouth');
      expect(html).not.toContain('class="monster-core');
      return;
    }

    expect(html).toContain(`data-monster-face-signature="${treatment}"`);
    expect(html).toContain(`data-monster-mouth-signature="${treatment}"`);
    expect(html).toContain(`data-monster-core-signature="${treatment}"`);
  });

  it("keeps each body face unchanged when legacy face fields differ", () => {
    for (const body of MONSTER_OPTIONS.body) {
      const first = renderToStaticMarkup(
        <MonsterStage
          monster={{ ...baseMonster, id: `permanent-${body}`, body, eyes: "One eye", mouth: "Tiny mouth" }}
          language="en"
        />,
      );
      const second = renderToStaticMarkup(
        <MonsterStage
          monster={{ ...baseMonster, id: `permanent-${body}`, body, eyes: "Galaxy eyes", mouth: "Dragon snout" }}
          language="en"
        />,
      );

      expect(second).toBe(first);
    }
  });

  it("keeps the established premium treatments stable where compatibility matters", () => {
    expect(monsterFaceTreatment("Dragon")).toBe("sculpted-dragon");
    expect(monsterFaceTreatment("Jungle Beast")).toBe("feral-guardian");
    expect(monsterFaceTreatment("Stone Golem")).toBe("carved-golem");
    expect(monsterFaceTreatment("Alien")).toBe("integrated-visor");
    expect(monsterFaceTreatment("Lizard Alien")).toBe("integrated-lizard");
  });
});
