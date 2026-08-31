import { describe, expect, it } from "vitest";
import { MONSTER_OPTIONS } from "./catalogs";
import {
  PREMIUM_ALIEN_ARMS,
  PREMIUM_MONSTER_BODIES,
  monsterAccessoryLayout,
  monsterAccessoryTransform,
  monsterBodyArtStyle,
} from "./monsterArt";

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

  it("gives every saved alien arm choice a distinct premium body", () => {
    expect(PREMIUM_ALIEN_ARMS).toEqual(MONSTER_OPTIONS.arms);
    expect(monsterBodyArtStyle("Alien", "#a3e635", "Tiny arms")).toMatchObject({
      "--monster-body-position": "0% 0%",
      "--monster-body-size": "400% 200%",
      "--monster-body-color": "#a3e635",
    });
    expect(monsterBodyArtStyle("Alien", "#a3e635", "Tentacles")).toMatchObject({
      "--monster-body-position": "100% 0%",
    });
    expect(monsterBodyArtStyle("Alien", "#a3e635", "Wing arms")).toMatchObject({
      "--monster-body-position": `${2 * (100 / 3)}% 100%`,
    });
    expect(monsterBodyArtStyle("Alien", "#a3e635", "Unknown legacy arms")).toMatchObject({
      "--monster-body-position": "0% 0%",
    });
  });

  it("fits accessories to broad bodies without changing their body art", () => {
    const stone = monsterAccessoryLayout("Stone Golem");
    const alien = monsterAccessoryLayout("Alien");

    expect(stone.face.scale).toBeLessThan(0.7);
    expect(stone.horns.scale).toBeLessThan(0.6);
    expect(stone.wings.scale).toBeLessThan(0.7);
    expect(alien.face.scale).toBeLessThan(0.4);
    expect(alien.horns.scale).toBeLessThanOrEqual(0.3);
    expect(alien.core.y).toBeLessThan(-100);
    expect(monsterAccessoryTransform("face", stone.face)).toBe(
      "translate(0 -88) translate(260 246) scale(0.64) translate(-260 -246)",
    );
    expect(monsterBodyArtStyle("Stone Golem", "#22d3ee")).toMatchObject({
      "--monster-body-position": "75% 0%",
    });
  });
});
