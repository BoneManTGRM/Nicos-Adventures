import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { AnimalRecord, Language, LocalProfile } from "../types";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { tr, ui } from "../i18n/core";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState } from "./common";
import { completeOnce, fieldMissionId, hasCompleted } from "./progression";
import { LocalWildlifeArt, type WildlifeMotion } from "./LocalWildlifeArt";
import "./animal-forest-premium.css";

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
  const [spotlightId, setSpotlightId] = useState(animals[0]?.id ?? "");
  const [wildlifeMotion, setWildlifeMotion] = useState<WildlifeMotion>("idle");
  const [motionKey, setMotionKey] = useState(0);
  const spotlightRef = useRef<HTMLElement>(null);
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
  const spotlightSource = animals.find((animal) => animal.id === spotlightId) ?? shown[0] ?? animals[0];
  const spotlightAnimal = spotlightSource ? localizeAnimalCompat(spotlightSource, language) : null;
  const discoveredHabitats = new Set(discoveredAnimals.map((animal) => animal.habitat)).size;
  const favoriteCount = animals.filter((animal) => animal.favorite).length;

  const openSpotlight = (animalId: string) => {
    setSpotlightId(animalId);
    setWildlifeMotion("idle");
    window.requestAnimationFrame(() => spotlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const cycleSpotlight = (direction: -1 | 1) => {
    const collection = shown.length ? shown : animals;
    const index = Math.max(0, collection.findIndex((animal) => animal.id === spotlightSource?.id));
    const next = collection[(index + direction + collection.length) % collection.length];
    if (next) setSpotlightId(next.id);
  };

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

  const playWildlifeMotion = (motion: WildlifeMotion) => {
    setWildlifeMotion(motion);
    setMotionKey((current) => current + 1);
    const labels: Record<WildlifeMotion, { en: string; "es-MX": string }> = {
      idle: { en: "ready", "es-MX": "lista" },
      walk: { en: "exploring", "es-MX": "explorando" },
      leap: { en: "leaping", "es-MX": "saltando" },
      celebrate: { en: "celebrating", "es-MX": "celebrando" },
      sleep: { en: "resting", "es-MX": "descansando" },
    };
    if (spotlightAnimal) announce(`${spotlightAnimal.name}: ${labels[motion][language]}`);
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
      {spotlightSource && spotlightAnimal && (
        <section className="animal-field-station" ref={spotlightRef} aria-labelledby="animal-field-station-title">
          <div className="animal-field-station__art">
            <LocalWildlifeArt key={`${spotlightSource.id}-${wildlifeMotion}-${motionKey}`} animal={spotlightSource} displayName={spotlightAnimal.name} language={language} motion={wildlifeMotion} />
            <span className="animal-field-station__status">{spotlightSource.discovered
              ? (language === "es-MX" ? "✓ EN TU GUÍA" : "✓ IN YOUR GUIDE")
              : (language === "es-MX" ? "NUEVO AVISTAMIENTO" : "NEW SIGHTING")}</span>
          </div>
          <div className="animal-field-station__copy">
            <small>{language === "es-MX" ? "ESTACIÓN DE OBSERVACIÓN" : "WILDLIFE SPOTLIGHT"}</small>
            <h2 id="animal-field-station-title">{spotlightAnimal.name}</h2>
            <div className="animal-field-station__meta">
              <span>🌿 {spotlightAnimal.habitat}</span>
              {spotlightAnimal.group && <span>🐾 {spotlightAnimal.group}</span>}
              {spotlightAnimal.region && <span>🗺️ {spotlightAnimal.region}</span>}
            </div>
            <p>{spotlightSource.discovered ? spotlightAnimal.fact : tr(ui.hiddenFact, language)}</p>
            {spotlightSource.discovered && spotlightAnimal.adaptation && (
              <div className="animal-field-station__adaptation"><strong>💡 {tr(ui.adaptation, language)}</strong><span>{spotlightAnimal.adaptation}</span></div>
            )}
            <div className="animal-field-station__movements" role="group" aria-label={language === "es-MX" ? "Movimientos del animal" : "Animal movements"}>
              {([
                ["walk", "🐾", language === "es-MX" ? "Explorar" : "Explore"],
                ["leap", "✨", language === "es-MX" ? "Saltar" : "Leap"],
                ["celebrate", "🎉", language === "es-MX" ? "Celebrar" : "Celebrate"],
                ["sleep", "🌙", language === "es-MX" ? "Descansar" : "Rest"],
              ] as Array<[WildlifeMotion, string, string]>).map(([value, icon, label]) => (
                <button type="button" className={wildlifeMotion === value ? "active" : ""} aria-pressed={wildlifeMotion === value} onClick={() => playWildlifeMotion(value)} key={value}>
                  <span aria-hidden="true">{icon}</span>{label}
                </button>
              ))}
            </div>
            <div className="animal-field-station__actions">
              <button type="button" onClick={() => cycleSpotlight(-1)} aria-label={language === "es-MX" ? "Animal anterior" : "Previous animal"}>←</button>
              <button type="button" className="animal-field-station__discover" onClick={() => discover(spotlightSource.id)} disabled={spotlightSource.discovered}>
                {spotlightSource.discovered ? `✅ ${tr(ui.inGuide, language)}` : `🔭 ${tr(ui.discover, language)}`}
              </button>
              <button type="button" onClick={() => toggleFavorite(spotlightSource.id)} aria-pressed={spotlightSource.favorite} aria-label={`${spotlightSource.favorite ? tr(ui.removeFavorite, language) : tr(ui.favorite, language)}: ${spotlightAnimal.name}`}>{spotlightSource.favorite ? "⭐" : "☆"}</button>
              <button type="button" onClick={() => cycleSpotlight(1)} aria-label={language === "es-MX" ? "Siguiente animal" : "Next animal"}>→</button>
            </div>
          </div>
        </section>
      )}

      <section className="animal-field-dashboard" aria-label={language === "es-MX" ? "Resumen de la guía de campo" : "Field guide summary"}>
        <div><span>🔭</span><strong>{discoveredAnimals.length}/{animals.length}</strong><small>{language === "es-MX" ? "Animales" : "Animals"}</small></div>
        <div><span>🗺️</span><strong>{discoveredHabitats}/{Math.max(1, habitats.length - 1)}</strong><small>{language === "es-MX" ? "Hábitats" : "Habitats"}</small></div>
        <div><span>⭐</span><strong>{favoriteCount}</strong><small>{language === "es-MX" ? "Favoritos" : "Favorites"}</small></div>
        <div><span>✨</span><strong>{profile.stars}</strong><small>{language === "es-MX" ? "Estrellas" : "Stars"}</small></div>
      </section>

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

      <section className="animal-guide-heading" aria-labelledby="animal-guide-heading-title">
        <div><small>{language === "es-MX" ? "32 ANIMALES · 9 HÁBITATS" : "32 ANIMALS · 9 HABITATS"}</small><h2 id="animal-guide-heading-title">{language === "es-MX" ? "Colección de campo" : "Wildlife Collection"}</h2><p>{language === "es-MX" ? "Cada retrato abre una escena de hábitat completa en la estación de observación." : "Every portrait opens a complete habitat scene in the wildlife spotlight."}</p></div>
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
      </section>
      {!shown.length ? <EmptyState emoji="🔎">{tr(ui.noAnimalResults, language)}</EmptyState> : (
        <div className="fw-card-grid animal-field-guide-grid">
          {shown.map((sourceAnimal) => {
            const animal = localizeAnimalCompat(sourceAnimal, language);
            return (
              <article className={`fw-creature-card animal-card-v2 ${sourceAnimal.discovered ? "is-discovered" : ""}`} key={sourceAnimal.id}>
                <WildlifePortrait animal={sourceAnimal} displayName={animal.name} language={language} />
                <div className="animal-copy">
                  <div className="animal-card-v2__heading"><h3>{animal.name}</h3><span>{sourceAnimal.favorite ? "⭐" : sourceAnimal.discovered ? "✓" : "NEW"}</span></div>
                  <div className="animal-meta">
                    <span>{animal.habitat}</span>
                    {animal.group && <span>{animal.group}</span>}
                    {animal.region && <span>{animal.region}</span>}
                  </div>
                  <p>{sourceAnimal.discovered ? animal.fact : (language === "es-MX" ? "Abre esta escena y completa el avistamiento." : "Open this scene and complete the sighting.")}</p>
                  <div className="fw-action-row">
                    <button type="button" className="animal-open-spotlight" onClick={() => openSpotlight(sourceAnimal.id)}>
                      {language === "es-MX" ? "🔎 Abrir escena" : "🔎 Open scene"}
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
