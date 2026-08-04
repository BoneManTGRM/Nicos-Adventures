import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import type { LocalProfile } from "../types";
import { buildBadges } from "./Badges";
import { buildMemoryEntries } from "./Museum";

describe("Memory Museum indexing", () => {
  it("indexes every supported saved creation type", () => {
    const base = createProfile("Nico", "es-MX");
    const profile: LocalProfile = {
      ...base,
      animals: base.animals.map((animal, index) => index === 0 ? { ...animal, discovered: true } : animal),
      monsters: [{ id: "m1", name: "Glimmer", body: "Dragon", eyes: "Two eyes", horns: "Tiny horns", wings: "No wings", color: "Aqua", pattern: "Stars", power: "Bubble beam", personality: "Curious", friendship: 50, habitat: "Crystal Cave" }],
      pets: [{ id: "p1", name: "Sparky", species: "Robot Dog", color: "Blue", accessory: "Explorer Scarf", personality: "Playful", bond: 24, tricks: ["Sit"] }],
      activePetId: "p1",
      artwork: [{ id: "a1", title: "Mi póster", background: "Starry Space", subject: "Nico", frame: "Gold Frame", caption: "Aventura" }],
      stories: [{ id: "s1", title: "Mi cuento", hero: "Nico", place: "el bosque", problem: "faltaba una pista", ending: "la encontraron", language: "es-MX" }],
      dinosaurs: base.dinosaurs.map((dinosaur, index) => index === 0 ? { ...dinosaur, discovered: true } : dinosaur),
      fossils: ["Tyrannosaurus rex Fossil"],
      movieProjects: [{ id: "movie1", title: "Mi película", characters: [{ kind: "nico", id: "nico", name: "Nico" }], poseSequence: [{ pose: "wave", durationMs: 1000 }], background: "Star Stage", caption: "Hola", language: "es-MX", durationMs: 4000, createdAt: new Date(0).toISOString() }],
    };

    const entries = buildMemoryEntries(profile);
    const categories = new Set(entries.map((entry) => entry.category));
    for (const expected of ["robot", "animal", "monster", "pet", "artwork", "story", "dinosaur", "fossil", "movie"]) {
      expect(categories.has(expected as never), `Missing memory category: ${expected}`).toBe(true);
    }
    expect(entries.find((entry) => entry.category === "fossil")?.title).toContain("Fósil");
    expect(entries.find((entry) => entry.category === "movie")?.movieProjectId).toBe("movie1");
  });
});

describe("Badge Observatory calculations", () => {
  it("returns a finite progress definition for every badge", () => {
    const profile = createProfile("Nico", "en");
    const badges = buildBadges(profile);

    expect(badges.length).toBeGreaterThanOrEqual(16);
    expect(new Set(badges.map((badge) => badge.id)).size).toBe(badges.length);
    for (const badge of badges) {
      expect(badge.target).toBeGreaterThan(0);
      expect(badge.current).toBeGreaterThanOrEqual(0);
      expect(badge.current).toBeLessThanOrEqual(badge.target);
      expect(badge.name.en).toBeTruthy();
      expect(badge.name["es-MX"]).toBeTruthy();
    }
  });
});
