import type { CSSProperties } from "react";
import dinosaurOverlookAtlas from "../assets/dinosaurs/premium-dinosaur-overlook-atlas.webp";
import dinosaurSpeciesAtlas from "../assets/dinosaurs/premium-dinosaur-species-atlas.webp";
import fossilExpeditionAtlas from "../assets/dinosaurs/premium-fossil-expedition-atlas.webp";

const DINOSAUR_SPECIES_CELLS = {
  trex: { column: 0, row: 0 },
  triceratops: { column: 1, row: 0 },
  stegosaurus: { column: 0, row: 1 },
  brachiosaurus: { column: 1, row: 1 },
  ankylosaurus: { column: 0, row: 2 },
  velociraptor: { column: 1, row: 2 },
} as const;

export type PremiumDinosaurSpecies = keyof typeof DINOSAUR_SPECIES_CELLS;

export const PREMIUM_DINOSAUR_SPECIES = Object.freeze(Object.keys(DINOSAUR_SPECIES_CELLS) as PremiumDinosaurSpecies[]);

const twoByTwoPosition = (index: number) => `${index % 2 * 100}% ${Math.floor(index / 2) * 100}%`;

export function dinosaurSpeciesArtStyle(id: string): CSSProperties {
  const cell = DINOSAUR_SPECIES_CELLS[id as PremiumDinosaurSpecies] ?? DINOSAUR_SPECIES_CELLS.trex;
  return {
    "--dinosaur-species-image": `url("${dinosaurSpeciesAtlas}")`,
    "--dinosaur-species-position": `${cell.column * 100}% ${cell.row * 50}%`,
    "--dinosaur-overlook-image": `url("${dinosaurOverlookAtlas}")`,
  } as CSSProperties;
}

export function dinosaurOverlookArtStyle(stage: number): CSSProperties {
  const safeStage = Math.max(0, Math.min(3, Math.trunc(stage)));
  return {
    "--dinosaur-scene-image": `url("${dinosaurOverlookAtlas}")`,
    "--dinosaur-scene-position": twoByTwoPosition(safeStage),
  } as CSSProperties;
}

export function fossilExpeditionArtStyle(stage: "survey" | "brush" | "classify" | "complete"): CSSProperties {
  const index = { survey: 0, brush: 1, classify: 2, complete: 3 }[stage];
  return {
    "--dinosaur-scene-image": `url("${fossilExpeditionAtlas}")`,
    "--dinosaur-scene-position": twoByTwoPosition(index),
  } as CSSProperties;
}
