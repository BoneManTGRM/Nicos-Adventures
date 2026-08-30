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

export type GoldenAdventureProgress = {
  starBridge: StarBridgeState;
};

export const STAR_BRIDGE_ENGINEER = "star-bridge-engineer";

export const initialStarBridgeState = (): StarBridgeState => ({
  step: "briefing",
  bridgeRepaired: false,
  dinosaurValleyUnlocked: false,
  museumAchievements: [],
});

export const initialGoldenAdventureProgress = (): GoldenAdventureProgress => ({
  starBridge: initialStarBridgeState(),
});

const starBridgeSteps: StarBridgeStep[] = [
  "briefing",
  "map_revealed",
  "robot_configured",
  "movement_passed",
  "scanner_passed",
  "logic_passed",
  "bridge_inspected",
  "star_core_installed",
  "complete",
];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

export function normalizeStarBridgeState(candidate: unknown): StarBridgeState {
  const value = asRecord(candidate);
  if (!value || !starBridgeSteps.includes(value.step as StarBridgeStep)) {
    return initialStarBridgeState();
  }

  const step = value.step as StarBridgeStep;
  if (step !== "complete") return { ...initialStarBridgeState(), step };

  const completedAt = typeof value.completedAt === "string"
    ? value.completedAt.trim().slice(0, 50)
    : "";
  const achievements = Array.isArray(value.museumAchievements)
    ? value.museumAchievements
    : [];
  const validCompletion = value.bridgeRepaired === true &&
    value.dinosaurValleyUnlocked === true &&
    achievements.includes(STAR_BRIDGE_ENGINEER) &&
    completedAt.length > 0 &&
    Number.isFinite(Date.parse(completedAt));

  if (!validCompletion) {
    return initialStarBridgeState();
  }

  return {
    step: "complete",
    bridgeRepaired: true,
    dinosaurValleyUnlocked: true,
    museumAchievements: [STAR_BRIDGE_ENGINEER],
    completedAt,
  };
}

export function normalizeGoldenAdventureProgress(candidate: unknown): GoldenAdventureProgress {
  const value = asRecord(candidate);
  return {
    starBridge: normalizeStarBridgeState(value?.starBridge),
  };
}

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
