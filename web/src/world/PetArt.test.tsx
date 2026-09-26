import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PetRecord } from "../types";
import { PET_OPTIONS } from "./catalogs";
import { PetArt } from "./PetArt";

const basePet: PetRecord = {
  id: "pet-art-test",
  name: "Sparky",
  species: "Robot Dog",
  color: "Blue",
  accessory: "Explorer Scarf",
  personality: "Playful",
  bond: 1,
  tricks: [],
};

describe("illustrated robot pets", () => {
  it.each(PET_OPTIONS.species)("renders illustrated art for %s", (species) => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, species }} />);
    expect(html).toContain(`data-pet-species-art="${species}"`);
    expect(html).toContain(species);
    if (species === "Robot Dog") {
      expect(html).toContain('data-pet-renderer="premium-sparky"');
      expect(html).toContain("sparky-idle-v2.webp");
    } else {
      expect(html).toContain('data-pet-renderer="premium-collection"');
      expect(html).toContain("crew-");
    }
  });

  it.each(PET_OPTIONS.accessory)("renders the %s accessory without a paw fallback", (accessory) => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, accessory }} />);
    expect(html).not.toContain("🐾");
    expect(html).toContain("pet-art");
  });

  it.each([
    ["Sit", "sit", "sparky-sit-v2.webp"],
    ["High Five", "high-five", "sparky-high-five-v2.webp"],
    ["Fetch Tool", "fetch-tool", "sparky-fetch-tool-v2.webp"],
    ["Spin", "idle", "sparky-idle-v2.webp"],
  ] as const)("uses the premium %s performance pose", (action, pose, asset) => {
    const html = renderToStaticMarkup(<PetArt pet={basePet} action={action} />);
    expect(html).toContain(`data-pet-pose="${pose}"`);
    expect(html).toContain(asset);
  });

  it("keeps customizable robot dog variants in the illustrated collection", () => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, color: "Gold" }} />);
    expect(html).toContain('data-pet-renderer="premium-collection"');
    expect(html).not.toContain("premium-sparky");
  });
  it("keeps every species and color in the premium collection with real accessories", () => {
    for (const species of PET_OPTIONS.species) for (const color of PET_OPTIONS.color) for (const accessory of PET_OPTIONS.accessory) {
      const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, species, color, accessory }} />);
      expect(html).toContain("<img");
      expect(html).toMatch(/data-pet-renderer="premium-(collection|sparky)"/);
      if (!(species === "Robot Dog" && color === "Blue" && accessory === "Explorer Scarf")) {
        expect(html).toContain(`data-pet-accessory="${accessory}"`);
        expect(html).toContain('result="blueArmor"');
      }
    }
  });

});
