import { useMemo, useState } from "react";
import type { Language, LocalProfile, StoryRecord } from "../types";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { completeCreativeMilestones } from "./creativeProgression";

const PLACE_OPTIONS = {
  en: ["Animal Forest", "Dinosaur Valley", "a moon base", "a crystal cave", "Robot Home", "an underwater laboratory"],
  "es-MX": ["el Bosque animal", "el Valle de dinosaurios", "una base lunar", "una cueva de cristal", "la Casa Robot", "un laboratorio submarino"],
} as const;

const PROBLEM_OPTIONS = {
  en: [
    "a mysterious light disappeared",
    "a tiny robot lost its map",
    "a dinosaur egg needed protection",
    "the bridge to the next adventure stopped working",
    "a shy monster wanted to make a friend",
    "a storm scattered important clues",
  ],
  "es-MX": [
    "una luz misteriosa desapareció",
    "un robot pequeño perdió su mapa",
    "un huevo de dinosaurio necesitaba protección",
    "el puente hacia la siguiente aventura dejó de funcionar",
    "un monstruo tímido quería hacer un amigo",
    "una tormenta dispersó pistas importantes",
  ],
} as const;

const ENDING_OPTIONS = {
  en: [
    "everyone worked together and found a kind solution",
    "the team repaired the problem and celebrated under the stars",
    "a new friendship made the whole world brighter",
    "careful observation revealed the final clue",
    "the heroes returned home with a lesson and a new idea",
  ],
  "es-MX": [
    "todos trabajaron juntos y encontraron una solución amable",
    "el equipo reparó el problema y celebró bajo las estrellas",
    "una nueva amistad hizo que todo el mundo brillara más",
    "la observación cuidadosa reveló la pista final",
    "los héroes regresaron a casa con una lección y una idea nueva",
  ],
} as const;

function defaultStory(profile: LocalProfile, heroes: string[], language: Language = profile.language): StoryRecord {
  return language === "es-MX"
    ? {
        id: makeId("story"),
        title: "El sendero brillante",
        hero: heroes[0] || "Nico",
        place: PLACE_OPTIONS[language][0],
        problem: PROBLEM_OPTIONS[language][0],
        ending: ENDING_OPTIONS[language][0],
        language,
      }
    : {
        id: makeId("story"),
        title: "The Bright Trail",
        hero: heroes[0] || "Nico",
        place: PLACE_OPTIONS[language][0],
        problem: PROBLEM_OPTIONS[language][0],
        ending: ENDING_OPTIONS[language][0],
        language,
      };
}

