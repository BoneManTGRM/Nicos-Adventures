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

function isLightBackdrop(data: Uint8ClampedArray, offset: number): boolean {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];
  const brightest = Math.max(red, green, blue);
  const darkest = Math.min(red, green, blue);
  return alpha > 0 && darkest > 226 && brightest - darkest < 18;
}

function removeConnectedBackdrop(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Premium local artwork could not be composed.");
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const total = canvas.width * canvas.height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const enqueue = (index: number) => {
    if (visited[index] || !isLightBackdrop(pixels.data, index * 4)) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < canvas.width; x += 1) {
    enqueue(x);
    enqueue((canvas.height - 1) * canvas.width + x);
  }
  for (let y = 0; y < canvas.height; y += 1) {
    enqueue(y * canvas.width);
    enqueue(y * canvas.width + canvas.width - 1);
  }

  while (head < tail) {
    const index = queue[head++];
    pixels.data[index * 4 + 3] = 0;
    const x = index % canvas.width;
    const y = Math.floor(index / canvas.width);
    if (x > 0) enqueue(index - 1);
    if (x + 1 < canvas.width) enqueue(index + 1);
    if (y > 0) enqueue(index - canvas.width);
    if (y + 1 < canvas.height) enqueue(index + canvas.width);
  }

  context.putImageData(pixels, 0, 0);
  return canvas;
}

export function loadPremiumCutout(source: string): Promise<HTMLCanvasElement> {
  const cached = cutoutCache.get(source);
  if (cached) return cached;
  const pending = loadImage(source).then(removeConnectedBackdrop);
  cutoutCache.set(source, pending);
  return pending;
}

export function drawContained(
  context: CanvasRenderingContext2D,
  source: CutoutSource,
  targetWidth: number,
  targetHeight: number,
): void {
  const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, (targetWidth - width) / 2, targetHeight - height, width, height);
}
