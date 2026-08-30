import { useGLTF } from "@react-three/drei";

export type AdventureAssetManifest = Record<string, string>;

export function assetUrl(manifest: AdventureAssetManifest, key: string): string {
  const url = manifest[key];
  if (!url) throw new Error(`Missing 3D asset manifest key: ${key}`);
  return url;
}

export function useAdventureModel(manifest: AdventureAssetManifest, key: string) {
  return useGLTF(assetUrl(manifest, key));
}

export function preloadAdventureModel(manifest: AdventureAssetManifest, key: string): void {
  useGLTF.preload(assetUrl(manifest, key));
}