function storyText(story: StoryRecord): string {
  return story.language === "es-MX"
    ? `${story.hero} viajó a ${story.place}. Allí, ${story.problem}. Después de una gran aventura, ${story.ending}.`
    : `${story.hero} traveled to ${story.place}. There, ${story.problem}. After a great adventure, ${story.ending}.`;
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
  const text = storyText(draft);

  const startNew = () => {
    setEditingId(null);
    setDraft(defaultStory(profile, heroes, draft.language));
    announce(language === "es-MX" ? "Página nueva lista." : "New story page ready.");
  };

  const surprise = () => {
    const pick = <T,>(values: readonly T[]): T => values[Math.floor(Math.random() * values.length)];
    setDraft((current) => ({
      ...current,
      title: current.language === "es-MX" ? "La aventura sorpresa" : "The Surprise Adventure",
      hero: pick(heroes),
      place: pick(PLACE_OPTIONS[current.language]),
      problem: pick(PROBLEM_OPTIONS[current.language]),
      ending: pick(ENDING_OPTIONS[current.language]),
    }));
    announce(language === "es-MX" ? "Se creó una idea sorpresa." : "A surprise story idea was created.");
  };

  const save = () => {
    const story = {
      ...draft,
      id: editingId ?? draft.id ?? makeId("story"),
      title: draft.title.trim() || (draft.language === "es-MX" ? "Cuento sin título" : "Untitled Story"),
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
      ? `${story.title} guardado.${!exists ? " Ganaste dos estrellas." : ""}${milestones.milestones.length ? " Alcanzaste un hito de cuentos." : ""}`
      : `${story.title} saved.${!exists ? " You earned two stars." : ""}${milestones.milestones.length ? " You reached a story milestone." : ""}`);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = draft.language === "es-MX" ? "es-MX" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const edit = (story: StoryRecord) => {
    setEditingId(story.id);
    setDraft({ ...story });
    announce(language === "es-MX" ? `Editando ${story.title}.` : `Editing ${story.title}.`);
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
    setDraft({ ...next, hero: draft.hero });
  };

  return (
    <div className="story-studio-layout">
      <section className="story-book-preview" aria-labelledby="story-preview-heading">
        <div className="story-book-spine" aria-hidden="true" />
        <article>
          <small>{draft.language === "es-MX" ? "CUENTO" : "STORY"}</small>
          <h2 id="story-preview-heading">{draft.title}</h2>
          <p>{text}</p>
          <div className="story-preview-actions">
            <button type="button" onClick={speak}>🔊 {language === "es-MX" ? "Leer en voz alta" : "Read aloud"}</button>
            <button type="button" onClick={surprise}>🎲 {language === "es-MX" ? "Idea sorpresa" : "Surprise idea"}</button>
          </div>
        </article>
      </section>

      <section className="fw-panel story-controls" aria-label={language === "es-MX" ? "Controles del cuento" : "Story controls"}>
        <label>
          {language === "es-MX" ? "Idioma del cuento" : "Story language"}
          <select value={draft.language} onChange={(event) => changeLanguage(event.target.value as Language)}>
            <option value="en">English</option>
            <option value="es-MX">Español de México</option>
          </select>
        </label>
        <label>{draft.language === "es-MX" ? "Título" : "Title"}<input value={draft.title} maxLength={60} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>
          {draft.language === "es-MX" ? "Protagonista" : "Hero"}
          <select value={draft.hero} onChange={(event) => setDraft({ ...draft, hero: event.target.value })}>
            {heroes.map((hero) => <option key={hero}>{hero}</option>)}
          </select>
        </label>
        <label>
          {draft.language === "es-MX" ? "Lugar" : "Place"}
          <select value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })}>
            {PLACE_OPTIONS[draft.language].map((place) => <option key={place}>{place}</option>)}
          </select>
        </label>
        <label>
          {draft.language === "es-MX" ? "Problema" : "Problem"}
          <select value={draft.problem} onChange={(event) => setDraft({ ...draft, problem: event.target.value })}>
            {PROBLEM_OPTIONS[draft.language].map((problem) => <option key={problem}>{problem}</option>)}
          </select>
        </label>
        <label>
          {draft.language === "es-MX" ? "Final" : "Ending"}
          <select value={draft.ending} onChange={(event) => setDraft({ ...draft, ending: event.target.value })}>
            {ENDING_OPTIONS[draft.language].map((ending) => <option key={ending}>{ending}</option>)}
          </select>
        </label>
        <div className="fw-action-row">
          <button type="button" onClick={startNew}>＋ {language === "es-MX" ? "Página nueva" : "New page"}</button>
          <button type="button" className="fw-primary" onClick={save}>💾 {editingId ? (language === "es-MX" ? "Actualizar cuento" : "Update story") : (language === "es-MX" ? "Guardar cuento" : "Save story")}</button>
        </div>
      </section>

      <section className="creative-library" aria-labelledby="story-library-heading">
        <header>
          <div><small>{language === "es-MX" ? "Biblioteca local" : "Local library"}</small><h2 id="story-library-heading">{language === "es-MX" ? "Mis cuentos" : "My stories"}</h2></div>
          <strong>{profile.stories.length}/60</strong>
        </header>
        {!profile.stories.length ? <EmptyState emoji="📚">{language === "es-MX" ? "Tu primer cuento aparecerá aquí." : "Your first story will appear here."}</EmptyState> : (
          <div className="creative-library-grid">
            {[...profile.stories].reverse().map((story) => (
              <article className={editingId === story.id ? "selected" : ""} key={story.id}>
                <span aria-hidden="true">📖</span>
                <div><h3>{story.title}</h3><p>{story.hero} · {story.language === "es-MX" ? "Español" : "English"}</p></div>
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
