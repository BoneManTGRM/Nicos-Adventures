import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import {
  MONSTER_BODY_ART,
  PREMIUM_MONSTER_BODIES,
  monsterAccessoryLayout,
  monsterAccessoryTransform,
  monsterBodyArt,
  monsterBodyArtStyle,
} from "./monsterArt";

describe("approved Monster Lab character artwork", () => {
  it("maps every schema-v4 body to one of the 16 actual reference monsters", () => {
    expect(PREMIUM_MONSTER_BODIES).toEqual(MONSTER_OPTIONS.body);
    expect(Object.keys(MONSTER_BODY_ART)).toEqual(PREMIUM_MONSTER_BODIES);
    expect(new Set(PREMIUM_MONSTER_BODIES).size).toBe(16);
    expect(Object.values(MONSTER_BODY_ART).every((art) => art.source === "approved-user-reference")).toBe(true);
  });

  it("uses the four checksum-generated reference rows and exact cell positions", () => {
    const images = new Set(Object.values(MONSTER_BODY_ART).map((art) => art.image));
    expect(images.size).toBe(4);
    for (const image of images) expect(image).toContain("reference-monsters-row-");

    expect(monsterBodyArtStyle("Blob", "#22d3ee")).toMatchObject({
      "--monster-body-position": "0% 50%",
      "--monster-body-size": "400% 100%",
      "--monster-body-aspect": "1 / 1",
      "--monster-body-width": "100%",
      "--monster-body-color": "#22d3ee",
      "--monster-reference-source": "approved-user-reference",
    });
    expect(monsterBodyArtStyle("Stone Golem", "#8b5cf6")).toMatchObject({
      "--monster-body-position": "100% 50%",
    });
    expect(monsterBodyArtStyle("Spirit", "#e2e8f0")).toMatchObject({
      "--monster-body-position": "0% 50%",
    });
    expect(monsterBodyArtStyle("Cloud", "#e2e8f0")).toMatchObject({
      "--monster-body-position": "100% 50%",
    });
  });

  it("keeps a safe Blob fallback for old or malformed saved records", () => {
    expect(monsterBodyArt("Unknown legacy body")).toBe(MONSTER_BODY_ART.Blob);
    expect(monsterBodyArtStyle("Unknown legacy body", "#22d3ee")).toMatchObject({
      "--monster-body-position": "0% 50%",
      "--monster-reference-source": "approved-user-reference",
    });
  });

  it("does not replace the approved body when legacy arm data changes", () => {
    const tiny = monsterBodyArtStyle("Alien", "#84cc16", "Tiny arms");
    const wing = monsterBodyArtStyle("Alien", "#84cc16", "Wing arms");
    const legacy = monsterBodyArtStyle("Alien", "#84cc16", "Unknown legacy arms");
    expect(wing).toEqual(tiny);
    expect(legacy).toEqual(tiny);
  });

  it("retains deterministic accessory helpers for old saved data without drawing overlays", () => {
    const layout = monsterAccessoryLayout("Stone Golem");
    expect(layout.face).toEqual({ x: 0, y: 0, scale: 1 });
    expect(monsterAccessoryTransform("face", layout.face)).toBe(
      "translate(0 0) translate(260 226) rotate(0) scale(1) translate(-260 -226)",
    );
  });
});
