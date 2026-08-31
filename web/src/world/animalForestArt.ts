import type { CSSProperties } from "react";
import habitatAtlas from "../assets/habitats/animal-forest-premium-habitats-atlas.webp";
import type { AnimalHabitat } from "./animalForestTrail";

const HABITAT_CELLS: Record<AnimalHabitat, { column: number; row: number }> = {
  Jungle: { column: 0, row: 0 },
  Rainforest: { column: 1, row: 0 },
  Ocean: { column: 2, row: 0 },
  Savanna: { column: 0, row: 1 },
  Arctic: { column: 1, row: 1 },
  Desert: { column: 2, row: 1 },
  Forest: { column: 0, row: 2 },
  Wetlands: { column: 1, row: 2 },
  Mountains: { column: 2, row: 2 },
};

export const PREMIUM_ANIMAL_HABITATS = Object.freeze(Object.keys(HABITAT_CELLS) as AnimalHabitat[]);

export function animalForestArtStyle(habitat: string): CSSProperties {
  const cell = HABITAT_CELLS[habitat as AnimalHabitat] ?? HABITAT_CELLS.Jungle;
  return {
    backgroundImage: `url("${habitatAtlas}")`,
    backgroundPosition: `${cell.column * 50}% ${cell.row * 50}%`,
    backgroundSize: "300% 300%",
  };
}
