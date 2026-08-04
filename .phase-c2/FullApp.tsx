import { useEffect, useMemo, useState } from "react";
import { loadLocalStore, saveLocalStore, touchProfile } from "./storage";
import type { LocalProfile, LocalSaveStore, SectionId } from "./types";
import { tr, ui } from "./i18n/core";
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

type Announcement = { id: number; message: string };

export default function FullApp() {
  const [store, setStore] = useState<LocalSaveStore>(() => loadLocalStore());
  const [announcement, setAnnouncement] = useState<Announcement>({ id: 0, message: "" });
  const profile = useMemo(
    () => store.profiles.find((item) => item.id === store.activeProfileId) ?? store.profiles[0],
    [store],
  );

  const announce = (message: string) => setAnnouncement((current) => ({ id: current.id + 1, message }));

  useEffect(() => {
    saveLocalStore(store, "app");
  }, [store]);

  useEffect(() => {
    const section = WORLD_SECTIONS.find((item) => item.id === profile.selectedSection) ?? WORLD_SECTIONS[0];
    document.documentElement.lang = profile.language;
    document.title = `${tr(section.name, profile.language)} · ${profile.language === "es-MX" ? "El Mundo de Nico" : "Nico's World"}`;
  }, [profile.language, profile.selectedSection]);

  const update = (next: LocalProfile) => {
    setStore((current) => ({
      ...current,
      profiles: current.profiles.map((item) => item.id === current.activeProfileId ? touchProfile(next) : item),
    }));
  };

  const open = (sectionId: SectionId) => {
    const section = WORLD_SECTIONS.find((item) => item.id === sectionId) ?? WORLD_SECTIONS[0];
    update({
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

  const page = (() => {
    const props = { profile, update, announce };
    switch (profile.selectedSection) {
      case "world-map": return <WorldMap profile={profile} open={open} />;
      case "robo-lab": return <RoboLab {...props} />;
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
      case "parent-settings": return <Settings store={store} profile={profile} setStore={setStore} update={update} announce={announce} />;
      default: return <WorldMap profile={profile} open={open} />;
    }
  })();

  return (
    <div className="fw-app" data-active-section={profile.selectedSection}>
      <a className="fw-skip-link" href="#main-content">{tr(ui.skipToContent, profile.language)}</a>
      <AppHeader profile={profile} open={open} update={update} announce={announce} />
      <div className="sr-only" aria-live="polite" aria-atomic="true" key={announcement.id}>{announcement.message}</div>
      <main id="main-content" data-section-id={profile.selectedSection}>
        <PageTitle sectionId={profile.selectedSection} language={profile.language} />
        {page}
      </main>
      <BottomNavigation profile={profile} open={open} />
    </div>
  );
}
