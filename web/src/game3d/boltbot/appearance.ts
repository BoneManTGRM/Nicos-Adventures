import type { Robot } from "../../types";

const primaryColors: Record<string, string> = {
  "Electric Blue": "#38bdf8",
  "Crimson Red": "#dc2626",
  "Emerald Green": "#10b981",
  "Royal Purple": "#8b5cf6",
  "Solar Orange": "#f97316",
  "Pearl White": "#e2e8f0",
  "Midnight Black": "#172554",
  "Rose Gold": "#e9a6a6",
  "Arctic Cyan": "#22d3ee",
  "Volcanic Red": "#b91c1c",
  "Galaxy Violet": "#6d28d9",
  "Jungle Green": "#15803d",
};

const accentColors: Record<string, string> = {
  "Sunny Yellow": "#facc15",
  "Neon Cyan": "#22d3ee",
  "Hot Pink": "#ec4899",
  Silver: "#cbd5e1",
  Lime: "#84cc16",
  Copper: "#c26d3a",
  "Pearl White": "#f8fafc",
  Orange: "#fb923c",
  "Electric Purple": "#a855f7",
  "Ice Blue": "#bae6fd",
};

export function boltBotAppearanceFromRobot(robot?: Pick<Robot, "color" | "secondary_color">) {
  return {
    primary: primaryColors[robot?.color ?? ""] ?? primaryColors["Electric Blue"],
    accent: accentColors[robot?.secondary_color ?? ""] ?? accentColors["Sunny Yellow"],
  };
}
