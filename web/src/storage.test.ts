import { describe, expect, it } from "vitest";
import { normalizeStore } from "./storage";

describe("profile schema v3 migration", () => {
  it("migrates a v2 profile without losing existing progress", () => {
    const migrated = normalizeStore({
      schemaVersion: 2,
      activeProfileId: "player-1",
      profiles: [{
        schemaVersion: 2,
        id: "player-1",
        playerName: "Nico",
        language: "es-MX",
        stars: 27,
        selectedSection: "robot-home",
        completedMissions: ["mission-1"],
        sectionVisits: { "world-map": 4 },
        robot: { id: "robot-1", name: "Bolt", color: "Electric Blue", secondary_color: "Sunny Yellow", head: "Vanguard Crown", eyes: "Photon Visor", body: "Star Reactor", arms: "Guardian Arms", base: "Vernier Legs", backpack: "Wing Binders", power: "Star Reactor", personality: "Brave Guardian", level: 2, xp: 70 },
        robots: [],
        animals: [],
        monsters: [],
        pets: [],
        activePetId: null,
        artwork: [],
        stories: [],
        dinosaurs: [],
        fossils: ["T. rex Fossil"],
        arcadeScores: { "Rocket Math": 91 },
        decorations: ["Charging Dock"],
        badges: ["Star Starter"],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }],
    });

    const profile = migrated.profiles[0];
    expect(migrated.schemaVersion).toBe(3);
    expect(profile.schemaVersion).toBe(3);
    expect(profile.stars).toBe(27);
    expect(profile.fossils).toContain("T. rex Fossil");
    expect(profile.movieProjects).toEqual([]);
    expect(profile.nico.profession).toBe("explorer");
  });

  it("keeps only lightweight validated movie metadata", () => {
    const migrated = normalizeStore({
      schemaVersion: 3,
      activeProfileId: "player-1",
      profiles: [{
        id: "player-1",
        playerName: "Nico",
        movieProjects: [{
          id: "movie-1",
          title: "Robot Dance",
          characters: [{ kind: "robot", id: "starter-boltbot", name: "BoltBot" }],
          poseSequence: [{ pose: "dance", durationMs: 6000 }],
          background: "star-stage",
          caption: "Dance time",
          language: "en",
          durationMs: 6000,
          createdAt: "2026-08-03T00:00:00.000Z",
          videoBlob: "must-not-be-used",
        }],
      }],
    });

    const project = migrated.profiles[0].movieProjects[0] as unknown as Record<string, unknown>;
    expect(project.title).toBe("Robot Dance");
    expect(project.durationMs).toBe(6000);
    expect(project.videoBlob).toBeUndefined();
  });
});
