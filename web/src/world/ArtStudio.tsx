import { useMemo, useRef, useState } from "react";
import type { ArtworkRecord, LocalProfile } from "../types";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { completeCreativeMilestones } from "./creativeProgression";

import { ArtworkPreview, BACKGROUNDS, FRAMES } from "./ArtworkPreview";

function newArtwork(profile: LocalProfile): ArtworkRecord {
  return {
    id: makeId("art"),
    title: profile.language === "es-MX" ? "Mi póster de aventura" : "My Adventure Poster",
    background: "Starry Space",
    subject: profile.robot.name,
    frame: "Gold Frame",
    caption: profile.language === "es-MX" ? "Explora. Construye. Imagina." : "Explore. Build. Imagine.",
  };
}

export function ArtStudio({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const posterCanvas = useRef<HTMLCanvasElement>(null);
  const [draft, setDraft] = useState<ArtworkRecord>(() => newArtwork(profile));
  const [editingId, setEditingId] = useState<string | null>(null);

  const subjects = useMemo(() => {
    const discovered = mergeAnimalLibrary(profile.animals)
      .filter((animal) => animal.discovered)
      .map((animal) => localizeAnimalCompat(animal, language).name);
    return [...new Set([
      "Nico", "Becca", "Lua",
      profile.robot.name,
      ...profile.monsters.map((monster) => monster.name),
      ...profile.pets.map((pet) => pet.name),
      ...discovered,
    ])];
  }, [language, profile.animals, profile.monsters, profile.pets, profile.robot.name]);

  const background = BACKGROUNDS.find((item) => item.id === draft.background) ?? BACKGROUNDS[0];

  const startNew = () => {
    setEditingId(null);
    setDraft(newArtwork(profile));
    announce(language === "es-MX" ? "Lienzo nuevo listo." : "New canvas ready.");
  };

  const inspire = () => {
    const backgroundChoice = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    const frameChoice = FRAMES[Math.floor(Math.random() * FRAMES.length)];
    const subjectChoice = subjects[Math.floor(Math.random() * subjects.length)] || profile.robot.name;
    setDraft((current) => ({
      ...current,
      background: backgroundChoice.id,
      frame: frameChoice.id,
      subject: subjectChoice,
      caption: language === "es-MX" ? "¡Una nueva aventura comienza aquí!" : "A new adventure begins here!",
    }));
    announce(language === "es-MX" ? "Inspiración sorpresa aplicada." : "Surprise inspiration applied.");
  };

  const save = () => {
    const title = draft.title.trim() || (language === "es-MX" ? "Obra sin título" : "Untitled Artwork");
    const artwork = { ...draft, id: editingId ?? draft.id ?? makeId("art"), title };
    const exists = profile.artwork.some((item) => item.id === artwork.id);
    const previousCount = profile.artwork.length;
    const artworkList = exists
      ? profile.artwork.map((item) => item.id === artwork.id ? artwork : item)
      : [...profile.artwork, artwork].slice(-60);
    let nextProfile: LocalProfile = { ...profile, artwork: artworkList, displayedArtworkId: artwork.id, stars: profile.stars + (exists ? 0 : 2) };
    const milestones = completeCreativeMilestones(nextProfile, "artwork", previousCount, artworkList.length);
    nextProfile = milestones.profile;
    update(nextProfile);
    setDraft(artwork);
    setEditingId(artwork.id);
    announce(language === "es-MX"
      ? `${title} guardada.${!exists ? " Ganaste dos estrellas." : ""}${milestones.milestones.length ? " También alcanzaste un hito creativo." : ""}`
      : `${title} saved.${!exists ? " You earned two stars." : ""}${milestones.milestones.length ? " You also reached a creative milestone." : ""}`);
  };

  const edit = (artwork: ArtworkRecord) => {
    setEditingId(artwork.id);
    setDraft({ ...artwork });
    announce(language === "es-MX" ? `Editando ${artwork.title}.` : `Editing ${artwork.title}.`);
  };

  const remove = (artwork: ArtworkRecord) => {
    if (!window.confirm(language === "es-MX" ? `¿Eliminar ${artwork.title}?` : `Delete ${artwork.title}?`)) return;
    update({ ...profile, artwork: profile.artwork.filter((item) => item.id !== artwork.id) });
    if (editingId === artwork.id) startNew();
    announce(language === "es-MX" ? `${artwork.title} eliminada.` : `${artwork.title} deleted.`);
  };

  return (
    <div className="creative-studio-layout">
      <section className="creative-canvas-panel" aria-labelledby="art-preview-heading">
        <header>
          <div>
            <small>{language === "es-MX" ? "Vista previa en vivo" : "Live preview"}</small>
            <h2 id="art-preview-heading">{draft.title || (language === "es-MX" ? "Obra sin título" : "Untitled Artwork")}</h2>
          </div>
          <span>{background.emoji}</span>
        </header>
        <ArtworkPreview artwork={draft} profile={profile} canvasRef={posterCanvas} />
        <div className="fw-action-row">
          <button type="button" onClick={() => {
            const canvas = posterCanvas.current;
            if (!canvas || canvas.closest("article")?.getAttribute("data-art-ready") !== "true") { announce(language === "es-MX" ? "Espera a que cargue el arte." : "Wait for the artwork to load."); return; }
            canvas.toBlob(blob => { if (!blob) { announce(language === "es-MX" ? "No se pudo descargar." : "Download failed."); return; }
              const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="nico-adventure-poster.png";link.click();window.setTimeout(()=>URL.revokeObjectURL(url),30000);
            }, "image/png");
          }}>{language === "es-MX" ? "Descargar póster" : "Download poster"}</button>
          <button type="button" onClick={inspire}>🎲 {language === "es-MX" ? "Inspirarme" : "Inspire me"}</button>
          <button type="button" onClick={startNew}>＋ {language === "es-MX" ? "Lienzo nuevo" : "New canvas"}</button>
          <button type="button" className="fw-primary" onClick={save}>💾 {editingId ? (language === "es-MX" ? "Actualizar" : "Update") : (language === "es-MX" ? "Guardar obra" : "Save artwork")}</button>
        </div>
      </section>

      <section className="fw-panel creative-controls" aria-label={language === "es-MX" ? "Controles del estudio de arte" : "Art Studio controls"}>
        <label>{language === "es-MX" ? "Título" : "Title"}<input value={draft.title} maxLength={60} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>
          {language === "es-MX" ? "Protagonista" : "Subject"}
          <select aria-label={language === "es-MX" ? "Protagonista" : "Subject"} value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
        </label>
        <fieldset className="art-composition">
          <legend>{language === "es-MX" ? "Composición" : "Composition"}</legend>
          <label>{language === "es-MX" ? "Tamaño del personaje" : "Character size"}<input type="range" min="0.65" max="1.2" step="0.05" value={draft.scale ?? 1} onChange={event => setDraft({...draft, scale:Number(event.target.value)})}/></label>
          <label>{language === "es-MX" ? "Posición del personaje" : "Character position"}<input type="range" min="-70" max="70" step="5" value={draft.offset ?? 0} onChange={event => setDraft({...draft, offset:Number(event.target.value)})}/></label>
          <button type="button" onClick={()=>setDraft({...draft,scale:1,offset:0})}>{language === "es-MX" ? "Centrar personaje" : "Center character"}</button>
        </fieldset>
        <fieldset>
          <legend>{language === "es-MX" ? "Escenario" : "Scene"}</legend>
          <div className="creative-choice-grid">
            {BACKGROUNDS.map((item) => (
              <button type="button" aria-pressed={draft.background === item.id} className={draft.background === item.id ? "active" : ""} key={item.id} onClick={() => setDraft({ ...draft, background: item.id })}>
                <span aria-hidden="true">{item.emoji}</span><strong>{language === "es-MX" ? item.es : item.en}</strong>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{language === "es-MX" ? "Marco" : "Frame"}</legend>
          <div className="creative-choice-grid creative-frame-grid">
            {FRAMES.map((item) => (
              <button type="button" aria-pressed={draft.frame === item.id} className={draft.frame === item.id ? "active" : ""} key={item.id} onClick={() => setDraft({ ...draft, frame: item.id })}>
                <span className="frame-swatch" style={{ borderColor: item.color }} aria-hidden="true" />
                <strong>{language === "es-MX" ? item.es : item.en}</strong>
              </button>
            ))}
          </div>
        </fieldset>
        <label>{language === "es-MX" ? "Mensaje" : "Caption"}<textarea value={draft.caption} maxLength={140} rows={3} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></label>
      </section>

      <section className="creative-library" aria-labelledby="art-library-heading">
        <header>
          <div>
            <small>{language === "es-MX" ? "Guardado local" : "Saved locally"}</small>
            <h2 id="art-library-heading">{language === "es-MX" ? "Galería" : "Gallery"}</h2>
          </div>
          <strong>{profile.artwork.length}/60</strong>
        </header>
        {!profile.artwork.length ? <EmptyState emoji="🎨">{language === "es-MX" ? "Tu primera obra aparecerá aquí." : "Your first artwork will appear here."}</EmptyState> : (
          <div className="creative-library-grid">
            {[...profile.artwork].reverse().map((artwork) => (
              <article className={editingId === artwork.id ? "selected" : ""} key={artwork.id}>
                <span aria-hidden="true">🖼️</span>
                <div><h3>{artwork.title}</h3><p>{artwork.subject}</p></div>
                <button type="button" onClick={() => edit(artwork)}>{language === "es-MX" ? "Editar" : "Edit"}</button>
                <button type="button" className="danger" onClick={() => remove(artwork)} aria-label={`${language === "es-MX" ? "Eliminar" : "Delete"}: ${artwork.title}`}>×</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
