import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ROBOT_JOBS } from "../FeatureArt";
import { ui } from "../i18n/core";
import { hasSpanishDisplay } from "../i18n/display";
import { ARCADE_GAMES, MONSTER_OPTIONS, PET_OPTIONS, ROBOT_OPTIONS, ROOM_DECORATIONS, WORLD_SECTIONS } from "./catalogs";
import { BottomNavigation, PageTitle } from "./common";
import type { LocalProfile } from "../types";
import { createProfile } from "../storage";

const flatten = (catalog: Record<string, string[]>) => Object.values(catalog).flat();

describe("bilingual catalog coverage", () => {
  it("provides English and Mexican Spanish for every shared UI label and destination", () => {
    expect(Object.values(ui).every((item) => item.en.trim() && item["es-MX"].trim())).toBe(true);
    expect(WORLD_SECTIONS).toHaveLength(14);
    expect(WORLD_SECTIONS.every((section) => section.name.en && section.name["es-MX"] && section.description.en && section.description["es-MX"])).toBe(true);
  });

  it("translates every visible builder, job, game, and decoration identifier", () => {
    const values = [
      ...flatten(ROBOT_OPTIONS),
      ...ROBOT_JOBS,
      ...flatten(MONSTER_OPTIONS),
      ...flatten(PET_OPTIONS),
      ...ROOM_DECORATIONS,
      ...ARCADE_GAMES,
      "Rainforest", "Ocean", "Savanna", "Arctic", "Desert", "Forest", "Wetlands", "Mountains",
      "Jungle", "Meadow", "Antarctic", "Bamboo Forest", "Cretaceous", "Jurassic",
    ];
    const missing = [...new Set(values)].filter((value) => !hasSpanishDisplay(value));
    expect(missing, `Missing Spanish labels: ${missing.join(", ")}`).toEqual([]);
  });
});

describe("accessible world shell", () => {
  const profile: LocalProfile = { ...createProfile("Nico", "es-MX"), selectedSection: "animal-forest" };

  it("renders a focusable Spanish section heading with a stable section identifier", () => {
    const html = renderToStaticMarkup(<PageTitle sectionId="animal-forest" language="es-MX" />);
    expect(html).toContain('data-section-id="animal-forest"');
    expect(html).toContain('id="page-title"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Bosque animal");
  });

  it("marks the active bottom-navigation destination and exposes a navigation label", () => {
    const html = renderToStaticMarkup(<BottomNavigation profile={profile} open={() => undefined} />);
    expect(html).toContain('aria-label="Destinos principales"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Bosque animal");
  });
});
