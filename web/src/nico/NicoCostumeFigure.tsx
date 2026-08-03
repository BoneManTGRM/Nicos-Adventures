import type { CSSProperties } from "react";
import type { NicoProfessionId } from "../types";

type Props = {
  artSource: string;
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

const decorations: Record<NicoProfessionId, CostumeDecoration> = {
  explorer: { head: "🧢", prop: "🧭", badge: "🌿" },
  astronaut: { head: "🪐", prop: "🚀", badge: "⭐" },
  doctor: { head: "🩺", prop: "🧰", badge: "➕" },
  scientist: { head: "🥽", prop: "🔬", badge: "⚗️" },
  engineer: { head: "⛑️", prop: "🔧", badge: "⚙️" },
  veterinarian: { head: "🩺", prop: "🐾", badge: "💚" },
  dinosaur: { head: "🦖", prop: "🦴", badge: "🌋" },
  suit: { head: "🎓", prop: "📋", badge: "👔" },
  firefighter: { head: "⛑️", prop: "🧯", badge: "🚒" },
  chef: { head: "👨‍🍳", prop: "🥄", badge: "🍳" },
  artist: { head: "🎨", prop: "🖌️", badge: "🌈" },
  pilot: { head: "🧢", prop: "✈️", badge: "🧭" },
};

export function NicoCostumeFigure({
  artSource,
  profession,
  accentColor = "#22c55e",
  compact = false,
  alt = "Nico",
}: Props) {
  const decoration = decorations[profession];
  const style = { "--nico-costume-accent": accentColor } as CSSProperties;

  return (
    <figure
      className={`nico-costume nico-costume--${profession} ${compact ? "nico-costume--compact" : ""}`.trim()}
      style={style}
      data-profession={profession}
    >
      <div className="nico-costume__frame">
        {artSource ? (
          <img src={artSource} alt={alt} data-asset-recovery="ignore" decoding="async" />
        ) : (
          <div className="nico-costume__fallback" role="img" aria-label={alt}>N</div>
        )}
        <span className="nico-costume__uniform" aria-hidden="true" />
        {decoration.head && <span className="nico-costume__head" aria-hidden="true">{decoration.head}</span>}
        {decoration.prop && <span className="nico-costume__prop" aria-hidden="true">{decoration.prop}</span>}
        {decoration.badge && <span className="nico-costume__badge" aria-hidden="true">{decoration.badge}</span>}
      </div>
    </figure>
  );
}
