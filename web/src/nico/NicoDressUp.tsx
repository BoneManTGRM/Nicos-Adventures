import { useEffect, useMemo, useState, type CSSProperties } from "react";
import professionData from "../catalogs/nico-professions.json";
import type { Language, LocalizedText, NicoPreferences, NicoProfessionId } from "../types";
import { NicoCostumeFigure } from "./NicoCostumeFigure";

type ProfessionOption = {
  id: NicoProfessionId;
  emoji: string;
  name: LocalizedText;
  tagline: LocalizedText;
  costume: string;
  accent: string;
};

type Props = {
  language: Language;
  artSource: string;
  preferences: NicoPreferences;
  onSave: (preferences: NicoPreferences) => void;
};

export const NICO_PROFESSIONS = professionData as ProfessionOption[];

const copy = {
  en: {
    title: "Nico’s Dress-Up Closet",
    intro: "Choose a profession or adventure costume. The choice stays in this profile and appears in Showtime Studio.",
    save: "Save Nico’s outfit",
    saved: "Outfit saved",
    voice: "Let Nico read answers aloud",
    search: "Search jobs and costumes…",
    noResults: "No outfit matches that search.",
    options: "local outfit options",
  },
  "es-MX": {
    title: "El armario de disfraces de Nico",
    intro: "Elige una profesión o un disfraz de aventura. La elección queda en este perfil y aparece en el Estudio Showtime.",
    save: "Guardar el traje de Nico",
    saved: "Traje guardado",
    voice: "Permitir que Nico lea respuestas en voz alta",
    search: "Buscar trabajos y disfraces…",
    noResults: "Ningún traje coincide con la búsqueda.",
    options: "opciones locales de traje",
  },
} as const;

export function filterNicoProfessions(query: string, language: Language): ProfessionOption[] {
  const locale = language === "es-MX" ? "es-MX" : "en-US";
  const normalized = query.trim().toLocaleLowerCase(locale);
  if (!normalized) return NICO_PROFESSIONS;
  return NICO_PROFESSIONS.filter((profession) =>
    `${profession.name[language]} ${profession.tagline[language]}`.toLocaleLowerCase(locale).includes(normalized),
  );
}

export function NicoDressUp({ language, artSource, preferences, onSave }: Props) {
  const text = copy[language];
  const [draft, setDraft] = useState<NicoPreferences>(preferences);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => NICO_PROFESSIONS.find((item) => item.id === draft.profession) ?? NICO_PROFESSIONS[0], [draft.profession]);
  const visibleProfessions = useMemo(() => filterNicoProfessions(query, language), [language, query]);

  useEffect(() => setDraft(preferences), [preferences]);

  const choose = (profession: ProfessionOption) => {
    setSaved(false);
    setDraft((current) => ({ ...current, profession: profession.id, accentColor: profession.accent }));
  };

  const save = () => {
    onSave(draft);
    setSaved(true);
  };

  return (
    <section className="nico-dress-up" aria-labelledby="nico-dress-title">
      <header className="nico-feature-heading">
        <div>
          <small>🧰 {NICO_PROFESSIONS.length} {text.options}</small>
          <h2 id="nico-dress-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="nico-dress-layout">
        <div className="nico-dress-preview">
          <NicoCostumeFigure
            artSource={artSource}
            profession={draft.profession}
            accentColor={draft.accentColor}
            alt={`${selected.name[language]} Nico`}
          />
          <div className="nico-dress-readout">
            <span>{selected.emoji}</span>
            <div>
              <h3>{selected.name[language]}</h3>
              <p>{selected.tagline[language]}</p>
            </div>
          </div>
        </div>

        <div className="nico-dress-controls">
          <label className="nico-outfit-search">
            <span className="sr-only">{text.search}</span>
            <input
              type="search"
              value={query}
              placeholder={text.search}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          {visibleProfessions.length ? (
            <div className="nico-profession-grid" role="list" aria-label={text.title}>
              {visibleProfessions.map((profession) => {
                const active = profession.id === draft.profession;
                return (
                  <button
                    type="button"
                    role="listitem"
                    aria-pressed={active}
                    className={active ? "selected" : ""}
                    style={{ "--nico-costume-accent": profession.accent } as CSSProperties}
                    key={profession.id}
                    onClick={() => choose(profession)}
                  >
                    <span>{profession.emoji}</span>
                    <strong>{profession.name[language]}</strong>
                    <small>{profession.tagline[language]}</small>
                  </button>
                );
              })}
            </div>
          ) : <p className="nico-outfit-empty" role="status">{text.noResults}</p>}

          <label className="nico-speech-toggle">
            <input
              type="checkbox"
              checked={draft.speechEnabled}
              onChange={(event) => {
                setSaved(false);
                setDraft((current) => ({ ...current, speechEnabled: event.target.checked }));
              }}
            />
            <span>{text.voice}</span>
          </label>

          <button type="button" className="nico-primary-action" onClick={save}>💾 {saved ? text.saved : text.save}</button>
        </div>
      </div>
    </section>
  );
}
