import type { CSSProperties } from "react";
import type { AnimalRecord, Language } from "../types";

const habitatPalette: Record<string, [string, string, string, string]> = {
  Rainforest: ["#38bdf8", "#166534", "#14532d", "🌿"],
  Jungle: ["#38bdf8", "#166534", "#14532d", "🌿"],
  Ocean: ["#38bdf8", "#0369a1", "#082f49", "🌊"],
  Savanna: ["#7dd3fc", "#ca8a04", "#713f12", "🌾"],
  Arctic: ["#dbeafe", "#67e8f9", "#164e63", "❄️"],
  Antarctic: ["#dbeafe", "#67e8f9", "#164e63", "❄️"],
  Desert: ["#7dd3fc", "#f59e0b", "#78350f", "☀️"],
  Forest: ["#7dd3fc", "#15803d", "#14532d", "🌲"],
  "Bamboo Forest": ["#bbf7d0", "#16a34a", "#14532d", "🎋"],
  Meadow: ["#7dd3fc", "#65a30d", "#365314", "🌼"],
  Wetlands: ["#67e8f9", "#0d9488", "#134e4a", "🪷"],
  Mountains: ["#bfdbfe", "#64748b", "#1e293b", "⛰️"],
};

const fallbackPalette: [string, string, string, string] = ["#7dd3fc", "#22c55e", "#14532d", "🌎"];

export function LocalWildlifeArt({
  animal,
  displayName,
  language,
}: {
  animal: AnimalRecord;
  displayName: string;
  language: Language;
}) {
  const [sky, ground, shadow, scenery] = habitatPalette[animal.habitat] ?? fallbackPalette;
  const style = {
    "--wildlife-sky": sky,
    "--wildlife-ground": ground,
    "--wildlife-shadow": shadow,
  } as CSSProperties;
  const localLabel = language === "es-MX" ? "Ilustración local" : "Local illustration";

  return (
    <div className="local-wildlife-art" style={style} role="img" aria-label={`${displayName}. ${localLabel}.`}>
      <span className="local-wildlife-art__sun" aria-hidden="true" />
      <span className="local-wildlife-art__cloud local-wildlife-art__cloud--one" aria-hidden="true" />
      <span className="local-wildlife-art__cloud local-wildlife-art__cloud--two" aria-hidden="true" />
      <span className="local-wildlife-art__scenery" aria-hidden="true">{scenery}</span>
      <span className="local-wildlife-art__animal" aria-hidden="true">{animal.emoji}</span>
      <span className="local-wildlife-art__ground" aria-hidden="true" />
      <span className="local-wildlife-art__label">{displayName}</span>
      <small>{localLabel}</small>
    </div>
  );
}
