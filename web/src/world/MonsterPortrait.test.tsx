import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MonsterPortrait } from "./MonsterPortrait";

function render(body: string) {
  return renderToStaticMarkup(
    <MonsterPortrait body={body} color="Aqua" arms="Tiny arms" label={`${body} preview`} />,
  );
}

describe("Monster Lab premium body portraits", () => {
  it("renders the approved Dragon artwork with its permanent face treatment", () => {
    const html = render("Dragon");
    expect(html).toContain('data-monster-portrait-body="Dragon"');
    expect(html).toContain('data-monster-face-treatment="sculpted-dragon"');
    expect(html).toContain('data-monster-face-signature="sculpted-dragon"');
    expect(html).toContain("dragon.webp");
  });

  it("keeps the Lizard Alien's face integrated into its body art", () => {
    const html = render("Lizard Alien");
    expect(html).toContain('data-monster-face-treatment="integrated-lizard"');
    expect(html).toContain("lizard-alien.webp");
    expect(html).not.toContain('class="monster-portrait__face"');
  });

  it("keeps saved alien arm data while using the approved Alien artwork", () => {
    const html = renderToStaticMarkup(
      <MonsterPortrait body="Alien" color="Electric Blue" arms="Four arms" label="Alien preview" />,
    );
    expect(html).toContain("alien.webp");
    expect(html).toContain('data-monster-face-treatment="integrated-visor"');
    expect(html).toContain('data-monster-face-signature="integrated-visor"');
  });
});
