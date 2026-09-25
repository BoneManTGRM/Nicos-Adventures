import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createProfile } from "../storage";
import { PetWorkshop } from "./PetWorkshop";
import { PetChallenge } from "./PetChallenge";
import { advancePetGame, beginPetGame, TRICKS } from "./petPlay";
import type { Language, PetRecord } from "../types";

const friend: PetRecord = { id: "pet-sparky", name: "Sparky", species: "Robot Dog", color: "Blue", accessory: "Explorer Scarf", personality: "Playful", bond: 73, tricks: TRICKS.map((trick) => trick.id) };

describe("play-first pet workshop", () => {
  it.each(["en", "es-MX"] as Language[])("renders a compact play screen in %s with saved progress intact", (language) => {
    const profile = { ...createProfile("Nico", language), pets: [friend], activePetId: friend.id };
    const markup = renderToStaticMarkup(<PetWorkshop profile={profile} update={vi.fn()} announce={vi.fn()} />);
    expect(markup).toContain('data-pet-workshop="play-first"');
    expect(markup).toContain('data-pet-renderer="premium-sparky"');
    expect(markup).toContain("73/100");
    expect(markup).toContain("6/6");
    expect(markup).not.toContain("<select");
    expect(markup).not.toContain("<canvas");
    expect(markup).toContain(language === "en" ? "Tool treasure hunt" : "Búsqueda de herramientas");
    expect(markup).toContain(language === "en" ? "Scene for this visit" : "Escenario de esta visita");
    expect(profile.pets[0]).toEqual(friend);
  });
  it("opens customization for a new profile without awarding stars or auto-saving", () => {
    const profile = createProfile("Nico", "es-MX"), update = vi.fn();
    const markup = renderToStaticMarkup(<PetWorkshop profile={profile} update={update} announce={vi.fn()} />);
    expect(markup).toContain("Diseño sin guardar");
    expect(markup).toContain("<select");
    expect(markup).toContain("Guardar mascota");
    expect(update).not.toHaveBeenCalled();
    expect(profile.pets).toEqual([]);
  });
  it("keeps the owl and every existing species in the same accessible pet stage", () => {
    for (const species of ["Robot Cat", "Mini Dinosaur", "Tiny Dragon", "Penguin Bot", "Fox Bot", "Owl Scout", "Space Orb"]) {
      const profile = { ...createProfile("Nico", "en"), pets: [{ ...friend, species }] };
      const markup = renderToStaticMarkup(<PetWorkshop profile={profile} update={vi.fn()} announce={vi.fn()} />);
      expect(markup).toContain(`data-pet-species-art="${species}"`);
      expect(markup).toContain('aria-label="Pet Sparky"');
    }
  });
  it("renders keyboard-operable cues with a non-color current-step marker", () => {
    const markup = renderToStaticMarkup(<PetChallenge game={beginPetGame(friend.id, "Sit")} language="es-MX" choose={vi.fn()} again={vi.fn()} close={vi.fn()} />);
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain("Sin cronómetro");
    expect(markup).toContain("Huella");
    expect(markup).toContain("Corazón");
    expect(markup).not.toContain('role="application"');
  });
  it("replaces a completed game's inputs with explicit replay and done controls", () => {
    let game = beginPetGame(friend.id);
    for (const choice of game.route) game = advancePetGame(game, choice);
    const markup = renderToStaticMarkup(<PetChallenge game={game} language="en" choose={vi.fn()} again={vi.fn()} close={vi.fn()} />);
    expect(markup).toContain("Great teamwork!");
    expect(markup).toContain("Play again");
    expect(markup).toContain("Done");
    expect(markup).not.toContain("Collect tool");
  });
});
