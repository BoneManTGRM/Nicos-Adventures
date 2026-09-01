import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ANIMAL_LIBRARY } from "../FeatureArt";
import { AnimalGeneratorGame } from "./AnimalGeneratorGame";

describe("Mystery Animal Generator", () => {
  it("asks a real field clue without naming the answer", () => {
    const html = renderToStaticMarkup(
      <AnimalGeneratorGame animals={ANIMAL_LIBRARY} language="en" onGenerated={vi.fn()} announce={vi.fn()} />,
    );

    expect(html).toContain("Find an animal with three hearts");
    expect(html).not.toContain("An octopus has three hearts");
    expect(html).toContain("ROUND");
    expect(html).toContain("STREAK");
    expect(html).toContain("Giant Pacific Octopus");
  });

  it("uses a localized adaptation clue in Mexican Spanish", () => {
    const html = renderToStaticMarkup(
      <AnimalGeneratorGame animals={ANIMAL_LIBRARY} language="es-MX" onGenerated={vi.fn()} announce={vi.fn()} />,
    );

    expect(html).toContain("Puede cambiar de color y textura");
    expect(html).toContain("PISTA DE CAMPO");
    expect(html).toContain("RACHA");
  });
});
