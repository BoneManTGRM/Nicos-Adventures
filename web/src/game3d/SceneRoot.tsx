import { AdaptiveDpr, Preload } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Suspense, useEffect, type ReactNode } from "react";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./LightingRig";
import type { QualityProfile } from "./quality";

export type RendererStatus = "ready" | "context-lost" | "context-restored";

function RendererLifecycle({ onStatus }: { onStatus: (status: RendererStatus) => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onStatus("context-lost");
    };
    const restored = () => onStatus("context-restored");
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    onStatus("ready");
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl, onStatus]);

  return null;
}

export function SceneRoot({
  children,
  quality,
  onRendererStatus,
}: {
  children: ReactNode;
  quality: QualityProfile;
  onRendererStatus: (status: RendererStatus) => void;
}) {
  return (
    <>
      <color attach="background" args={["#091126"]} />
      <fog attach="fog" args={["#091126", 18, 44]} />
      <RendererLifecycle onStatus={onRendererStatus} />
      <CameraRig />
      <LightingRig quality={quality} />
      <Suspense fallback={null}>{children}</Suspense>
      <AdaptiveDpr pixelated={quality.tier === "low"} />
      <Preload all />
    </>
  );
}
