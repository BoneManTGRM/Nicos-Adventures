import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import { reduceStarBridge } from "./goldenAdventure";
import {
  STAR_BRIDGE_FAULT,
  STAR_BRIDGE_FAULT_TARGETS,
  STAR_CORE_INSTALL_SEQUENCE,
  isStarBridgeFault,
  passesStarCoreInstall,
  hasDinosaurValleyAccess,
  starBridgeRepairStage,
} from "./starBridgeRepair";

describe("Broken Star Bridge repair interactions", () => {
  it("opens only after the ordered BoltBot chamber is complete", () => {
    expect(starBridgeRepairStage("scanner_passed")).toBe("inactive");
    expect(starBridgeRepairStage("logic_passed")).toBe("inspect");
    expect(starBridgeRepairStage("bridge_inspected")).toBe("install");
    expect(starBridgeRepairStage("star_core_installed")).toBe("activate");
    expect(starBridgeRepairStage("complete")).toBe("complete");
  });

  it("identifies one canonical bridge fault", () => {
    expect(STAR_BRIDGE_FAULT).toBe("dark-core-socket");
    expect(STAR_BRIDGE_FAULT_TARGETS.filter((target) => target.id === STAR_BRIDGE_FAULT)).toHaveLength(1);
    expect(isStarBridgeFault("dark-core-socket")).toBe(true);
    expect(isStarBridgeFault("cracked-handrail")).toBe(false);
  });

  it("requires the ordered Star Core installation", () => {
    expect(passesStarCoreInstall(STAR_CORE_INSTALL_SEQUENCE)).toBe(true);
    expect(passesStarCoreInstall(["align", "charge", "lock"])).toBe(false);
    expect(passesStarCoreInstall(["align", "lock"])).toBe(false);
  });

  it("locks new profiles while preserving established Dinosaur Valley access", () => {
    const profile = createProfile("Nico");
    expect(hasDinosaurValleyAccess(profile)).toBe(false);
    expect(hasDinosaurValleyAccess({ ...profile, sectionVisits: { ...profile.sectionVisits, "dinosaur-valley": 1 } })).toBe(true);

    let starBridge = profile.adventures.starBridge;
    for (const type of [
      "REVEAL_BRIDGE", "CONFIGURE_ROBOT", "PASS_MOVEMENT_TEST", "PASS_SCANNER_TEST",
      "PASS_LOGIC_TEST", "INSPECT_BRIDGE", "INSTALL_STAR_CORE", "COMPLETE_ADVENTURE",
    ] as const) starBridge = reduceStarBridge(starBridge, { type }, () => "2026-08-30T17:00:00.000Z");
    expect(hasDinosaurValleyAccess({ ...profile, adventures: { ...profile.adventures, starBridge } })).toBe(true);
  });
});
