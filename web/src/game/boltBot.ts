import type { Robot } from "../types";

export type BoltBotCapability = "movement" | "scanner" | "repair" | "star-power";
export type MovementCommand = "forward" | "left" | "right";

export type BoltBotReadiness = {
  ready: boolean;
  missing: BoltBotCapability[];
};

const SCANNER_EYES = new Set([
  "Photon Visor",
  "Scanner Array",
  "Laser Eyes",
  "Night Vision",
  "Hologram Face",
  "Six Sensor Array",
]);

const MOVEMENT_BASES = new Set([
  "Vernier Legs",
  "Tank Treads",
  "Hover Ring",
  "Rocket Boots",
  "Spider Legs",
  "Speed Wheels",
  "Dino Legs",
  "Moon Boots",
  "Skates",
  "Aqua Fins",
  "Spring Legs",
  "Four-Wheel Drive",
]);

const REPAIR_ARMS = new Set([
  "Tool Arms",
  "Giant Hands",
  "Drill Arms",
  "Claw Hands",
  "Magnet Hands",
  "Rescue Grippers",
]);

const STAR_POWER = new Set([
  "Star Reactor",
  "Rescue Beam",
  "Super Magnet",
  "Portal Generator",
]);

export const BOLT_BOT_MOVEMENT_SEQUENCE: readonly MovementCommand[] = ["forward", "right", "forward"];

export const BOLT_BOT_SCAN_TARGETS = [
  { id: "loose-bolt", signal: 2 },
  { id: "star-core-socket", signal: 5 },
  { id: "decorative-panel", signal: 1 },
] as const;

export const BOLT_BOT_LOGIC_SEQUENCE = ["star", "bolt", "star", "bolt"] as const;
export const BOLT_BOT_LOGIC_ANSWER = "star";

export function evaluateBoltBotReadiness(robot: Robot): BoltBotReadiness {
  const missing: BoltBotCapability[] = [];
  if (!MOVEMENT_BASES.has(robot.base)) missing.push("movement");
  if (!SCANNER_EYES.has(robot.eyes)) missing.push("scanner");
  if (!REPAIR_ARMS.has(robot.arms)) missing.push("repair");
  if (!STAR_POWER.has(robot.power)) missing.push("star-power");
  return { ready: missing.length === 0, missing };
}

export function passesMovementTest(commands: readonly MovementCommand[]): boolean {
  return commands.length === BOLT_BOT_MOVEMENT_SEQUENCE.length &&
    commands.every((command, index) => command === BOLT_BOT_MOVEMENT_SEQUENCE[index]);
}

export function strongestScanTarget(targets: ReadonlyArray<{ id: string; signal: number }>): string | null {
  const finite = targets.filter((target) => Number.isFinite(target.signal));
  if (!finite.length) return null;
  const strongest = Math.max(...finite.map((target) => target.signal));
  const matches = finite.filter((target) => target.signal === strongest);
  return matches.length === 1 ? matches[0].id : null;
}

export function passesScannerTest(selectedTargetId: string): boolean {
  return selectedTargetId === strongestScanTarget(BOLT_BOT_SCAN_TARGETS);
}

export function passesLogicTest(answer: string): boolean {
  return answer === BOLT_BOT_LOGIC_ANSWER;
}
