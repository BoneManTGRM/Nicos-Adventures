import { describe, expect, it } from "vitest";
import { ANIMAL_LIBRARY, mergeAnimalLibrary } from "../FeatureArt";
import { createProfile } from "../storage";
import { ANIMAL_HABITAT_TRAILS, habitatTrail } from "./animalForestTrail";

describe("Animal Forest habitat trail contract", () => {
  it("covers catalog and preserved starter-profile habitats", () => {
    const habitats = new Set([
      ...ANIMAL_LIBRARY.map((animal) => animal.habitat),
      ...mergeAnimalLibrary(createProfile("Nico").animals).map((animal) => animal.habitat),
    ]);
    for (const habitat of habitats) expect(ANIMAL_HABITAT_TRAILS.some((trail) => trail.id === habitat)).toBe(true);
  });

  it("uses a deterministic local trail fallback", () => {
    expect(habitatTrail("Ocean")).toMatchObject({ icon: "🌊", color: "#38bdf8" });
    expect(habitatTrail("Unknown legacy habitat")).toEqual(ANIMAL_HABITAT_TRAILS[0]);
  });
});
