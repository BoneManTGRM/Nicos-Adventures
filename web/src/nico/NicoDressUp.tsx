import { useEffect, useMemo, useState } from "react";
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

const professions = professionData as ProfessionOption[];

const copy = {
  en: {
    title: "Nico’s Dress-Up Closet",
    intro: "Choose a profession or adventure costume. The choice stays in this profile and appears in Showtime Studio.",
    save: "Save Nico’s outfit",
    saved: "Outfit saved",
    voice: "Let Nico read answers aloud",
  },
  "es-MX": {
    title: "El armario de disfraces de Nico",
    intro: "Elige una profesión o un disfraz de aventura. La elección queda en este perfil y aparece en el Estudio Showtime.",
    save: "Guardar el traje de Nico",
    saved: "Traje guardado",
    voice: "Permitir que Nico lea respuestas en voz alta",
  },
} as const;

export function NicoDressUp({ language, artSource, preferences, onSave }: Props) {
  const text = copy[language];
  const [draft, setDraft] = useState<NicoPreferences>(preferences);
  const [saved, setSaved] = useState(false);
  const selected = useMemo(() => professions.find((item) => item.id === draft.profession) ?? professions[0], [draft.profession]);

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
          <small>🧰 {language === "es-MX" ? "12 opciones locales" : "12 local options"}</small>
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

        <div>
          <div className="nico-profession-grid" role="list" aria-label={text.title}>
            {professions.map((profession) => {
              const active = profession.id === draft.profession;
              return (
                <button
                  type="button"
                  role="listitem"
                  aria-pressed={active}
                  className={active ? "selected" : ""}
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
