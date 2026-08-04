import type { LocalProfile } from "../types";

export const COMPLETED_MISSION_LIMIT = 1000;

export type CompletionResult = {
  profile: LocalProfile;
  awarded: boolean;
};

export function hasCompleted(profile: LocalProfile, missionId: string): boolean {
  return profile.completedMissions.includes(missionId);
}

export function completeOnce(profile: LocalProfile, missionId: string, rewardStars: number): CompletionResult {
  if (hasCompleted(profile, missionId)) return { profile, awarded: false };
  return {
    awarded: true,
    profile: {
      ...profile,
      completedMissions: [...profile.completedMissions, missionId].slice(-COMPLETED_MISSION_LIMIT),
      stars: profile.stars + Math.max(0, Math.round(rewardStars)),
    },
  };
}

export function robotJobMission(robotId: string, job: string): string {
  return `robot-job:${robotId}:${job}`;
}

export function monsterFriendshipMission(monsterId: string, threshold: 50 | 100): string {
  return `monster-friendship:${monsterId}:${threshold}`;
}

export function petTrickMission(petId: string, count: 1 | 3 | 5): string {
  return `pet-tricks:${petId}:${count}`;
}

export function fieldMissionId(id: string): string {
  return `animal-field:${id}`;
}

export function arcadeMissionId(game: string, questionId: string): string {
  return `arcade:${game}:${questionId}`;
}

export function dinosaurDiscoveryMission(dinosaurId: string): string {
  return `dinosaur-discovery:${dinosaurId}`;
}
