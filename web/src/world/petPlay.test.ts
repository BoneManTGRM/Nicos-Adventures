import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import type { LocalProfile, PetRecord } from "../types";
import { addPetBond, advancePetGame, beginPetGame, bondLabel, CUES, finishPetTraining, hasPetEdits, knownTrickCount, PET_LIMIT, personalityGreeting, savePetStyle, TRICKS } from "./petPlay";

const friend = (overrides: Partial<PetRecord> = {}): PetRecord => ({
  id: "pet-sparky", name: "Sparky", species: "Robot Dog", color: "Blue", accessory: "Explorer Scarf", personality: "Playful", bond: 1, tricks: [], ...overrides,
});
const fixture = (): LocalProfile => ({ ...createProfile("Nico", "en"), pets: [friend()], activePetId: "pet-sparky" });

describe("pet games", () => {
  it("requires all five correct fetch steps and makes completion terminal", () => {
    let game = beginPetGame("pet-sparky");
    expect(advancePetGame(game, 99)).toBe(game);
    expect(advancePetGame(game, Number.NaN)).toBe(game);
    for (let step = 0; step < 5; step++) {
      game = advancePetGame(game, game.route[game.step]);
      expect(game.step).toBe(step + 1);
      expect(game.won).toBe(step === 4);
    }
    expect(advancePetGame(game, 0)).toBe(game);
  });
  it("has three valid, accessible cues for every trick and varies replay routes", () => {
    for (const trick of TRICKS) {
      const first = beginPetGame("pet-sparky", trick.id);
      expect(first.route).toHaveLength(3);
      expect(new Set(first.route).size).toBe(3);
      expect(first.route.every((cue) => Boolean(CUES[cue]))).toBe(true);
      expect(beginPetGame("pet-sparky", trick.id, 1).route).not.toEqual(first.route);
      expect(first.trickId).toBe(trick.id);
    }
    expect(beginPetGame("pet-sparky", undefined, Number.NaN).route).toEqual(beginPetGame("pet-sparky").route);
  });
  it("does not punish mistakes or advance on the wrong cue", () => {
    const game = beginPetGame("pet-sparky", "Sit");
    expect(advancePetGame(game, (game.route[0] + 1) % 3)).toBe(game);
    expect(advancePetGame(game, game.route[0]).step).toBe(1);
  });
});

describe("pet progress and existing-save safety", () => {
  it("retains established 1/3/5 milestone stars and gives no replay stars", () => {
    let profile = fixture();
    const expected = [1, 1, 3, 3, 6, 6];
    TRICKS.forEach((trick, index) => {
      profile = finishPetTraining(profile, "pet-sparky", trick.id)!;
      expect(profile.stars).toBe(expected[index]);
    });
    expect(profile.pets[0].bond).toBe(73);
    expect(knownTrickCount(profile.pets[0])).toBe(6);
    profile = finishPetTraining(profile, "pet-sparky", "Sit")!;
    expect(profile.pets[0].bond).toBe(75);
    expect(profile.stars).toBe(6);
    expect(profile.completedMissions).toHaveLength(3);
    expect(finishPetTraining({ ...profile, completedMissions: [] }, "pet-sparky", "Sit")!.stars).toBe(6);
  });
  it("never counts unknown or duplicate imported tricks toward mastery", () => {
    expect(knownTrickCount(friend({ tricks: ["Sit", "Sit", "unrecognized"] }))).toBe(1);
    const profile = fixture();
    profile.pets[0].tricks = ["unrecognized"];
    const next = finishPetTraining(profile, "pet-sparky", "Sit")!;
    expect(next.stars).toBe(1);
    expect(next.pets[0].tricks).toContain("unrecognized");
  });
  it("caps bond, never changes currency for care or fetch, and rejects missing pets", () => {
    const profile = fixture(); profile.pets[0].bond = 99;
    const next = addPetBond(profile, "pet-sparky", 4)!;
    expect(next.pets[0].bond).toBe(100);
    expect(next.stars).toBe(profile.stars);
    expect(profile.pets[0].bond).toBe(99);
    expect(addPetBond(profile, "missing", 4)).toBeNull();
    expect(addPetBond(profile, "pet-sparky", -2)).toBeNull();
    expect(addPetBond(profile, "pet-sparky", Number.NaN)).toBeNull();
    expect(finishPetTraining(profile, "missing", "Sit")).toBeNull();
  });
  it("saves only cosmetics on top of the latest trained record", () => {
    const profile = fixture();
    const oldDraft = { ...profile.pets[0], name: "  Luna  ", color: "Purple" };
    const trained = finishPetTraining(profile, "pet-sparky", "Sit")!;
    const saved = savePetStyle(trained, oldDraft, true)!;
    expect(saved.pets[0]).toMatchObject({ name: "Luna", color: "Purple", bond: 13, tricks: ["Sit"] });
    expect(saved.stars).toBe(trained.stars);
    expect(saved.completedMissions).toEqual(trained.completedMissions);
    expect(saved.robot).toBe(trained.robot);
    expect(saved.stories).toBe(trained.stories);
    expect(oldDraft.tricks).toEqual([]);
  });
  it("never resurrects an existing pet removed by another profile update", () => {
    const profile = fixture();
    expect(savePetStyle({ ...profile, pets: [] }, profile.pets[0], true)).toBeNull();
  });
  it("allows pet 60 but refuses pet 61 without silently evicting a friend", () => {
    const profile = fixture();
    profile.pets = Array.from({ length: PET_LIMIT - 1 }, (_, index) => friend({ id: `pet-${index}` }));
    const full = savePetStyle(profile, friend({ id: "last" }), false)!;
    expect(full.pets).toHaveLength(PET_LIMIT);
    expect(full.pets[0].id).toBe("pet-0");
    expect(savePetStyle(full, friend({ id: "overflow" }), false)).toBeNull();
    expect(savePetStyle(full, { ...full.pets[0], name: "Updated" }, true)!.pets[0].name).toBe("Updated");
  });
  it("starts new friends with their own progress and only one creation reward", () => {
    const profile = fixture();
    const first = savePetStyle(profile, friend({ id: "new", bond: 100, tricks: ["Sit"], name: " " }), false)!;
    expect(first.pets[1]).toMatchObject({ bond: 1, tricks: [], name: "Pet" });
    expect(first.activePetId).toBe("new");
    expect(first.stars).toBe(2);
    expect(savePetStyle(first, first.pets[1], true)!.stars).toBe(2);
    expect(savePetStyle({ ...profile, language: "es-MX" }, friend({ id: "nuevo", name: " " }), false)!.pets[1].name).toBe("Mascota");
  });
  it("detects unsaved appearance edits without treating training as an edit", () => {
    const pet = friend();
    expect(hasPetEdits(pet, { ...pet, bond: 73, tricks: ["Sit"] })).toBe(false);
    expect(hasPetEdits({ ...pet, name: "Luna" }, pet)).toBe(true);
    expect(hasPetEdits(pet)).toBe(true);
  });
  it("has bilingual bond stages and distinct local personality responses", () => {
    for (const bond of [1, 25, 50, 75, 100]) {
      expect(bondLabel(bond, "en")).not.toBe(bondLabel(bond, "es-MX"));
    }
    expect(personalityGreeting("Wise", "es-MX")).toContain("Sin prisa");
    expect(personalityGreeting("Silly", "en")).toContain("dance");
    expect(personalityGreeting("unknown", "en")).toBe(personalityGreeting("Playful", "en"));
  });
});
