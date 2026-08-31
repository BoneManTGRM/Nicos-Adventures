import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VisitorCounter } from "./VisitorCounter";

describe("privacy-safe visitor counter", () => {
  it("explains the one-browser aggregate without exposing profile data", () => {
    const markup = renderToStaticMarkup(<VisitorCounter language="en" />);
    expect(markup).toContain("explorers have visited this world");
    expect(markup).toContain("No personal data is stored");
    expect(markup).not.toContain("playerName");
  });

  it("is fully localized in Mexican Spanish", () => {
    const markup = renderToStaticMarkup(<VisitorCounter language="es-MX" />);
    expect(markup).toContain("exploradores han visitado este mundo");
    expect(markup).toContain("No guardamos datos personales");
  });
});
