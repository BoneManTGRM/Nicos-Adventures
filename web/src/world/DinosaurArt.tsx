import type { ReactNode } from "react";
import type { DinosaurRecord, Language } from "../types";
import { optionLabel } from "../i18n/display";

const colors: Record<string, [string, string]> = {
  trex: ["#ea580c", "#7c2d12"],
  triceratops: ["#65a30d", "#365314"],
  stegosaurus: ["#16a34a", "#14532d"],
  brachiosaurus: ["#64748b", "#1e293b"],
  ankylosaurus: ["#a16207", "#422006"],
  velociraptor: ["#0f766e", "#134e4a"],
};

function Trex({ fill, dark }: { fill: string; dark: string }) {
  return <g><path d="M70 155C20 140 6 112 4 88c40 22 85 27 126 18 42-9 67-3 88 17 17 16 24 35 19 57-9 39-50 57-104 49-33-5-49-21-63-42Z" fill={fill}/><path d="M195 113c28-28 72-30 105-8 26 17 34 42 23 68-13 30-51 37-83 19-22-12-39-40-45-79Z" fill={fill}/><path d="m284 116 56 11-26 20 31 18-66 9Z" fill={dark}/><circle cx="286" cy="133" r="7" fill="#fef3c7"/><circle cx="288" cy="134" r="3" fill="#111827"/><path d="M165 216 146 253h24l18-35m45-7 11 42h25l-8-50" fill="none" stroke={dark} strokeWidth="18" strokeLinecap="round"/><path d="m228 162-25 18m32-8-20 24" stroke={dark} strokeWidth="8" strokeLinecap="round"/></g>;
}
function Triceratops({ fill, dark }: { fill: string; dark: string }) {
  return <g><ellipse cx="180" cy="168" rx="116" ry="61" fill={fill}/><path d="M265 121c29-25 78-24 105 4l-18 61c-33 28-81 22-103-13Z" fill={fill}/><path d="M298 112c24-43 67-48 96-18-22 7-36 18-42 34m-42 1-31-43m66 44 38-27" fill="none" stroke="#fef3c7" strokeWidth="12" strokeLinecap="round"/><path d="M85 200 75 245m72-39-8 42m87-43 8 43m65-53 13 49" stroke={dark} strokeWidth="18" strokeLinecap="round"/><path d="M70 157 20 137l44 39" fill={dark}/><circle cx="331" cy="139" r="6" fill="#111827"/></g>;
}
function Stegosaurus({ fill, dark }: { fill: string; dark: string }) {
  const plates = [[105,112],[137,90],[174,82],[211,88],[245,105]];
  return <g><ellipse cx="180" cy="170" rx="122" ry="61" fill={fill}/><path d="M278 143c39-24 77-13 97 17-32 24-66 31-104 22Z" fill={fill}/><path d="M67 164 9 125l57 65" fill={dark}/>{plates.map(([x,y],index)=><path key={index} d={`M${x-18} ${y+28} ${x} ${y-28} ${x+22} ${y+28}Z`} fill={index%2?"#f59e0b":"#fbbf24"}/>) }<path d="M94 207 83 250m66-42-5 42m78-43 7 43m72-51 10 46" stroke={dark} strokeWidth="17" strokeLinecap="round"/><circle cx="339" cy="155" r="6" fill="#111827"/></g>;
}
function Brachiosaurus({ fill, dark }: { fill: string; dark: string }) {
  return <g><ellipse cx="167" cy="183" rx="112" ry="55" fill={fill}/><path d="M225 166c35-40 50-86 49-132 18-20 54-16 66 8-18 15-27 34-25 57 3 36 18 64 48 85-29 24-65 24-91 3Z" fill={fill}/><ellipse cx="312" cy="40" rx="40" ry="24" fill={fill}/><path d="M74 196 23 168l48 49" fill={dark}/><path d="M94 219 87 255m62-36-3 38m70-39 9 39m65-57 13 55" stroke={dark} strokeWidth="18" strokeLinecap="round"/><circle cx="326" cy="34" r="6" fill="#111827"/></g>;
}
function Ankylosaurus({ fill, dark }: { fill: string; dark: string }) {
  return <g><ellipse cx="188" cy="175" rx="128" ry="67" fill={fill}/><path d="M289 150c39-16 77-4 91 23-26 26-61 34-96 21Z" fill={fill}/><path d="M69 168 24 158 5 177l37 14Z" fill={dark}/><circle cx="14" cy="175" r="26" fill={dark}/>{[[105,135],[145,121],[188,119],[231,128],[270,145]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="15" fill={dark} opacity=".8"/>)}<path d="M102 218 95 251m67-31-3 34m76-34 7 34m65-50 10 44" stroke={dark} strokeWidth="17" strokeLinecap="round"/><circle cx="337" cy="164" r="6" fill="#111827"/></g>;
}
function Velociraptor({ fill, dark }: { fill: string; dark: string }) {
  return <g><path d="M83 173c22-50 73-78 132-65 29 6 50 21 66 45 20 30 16 58-7 80-31 30-99 25-140-8-27-22-44-39-51-52Z" fill={fill}/><path d="M251 132c31-35 79-38 112-11l-19 50c-31 17-65 13-91-10Z" fill={fill}/><path d="M95 178 9 133l82 68" fill={dark}/><path d="M177 218 151 256h25l25-32m47-9 23 39h26l-17-48" fill="none" stroke={dark} strokeWidth="16" strokeLinecap="round"/><path d="m231 163-31 23m43-15-25 30" stroke={dark} strokeWidth="8" strokeLinecap="round"/><circle cx="325" cy="137" r="6" fill="#111827"/></g>;
}

