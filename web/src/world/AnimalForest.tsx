import { useEffect, useMemo, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { AnimalRecord, Language, LocalProfile } from "../types";
import { localizeAnimal } from "../i18n/animals";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState } from "./common";

const photoCache = new Map<string, string>();

function WildlifePhoto({ animal, language }: { animal: AnimalRecord; language: Language }) {
  const cacheKey = animal.imageTitle || animal.name;
  const [url, setUrl] = useState(() => photoCache.get(cacheKey) ?? "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (url || failed) return;
    const title = encodeURIComponent(animal.imageTitle || animal.name);
    const controller = new AbortController();
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Photo unavailable")))
      .then((data: { thumbnail?: { source?: string }; originalimage?: { source?: string } }) => {
        const next = data.originalimage?.source || data.thumbnail?.source || "";
        if (!next) throw new Error("Photo unavailable");
        photoCache.set(cacheKey, next);
        setUrl(next);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });
    return () => controller.abort();
  }, [animal.imageTitle, animal.name, cacheKey, failed, url]);

  if (!url) {
    return (
      <div className="real-animal-photo real-animal-photo--fallback" role="img" aria-label={animal.name}>
        <span aria-hidden="true">{animal.emoji}</span>
        <small>{failed ? tr(ui.photoUnavailable, language) : tr(ui.photoLoading, language)}</small>
      </div>
    );
  }

  return (
    <figure className="real-animal-photo">
      <img src={url} alt={animal.name} loading="lazy" onError={() => setFailed(true)} />
      <figcaption>{animal.name} · Wikipedia/Wikimedia</figcaption>
    </figure>
  );
}

export function AnimalForest({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const animals = useMemo(() => mergeAnimalLibrary(profile.animals), [profile.animals]);
  const [habitat, setHabitat] = useState("All");
  const [query, setQuery] = useState("");
  const habitats = useMemo(() => ["All", ...new Set(animals.map((animal) => animal.habitat))], [animals]);
  const shown = useMemo(() => animals.filter((animal) => {
    const localized = localizeAnimal(animal, language);
    const matchesHabitat = habitat === "All" || animal.habitat === habitat;
    const normalized = query.trim().toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US");
    const matchesQuery = !normalized || `${animal.name} ${localized.name}`.toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US").includes(normalized);
    return matchesHabitat && matchesQuery;
  }), [animals, habitat, language, query]);

  const toggle = (animalId: string, field: "discovered" | "favorite") => {
    const animal = animals.find((item) => item.id === animalId);
    if (!animal) return;
    const updated = animals.map((item) => item.id === animalId ? { ...item, [field]: !item[field] } : item);
    const newlyDiscovered = field === "discovered" && !animal.discovered;
    update({ ...profile, animals: updated, stars: newlyDiscovered ? profile.stars + 1 : profile.stars });
    const localized = localizeAnimal(animal, language);
    announce(field === "discovered"
      ? `${localized.name}: ${newlyDiscovered ? tr(ui.inGuide, language) : tr(ui.discover, language)}`
      : `${localized.name}: ${animal.favorite ? tr(ui.removeFavorite, language) : tr(ui.favorite, language)}`);
  };

  return (
    <>
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
      <div className="fw-filter-row" role="group" aria-label={language === "es-MX" ? "Filtrar por hábitat" : "Filter by habitat"}>
        {habitats.map((item) => (
          <button
            type="button"
            className={item === habitat ? "active" : ""}
            aria-pressed={item === habitat}
            key={item}
            onClick={() => setHabitat(item)}
          >
            {item === "All" ? tr(ui.allHabitats, language) : optionLabel(item, language)}
          </button>
        ))}
      </div>
      <p className="photo-credit-note">{tr(ui.photoCredit, language)}</p>
      {!shown.length ? <EmptyState emoji="🔎">{tr(ui.noAnimalResults, language)}</EmptyState> : (
        <div className="fw-card-grid">
          {shown.map((sourceAnimal) => {
            const animal = localizeAnimal(sourceAnimal, language);
            return (
              <article className={`fw-creature-card animal-card-v2 ${sourceAnimal.discovered ? "is-discovered" : ""}`} key={sourceAnimal.id}>
                <WildlifePhoto animal={{ ...sourceAnimal, name: animal.name }} language={language} />
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
                    <button type="button" onClick={() => toggle(sourceAnimal.id, "discovered")}>
                      {sourceAnimal.discovered ? `✅ ${tr(ui.inGuide, language)}` : `🔭 ${tr(ui.discover, language)}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(sourceAnimal.id, "favorite")}
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
