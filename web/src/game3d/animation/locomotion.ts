export type LocomotionState = "idle" | "turn" | "walk" | "run";

export type LocomotionWeights = Record<LocomotionState, number>;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export function resolveLocomotionState(speed: number, angularSpeed: number): LocomotionState {
  if (speed < 0.08) return Math.abs(angularSpeed) > 0.3 ? "turn" : "idle";
  return speed < 3.1 ? "walk" : "run";
}

export function locomotionBlendWeights(speed: number, angularSpeed: number): LocomotionWeights {
  const normalizedSpeed = clamp01(speed / 4.5);
  const run = clamp01((normalizedSpeed - 0.48) / 0.52);
  const moving = clamp01(normalizedSpeed / 0.18);
  const turn = (1 - moving) * clamp01(Math.abs(angularSpeed) / 1.5);
  const idle = (1 - moving) * (1 - turn);
  const walk = moving * (1 - run);

  return { idle, turn, walk, run };
}
