import { useEffect, useState } from "react";
import type { SectionId } from "./types";
import { tr, ui } from "./i18n/core";
import { useAppStore } from "./app/AppStoreContext";
import { applyStarBridgeEvent } from "./game/goldenAdventureProfile";
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
import { WORLD_SECTIONS } from "./world/catalogs";
import "./styles.css";
import "./full-world.css";
import "./feature-parity.css";
import "./world/system-parity.css";
import "./world/progression.css";
import "./world/creative-memory.css";
import "./world/local-media-art.css";
import "./world/star-bridge-map.css";

type Announcement = { id: number; message: string };

export default function FullApp() {
  const { store, profile, setStore, updateProfile, commitProfile } = useAppStore();
  const [announcement, setAnnouncement] = useState<Announcement>({ id: 0, message: "" });
  const announce = (message: string) => setAnnouncement((current) => ({ id: current.id + 1, message }));

  useEffect(() => {
    const section = WORLD_SECTIONS.find((item) => item.id === profile.selectedSection) ?? WORLD_SECTIONS[0];
    document.documentElement.lang = profile.language;
    document.title = `${tr(section.name, profile.language)} · ${profile.language === "es-MX" ? "El Mundo de Nico" : "Nico's World"}`;
  }, [profile.language, profile.selectedSection]);

  const open = (sectionId: SectionId) => {
    const section = WORLD_SECTIONS.find((item) => item.id === sectionId) ?? WORLD_SECTIONS[0];
    updateProfile({
      ...profile,
      selectedSection: sectionId,
      sectionVisits: {
        ...profile.sectionVisits,
        [sectionId]: Number(profile.sectionVisits[sectionId] ?? 0) + 1,
      },
    });
    announce(`${tr(ui.openDestination, profile.language)}: ${tr(section.name, profile.language)}`);
    window.requestAnimationFrame(() => document.getElementById("page-title")?.focus());
  };

  const beginStarBridge = () => {
    const sectionId: SectionId = "robo-lab";
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
    window.requestAnimationFrame(() => document.getElementById("page-title")?.focus());
  };

  const page = (() => {
    const props = { profile, update: updateProfile, announce };
    switch (profile.selectedSection) {
      case "world-map": return <WorldMap profile={profile} open={open} beginStarBridge={beginStarBridge} />;
      case "robo-lab": return <RoboLab {...props} open={open} />;
      case "animal-forest": return <AnimalForest {...props} />;
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
      default: return <WorldMap profile={profile} open={open} beginStarBridge={beginStarBridge} />;
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
      <BottomNavigation profile={profile} open={open} />
    </div>
  );
}
