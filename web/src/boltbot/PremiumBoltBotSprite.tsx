import type { CSSProperties } from "react";
import { boltBotAppearanceFromRobot } from "../game3d/boltbot/appearance";
import type { Robot } from "../types";
import { premiumBoltBotPose, premiumBoltBotSpriteStyle } from "./canonicalBoltBotArt";
import "./premium-boltbot.css";

export function PremiumBoltBotSprite({
  robot,
  action = "idle",
  alt,
  className = "",
}: {
  robot: Robot;
  action?: string;
  alt?: string;
  className?: string;
}) {
  const appearance = boltBotAppearanceFromRobot(robot);
  const pose = premiumBoltBotPose(action);
  const style = {
    ...premiumBoltBotSpriteStyle(action),
    "--boltbot-primary": appearance.primary,
    "--boltbot-accent": appearance.accent,
  } as CSSProperties;

  return (
    <span
      className={`premium-boltbot-sprite ${className}`.trim()}
      style={style}
      data-boltbot-renderer="premium-2d"
      data-boltbot-pose={pose}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  );
}
