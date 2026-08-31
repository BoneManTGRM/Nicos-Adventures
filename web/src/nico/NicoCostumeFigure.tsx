import type { CSSProperties } from "react";
import type { NicoProfessionId, NicoWardrobe } from "../types";
import { canonicalNicoPresetArt } from "./canonicalNicoArt";
import { wardrobeForPreset } from "./wardrobe/catalog";
import "./canonical-nico-art.css";

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
  accentColor = "#22c55e",
  compact = false,
  alt = "Nico",
}: Props) {
  // Saved wardrobe data stays readable for profile compatibility, but live
  // surfaces never render the retired "layered-wardrobe" cartoon.
  const resolvedWardrobe = wardrobeForPreset(profession, accentColor);
  const canonicalArt = canonicalNicoPresetArt(resolvedWardrobe);
  const style = { "--nico-costume-accent": resolvedWardrobe.accentColor } as CSSProperties;

  return (
    <figure
      className={`nico-costume nico-costume--${profession} ${compact ? "nico-costume--compact" : ""}`.trim()}
      style={style}
      data-profession={profession}
      data-art-state="canonical-2d"
    >
      <div className="nico-costume__frame">
        <span
          className="nico-canonical-sprite"
          style={canonicalArt?.style}
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          data-nico-renderer="canonical-2d"
          data-nico-preset={profession}
        />
      </div>
    </figure>
  );
}
