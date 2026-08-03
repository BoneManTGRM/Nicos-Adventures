import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NicoCostumeFigure, NICO_COSTUME_DECORATIONS } from "./NicoCostumeFigure";
import { filterNicoProfessions, NICO_PROFESSIONS } from "./NicoDressUp";

describe("Nico Phase 2 dress-up catalog", () => {
  it("provides 26 unique bilingual outfit options", () => {
    expect(NICO_PROFESSIONS).toHaveLength(26);
    expect(new Set(NICO_PROFESSIONS.map((item) => item.id)).size).toBe(26);
    expect(NICO_PROFESSIONS.every((item) => item.name.en && item.name["es-MX"])).toBe(true);
  });

  it("searches jobs in both supported languages", () => {
    expect(filterNicoProfessions("tennis", "en").map((item) => item.id)).toContain("tennis-player");
    expect(filterNicoProfessions("jardinero", "es-MX").map((item) => item.id)).toEqual(["gardener"]);
    expect(filterNicoProfessions("libros", "es-MX").map((item) => item.id)).toContain("librarian");
  });

  it("defines visible costume decorations for every profession", () => {
    for (const profession of NICO_PROFESSIONS) {
      expect(NICO_COSTUME_DECORATIONS[profession.id]).toBeDefined();
    }
  });
});

describe("Nico approved-art regression", () => {
  it("renders a recognizable character fallback only when approved local art is unavailable", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure artSource="" profession="doctor" alt="Doctor Nico" />,
    );

    expect(html).toContain('data-art-state="fallback"');
    expect(html).toContain("nico-costume__fallback-face");
    expect(html).toContain('aria-label="Doctor Nico"');
  });

  it("renders the exact approved outfit sprite for mapped professions", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure
        artSource="data:image/jpeg;base64,/9j/character"
        outfitArtSource="data:image/jpeg;base64,/9j/outfits"
        profession="astronaut"
        alt="Astronaut Nico"
      />,
    );

    expect(html).toContain('data-art-state="approved-outfit"');
    expect(html).toContain('data-approved-nico-outfit="true"');
    expect(html).toContain("600% 200%");
    expect(html).not.toContain("nico-costume__fallback-face");
  });

  it("uses the approved full-body Nico art for professions without a dedicated sheet crop", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure
        artSource="data:image/jpeg;base64,/9j/character"
        outfitArtSource="data:image/jpeg;base64,/9j/outfits"
        profession="gardener"
        alt="Gardener Nico"
      />,
    );

    expect(html).toContain('data-art-state="approved-character"');
    expect(html).toContain('data-approved-nico-art="true"');
    expect(html).toContain("200% 100%");
  });
});
