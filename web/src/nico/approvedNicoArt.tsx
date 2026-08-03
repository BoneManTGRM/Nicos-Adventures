import { useEffect, useState, type CSSProperties } from "react";
import type { NicoProfessionId } from "../types";

const CHARACTER_PARTS = [
  "/assets/nico/approved/character.part1.b64?v=1",
  "/assets/nico/approved/character.part2.b64?v=1",
  "/assets/nico/approved/character.part3.b64?v=1",
] as const;

const OUTFIT_PARTS = [
  "/assets/nico/approved/outfits.part1.b64?v=1",
  "/assets/nico/approved/outfits.part2.b64?v=1",
  "/assets/nico/approved/outfits.part3.b64?v=1",
  "/assets/nico/approved/outfits.part4.b64?v=1",
  "/assets/nico/approved/outfits.part5.b64?v=1",
] as const;

type ArtState = {
  characterSource: string;
  outfitSource: string;
  loading: boolean;
  error: string | null;
};

type CharacterPose = "full" | "guide" | "celebrate";

export const APPROVED_OUTFIT_INDEX: Partial<Record<NicoProfessionId, number>> = {
  explorer: 0,
  astronaut: 1,
  doctor: 2,
  scientist: 3,
  engineer: 4,
  builder: 4,
  veterinarian: 5,
  dinosaur: 6,
  suit: 7,
  firefighter: 8,
  chef: 9,
  artist: 10,
  pilot: 11,
};

async function loadBase64Parts(parts: readonly string[], signal: AbortSignal): Promise<string> {
  const chunks = await Promise.all(parts.map(async (path) => {
    const response = await fetch(path, { cache: "no-store", signal });
    if (!response.ok) throw new Error(`Approved Nico art request failed: ${response.status}`);
    return (await response.text()).replace(/^\uFEFF/, "").trim();
  }));
  const encoded = chunks.join("");
  if (!encoded.startsWith("/9j/") || encoded.length < 10000) {
    throw new Error("Approved Nico art payload is invalid");
  }
  return `data:image/jpeg;base64,${encoded}`;
}

export function useApprovedNicoArt(): ArtState {
  const [state, setState] = useState<ArtState>({
    characterSource: "",
    outfitSource: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      loadBase64Parts(CHARACTER_PARTS, controller.signal),
      loadBase64Parts(OUTFIT_PARTS, controller.signal),
    ])
      .then(([characterSource, outfitSource]) => {
        setState({ characterSource, outfitSource, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          characterSource: "",
          outfitSource: "",
          loading: false,
          error: error instanceof Error ? error.message : "Approved Nico art failed",
        });
      });
    return () => controller.abort();
  }, []);

  return state;
}

export function approvedCharacterStyle(source: string, pose: CharacterPose): CSSProperties {
  if (!source) return {};
  if (pose === "full") {
    return {
      backgroundImage: `url("${source}")`,
      backgroundSize: "200% 100%",
      backgroundPosition: "0% 50%",
    };
  }
  return {
    backgroundImage: `url("${source}")`,
    backgroundSize: "200% 200%",
    backgroundPosition: pose === "guide" ? "100% 0%" : "100% 100%",
  };
}

export function approvedOutfitStyle(source: string, profession: NicoProfessionId): CSSProperties | null {
  const index = APPROVED_OUTFIT_INDEX[profession];
  if (!source || index === undefined) return null;
  const column = index % 6;
  const row = Math.floor(index / 6);
  return {
    backgroundImage: `url("${source}")`,
    backgroundSize: "600% 200%",
    backgroundPosition: `${column * 20}% ${row * 100}%`,
  };
}

export function ApprovedNicoCharacter({
  source,
  pose,
  className = "",
  alt,
}: {
  source: string;
  pose: CharacterPose;
  className?: string;
  alt: string;
}) {
  if (!source) {
    return <span className={`nico-approved-art-fallback ${className}`.trim()} role="img" aria-label={alt}>Nico</span>;
  }
  return (
    <span
      className={`nico-approved-art nico-approved-art--${pose} ${className}`.trim()}
      style={approvedCharacterStyle(source, pose)}
      role="img"
      aria-label={alt}
      data-approved-nico-art="true"
    />
  );
}
