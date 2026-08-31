import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IllustratedWorldFallback } from "./IllustratedWorldFallback";

describe("Illustrated World fallback", () => {
  it("uses the premium broken-bridge artwork before Dinosaur Valley unlocks", () => {
    const markup = renderToStaticMarkup(
      <IllustratedWorldFallback
        alt="Living illustrated map of Nico's World"
        unavailableMessage="The illustrated world is unavailable. Choose any landmark below."
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
      <IllustratedWorldFallback
        alt="Mapa ilustrado viviente del Mundo de Nico"
        unavailableMessage="El mundo ilustrado no está disponible. Elige cualquier lugar abajo."
        dinosaurValleyAvailable
      />,
    );

    expect(markup).toContain('data-valley-status="open"');
    expect(markup).toContain("nicos-world-map-restored-1672.webp");
    expect(markup).toContain("Mapa ilustrado viviente del Mundo de Nico");
  });
});
