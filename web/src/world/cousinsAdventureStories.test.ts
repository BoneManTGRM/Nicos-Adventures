import { describe, expect, it } from "vitest";
import { buildCousinsStory, COUSINS_DESTINATIONS, type AdventureTheme, type CousinLead } from "./cousinsAdventureStories";

describe("cousins adventure storybooks", () => {
  it("builds six bilingual pages for all 45 customizable adventures", () => {
    const leads: CousinLead[] = ["nico", "becca", "lua"];
    const themes: AdventureTheme[] = ["brave", "kind", "curious"];
    let combinations = 0;
    for (const destination of COUSINS_DESTINATIONS) {
      for (const theme of themes) {
        for (const lead of leads) {
          for (const language of ["en", "es-MX"] as const) {
            const pages = buildCousinsStory(language, destination.id, theme, lead);
            expect(pages).toHaveLength(6);
            expect(pages.every((page) => page.title.length > 2 && page.text.length > 20)).toBe(true);
          }
          combinations += 1;
        }
      }
    }
    expect(combinations).toBe(45);
  });

  it("assigns a complete outfit and unique illustration to every stop", () => {
    expect(new Set(COUSINS_DESTINATIONS.map((item) => item.artIndex)).size).toBe(5);
    expect(COUSINS_DESTINATIONS.every((item) => item.beccaOutfit.en && item.luaOutfit.en)).toBe(true);
  });
});
