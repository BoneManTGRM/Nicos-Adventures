import { lazy, Suspense, useMemo, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { AnimalRecord, Language, LocalProfile } from "../types";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { tr, ui } from "../i18n/core";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState } from "./common";
import { completeOnce, fieldMissionId, hasCompleted } from "./progression";
import { LocalWildlifeArt } from "./LocalWildlifeArt";

const AnimalGeneratorGame = lazy(() => import("./AnimalGeneratorGame").then((module) => ({ default: module.AnimalGeneratorGame })));

const AnimalForestTrail = lazy(() => import("./AnimalForestTrail").then((module) => ({
  default: module.AnimalForestTrail,
})));

type FieldMission = {
  id: string;
  emoji: string;
  title: { en: string; "es-MX": string };
  current: number;
  target: number;
  reward: number;
};

function WildlifePortrait({ animal, displayName, language }: { animal: AnimalRecord; displayName: string; language: Language }) {
  return (
    <figure className="real-animal-photo">
      <LocalWildlifeArt animal={animal} displayName={displayName} language={language} />
      <figcaption>{displayName} · {language === "es-MX" ? "ilustración privada local" : "private local illustration"}</figcaption>
    </figure>
  );
}

export function AnimalForest({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const animals = useMemo(() => mergeAnimalLibrary(profile.animals), [profile.animals]);
  const [habitat, setHabitat] = useState("All");
  const [query, setQuery] = useState("");
  const habitats = useMemo(() => ["All", ...new Set(animals.map((animal) => animal.habitat))], [animals]);
  const discoveredAnimals = useMemo(() => animals.filter((animal) => animal.discovered), [animals]);
  const fieldMissions = useMemo<FieldMission[]>(() => [
    {
      id: "three-animals",
      emoji: "🔭",
      title: { en: "Discover 3 animals", "es-MX": "Descubre 3 animales" },
      current: discoveredAnimals.length,
      target: 3,
      reward: 2,
    },
    {
      id: "three-habitats",
      emoji: "🗺️",
      title: { en: "Explore 3 habitats", "es-MX": "Explora 3 hábitats" },
      current: new Set(discoveredAnimals.map((animal) => animal.habitat)).size,
      target: 3,
      reward: 2,
    },
    {
      id: "three-favorites",
      emoji: "⭐",
      title: { en: "Choose 3 favorites", "es-MX": "Elige 3 favoritos" },
      current: animals.filter((animal) => animal.favorite).length,
      target: 3,
      reward: 1,
    },
    {
      id: "ten-animals",
      emoji: "🏅",
      title: { en: "Build a 10-animal field guide", "es-MX": "Crea una guía de 10 animales" },
      current: discoveredAnimals.length,
      target: 10,
      reward: 3,
    },
  ], [animals, discoveredAnimals]);
  const shown = useMemo(() => animals.filter((animal) => {
    const localized = localizeAnimalCompat(animal, language);
    const matchesHabitat = habitat === "All" || animal.habitat === habitat;
    const normalized = query.trim().toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US");
    const matchesQuery = !normalized || `${animal.name} ${localized.name}`.toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US").includes(normalized);
    return matchesHabitat && matchesQuery;
  }), [animals, habitat, language, query]);

  const discover = (animalId: string) => {
    const animal = animals.find((item) => item.id === animalId);
    if (!animal || animal.discovered) return;
    const updated = animals.map((item) => item.id === animalId ? { ...item, discovered: true } : item);
    update({ ...profile, animals: updated, stars: profile.stars + 1 });
    announce(`${localizeAnimalCompat(animal, language).name}: ${tr(ui.inGuide, language)}`);
  };

  const toggleFavorite = (animalId: string) => {
    const animal = animals.find((item) => item.id === animalId);
    if (!animal) return;
    const updated = animals.map((item) => item.id === animalId ? { ...item, favorite: !item.favorite } : item);
    update({ ...profile, animals: updated });
    const localized = localizeAnimalCompat(animal, language);
    announce(`${localized.name}: ${animal.favorite ? tr(ui.removeFavorite, language) : tr(ui.favorite, language)}`);
  };

  const claimMission = (mission: FieldMission) => {
    const missionId = fieldMissionId(mission.id);
    if (mission.current < mission.target || hasCompleted(profile, missionId)) return;
    const completion = completeOnce(profile, missionId, mission.reward);
    update(completion.profile);
    announce(language === "es-MX"
      ? `Misión completada: ${mission.title[language]}. Ganaste ${mission.reward} estrellas.`
      : `Mission completed: ${mission.title[language]}. You earned ${mission.reward} stars.`);
  };

  return (
    <>
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Haciendo crecer el Bosque animal…" : "Growing the Animal Forest…"}</div>}>
        <AnimalForestTrail
          language={language}
          habitat={habitat}
          habitats={habitats}
          discovered={discoveredAnimals.length}
          total={animals.length}
          select={setHabitat}
        />
      </Suspense>
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando el generador de animales…" : "Preparing the animal generator…"}</div>}>
        <AnimalGeneratorGame animals={animals} language={language} onGenerated={discover} announce={announce} />
      </Suspense>
      <section className="field-mission-panel" aria-labelledby="field-missions-heading">
        <header>
          <div>
            <small>{language === "es-MX" ? "Progreso de exploración" : "Exploration progress"}</small>
            <h2 id="field-missions-heading">{language === "es-MX" ? "Misiones de campo" : "Field missions"}</h2>
          </div>
          <strong>{discoveredAnimals.length}/{animals.length}</strong>
        </header>
        <div className="field-mission-grid">
          {fieldMissions.map((mission) => {
            const completed = hasCompleted(profile, fieldMissionId(mission.id));
            const ready = mission.current >= mission.target;
            return (
              <article className={`${completed ? "completed" : ready ? "ready" : ""}`.trim()} key={mission.id}>
                <span aria-hidden="true">{mission.emoji}</span>
                <div>
                  <h3>{mission.title[language]}</h3>
                  <progress max={mission.target} value={Math.min(mission.target, mission.current)}>{mission.current}/{mission.target}</progress>
                  <small>{Math.min(mission.current, mission.target)}/{mission.target} · ⭐ {mission.reward}</small>
                </div>
                <button type="button" onClick={() => claimMission(mission)} disabled={!ready || completed}>
                  {completed
                    ? (language === "es-MX" ? "Completada" : "Completed")
                    : ready
                      ? (language === "es-MX" ? "Reclamar" : "Claim")
                      : (language === "es-MX" ? "En progreso" : "In progress")}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <div className="field-guide-tools">
        <label className="sr-only" htmlFor="animal-search">{tr(ui.searchAnimals, language)}</label>
        <input
          id="animal-search"
          type="search"
          placeholder={`${tr(ui.searchAnimals, language)}…`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p className="photo-credit-note">{language === "es-MX"
        ? "Todas las ilustraciones de animales son locales y privadas. No se solicita contenido a servicios externos."
        : "Every animal illustration is private and local. No content is requested from external services."}</p>
      {!shown.length ? <EmptyState emoji="🔎">{tr(ui.noAnimalResults, language)}</EmptyState> : (
        <div className="fw-card-grid">
          {shown.map((sourceAnimal) => {
            const animal = localizeAnimalCompat(sourceAnimal, language);
            return (
              <article className={`fw-creature-card animal-card-v2 ${sourceAnimal.discovered ? "is-discovered" : ""}`} key={sourceAnimal.id}>
                <WildlifePortrait animal={sourceAnimal} displayName={animal.name} language={language} />
                <div className="animal-copy">
                  <h3>{animal.name}</h3>
                  <div className="animal-meta">
                    <span>{animal.habitat}</span>
                    {animal.group && <span>{animal.group}</span>}
                    {animal.region && <span>{animal.region}</span>}
                  </div>
                  <p>{sourceAnimal.discovered ? animal.fact : tr(ui.hiddenFact, language)}</p>
                  {sourceAnimal.discovered && animal.adaptation && <small><b>{tr(ui.adaptation, language)}:</b> {animal.adaptation}</small>}
                  <div className="fw-action-row">
                    <button type="button" onClick={() => discover(sourceAnimal.id)} disabled={sourceAnimal.discovered}>
                      {sourceAnimal.discovered ? `✅ ${tr(ui.inGuide, language)}` : `🔭 ${tr(ui.discover, language)}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(sourceAnimal.id)}
                      aria-label={`${sourceAnimal.favorite ? tr(ui.removeFavorite, language) : tr(ui.favorite, language)}: ${animal.name}`}
                      aria-pressed={sourceAnimal.favorite}
                    >
                      {sourceAnimal.favorite ? "⭐" : "☆"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
