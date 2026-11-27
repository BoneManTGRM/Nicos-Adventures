import type { SectionId } from "../types";

export type DestinationId = Exclude<SectionId, "world-map">;
export const atlasGroups = {
  all: { en: "All", "es-MX": "Todos" },
  explore: { en: "Explore", "es-MX": "Explorar" },
  create: { en: "Create", "es-MX": "Crear" },
  home: { en: "My world", "es-MX": "Mi mundo" },
} as const;
export type AtlasFilter = keyof typeof atlasGroups;

export const destinationGroup = {
  "learning-lab": "explore",
  "robo-lab": "create",
  "animal-forest": "explore",
  "becca-corner": "create",
  "cousins-adventure": "explore",
  "monster-lab": "create",
  "monster-habitats": "explore",
  "art-studio": "create",
  "story-castle": "create",
  "game-arcade": "explore",
  "dinosaur-valley": "explore",
  "pet-workshop": "create",
  "robot-home": "home",
  "memory-book": "home",
  "badge-book": "home",
  "parent-settings": "home",
} satisfies Record<DestinationId, Exclude<AtlasFilter, "all">>;

const paintings = import.meta.glob<string>("../assets/atlas/*.webp", {
  query: "?url", import: "default", eager: true,
});
export function destinationArt(id: DestinationId) {
  return paintings[`../assets/atlas/${id}.webp`];
}
