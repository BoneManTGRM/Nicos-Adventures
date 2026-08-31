import { useEffect, useMemo, useReducer, useState, type CSSProperties } from "react";
import professionData from "../../catalogs/nico-professions.json";
import professionPhase2Extra from "../../catalogs/nico-professions-phase2-extra.json";
import type { Language, LocalizedText, NicoPreferences, NicoProfessionId, WardrobeSlot } from "../../types";
import {
  WARDROBE_ITEMS,
  itemsForSlot,
  resolveWardrobeItem,
  wardrobeForPreset,
  type WardrobeItem,
} from "./catalog";
import { EquippedGarmentList, GarmentThumbnail, NicoLayeredCharacter } from "./NicoLayeredCharacter";
import { createWardrobeHistory, wardrobeReducer } from "./wardrobeReducer";
import { useWardrobeDrag } from "./useWardrobeDrag";

export type ProfessionOption = {
  id: NicoProfessionId;
  emoji: string;
  name: LocalizedText;
  tagline: LocalizedText;
  costume: string;
  accent: string;
};

export const NICO_PROFESSIONS = [...professionData, ...professionPhase2Extra] as ProfessionOption[];

const slots: WardrobeSlot[] = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"];
const slotCopy: Record<WardrobeSlot, { icon: string; en: string; "es-MX": string }> = {
  headwear: { icon: "🧢", en: "Hats", "es-MX": "Sombreros" },
  eyewear: { icon: "👓", en: "Face", "es-MX": "Rostro" },
  top: { icon: "👕", en: "Shirts", "es-MX": "Camisas" },
  outerwear: { icon: "🧥", en: "Jackets", "es-MX": "Chaquetas" },
  bottoms: { icon: "🩳", en: "Bottoms", "es-MX": "Pantalones" },
  shoes: { icon: "👟", en: "Shoes", "es-MX": "Zapatos" },
  backpack: { icon: "🎒", en: "Backpacks", "es-MX": "Mochilas" },
  badge: { icon: "🏅", en: "Badges", "es-MX": "Insignias" },
  prop: { icon: "🧰", en: "Props", "es-MX": "Accesorios" },
};

