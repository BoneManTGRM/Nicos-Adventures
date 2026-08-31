import type { NicoProfessionId } from "../types";
import { loadCanonicalNicoImage } from "../nico/canonicalNicoArt";

/**
 * Crops the same authored local profession atlas used by every live Nico
 * surface. No child content or image is uploaded.
 */
export function composeNicoImage(profession: NicoProfessionId): Promise<HTMLImageElement> {
  return loadCanonicalNicoImage(profession);
}
