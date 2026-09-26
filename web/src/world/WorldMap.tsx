import { lazy, Suspense, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { StarBridgeEvent } from "../game/goldenAdventure";
import { hasDinosaurValleyAccess } from "../game/starBridgeRepair";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, SectionId } from "../types";
import { tr, ui } from "../i18n/core";
import { WORLD_SECTIONS } from "./catalogs";
import { NicoVideoCard } from "./NicoVideoCard";
import { nextAdventure } from "./journey";
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
  onCreate, initialBridgeOpen = false,
}: {
  profile: LocalProfile;
  open: (id: SectionId) => void;
  beginStarBridge: () => void;
  advanceStarBridge: (event: StarBridgeEvent) => void;
  onCreate?: () => void; initialBridgeOpen?: boolean;
}) {
  const language = profile.language;
  const next = nextAdventure(profile.adventures.starBridge.step, language);
  const [bridgeOpen, setBridgeOpen] = useState(initialBridgeOpen);
  const discovered = mergeAnimalLibrary(profile.animals).filter((animal) => animal.discovered).length;
  const dinosaurValleyAvailable = hasDinosaurValleyAccess(profile);
  const destinationGroups = [
    {
      id: "play",
      label: language === "es-MX" ? "Jugar y explorar" : "Play and explore",
      ids: ["robo-lab", "animal-forest", "game-arcade", "dinosaur-valley"],
    },
    {
      id: "create",
      label: language === "es-MX" ? "Crear e imaginar" : "Create and imagine",
      ids: ["becca-corner", "cousins-adventure", "monster-lab", "art-studio", "story-castle"],
    },
    {
      id: "care",
      label: language === "es-MX" ? "Cuidar a tus amigos" : "Care for your friends",
      ids: ["monster-habitats", "pet-workshop"],
    },
    {
      id: "collection",
      label: language === "es-MX" ? "Tu colección" : "Your collection",
      ids: ["robot-home", "memory-book", "badge-book"],
    },
    {
      id: "grown-ups",
      label: language === "es-MX" ? "Para adultos" : "For grown-ups",
      ids: ["parent-settings"],
    },
  ];
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
      <section className="world-continue world-welcome" aria-label={language==='es-MX'?'Tu próxima aventura':'Your next adventure'}>
        <div className="world-welcome__intro"><small>{language==='es-MX'?'EXPLORA · CREA · IMAGINA':'EXPLORE · CREATE · IMAGINE'}</small><h2>{language==='es-MX'?'¿Qué haremos hoy?':'What shall we do today?'}</h2><p>{language==='es-MX'?'Ayuda a BoltBot, inventa algo nuevo o elige un lugar para explorar.':'Help BoltBot, make something new, or choose a place to explore.'}</p></div>
        <div className="world-welcome__actions">
          <button type="button" data-testid="continue-world" data-next-objective={profile.adventures.starBridge.step} onClick={()=>{
            if(next.action==='begin') beginStarBridge();
            else if(next.action==='bridge') setBridgeOpen(true);
            else open(next.action==='home'?'robot-home':'robo-lab');
          }}><span aria-hidden="true">✦</span><strong>{next.label}</strong><small>{language==='es-MX'?'Mi aventura del Puente Estelar':'My Star Bridge adventure'}</small></button>
          <button type="button" data-testid="world-create" onClick={event=>{event.currentTarget.focus({preventScroll:true});if(onCreate)onCreate();else open('art-studio');}}><span aria-hidden="true">🎨</span><strong>{language==='es-MX'?'Crear algo':'Create something'}</strong><small>{language==='es-MX'?'Arte, cuentos y nuevos amigos':'Art, stories and new friends'}</small></button>
          <button type="button" data-testid="world-explore" onClick={()=>{const target=document.getElementById('world-atlas-title');target?.scrollIntoView({block:'start',behavior:'auto'});target?.focus({preventScroll:true});}}><span aria-hidden="true">🧭</span><strong>{language==='es-MX'?'Explorar el mundo':'Explore the world'}</strong><small>{language==='es-MX'?'Elige un lugar del mapa':'Choose a place on the map'}</small></button>
        </div>
      </section>
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
      <div className="world-destination-groups" aria-label={tr(ui.mainNavigation, language)}>
        {destinationGroups.map((group) => (
          <section className="world-destination-group" key={group.id} aria-labelledby={`world-destinations-${group.id}`}>
            <h2 id={`world-destinations-${group.id}`}>{group.label}</h2>
            <div className="fw-destination-grid">
              {group.ids.map((id) => WORLD_SECTIONS.find((section) => section.id === id)).filter((section) => section !== undefined).map((section) => {
                const locked = section.id === "dinosaur-valley" && !dinosaurValleyAvailable;
                const lockCopy = language === "es-MX"
                  ? "Completa El Puente Estelar Roto para desbloquear el Valle de dinosaurios."
                  : "Complete The Broken Star Bridge to unlock Dinosaur Valley.";
                return (
                  <button
                    type="button"
                    className={`fw-destination${locked ? " is-locked" : ""}`}
                    key={section.id}
                    disabled={locked}
                    onClick={() => open(section.id)}
                    aria-label={`${tr(ui.openDestination, language)}: ${tr(section.name, language)}. ${locked ? lockCopy : tr(section.description, language)}`}
                  >
                    <span aria-hidden="true">{locked ? "🔒" : section.emoji}</span>
                    <strong>{tr(section.name, language)}</strong>
                    <small>{locked ? lockCopy : tr(section.description, language)}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <NicoVideoCard language={language} />
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

    </div>
  );
}
