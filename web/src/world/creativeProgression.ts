import type { LocalProfile } from "../types";
// Phase C2 deliberately reuses the finite one-time reward contract introduced by Phase C1.
import { completeOnce, type CompletionResult } from "./progression";

export type CreativeKind = "artwork" | "story";

export function creativeMilestoneId(kind: CreativeKind, count: 1 | 3 | 5): string {
  return `creative:${kind}:${count}`;
}

export function roomGoalId(goal: "robot-team" | "pet-companion" | "art-display" | "decorator"): string {
  return `robot-home:${goal}`;
}

export function completeCreativeMilestones(
  profile: LocalProfile,
  kind: CreativeKind,
  previousCount: number,
  nextCount: number,
): CompletionResult & { milestones: number[] } {
  let nextProfile = profile;
  const milestones: number[] = [];
  for (const count of [1, 3, 5] as const) {
    if (previousCount < count && nextCount >= count) {
      const completion = completeOnce(nextProfile, creativeMilestoneId(kind, count), count === 1 ? 1 : count === 3 ? 2 : 3);
      nextProfile = completion.profile;
      if (completion.awarded) milestones.push(count);
    }
  }
  return { profile: nextProfile, awarded: milestones.length > 0, milestones };
}
