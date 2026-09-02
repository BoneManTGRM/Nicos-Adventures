import type { CSSProperties } from "react";
import type { MonsterRecord } from "../types";
import { monsterAccessoryLayout, monsterBodyArtStyle } from "./monsterArt";
import { MonsterFaceArt, monsterFaceTreatment } from "./monsterFaceArt";
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
  const id = `portrait-${body.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const layout = monsterAccessoryLayout(body);
  const faceTreatment = monsterFaceTreatment(body);
  const style = {
    ...monsterBodyArtStyle(body, resolvedColor, arms),
    "--monster-main": resolvedColor,
  } as CSSProperties;

  return (
    <span
      className="monster-portrait"
      data-monster-portrait-body={body}
      data-monster-face-treatment={faceTreatment}
      style={style}
      role="img"
      aria-label={label}
    >
      <span className="monster-portrait__halo" aria-hidden="true" />
      <span className="monster-portrait__body" aria-hidden="true">
        <span className="monster-portrait__art" />
        <span className="monster-portrait__tint" />
      </span>
      <svg className="monster-portrait__traits" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
          <radialGradient id={`eye-${id}`} cx="35%" cy="30%">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".32" stopColor={resolvedColor} />
            <stop offset=".74" stopColor="#164e63" />
            <stop offset="1" stopColor="#020617" />
          </radialGradient>
          <radialGradient id={`core-${id}`} cx="38%" cy="32%">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".24" stopColor="#cffafe" />
            <stop offset=".62" stopColor={resolvedColor} />
            <stop offset="1" stopColor="#020617" />
          </radialGradient>
          <filter id={`monster-glow-${id}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <MonsterFaceArt body={body} monsterId={id} color={resolvedColor} layout={layout} />
      </svg>
    </span>
  );
}
