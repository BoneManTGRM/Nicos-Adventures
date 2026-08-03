import type { CSSProperties } from "react";
import type { NicoProfessionId } from "../types";
import { approvedCharacterStyle, approvedOutfitStyle } from "./approvedNicoArt";

type Props = {
  artSource: string;
  outfitArtSource?: string;
  profession: NicoProfessionId;
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
  artSource,
  outfitArtSource = "",
  profession,
  accentColor = "#22c55e",
  compact = false,
  alt = "Nico",
}: Props) {
  const decoration = NICO_COSTUME_DECORATIONS[profession];
  const style = { "--nico-costume-accent": accentColor } as CSSProperties;
  const outfitStyle = approvedOutfitStyle(outfitArtSource, profession);
  const artState = outfitStyle ? "approved-outfit" : artSource ? "approved-character" : "fallback";

  return (
    <figure
      className={`nico-costume nico-costume--${profession} ${compact ? "nico-costume--compact" : ""}`.trim()}
      style={style}
      data-profession={profession}
      data-art-state={artState}
    >
      <div className="nico-costume__frame">
        {outfitStyle ? (
          <span className="nico-costume__approved" style={outfitStyle} role="img" aria-label={alt} data-approved-nico-outfit="true" />
        ) : artSource ? (
          <span className="nico-costume__approved" style={approvedCharacterStyle(artSource, "full")} role="img" aria-label={alt} data-approved-nico-art="true" />
        ) : (
          <div className="nico-costume__fallback" role="img" aria-label={alt}>
            <span className="nico-costume__fallback-hair" aria-hidden="true" />
            <span className="nico-costume__fallback-face" aria-hidden="true">
              <i /><i />
            </span>
            <span className="nico-costume__fallback-shirt" aria-hidden="true" />
          </div>
        )}
        <span className="nico-costume__uniform" aria-hidden="true" />
        {decoration.head && <span className="nico-costume__head" aria-hidden="true">{decoration.head}</span>}
        {decoration.prop && <span className="nico-costume__prop" aria-hidden="true">{decoration.prop}</span>}
        {decoration.badge && <span className="nico-costume__badge" aria-hidden="true">{decoration.badge}</span>}
      </div>
    </figure>
  );
}
