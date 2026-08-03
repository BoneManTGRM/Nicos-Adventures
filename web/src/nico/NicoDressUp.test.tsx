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

describe("Nico art regression", () => {
  it("renders a recognizable character fallback when local art is unavailable", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure artSource="" profession="doctor" alt="Doctor Nico" />,
    );

    expect(html).toContain('data-art-state="fallback"');
    expect(html).toContain("nico-costume__fallback-face");
    expect(html).toContain('aria-label="Doctor Nico"');
    expect(html).not.toContain("<img");
  });

  it("renders the approved local image when a source is available", () => {
    const html = renderToStaticMarkup(
      <NicoCostumeFigure artSource="data:image/jpeg;base64,/9j/test" profession="astronaut" alt="Astronaut Nico" />,
    );

    expect(html).toContain('data-art-state="loaded"');
    expect(html).toContain("data:image/jpeg;base64,/9j/test");
    expect(html).toContain('data-profession="astronaut"');
  });
});
