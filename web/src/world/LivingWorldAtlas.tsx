import type { CSSProperties } from "react";
import { tr, type Localized } from "../i18n/core";
import type { Language, SectionId } from "../types";
import { WORLD_SECTIONS } from "./catalogs";
import { IllustratedWorldMap } from "./IllustratedWorldMap";
import { isWorldAtlasLandmarkLocked, WORLD_ATLAS_LANDMARKS } from "./livingWorldAtlas";
import "./living-world-atlas.css";

const copy = {
  eyebrow: { en: "Nico's World · Living atlas", "es-MX": "Mundo de Nico · Atlas viviente" },
  title: { en: "A whole world is waking up", "es-MX": "Todo un mundo está despertando" },
  body: {
    en: "Follow the glowing trails from Robo Lab to forests, castles, museums, and the newly discovered Dinosaur Valley.",
    "es-MX": "Sigue los senderos luminosos del Laboratorio robot a bosques, castillos, museos y el recién descubierto Valle de dinosaurios.",
  },
  scene: { en: "Living illustrated map of Nico's World", "es-MX": "Mapa ilustrado viviente del Mundo de Nico" },
  instructions: { en: "Choose a landmark below. No dragging or time limit.", "es-MX": "Elige un lugar abajo. No necesitas arrastrar ni tienes límite de tiempo." },
  landmarks: { en: "Featured world landmarks", "es-MX": "Lugares destacados del mundo" },
  openRoute: { en: "Star Bridge route open", "es-MX": "Ruta del Puente Estelar abierta" },
  lockedRoute: { en: "Repair the Star Bridge to open this route", "es-MX": "Repara el Puente Estelar para abrir esta ruta" },
  visit: { en: "Visit", "es-MX": "Visitar" },
} satisfies Record<string, Localized>;

export function LivingWorldAtlas({
  language,
  dinosaurValleyAvailable,
  open,
}: {
  language: Language;
  dinosaurValleyAvailable: boolean;
  open: (id: SectionId) => void;
}) {
  return (
    <section
      className="world-atlas"
      data-valley-status={dinosaurValleyAvailable ? "open" : "locked"}
      data-world-renderer="illustrated-2d"
      aria-labelledby="world-atlas-title"
    >
      <header className="world-atlas__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="world-atlas-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
        <strong className={`world-atlas__route-status ${dinosaurValleyAvailable ? "is-open" : "is-locked"}`}>
          <span aria-hidden="true">{dinosaurValleyAvailable ? "✦" : "◆"}</span>
          {tr(dinosaurValleyAvailable ? copy.openRoute : copy.lockedRoute, language)}
        </strong>
      </header>
      <IllustratedWorldMap
        alt={tr(copy.scene, language)}
        description={tr(copy.instructions, language)}
        dinosaurValleyAvailable={dinosaurValleyAvailable}
      />
      <nav className="world-atlas__landmarks" aria-label={tr(copy.landmarks, language)}>
        {WORLD_ATLAS_LANDMARKS.map((landmark) => {
          const section = WORLD_SECTIONS.find((candidate) => candidate.id === landmark.id);
          if (!section) return null;
          const locked = isWorldAtlasLandmarkLocked(landmark.id, dinosaurValleyAvailable);
          return (
            <button
              type="button"
              className={`world-atlas__landmark${locked ? " is-locked" : ""}`}
              style={{ "--landmark-accent": landmark.accent } as CSSProperties}
              key={landmark.id}
              disabled={locked}
              onClick={() => open(landmark.id)}
              aria-label={`${tr(copy.visit, language)} ${tr(section.name, language)}. ${locked ? tr(copy.lockedRoute, language) : tr(section.description, language)}`}
            >
              <span aria-hidden="true">{locked ? "🔒" : section.emoji}</span>
              <strong>{tr(section.name, language)}</strong>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
