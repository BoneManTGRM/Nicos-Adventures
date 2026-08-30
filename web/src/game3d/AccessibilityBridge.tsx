import type { ReactNode } from "react";
import type { RendererStatus } from "./SceneRoot";

export type GameCanvasLabels = {
  scene: string;
  loading: string;
  ready: string;
  contextLost: string;
  contextRestored: string;
  unavailable: string;
  instructions: string;
};

export function AccessibilityBridge({
  controls,
  labels,
  status,
}: {
  controls: ReactNode;
  labels: GameCanvasLabels;
  status: "loading" | "unavailable" | RendererStatus;
}) {
  const statusText = status === "loading"
    ? labels.loading
    : status === "ready"
      ? labels.ready
      : status === "context-lost"
        ? labels.contextLost
        : status === "context-restored"
          ? labels.contextRestored
          : labels.unavailable;

  return (
    <div className="game-accessibility-bridge">
      <p className="sr-only" role="status" aria-live="polite">{statusText}</p>
      <p className="game-canvas__instructions">{labels.instructions}</p>
      <div className="game-canvas__controls">{controls}</div>
    </div>
  );
}
