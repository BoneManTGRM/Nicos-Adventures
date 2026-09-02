import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
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

const PET_COLORS: Record<string, string> = {
  Blue: "#38bdf8",
  Red: "#fb7185",
  Purple: "#a78bfa",
  Green: "#4ade80",
  Gold: "#fbbf24",
  Pink: "#f472b6",
};

function Face({ owl = false }: { owl?: boolean }) {
  return <>
    <circle cx={owl ? 171 : 177} cy="128" r={owl ? 33 : 27} fill="#eafcff" stroke="#10223d" strokeWidth="8" />
    <circle cx={owl ? 249 : 243} cy="128" r={owl ? 33 : 27} fill="#eafcff" stroke="#10223d" strokeWidth="8" />
    <circle cx={owl ? 176 : 182} cy="133" r="12" fill="#07111f" />
    <circle cx={owl ? 244 : 238} cy="133" r="12" fill="#07111f" />
    <circle cx={owl ? 170 : 176} cy="125" r="5" fill="#fff" />
    <circle cx={owl ? 238 : 232} cy="125" r="5" fill="#fff" />
    {owl
      ? <path d="M197 154l13 14 13-14-13-10z" fill="#fbbf24" stroke="#7c4a0a" strokeWidth="4" />
      : <><ellipse cx="210" cy="164" rx="21" ry="15" fill="#d9eff6" stroke="#10223d" strokeWidth="6" /><circle cx="210" cy="159" r="7" fill="#10223d" /><path d="M196 176q14 14 28 0" fill="none" stroke="#10223d" strokeLinecap="round" strokeWidth="6" /></>}
  </>;
}

function Accessory({ accessory }: { accessory: string }) {
  if (accessory === "Jetpack") return <g className="pet-art__jetpack"><rect x="112" y="191" width="38" height="82" rx="12" fill="#64748b" stroke="#10223d" strokeWidth="7"/><rect x="270" y="191" width="38" height="82" rx="12" fill="#64748b" stroke="#10223d" strokeWidth="7"/><path d="M124 274l13 36 13-36m120 0 13 36 13-36" fill="#fbbf24" stroke="#fb7185" strokeWidth="8" strokeLinejoin="round"/></g>;
  if (accessory === "Explorer Scarf") return <g><path d="M158 188q52 20 104 0l-8 32q-45 16-88 0z" fill="#fb7185" stroke="#7f1d1d" strokeWidth="6"/><path d="M249 205q51 17 79 50l-35 7q-21-31-52-38z" fill="#fb7185" stroke="#7f1d1d" strokeWidth="6"/></g>;
  if (accessory === "Star Collar") return <g><path d="M158 194q52 20 104 0" fill="none" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round"/><path d="M210 201l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#fff7b2" stroke="#a16207" strokeWidth="4"/></g>;
  if (accessory === "Goggles") return <g fill="rgba(34,211,238,.35)" stroke="#f8fafc" strokeWidth="7"><circle cx="177" cy="128" r="35"/><circle cx="243" cy="128" r="35"/><path d="M210 126h0m-99-7l32 5m166-5-32 5"/></g>;
  if (accessory === "Tiny Crown") return <path d="M168 82l12-39 30 27 30-27 12 39z" fill="#fbbf24" stroke="#854d0e" strokeWidth="7" strokeLinejoin="round"/>;
  return <g><rect x="275" y="210" width="54" height="65" rx="12" fill="#f59e0b" stroke="#10223d" strokeWidth="7"/><path d="M292 226h20m-10-10v20m-3 14l-17 18m17-18 13 13" fill="none" stroke="#eafcff" strokeWidth="7" strokeLinecap="round"/></g>;
}

