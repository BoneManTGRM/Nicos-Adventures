import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IllustratedWorldMap } from "./IllustratedWorldMap";

describe("Illustrated World Map", () => {
  it("uses the premium broken-bridge artwork before Dinosaur Valley unlocks", () => {
    const markup = renderToStaticMarkup(
      <IllustratedWorldMap
        alt="Living illustrated map of Nico's World"
        description="Choose a landmark below. No dragging or time limit."
        dinosaurValleyAvailable={false}
      />,
    );

    expect(markup).toContain('data-map-art="premium-storybook"');
    expect(markup).toContain('data-valley-status="locked"');
    expect(markup).toContain("nicos-world-map-1672.webp");
    expect(markup).not.toContain("nicos-world-map-restored-1672.webp");
  });

  it("switches to the restored bridge artwork after the route opens", () => {
    const markup = renderToStaticMarkup(
      <IllustratedWorldMap
        alt="Mapa ilustrado viviente del Mundo de Nico"
        description="Elige un lugar abajo. No necesitas arrastrar ni tienes límite de tiempo."
        dinosaurValleyAvailable
      />,
    );

    expect(markup).toContain('data-valley-status="open"');
    expect(markup).toContain("nicos-world-map-restored-1672.webp");
    expect(markup).toContain("Mapa ilustrado viviente del Mundo de Nico");
  });
});
