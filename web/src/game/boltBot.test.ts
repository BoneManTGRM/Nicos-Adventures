import { describe, expect, it } from "vitest";
import { starterRobot } from "../storage";
import { boltBotAppearanceFromRobot } from "../game3d/boltbot/appearance";
import {
  BOLT_BOT_LOGIC_ANSWER,
  BOLT_BOT_MOVEMENT_SEQUENCE,
  BOLT_BOT_SCAN_TARGETS,
  boltBotChamberStage,
  boltBotRoutePose,
  boltBotRouteWaypoints,
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
    const pose = boltBotRoutePose(BOLT_BOT_MOVEMENT_SEQUENCE);
    expect(pose.x).toBeCloseTo(0.05);
    expect(pose.z).toBeCloseTo(0.1);
    expect(pose.heading).toBeCloseTo(Math.PI / 2);
    const waypoints = boltBotRouteWaypoints(BOLT_BOT_MOVEMENT_SEQUENCE);
    expect(waypoints.map(({ command }) => command)).toEqual(["forward", "right", "forward"]);
    expect(waypoints[0]).toMatchObject({ x: -0.8, heading: 0 });
    expect(waypoints[0].z).toBeCloseTo(0.1);
    expect(waypoints[1].heading).toBeCloseTo(Math.PI / 2);
    expect(waypoints[2].x).toBeCloseTo(0.05);
    expect(waypoints[2].z).toBeCloseTo(0.1);
  });

  it("derives the chamber UI only from persisted adventure steps", () => {
    expect(boltBotChamberStage("briefing")).toBe("inactive");
    expect(boltBotChamberStage("map_revealed")).toBe("configuration");
    expect(boltBotChamberStage("robot_configured")).toBe("movement");
    expect(boltBotChamberStage("movement_passed")).toBe("scanner");
    expect(boltBotChamberStage("scanner_passed")).toBe("logic");
    expect(boltBotChamberStage("logic_passed")).toBe("complete");
    expect(boltBotChamberStage("bridge_inspected")).toBe("inactive");
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
