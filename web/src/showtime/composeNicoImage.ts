import type { NicoProfessionId } from "../types";
import { getNicoOutfitCell, preloadNicoImage } from "../nico/nicoDragArt";

export async function composeNicoImage(
  baseSource: string,
  outfitSource: string,
  profession: NicoProfessionId,
): Promise<HTMLImageElement | null> {
  if (!baseSource) return null;

  const base = await preloadNicoImage(baseSource);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, base.naturalWidth);
  canvas.height = Math.max(1, base.naturalHeight);
  const context = canvas.getContext("2d");
  if (!context) return base;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(base, 0, 0, canvas.width, canvas.height);

  if (outfitSource) {
    try {
      const outfit = await preloadNicoImage(outfitSource);
      const { column, row } = getNicoOutfitCell(profession);
      const sourceWidth = outfit.naturalWidth / 4;
      const sourceHeight = outfit.naturalHeight / 3;
      context.drawImage(
        outfit,
        column * sourceWidth,
        row * sourceHeight,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    } catch {
      // A valid base character is still useful when an optional outfit layer cannot decode.
    }
  }

  return preloadNicoImage(canvas.toDataURL("image/png"));
}
