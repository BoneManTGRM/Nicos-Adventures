import type { CSSProperties } from "react";
import { boltBotAppearanceFromRobot } from "../game3d/boltbot/appearance";
import type { Robot } from "../types";
import { premiumBoltBotPose, premiumBoltBotSpriteStyle } from "./canonicalBoltBotArt";
import "./premium-boltbot.css";

function optionIndex(value: string, size: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % size;
}

function BoltBotCustomization({ robot }: { robot: Robot }) {
  const head = optionIndex(robot.head, 4);
  const eyes = optionIndex(robot.eyes, 4);
  const body = optionIndex(robot.body, 4);
  const arms = optionIndex(robot.arms, 4);
  const base = optionIndex(robot.base, 4);
  const backpack = optionIndex(robot.backpack, 4);
  const power = optionIndex(robot.power, 4);
  const mood = optionIndex(robot.mood || robot.personality, 4);
  const voice = optionIndex(robot.voice || "Classic Beep", 4);
  const crestPaths = [
    "M43 23 50 9l7 14-7-3z",
    "M41 23 44 10l6 7 6-7 3 13-9-3z",
    "M41 23 50 12l9 11-9-4z",
    "M42 23q8-16 16 0l-8-3z",
  ];
  const chestPaths = [
    "M43 45h14l-2 14-5 5-5-5z",
    "M42 46l8-5 8 5-3 16H45z",
    "M41 46h18l-9 17z",
    "M43 44h14v18H43z",
  ];

  return <svg className="premium-boltbot-sprite__custom" viewBox="0 0 100 133" aria-hidden="true">
    <g className="boltbot-backpack" opacity=".96">
      {backpack === 0 && <path d="M31 45 22 35l-4 22 13 7m38-19 9-10 4 22-13 7" />}
      {backpack === 1 && <><rect x="25" y="40" width="9" height="27" rx="4"/><rect x="66" y="40" width="9" height="27" rx="4"/></>}
      {backpack === 2 && <><path d="M27 47 12 42l8 17 10 4M73 47l15-5-8 17-10 4"/><circle cx="17" cy="45" r="3"/><circle cx="83" cy="45" r="3"/></>}
      {backpack === 3 && <path d="M29 47 18 34v29l12 3m41-19 11-13v29l-12 3" />}
    </g>
    <g className="boltbot-armor">
      <path className="boltbot-armor__head" d="M37 25q13-8 26 0l-2 19q-11 8-22 0z"/>
      <path className="boltbot-armor__crest" d={crestPaths[head]}/>
      <path className="boltbot-armor__chest" d={chestPaths[body]}/>
      <path className="boltbot-armor__hips" d="M38 69h24l-3 9H41z"/>
      <path className="boltbot-armor__boots" d={base === 0 ? "M31 100h14v21H27l3-9m39-12H55v21h18l-3-9" : base === 1 ? "M27 106h19v15H23l2-8m48-7H54v15h23l-2-8" : base === 2 ? "M27 108q8-8 19 0v12H25zm46 0q-8-8-19 0v12h21z" : "M30 101h15l2 19H25l5-8m40-11H55l-2 19h22l-5-8"}/>
      <path className="boltbot-armor__arms" d={arms === 0 ? "M28 51 17 62l5 18 9-4-5-13 8-7m38-5 11 11-5 18-9-4 5-13-8-7" : arms === 1 ? "M29 52 14 67l10 12 8-7-7-6 10-10m36-4 15 15-10 12-8-7 7-6-10-10" : arms === 2 ? "M30 52 15 58l3 21 12-2-3-14 8-6m35-5 15 6-3 21-12-2 3-14-8-6" : "M30 52 16 64l4 17 10-5-4-11 9-8m35-5 14 12-4 17-10-5 4-11-9-8"}/>
    </g>
    <g className="boltbot-face">
      <rect x="39" y="29" width="22" height="12" rx={eyes === 2 ? 2 : 5}/>
      {eyes === 0 && <><circle cx="45" cy="35" r="2"/><circle cx="55" cy="35" r="2"/></>}
      {eyes === 1 && <><path d="M43 35h5m4 0h5" strokeWidth="2.4"/><circle cx="50" cy="35" r="1"/></>}
      {eyes === 2 && <path d="M42 35h16" strokeWidth="3.2"/>}
      {eyes === 3 && <><circle cx="44" cy="35" r="1.7"/><circle cx="50" cy="34" r="2"/><circle cx="56" cy="35" r="1.7"/></>}
      <path className="boltbot-brow" d={mood === 0 ? "M42 31h6m4 0h6" : mood === 1 ? "M42 32l6-2m4 0 6 2" : mood === 2 ? "M42 30l6 2m4 0 6-2" : "M42 31h6m4 0h6"}/>
    </g>
    <g className="boltbot-power">
      <circle cx="50" cy="53" r={power === 2 ? 8 : 6}/>
      {power === 0 && <path d="m50 47 3 5-3 7-3-7z"/>}
      {power === 1 && <path d="M45 53q5-8 10 0-5 8-10 0"/>}
      {power === 2 && <path d="M42 53h16M50 45v16"/>}
      {power === 3 && <path d="m50 45 2.5 5.5 6 .5-4.5 4 1.5 6-5.5-3-5.5 3 1.5-6-4.5-4 6-.5z"/>}
    </g>
    <g className="boltbot-voice" opacity=".85">
      {Array.from({ length: voice + 2 }, (_, index) => <rect key={index} x={43 + index * 3} y={66 - (index % 2)} width="1.5" height={3 + (index % 2) * 2} rx=".7"/>)}
    </g>
  </svg>;
}

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
    "--boltbot-primary": appearance.primary,
    "--boltbot-accent": appearance.accent,
  } as CSSProperties;

  return (
    <span
      className={`premium-boltbot-sprite ${className}`.trim()}
      style={style}
      data-boltbot-renderer="premium-2d"
      data-boltbot-customization="fitted"
      data-boltbot-pose={pose}
      data-boltbot-head={robot.head}
      data-boltbot-eyes={robot.eyes}
      data-boltbot-body={robot.body}
      data-boltbot-arms={robot.arms}
      data-boltbot-base={robot.base}
      data-boltbot-backpack={robot.backpack}
      data-boltbot-power={robot.power}
      data-boltbot-personality={robot.personality}
      data-boltbot-mood={robot.mood || ""}
      data-boltbot-voice={robot.voice || ""}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <span className="premium-boltbot-sprite__base" style={premiumBoltBotSpriteStyle(action)} />
      <BoltBotCustomization robot={robot} />
    </span>
  );
}
