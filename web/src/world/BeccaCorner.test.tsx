import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BeccaCorner } from "./BeccaCorner";

describe("Becca and Lua magic workshop", () => {
  it("shows both full-body creators and a four-step unicorn generator", () => {
    const html = renderToStaticMarkup(<BeccaCorner language="en" />);

    expect(html).toContain("Becca and Lua, together");
    expect(html).toContain('alt="Becca"');
    expect(html).toContain('alt="Lua"');
    expect(html).toContain("Choose Becca");
    expect(html).toContain("Choose Lua");
    expect(html).toContain("Generator steps");
    expect(html).toContain("Unicorn movements");
    expect(html).toContain("Becca beside the Unicorn Generator");
    expect(html).toContain("Choose Becca or Lua");
    expect(html).toContain('data-host="becca"');
    expect(html).toContain('data-unicorn-pose="prance"');
    expect(html.match(/class="becca-unicorn /g)).toHaveLength(1);
    expect(html).not.toContain("unicorn-generator-art");
    expect(html).not.toContain("Becca leads");
    expect(html).not.toContain("Lua leads");
    expect(html).toContain("Turn");
    expect(html).not.toContain("Spin");
  });

  it("keeps the expanded workshop natural in Mexican Spanish", () => {
    const html = renderToStaticMarkup(<BeccaCorner language="es-MX" />);

    expect(html).toContain("Becca y Lua, juntas");
    expect(html).toContain("Elegir a Becca");
    expect(html).toContain("Elegir a Lua");
    expect(html).toContain("Elige a Becca o Lua");
    expect(html).toContain("Pasos del generador");
    expect(html).toContain("Movimientos del unicornio");
  });
});
