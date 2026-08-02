import { useEffect, useMemo, useRef, useState } from "react";
import { LOCAL_MISSIONS, UI_COPY, WORLD_SECTIONS, missionForSection, sectionById, text } from "./content";
import { RobotStage } from "./RobotStage";
import {
  createProfile,
  exportProfile,
  importProfile,
  loadLocalStore,
  saveLocalStore,
  starterRobot,
  touchProfile,
} from "./storage";
import type {
  Language,
  LocalMission,
  LocalProfile,
  LocalSaveStore,
  NavigationView,
  SectionId,
  WorldSection,
} from "./types";
import "./styles.css";

type Pose = "idle" | "launch" | "celebrate" | "wave";

function LocationCard({
  section,
  profile,
  onOpen,
}: {
  section: WorldSection;
  profile: LocalProfile;
  onOpen: () => void;
}) {
  const language = profile.language;
  const locked = profile.stars < section.starsRequired;
  return (
    <button
      className={`location-card ${locked ? "location-card--locked" : ""}`}
      onClick={onOpen}
      disabled={locked}
    >
      <span className="location-card__icon">{section.emoji}</span>
      <span>
        <strong>{text(section.name, language)}</strong>
        <small>{text(section.description, language)}</small>
      </span>
      <span className="location-card__gate">
        {locked
          ? `🔒 ${text(UI_COPY.lockedAt, language)} ${section.starsRequired} ⭐`
          : text(UI_COPY.enter, language)}
      </span>
    </button>
  );
}

function MissionPanel({
  mission,
  profile,
  onComplete,
}: {
  mission: LocalMission | undefined;
  profile: LocalProfile;
  onComplete: (mission: LocalMission) => void;
}) {
  const language = profile.language;
  if (!mission) {
    return (
      <article className="mission-card mission-card--quiet">
        <span className="mission-card__empty">📡</span>
        <p>{text(UI_COPY.localOnly, language)}</p>
      </article>
    );
  }
  const complete = profile.completedMissions.includes(mission.id);
  return (
    <article className={`mission-card ${complete ? "mission-card--complete" : ""}`}>
      <header>
        <span>{complete ? text(UI_COPY.missionComplete, language) : text(UI_COPY.mission, language)}</span>
        <b>+{mission.rewardStars} ⭐</b>
      </header>
      <h2>{text(mission.title, language)}</h2>
      <p>{text(mission.description, language)}</p>
      <ol>
        {mission.objectives.map((objective) => (
          <li key={objective.en}>{text(objective, language)}</li>
        ))}
      </ol>
      <button disabled={complete} onClick={() => onComplete(mission)}>
        {complete ? `✅ ${text(UI_COPY.replayMission, language)}` : `⭐ ${text(UI_COPY.completeMission, language)}`}
      </button>
    </article>
  );
}

function SectionDetails({ section, language }: { section: WorldSection; language: Language }) {
  return (
    <article className="section-details">
      <div className="section-details__title">
        <span>{section.emoji}</span>
        <div>
          <small>{text(UI_COPY.activities, language)}</small>
          <h2>{text(section.name, language)}</h2>
        </div>
      </div>
      <p>{text(section.description, language)}</p>
      <ul>
        {section.activities.map((activity) => (
          <li key={activity.en}>✦ {text(activity, language)}</li>
        ))}
      </ul>
    </article>
  );
}

function SummaryCard({ profile }: { profile: LocalProfile }) {
  const language = profile.language;
  const visited = Object.values(profile.sectionVisits).filter((count) => Number(count) > 0).length;
  const section = sectionById(profile.selectedSection);
  return (
    <section className="summary-card">
      <span className="eyebrow">{text(UI_COPY.profileSummary, language)}</span>
      <h2>{profile.playerName}</h2>
      <div className="summary-grid">
        <div><strong>{profile.stars}</strong><span>⭐ {text(UI_COPY.worldStars, language)}</span></div>
        <div><strong>{profile.completedMissions.length}</strong><span>{text(UI_COPY.completed, language)}</span></div>
        <div><strong>{visited}</strong><span>{text(UI_COPY.placesVisited, language)}</span></div>
      </div>
      <p><b>{text(UI_COPY.currentDestination, language)}:</b> {section.emoji} {text(section.name, language)}</p>
    </section>
  );
}

