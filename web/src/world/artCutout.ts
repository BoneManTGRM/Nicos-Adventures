type CutoutSource = HTMLImageElement | HTMLCanvasElement;
const cutoutCache = new Map<string, Promise<HTMLCanvasElement>>();

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Premium local artwork could not be loaded."));
    image.src = source;
  });
}

/** Assets carry their reviewed alpha masks. Never infer transparency from white:
 * fur, eyes, feathers, clothing and highlights must keep their original pixels. */
export function copyNativeCutout(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Premium local artwork could not be composed.");
  context.drawImage(image, 0, 0);
  return canvas;
}

export function loadPremiumCutout(source: string): Promise<HTMLCanvasElement> {
  const cached = cutoutCache.get(source);
  if (cached) return cached;
  const pending = loadImage(source).then(copyNativeCutout).catch((error: unknown) => {
    cutoutCache.delete(source);
    throw error;
  });
  cutoutCache.set(source, pending);
  return pending;
}

export function drawContained(context: CanvasRenderingContext2D, source: CutoutSource,
  targetWidth: number, targetHeight: number): void {
  const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, (targetWidth - width) / 2, targetHeight - height, width, height);
}
