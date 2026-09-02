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

describe("painted-in permanent monster faces", () => {
  it("covers all 16 approved bodies with stable identity labels", () => {
    expect(PREMIUM_MONSTER_FACE_BODIES).toEqual(MONSTER_OPTIONS.body);
    expect(Object.keys(MONSTER_FACE_TREATMENTS)).toHaveLength(MONSTER_OPTIONS.body.length);
    expect(new Set(Object.values(MONSTER_FACE_TREATMENTS)).size).toBe(MONSTER_OPTIONS.body.length);
  });

  it.each(MONSTER_OPTIONS.body)("renders %s without a generic face overlay", (body) => {
    const monster = { ...baseMonster, id: `face-${body}`, body };
    const treatment = monsterFaceTreatment(body);
    const html = renderToStaticMarkup(<MonsterStage monster={monster} language="en" />);

    expect(monsterHasIntegratedFace(body)).toBe(true);
    expect(html).toContain(`data-monster-body-art="${body}"`);
    expect(html).toContain(`data-monster-face-treatment="${treatment}"`);
    expect(html).not.toContain('class="monster-face');
    expect(html).not.toContain('class="monster-mouth');
    expect(html).not.toContain('class="monster-core');
    expect(html).not.toContain("data-monster-face-signature");
    expect(html).not.toContain("data-monster-mouth-signature");
  });

  it("keeps the approved body image unchanged when legacy face fields differ", () => {
    for (const body of MONSTER_OPTIONS.body) {
      const first = renderToStaticMarkup(
        <MonsterStage
          monster={{ ...baseMonster, id: `permanent-${body}`, body, eyes: "One eye", mouth: "Tiny mouth", horns: "No horns" }}
          language="en"
        />,
      );
      const second = renderToStaticMarkup(
        <MonsterStage
          monster={{ ...baseMonster, id: `permanent-${body}`, body, eyes: "Galaxy eyes", mouth: "Dragon snout", horns: "Flame horns" }}
          language="en"
        />,
      );

      expect(second).toBe(first);
    }
  });

  it("retains stable treatment names for saves, tests, and analytics", () => {
    expect(monsterFaceTreatment("Blob")).toBe("blob-mischief");
    expect(monsterFaceTreatment("Dragon")).toBe("sculpted-dragon");
    expect(monsterFaceTreatment("Jungle Beast")).toBe("feral-guardian");
    expect(monsterFaceTreatment("Stone Golem")).toBe("carved-golem");
    expect(monsterFaceTreatment("Alien")).toBe("integrated-visor");
    expect(monsterFaceTreatment("Lizard Alien")).toBe("integrated-lizard");
  });
});
