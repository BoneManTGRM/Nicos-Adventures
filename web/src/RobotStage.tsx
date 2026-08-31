import { PremiumBoltBotSprite } from "./boltbot/PremiumBoltBotSprite";
import type { Robot } from "./types";

type Props = {
  robot: Robot;
  pose?: string;
  statusLabel?: string;
  levelLabel?: string;
  ariaLabel?: string;
};

export function RobotStage({
  robot,
  pose = "idle",
  statusLabel = "READY",
  levelLabel = "LV",
  ariaLabel,
}: Props) {
  return (
    <section
      className="hangar"
      aria-label={ariaLabel ?? `${robot.name} robot preview`}
      data-robot-stage="premium-2d"
    >
      <div className="hangar__light" />
      <PremiumBoltBotSprite
        robot={robot}
        action={pose}
        className={`mecha mecha--${pose}`}
        alt={`${robot.name} robot`}
      />
      <div className="robot-readout">
        <span className="robot-readout__status">{statusLabel}</span>
        <strong>{robot.name}</strong>
        <small>{robot.personality} · {levelLabel} {robot.level}</small>
      </div>
    </section>
  );
}
