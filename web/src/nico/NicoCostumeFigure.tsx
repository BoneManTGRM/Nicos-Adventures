import type { CSSProperties } from "react";
import type { NicoProfessionId, NicoWardrobe } from "../types";
import { NicoLayeredCharacter } from "./wardrobe/NicoLayeredCharacter";
import { wardrobeForPreset } from "./wardrobe/catalog";
import { wardrobeForDisplay } from "./wardrobe/wardrobeCompatibility";

type Props = {
  artSource?: string;
  outfitArtSource?: string;
  baseArtSource?: string;
  dragOutfitSource?: string;
  profession: NicoProfessionId;
  wardrobe?: NicoWardrobe;
  accentColor?: string;
  compact?: boolean;
  alt?: string;
};

type CostumeDecoration = {
  head?: string;
  prop?: string;
  badge?: string;
};

export const NICO_COSTUME_DECORATIONS: Record<NicoProfessionId, CostumeDecoration> = {
  explorer: { head: "🧢", prop: "🧭", badge: "🌿" },
  astronaut: { head: "🪐", prop: "🚀", badge: "⭐" },
  doctor: { head: "🩺", prop: "🧰", badge: "➕" },
  scientist: { head: "🥽", prop: "🔬", badge: "⚗️" },
  engineer: { head: "⛑️", prop: "🔧", badge: "⚙️" },
  builder: { head: "⛑️", prop: "🛠️", badge: "📐" },
  veterinarian: { head: "🩺", prop: "🐾", badge: "💚" },
  dinosaur: { head: "🦖", prop: "🦴", badge: "🌋" },
  suit: { head: "🎓", prop: "📋", badge: "👔" },
  firefighter: { head: "⛑️", prop: "🧯", badge: "🚒" },
  chef: { head: "👨‍🍳", prop: "🥄", badge: "🍳" },
  artist: { head: "🎨", prop: "🖌️", badge: "🌈" },
  pilot: { head: "🧢", prop: "✈️", badge: "🧭" },
  gardener: { head: "👒", prop: "🪴", badge: "🌱" },
  teacher: { head: "🎓", prop: "📚", badge: "✏️" },
  dentist: { head: "🥼", prop: "🦷", badge: "✨" },
  "police-officer": { head: "👮", prop: "📻", badge: "⭐" },
  zookeeper: { head: "🧢", prop: "🦒", badge: "🐾" },
  musician: { head: "🎧", prop: "🎸", badge: "🎵" },
  farmer: { head: "🤠", prop: "🚜", badge: "🌾" },
  lifeguard: { head: "🧢", prop: "🛟", badge: "🌊" },
  magician: { head: "🎩", prop: "🪄", badge: "✨" },
  "soccer-player": { head: "🏅", prop: "⚽", badge: "🥅" },
  "tennis-player": { head: "🧢", prop: "🎾", badge: "🏆" },
  detective: { head: "🕵️", prop: "🔎", badge: "🧩" },
  librarian: { head: "👓", prop: "📚", badge: "🔖" },
};

export function NicoCostumeFigure({
  profession,
  wardrobe,
  accentColor = "#22c55e",
  compact = false,
  alt = "Nico",
}: Props) {
  const base = wardrobe ?? wardrobeForPreset(profession, accentColor);
  const resolvedWardrobe = wardrobeForDisplay(base, profession);
  const style = { "--nico-costume-accent": resolvedWardrobe.accentColor } as CSSProperties;

  return (
    <figure
      className={`nico-costume nico-costume--${profession} ${compact ? "nico-costume--compact" : ""}`.trim()}
      style={style}
      data-profession={profession}
      data-art-state="layered-wardrobe"
    >
      <div className="nico-costume__frame">
        <NicoLayeredCharacter wardrobe={resolvedWardrobe} compact={compact} alt={alt} />
      </div>
    </figure>
  );
}
