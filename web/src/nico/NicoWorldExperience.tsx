import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  loadLocalStore,
  normalizeStore,
  saveLocalStore,
  touchProfile,
} from "../storage";
import type {
  LocalProfile,
  LocalSaveStore,
  MovieProject,
  NicoPreferences,
} from "../types";
import { NicoMovieLibrary } from "../showtime/NicoMovieLibrary";
import { ShowtimeStudio } from "../showtime/ShowtimeStudio";
import { AskNico } from "./AskNico";
import { NicoDressUp } from "./NicoDressUp";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { useLocalBase64Asset } from "./useLocalBase64Asset";
import "./nico-world-experience.css";
import "../showtime/showtime.css";

export type NicoHubTab = "ask" | "dress" | "showtime" | "movies";

type PortalTargets = {
  worldMap: Element | null;
  robotHome: Element | null;
  memoryMain: Element | null;
};

type OpenNicoDetail = {
  tab?: NicoHubTab;
  projectId?: string;
};

const emptyTargets: PortalTargets = { worldMap: null, robotHome: null, memoryMain: null };
const FULL_BODY_ASSET = "/assets/nico/nico-fullbody.b64?v=1";
const PROFILE_EVENT = "nicos-world-profile-updated";
const OPEN_EVENT = "nicos-world-open-nico";

const copy = {
  en: {
    clubhouse: "Nico’s Clubhouse",
    clubhouseDescription: "Ask Nico, choose an outfit, and make little movies.",
    ask: "Ask Nico",
    dress: "Dress Up",
    showtime: "Showtime",
    movies: "Movies",
    close: "Close Nico’s Clubhouse",
    robotHome: "Visit Nico’s Clubhouse",
    memoryTitle: "Showtime Movies",
    memoryIntro: "Recreate saved projects to make another private local download.",
    noMovies: "No movie projects yet.",
    openShowtime: "Open Showtime Studio",
    firstBadge: "First Movie Director badge earned!",
    deleteConfirm: "Delete this movie project? The downloaded video file, if any, is not stored in the app.",
  },
  "es-MX": {
    clubhouse: "Casa Club de Nico",
    clubhouseDescription: "Pregúntale a Nico, elige un traje y crea pequeñas películas.",
    ask: "Pregúntale",
    dress: "Disfraces",
    showtime: "Showtime",
    movies: "Películas",
    close: "Cerrar la Casa Club de Nico",
    robotHome: "Visitar la Casa Club de Nico",
    memoryTitle: "Películas Showtime",
    memoryIntro: "Recrea proyectos guardados para hacer otra descarga privada y local.",
    noMovies: "Todavía no hay proyectos de película.",
    openShowtime: "Abrir Estudio Showtime",
    firstBadge: "¡Ganaste la insignia de Director de Primera Película!",
    deleteConfirm: "¿Eliminar este proyecto? El archivo de video descargado, si existe, no está guardado en la app.",
  },
} as const;

function currentTargets(): PortalTargets {
  const heading = document.querySelector<HTMLElement>(".fw-page-header h1")?.textContent?.trim() ?? "";
  const worldMap = heading === "World Map" || heading === "Mapa del mundo"
    ? document.querySelector(".fw-destination-grid")
    : null;
  const robotHome = heading === "Robot Home" || heading === "Casa Robot"
    ? document.querySelector(".fw-room")
    : null;
  const memoryMain = heading === "Memory Museum" || heading === "Museo de recuerdos"
    ? document.querySelector(".fw-app main")
    : null;
  return { worldMap, robotHome, memoryMain };
}

function targetsEqual(left: PortalTargets, right: PortalTargets) {
  return left.worldMap === right.worldMap && left.robotHome === right.robotHome && left.memoryMain === right.memoryMain;
}

