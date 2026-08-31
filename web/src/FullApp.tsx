import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SectionId } from "./types";
import type { StarBridgeEvent } from "./game/goldenAdventure";
import { tr, ui } from "./i18n/core";
import { useAppStore } from "./app/AppStoreContext";
import { applyStarBridgeEvent } from "./game/goldenAdventureProfile";
import { hasDinosaurValleyAccess } from "./game/starBridgeRepair";
import { AnimalForest } from "./world/AnimalForest";
import { Arcade } from "./world/Arcade";
import { ArtStudio } from "./world/ArtStudio";
import { Badges } from "./world/Badges";
import { AppHeader, BottomNavigation, PageTitle } from "./world/common";
import { DinosaurValley } from "./world/DinosaurValley";
import { Museum } from "./world/Museum";
import { MonsterHabitats, MonsterLab } from "./world/MonsterWorld";
import { PetWorkshop } from "./world/PetWorkshop";
import { RoboLab } from "./world/RoboLab";
import { RobotHome } from "./world/RobotHome";
import { Settings } from "./world/Settings";
import { StoryCastle } from "./world/StoryCastle";
import { WorldMap } from "./world/WorldMap";
import { VisitorCounter } from "./world/VisitorCounter";
import { WORLD_SECTIONS } from "./world/catalogs";
import "./styles.css";
import "./full-world.css";
import "./feature-parity.css";
import "./world/system-parity.css";
import "./world/progression.css";
import "./world/creative-memory.css";
import "./world/story-mobile-fixes.css";
import "./world/local-media-art.css";
import "./world/star-bridge-map.css";
import "./world/site-polish.css";

const CousinsAdventure = lazy(() => import("./world/CousinsAdventure").then((module) => ({ default: module.CousinsAdventure })));
const BeccaCorner = lazy(() => import("./world/BeccaCorner").then((module) => ({ default: module.BeccaCorner })));

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

type Announcement = { id: number; message: string };

