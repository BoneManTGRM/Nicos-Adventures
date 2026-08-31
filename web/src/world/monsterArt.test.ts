import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import { PREMIUM_MONSTER_BODIES, monsterBodyArtStyle } from "./monsterArt";

describe("premium illustrated monster body atlas", () => {
  it("maps every schema-v4 monster body to exactly one atlas cell", () => {
    expect(PREMIUM_MONSTER_BODIES).toEqual(MONSTER_OPTIONS.body);
    expect(new Set(PREMIUM_MONSTER_BODIES).size).toBe(MONSTER_OPTIONS.body.length);
  });

  it("keeps stable atlas registration with a safe legacy fallback", () => {
    expect(monsterBodyArtStyle("Blob", "#22d3ee")).toMatchObject({
      "--monster-body-position": "0% 0%",
      "--monster-body-color": "#22d3ee",
    });
    expect(monsterBodyArtStyle("Mecha", "#8b5cf6")).toMatchObject({
      "--monster-body-position": "75% 50%",
    });
    expect(monsterBodyArtStyle("Cloud", "#e2e8f0")).toMatchObject({
      "--monster-body-position": "100% 100%",
    });
    expect(monsterBodyArtStyle("Unknown legacy body", "#22d3ee")).toMatchObject({
      "--monster-body-position": "0% 0%",
    });
  });
});
