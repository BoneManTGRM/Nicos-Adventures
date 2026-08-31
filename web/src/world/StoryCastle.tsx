import { useMemo, useState } from "react";
import type { Language, LocalProfile, StoryRecord } from "../types";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { completeCreativeMilestones } from "./creativeProgression";
import { buildStoryPages, defaultStoryTitle, STORY_OPTIONS, storyCombinationCount, storyPages } from "./storyBook";

const PAGE_ART = ["🏰", "🧭", "🔎", "💡", "🤝", "🌟"] as const;

function defaultStory(profile: LocalProfile, heroes: string[], language: Language = profile.language): StoryRecord {
  return {
    id: makeId("story"),
    title: defaultStoryTitle(language),
    hero: heroes[0] || "Nico",
    companion: heroes[1] || profile.robot.name || "BoltBot",
    place: STORY_OPTIONS.place[language][0],
    problem: STORY_OPTIONS.problem[language][0],
    ending: STORY_OPTIONS.ending[language][0],
    theme: STORY_OPTIONS.theme[language][0],
    magicItem: STORY_OPTIONS.magicItem[language][0],
    specialDetail: "",
    language,
  };
}

export function StoryCastle({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const heroes = useMemo(() => [
    "Nico",
    profile.robot.name,
    ...profile.monsters.map((monster) => monster.name),
    ...profile.pets.map((pet) => pet.name),
  ].filter((name, index, list) => Boolean(name) && list.indexOf(name) === index), [profile.monsters, profile.pets, profile.robot.name]);
  const [draft, setDraft] = useState<StoryRecord>(() => defaultStory(profile, heroes));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const pages = storyPages(draft);
  const safePageIndex = Math.min(pageIndex, pages.length - 1);

  const change = (patch: Partial<StoryRecord>) => setDraft((current) => ({ ...current, ...patch, pages: undefined }));
  const pick = <T,>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)];

  const startNew = () => {
    setEditingId(null);
    setDraft(defaultStory(profile, heroes, draft.language));
    setPageIndex(0);
    announce(language === "es-MX" ? "Libro nuevo listo." : "New storybook ready.");
  };

  const surprise = () => {
    setDraft((current) => ({
      ...current,
      title: current.language === "es-MX" ? "La aventura sorpresa" : "The Surprise Adventure",
      hero: pick(heroes),
      companion: pick(heroes),
      place: pick(STORY_OPTIONS.place[current.language]),
      problem: pick(STORY_OPTIONS.problem[current.language]),
      ending: pick(STORY_OPTIONS.ending[current.language]),
      theme: pick(STORY_OPTIONS.theme[current.language]),
      magicItem: pick(STORY_OPTIONS.magicItem[current.language]),
      pages: undefined,
    }));
    setPageIndex(0);
    announce(language === "es-MX" ? "Se creó un libro sorpresa de seis páginas." : "A surprise six-page storybook was created.");
  };

  const save = () => {
    const story: StoryRecord = {
      ...draft,
      id: editingId ?? draft.id ?? makeId("story"),
      title: draft.title.trim() || (draft.language === "es-MX" ? "Cuento sin título" : "Untitled Story"),
      specialDetail: draft.specialDetail?.trim(),
      pages: buildStoryPages(draft),
    };
    const exists = profile.stories.some((item) => item.id === story.id);
    const previousCount = profile.stories.length;
    const stories = exists
      ? profile.stories.map((item) => item.id === story.id ? story : item)
      : [...profile.stories, story].slice(-60);
    let nextProfile: LocalProfile = { ...profile, stories, stars: profile.stars + (exists ? 0 : 2) };
    const milestones = completeCreativeMilestones(nextProfile, "story", previousCount, stories.length);
    nextProfile = milestones.profile;
    update(nextProfile);
    setEditingId(story.id);
    setDraft(story);
    announce(language === "es-MX"
      ? `${story.title} guardado con seis páginas.${!exists ? " Ganaste dos estrellas." : ""}`
      : `${story.title} saved with six pages.${!exists ? " You earned two stars." : ""}`);
  };

  const speak = (allPages = false) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(allPages ? pages.join(" ") : pages[safePageIndex]);
    utterance.lang = draft.language === "es-MX" ? "es-MX" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const edit = (story: StoryRecord) => {
    setEditingId(story.id);
    setDraft({ ...defaultStory(profile, heroes, story.language), ...story, pages: storyPages(story) });
    setPageIndex(0);
    announce(language === "es-MX" ? `Abriendo ${story.title}.` : `Opening ${story.title}.`);
  };

  const remove = (story: StoryRecord) => {
    if (!window.confirm(language === "es-MX" ? `¿Eliminar ${story.title}?` : `Delete ${story.title}?`)) return;
    update({ ...profile, stories: profile.stories.filter((item) => item.id !== story.id) });
    if (editingId === story.id) startNew();
    announce(language === "es-MX" ? `${story.title} eliminado.` : `${story.title} deleted.`);
  };

  const changeLanguage = (nextLanguage: Language) => {
    const next = defaultStory(profile, heroes, nextLanguage);
    setEditingId(null);
    setDraft({ ...next, hero: draft.hero, companion: draft.companion });
    setPageIndex(0);
  };

  return (
    <div className="story-studio-layout">
      <section className="story-book-preview" aria-labelledby="story-preview-heading" data-page={`${safePageIndex + 1}-of-${pages.length}`}>
        <div className="story-book-spine" aria-hidden="true" />
        <article>
          <div className="story-page-kicker">
            <small>{draft.language === "es-MX" ? "LIBRO DE AVENTURAS" : "ADVENTURE STORYBOOK"}</small>
            <span>{safePageIndex + 1} / {pages.length}</span>
          </div>
          <div className="story-page-art" aria-hidden="true">{PAGE_ART[safePageIndex] ?? "✨"}</div>
          <h2 id="story-preview-heading">{draft.title}</h2>
          <p>{pages[safePageIndex]}</p>
          <div className="story-page-turner" aria-label={draft.language === "es-MX" ? "Páginas del cuento" : "Story pages"}>
            <button type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={safePageIndex === 0}>← {draft.language === "es-MX" ? "Anterior" : "Back"}</button>
            <div aria-hidden="true">{pages.map((_, index) => <span className={index === safePageIndex ? "active" : ""} key={index} />)}</div>
            <button type="button" onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))} disabled={safePageIndex === pages.length - 1}>{draft.language === "es-MX" ? "Siguiente" : "Next"} →</button>
          </div>
          <div className="story-preview-actions">
            <button type="button" onClick={() => speak(false)}>🔊 {draft.language === "es-MX" ? "Leer página" : "Read page"}</button>
            <button type="button" onClick={() => speak(true)}>🎧 {draft.language === "es-MX" ? "Leer libro" : "Read book"}</button>
            <button type="button" onClick={surprise}>🎲 {draft.language === "es-MX" ? "Sorpresa" : "Surprise"}</button>
          </div>
        </article>
      </section>

      <section className="fw-panel story-controls" aria-label={language === "es-MX" ? "Controles del cuento" : "Story controls"}>
        <header className="story-controls__header">
          <div><small>{language === "es-MX" ? "TALLER DE HISTORIAS" : "STORY WORKSHOP"}</small><h2>{language === "es-MX" ? "Inventa tu libro" : "Build your book"}</h2></div>
          <strong>{storyCombinationCount.toLocaleString(draft.language === "es-MX" ? "es-MX" : "en-US")}+</strong>
          <span>{language === "es-MX" ? "combinaciones" : "combinations"}</span>
        </header>
        <div className="story-choice-grid">
          <label>{draft.language === "es-MX" ? "Idioma" : "Language"}<select value={draft.language} onChange={(event) => changeLanguage(event.target.value as Language)}><option value="en">English</option><option value="es-MX">Español de México</option></select></label>
          <label>{draft.language === "es-MX" ? "Título" : "Title"}<input value={draft.title} maxLength={60} onChange={(event) => change({ title: event.target.value })} /></label>
          <label>{draft.language === "es-MX" ? "Protagonista" : "Hero"}<input list="story-heroes" value={draft.hero} maxLength={40} onChange={(event) => change({ hero: event.target.value })} /><datalist id="story-heroes">{heroes.map((hero) => <option key={hero} value={hero} />)}</datalist></label>
          <label>{draft.language === "es-MX" ? "Compañero" : "Companion"}<select value={draft.companion} onChange={(event) => change({ companion: event.target.value })}>{heroes.map((hero) => <option key={hero}>{hero}</option>)}</select></label>
          <label>{draft.language === "es-MX" ? "Tema" : "Theme"}<select value={draft.theme} onChange={(event) => change({ theme: event.target.value })}>{STORY_OPTIONS.theme[draft.language].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>{draft.language === "es-MX" ? "Lugar" : "Place"}<select value={draft.place} onChange={(event) => change({ place: event.target.value })}>{STORY_OPTIONS.place[draft.language].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>{draft.language === "es-MX" ? "Desafío" : "Challenge"}<select value={draft.problem} onChange={(event) => change({ problem: event.target.value })}>{STORY_OPTIONS.problem[draft.language].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>{draft.language === "es-MX" ? "Objeto especial" : "Special item"}<select value={draft.magicItem} onChange={(event) => change({ magicItem: event.target.value })}>{STORY_OPTIONS.magicItem[draft.language].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="story-choice-grid__wide">{draft.language === "es-MX" ? "Tu detalle secreto (opcional)" : "Your secret detail (optional)"}<input value={draft.specialDetail ?? ""} maxLength={120} placeholder={draft.language === "es-MX" ? "Ej. Una estrella morada dejó una pista" : "Example: A purple star left a clue"} onChange={(event) => change({ specialDetail: event.target.value })} /></label>
          <label className="story-choice-grid__wide">{draft.language === "es-MX" ? "Final" : "Ending"}<select value={draft.ending} onChange={(event) => change({ ending: event.target.value })}>{STORY_OPTIONS.ending[draft.language].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="fw-action-row">
          <button type="button" onClick={startNew}>＋ {language === "es-MX" ? "Libro nuevo" : "New book"}</button>
          <button type="button" className="fw-primary" onClick={save}>💾 {editingId ? (language === "es-MX" ? "Actualizar cuento" : "Update story") : (language === "es-MX" ? "Guardar cuento" : "Save story")}</button>
        </div>
      </section>

      <section className="creative-library" aria-labelledby="story-library-heading">
        <header>
          <div><small>{language === "es-MX" ? "BIBLIOTECA PRIVADA EN ESTE DISPOSITIVO" : "PRIVATE ON-DEVICE LIBRARY"}</small><h2 id="story-library-heading">{language === "es-MX" ? "Mis libros" : "My storybooks"}</h2></div>
          <strong>{profile.stories.length}/60</strong>
        </header>
        {!profile.stories.length ? <EmptyState emoji="📚">{language === "es-MX" ? "Tu primer libro de seis páginas aparecerá aquí." : "Your first six-page book will appear here."}</EmptyState> : (
          <div className="creative-library-grid">
            {[...profile.stories].reverse().map((story) => (
              <article className={editingId === story.id ? "selected" : ""} key={story.id}>
                <span aria-hidden="true">📖</span>
                <div><h3>{story.title}</h3><p>{story.hero} · {storyPages(story).length} {story.language === "es-MX" ? "páginas" : "pages"}</p></div>
                <button type="button" onClick={() => edit(story)}>{language === "es-MX" ? "Abrir" : "Open"}</button>
                <button type="button" className="danger" onClick={() => remove(story)} aria-label={`${language === "es-MX" ? "Eliminar" : "Delete"}: ${story.title}`}>×</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
