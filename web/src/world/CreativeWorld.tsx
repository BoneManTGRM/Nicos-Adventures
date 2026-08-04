import { useMemo, useState } from "react";
import type { ArtworkRecord, LocalProfile, StoryRecord } from "../types";
import { tr, ui } from "../i18n/core";
import type { Announce, UpdateProfile } from "./common";
import { makeId } from "./common";

function newArtwork(profile: LocalProfile): ArtworkRecord {
  return {
    id: makeId("art"),
    title: profile.language === "es-MX" ? "Póster de aventura" : "Adventure Poster",
    background: profile.language === "es-MX" ? "Espacio estrellado" : "Starry Space",
    subject: profile.robot.name,
    frame: profile.language === "es-MX" ? "Marco dorado" : "Gold Frame",
    caption: profile.language === "es-MX" ? "Explora. Construye. Imagina." : "Explore. Build. Imagine.",
  };
}

export function ArtStudio({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<ArtworkRecord>(() => newArtwork(profile));
  const fields: Array<[keyof ArtworkRecord, string]> = [
    ["title", tr(ui.artTitle, language)],
    ["background", tr(ui.background, language)],
    ["subject", tr(ui.subject, language)],
    ["frame", tr(ui.frame, language)],
    ["caption", tr(ui.caption, language)],
  ];

  const save = () => {
    const artwork = { ...draft, id: makeId("art"), title: draft.title.trim() || tr(ui.artTitle, language) };
    update({ ...profile, artwork: [...profile.artwork, artwork].slice(-60), stars: profile.stars + 2 });
    setDraft(newArtwork(profile));
    announce(`${artwork.title}: ${tr(ui.saveSuccess, language)}`);
  };

  return (
    <div className="fw-builder-layout">
      <article className={`fw-poster fw-poster--${draft.background.toLowerCase().replaceAll(" ", "-")}`} aria-label={draft.title}>
        <div className="fw-poster__frame">
          <small>{draft.title}</small>
          <div aria-hidden="true">🎨</div>
          <h2>{draft.subject}</h2>
          <p>{draft.caption}</p>
        </div>
      </article>
      <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={String(draft[key])}
              maxLength={key === "caption" ? 140 : 60}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
            />
          </label>
        ))}
        <button type="button" className="fw-primary" onClick={save}>🖼️ {tr(ui.saveArtwork, language)}</button>
      </section>
    </div>
  );
}

function storyDefaults(profile: LocalProfile, heroes: string[]): StoryRecord {
  if (profile.language === "es-MX") {
    return {
      id: makeId("story"),
      title: "El sendero brillante",
      hero: heroes[0] || "Nico",
      place: "el Bosque animal",
      problem: "una luz misteriosa desapareció",
      ending: "todos trabajaron juntos y la encontraron",
      language: "es-MX",
    };
  }
  return {
    id: makeId("story"),
    title: "The Bright Trail",
    hero: heroes[0] || "Nico",
    place: "Animal Forest",
    problem: "a mysterious light disappeared",
    ending: "everyone worked together and found it",
    language: "en",
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
  const [draft, setDraft] = useState<StoryRecord>(() => storyDefaults(profile, heroes));
  const text = draft.language === "es-MX"
    ? `${draft.hero} viajó a ${draft.place}. Allí, ${draft.problem}. Después de una gran aventura, ${draft.ending}.`
    : `${draft.hero} traveled to ${draft.place}. There, ${draft.problem}. After a great adventure, ${draft.ending}.`;

  const save = () => {
    const story = { ...draft, id: makeId("story"), title: draft.title.trim() || tr(ui.story, draft.language) };
    update({ ...profile, stories: [...profile.stories, story].slice(-60), stars: profile.stars + 2 });
    announce(`${story.title}: ${tr(ui.saveSuccess, language)}`);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = draft.language === "es-MX" ? "es-MX" : "en-US";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="fw-builder-layout">
      <article className="fw-story-page" aria-label={draft.title}>
        <small>{tr(ui.story, draft.language)}</small>
        <h2>{draft.title}</h2>
        <p>{text}</p>
        <button type="button" onClick={speak}>🔊 {tr(ui.readAloud, language)}</button>
      </article>
      <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
        <label>
          {tr(ui.language, language)}
          <select value={draft.language} onChange={(event) => setDraft({ ...storyDefaults({ ...profile, language: event.target.value as LocalProfile["language"] }, heroes), hero: draft.hero, language: event.target.value as LocalProfile["language"] })}>
            <option value="en">English</option>
            <option value="es-MX">Español de México</option>
          </select>
        </label>
        <label>{tr(ui.title, language)}<input value={draft.title} maxLength={60} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
        <label>
          {tr(ui.hero, language)}
          <select value={draft.hero} onChange={(event) => setDraft({ ...draft, hero: event.target.value })}>
            {heroes.map((hero) => <option key={hero}>{hero}</option>)}
          </select>
        </label>
        <label>{tr(ui.place, language)}<input value={draft.place} maxLength={80} onChange={(event) => setDraft({ ...draft, place: event.target.value })} /></label>
        <label>{tr(ui.problem, language)}<input value={draft.problem} maxLength={120} onChange={(event) => setDraft({ ...draft, problem: event.target.value })} /></label>
        <label>{tr(ui.ending, language)}<input value={draft.ending} maxLength={120} onChange={(event) => setDraft({ ...draft, ending: event.target.value })} /></label>
        <button type="button" className="fw-primary" onClick={save}>📚 {tr(ui.saveStory, language)}</button>
      </section>
    </div>
  );
}
