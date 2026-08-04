import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import professionData from "../catalogs/nico-professions.json";
import professionPhase2Extra from "../catalogs/nico-professions-phase2-extra.json";
import type { Language, LocalizedText, NicoPreferences, NicoProfessionId } from "../types";
import { approvedOutfitStyle, useApprovedNicoArt } from "./approvedNicoArt";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { nicoOutfitSpriteStyle, useNicoDragArt } from "./nicoDragArt";

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
  artSource?: string;
  outfitArtSource?: string;
  baseArtSource?: string;
  dragOutfitSource?: string;
  preferences: NicoPreferences;
  onSave: (preferences: NicoPreferences) => void;
};

type DragState = {
  profession: ProfessionOption;
  pointerId: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
};

export const NICO_PROFESSIONS = [...professionData, ...professionPhase2Extra] as ProfessionOption[];

const copy = {
  en: {
    title: "Nico’s Drag-and-Drop Studio",
    intro: "Drag an outfit onto Nico, or tap one to dress him. Everything stays private on this device.",
    save: "Save Nico’s outfit",
    saved: "Outfit saved",
    voice: "Let Nico read answers aloud",
    search: "Search jobs and costumes…",
    noResults: "No outfit matches that search.",
    options: "local outfit options",
    drop: "Drop the outfit on Nico",
    dressed: (name: string) => `Nico is dressed as ${name}.`,
  },
  "es-MX": {
    title: "Estudio de disfraces de Nico",
    intro: "Arrastra un traje sobre Nico o tócalo para vestirlo. Todo permanece privado en este dispositivo.",
    save: "Guardar el traje de Nico",
    saved: "Traje guardado",
    voice: "Permitir que Nico lea respuestas en voz alta",
    search: "Buscar trabajos y disfraces…",
    noResults: "Ningún traje coincide con la búsqueda.",
    options: "opciones locales de traje",
    drop: "Suelta el traje sobre Nico",
    dressed: (name: string) => `Nico está vestido de ${name}.`,
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

export function applyNicoProfession(
  preferences: NicoPreferences,
  profession: Pick<ProfessionOption, "id" | "accent">,
): NicoPreferences {
  return { ...preferences, profession: profession.id, accentColor: profession.accent };
}

export function NicoDressUp({
  language,
  artSource = "",
  outfitArtSource = "",
  baseArtSource = "",
  dragOutfitSource = "",
  preferences,
  onSave,
}: Props) {
  const text = copy[language];
  const approvedArt = useApprovedNicoArt();
  const dragArt = useNicoDragArt();
  const characterSource = artSource || approvedArt.characterSource;
  const approvedOutfitsSource = outfitArtSource || approvedArt.outfitSource;
  const nicoBaseSource = baseArtSource || dragArt.baseSource;
  const nicoOutfitsSource = dragOutfitSource || dragArt.outfitSource;
  const [draft, setDraft] = useState<NicoPreferences>(preferences);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const suppressClickRef = useRef(false);
  const movedRef = useRef(false);
  const selected = useMemo(
    () => NICO_PROFESSIONS.find((item) => item.id === draft.profession) ?? NICO_PROFESSIONS[0],
    [draft.profession],
  );
  const visibleProfessions = useMemo(() => filterNicoProfessions(query, language), [language, query]);

  useEffect(() => setDraft(preferences), [preferences]);

  const choose = (profession: ProfessionOption) => {
    setSaved(false);
    setDraft((current) => applyNicoProfession(current, profession));
    setAnnouncement(text.dressed(profession.name[language]));
  };

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, profession: ProfessionOption) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    movedRef.current = false;
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      profession,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    setDrag((current) => {
      if (!current || current.pointerId !== event.pointerId) return current;
      if (Math.hypot(event.clientX - current.originX, event.clientY - current.originY) > 8) movedRef.current = true;
      return { ...current, x: event.clientX, y: event.clientY };
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag;
    if (!current || current.pointerId !== event.pointerId) return;
    const dropTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-nico-drop-zone]");
    if (movedRef.current) {
      suppressClickRef.current = true;
      if (dropTarget) choose(current.profession);
    }
    setDrag(null);
  };

  const cancelDrag = () => {
    suppressClickRef.current = movedRef.current;
    setDrag(null);
  };

  const save = () => {
    onSave(draft);
    setSaved(true);
  };

  const thumbnail = (profession: ProfessionOption) => {
    const approvedStyle = approvedOutfitStyle(approvedOutfitsSource, profession.id);
    return approvedStyle ? (
      <span className="nico-outfit-thumbnail nico-outfit-thumbnail--approved" aria-hidden="true">
        <span style={approvedStyle} />
      </span>
    ) : (
      <span className="nico-outfit-thumbnail" style={nicoOutfitSpriteStyle(nicoOutfitsSource, profession.id)} aria-hidden="true" />
    );
  };

  const dragPreview = drag ? approvedOutfitStyle(approvedOutfitsSource, drag.profession.id) : null;

  return (
    <section className="nico-dress-up nico-drag-studio" aria-labelledby="nico-dress-title">
      <header className="nico-feature-heading">
        <div>
          <small>🧰 {NICO_PROFESSIONS.length} {text.options}</small>
          <h2 id="nico-dress-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="nico-drag-layout">
        <div className={`nico-drag-stage ${drag ? "nico-drag-stage--active" : ""}`} data-nico-drop-zone="true">
          <span className="nico-drag-stage__hint">{drag ? text.drop : selected.name[language]}</span>
          <NicoCostumeFigure
            artSource={characterSource}
            outfitArtSource={approvedOutfitsSource}
            baseArtSource={nicoBaseSource}
            dragOutfitSource={nicoOutfitsSource}
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
            <div className="nico-profession-grid nico-drag-outfit-grid" role="list" aria-label={text.title}>
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
                    onPointerDown={(event) => beginDrag(event, profession)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={cancelDrag}
                    onClick={() => {
                      if (suppressClickRef.current) {
                        suppressClickRef.current = false;
                        return;
                      }
                      choose(profession);
                    }}
                  >
                    {thumbnail(profession)}
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
          <p className="sr-only" aria-live="polite">{announcement}</p>
        </div>
      </div>

      {drag && (
        <div className="nico-drag-ghost" style={{ left: drag.x, top: drag.y } as CSSProperties} aria-hidden="true">
          {dragPreview ? (
            <span className="nico-drag-ghost__approved"><span style={dragPreview} /></span>
          ) : (
            <span style={nicoOutfitSpriteStyle(nicoOutfitsSource, drag.profession.id)} />
          )}
          <strong>{drag.profession.name[language]}</strong>
        </div>
      )}
    </section>
  );
}