export default function FullApp() {
  const { store, profile, setStore, updateProfile, commitProfile } = useAppStore();
  const [announcement, setAnnouncement] = useState<Announcement>({ id: 0, message: "" });
  const pendingTitleFocus = useRef<"keyboard" | "pointer" | null>(null);
  const lastNavigationInput = useRef<"keyboard" | "pointer">("pointer");
  const announce = (message: string) => setAnnouncement((current) => ({ id: current.id + 1, message }));

  useEffect(() => {
    const section = WORLD_SECTIONS.find((item) => item.id === profile.selectedSection) ?? WORLD_SECTIONS[0];
    document.documentElement.lang = profile.language;
    document.title = `${tr(section.name, profile.language)} · ${profile.language === "es-MX" ? "El Mundo de Nico" : "Nico's World"}`;
  }, [profile.language, profile.selectedSection]);

  useEffect(() => {
    const rememberKeyboard = () => { lastNavigationInput.current = "keyboard"; };
    const rememberPointer = () => { lastNavigationInput.current = "pointer"; };
    window.addEventListener("keydown", rememberKeyboard, true);
    window.addEventListener("pointerdown", rememberPointer, true);
    return () => {
      window.removeEventListener("keydown", rememberKeyboard, true);
      window.removeEventListener("pointerdown", rememberPointer, true);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const activation = pendingTitleFocus.current;
    if (!activation) return;

    let firstFrame = 0;
    let secondFrame = 0;
    const focusTitle = () => document.getElementById("page-title")?.focus({ preventScroll: true });
    const scheduleFocus = () => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(focusTitle);
      });
    };
    scheduleFocus();

    if (activation === "pointer") {
      pendingTitleFocus.current = null;
      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    const focusAfterKeyUp = () => {
      scheduleFocus();
      pendingTitleFocus.current = null;
    };
    window.addEventListener("keyup", focusAfterKeyUp, { once: true });
    return () => {
      window.removeEventListener("keyup", focusAfterKeyUp);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [profile.selectedSection]);

  const presentSection = () => {
    pendingTitleFocus.current = lastNavigationInput.current;
    lastNavigationInput.current = "pointer";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const open = (sectionId: SectionId) => {
    if (sectionId === "dinosaur-valley" && !hasDinosaurValleyAccess(profile)) {
      announce(profile.language === "es-MX"
        ? "Completa El Puente Estelar Roto para desbloquear el Valle de Dinosaurios."
        : "Complete The Broken Star Bridge to unlock Dinosaur Valley.");
      return;
    }
    const section = WORLD_SECTIONS.find((item) => item.id === sectionId) ?? WORLD_SECTIONS[0];
    presentSection();
    commitProfile((current) => ({
      ...current,
      selectedSection: sectionId,
      sectionVisits: {
        ...current.sectionVisits,
        [sectionId]: Number(current.sectionVisits[sectionId] ?? 0) + 1,
      },
    }));
    announce(`${tr(ui.openDestination, profile.language)}: ${tr(section.name, profile.language)}`);
  };

  const beginStarBridge = () => {
    const sectionId: SectionId = "robo-lab";
    presentSection();
    commitProfile((current) => {
      const next = applyStarBridgeEvent(current, { type: "REVEAL_BRIDGE" });
      return {
        ...next,
        selectedSection: sectionId,
        sectionVisits: {
          ...next.sectionVisits,
          [sectionId]: Number(next.sectionVisits[sectionId] ?? 0) + 1,
        },
      };
    });
    announce(profile.language === "es-MX"
      ? "Aventura iniciada: prepara a BoltBot en el Laboratorio de Robots"
      : "Adventure started: prepare BoltBot in Robo Lab");
  };

  const advanceStarBridge = (event: StarBridgeEvent) => {
    commitProfile((current) => applyStarBridgeEvent(current, event));
    const messages: Partial<Record<StarBridgeEvent["type"], { en: string; "es-MX": string }>> = {
      INSPECT_BRIDGE: { en: "Bridge fault inspected.", "es-MX": "Falla del puente inspeccionada." },
      INSTALL_STAR_CORE: { en: "Star Core installed.", "es-MX": "Núcleo Estelar instalado." },
      COMPLETE_ADVENTURE: { en: "Star Bridge restored! Dinosaur Valley unlocked.", "es-MX": "¡Puente Estelar restaurado! Valle de Dinosaurios desbloqueado." },
    };
    const message = messages[event.type];
    if (message) announce(message[profile.language]);
  };

  const page = (() => {
    const props = { profile, update: updateProfile, announce };
    switch (profile.selectedSection) {
      case "world-map": return <WorldMap profile={profile} open={open} beginStarBridge={beginStarBridge} advanceStarBridge={advanceStarBridge} />;
      case "robo-lab": return <RoboLab {...props} open={open} />;
      case "animal-forest": return <AnimalForest {...props} />;
      case "becca-corner": return (
        <Suspense fallback={<div className="fw-empty" role="status">{profile.language === "es-MX" ? "Abriendo el taller mágico…" : "Opening the magic workshop…"}</div>}>
          <BeccaCorner language={profile.language} />
        </Suspense>
      );
      case "cousins-adventure": return (
        <Suspense fallback={<div className="fw-empty" role="status">{profile.language === "es-MX" ? "Abriendo el mapa de aventuras…" : "Opening the adventure map…"}</div>}>
          <CousinsAdventure language={profile.language} />
        </Suspense>
      );
      case "monster-lab": return <MonsterLab {...props} />;
      case "monster-habitats": return <MonsterHabitats {...props} />;
      case "art-studio": return <ArtStudio {...props} />;
      case "story-castle": return <StoryCastle {...props} />;
      case "game-arcade": return <Arcade {...props} />;
      case "dinosaur-valley": return <DinosaurValley {...props} />;
      case "pet-workshop": return <PetWorkshop {...props} />;
      case "robot-home": return <RobotHome {...props} />;
      case "memory-book": return <Museum profile={profile} />;
      case "badge-book": return <Badges profile={profile} />;
      case "parent-settings": return <Settings store={store} profile={profile} setStore={setStore} update={updateProfile} announce={announce} />;
      default: return <WorldMap profile={profile} open={open} beginStarBridge={beginStarBridge} advanceStarBridge={advanceStarBridge} />;
    }
  })();

  return (
    <div className="fw-app" data-active-section={profile.selectedSection}>
      <a className="fw-skip-link" href="#main-content">{tr(ui.skipToContent, profile.language)}</a>
      <AppHeader profile={profile} open={open} update={updateProfile} announce={announce} />
      <div className="sr-only" aria-live="polite" aria-atomic="true" key={announcement.id}>{announcement.message}</div>
      <main id="main-content" data-section-id={profile.selectedSection}>
        <PageTitle sectionId={profile.selectedSection} language={profile.language} />
        {page}
      </main>
      <footer className="fw-site-footer">
        <VisitorCounter language={profile.language} />
        <div className="fw-site-footer__promise">
          <strong>{profile.language === "es-MX" ? "Hecho para mentes curiosas" : "Made for curious minds"}</strong>
          <span>{profile.language === "es-MX" ? "Amable · Creativo · Privado por diseño" : "Kind · Creative · Private by design"}</span>
        </div>
      </footer>
      <BottomNavigation profile={profile} open={open} />
    </div>
  );
}