function StandardPet({ species }: { species: string }) {
  const cat = species === "Robot Cat" || species === "Fox Bot";
  const fox = species === "Fox Bot";
  const penguin = species === "Penguin Bot";
  const owl = species === "Owl Scout";
  const dinosaur = species === "Mini Dinosaur" || species === "Tiny Dragon";
  const dragon = species === "Tiny Dragon";
  let ears: ReactNode;
  if (owl) ears = <><path d="M145 91l18-42 27 34"/><path d="M275 91l-18-42-27 34"/></>;
  else if (dinosaur) ears = <><path d="M155 94l18-38 23 33"/><path d="M225 87l20-42 22 49"/></>;
  else if (cat) ears = <><path d="M145 93l13-58 46 48"/><path d="M275 93l-13-58-46 48"/></>;
  else if (!penguin) ears = <><path d="M145 96q-47-5-54 31 31 22 66 3"/><path d="M275 96q47-5 54 31-31 22-66 3"/></>;

  return <>
    <g className="pet-art__tail" fill="var(--pet-main)" stroke="#10223d" strokeWidth="9" strokeLinejoin="round">
      {fox || cat ? <path d="M285 235q83-45 89 25-5 45-65 34 39-19 13-42"/> : dinosaur ? <path d="M278 236q80 1 98-47-2 74-84 92"/> : !penguin && !owl ? <path d="M286 241q63-45 82 2-3 41-45 32 25-20 1-34"/> : null}
    </g>
    {dragon && <g className="pet-art__wings" fill="#a5f3fc" stroke="#10223d" strokeWidth="8" strokeLinejoin="round"><path d="M156 211q-70-62-86-1 18 8 25 31 22-14 61 13"/><path d="M264 211q70-62 86-1-18 8-25 31-22-14-61 13"/></g>}
    <g fill="var(--pet-main)" stroke="#10223d" strokeWidth="9" strokeLinejoin="round">
      <ellipse cx="210" cy="236" rx={penguin ? 82 : 91} ry="77" />
      {penguin || owl ? <><path d="M139 211q-56 38-42 86 33-3 61-43"/><path d="M281 211q56 38 42 86-33-3-61-43"/></> : <><path d="M162 267v45h-43q-7-27 22-47"/><path d="M258 267v45h43q7-27-22-47"/></>}
      <rect x="137" y="76" width="146" height="122" rx={owl ? 58 : 51} />
      {ears}
    </g>
    <path d="M177 219q33 20 66 0v58q-33 21-66 0z" fill="rgba(224,242,254,.32)" stroke="rgba(255,255,255,.35)" strokeWidth="5" />
    <Face owl={owl} />
    {fox && <><path d="M149 150l33 30" stroke="#f8fafc" strokeWidth="10"/><path d="M271 150l-33 30" stroke="#f8fafc" strokeWidth="10"/></>}
  </>;
}

function SpaceOrb() {
  return <>
    <g className="pet-art__orbital"><ellipse cx="210" cy="171" rx="142" ry="55" fill="none" stroke="#a5f3fc" strokeWidth="12"/><circle cx="335" cy="149" r="17" fill="#fbbf24" stroke="#10223d" strokeWidth="6"/></g>
    <circle cx="210" cy="171" r="99" fill="var(--pet-main)" stroke="#10223d" strokeWidth="10" />
    <circle cx="180" cy="135" r="41" fill="#fff" opacity=".22" />
    <Face />
    <path d="M168 213q42 25 84 0" fill="none" stroke="#dffaff" strokeWidth="7" strokeLinecap="round" />
  </>;
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
  const style = { "--pet-main": PET_COLORS[pet.color] ?? PET_COLORS.Blue } as CSSProperties;
  const isPremiumSparky = pet.species === "Robot Dog" && pet.color === "Blue" && pet.accessory === "Explorer Scarf";
  if (isPremiumSparky) {
    return <SparkyArt action={action} decorative={decorative} label={label} rawId={rawId.replace(/:/g, "")} />;
  }
  return <svg
    className={`pet-art pet-art--${pet.species.toLowerCase().replace(/\s+/g, "-")}`}
    viewBox="0 0 420 340"
    style={style}
    role={decorative ? undefined : "img"}
    aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : label}
    data-pet-species-art={pet.species}
    data-pet-art-id={rawId.replace(/:/g, "")}
  >
    {!decorative && <title>{label}</title>}
    <ellipse cx="210" cy="313" rx="125" ry="18" fill="#020617" opacity=".5" />
    {pet.species === "Space Orb" ? <SpaceOrb /> : <StandardPet species={pet.species} />}
    <Accessory accessory={pet.accessory} />
    <g className="pet-art__shine" fill="none" stroke="#fff" strokeLinecap="round" opacity=".45"><path d="M176 92q25-18 53-5" strokeWidth="8"/><path d="M159 225q18-15 38-16" strokeWidth="7"/></g>
  </svg>;
}
