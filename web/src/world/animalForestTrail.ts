export type AnimalHabitat =
  | "Jungle"
  | "Rainforest"
  | "Ocean"
  | "Savanna"
  | "Arctic"
  | "Desert"
  | "Forest"
  | "Wetlands"
  | "Mountains";

export const ANIMAL_HABITAT_TRAILS: ReadonlyArray<{
  id: AnimalHabitat;
  icon: string;
  color: string;
  sky: string;
}> = [
  { id: "Jungle", icon: "🌴", color: "#4ade80", sky: "#164e63" },
  { id: "Rainforest", icon: "🌿", color: "#22c55e", sky: "#155e75" },
  { id: "Ocean", icon: "🌊", color: "#38bdf8", sky: "#075985" },
  { id: "Savanna", icon: "🌾", color: "#facc15", sky: "#9a3412" },
  { id: "Arctic", icon: "❄️", color: "#bae6fd", sky: "#334155" },
  { id: "Desert", icon: "☀️", color: "#fb923c", sky: "#7c2d12" },
  { id: "Forest", icon: "🌲", color: "#65a30d", sky: "#14532d" },
  { id: "Wetlands", icon: "🪷", color: "#2dd4bf", sky: "#134e4a" },
  { id: "Mountains", icon: "⛰️", color: "#cbd5e1", sky: "#312e81" },
];

export function habitatTrail(id: string) {
  return ANIMAL_HABITAT_TRAILS.find((trail) => trail.id === id) ?? ANIMAL_HABITAT_TRAILS[0];
}
