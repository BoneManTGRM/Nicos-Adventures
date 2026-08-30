import { describe, expect, it } from "vitest";
import {
  STAR_BRIDGE_ENGINEER,
  initialStarBridgeState,
  isStarBridgeComplete,
  reduceStarBridge,
} from "./goldenAdventure";

describe("Star Bridge golden adventure", () => {
  it("requires the canonical adventure sequence before completion", () => {
    let state = initialStarBridgeState();

    state = reduceStarBridge(state, { type: "COMPLETE_ADVENTURE" });
    expect(state.step).toBe("briefing");

    const events = [
      "REVEAL_BRIDGE",
      "CONFIGURE_ROBOT",
      "PASS_MOVEMENT_TEST",
      "PASS_SCANNER_TEST",
      "PASS_LOGIC_TEST",
      "INSPECT_BRIDGE",
      "INSTALL_STAR_CORE",
    ] as const;

    for (const type of events) state = reduceStarBridge(state, { type });
    expect(state.step).toBe("star_core_installed");

    state = reduceStarBridge(state, { type: "COMPLETE_ADVENTURE" }, () => "2026-08-30T15:00:00.000Z");
    expect(isStarBridgeComplete(state)).toBe(true);
    expect(state.completedAt).toBe("2026-08-30T15:00:00.000Z");
    expect(state.museumAchievements).toContain(STAR_BRIDGE_ENGINEER);
  });

  it("rejects out-of-order progression", () => {
    const initial = initialStarBridgeState();
    const skipped = reduceStarBridge(initial, { type: "PASS_SCANNER_TEST" });
    expect(skipped).toEqual(initial);
  });

  it("does not duplicate the completion reward", () => {
    let state = initialStarBridgeState();
    const events = [
      "REVEAL_BRIDGE",
      "CONFIGURE_ROBOT",
      "PASS_MOVEMENT_TEST",
      "PASS_SCANNER_TEST",
      "PASS_LOGIC_TEST",
      "INSPECT_BRIDGE",
      "INSTALL_STAR_CORE",
      "COMPLETE_ADVENTURE",
    ] as const;

    for (const type of events) state = reduceStarBridge(state, { type }, () => "2026-08-30T15:00:00.000Z");
    const completed = state;
    state = reduceStarBridge(state, { type: "COMPLETE_ADVENTURE" }, () => "later");

    expect(state).toBe(completed);
    expect(state.museumAchievements.filter((id) => id === STAR_BRIDGE_ENGINEER)).toHaveLength(1);
  });

  it("resets to a clean local state", () => {
    const progressed = reduceStarBridge(initialStarBridgeState(), { type: "REVEAL_BRIDGE" });
    expect(reduceStarBridge(progressed, { type: "RESET_ADVENTURE" })).toEqual(initialStarBridgeState());
  });
});
