import { describe, expect, it } from "vitest";
import { isWorldAtlasLandmarkLocked, WORLD_ATLAS_LANDMARKS } from "./livingWorldAtlas";

describe("Living World Atlas", () => {
  it("keeps every featured landmark unique and includes the Golden Adventure route", () => {
    const ids = WORLD_ATLAS_LANDMARKS.map((landmark) => landmark.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("robo-lab");
    expect(ids).toContain("dinosaur-valley");
  });

  it("locks only Dinosaur Valley until the Star Bridge route opens", () => {
    for (const landmark of WORLD_ATLAS_LANDMARKS) {
      expect(isWorldAtlasLandmarkLocked(landmark.id, false)).toBe(landmark.id === "dinosaur-valley");
      expect(isWorldAtlasLandmarkLocked(landmark.id, true)).toBe(false);
    }
  });
});
