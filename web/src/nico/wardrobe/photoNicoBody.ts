import { useEffect, useState } from "react";

export const PHOTO_NICO_WIDTH = 510;
export const PHOTO_NICO_HEIGHT = 1467;
export const PHOTO_NICO_BODY_PATH = "/assets/nico/photo/nico-photo-body.webp.b64";

let sourcePromise: Promise<string> | null = null;

export function loadPhotoNicoBodySource(): Promise<string> {
  if (!sourcePromise) {
    sourcePromise = fetch(PHOTO_NICO_BODY_PATH, { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Nico body asset failed with ${response.status}`);
        const encoded = (await response.text()).replace(/\s+/g, "");
        if (!encoded || encoded.length < 1000) throw new Error("Nico body asset is incomplete");
        return `data:image/webp;base64,${encoded}`;
      })
      .catch((error) => {
        sourcePromise = null;
        throw error;
      });
  }
  return sourcePromise;
}

export function usePhotoNicoBody(overrideSource?: string) {
  const [source, setSource] = useState(overrideSource ?? "");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (overrideSource) {
      setSource(overrideSource);
      setError(null);
      return;
    }
    let cancelled = false;
    loadPhotoNicoBodySource()
      .then((next) => {
        if (!cancelled) {
          setSource(next);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason : new Error(String(reason)));
      });
    return () => { cancelled = true; };
  }, [overrideSource]);

  return { source, error };
}

export function loadImageSource(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Nico image could not be decoded"));
    image.src = source;
  });
}

export async function loadPhotoNicoBodyImage(): Promise<HTMLImageElement> {
  return loadImageSource(await loadPhotoNicoBodySource());
}
