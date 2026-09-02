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
  it.each(PET_OPTIONS.species)("renders full SVG art for %s", (species) => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, species }} />);
    expect(html).toContain(`data-pet-species-art="${species}"`);
    expect(html).toContain(species);
    if (species === "Robot Dog") {
      expect(html).toContain('data-pet-renderer="premium-sparky"');
      expect(html).toContain("sparky-idle-v2.webp");
    } else {
      expect(html).toContain("<svg");
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

  it("keeps customizable robot dog variants on the matching SVG renderer", () => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, color: "Gold" }} />);
    expect(html).toContain("<svg");
    expect(html).not.toContain("premium-sparky");
  });
});
