import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NicoCostumeFigure, NICO_COSTUME_DECORATIONS } from "./NicoCostumeFigure";
import { applyNicoProfession, filterNicoProfessions, NICO_PROFESSIONS } from "./NicoDressUp";
import { getNicoOutfitCell, NICO_OUTFIT_ALIASES } from "./nicoDragArt";

describe("Nico drag-and-drop dress-up catalog", () => {
  it("provides 26 unique bilingual outfit options", () => {
    expect(NICO_PROFESSIONS).toHaveLength(26);
    expect(new Set(NICO_PROFESSIONS.map((item) => item.id)).size).toBe(26);
    expect(NICO_PROFESSIONS.every((item) => item.name.en && item.name["es-MX"])).toBe(true);
  });

  it("maps every profession to one of the local draggable outfit cells", () => {
    for (const profession of NICO_PROFESSIONS) {
      const cell = getNicoOutfitCell(profession.id);
      expect(NICO_OUTFIT_ALIASES[profession.id]).toBeDefined();
      expect(cell.index).toBeGreaterThanOrEqual(0);
      expect(cell.index).toBeLessThan(12);
      expect(cell.column).toBeGreaterThanOrEqual(0);
      expect(cell.column).toBeLessThan(4);
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(3);
    }
  });

  it("searches jobs in both supported languages", () => {
    expect(filterNicoProfessions("tennis", "en").map((item) => item.id)).toContain("tennis-player");
    expect(filterNicoProfessions("jardinero", "es-MX").map((item) => item.id)).toEqual(["gardener"]);
    expect(filterNicoProfessions("libros", "es-MX").map((item) => item.id)).toContain("librarian");
  });

  it("preserves unrelated local preferences when an outfit is applied", () => {
    const astronaut = NICO_PROFESSIONS.find((item) => item.id === "astronaut");
    expect(astronaut).toBeDefined();
    const next = applyNicoProfession(
      { profession: "explorer", accentColor: "#16a34a", speechEnabled: false },
      astronaut!,
    );
    expect(next).toEqual({
      profession: "astronaut",
      accentColor: astronaut!.accent,
      speechEnabled: false,
    });
  });

  it("keeps fallback decorations defined for every profession", () => {
    for (const profession of NICO_PROFESSIONS) expect(NICO_COSTUME_DECORATIONS[profession.id]).toBeDefined();
  });
});

describe("Nico visual-quality strategy", () => {
  it("uses the polished finished outfit in the large Dress Up preview", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure
        outfitArtSource="data:image/jpeg;base64,/9j/finished"
        baseArtSource="data:image/webp;base64,UklGbase"
        dragOutfitSource="data:image/webp;base64,UklGoutfit"
        profession="doctor"
        alt="Doctor Nico"
      />,
    );

    expect(html).toContain('data-art-state="approved-outfit"');
    expect(html).toContain('data-approved-nico-outfit="true"');
    expect(html).not.toContain('data-composed-nico="true"');
  });

  it("keeps approved finished art sharp in compact synchronized placements", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure
        outfitArtSource="data:image/jpeg;base64,/9j/finished"
        baseArtSource="data:image/webp;base64,UklGbase"
        dragOutfitSource="data:image/webp;base64,UklGoutfit"
        profession="doctor"
        compact
        alt="Doctor Nico"
      />,
    );

    expect(html).toContain('data-art-state="approved-outfit"');
    expect(html).toContain('data-approved-nico-outfit="true"');
    expect(html).not.toContain('data-composed-nico="true"');
  });

  it("keeps one body plus outfit layer as a local fallback when approved art is unavailable", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure
        baseArtSource="data:image/webp;base64,UklGbase"
        dragOutfitSource="data:image/webp;base64,UklGoutfit"
        profession="librarian"
        compact
        alt="Librarian Nico"
      />,
    );

    expect(html).toContain('data-art-state="drag-composed"');
    expect(html).toContain('data-composed-nico="true"');
    expect(html).toContain("UklGbase");
    expect(html).toContain("UklGoutfit");
  });

  it("retains a recognizable fallback when local art is unavailable", () => {
    const html = renderToStaticMarkup(<NicoCostumeFigure artSource="" profession="doctor" alt="Doctor Nico" />);
    expect(html).toContain('data-art-state="fallback"');
    expect(html).toContain("nico-costume__fallback-face");
    expect(html).toContain('aria-label="Doctor Nico"');
  });
});
