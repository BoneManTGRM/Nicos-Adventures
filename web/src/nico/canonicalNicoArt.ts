import type { CSSProperties } from "react";
import explorerAtlas from "../assets/nico/nico-explorer-atlas.webp";
import professionsAtlas from "../assets/nico/nico-professions-atlas.webp";
import type { NicoProfessionId, NicoWardrobe } from "../types";

type SpriteCell = {
  atlas: string;
  column: 0 | 1 | 2 | 3;
  row: 0 | 1;
};

export type CanonicalNicoPresetArt = {
  profession: NicoProfessionId;
  style: CSSProperties;
};

const PROFESSION_CELLS: Partial<Record<NicoProfessionId, SpriteCell>> = {
  explorer: { atlas: explorerAtlas, column: 0, row: 0 },
  astronaut: { atlas: professionsAtlas, column: 0, row: 0 },
  doctor: { atlas: professionsAtlas, column: 1, row: 0 },
  scientist: { atlas: professionsAtlas, column: 2, row: 0 },
  engineer: { atlas: professionsAtlas, column: 3, row: 0 },
  builder: { atlas: professionsAtlas, column: 0, row: 1 },
  artist: { atlas: professionsAtlas, column: 1, row: 1 },
  chef: { atlas: professionsAtlas, column: 2, row: 1 },
  gardener: { atlas: professionsAtlas, column: 3, row: 1 },
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
      backgroundPosition: `${cell.column * (100 / 3)}% ${cell.row * 100}%`,
    },
  };
}

export function hasCanonicalNicoPresetArt(wardrobe: NicoWardrobe): boolean {
  return canonicalNicoPresetArt(wardrobe) !== null;
}
