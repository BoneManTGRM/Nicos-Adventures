import type { LocalProfile } from "../types";
import {
  reduceStarBridge,
  type StarBridgeEvent,
} from "./goldenAdventure";

export function applyStarBridgeEvent(
  profile: LocalProfile,
  event: StarBridgeEvent,
  now?: () => string,
): LocalProfile {
  const current = profile.adventures.starBridge;
  const next = reduceStarBridge(current, event, now);
  if (next === current) return profile;

  return {
    ...profile,
    adventures: {
      ...profile.adventures,
      starBridge: next,
    },
  };
}
