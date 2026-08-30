import { describe, expect, it } from "vitest";
import { ANIMAL_LIBRARY } from "../FeatureArt";
import { ANIMAL_HABITAT_TRAILS, habitatTrail } from "./animalForestTrail";

describe("Animal Forest habitat trail contract", () => {
  it("covers every habitat in the existing 32-animal library", () => {
    const catalogHabitats = [...new Set(ANIMAL_LIBRARY.map((animal) => animal.habitat))].sort();
    expect(ANIMAL_HABITAT_TRAILS.map((trail) => trail.id).sort()).toEqual(catalogHabitats);
  });

  it("uses a deterministic local trail fallback", () => {
    expect(habitatTrail("Ocean")).toMatchObject({ icon: "🌊", color: "#38bdf8" });
    expect(habitatTrail("Unknown legacy habitat")).toEqual(ANIMAL_HABITAT_TRAILS[0]);
  });
});
