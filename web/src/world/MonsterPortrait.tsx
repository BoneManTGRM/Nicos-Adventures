import type { CSSProperties } from "react";
import type { MonsterRecord } from "../types";
import { monsterBodyArtStyle } from "./monsterArt";
import { monsterFaceTreatment } from "./monsterFaceArt";
import { monsterColorSwatch } from "./monsterCreatureStudio";

export function MonsterPortrait({
  body,
  color,
  arms = "Tiny arms",
  label,
}: {
  body: MonsterRecord["body"] | string;
  color: MonsterRecord["color"] | string;
  arms?: MonsterRecord["arms"] | string;
  label: string;
}) {
  const resolvedColor = monsterColorSwatch(color);
  const faceTreatment = monsterFaceTreatment(body);
  const style = {
    ...monsterBodyArtStyle(body, resolvedColor, arms),
    "--monster-main": resolvedColor,
  } as CSSProperties;

  return (
    <span
      className="monster-portrait monster-portrait--approved-reference"
      data-monster-portrait-body={body}
      data-monster-face-treatment={faceTreatment}
      data-monster-art-source="approved-user-reference"
      style={style}
      role="img"
      aria-label={label}
    >
      <span className="monster-portrait__halo" aria-hidden="true" />
      <span className="monster-portrait__body" aria-hidden="true">
        <span className="monster-portrait__art" />
        <span className="monster-portrait__tint" />
      </span>
    </span>
  );
}