function shapeFor(dinosaur: DinosaurRecord, fill: string, dark: string): ReactNode {
  switch (dinosaur.id) {
    case "trex": return <Trex fill={fill} dark={dark}/>;
    case "triceratops": return <Triceratops fill={fill} dark={dark}/>;
    case "stegosaurus": return <Stegosaurus fill={fill} dark={dark}/>;
    case "brachiosaurus": return <Brachiosaurus fill={fill} dark={dark}/>;
    case "ankylosaurus": return <Ankylosaurus fill={fill} dark={dark}/>;
    case "velociraptor": return <Velociraptor fill={fill} dark={dark}/>;
    default: return <Trex fill={fill} dark={dark}/>;
  }
}

export function DinosaurArt({ dinosaur, language, discovered = true }: { dinosaur: DinosaurRecord; language: Language; discovered?: boolean }) {
  const [fill, dark] = colors[dinosaur.id] ?? ["#22c55e", "#14532d"];
  const label = discovered
    ? `${dinosaur.name}, ${optionLabel(dinosaur.period, language)}`
    : language === "es-MX" ? "Dinosaurio misterioso" : "Mystery dinosaur";
  const gradientId = `dino-sky-${dinosaur.id}`;
  return (
    <figure className={`dinosaur-art ${discovered ? "is-discovered" : "is-mystery"}`} aria-label={label}>
      <svg viewBox="0 0 400 270" role="img" aria-hidden="true">
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7dd3fc"/><stop offset=".62" stopColor="#d9f99d"/><stop offset="1" stopColor="#4d7c0f"/></linearGradient></defs>
        <rect width="400" height="270" rx="28" fill={`url(#${gradientId})`}/>
        <circle cx="330" cy="48" r="28" fill="#fef3c7" opacity=".9"/>
        <path d="M0 204 82 142l55 42 75-72 92 77 96-42v123H0Z" fill="#166534" opacity=".28"/>
        <path d="M0 224c58-28 116-22 170 4 65 31 140 29 230-10v52H0Z" fill="#365314"/>
        <g className="dinosaur-art__creature" opacity={discovered ? 1 : .22}>{shapeFor(dinosaur, fill, dark)}</g>
        {!discovered && <text x="200" y="160" textAnchor="middle" fontSize="96" fontWeight="900" fill="#0f172a">?</text>}
      </svg>
      <figcaption><strong>{discovered ? dinosaur.name : "???"}</strong><small>{discovered ? optionLabel(dinosaur.period, language) : label}</small></figcaption>
    </figure>
  );
}