function ParentPanel({
  store,
  profile,
  onStoreChange,
  onLanguageChange,
  saveOkay,
}: {
  store: LocalSaveStore;
  profile: LocalProfile;
  onStoreChange: (store: LocalSaveStore) => void;
  onLanguageChange: (language: Language) => void;
  saveOkay: boolean;
}) {
  const language = profile.language;
  const [newName, setNewName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  const createLocalProfile = () => {
    if (!newName.trim()) {
      setMessage(text(UI_COPY.addNameFirst, language));
      return;
    }
    const created = createProfile(newName, language);
    onStoreChange({ ...store, activeProfileId: created.id, profiles: [...store.profiles, created].slice(-12) });
    setNewName("");
    setMessage("");
  };

  const switchProfile = (profileId: string) => {
    onStoreChange({ ...store, activeProfileId: profileId });
    setMessage("");
  };

  const deleteCurrent = () => {
    if (store.profiles.length <= 1) {
      setMessage(text(UI_COPY.cannotDeleteLast, language));
      return;
    }
    if (!window.confirm(text(UI_COPY.confirmDelete, language))) return;
    const profiles = store.profiles.filter((item) => item.id !== profile.id);
    onStoreChange({ ...store, profiles, activeProfileId: profiles[0].id });
  };

  const resetCurrent = () => {
    if (!window.confirm(text(UI_COPY.confirmReset, language))) return;
    const reset = createProfile(profile.playerName, profile.language);
    reset.id = profile.id;
    reset.createdAt = profile.createdAt;
    onStoreChange({
      ...store,
      profiles: store.profiles.map((item) => item.id === profile.id ? reset : item),
    });
  };

  const downloadBackup = () => {
    const blob = new Blob([exportProfile(profile)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nicos-world-${profile.playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "player"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const uploadBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = importProfile(await file.text());
      onStoreChange({ ...store, activeProfileId: imported.id, profiles: [...store.profiles, imported].slice(-12) });
      setMessage(text(UI_COPY.importSuccess, imported.language));
    } catch {
      setMessage(text(UI_COPY.importFailure, language));
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <section className="parent-grid">
      <article className="settings-card">
        <span className="eyebrow">{text(UI_COPY.privacyTitle, language)}</span>
        <h2>{text(UI_COPY.localSave, language)}</h2>
        <p>{text(UI_COPY.privacyBody, language)}</p>
        <div className={`save-status ${saveOkay ? "save-status--good" : "save-status--bad"}`}>
          {saveOkay ? "●" : "!"} {text(UI_COPY.localSave, language)}
        </div>
        <p className="warning-copy">⚠️ {text(UI_COPY.storageWarning, language)}</p>
      </article>

      <article className="settings-card">
        <label>
          <span>{text(UI_COPY.language, language)}</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
            <option value="en">{text(UI_COPY.english, language)}</option>
            <option value="es-MX">{text(UI_COPY.mexicanSpanish, language)}</option>
          </select>
        </label>
        <label>
          <span>{text(UI_COPY.switchProfile, language)}</span>
          <select value={profile.id} onChange={(event) => switchProfile(event.target.value)}>
            {store.profiles.map((item) => <option key={item.id} value={item.id}>{item.playerName}</option>)}
          </select>
        </label>
        <div className="profile-create-row">
          <input
            value={newName}
            maxLength={24}
            placeholder={text(UI_COPY.profileName, language)}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") createLocalProfile(); }}
          />
          <button onClick={createLocalProfile}>＋ {text(UI_COPY.createProfile, language)}</button>
        </div>
      </article>

      <article className="settings-card settings-card--wide">
        <div className="settings-actions">
          <button onClick={downloadBackup}>⬇️ {text(UI_COPY.exportSave, language)}</button>
          <button onClick={() => fileInput.current?.click()}>⬆️ {text(UI_COPY.importSave, language)}</button>
          <button className="button--warning" onClick={resetCurrent}>↺ {text(UI_COPY.resetProgress, language)}</button>
          <button className="button--danger" onClick={deleteCurrent}>🗑️ {text(UI_COPY.deleteProfile, language)}</button>
          <input
            ref={fileInput}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(event) => void uploadBackup(event.target.files?.[0])}
          />
        </div>
        {message && <p className="settings-message" role="status">{message}</p>}
      </article>
    </section>
  );
}

export default function App() {
  const [store, setStore] = useState<LocalSaveStore>(() => loadLocalStore());
  const [activeView, setActiveView] = useState<NavigationView>("world");
  const [pose, setPose] = useState<Pose>("idle");
  const [saveOkay, setSaveOkay] = useState(true);

  const profile = useMemo(
    () => store.profiles.find((item) => item.id === store.activeProfileId) ?? store.profiles[0],
    [store],
  );
  const language = profile.language;
  const chosen = sectionById(profile.selectedSection);
  const selectedMission = missionForSection(profile.selectedSection);

  useEffect(() => {
    setSaveOkay(saveLocalStore(store));
  }, [store]);

  useEffect(() => {
    navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "es-MX" ? "El Mundo de Nico" : "Nico's World";
  }, [language]);

  const setCurrentProfile = (updater: (current: LocalProfile) => LocalProfile) => {
    setStore((currentStore) => ({
      ...currentStore,
      profiles: currentStore.profiles.map((item) =>
        item.id === currentStore.activeProfileId ? touchProfile(updater(item)) : item,
      ),
    }));
  };

  const openSection = (sectionId: SectionId) => {
    setCurrentProfile((current) => ({
      ...current,
      selectedSection: sectionId,
      sectionVisits: {
        ...current.sectionVisits,
        [sectionId]: Number(current.sectionVisits[sectionId] ?? 0) + 1,
      },
    }));
  };

  const completeMission = (mission: LocalMission) => {
    if (profile.completedMissions.includes(mission.id)) return;
    setCurrentProfile((current) => {
      const xp = current.robot.xp + 25;
      return {
        ...current,
        stars: current.stars + mission.rewardStars,
        completedMissions: [...current.completedMissions, mission.id],
        robot: { ...current.robot, xp, level: Math.min(100, Math.floor(xp / 50) + 1) },
      };
    });
    setPose("celebrate");
    window.setTimeout(() => setPose("idle"), 1400);
  };

  const changeLanguage = (nextLanguage: Language) => {
    setCurrentProfile((current) => ({ ...current, language: nextLanguage }));
  };

  const changePose = (nextPose: Pose) => {
    setPose(nextPose);
    if (nextPose !== "idle") window.setTimeout(() => setPose("idle"), 1600);
  };

  const renderWorld = () => (
    <section className="command-grid">
      <div className="robot-column">
        <RobotStage
          robot={profile.robot}
          pose={pose}
          statusLabel={text(UI_COPY.ready, language)}
          levelLabel={text(UI_COPY.level, language)}
          ariaLabel={`${profile.robot.name} · ${text(UI_COPY.robots, language)}`}
        />
        <div className="action-row action-row--four">
          <button onClick={() => changePose("launch")}>🚀 {text(UI_COPY.launchPose, language)}</button>
          <button onClick={() => changePose("wave")}>👋 {text(UI_COPY.wavePose, language)}</button>
          <button onClick={() => changePose("celebrate")}>✨ {text(UI_COPY.celebrate, language)}</button>
          <button onClick={() => setPose("idle")}>🤖 {text(UI_COPY.idle, language)}</button>
        </div>
        <SectionDetails section={chosen} language={language} />
      </div>

      <div className="world-column">
        <div className="world-heading">
          <span>{text(UI_COPY.selectDestination, language)}</span>
          <b>{chosen.emoji} {text(chosen.name, language)}</b>
        </div>
        <div className="world-map">
          {WORLD_SECTIONS.map((section) => (
            <LocationCard key={section.id} section={section} profile={profile} onOpen={() => openSection(section.id)} />
          ))}
        </div>
        <MissionPanel mission={selectedMission} profile={profile} onComplete={completeMission} />
      </div>
    </section>
  );

  const renderRobots = () => (
    <section className="single-view">
      <RobotStage
        robot={profile.robot}
        pose={pose}
        statusLabel={text(UI_COPY.ready, language)}
        levelLabel={text(UI_COPY.level, language)}
      />
      <div className="action-row action-row--four">
        <button onClick={() => changePose("launch")}>🚀 {text(UI_COPY.launchPose, language)}</button>
        <button onClick={() => changePose("wave")}>👋 {text(UI_COPY.wavePose, language)}</button>
        <button onClick={() => changePose("celebrate")}>✨ {text(UI_COPY.celebrate, language)}</button>
        <button onClick={() => setPose("idle")}>🤖 {text(UI_COPY.idle, language)}</button>
      </div>
    </section>
  );

  const renderMissions = () => (
    <section className="missions-view">
      <span className="eyebrow">{text(UI_COPY.allMissions, language)}</span>
      <div className="missions-grid">
        {LOCAL_MISSIONS.map((mission) => (
          <MissionPanel key={mission.id} mission={mission} profile={profile} onComplete={completeMission} />
        ))}
      </div>
    </section>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">{text(UI_COPY.commandOnline, language)}</span>
          <h1>{language === "es-MX" ? "El Mundo de Nico" : "Nico’s World"}</h1>
          <small className="mode-label">{text(UI_COPY.staticMode, language)}</small>
        </div>
        <div className="topbar-actions">
          <button className="language-toggle" onClick={() => changeLanguage(language === "en" ? "es-MX" : "en")}>
            {language === "en" ? "🇲🇽 Español" : "🇺🇸 English"}
          </button>
          <div className="star-counter">
            <span>⭐</span><strong>{profile.stars}</strong><small>{text(UI_COPY.worldStars, language)}</small>
          </div>
        </div>
      </header>

      <div className="profile-strip">
        <span>👤 <b>{profile.playerName}</b></span>
        <span className={saveOkay ? "profile-strip__saved" : "profile-strip__error"}>
          {saveOkay ? "●" : "!"} {text(UI_COPY.localSave, language)}
        </span>
      </div>

      {activeView === "world" && renderWorld()}
      {activeView === "robots" && renderRobots()}
      {activeView === "missions" && renderMissions()}
      {activeView === "home" && <SummaryCard profile={profile} />}
      {activeView === "parent" && (
        <ParentPanel
          store={store}
          profile={profile}
          onStoreChange={setStore}
          onLanguageChange={changeLanguage}
          saveOkay={saveOkay}
        />
      )}

      <nav className="dock" aria-label="Main navigation">
        {([
          ["world", "🌐", UI_COPY.world],
          ["robots", "🤖", UI_COPY.robots],
          ["missions", "📜", UI_COPY.missions],
          ["home", "🏠", UI_COPY.home],
          ["parent", "⚙️", UI_COPY.parent],
        ] as const).map(([view, emoji, label]) => (
          <button
            key={view}
            className={activeView === view ? "dock__active" : ""}
            onClick={() => setActiveView(view)}
          >
            {emoji}<span>{text(label, language)}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
