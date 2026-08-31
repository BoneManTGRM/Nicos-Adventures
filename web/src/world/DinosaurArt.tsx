import type { DinosaurRecord, Language } from "../types";
import { optionLabel } from "../i18n/display";
import { dinosaurSpeciesArtStyle } from "./dinosaurArt";

export function DinosaurArt({ dinosaur, language, discovered = true }: { dinosaur: DinosaurRecord; language: Language; discovered?: boolean }) {
  const label = discovered
    ? `${dinosaur.name}, ${optionLabel(dinosaur.period, language)}`
    : language === "es-MX" ? "Dinosaurio misterioso" : "Mystery dinosaur";

  return (
    <figure
      className={`dinosaur-art ${discovered ? "is-discovered" : "is-mystery"}`}
      data-dinosaur-art={dinosaur.id}
      data-dinosaur-renderer="premium-2d"
    >
      <div className="dinosaur-art__scene" role="img" aria-label={label} style={dinosaurSpeciesArtStyle(dinosaur.id)}>
        <span className="dinosaur-art__creature" aria-hidden="true" />
        {!discovered && <span className="dinosaur-art__mystery" aria-hidden="true">?</span>}
      </div>
      <figcaption>
        <strong>{discovered ? dinosaur.name : "???"}</strong>
        <small>{discovered ? optionLabel(dinosaur.period, language) : label}</small>
      </figcaption>
    </figure>
  );
}
