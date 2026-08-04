import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import { completeCreativeMilestones, creativeMilestoneId, roomGoalId } from "./creativeProgression";

describe("creative and room progression identifiers", () => {
  it("builds stable creative and Robot Home mission IDs", () => {
    expect(creativeMilestoneId("artwork", 3)).toBe("creative:artwork:3");
    expect(creativeMilestoneId("story", 5)).toBe("creative:story:5");
    expect(roomGoalId("decorator")).toBe("robot-home:decorator");
  });

  it("awards only newly crossed creative milestones", () => {
    const profile = createProfile("Nico", "en");
    const first = completeCreativeMilestones(profile, "artwork", 0, 3);
    const repeated = completeCreativeMilestones(first.profile, "artwork", 2, 3);

    expect(first.milestones).toEqual([1, 3]);
    expect(first.profile.stars).toBe(profile.stars + 3);
    expect(repeated.milestones).toEqual([]);
    expect(repeated.profile.stars).toBe(first.profile.stars);
  });
});