const copy = {
  en: {
    eyebrow: "One body · independent clothes · local and private",
    title: "Nico’s Real Wardrobe",
    intro: "Drag a garment onto Nico or tap it. Each piece snaps into its own slot, so hats, shirts, pants, shoes, backpacks, badges, and props can be mixed together.",
    presets: "Profession presets",
    closet: "Garment closet",
    search: "Search this clothing slot…",
    custom: "Custom outfit",
    undo: "Undo",
    redo: "Redo",
    random: "Surprise outfit",
    reset: "Reset",
    save: "Save Nico’s wardrobe",
    saved: "Wardrobe saved",
    equip: "Equip",
    drag: "Drag this garment onto Nico",
    drop: (slot: string) => `Drop to equip ${slot}`,
    equipped: (name: string) => `${name} equipped.`,
    removed: (slot: string) => `${slot} removed.`,
    preset: (name: string) => `${name} preset applied. You can now change any individual piece.`,
    noResults: "No garments match this search.",
    voice: "Let Nico read answers aloud",
  },
  "es-MX": {
    eyebrow: "Un cuerpo · ropa independiente · local y privado",
    title: "El guardarropa real de Nico",
    intro: "Arrastra una prenda sobre Nico o tócala. Cada pieza se coloca en su propio espacio, así puedes combinar sombreros, camisas, pantalones, zapatos, mochilas, insignias y accesorios.",
    presets: "Conjuntos de profesiones",
    closet: "Armario de prendas",
    search: "Buscar en esta categoría…",
    custom: "Conjunto personalizado",
    undo: "Deshacer",
    redo: "Rehacer",
    random: "Conjunto sorpresa",
    reset: "Restablecer",
    save: "Guardar el guardarropa de Nico",
    saved: "Guardarropa guardado",
    equip: "Equipar",
    drag: "Arrastra esta prenda sobre Nico",
    drop: (slot: string) => `Suelta para equipar ${slot}`,
    equipped: (name: string) => `${name} equipado.`,
    removed: (slot: string) => `${slot} quitado.`,
    preset: (name: string) => `Conjunto ${name} aplicado. Ahora puedes cambiar cada pieza.`,
    noResults: "Ninguna prenda coincide con la búsqueda.",
    voice: "Permitir que Nico lea respuestas en voz alta",
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
  const wardrobe = wardrobeForPreset(profession.id, profession.accent);
  return {
    ...preferences,
    profession: profession.id,
    accentColor: profession.accent,
    wardrobe,
  };
}

export function WardrobeStudio({
  language,
  preferences,
  onSave,
}: {
  language: Language;
  preferences: NicoPreferences;
  onSave: (preferences: NicoPreferences) => void;
}) {
  const text = copy[language];
  const [history, dispatch] = useReducer(wardrobeReducer, preferences.wardrobe, createWardrobeHistory);
  const [selectedSlot, setSelectedSlot] = useState<WardrobeSlot>("top");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    dispatch({ type: "reset", wardrobe: preferences.wardrobe });
  }, [preferences.wardrobe]);

  const equip = (item: WardrobeItem) => {
    dispatch({ type: "equip", slot: item.slot, itemId: item.id });
    setSelectedSlot(item.slot);
    setSaved(false);
    setAnnouncement(text.equipped(item.name[language]));
  };

  const drag = useWardrobeDrag(equip);
  const selectedSlotItems = useMemo(() => {
    const locale = language === "es-MX" ? "es-MX" : "en-US";
    const normalized = query.trim().toLocaleLowerCase(locale);
    return itemsForSlot(selectedSlot).filter((entry) => !normalized || entry.name[language].toLocaleLowerCase(locale).includes(normalized));
  }, [language, query, selectedSlot]);

  const selectedPreset = history.present.presetId
    ? NICO_PROFESSIONS.find((entry) => entry.id === history.present.presetId) ?? null
    : null;

  const applyPreset = (profession: ProfessionOption) => {
    dispatch({ type: "preset", presetId: profession.id, accentColor: profession.accent });
    setSaved(false);
    setAnnouncement(text.preset(profession.name[language]));
  };

  const remove = (slot: WardrobeSlot) => {
    dispatch({ type: "remove", slot });
    setSaved(false);
    setAnnouncement(text.removed(slotCopy[slot][language]));
  };

  const save = () => {
    const preset = history.present.presetId
      ? NICO_PROFESSIONS.find((entry) => entry.id === history.present.presetId)
      : null;
    onSave({
      ...preferences,
      profession: preset?.id ?? preferences.profession,
      accentColor: history.present.accentColor,
      wardrobe: history.present,
    });
    setSaved(true);
  };

  const activeItem = resolveWardrobeItem(history.present[selectedSlot]);
  const highlightedSlot = drag.drag?.overStage ? drag.drag.item.slot : null;

  return (
    <section className="wardrobe-studio" aria-labelledby="wardrobe-title">
      <header className="nico-feature-heading wardrobe-studio__heading">
        <div>
          <small>🧵 {text.eyebrow}</small>
          <h2 id="wardrobe-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="wardrobe-layout">
        <section
          className={`wardrobe-stage ${drag.drag?.overStage ? "wardrobe-stage--ready" : ""}`}
          data-nico-wardrobe-stage="true"
          aria-label={drag.drag ? text.drop(slotCopy[drag.drag.item.slot][language]) : (selectedPreset?.name[language] ?? text.custom)}
        >
          <div className="wardrobe-stage__status" aria-live="polite">
            <span>{selectedPreset?.emoji ?? "✨"}</span>
            <div>
              <strong>{selectedPreset?.name[language] ?? text.custom}</strong>
              <small>{drag.drag ? text.drop(slotCopy[drag.drag.item.slot][language]) : `${WARDROBE_ITEMS.filter((entry) => history.present[entry.slot] === entry.id).length}/9`}</small>
            </div>
          </div>
          <NicoLayeredCharacter
            wardrobe={history.present}
            alt={language === "es-MX" ? "Nico con ropa en capas" : "Nico wearing layered clothes"}
            highlightedSlot={highlightedSlot}
          />
          <div className="wardrobe-stage__actions">
            <button type="button" onClick={() => { dispatch({ type: "undo" }); setSaved(false); }} disabled={!history.past.length}>↶ {text.undo}</button>
            <button type="button" onClick={() => { dispatch({ type: "redo" }); setSaved(false); }} disabled={!history.future.length}>↷ {text.redo}</button>
            <button type="button" onClick={() => { dispatch({ type: "randomize" }); setSaved(false); }}>🎲 {text.random}</button>
            <button type="button" onClick={() => { dispatch({ type: "reset", wardrobe: wardrobeForPreset("explorer") }); setSaved(false); }}>⟲ {text.reset}</button>
          </div>
          <EquippedGarmentList wardrobe={history.present} language={language} onRemove={remove} />
        </section>

        <div className="wardrobe-controls">
          <section className="wardrobe-presets" aria-labelledby="wardrobe-presets-heading">
            <header><h3 id="wardrobe-presets-heading">{text.presets}</h3><small>26</small></header>
            <div className="wardrobe-preset-row">
              {NICO_PROFESSIONS.map((profession) => (
                <button
                  type="button"
                  key={profession.id}
                  className={history.present.presetId === profession.id ? "active" : ""}
                  aria-pressed={history.present.presetId === profession.id}
                  style={{ "--preset-accent": profession.accent } as CSSProperties}
                  onClick={() => applyPreset(profession)}
                >
                  <NicoLayeredCharacter
                    wardrobe={wardrobeForPreset(profession.id)}
                    alt=""
                    compact
                    className="wardrobe-preset-thumbnail"
                  />
                  <strong>{profession.name[language]}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="wardrobe-closet" aria-labelledby="wardrobe-closet-heading">
            <header>
              <div><h3 id="wardrobe-closet-heading">{text.closet}</h3><small>{slotCopy[selectedSlot][language]}</small></div>
              <label>
                <span className="sr-only">{text.search}</span>
                <input type="search" value={query} placeholder={text.search} onChange={(event) => setQuery(event.target.value)} />
              </label>
            </header>
            <div className="wardrobe-slot-tabs" role="tablist" aria-label={text.closet}>
              {slots.map((slot) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedSlot === slot}
                  className={selectedSlot === slot ? "active" : ""}
                  key={slot}
                  onClick={() => { setSelectedSlot(slot); setQuery(""); }}
                >
                  <span>{slotCopy[slot].icon}</span><strong>{slotCopy[slot][language]}</strong>
                </button>
              ))}
            </div>

            {selectedSlotItems.length ? (
              <div className="wardrobe-garment-grid" role="list" aria-label={slotCopy[selectedSlot][language]}>
                {selectedSlotItems.map((entry) => {
                  const equipped = activeItem?.id === entry.id;
                  return (
                    <button
                      type="button"
                      role="listitem"
                      key={entry.id}
                      className={equipped ? "equipped" : ""}
                      aria-pressed={equipped}
                      title={text.drag}
                      onPointerDown={(event) => drag.begin(event, entry)}
                      onPointerMove={drag.move}
                      onPointerUp={drag.end}
                      onPointerCancel={drag.cancel}
                      onClick={() => {
                        if (drag.consumeSuppressedClick()) return;
                        equip(entry);
                      }}
                    >
                      <span className="wardrobe-garment-art" aria-hidden="true">
                        <GarmentThumbnail item={entry} />
                      </span>
                      <strong>{entry.name[language]}</strong>
                      <small>{equipped ? `✓ ${text.equip}` : text.drag}</small>
                    </button>
                  );
                })}
              </div>
            ) : <p className="wardrobe-empty" role="status">{text.noResults}</p>}
          </section>

          <label className="nico-speech-toggle wardrobe-speech-toggle">
            <input
              type="checkbox"
              checked={preferences.speechEnabled}
              onChange={(event) => onSave({ ...preferences, speechEnabled: event.target.checked, wardrobe: history.present })}
            />
            <span>{text.voice}</span>
          </label>
          <button type="button" className="nico-primary-action wardrobe-save" onClick={save}>💾 {saved ? text.saved : text.save}</button>
          <p className="sr-only" aria-live="polite">{announcement}</p>
        </div>
      </div>

      {drag.drag && (
        <div
          className={`wardrobe-drag-ghost ${drag.drag.overStage ? "over-stage" : ""}`}
          style={{ left: drag.drag.x, top: drag.drag.y }}
          aria-hidden="true"
        >
          <GarmentThumbnail item={drag.drag.item} />
          <strong>{drag.drag.item.name[language]}</strong>
          <small>{slotCopy[drag.drag.item.slot][language]}</small>
        </div>
      )}
    </section>
  );
}
