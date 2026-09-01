import type { CSSProperties } from "react";
import type { AnimalRecord, Language } from "../types";
import { animalForestArtStyle } from "./animalForestArt";
import { WildlifeSprite } from "./WildlifeSprite";

export type WildlifeMotion = "idle" | "walk" | "leap" | "celebrate" | "sleep";

export function LocalWildlifeArt({
  animal,
  displayName,
  language,
  motion = "idle",
}: {
  animal: AnimalRecord;
  displayName: string;
  language: Language;
  motion?: WildlifeMotion;
}) {
  const style = {
    ...animalForestArtStyle(animal.habitat),
    "--wildlife-shadow": animal.habitat === "Ocean" ? "#082f49" : "#020617",
  } as CSSProperties;
  const sceneLabel = language === "es-MX" ? "Escena de hábitat ilustrada" : "Illustrated habitat scene";

  return (
    <div className="local-wildlife-art" style={style} data-habitat={animal.habitat} data-motion={motion}>
      <span className="local-wildlife-art__depth" aria-hidden="true" />
      <span className="local-wildlife-art__glow" aria-hidden="true" />
      <WildlifeSprite animalId={animal.id} alt={displayName} className="local-wildlife-art__animal" />
      <span className="local-wildlife-art__ground" aria-hidden="true" />
      <span className="local-wildlife-art__label">{displayName}</span>
      <small>{sceneLabel}</small>
    </div>
  );
}
