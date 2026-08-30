import type { SectionId } from "../types";

export type WorldAtlasLandmark = {
  id: SectionId;
  accent: string;
  position: readonly [number, number, number];
};

export const WORLD_ATLAS_LANDMARKS = [
  { id: "robo-lab", accent: "#22d3ee", position: [-2.65, .16, -1.2] },
  { id: "animal-forest", accent: "#a3e635", position: [-2.45, .14, 1.42] },
  { id: "monster-lab", accent: "#c084fc", position: [-.28, .14, .72] },
  { id: "story-castle", accent: "#f9a8d4", position: [.25, .16, -1.72] },
  { id: "dinosaur-valley", accent: "#facc15", position: [2.6, .15, 1.28] },
  { id: "memory-book", accent: "#67e8f9", position: [2.45, .16, -1.3] },
] as const satisfies readonly WorldAtlasLandmark[];

export function isWorldAtlasLandmarkLocked(id: SectionId, dinosaurValleyAvailable: boolean) {
  return id === "dinosaur-valley" && !dinosaurValleyAvailable;
}
