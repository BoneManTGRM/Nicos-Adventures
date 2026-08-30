import { Canvas } from "@react-three/fiber";
import { Component, useCallback, useMemo, useState, type ReactNode } from "react";
import { AccessibilityBridge, type GameCanvasLabels } from "./AccessibilityBridge";
import { readQualityProfile, type QualityProfile } from "./quality";
import { SceneRoot, type RendererStatus } from "./SceneRoot";
import "./game-canvas.css";

class CanvasErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
  onError: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function GameCanvas({
  children,
  controls,
  labels,
  quality: qualityOverride,
}: {
  children: ReactNode;
  controls: ReactNode;
  labels: GameCanvasLabels;
  quality?: QualityProfile;
}) {
  const quality = useMemo(() => qualityOverride ?? readQualityProfile(), [qualityOverride]);
  const [status, setStatus] = useState<"loading" | "unavailable" | RendererStatus>("loading");
  const onRendererStatus = useCallback((next: RendererStatus) => setStatus(next), []);
  const onRendererError = useCallback(() => setStatus("unavailable"), []);
  const unavailable = <div className="game-canvas__fallback" role="alert">{labels.unavailable}</div>;

  return (
    <section
      className="game-canvas"
      aria-label={labels.scene}
      data-quality-tier={quality.tier}
      data-reduced-motion={quality.reducedMotion}
      data-renderer-status={status}
    >
      <CanvasErrorBoundary fallback={unavailable} onError={onRendererError}>
        <div className="game-canvas__viewport" aria-hidden="true">
          <Canvas
            camera={{ position: [0, 2.1, 5.5], fov: 50, near: 0.1, far: 100 }}
            dpr={[1, quality.maxDpr]}
            gl={{
              alpha: false,
              antialias: quality.antialias,
              powerPreference: quality.tier === "low" ? "low-power" : "high-performance",
            }}
            shadows={quality.shadows}
          >
            <SceneRoot quality={quality} onRendererStatus={onRendererStatus}>
              {children}
            </SceneRoot>
          </Canvas>
        </div>
      </CanvasErrorBoundary>
      <AccessibilityBridge controls={controls} labels={labels} status={status} />
    </section>
  );
}
