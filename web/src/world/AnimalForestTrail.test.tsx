import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AnimalForestTrail } from "./AnimalForestTrail";
import { ANIMAL_HABITAT_TRAILS } from "./animalForestTrail";

const habitats = ["All", ...ANIMAL_HABITAT_TRAILS.map((trail) => trail.id)];

describe("premium illustrated Animal Forest trail", () => {
  it("renders local 2D habitat art without a canvas", () => {
    const markup = renderToStaticMarkup(
      <AnimalForestTrail
        language="en"
        habitat="Ocean"
        habitats={habitats}
        discovered={15}
        total={32}
        select={vi.fn()}
      />,
    );

    expect(markup).toContain('data-habitat-renderer="premium-2d"');
    expect(markup).toContain('data-habitat-art="Ocean"');
    expect(markup).toContain("animal-forest-premium-habitats-atlas");
    expect(markup).toContain("Field guide · 15/32");
    expect(markup).not.toContain("<canvas");
    expect(markup).not.toContain("game-canvas");
  });

  it("keeps every habitat button and natural Mexican Spanish copy", () => {
    const markup = renderToStaticMarkup(
      <AnimalForestTrail
        language="es-MX"
        habitat="All"
        habitats={habitats}
        discovered={2}
        total={32}
        select={vi.fn()}
      />,
    );

    expect(markup.match(/class="animal-forest-trail__habitat"/g)).toHaveLength(10);
    expect(markup).toContain("Todos los senderos");
    expect(markup).toContain("Elige un hábitat abajo");
  });
});
