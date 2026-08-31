import { describe, expect, it } from "vitest";
import { friendlyDuelScore, initialFriendlyDuelState, playFriendlyDuelMove } from "./friendlyDuel";

describe("friendly one-versus-one duel", () => {
  it("uses deterministic, mild courage and mischief rules", () => {
    const quick = playFriendlyDuelMove(initialFriendlyDuelState, "quick");
    expect(quick).toMatchObject({ nicoCourage: 5, rivalMischief: 5, starCharge: 2, round: 2, status: "playing" });

    const blocked = playFriendlyDuelMove(quick, "block");
    expect(blocked).toMatchObject({ nicoCourage: 5, rivalMischief: 5, round: 3, lastEvent: "blocked" });

    const star = playFriendlyDuelMove(blocked, "star");
    expect(star).toMatchObject({ nicoCourage: 3, rivalMischief: 3, starCharge: 0, round: 4 });
  });

  it("ends with friendship and never produces negative meters", () => {
    let state = initialFriendlyDuelState;
    for (const move of ["quick", "block", "star", "quick", "block", "star"] as const) {
      state = playFriendlyDuelMove(state, move);
    }
    expect(state.status).toBe("won");
    expect(state.rivalMischief).toBe(0);
    expect(state.nicoCourage).toBeGreaterThan(0);
    expect(friendlyDuelScore(state)).toBeGreaterThan(0);
  });

  it("requires a charged Star Move and offers a safe breather instead of defeat", () => {
    const uncharged = playFriendlyDuelMove({ ...initialFriendlyDuelState, starCharge: 0 }, "star");
    expect(uncharged).toEqual({ ...initialFriendlyDuelState, starCharge: 0 });

    const breather = playFriendlyDuelMove({ ...initialFriendlyDuelState, nicoCourage: 1, round: 3 }, "quick");
    expect(breather).toMatchObject({ nicoCourage: 0, status: "breather", lastEvent: "breather" });
  });
});
