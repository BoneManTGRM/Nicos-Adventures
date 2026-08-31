import { describe, expect, it } from "vitest";
import { ANIMAL_LIBRARY, mergeAnimalLibrary } from "../FeatureArt";
import { createProfile } from "../storage";
import { PREMIUM_ANIMAL_HABITATS, animalForestArtStyle } from "./animalForestArt";
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

  it("maps every habitat to one cell in the premium local atlas", () => {
    expect(PREMIUM_ANIMAL_HABITATS).toEqual(ANIMAL_HABITAT_TRAILS.map((trail) => trail.id));
    expect(animalForestArtStyle("Jungle")).toMatchObject({ backgroundPosition: "0% 0%", backgroundSize: "300% 300%" });
    expect(animalForestArtStyle("Ocean")).toMatchObject({ backgroundPosition: "100% 0%" });
    expect(animalForestArtStyle("Mountains")).toMatchObject({ backgroundPosition: "100% 100%" });
  });
});
