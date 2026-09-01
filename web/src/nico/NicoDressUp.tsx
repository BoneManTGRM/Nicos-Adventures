import { useMemo, useState, type CSSProperties } from "react";
import professionData from "../catalogs/nico-professions.json";
import professionPhase2Extra from "../catalogs/nico-professions-phase2-extra.json";
import type { Language, LocalizedText, NicoPreferences, NicoProfessionId } from "../types";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { wardrobeForPreset } from "./wardrobe/catalog";

export type ProfessionOption = {
  id: NicoProfessionId;
  emoji: string;
  name: LocalizedText;
  tagline: LocalizedText;
  costume: string;
  accent: string;
};

export const NICO_PROFESSIONS = [...professionData, ...professionPhase2Extra] as ProfessionOption[];

export function filterNicoProfessions(query: string, language: Language): ProfessionOption[] {
  const locale = language === "es-MX" ? "es-MX" : "en-US";
  const normalized = query.trim().toLocaleLowerCase(locale);
  if (!normalized) return NICO_PROFESSIONS;
  return NICO_PROFESSIONS.filter((profession) =>
    `${profession.name[language]} ${profession.tagline[language]}`.toLocaleLowerCase(locale).includes(normalized),
  );
}

export function applyNicoProfession(
  preferences: NicoPreferences,
  profession: Pick<ProfessionOption, "id" | "accent">,
): NicoPreferences {
  return {
    ...preferences,
    profession: profession.id,
    accentColor: profession.accent,
    wardrobe: wardrobeForPreset(profession.id, profession.accent),
  };
}

const copy = {
  en: {
    eyebrow: "Premium illustrated outfits · local and private",
    title: "Nico’s Wardrobe",
    intro: "Choose a complete illustrated outfit. Every choice keeps the same high-quality Nico artwork across the whole site.",
    search: "Search outfits…",
    selected: "Wearing now",
    empty: "No outfits match that search.",
    voice: "Let Nico read answers aloud",
  },
  "es-MX": {
    eyebrow: "Conjuntos ilustrados premium · local y privado",
    title: "El guardarropa de Nico",
    intro: "Elige un conjunto ilustrado completo. Cada opción conserva el mismo arte de alta calidad de Nico en todo el sitio.",
    search: "Buscar conjuntos…",
    selected: "Conjunto actual",
    empty: "Ningún conjunto coincide con la búsqueda.",
    voice: "Permitir que Nico lea las respuestas en voz alta",
  },
} as const;

export function NicoDressUp({
  language,
  preferences,
  onSave,
}: {
  language: Language;
  artSource?: string;
  outfitArtSource?: string;
  baseArtSource?: string;
  dragOutfitSource?: string;
  preferences: NicoPreferences;
  onSave: (preferences: NicoPreferences) => void;
}) {
  const [query, setQuery] = useState("");
  const text = copy[language];
  const professions = useMemo(() => filterNicoProfessions(query, language), [language, query]);
  const selected = NICO_PROFESSIONS.find((profession) => profession.id === preferences.profession) ?? NICO_PROFESSIONS[0];

  const choose = (profession: ProfessionOption) => {
    onSave(applyNicoProfession(preferences, profession));
  };

  return (
    <section className="nico-dress-up nico-premium-wardrobe" aria-labelledby="nico-wardrobe-title">
      <header className="nico-feature-heading">
        <div>
          <small>🧵 {text.eyebrow}</small>
          <h2 id="nico-wardrobe-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="nico-dress-layout">
        <aside className="nico-dress-preview">
          <NicoCostumeFigure
            profession={preferences.profession}
            wardrobe={preferences.wardrobe}
            accentColor={preferences.accentColor}
            alt={`${selected.name[language]} Nico`}
          />
          <div className="nico-dress-readout" role="status">
            <span aria-hidden="true">{selected.emoji}</span>
            <div>
              <small>{text.selected}</small>
              <h3>{selected.name[language]}</h3>
              <p>{selected.tagline[language]}</p>
            </div>
          </div>
        </aside>

        <div className="nico-premium-wardrobe__controls">
          <label className="nico-premium-wardrobe__search">
            <span className="sr-only">{text.search}</span>
            <input
              type="search"
              value={query}
              placeholder={text.search}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          {professions.length ? (
            <div className="nico-profession-grid" role="list" aria-label={text.title}>
              {professions.map((profession) => {
                const active = profession.id === preferences.profession;
                return (
                  <button
                    type="button"
                    role="listitem"
                    key={profession.id}
                    className={active ? "selected" : ""}
                    aria-pressed={active}
                    style={{ "--nico-costume-accent": profession.accent } as CSSProperties}
                    onClick={() => choose(profession)}
                  >
                    <span className="nico-profession-grid__art" aria-hidden="true">
                      <NicoCostumeFigure
                        profession={profession.id}
                        wardrobe={wardrobeForPreset(profession.id, profession.accent)}
                        accentColor={profession.accent}
                        alt=""
                      />
                    </span>
                    <strong>{profession.name[language]}</strong>
                    <small>{profession.tagline[language]}</small>
                  </button>
                );
              })}
            </div>
          ) : <p className="nico-premium-wardrobe__empty" role="status">{text.empty}</p>}

          <label className="nico-speech-toggle">
            <input
              type="checkbox"
              checked={preferences.speechEnabled}
              onChange={(event) => onSave({ ...preferences, speechEnabled: event.target.checked })}
            />
            <span>{text.voice}</span>
          </label>
        </div>
      </div>
    </section>
  );
}
