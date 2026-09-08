import type { ArtworkRecord } from "../types";
export const BACKGROUNDS = [
  { id: "Starry Space", emoji: "🌌", en: "Starry Space", es: "Espacio estrellado", colors: ["#172554", "#4c1d95"] },
  { id: "Jungle Discovery", emoji: "🌿", en: "Jungle Discovery", es: "Descubrimiento en la selva", colors: ["#14532d", "#166534"] },
  { id: "Ocean Lab", emoji: "🌊", en: "Ocean Lab", es: "Laboratorio oceánico", colors: ["#075985", "#0e7490"] },
  { id: "Dinosaur Valley", emoji: "🦖", en: "Dinosaur Valley", es: "Valle de dinosaurios", colors: ["#713f12", "#365314"] },
  { id: "Robot Home", emoji: "🏠", en: "Robot Home", es: "Casa Robot", colors: ["#1e3a8a", "#0f766e"] },
  { id: "Sunset Stage", emoji: "🌅", en: "Sunset Stage", es: "Escenario al atardecer", colors: ["#9a3412", "#be123c"] },
] as const;

export const FRAMES = [
  { id: "Gold Frame", en: "Gold Frame", es: "Marco dorado", color: "#facc15" },
  { id: "Neon Frame", en: "Neon Frame", es: "Marco neón", color: "#22d3ee" },
  { id: "Leaf Frame", en: "Leaf Frame", es: "Marco de hojas", color: "#4ade80" },
  { id: "Space Frame", en: "Space Frame", es: "Marco espacial", color: "#c084fc" },
] as const;


export function ArtworkPreview({ artwork }: { artwork: ArtworkRecord }) {
  const background = BACKGROUNDS.find(item => item.id === artwork.background) ?? BACKGROUNDS[0];
  const frame = FRAMES.find(item => item.id === artwork.frame) ?? FRAMES[0];
  return <article className="creative-poster-preview" data-artwork-id={artwork.id}
    style={{ background: `linear-gradient(145deg, ${background.colors[0]}, ${background.colors[1]})`, borderColor: frame.color }}
    aria-label={`${artwork.title}. ${artwork.subject}. ${artwork.caption}`}>
    <div className="creative-poster-stars" aria-hidden="true">✦　✧　✦</div><strong>{artwork.subject}</strong>
    <span aria-hidden="true">{background.emoji}</span><p>{artwork.caption}</p>
  </article>;
}
