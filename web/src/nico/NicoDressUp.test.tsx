import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { defaultWardrobe } from "../storage";
import { NicoCostumeFigure, NICO_COSTUME_DECORATIONS } from "./NicoCostumeFigure";
import { applyNicoProfession, filterNicoProfessions, NICO_PROFESSIONS } from "./NicoDressUp";
import { wardrobeForPreset } from "./wardrobe/catalog";

describe("Nico wardrobe profession catalog", () => {
  it("provides 26 unique bilingual profession presets", () => {
    expect(NICO_PROFESSIONS).toHaveLength(26);
    expect(new Set(NICO_PROFESSIONS.map((item) => item.id)).size).toBe(26);
    expect(NICO_PROFESSIONS.every((item) => item.name.en && item.name["es-MX"])).toBe(true);
    for (const profession of NICO_PROFESSIONS) {
      expect(wardrobeForPreset(profession.id).presetId).toBe(profession.id);
    }
  });

  it("searches professions in both supported languages", () => {
    expect(filterNicoProfessions("tennis", "en").map((item) => item.id)).toContain("tennis-player");
    expect(filterNicoProfessions("jardinero", "es-MX").map((item) => item.id)).toEqual(["gardener"]);
    expect(filterNicoProfessions("libros", "es-MX").map((item) => item.id)).toContain("librarian");
  });

  it("preserves speech settings and installs the full selected wardrobe preset", () => {
    const astronaut = NICO_PROFESSIONS.find((item) => item.id === "astronaut")!;
    const next = applyNicoProfession(
      {
        profession: "explorer",
        accentColor: "#16a34a",
        speechEnabled: false,
        wardrobe: defaultWardrobe("explorer", "#16a34a"),
      },
      astronaut,
    );
    expect(next.profession).toBe("astronaut");
    expect(next.accentColor).toBe(astronaut.accent);
    expect(next.speechEnabled).toBe(false);
    expect(next.wardrobe.presetId).toBe("astronaut");
    expect(next.wardrobe.headwear).toBe("astronaut-helmet");
    expect(next.wardrobe.outerwear).toBe("spacesuit-shell");
    expect(next.wardrobe.shoes).toBe("moon-boots");
    expect(next.wardrobe.prop).toBe("rocket-prop");
  });

  it("keeps legacy fallback decorations defined for every profession", () => {
    for (const profession of NICO_PROFESSIONS) expect(NICO_COSTUME_DECORATIONS[profession.id]).toBeDefined();
  });
});

describe("Nico shared 2D renderer", () => {
  it("renders a supported preset with premium canonical art", () => {
    const wardrobe = wardrobeForPreset("doctor");
    const html = renderToStaticMarkup(
      <NicoCostumeFigure profession="doctor" wardrobe={wardrobe} alt="Doctor Nico" />,
    );
    expect(html).toContain('data-art-state="canonical-2d"');
    expect(html).toContain('data-layered-nico="true"');
    expect(html).toContain('data-nico-preset="doctor"');
    expect(html).toContain('aria-label="Doctor Nico"');
    expect(html).not.toContain("data:image/svg+xml");
  });

  it("renders the same wardrobe in compact synchronized placements", () => {
    const wardrobe = wardrobeForPreset("librarian");
    const html = renderToStaticMarkup(
      <NicoCostumeFigure profession="librarian" wardrobe={wardrobe} compact alt="Librarian Nico" />,
    );
    expect(html).toContain("nico-costume--compact");
    expect(html).toContain('data-art-state="layered-wardrobe"');
    expect(html).toContain('data-layered-nico="true"');
    expect(html).toContain('data-nico-renderer="layered-svg"');
  });

  it("derives a complete layered preset when a legacy caller provides only a profession", () => {
    const html = renderToStaticMarkup(<NicoCostumeFigure profession="firefighter" alt="Firefighter Nico" />);
    expect(html).toContain('data-art-state="layered-wardrobe"');
    expect(html).toContain("data:image/svg+xml");
    expect(html).toContain('alt="Firefighter Nico"');
  });
});
