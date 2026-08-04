import { mergeAnimalLibrary } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, SectionId } from "../types";
import { tr, ui } from "../i18n/core";
import { WORLD_SECTIONS } from "./catalogs";

export function WorldMap({ profile, open }: { profile: LocalProfile; open: (id: SectionId) => void }) {
  const language = profile.language;
  const discovered = mergeAnimalLibrary(profile.animals).filter((animal) => animal.discovered).length;
  return (
    <div className="fw-grid fw-grid--map">
      <article className="fw-hero-card" aria-label={language === "es-MX" ? "Equipo de aventura" : "Adventure team"}>
        <RobotStage
          robot={profile.robot}
          statusLabel={tr(ui.ready, language)}
          levelLabel={tr(ui.levelShort, language)}
        />
        <div className="fw-stat-row" aria-label={language === "es-MX" ? "Progreso del jugador" : "Player progress"}>
          <span aria-label={`${profile.stars} ${tr(ui.stars, language)}`}>⭐ {profile.stars}</span>
          <span aria-label={`${profile.robots.length} ${tr(ui.robots, language)}`}>🤖 {profile.robots.length}</span>
          <span aria-label={`${discovered} ${tr(ui.animals, language)}`}>🐾 {discovered}</span>
          <span aria-label={`${profile.monsters.length} ${tr(ui.monsters, language)}`}>👾 {profile.monsters.length}</span>
        </div>
      </article>
      <section className="fw-destination-grid" aria-label={tr(ui.mainNavigation, language)}>
        {WORLD_SECTIONS.filter((section) => section.id !== "world-map").map((section) => (
          <button
            type="button"
            className="fw-destination"
            key={section.id}
            onClick={() => open(section.id)}
            aria-label={`${tr(section.name, language)}. ${tr(section.description, language)}`}
          >
            <span aria-hidden="true">{section.emoji}</span>
            <strong>{tr(section.name, language)}</strong>
            <small>{tr(section.description, language)}</small>
          </button>
        ))}
      </section>
    </div>
  );
}
