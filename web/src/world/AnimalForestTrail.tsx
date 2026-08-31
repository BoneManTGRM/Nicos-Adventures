import type { CSSProperties } from "react";
import { tr, type Localized } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Language } from "../types";
import { animalForestArtStyle } from "./animalForestArt";
import { habitatTrail } from "./animalForestTrail";
import "./animal-forest-trail.css";

const copy = {
  eyebrow: { en: "Animal Forest · Private field expedition", "es-MX": "Bosque animal · Expedición de campo privada" },
  title: { en: "Choose a living habitat trail", "es-MX": "Elige un sendero de hábitat viviente" },
  body: {
    en: "Follow one local-first trail at a time. Every animal, fact, favorite, and discovery stays on this device.",
    "es-MX": "Sigue un sendero local a la vez. Cada animal, dato, favorito y descubrimiento permanece en este dispositivo.",
  },
  scene: { en: "Premium illustrated Animal Forest habitat", "es-MX": "Hábitat ilustrado premium del Bosque animal" },
  instructions: { en: "Choose a habitat below. No dragging or time limit.", "es-MX": "Elige un hábitat abajo. No necesitas arrastrar ni tienes límite de tiempo." },
  habitats: { en: "Habitat trails", "es-MX": "Senderos de hábitat" },
  progress: { en: "Field guide", "es-MX": "Guía de campo" },
  all: { en: "All trails", "es-MX": "Todos los senderos" },
} satisfies Record<string, Localized>;

export function AnimalForestTrail({
  language,
  habitat,
  habitats,
  discovered,
  total,
  select,
}: {
  language: Language;
  habitat: string;
  habitats: string[];
  discovered: number;
  total: number;
  select: (habitat: string) => void;
}) {
  const activeTrail = habitat === "All" ? habitatTrail("Jungle") : habitatTrail(habitat);
  const habitatName = habitat === "All" ? tr(copy.all, language) : optionLabel(habitat, language);
  const style = { "--habitat-accent": activeTrail.color } as CSSProperties;

  return (
    <section
      className="animal-forest-trail"
      data-habitat={habitat}
      data-habitat-renderer="premium-2d"
      aria-labelledby="animal-forest-trail-title"
      style={style}
    >
      <header className="animal-forest-trail__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="animal-forest-trail-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>
      <figure className="animal-forest-illustration">
        <div
          className="animal-forest-illustration__art"
          data-habitat-art={activeTrail.id}
          style={animalForestArtStyle(activeTrail.id)}
          role="img"
          aria-label={`${tr(copy.scene, language)}: ${habitatName}`}
        >
          <span className="animal-forest-illustration__light" aria-hidden="true" />
          <span className="animal-forest-illustration__spark animal-forest-illustration__spark--one" aria-hidden="true" />
          <span className="animal-forest-illustration__spark animal-forest-illustration__spark--two" aria-hidden="true" />
          <span className="animal-forest-illustration__spark animal-forest-illustration__spark--three" aria-hidden="true" />
        </div>
        <figcaption>
          <strong>{tr(copy.progress, language)} · {discovered}/{total}</strong>
          <span>{habitatName}</span>
          <small>{tr(copy.instructions, language)}</small>
        </figcaption>
      </figure>
      <nav className="animal-forest-trail__habitats" aria-label={tr(copy.habitats, language)}>
        {habitats.map((item) => {
          const trail = item === "All" ? null : habitatTrail(item);
          return (
            <button
              type="button"
              className="animal-forest-trail__habitat"
              data-habitat={item}
              aria-pressed={item === habitat}
              key={item}
              onClick={() => select(item)}
            >
              <span aria-hidden="true">{trail?.icon ?? "🧭"}</span>
              <strong>{item === "All" ? tr(copy.all, language) : optionLabel(item, language)}</strong>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
