import { useEffect, useState, type CSSProperties } from "react";
import type { NicoProfessionId } from "../types";

const BASE_ART_PATH = "/assets/nico/drag/nico-base.webp.b64?v=1";
const OUTFIT_ART_PATH = "/assets/nico/drag/outfits.webp.b64?v=1";

export type NicoDragArtState = {
  baseSource: string;
  outfitSource: string;
  loading: boolean;
  error: string | null;
};

type OutfitCell = {
  canonical: NicoProfessionId;
  index: number;
  column: number;
  row: number;
};

const CANONICAL_OUTFITS = [
  "explorer",
  "astronaut",
  "doctor",
  "scientist",
  "engineer",
  "veterinarian",
  "dinosaur",
  "suit",
  "firefighter",
  "chef",
  "artist",
  "pilot",
] as const satisfies readonly NicoProfessionId[];

export const NICO_OUTFIT_ALIASES: Record<NicoProfessionId, (typeof CANONICAL_OUTFITS)[number]> = {
  explorer: "explorer",
  astronaut: "astronaut",
  doctor: "doctor",
  scientist: "scientist",
  engineer: "engineer",
  builder: "engineer",
  veterinarian: "veterinarian",
  dinosaur: "dinosaur",
  suit: "suit",
  firefighter: "firefighter",
  chef: "chef",
  artist: "artist",
  pilot: "pilot",
  gardener: "explorer",
  teacher: "suit",
  dentist: "doctor",
  "police-officer": "suit",
  zookeeper: "veterinarian",
  musician: "artist",
  farmer: "explorer",
  lifeguard: "pilot",
  magician: "artist",
  "soccer-player": "pilot",
  "tennis-player": "explorer",
  detective: "suit",
  librarian: "suit",
};

async function loadLocalWebp(path: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(path, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Nico art request failed: ${response.status}`);
  const encoded = (await response.text()).replace(/^\uFEFF/, "").trim();
  if (!encoded.startsWith("UklG") || encoded.length < 1000) {
    throw new Error("Nico art payload is not a valid WebP image");
  }
  return `data:image/webp;base64,${encoded}`;
}

export function useNicoDragArt(): NicoDragArtState {
  const [state, setState] = useState<NicoDragArtState>({
    baseSource: "",
    outfitSource: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      loadLocalWebp(BASE_ART_PATH, controller.signal),
      loadLocalWebp(OUTFIT_ART_PATH, controller.signal),
    ])
      .then(([baseSource, outfitSource]) => {
        setState({ baseSource, outfitSource, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          baseSource: "",
          outfitSource: "",
          loading: false,
          error: error instanceof Error ? error.message : "Nico art failed",
        });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function getNicoOutfitCell(profession: NicoProfessionId): OutfitCell {
  const canonical = NICO_OUTFIT_ALIASES[profession];
  const index = CANONICAL_OUTFITS.indexOf(canonical);
  return {
    canonical,
    index,
    column: index % 4,
    row: Math.floor(index / 4),
  };
}

export function nicoOutfitSpriteStyle(source: string, profession: NicoProfessionId): CSSProperties {
  if (!source) return {};
  const { column, row } = getNicoOutfitCell(profession);
  return {
    backgroundImage: `url("${source}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "400% 300%",
    backgroundPosition: `${column * (100 / 3)}% ${row * 50}%`,
  };
}

export function preloadNicoImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nico image could not be decoded"));
    image.src = source;
  });
}
