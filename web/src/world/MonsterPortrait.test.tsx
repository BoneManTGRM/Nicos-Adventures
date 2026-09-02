import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterPortrait } from "./MonsterPortrait";

function render(body: string) {
  return renderToStaticMarkup(
    <MonsterPortrait body={body} color="Aqua" arms="Tiny arms" label={`${body} preview`} />,
  );
}

describe("Monster Lab premium body portraits", () => {
  it("renders an atlas body with its permanent face treatment", () => {
    const html = render("Dragon");
    expect(html).toContain('data-monster-portrait-body="Dragon"');
    expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
    expect(html).toContain('data-monster-face-signature="sculpted-dragon"');
    expect(html).toContain("premium-monster-bodies-atlas");
  });

  it("keeps the Lizard Alien's face integrated into its body art", () => {
    const html = render("Lizard Alien");
    expect(html).toContain('data-monster-face-treatment="integrated-lizard"');
    expect(html).toContain("premium-lizard-alien");
    expect(html).not.toContain('class="monster-portrait__face"');
  });

  it("uses the dedicated alien arm atlas without losing the visor", () => {
    const html = renderToStaticMarkup(
      <MonsterPortrait body="Alien" color="Electric Blue" arms="Four arms" label="Alien preview" />,
    );
    expect(html).toContain("premium-alien-arms-atlas");
    expect(html).toContain('data-monster-face-treatment="integrated-visor"');
    expect(html).toContain('data-monster-face-signature="integrated-visor"');
  });
});
