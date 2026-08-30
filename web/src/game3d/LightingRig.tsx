import type { QualityProfile } from "./quality";

export function LightingRig({ quality }: { quality: QualityProfile }) {
  return (
    <>
      <hemisphereLight args={["#dff7ff", "#172342", 1.4]} />
      <directionalLight
        castShadow={quality.shadows}
        color="#fff3d8"
        intensity={2.1}
        position={[4, 7, 3]}
        shadow-mapSize-height={quality.tier === "high" ? 2048 : 1024}
        shadow-mapSize-width={quality.tier === "high" ? 2048 : 1024}
      />
      <directionalLight color="#6ddcff" intensity={0.55} position={[-4, 3, -2]} />
    </>
  );
}
