import type { CSSProperties } from "react";
import explorerAtlas from "../assets/nico/nico-explorer-atlas.webp";
import librarianArt from "../assets/nico/nico-librarian.webp";
import professionsAtlas from "../assets/nico/nico-professions-atlas.webp";
import communityProfessionsAtlas from "../assets/nico/nico-professions-community-atlas.webp";
import worldProfessionsAtlas from "../assets/nico/nico-professions-world-atlas.webp";
import type { NicoProfessionId, NicoWardrobe } from "../types";

type SpriteCell = {
  atlas: string;
  column: number;
  row: number;
  columns: 1 | 4;
  rows: 1 | 2;
};

export type CanonicalNicoPresetArt = {
  profession: NicoProfessionId;
  style: CSSProperties;
};

const PROFESSION_CELLS: Partial<Record<NicoProfessionId, SpriteCell>> = {
  explorer: { atlas: explorerAtlas, column: 0, row: 0, columns: 4, rows: 2 },
  astronaut: { atlas: professionsAtlas, column: 0, row: 0, columns: 4, rows: 2 },
  doctor: { atlas: professionsAtlas, column: 1, row: 0, columns: 4, rows: 2 },
  scientist: { atlas: professionsAtlas, column: 2, row: 0, columns: 4, rows: 2 },
  engineer: { atlas: professionsAtlas, column: 3, row: 0, columns: 4, rows: 2 },
  builder: { atlas: professionsAtlas, column: 0, row: 1, columns: 4, rows: 2 },
  artist: { atlas: professionsAtlas, column: 1, row: 1, columns: 4, rows: 2 },
  chef: { atlas: professionsAtlas, column: 2, row: 1, columns: 4, rows: 2 },
  gardener: { atlas: professionsAtlas, column: 3, row: 1, columns: 4, rows: 2 },
  veterinarian: { atlas: communityProfessionsAtlas, column: 0, row: 0, columns: 4, rows: 2 },
  dinosaur: { atlas: communityProfessionsAtlas, column: 1, row: 0, columns: 4, rows: 2 },
  suit: { atlas: communityProfessionsAtlas, column: 2, row: 0, columns: 4, rows: 2 },
  firefighter: { atlas: communityProfessionsAtlas, column: 3, row: 0, columns: 4, rows: 2 },
  pilot: { atlas: communityProfessionsAtlas, column: 0, row: 1, columns: 4, rows: 2 },
  teacher: { atlas: communityProfessionsAtlas, column: 1, row: 1, columns: 4, rows: 2 },
  dentist: { atlas: communityProfessionsAtlas, column: 2, row: 1, columns: 4, rows: 2 },
  "police-officer": { atlas: communityProfessionsAtlas, column: 3, row: 1, columns: 4, rows: 2 },
  zookeeper: { atlas: worldProfessionsAtlas, column: 0, row: 0, columns: 4, rows: 2 },
  musician: { atlas: worldProfessionsAtlas, column: 1, row: 0, columns: 4, rows: 2 },
  farmer: { atlas: worldProfessionsAtlas, column: 2, row: 0, columns: 4, rows: 2 },
  lifeguard: { atlas: worldProfessionsAtlas, column: 3, row: 0, columns: 4, rows: 2 },
  magician: { atlas: worldProfessionsAtlas, column: 0, row: 1, columns: 4, rows: 2 },
  "soccer-player": { atlas: worldProfessionsAtlas, column: 1, row: 1, columns: 4, rows: 2 },
  "tennis-player": { atlas: worldProfessionsAtlas, column: 2, row: 1, columns: 4, rows: 2 },
  detective: { atlas: worldProfessionsAtlas, column: 3, row: 1, columns: 4, rows: 2 },
  librarian: { atlas: librarianArt, column: 0, row: 0, columns: 1, rows: 1 },
};

export const CANONICAL_NICO_PRESETS = Object.freeze(Object.keys(PROFESSION_CELLS) as NicoProfessionId[]);

export function canonicalNicoPresetArt(wardrobe: NicoWardrobe): CanonicalNicoPresetArt | null {
  const profession = wardrobe.presetId;
  if (!profession) return null;
  const cell = PROFESSION_CELLS[profession];
  if (!cell) return null;
  return {
    profession,
    style: {
      backgroundImage: `url("${cell.atlas}")`,
      backgroundPosition: `${cell.columns === 1 ? 0 : cell.column * (100 / (cell.columns - 1))}% ${cell.rows === 1 ? 0 : cell.row * 100}%`,
      backgroundSize: `${cell.columns * 100}% ${cell.rows * 100}%`,
    },
  };
}

export function hasCanonicalNicoPresetArt(wardrobe: NicoWardrobe): boolean {
  return canonicalNicoPresetArt(wardrobe) !== null;
}


function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Canonical Nico artwork could not be loaded."));
    image.src = source;
  });
}

export async function loadCanonicalNicoImage(profession: NicoProfessionId): Promise<HTMLImageElement> {
  const cell = PROFESSION_CELLS[profession] ?? PROFESSION_CELLS.explorer;
  if (!cell) throw new Error("Canonical Nico artwork is unavailable.");
  const atlas = await loadImage(cell.atlas);
  const width = Math.round(atlas.naturalWidth / cell.columns);
  const height = Math.round(atlas.naturalHeight / cell.rows);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canonical Nico artwork could not be composed.");
  context.drawImage(atlas, cell.column * width, cell.row * height, width, height, 0, 0, width, height);
  return loadImage(canvas.toDataURL("image/png"));
}
