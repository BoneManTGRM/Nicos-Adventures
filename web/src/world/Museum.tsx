import { useMemo, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { fossilLabel, optionLabel } from "../i18n/display";
import { STAR_BRIDGE_ENGINEER } from "../game/goldenAdventure";
import type { LocalProfile } from "../types";
import { openNicoWorld } from "../nico/NicoWorldExperience";
import { EmptyState } from "./common";
import { storyPages } from "./storyBook";

export type MemoryCategory = "all" | "achievement" | "robot" | "animal" | "monster" | "pet" | "artwork" | "story" | "dinosaur" | "fossil" | "movie";

type MemoryEntry = {
  id: string;
  category: Exclude<MemoryCategory, "all">;
  emoji: string;
  title: string;
  subtitle: string;
  details: string;
  movieProjectId?: string;
};

const categoryCopy: Record<MemoryCategory, { en: string; "es-MX": string; emoji: string }> = {
  all: { en: "All memories", "es-MX": "Todos los recuerdos", emoji: "✨" },
  achievement: { en: "Achievements", "es-MX": "Logros", emoji: "🏅" },
  robot: { en: "Robots", "es-MX": "Robots", emoji: "🤖" },
  animal: { en: "Animals", "es-MX": "Animales", emoji: "🐾" },
  monster: { en: "Monsters", "es-MX": "Monstruos", emoji: "👾" },
  pet: { en: "Pets", "es-MX": "Mascotas", emoji: "🐕" },
  artwork: { en: "Artwork", "es-MX": "Arte", emoji: "🎨" },
  story: { en: "Stories", "es-MX": "Cuentos", emoji: "📚" },
  dinosaur: { en: "Dinosaurs", "es-MX": "Dinosaurios", emoji: "🦖" },
  fossil: { en: "Fossils", "es-MX": "Fósiles", emoji: "🦴" },
  movie: { en: "Movies", "es-MX": "Películas", emoji: "🎬" },
};

export function buildMemoryEntries(profile: LocalProfile): MemoryEntry[] {
  const language = profile.language;
  const entries: MemoryEntry[] = [];
  if (profile.adventures.starBridge.museumAchievements.includes(STAR_BRIDGE_ENGINEER)) {
    entries.push({
      id: `achievement:${STAR_BRIDGE_ENGINEER}`,
      category: "achievement",
      emoji: "🌉",
      title: language === "es-MX" ? "Ingeniero del Puente Estelar" : "Star Bridge Engineer",
      subtitle: language === "es-MX" ? "Aventura dorada completada" : "Golden Adventure complete",
      details: language === "es-MX"
        ? "Nico y BoltBot restauraron el Núcleo Estelar y reabrieron la ruta al Valle de Dinosaurios."
        : "Nico and BoltBot restored the Star Core and reopened the route to Dinosaur Valley.",
    });
  }
  for (const robot of profile.robots) entries.push({ id: `robot:${robot.id}`, category: "robot", emoji: "🤖", title: robot.name, subtitle: `${optionLabel(robot.personality, language)} · ${language === "es-MX" ? "Nivel" : "Level"} ${robot.level}`, details: `${optionLabel(robot.head, language)}, ${optionLabel(robot.body, language)}, ${optionLabel(robot.power, language)}` });
  for (const animal of mergeAnimalLibrary(profile.animals).filter((item) => item.discovered)) {
    const localized = localizeAnimalCompat(animal, language);
    entries.push({ id: `animal:${animal.id}`, category: "animal", emoji: animal.emoji, title: localized.name, subtitle: `${localized.habitat}${localized.region ? ` · ${localized.region}` : ""}`, details: localized.fact });
  }
  for (const monster of profile.monsters) entries.push({ id: `monster:${monster.id}`, category: "monster", emoji: "👾", title: monster.name, subtitle: `${optionLabel(monster.body, language)} · ${optionLabel(monster.habitat, language)}`, details: `${optionLabel(monster.personality, language)} · ${language === "es-MX" ? "Amistad" : "Friendship"} ${monster.friendship}/100` });
  for (const pet of profile.pets) entries.push({ id: `pet:${pet.id}`, category: "pet", emoji: "🐕", title: pet.name, subtitle: `${optionLabel(pet.species, language)} · ${optionLabel(pet.personality, language)}`, details: `${language === "es-MX" ? "Vínculo" : "Bond"} ${pet.bond}/100 · ${pet.tricks.length} ${language === "es-MX" ? "trucos" : "tricks"}` });
  for (const artwork of profile.artwork) entries.push({ id: `artwork:${artwork.id}`, category: "artwork", emoji: "🖼️", title: artwork.title, subtitle: artwork.subject, details: artwork.caption });
  for (const story of profile.stories) entries.push({ id: `story:${story.id}`, category: "story", emoji: "📖", title: story.title, subtitle: `${story.hero} · ${storyPages(story).length} ${story.language === "es-MX" ? "páginas" : "pages"}`, details: storyPages(story).join(" ") });
  for (const dinosaur of profile.dinosaurs.filter((item) => item.discovered)) entries.push({ id: `dinosaur:${dinosaur.id}`, category: "dinosaur", emoji: dinosaur.emoji, title: dinosaur.name, subtitle: optionLabel(dinosaur.period, language), details: language === "es-MX" ? "Entrada desbloqueada en la guía de campo." : "Field-guide entry unlocked." });
  profile.fossils.forEach((fossil, index) => entries.push({ id: `fossil:${index}:${fossil}`, category: "fossil", emoji: "🦴", title: fossilLabel(fossil, language), subtitle: language === "es-MX" ? "Colección de fósiles" : "Fossil collection", details: language === "es-MX" ? "Recuperado durante una expedición." : "Recovered during an expedition." }));
  for (const project of profile.movieProjects) entries.push({ id: `movie:${project.id}`, category: "movie", emoji: "🎬", title: project.title, subtitle: `${project.durationMs / 1000}s · ${project.characters.length} ${language === "es-MX" ? "personajes" : "characters"}`, details: project.caption || (language === "es-MX" ? "Proyecto de película local" : "Local movie project"), movieProjectId: project.id });
  return entries;
}

export function Museum({ profile }: { profile: LocalProfile }) {
  const language = profile.language;
  const entries = useMemo(() => buildMemoryEntries(profile), [profile]);
  const [category, setCategory] = useState<MemoryCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US");
    return entries.filter((entry) => {
      const categoryMatch = category === "all" || entry.category === category;
      const queryMatch = !normalized || `${entry.title} ${entry.subtitle} ${entry.details}`.toLocaleLowerCase(language === "es-MX" ? "es-MX" : "en-US").includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, entries, language, query]);
  const selected = entries.find((entry) => entry.id === selectedId) ?? filtered[0] ?? null;
  const discoveredAnimals = mergeAnimalLibrary(profile.animals).filter((item) => item.discovered).length;
  const summary = [
    { emoji: "🤖", value: profile.robots.length, label: categoryCopy.robot[language] },
    { emoji: "🐾", value: discoveredAnimals, label: categoryCopy.animal[language] },
    { emoji: "👾", value: profile.monsters.length, label: categoryCopy.monster[language] },
    { emoji: "🎨", value: profile.artwork.length + profile.stories.length, label: language === "es-MX" ? "Creaciones" : "Creations" },
    { emoji: "🎬", value: profile.movieProjects.length, label: categoryCopy.movie[language] },
  ];

  return (
    <div className="memory-system-layout">
      <section className="memory-summary" aria-label={language === "es-MX" ? "Resumen de recuerdos" : "Memory summary"}>
        {summary.map((item) => <article key={item.label}><span aria-hidden="true">{item.emoji}</span><strong>{item.value}</strong><small>{item.label}</small></article>)}
      </section>

      <section className="memory-browser" aria-labelledby="memory-browser-heading">
        <header>
          <div><small>{entries.length} {language === "es-MX" ? "recuerdos locales" : "local memories"}</small><h2 id="memory-browser-heading">{language === "es-MX" ? "Explorar el museo" : "Explore the museum"}</h2></div>
          <label className="memory-search"><span className="sr-only">{language === "es-MX" ? "Buscar recuerdos" : "Search memories"}</span><input type="search" value={query} placeholder={language === "es-MX" ? "Buscar recuerdos…" : "Search memories…"} onChange={(event) => setQuery(event.target.value)} /></label>
        </header>
        <div className="memory-category-row" role="group" aria-label={language === "es-MX" ? "Categorías de recuerdos" : "Memory categories"}>
          {(Object.keys(categoryCopy) as MemoryCategory[]).map((item) => {
            const count = item === "all" ? entries.length : entries.filter((entry) => entry.category === item).length;
            return <button type="button" key={item} aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{categoryCopy[item].emoji} {categoryCopy[item][language]} <small>{count}</small></button>;
          })}
        </div>

        {!filtered.length ? <EmptyState emoji="🔎">{language === "es-MX" ? "Ningún recuerdo coincide con esta búsqueda." : "No memories match this search."}</EmptyState> : (
          <div className="memory-entry-grid">
            {filtered.map((entry) => <button type="button" className={selected?.id === entry.id ? "selected" : ""} aria-pressed={selected?.id === entry.id} key={entry.id} onClick={() => setSelectedId(entry.id)}><span aria-hidden="true">{entry.emoji}</span><div><strong>{entry.title}</strong><small>{entry.subtitle}</small></div></button>)}
          </div>
        )}
      </section>

      <aside className="memory-detail-panel" aria-live="polite">
        {selected ? (
          <>
            <span aria-hidden="true">{selected.emoji}</span>
            <small>{categoryCopy[selected.category][language]}</small>
            <h2>{selected.title}</h2>
            <p>{selected.subtitle}</p>
            <div>{selected.details}</div>
            {selected.movieProjectId && <button type="button" className="fw-primary" onClick={() => openNicoWorld("showtime", selected.movieProjectId)}>{language === "es-MX" ? "Recrear película" : "Recreate movie"} →</button>}
          </>
        ) : <EmptyState emoji="🏛️">{language === "es-MX" ? "Crea y descubre elementos para llenar el museo." : "Create and discover items to fill the museum."}</EmptyState>}
      </aside>
    </div>
  );
}
