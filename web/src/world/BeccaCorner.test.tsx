import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BeccaCorner } from "./BeccaCorner";

describe("Becca and Lua magic workshop", () => {
  it("shows both full-body creators and a four-step unicorn generator", () => {
    const html = renderToStaticMarkup(<BeccaCorner language="en" />);

    expect(html).toContain("Becca and Lua, together");
    expect(html).toContain('aria-label="Becca"');
    expect(html).toContain('aria-label="Lua"');
    expect(html).toContain("Choose Becca");
    expect(html).toContain("Choose Lua");
    expect(html).toContain("Generator steps");
    expect(html).toContain("Unicorn movements");
    expect(html).toContain("Becca beside the Unicorn Generator");
  });

  it("keeps the expanded workshop natural in Mexican Spanish", () => {
    const html = renderToStaticMarkup(<BeccaCorner language="es-MX" />);

    expect(html).toContain("Becca y Lua, juntas");
    expect(html).toContain("Elegir a Becca");
    expect(html).toContain("Elegir a Lua");
    expect(html).toContain("Pasos del generador");
    expect(html).toContain("Movimientos del unicornio");
  });
});
