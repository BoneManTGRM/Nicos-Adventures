import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createProfile } from "../storage";
import { FriendlyDuel } from "./FriendlyDuel";

describe("Friendly Duel view", () => {
  it("renders a touch-friendly bilingual 2D arena using Nico's saved outfit", () => {
    const profile = createProfile("Nico", "es-MX");
    const html = renderToStaticMarkup(<FriendlyDuel profile={profile} update={vi.fn()} announce={vi.fn()} close={vi.fn()} />);

    expect(html).toContain("Duelo de amistad de Nico");
    expect(html).toContain("Movimiento rápido");
    expect(html).toContain("Bloquear");
    expect(html).toContain("Movimiento estelar");
    expect(html).toContain('data-duel-status="playing"');
    expect(html).toContain('data-art-state="canonical-2d"');
    expect(html).not.toContain("<canvas");
    expect(html).not.toContain("blood");
  });
});
