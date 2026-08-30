import { describe, expect, it } from "vitest";
import { starterRobot } from "../storage";
import { boltBotAppearanceFromRobot } from "../game3d/boltbot/appearance";
import {
  BOLT_BOT_LOGIC_ANSWER,
  BOLT_BOT_MOVEMENT_SEQUENCE,
  BOLT_BOT_SCAN_TARGETS,
  evaluateBoltBotReadiness,
  passesLogicTest,
  passesMovementTest,
  passesScannerTest,
  strongestScanTarget,
} from "./boltBot";

describe("BoltBot golden-adventure contract", () => {
  it("uses the existing robot profile fields for configuration readiness", () => {
    const starter = starterRobot("Nico");
    expect(evaluateBoltBotReadiness(starter)).toEqual({ ready: false, missing: ["repair"] });

    const configured = { ...starter, arms: "Tool Arms" };
    expect(evaluateBoltBotReadiness(configured)).toEqual({ ready: true, missing: [] });
    expect(evaluateBoltBotReadiness({ ...configured, base: "Unknown legacy base" }).missing).toEqual(["movement"]);
    expect(boltBotAppearanceFromRobot(configured)).toEqual({ primary: "#38bdf8", accent: "#facc15" });
    expect(boltBotAppearanceFromRobot({ color: "Royal Purple", secondary_color: "Neon Cyan" }))
      .toEqual({ primary: "#8b5cf6", accent: "#22d3ee" });
  });

  it("requires the ordered movement route", () => {
    expect(passesMovementTest(BOLT_BOT_MOVEMENT_SEQUENCE)).toBe(true);
    expect(passesMovementTest(["forward", "forward", "right"])).toBe(false);
    expect(passesMovementTest(["forward", "right"])).toBe(false);
  });

  it("requires the unique strongest scanner signal", () => {
    expect(strongestScanTarget(BOLT_BOT_SCAN_TARGETS)).toBe("star-core-socket");
    expect(passesScannerTest("star-core-socket")).toBe(true);
    expect(passesScannerTest("loose-bolt")).toBe(false);
    expect(strongestScanTarget([{ id: "a", signal: 4 }, { id: "b", signal: 4 }])).toBeNull();
  });

  it("uses a deterministic age-appropriate logic answer", () => {
    expect(BOLT_BOT_LOGIC_ANSWER).toBe("star");
    expect(passesLogicTest("star")).toBe(true);
    expect(passesLogicTest("bolt")).toBe(false);
  });
});
