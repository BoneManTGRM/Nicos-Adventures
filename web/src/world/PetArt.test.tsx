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
    expect(html).toContain("<svg");
    expect(html).toContain(`data-pet-species-art="${species}"`);
    expect(html).toContain(species);
  });

  it.each(PET_OPTIONS.accessory)("renders the %s accessory without a paw fallback", (accessory) => {
    const html = renderToStaticMarkup(<PetArt pet={{ ...basePet, accessory }} />);
    expect(html).not.toContain("🐾");
    expect(html).toContain("pet-art");
  });
});
