import { useRef, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import { createProfile, exportProfile, importProfile } from "../storage";
import type { Language, LocalProfile, LocalSaveStore } from "../types";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { tr, ui, type Localized } from "../i18n/core";
import { fossilLabel } from "../i18n/display";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState } from "./common";

type CollectionGroup = {
  emoji: string;
  title: Localized;
  items: string[];
};

export function Museum({ profile }: { profile: LocalProfile }) {
  const language = profile.language;
  const groups: CollectionGroup[] = [
    { emoji: "🤖", title: ui.robots, items: profile.robots.map((item) => item.name) },
    { emoji: "🐾", title: ui.animals, items: mergeAnimalLibrary(profile.animals).filter((item) => item.discovered).map((item) => localizeAnimalCompat(item, language).name) },
    { emoji: "👾", title: ui.monsters, items: profile.monsters.map((item) => item.name) },
    { emoji: "🐕", title: ui.pets, items: profile.pets.map((item) => item.name) },
    { emoji: "🎨", title: ui.artwork, items: profile.artwork.map((item) => item.title) },
    { emoji: "📚", title: ui.stories, items: profile.stories.map((item) => item.title) },
    { emoji: "🦖", title: ui.dinosaurs, items: profile.dinosaurs.filter((item) => item.discovered).map((item) => item.name) },
    { emoji: "🦴", title: ui.fossils, items: profile.fossils.map((item) => fossilLabel(item, language)) },
  ];
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (!total) return <EmptyState emoji="🏛️">{tr(ui.emptyCollection, language)}</EmptyState>;

  return (
    <div className="fw-card-grid">
      {groups.map((group) => (
        <article className="fw-memory-card" key={group.title.en}>
          <div aria-hidden="true">{group.emoji}</div>
          <h3>{tr(group.title, language)}</h3>
          <strong aria-label={`${group.items.length} ${tr(group.title, language)}`}>{group.items.length}</strong>
          {group.items.length ? <ul>{group.items.slice(-8).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>{tr(ui.emptyCollection, language)}</p>}
        </article>
      ))}
    </div>
  );
}

type BadgeDefinition = {
  earned: boolean;
  emoji: string;
  name: Localized;
  requirement: Localized;
};

export function Badges({ profile }: { profile: LocalProfile }) {
  const language = profile.language;
  const badges: BadgeDefinition[] = [
    { earned: profile.stars >= 5, emoji: "⭐", name: { en: "Star Starter", "es-MX": "Inicio estelar" }, requirement: { en: "Earn 5 stars", "es-MX": "Gana 5 estrellas" } },
    { earned: profile.robots.length >= 2, emoji: "🤖", name: { en: "Robot Engineer", "es-MX": "Ingeniero robot" }, requirement: { en: "Save 2 robots", "es-MX": "Guarda 2 robots" } },
    { earned: mergeAnimalLibrary(profile.animals).filter((item) => item.discovered).length >= 5, emoji: "🐾", name: { en: "Wildlife Explorer", "es-MX": "Explorador de fauna" }, requirement: { en: "Discover 5 animals", "es-MX": "Descubre 5 animales" } },
    { earned: profile.monsters.length >= 1, emoji: "👾", name: { en: "Monster Maker", "es-MX": "Creador de monstruos" }, requirement: { en: "Create a monster", "es-MX": "Crea un monstruo" } },
    { earned: profile.pets.length >= 1, emoji: "🐕", name: { en: "Pet Partner", "es-MX": "Compañero de mascotas" }, requirement: { en: "Build a robot pet", "es-MX": "Construye una mascota robot" } },
    { earned: profile.artwork.length >= 1, emoji: "🎨", name: { en: "Young Artist", "es-MX": "Joven artista" }, requirement: { en: "Save artwork", "es-MX": "Guarda una obra" } },
    { earned: profile.stories.length >= 1, emoji: "📚", name: { en: "Story Builder", "es-MX": "Creador de cuentos" }, requirement: { en: "Save a story", "es-MX": "Guarda un cuento" } },
    { earned: profile.fossils.length >= 3, emoji: "🦴", name: { en: "Fossil Hunter", "es-MX": "Cazador de fósiles" }, requirement: { en: "Recover 3 fossils", "es-MX": "Recupera 3 fósiles" } },
    { earned: profile.badges.includes("showtime-director") || profile.movieProjects.length >= 1, emoji: "🎬", name: { en: "Movie Director", "es-MX": "Director de cine" }, requirement: { en: "Make a Showtime movie", "es-MX": "Crea una película Showtime" } },
  ];

  return (
    <div className="fw-badge-grid">
      {badges.map((badge) => (
        <article className={badge.earned ? "earned" : "locked"} key={badge.name.en}>
          <span aria-hidden="true">{badge.earned ? badge.emoji : "🔒"}</span>
          <h3>{tr(badge.name, language)}</h3>
          <p>{badge.earned ? tr(ui.unlocked, language) : tr(badge.requirement, language)}</p>
        </article>
      ))}
    </div>
  );
}

export function Settings({
  store,
  profile,
  setStore,
  update,
  announce,
}: {
  store: LocalSaveStore;
  profile: LocalProfile;
  setStore: (store: LocalSaveStore) => void;
  update: UpdateProfile;
  announce: Announce;
}) {
  const language = profile.language;
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportProfile(profile)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nicos-world-${profile.playerName.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "profile"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(tr(ui.backup, language));
    announce(language === "es-MX" ? "Respaldo descargado." : "Backup downloaded.");
  };

  const addProfile = () => {
    if (!name.trim()) return;
    const next = createProfile(name, language);
    setStore({ ...store, activeProfileId: next.id, profiles: [...store.profiles, next].slice(-12) });
    setName("");
    setStatus(language === "es-MX" ? "Perfil agregado." : "Profile added.");
    announce(language === "es-MX" ? `${next.playerName}: perfil agregado.` : `${next.playerName}: profile added.`);
  };

  const restore = async (file: File) => {
    try {
      const imported = importProfile(await file.text());
      setStore({ ...store, activeProfileId: imported.id, profiles: [...store.profiles, imported].slice(-12) });
      setStatus(tr(ui.restoreSuccess, language));
      announce(tr(ui.restoreSuccess, language));
    } catch {
      setStatus(tr(ui.restoreError, language));
      announce(tr(ui.restoreError, language));
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="fw-settings-grid">
      <article className="fw-panel">
        <h2>{tr(ui.language, language)}</h2>
        <label>
          {tr(ui.language, language)}
          <select
            value={language}
            onChange={(event) => {
              update({ ...profile, language: event.target.value as Language });
              announce(tr(ui.changedLanguage, event.target.value as Language));
            }}
          >
            <option value="en">English</option>
            <option value="es-MX">Español de México</option>
          </select>
        </label>

        <h2>{tr(ui.profiles, language)}</h2>
        <label>
          {tr(ui.activeProfile, language)}
          <select value={profile.id} onChange={(event) => setStore({ ...store, activeProfileId: event.target.value })}>
            {store.profiles.map((item) => <option key={item.id} value={item.id}>{item.playerName}</option>)}
          </select>
        </label>
        <div className="fw-action-row">
          <label className="fw-grow-field">
            {tr(ui.friendsName, language)}
            <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} />
          </label>
          <button type="button" onClick={addProfile} disabled={!name.trim()}>＋ {tr(ui.addProfile, language)}</button>
        </div>
      </article>

      <article className="fw-panel">
        <h2>{tr(ui.privateSave, language)}</h2>
        <p>{tr(ui.localSaveBody, language)}</p>
        <div className="fw-action-row">
          <button type="button" onClick={download}>⬇️ {tr(ui.backup, language)}</button>
          <button type="button" onClick={() => fileInput.current?.click()}>⬆️ {tr(ui.restore, language)}</button>
        </div>
        <input
          hidden
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void restore(file);
          }}
        />
        {status && <p role="status" className="fw-inline-status">{status}</p>}
      </article>
    </div>
  );
}