function parseHash(): NicoHubTab | null {
  const match = window.location.hash.match(/^#nico\/(ask|dress|showtime|movies)$/);
  return match ? match[1] as NicoHubTab : null;
}

function MemoryMovieShelf({
  profile,
  onOpenProject,
  onOpenStudio,
}: {
  profile: LocalProfile;
  onOpenProject: (project: MovieProject) => void;
  onOpenStudio: () => void;
}) {
  const text = copy[profile.language];
  const projects = [...profile.movieProjects].reverse().slice(0, 4);
  return (
    <section className="nico-memory-shelf" aria-labelledby="nico-memory-shelf-title">
      <header>
        <div>
          <small>🎞️ {profile.language === "es-MX" ? "Proyectos locales" : "Local projects"}</small>
          <h2 id="nico-memory-shelf-title">{text.memoryTitle}</h2>
          <p>{text.memoryIntro}</p>
        </div>
        <button type="button" className="nico-primary-action" onClick={onOpenStudio}>🎬 {text.openShowtime}</button>
      </header>
      {!projects.length ? <p className="nico-memory-empty">{text.noMovies}</p> : (
        <div className="nico-memory-movie-grid">
          {projects.map((project) => (
            <button type="button" key={project.id} onClick={() => onOpenProject(project)}>
              <span>🎬</span>
              <strong>{project.title}</strong>
              <small>{project.durationMs / 1000}s · {project.characters.length} {profile.language === "es-MX" ? "personajes" : "characters"}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function NicoWorldExperience() {
  const [store, setStore] = useState<LocalSaveStore>(() => loadLocalStore());
  const [targets, setTargets] = useState<PortalTargets>(emptyTargets);
  const [open, setOpen] = useState(() => parseHash() !== null);
  const [tab, setTab] = useState<NicoHubTab>(() => parseHash() ?? "ask");
  const [editingProject, setEditingProject] = useState<MovieProject | null>(null);
  const [notice, setNotice] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const art = useLocalBase64Asset(FULL_BODY_ASSET, "image/jpeg", "/9j/");
  const profile = useMemo(
    () => store.profiles.find((item) => item.id === store.activeProfileId) ?? store.profiles[0],
    [store],
  );
  const text = copy[profile.language];

  useEffect(() => {
    let frame = 0;
    const syncTargets = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = currentTargets();
        setTargets((current) => targetsEqual(current, next) ? current : next);
      });
    };
    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncStore = () => setStore(loadLocalStore());
    window.addEventListener("storage", syncStore);
    window.addEventListener(PROFILE_EVENT, syncStore);
    return () => {
      window.removeEventListener("storage", syncStore);
      window.removeEventListener(PROFILE_EVENT, syncStore);
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseHash();
      if (next) {
        setTab(next);
        setOpen(true);
      } else {
        setOpen(false);
      }
    };
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenNicoDetail>).detail;
      const nextTab = detail?.tab ?? "ask";
      const project = detail?.projectId ? profile.movieProjects.find((item) => item.id === detail.projectId) ?? null : null;
      setEditingProject(project);
      openHub(nextTab);
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [profile.movieProjects]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeHub();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  const commitProfile = (mutate: (current: LocalProfile) => LocalProfile) => {
    setStore((currentStore) => {
      const profiles = currentStore.profiles.map((item) => item.id === currentStore.activeProfileId ? touchProfile(mutate(item)) : item);
      const next = normalizeStore({ ...currentStore, profiles });
      saveLocalStore(next);
      queueMicrotask(() => window.dispatchEvent(new Event(PROFILE_EVENT)));
      return next;
    });
  };

  const openHub = (nextTab: NicoHubTab, project: MovieProject | null = null) => {
    setEditingProject(project);
    setTab(nextTab);
    setOpen(true);
    const nextHash = `#nico/${nextTab}`;
    if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
  };

  const closeHub = () => {
    setOpen(false);
    setNotice("");
    setEditingProject(null);
    if (window.location.hash.startsWith("#nico/")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  const saveNicoPreferences = (preferences: NicoPreferences) => {
    commitProfile((current) => ({ ...current, nico: preferences }));
  };

  const saveMovieProject = (project: MovieProject) => {
    commitProfile((current) => {
      const existed = current.movieProjects.some((item) => item.id === project.id);
      const firstMovie = current.movieProjects.length === 0;
      const projects = existed
        ? current.movieProjects.map((item) => item.id === project.id ? project : item)
        : [...current.movieProjects, project].slice(-40);
      const badges = firstMovie && !current.badges.includes("showtime-director")
        ? [...current.badges, "showtime-director"]
        : current.badges;
      if (firstMovie) setNotice(text.firstBadge);
      return {
        ...current,
        movieProjects: projects,
        badges,
        stars: current.stars + (firstMovie ? 5 : existed ? 0 : 1),
      };
    });
  };

  const markDownloaded = (projectId: string, mimeType: string) => {
    commitProfile((current) => ({
      ...current,
      movieProjects: current.movieProjects.map((project) => project.id === projectId
        ? { ...project, lastDownloadedAt: new Date().toISOString(), lastMimeType: mimeType }
        : project),
    }));
  };

  const deleteProject = (projectId: string) => {
    if (!window.confirm(text.deleteConfirm)) return;
    commitProfile((current) => ({ ...current, movieProjects: current.movieProjects.filter((item) => item.id !== projectId) }));
    if (editingProject?.id === projectId) setEditingProject(null);
  };

  const portalNodes: ReactNode[] = [];
  if (targets.worldMap) {
    portalNodes.push(createPortal(
      <button type="button" className="fw-destination nico-world-destination" onClick={() => openHub("ask")}>
        <span>🧒</span>
        <strong>{text.clubhouse}</strong>
        <small>{text.clubhouseDescription}</small>
      </button>,
      targets.worldMap,
      "nico-world-destination",
    ));
  }
  if (targets.robotHome) {
    portalNodes.push(createPortal(
      <button type="button" className="nico-room-entry" onClick={() => openHub("dress")}>
        <span>🧒</span><strong>{text.robotHome}</strong>
      </button>,
      targets.robotHome,
      "nico-room-entry",
    ));
  }
  if (targets.memoryMain) {
    portalNodes.push(createPortal(
      <MemoryMovieShelf
        profile={profile}
        onOpenStudio={() => openHub("showtime")}
        onOpenProject={(project) => openHub("showtime", project)}
      />,
      targets.memoryMain,
      "nico-memory-shelf",
    ));
  }

  return (
    <>
      {portalNodes}
      {open && createPortal(
        <div className="nico-hub-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeHub();
        }}>
          <section className="nico-hub" role="dialog" aria-modal="true" aria-labelledby="nico-hub-title">
            <header className="nico-hub__header">
              <div className="nico-hub__brand">
                <NicoCostumeFigure artSource={art.source} profession={profile.nico.profession} accentColor={profile.nico.accentColor} compact alt="Nico" />
                <div><small>{profile.language === "es-MX" ? "Privado · Local · Bilingüe" : "Private · Local · Bilingual"}</small><h1 id="nico-hub-title">{text.clubhouse}</h1></div>
              </div>
              <button ref={closeButtonRef} type="button" className="nico-hub__close" onClick={closeHub} aria-label={text.close}>×</button>
            </header>

            <nav className="nico-hub__tabs" aria-label={text.clubhouse}>
              {([
                ["ask", "💬", text.ask],
                ["dress", "🧰", text.dress],
                ["showtime", "🎬", text.showtime],
                ["movies", "🎞️", text.movies],
              ] as Array<[NicoHubTab, string, string]>).map(([item, emoji, label]) => (
                <button
                  type="button"
                  key={item}
                  className={tab === item ? "active" : ""}
                  aria-current={tab === item ? "page" : undefined}
                  onClick={() => openHub(item)}
                >
                  <span>{emoji}</span><strong>{label}</strong>
                </button>
              ))}
            </nav>

            {notice && <p className="nico-hub__notice" role="status">🏆 {notice}</p>}
            {art.error && <p className="nico-hub__warning" role="status">{profile.language === "es-MX" ? "El arte de Nico no pudo cargarse, pero las funciones siguen disponibles." : "Nico’s artwork could not load, but the features remain available."}</p>}

            <div className="nico-hub__content">
              {tab === "ask" && <AskNico language={profile.language} speechEnabled={profile.nico.speechEnabled} />}
              {tab === "dress" && <NicoDressUp language={profile.language} artSource={art.source} preferences={profile.nico} onSave={saveNicoPreferences} />}
              {tab === "showtime" && (
                <ShowtimeStudio
                  profile={profile}
                  nicoArtSource={art.source}
                  initialProject={editingProject}
                  onProjectSaved={saveMovieProject}
                  onProjectDownloaded={markDownloaded}
                />
              )}
              {tab === "movies" && (
                <NicoMovieLibrary
                  language={profile.language}
                  projects={profile.movieProjects}
                  onNewMovie={() => openHub("showtime")}
                  onRecreate={(project) => openHub("showtime", project)}
                  onDelete={deleteProject}
                />
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

export function openNicoWorld(tab: NicoHubTab = "ask", projectId?: string): void {
  window.dispatchEvent(new CustomEvent<OpenNicoDetail>(OPEN_EVENT, { detail: { tab, projectId } }));
}
