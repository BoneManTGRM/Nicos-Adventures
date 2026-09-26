import { useId } from "react";
import type { CSSProperties } from "react";
import type { Language, PetRecord } from "../types";
import { optionLabel } from "../i18n/display";
import sparkyFetchTool from "../assets/pets/sparky-fetch-tool-v2.webp";
import sparkyHighFive from "../assets/pets/sparky-high-five-v2.webp";
import sparkyIdle from "../assets/pets/sparky-idle-v2.webp";
import sparkySit from "../assets/pets/sparky-sit-v2.webp";
import "./pet-art.css";

export type PetAction = "Sit" | "Spin" | "Fetch Tool" | "High Five" | "Scout" | "Dance";

const SPARKY_POSES: Record<"idle" | "sit" | "high-five" | "fetch-tool", string> = {
  idle: sparkyIdle,
  sit: sparkySit,
  "high-five": sparkyHighFive,
  "fetch-tool": sparkyFetchTool,
};

// Every customizable pet uses the same illustrated collection. The original
// Sparky performance sprites remain available for his familiar signature look.
const PET_SPRITES: Record<string, string> = {
  "Robot Dog": new URL("../assets/pets/crew-robot-dog-v3.webp", import.meta.url).href,
  "Robot Cat": new URL("../assets/pets/crew-robot-cat-v3.webp", import.meta.url).href,
  "Mini Dinosaur": new URL("../assets/pets/crew-mini-dinosaur-v3.webp", import.meta.url).href,
  "Tiny Dragon": new URL("../assets/pets/crew-tiny-dragon-v3.webp", import.meta.url).href,
  "Penguin Bot": new URL("../assets/pets/crew-penguin-bot-v3.webp", import.meta.url).href,
  "Fox Bot": new URL("../assets/pets/crew-fox-bot-v3.webp", import.meta.url).href,
  "Owl Scout": new URL("../assets/pets/crew-owl-scout-v3.webp", import.meta.url).href,
  "Space Orb": new URL("../assets/pets/crew-space-orb-v3.webp", import.meta.url).href,
};
const COLOR_TURNS: Record<string, number> = { Blue: 0, Red: 140, Purple: 55, Green: 260, Gold: 190, Pink: 100 };

/** Shaded, independent accessories keep their own color when armor changes. */
function CrewAccessory({ accessory, id, turn }: { accessory: string; id: string; turn: number }) {
  const gold = `url(#${id}-gold)`, silver = `url(#${id}-silver)`, red = `url(#${id}-red)`;
  return <svg className="pet-art__outfit" viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-pet-accessory={accessory}>
    <defs>
      <filter id={`${id}-armor`} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="hueRotate" values={String(turn)} result="tinted" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2 -.5 2.5 0 0" result="blueArmor" />
        <feComposite in="tinted" in2="blueArmor" operator="in" result="armor" />
        <feComposite in="armor" in2="SourceGraphic" operator="atop" />
      </filter>
      <linearGradient id={`${id}-gold`} x2=".7" y2="1"><stop stopColor="#fff5bb"/><stop offset=".4" stopColor="#ffd15b"/><stop offset="1" stopColor="#a96210"/></linearGradient>
      <linearGradient id={`${id}-silver`} x2=".7" y2="1"><stop stopColor="#f1fdff"/><stop offset=".45" stopColor="#88abc5"/><stop offset="1" stopColor="#28435e"/></linearGradient>
      <linearGradient id={`${id}-red`} x2=".5" y2="1"><stop stopColor="#ffb071"/><stop offset=".35" stopColor="#f65331"/><stop offset="1" stopColor="#9b1726"/></linearGradient>
    </defs>
    {accessory === "Explorer Scarf" && <g stroke="#892738" strokeWidth=".5"><path d="M40 50Q50 55 60 50L59 55Q50 62 41 55Z" fill={red}/><path d="M57 54Q68 56 72 65L65 64L63 68L55 56Z" fill={red}/></g>}
    {accessory === "Star Collar" && <g><path d="M39 51Q50 58 61 51" fill="none" stroke="#8c5315" strokeWidth="3"/><path d="M39 50.5Q50 57.5 61 50.5" fill="none" stroke={gold} strokeWidth="2"/><path d="M50 55L52 59L56.5 60L53 63L54 67L50 65L46 67L47 63L43.5 60L48 59Z" fill={gold} stroke="#8c5315" strokeWidth=".6"/></g>}
    {accessory === "Tiny Crown" && <g><path d="M39 17L37 7L44 11L50 3L56 11L63 7L61 17Z" fill={gold} stroke="#935b19" strokeWidth=".6"/><path d="M40 17Q50 20 60 17" fill="none" stroke="#ffea9b" strokeWidth="2"/><circle cx="50" cy="12" r="1.7" fill="#62e7fa"/></g>}
    {accessory === "Goggles" && <g fill="#8aebff22" stroke={silver} strokeWidth="2"><rect x="29" y="27" width="20" height="15" rx="7"/><rect x="51" y="27" width="20" height="15" rx="7"/><path d="M49 32Q50 30 51 32M25 31H29M71 31H75" fill="none"/><path d="M33 30L38 29M55 30L60 29" stroke="#fff" strokeWidth=".8"/></g>}
    {accessory === "Jetpack" && <g stroke="#233f59" strokeWidth=".8"><rect x="22" y="54" width="10" height="22" rx="4" fill={silver}/><rect x="68" y="54" width="10" height="22" rx="4" fill={silver}/><path d="M24 77L27 86L30 77M70 77L73 86L76 77" fill="#79eaff" stroke="#42bded"/><path d="M24 60H30M70 60H76" stroke="#abf5ff" strokeWidth="2"/></g>}
    {accessory === "Tool Pack" && <g><path d="M64 59Q61 53 58 52" stroke="#5c3526" strokeWidth="2" fill="none"/><rect x="61" y="59" width="13" height="16" rx="3" fill={gold} stroke="#71451f" strokeWidth=".7"/><path d="M64 63H71M64 71H71" stroke="#fff0c4" strokeWidth="1"/><path d="M67 58L67 67M65 57Q67 60 69 57" stroke={silver} strokeWidth="2" fill="none"/></g>}
  </svg>;
}

