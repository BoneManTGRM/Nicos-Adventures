import { describe, expect, it } from "vitest";
import { createProfile } from "../storage";
import {
  arcadeMissionId,
  completeOnce,
  COMPLETED_MISSION_LIMIT,
  dinosaurDiscoveryMission,
  fieldMissionId,
  hasCompleted,
  monsterFriendshipMission,
  petTrickMission,
  robotJobMission,
} from "./progression";

describe("world progression rewards", () => {
  it("awards a mission exactly once", () => {
    const profile = createProfile("Nico", "en");
    const first = completeOnce(profile, "mission:test", 3);
    const second = completeOnce(first.profile, "mission:test", 3);

    expect(first.awarded).toBe(true);
    expect(first.profile.stars).toBe(profile.stars + 3);
    expect(hasCompleted(first.profile, "mission:test")).toBe(true);
    expect(second.awarded).toBe(false);
    expect(second.profile.stars).toBe(first.profile.stars);
  });

  it("retains the newest bounded mission history when awarding progress", () => {
    const profile = createProfile("Nico", "en");
    profile.completedMissions = Array.from(
      { length: COMPLETED_MISSION_LIMIT },
      (_, index) => `mission-${index}`,
    );

    const result = completeOnce(profile, "mission-new", 1);
    expect(result.profile.completedMissions).toHaveLength(COMPLETED_MISSION_LIMIT);
    expect(result.profile.completedMissions[0]).toBe("mission-1");
    expect(result.profile.completedMissions.at(-1)).toBe("mission-new");
  });

  it("builds stable activity-specific mission identifiers", () => {
    expect(robotJobMission("robot-1", "Repair Engineer")).toBe("robot-job:robot-1:Repair Engineer");
    expect(monsterFriendshipMission("monster-1", 50)).toBe("monster-friendship:monster-1:50");
    expect(petTrickMission("pet-1", 3)).toBe("pet-tricks:pet-1:3");
    expect(fieldMissionId("three-animals")).toBe("animal-field:three-animals");
    expect(arcadeMissionId("Robot Memory", "q1")).toBe("arcade:Robot Memory:q1");
    expect(dinosaurDiscoveryMission("trex")).toBe("dinosaur-discovery:trex");
  });
});
