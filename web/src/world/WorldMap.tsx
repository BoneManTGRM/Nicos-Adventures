import { DestinationDirectory } from "./DestinationDirectory";
import "./star-bridge-map.css";
import "./destination-atlas.css";
import { lazy, Suspense, useEffect, useState } from "react";
import { mergeAnimalLibrary } from "../FeatureArt";
import type { StarBridgeEvent } from "../game/goldenAdventure";
import { hasDinosaurValleyAccess } from "../game/starBridgeRepair";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, SectionId } from "../types";
import { tr, ui } from "../i18n/core";
import { NicoVideoCard } from "./NicoVideoCard";
import { nextAdventure } from "./journey";
import { MoonpawEntry } from "./MoonpawEntry";
import { MascarasEntry } from "./MascarasEntry";
import { SkullwingEntry } from "./SkullwingEntry";
import { LumaLagoonEntry } from "./LumaLagoonEntry";
import { TimberlineEntry } from "./TimberlineEntry";
import { StarfallEntry } from "./StarfallEntry";
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
  useEffect(() => {
    const anchor = window.location.hash;
    if (!["#destinations", "#star-bridge", "#nico-tv"].includes(anchor)) return;
    const frame = requestAnimationFrame(() => document.getElementById(anchor.slice(1))?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (bridgeOpen) {
    return (
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando el Puente Estelar…" : "Preparing the Star Bridge…"}</div>}>
        <BrokenStarBridge
          state={profile.adventures.starBridge}
          robot={profile.robot}
          language={language}
          advance={advanceStarBridge}
          close={() => setBridgeOpen(false)}
          visitValley={() => open("dinosaur-valley")}
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
        <div className="atlas-shortcuts"><a href="/games/moonpaw/">{language === "es-MX" ? "Jugar Moonpaw" : "Play Moonpaw"}</a><a href="#star-bridge">{language === "es-MX" ? "Puente Estelar" : "Star Bridge"}</a><a href="#destinations">{language === "es-MX" ? "Guía de destinos" : "Destination guide"}</a></div>
      </section>
      <MoonpawEntry es={language === "es-MX"} />
      <MascarasEntry es={language === "es-MX"} />
      <SkullwingEntry es={language === "es-MX"} />
      <LumaLagoonEntry es={language === "es-MX"} />
      <StarfallEntry es={language === "es-MX"} />
      <TimberlineEntry es={language === "es-MX"} />
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
      <DestinationDirectory profile={profile} open={open} valleyUnlocked={dinosaurValleyAvailable} />
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
