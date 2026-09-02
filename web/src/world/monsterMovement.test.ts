import { describe, expect, it } from "vitest";
import { PREMIUM_MONSTER_BODIES } from "./monsterArt";
import {
  MONSTER_MOTION_PROFILES,
  MONSTER_MOVEMENTS,
  MONSTER_POSES,
  monsterMotionProfile,
  monsterMovement,
  monsterPose,
} from "./monsterMovement";

describe("Monster Lab authored movement poses", () => {
  it("offers seven distinct movement images plus idle", () => {
    expect(MONSTER_POSES).toEqual([
      "idle",
      "bounce",
      "spin",
      "roar",
      "fly",
      "dance",
      "sleep",
      "celebrate",
    ]);
    expect(MONSTER_MOVEMENTS).toHaveLength(7);
    expect(new Set(MONSTER_MOVEMENTS.map((movement) => movement.pose)).size).toBe(7);
    expect(new Set(MONSTER_MOVEMENTS.map((movement) => movement.en)).size).toBe(7);
    expect(new Set(MONSTER_MOVEMENTS.map((movement) => movement.es)).size).toBe(7);
    expect(MONSTER_MOVEMENTS.every((movement) => movement.duration >= 1700)).toBe(true);
  });

  it("normalizes unknown actions to the permanent idle image", () => {
    expect(monsterPose("ROAR")).toBe("roar");
    expect(monsterPose(" celebrate ")).toBe("celebrate");
    expect(monsterPose("unknown")).toBe("idle");
    expect(monsterMovement("sleep")?.en).toBe("Sleep");
    expect(monsterMovement("idle")).toBeUndefined();
  });

  it("assigns a body-aware motion profile to every original monster", () => {
    expect(Object.keys(MONSTER_MOTION_PROFILES)).toHaveLength(PREMIUM_MONSTER_BODIES.length);
    for (const body of PREMIUM_MONSTER_BODIES) {
      const profile = monsterMotionProfile(body);
      expect(profile.mass).toMatch(/^(light|medium|heavy)$/);
      expect(profile.locomotion).toMatch(/^(ground|winged|floating|swimming|slime|mechanical)$/);
      expect(profile.temperament).toMatch(/^(playful|fierce|mystic|regal|tech|gentle|stoic)$/);
    }
  });

  it("keeps heavy, floating, winged, slime, swimming, and mechanical bodies visually distinct", () => {
    expect(monsterMotionProfile("Stone Golem")).toMatchObject({ mass: "heavy", locomotion: "ground" });
    expect(monsterMotionProfile("Spirit")).toMatchObject({ mass: "light", locomotion: "floating" });
    expect(monsterMotionProfile("Dragon")).toMatchObject({ locomotion: "winged", temperament: "fierce" });
    expect(monsterMotionProfile("Blob")).toMatchObject({ locomotion: "slime", temperament: "playful" });
    expect(monsterMotionProfile("Aquatic")).toMatchObject({ locomotion: "swimming" });
    expect(monsterMotionProfile("Mecha")).toMatchObject({ mass: "heavy", locomotion: "mechanical", temperament: "tech" });
  });
});
