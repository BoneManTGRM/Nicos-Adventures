export type StarBridgeStep =
  | "briefing"
  | "map_revealed"
  | "robot_configured"
  | "movement_passed"
  | "scanner_passed"
  | "logic_passed"
  | "bridge_inspected"
  | "star_core_installed"
  | "complete";

export type StarBridgeEvent =
  | { type: "REVEAL_BRIDGE" }
  | { type: "CONFIGURE_ROBOT" }
  | { type: "PASS_MOVEMENT_TEST" }
  | { type: "PASS_SCANNER_TEST" }
  | { type: "PASS_LOGIC_TEST" }
  | { type: "INSPECT_BRIDGE" }
  | { type: "INSTALL_STAR_CORE" }
  | { type: "COMPLETE_ADVENTURE" }
  | { type: "RESET_ADVENTURE" };

export type StarBridgeState = {
  step: StarBridgeStep;
  bridgeRepaired: boolean;
  dinosaurValleyUnlocked: boolean;
  museumAchievements: string[];
  completedAt?: string;
};

export const STAR_BRIDGE_ENGINEER = "star-bridge-engineer";

export const initialStarBridgeState = (): StarBridgeState => ({
  step: "briefing",
  bridgeRepaired: false,
  dinosaurValleyUnlocked: false,
  museumAchievements: [],
});

const transition: Record<Exclude<StarBridgeEvent["type"], "RESET_ADVENTURE" | "COMPLETE_ADVENTURE">, [StarBridgeStep, StarBridgeStep]> = {
  REVEAL_BRIDGE: ["briefing", "map_revealed"],
  CONFIGURE_ROBOT: ["map_revealed", "robot_configured"],
  PASS_MOVEMENT_TEST: ["robot_configured", "movement_passed"],
  PASS_SCANNER_TEST: ["movement_passed", "scanner_passed"],
  PASS_LOGIC_TEST: ["scanner_passed", "logic_passed"],
  INSPECT_BRIDGE: ["logic_passed", "bridge_inspected"],
  INSTALL_STAR_CORE: ["bridge_inspected", "star_core_installed"],
};

export function reduceStarBridge(
  state: StarBridgeState,
  event: StarBridgeEvent,
  now: () => string = () => new Date().toISOString(),
): StarBridgeState {
  if (event.type === "RESET_ADVENTURE") return initialStarBridgeState();

  if (event.type === "COMPLETE_ADVENTURE") {
    if (state.step === "complete") return state;
    if (state.step !== "star_core_installed") return state;

    return {
      ...state,
      step: "complete",
      bridgeRepaired: true,
      dinosaurValleyUnlocked: true,
      museumAchievements: state.museumAchievements.includes(STAR_BRIDGE_ENGINEER)
        ? state.museumAchievements
        : [...state.museumAchievements, STAR_BRIDGE_ENGINEER],
      completedAt: now(),
    };
  }

  const [requiredStep, nextStep] = transition[event.type];
  if (state.step !== requiredStep) return state;
  return { ...state, step: nextStep };
}

export const isStarBridgeComplete = (state: StarBridgeState): boolean =>
  state.step === "complete" &&
  state.bridgeRepaired &&
  state.dinosaurValleyUnlocked &&
  state.museumAchievements.includes(STAR_BRIDGE_ENGINEER);
