import type { MovementInput } from "../simulation/characterMotor";

export type InputAction =
  | "move-forward"
  | "move-backward"
  | "move-left"
  | "move-right"
  | "run"
  | "interact"
  | "cancel"
  | "pause";

export const DEFAULT_KEY_BINDINGS: Readonly<Record<string, InputAction>> = {
  ArrowDown: "move-backward",
  ArrowLeft: "move-left",
  ArrowRight: "move-right",
  ArrowUp: "move-forward",
  Escape: "cancel",
  KeyA: "move-left",
  KeyD: "move-right",
  KeyE: "interact",
  KeyP: "pause",
  KeyS: "move-backward",
  KeyW: "move-forward",
  ShiftLeft: "run",
  ShiftRight: "run",
  Space: "interact",
};

export function keyboardAction(code: string): InputAction | null {
  return DEFAULT_KEY_BINDINGS[code] ?? null;
}

export function movementInput(actions: ReadonlySet<InputAction>): MovementInput {
  const raw = {
    x: Number(actions.has("move-right")) - Number(actions.has("move-left")),
    z: Number(actions.has("move-forward")) - Number(actions.has("move-backward")),
  };
  const magnitude = Math.hypot(raw.x, raw.z);
  return magnitude > 1
    ? { x: raw.x / magnitude, z: raw.z / magnitude }
    : raw;
}
