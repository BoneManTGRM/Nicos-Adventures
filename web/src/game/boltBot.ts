import type { Robot } from "../types";
import type { StarBridgeStep } from "./goldenAdventure";

export type BoltBotCapability = "movement" | "scanner" | "repair" | "star-power";
export type MovementCommand = "forward" | "left" | "right";

export type BoltBotReadiness = {
  ready: boolean;
  missing: BoltBotCapability[];
};

export type BoltBotChamberStage = "inactive" | "configuration" | "movement" | "scanner" | "logic" | "complete";

export type BoltBotRoutePose = {
  x: number;
  z: number;
  heading: number;
};

export type BoltBotRouteWaypoint = BoltBotRoutePose & {
  command: MovementCommand;
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

const chamberStageByStep: Record<StarBridgeStep, BoltBotChamberStage> = {
  briefing: "inactive",
  map_revealed: "configuration",
  robot_configured: "movement",
  movement_passed: "scanner",
  scanner_passed: "logic",
  logic_passed: "complete",
  bridge_inspected: "inactive",
  star_core_installed: "inactive",
  complete: "inactive",
};

export function boltBotChamberStage(step: StarBridgeStep): BoltBotChamberStage {
  return chamberStageByStep[step];
}

export function boltBotRoutePose(commands: readonly MovementCommand[]): BoltBotRoutePose {
  return boltBotRouteWaypoints(commands).at(-1) ?? { x: -0.8, z: -0.75, heading: 0 };
}

export function boltBotRouteWaypoints(commands: readonly MovementCommand[]): BoltBotRouteWaypoint[] {
  const pose: BoltBotRoutePose = { x: -0.8, z: -0.75, heading: 0 };
  const waypoints: BoltBotRouteWaypoint[] = [];
  for (const command of commands) {
    if (command === "left") pose.heading -= Math.PI / 2;
    if (command === "right") pose.heading += Math.PI / 2;
    if (command === "forward") {
      pose.x += Math.sin(pose.heading) * 0.85;
      pose.z += Math.cos(pose.heading) * 0.85;
    }
    waypoints.push({ ...pose, command });
  }
  return waypoints;
}

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
