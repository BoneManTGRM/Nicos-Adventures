import type { NicoProfessionId, NicoWardrobe } from "../../types";
import { wardrobeForPreset } from "./catalog";

function isLegacyBaseWardrobe(wardrobe: NicoWardrobe): boolean {
  return wardrobe.headwear === null
    && wardrobe.eyewear === "nico-red-glasses"
    && wardrobe.top === "nico-green-polo"
    && wardrobe.outerwear === null
    && wardrobe.bottoms === "nico-khaki-shorts"
    && wardrobe.shoes === "nico-green-sneakers"
    && wardrobe.backpack === null
    && wardrobe.badge === "nico-world-leaf"
    && wardrobe.prop === null;
}

export function wardrobeForDisplay(
  wardrobe: NicoWardrobe,
  profession: NicoProfessionId,
): NicoWardrobe {
  const presetId = wardrobe.presetId ?? profession;
  if (presetId !== "explorer" && isLegacyBaseWardrobe(wardrobe)) {
    return wardrobeForPreset(presetId, wardrobe.accentColor);
  }
  return wardrobe;
}
