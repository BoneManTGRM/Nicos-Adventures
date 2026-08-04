import type { Language, NicoPreferences } from "../types";
import {
  applyNicoProfession,
  filterNicoProfessions,
  NICO_PROFESSIONS,
  WardrobeStudio,
} from "./wardrobe/WardrobeStudio";
import { wardrobeForDisplay } from "./wardrobe/wardrobeCompatibility";

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
  const resolvedPreferences: NicoPreferences = {
    ...preferences,
    wardrobe: wardrobeForDisplay(preferences.wardrobe, preferences.profession),
  };
  return <WardrobeStudio language={language} preferences={resolvedPreferences} onSave={onSave} />;
}
