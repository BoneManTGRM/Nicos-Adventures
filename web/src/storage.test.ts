import { describe, expect, it } from "vitest";
import { normalizeStore } from "./storage";

describe("profile schema v4 migration", () => {
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
    expect(migrated.schemaVersion).toBe(4);
    expect(profile.schemaVersion).toBe(4);
    expect(profile.stars).toBe(27);
    expect(profile.fossils).toContain("T. rex Fossil");
    expect(profile.activeRobotId).toBe("robot-1");
    expect(profile.displayedArtworkId).toBeNull();
    expect(profile.movieProjects).toEqual([]);
    expect(profile.nico.profession).toBe("explorer");
    expect(profile.nico.wardrobe.presetId).toBe("explorer");
    expect(profile.nico.wardrobe.eyewear).toBe("nico-red-glasses");
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

  it("keeps bounded multi-page stories while accepting legacy stories", () => {
    const profile = normalizeStore({
      schemaVersion: 4,
      activeProfileId: "player-1",
      profiles: [{
        id: "player-1",
        playerName: "Nico",
        stories: [{
          id: "story-1",
          title: "Moon Friends",
          hero: "Nico",
          companion: "BoltBot",
          place: "the Moon",
          problem: "a beacon went quiet",
          ending: "the friends repaired it",
          theme: "Teamwork",
          magicItem: "a star lantern",
          specialDetail: "A comet drew a clue",
          pages: ["Page one", "Page two"],
          language: "en",
        }],
      }],
    }).profiles[0];

    expect(profile.stories[0].pages).toEqual(["Page one", "Page two"]);
    expect(profile.stories[0].companion).toBe("BoltBot");
  });

  it("uses explicit active robot and displayed artwork identifiers", () => {
    const migrated = normalizeStore({
      schemaVersion: 4,
      activeProfileId: "player-1",
      profiles: [{
        schemaVersion: 4,
        id: "player-1",
        playerName: "Nico",
        robot: { id: "robot-a", name: "A" },
        robots: [
          { id: "robot-a", name: "A" },
          { id: "robot-b", name: "B" },
        ],
        activeRobotId: "robot-b",
        artwork: [
          { id: "art-a", title: "A" },
          { id: "art-b", title: "B" },
        ],
        displayedArtworkId: "art-a",
      }],
    });

    const profile = migrated.profiles[0];
    expect(profile.activeRobotId).toBe("robot-b");
    expect(profile.robot.id).toBe("robot-b");
    expect(profile.displayedArtworkId).toBe("art-a");
  });

  it("retains the newest 1000 unique reward identifiers", () => {
    const completedMissions = Array.from({ length: 1105 }, (_, index) => `mission-${index}`);
    const profile = normalizeStore({
      schemaVersion: 4,
      activeProfileId: "player-1",
      profiles: [{ id: "player-1", playerName: "Nico", completedMissions }],
    }).profiles[0];

    expect(profile.completedMissions).toHaveLength(1000);
    expect(profile.completedMissions[0]).toBe("mission-105");
    expect(profile.completedMissions.at(-1)).toBe("mission-1104");
  });

  it("rejects unknown sections and strips untrusted profile fields", () => {
    const profile = normalizeStore({
      schemaVersion: 4,
      activeProfileId: "player-1",
      profiles: [{
        id: "player-1",
        playerName: "Nico",
        selectedSection: "secret-admin-screen",
        privateToken: "must-not-survive",
        stars: 999999999,
        nico: {
          profession: "astronaut",
          accentColor: "#123456",
          speechEnabled: true,
          wardrobe: { top: "space-shirt", malicious: "drop-me" },
        },
      }],
    }).profiles[0] as unknown as Record<string, unknown>;

    expect(profile.selectedSection).toBe("world-map");
    expect(profile.stars).toBe(99999);
    expect(profile.privateToken).toBeUndefined();
    expect((profile.nico as Record<string, unknown>).malicious).toBeUndefined();
    expect(((profile.nico as Record<string, unknown>).wardrobe as Record<string, unknown>).malicious).toBeUndefined();
  });
});
