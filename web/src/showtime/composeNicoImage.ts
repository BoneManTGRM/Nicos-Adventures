import type { NicoWardrobe } from "../types";
import { loadNicoWardrobeImage } from "../nico/wardrobe/wardrobeSvg";
import { PHOTO_NICO_HEIGHT, PHOTO_NICO_WIDTH, loadImageSource, loadPhotoNicoBodyImage } from "../nico/wardrobe/photoNicoBody";
import { photoWardrobeBackgroundDataUrl, photoWardrobeForegroundDataUrl } from "../nico/wardrobe/photoWardrobeSvg";

/**
 * Composes the same supplied Nico photo body and transparent wardrobe layers used
 * by the live React character. Everything is generated locally in the browser.
 */
export async function composeNicoImage(wardrobe: NicoWardrobe): Promise<HTMLImageElement> {
  try {
    const [background, body, foreground] = await Promise.all([
      loadImageSource(photoWardrobeBackgroundDataUrl(wardrobe)),
      loadPhotoNicoBodyImage(),
      loadImageSource(photoWardrobeForegroundDataUrl(wardrobe)),
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_NICO_WIDTH;
    canvas.height = PHOTO_NICO_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nico photo canvas is unavailable");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.drawImage(body, 0, 0, canvas.width, canvas.height);
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);
    return await loadImageSource(canvas.toDataURL("image/png"));
  } catch {
    return loadNicoWardrobeImage(wardrobe);
  }
}
