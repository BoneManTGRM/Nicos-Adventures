import { lazy, Suspense, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { StarBridgeEvent } from "../game/goldenAdventure";
import { hasDinosaurValleyAccess } from "../game/starBridgeRepair";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, SectionId } from "../types";
import { tr, ui } from "../i18n/core";
import { WORLD_SECTIONS } from "./catalogs";
import { StarBridgeMap } from "./StarBridgeMap";

const BrokenStarBridge = lazy(() => import("./BrokenStarBridge").then((module) => ({
  default: module.BrokenStarBridge,
})));
const LivingWorldAtlas = lazy(() => import("./LivingWorldAtlas").then((module) => ({
  default: module.LivingWorldAtlas,
})));

export function WorldMap({
  profile,
  open,
  beginStarBridge,
  advanceStarBridge,
}: {
  profile: LocalProfile;
  open: (id: SectionId) => void;
  beginStarBridge: () => void;
  advanceStarBridge: (event: StarBridgeEvent) => void;
}) {
  const language = profile.language;
  const [bridgeOpen, setBridgeOpen] = useState(false);
  const discovered = mergeAnimalLibrary(profile.animals).filter((animal) => animal.discovered).length;
  const dinosaurValleyAvailable = hasDinosaurValleyAccess(profile);
  if (bridgeOpen) {
    return (
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando el Puente Estelar…" : "Preparing the Star Bridge…"}</div>}>
        <BrokenStarBridge
          state={profile.adventures.starBridge}
          robot={profile.robot}
          language={language}
          advance={advanceStarBridge}
          close={() => setBridgeOpen(false)}
        />
      </Suspense>
    );
  }
  return (
    <div className="fw-grid fw-grid--map">
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Despertando el Mundo de Nico…" : "Waking up Nico's World…"}</div>}>
        <LivingWorldAtlas language={language} dinosaurValleyAvailable={dinosaurValleyAvailable} open={open} />
      </Suspense>
      <StarBridgeMap
        state={profile.adventures.starBridge}
        language={language}
        begin={beginStarBridge}
        openRoboLab={() => open("robo-lab")}
        openBridge={() => setBridgeOpen(true)}
        openDinosaurValley={() => open("dinosaur-valley")}
      />
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
        {WORLD_SECTIONS.filter((section) => section.id !== "world-map").map((section) => {
          const locked = section.id === "dinosaur-valley" && !dinosaurValleyAvailable;
          const lockCopy = language === "es-MX" ? "Completa El Puente Estelar Roto para desbloquearlo" : "Complete The Broken Star Bridge to unlock";
          return (
            <button
              type="button"
              className={`fw-destination${locked ? " is-locked" : ""}`}
              key={section.id}
              disabled={locked}
              onClick={() => open(section.id)}
              aria-label={`${tr(section.name, language)}. ${locked ? lockCopy : tr(section.description, language)}`}
            >
              <span aria-hidden="true">{locked ? "🔒" : section.emoji}</span>
              <strong>{tr(section.name, language)}</strong>
              <small>{locked ? lockCopy : tr(section.description, language)}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
