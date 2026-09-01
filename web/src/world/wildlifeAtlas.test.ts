import { describe, expect, it } from "vitest";
import showtimeData from "../catalogs/showtime.json";
import { PREMIUM_WILDLIFE_REPLACEMENTS, WILDLIFE_IDS } from "./wildlifeAtlas";

describe("premium wildlife art", () => {
  it("maps every field-guide animal to one full-body atlas cell", () => {
    expect(WILDLIFE_IDS).toHaveLength(32);
    expect(new Set(WILDLIFE_IDS).size).toBe(32);
    expect(WILDLIFE_IDS).toContain("jaguar");
    expect(WILDLIFE_IDS).toContain("sloth");
    expect(WILDLIFE_IDS).toContain("axolotl");
    expect(WILDLIFE_IDS).toContain("andean-condor");
  });

  it("replaces the two damaged pale atlas cells with standalone transparent art", () => {
    expect(Object.keys(PREMIUM_WILDLIFE_REPLACEMENTS)).toEqual(["polar-bear", "arctic-fox"]);
    expect(PREMIUM_WILDLIFE_REPLACEMENTS["polar-bear"]).toContain("polar-bear-premium-v2");
    expect(PREMIUM_WILDLIFE_REPLACEMENTS["arctic-fox"]).toContain("arctic-fox-premium-v2");
  });

  it("allows animal characters to use the gentle Showtime movements", () => {
    const allowed = showtimeData.poses
      .filter((pose) => pose.kinds.includes("animal"))
      .map((pose) => pose.id);
    expect(allowed).toEqual(expect.arrayContaining(["idle", "celebrate", "dance", "bounce", "sleep"]));
  });
});
