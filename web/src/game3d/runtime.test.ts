import { describe, expect, it } from "vitest";
import { locomotionBlendWeights, resolveLocomotionState } from "./animation/locomotion";
import { assetUrl } from "./assets";
import { keyboardAction, movementInput, type InputAction } from "./input/actions";
import { selectQualityProfile } from "./quality";
import { CharacterMotor } from "./simulation/characterMotor";
import { AdventureAudio } from "./audio/AdventureAudio";

describe("minimal 3D runtime foundation", () => {
  it("accelerates, turns with a bounded rate, and settles without snapping", () => {
    const motor = new CharacterMotor();
    const first = motor.step({ x: 0, z: 1 }, 1 / 60);
    expect(first.speed).toBeGreaterThan(0);
    expect(first.speed).toBeLessThan(motor.config.walkSpeed);

    const turned = motor.step({ x: 1, z: 0 }, 1 / 60);
    expect(turned.heading).toBeGreaterThan(0);
    expect(turned.heading).toBeLessThan(Math.PI / 2);

    let settled = turned;
    for (let index = 0; index < 120; index += 1) {
      settled = motor.step({ x: 0, z: 0 }, 1 / 60);
    }
    expect(settled.speed).toBe(0);
  });

  it("produces normalized locomotion blend weights", () => {
    expect(resolveLocomotionState(0, 0)).toBe("idle");
    expect(resolveLocomotionState(0, 0.8)).toBe("turn");
    expect(resolveLocomotionState(2, 0)).toBe("walk");
    expect(resolveLocomotionState(4, 0)).toBe("run");

    const weights = locomotionBlendWeights(2.4, 0.2);
    expect(Object.values(weights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(Object.values(weights).every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it("keeps quality tiers deterministic and gameplay-independent", () => {
    const low = selectQualityProfile({
      hardwareConcurrency: 2,
      deviceMemory: 2,
      viewportWidth: 390,
      saveData: true,
      reducedMotion: true,
    });
    const high = selectQualityProfile({
      hardwareConcurrency: 12,
      deviceMemory: 16,
      viewportWidth: 1440,
      saveData: false,
      reducedMotion: false,
    });

    expect(low).toMatchObject({ tier: "low", maxDpr: 1, shadows: false, reducedMotion: true });
    expect(high).toMatchObject({ tier: "high", maxDpr: 2, shadows: true, reducedMotion: false });
  });

  it("uses stable manifest keys and rejects missing assets", () => {
    const manifest = { "environment.star-bridge": "/assets/star-bridge.glb" };
    expect(assetUrl(manifest, "environment.star-bridge")).toBe("/assets/star-bridge.glb");
    expect(() => assetUrl(manifest, "character.nico")).toThrow("character.nico");
  });

  it("maps keyboard and accessible controls into shared actions", () => {
    expect(keyboardAction("KeyW")).toBe("move-forward");
    expect(keyboardAction("Space")).toBe("interact");
    expect(keyboardAction("Unknown")).toBeNull();

    const actions = new Set<InputAction>(["move-forward", "move-right"]);
    const movement = movementInput(actions);
    expect(Math.hypot(movement.x, movement.z)).toBeCloseTo(1);
    expect(movement.x).toBeGreaterThan(0);
    expect(movement.z).toBeGreaterThan(0);
  });

  it("keeps audio optional when Web Audio is unavailable", () => {
    const audio = new AdventureAudio();
    expect(audio.isAvailable).toBe(false);
    expect(audio.isUnlocked).toBe(false);
  });
});
