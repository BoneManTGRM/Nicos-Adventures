import type { StarBridgeStep } from "./goldenAdventure";
import type { LocalProfile } from "../types";

export type StarBridgeRepairStage = "inactive" | "inspect" | "install" | "activate" | "complete";
export type StarCoreCommand = "align" | "lock" | "charge";

export const STAR_BRIDGE_FAULT_TARGETS = [
  { id: "cracked-handrail", severity: 2 },
  { id: "dark-core-socket", severity: 5 },
  { id: "loose-banner-cable", severity: 3 },
] as const;

export const STAR_BRIDGE_FAULT = "dark-core-socket";
export const STAR_CORE_INSTALL_SEQUENCE: readonly StarCoreCommand[] = ["align", "lock", "charge"];

const repairStageByStep: Record<StarBridgeStep, StarBridgeRepairStage> = {
  briefing: "inactive",
  map_revealed: "inactive",
  robot_configured: "inactive",
  movement_passed: "inactive",
  scanner_passed: "inactive",
  logic_passed: "inspect",
  bridge_inspected: "install",
  star_core_installed: "activate",
  complete: "complete",
};

export function starBridgeRepairStage(step: StarBridgeStep): StarBridgeRepairStage {
  return repairStageByStep[step];
}

export function isStarBridgeFault(targetId: string): boolean {
  return targetId === STAR_BRIDGE_FAULT;
}

export function passesStarCoreInstall(commands: readonly StarCoreCommand[]): boolean {
  return commands.length === STAR_CORE_INSTALL_SEQUENCE.length &&
    commands.every((command, index) => command === STAR_CORE_INSTALL_SEQUENCE[index]);
}

export function hasDinosaurValleyAccess(profile: Pick<LocalProfile, "adventures" | "dinosaurs" | "fossils" | "sectionVisits">): boolean {
  if (profile.adventures.starBridge.dinosaurValleyUnlocked) return true;
  return Number(profile.sectionVisits["dinosaur-valley"] ?? 0) > 0 ||
    profile.fossils.length > 0 ||
    profile.dinosaurs.some((dinosaur) => dinosaur.discovered);
}
