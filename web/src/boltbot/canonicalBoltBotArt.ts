import type { CSSProperties } from "react";
import boltBotPoseAtlas from "../assets/boltbot/boltbot-premium-poses-atlas.webp";

export type PremiumBoltBotPose =
  | "idle"
  | "wave"
  | "drive"
  | "scan"
  | "diagnostics"
  | "repair"
  | "celebrate"
  | "ready";

const POSE_CELLS: Record<PremiumBoltBotPose, { column: number; row: number }> = {
  idle: { column: 0, row: 0 },
  wave: { column: 1, row: 0 },
  drive: { column: 2, row: 0 },
  scan: { column: 3, row: 0 },
  diagnostics: { column: 0, row: 1 },
  repair: { column: 1, row: 1 },
  celebrate: { column: 2, row: 1 },
  ready: { column: 3, row: 1 },
};

const ACTION_POSES: Record<string, PremiumBoltBotPose> = {
  idle: "idle",
  wave: "wave",
  launch: "drive",
  drive: "drive",
  celebrate: "celebrate",
  dance: "celebrate",
  spin: "celebrate",
  blink: "idle",
  scan: "scan",
  charge: "ready",
  hover: "drive",
  stomp: "drive",
  salute: "wave",
  repair: "repair",
  shield: "ready",
  lights: "diagnostics",
  think: "diagnostics",
  ready: "ready",
};

export const PREMIUM_BOLTBOT_POSES = Object.freeze(Object.keys(POSE_CELLS) as PremiumBoltBotPose[]);

export function premiumBoltBotPose(action: string): PremiumBoltBotPose {
  return ACTION_POSES[action.toLowerCase()] ?? "idle";
}
export function premiumBoltBotSpriteStyle(action: string): CSSProperties {
  const cell = POSE_CELLS[premiumBoltBotPose(action)];
  return {
    backgroundImage: `url("${boltBotPoseAtlas}")`,
    backgroundPosition: `${cell.column * (100 / 3)}% ${cell.row * 100}%`,
    backgroundSize: "400% 200%",
  };
}
