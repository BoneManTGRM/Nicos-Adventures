import type { Language, NicoPreferences } from "../types";
import {
  applyNicoProfession,
  filterNicoProfessions,
  NICO_PROFESSIONS,
  WardrobeStudio,
} from "./wardrobe/WardrobeStudio";

export { applyNicoProfession, filterNicoProfessions, NICO_PROFESSIONS };

export function NicoDressUp({
  language,
  preferences,
  onSave,
}: {
  language: Language;
  artSource?: string;
  outfitArtSource?: string;
  baseArtSource?: string;
  dragOutfitSource?: string;
  preferences: NicoPreferences;
  onSave: (preferences: NicoPreferences) => void;
}) {
  return <WardrobeStudio language={language} preferences={preferences} onSave={onSave} />;
}
