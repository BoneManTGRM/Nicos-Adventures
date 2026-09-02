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

  it("uses standalone full-body art for the lizard alien", () => {
    expect(monsterBodyArtStyle("Lizard Alien", "#22d3ee")).toMatchObject({
      "--monster-body-position": "center",
      "--monster-body-size": "contain",
      "--monster-body-aspect": "1",
      "--monster-body-width": "100%",
    });
    expect(PREMIUM_MONSTER_BODIES).toContain("Lizard Alien");
  });

  it("fits accessories to broad bodies with permanent face proportions", () => {
    const jungle = monsterAccessoryLayout("Jungle Beast");
    const stone = monsterAccessoryLayout("Stone Golem");
    const royal = monsterAccessoryLayout("Royal");
    const alien = monsterAccessoryLayout("Alien");
    const lizard = monsterAccessoryLayout("Lizard Alien");

    expect(jungle.face).toEqual({ x: 0, y: -90, scale: 0.62 });
    expect(jungle.mouth).toEqual({ x: 0, y: -145, scale: 0.56 });
    expect(stone.face).toEqual({ x: 0, y: -145, scale: 0.46 });
    expect(stone.horns.scale).toBeLessThan(0.4);
    expect(stone.wings.scale).toBeLessThan(0.6);
    expect(royal.face).toEqual({ x: 0, y: -88, scale: 0.6 });
    expect(royal.mouth).toEqual({ x: 0, y: -158, scale: 0.52 });
    expect(royal.horns.scale).toBe(0);
    expect(alien.face).toEqual({ x: 0, y: -105, scale: 0.46 });
    expect(alien.mouth).toEqual({ x: 0, y: -155, scale: 0.5 });
    expect(alien.horns).toEqual({ x: 0, y: -72, scale: 0.22 });
    expect(alien.core.y).toBeLessThan(-100);
    expect(monsterAccessoryLayout("Spirit").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Cosmic").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Aquatic").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Candy").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Volcano").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Ice Beast").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Dinosaur").face.scale).toBeGreaterThan(0.5);
    expect(monsterAccessoryLayout("Cloud").face.scale).toBeGreaterThan(0.5);
    expect(lizard.tail.scale).toBe(0);
    expect(monsterAccessoryTransform("face", stone.face)).toBe(
      "translate(0 -145) translate(260 246) scale(0.46) translate(-260 -246)",
    );
    expect(monsterAccessoryTransform("mouth", stone.mouth)).toBe(
      "translate(0 -205) translate(260 330) scale(0.38) translate(-260 -330)",
    );
    expect(monsterBodyArtStyle("Stone Golem", "#22d3ee")).toMatchObject({
      "--monster-body-position": "75% 0%",
    });
  });
});