function SparkyArt({
  action,
  decorative,
  label,
  rawId,
}: {
  action?: PetAction;
  decorative: boolean;
  label: string;
  rawId: string;
}) {
  const pose = action === "Sit" ? "sit" : action === "High Five" || action === "Dance" ? "high-five" : action === "Fetch Tool" ? "fetch-tool" : "idle";
  const actionClass = action ? ` pet-art--action-${action.toLowerCase().replace(/\s+/g, "-")}` : "";
  return <span
    className={`pet-art pet-art--premium-sparky pet-art--pose-${pose}${actionClass}`}
    role={decorative ? undefined : "img"}
    aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : label}
    data-pet-species-art="Robot Dog"
    data-pet-renderer="premium-sparky"
    data-pet-pose={pose}
    data-pet-art-id={rawId}
  >
    <img src={SPARKY_POSES[pose]} alt="" draggable={false} />
  </span>;
}

export function PetArt({ pet, language = "en", decorative = false, action }: { pet: PetRecord; language?: Language; decorative?: boolean; action?: PetAction }) {
  const rawId = useId();
  const label = `${pet.name}, ${optionLabel(pet.species, language)}`;

  const isPremiumSparky = pet.species === "Robot Dog" && pet.color === "Blue" && pet.accessory === "Explorer Scarf";
  if (isPremiumSparky) {
    return <SparkyArt action={action} decorative={decorative} label={label} rawId={rawId.replace(/:/g, "")} />;
  }
  const id = `crew-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const style = { "--pet-color-filter": `url(#${id}-armor)` } as CSSProperties;
  return <span
    className={`pet-art pet-art--crew pet-art--${pet.species.toLowerCase().replace(/\s+/g, "-")}`}
    style={style}
    role={decorative ? undefined : "img"}
    aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : label}
    data-pet-species-art={pet.species}
    data-pet-renderer="premium-collection"
    data-pet-art-id={id}
  >
    <span className="pet-art__figure">
      <img src={PET_SPRITES[pet.species] ?? PET_SPRITES["Robot Dog"]} alt="" draggable={false} />
      <CrewAccessory accessory={pet.accessory} id={id} turn={COLOR_TURNS[pet.color] ?? 0} />
    </span>
  </span>;
}
