import type { NicoWardrobe } from "../types";
import { loadNicoWardrobeImage } from "../nico/wardrobe/wardrobeSvg";

/**
 * Uses the exact same vector wardrobe renderer as the live React character.
 * No child content or image is uploaded; the SVG is generated in memory.
 */
export function composeNicoImage(wardrobe: NicoWardrobe): Promise<HTMLImageElement> {
  return loadNicoWardrobeImage(wardrobe);
}
