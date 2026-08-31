import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useActiveProfileStore } from "../hooks/useActiveProfileStore";
import { useDialogFocusTrap } from "../hooks/useDialogFocusTrap";
import type { MovieProject } from "../types";
import { NicoMovieLibrary } from "../showtime/NicoMovieLibrary";
import { ShowtimeStudio } from "../showtime/ShowtimeStudio";
import { AskNico } from "./AskNico";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { NicoDressUp } from "./NicoDressUp";
import {
  isNicoHubHistoryState,
  makeNicoHubHistoryState,
  nicoHubHash,
  parseNicoHubHash,
  type NicoHubTab,
} from "./nicoHubRoute";
import "./nico-world-experience.css";
import "../showtime/showtime.css";

export type { NicoHubTab } from "./nicoHubRoute";

type OpenNicoDetail = {
  tab?: NicoHubTab;
  projectId?: string;
};

const OPEN_EVENT = "nicos-world-open-nico";

const copy = {
  en: {
    clubhouse: "Nico’s Clubhouse",
    ask: "Ask Nico",
    dress: "Wardrobe",
    showtime: "Showtime",
    movies: "Movies",
    close: "Close Nico’s Clubhouse",
    memoryTitle: "Showtime Movies",
    memoryIntro: "Recreate a saved project to make another private local download.",
    noMovies: "No movie projects yet.",
    openShowtime: "Open Showtime Studio",
    firstBadge: "First Movie Director badge earned!",
    deleteConfirm: "Delete this movie project? Downloaded video files are not stored in the app.",
  },
  "es-MX": {
    clubhouse: "Casa Club de Nico",
    ask: "Pregúntale",
    dress: "Guardarropa",
    showtime: "Showtime",
    movies: "Películas",
    close: "Cerrar la Casa Club de Nico",
    memoryTitle: "Películas Showtime",
    memoryIntro: "Recrea un proyecto guardado para hacer otra descarga privada y local.",
    noMovies: "Todavía no hay proyectos de película.",
    openShowtime: "Abrir Estudio Showtime",
    firstBadge: "¡Ganaste la insignia de Director de Primera Película!",
    deleteConfirm: "¿Eliminar este proyecto? Los videos descargados no se guardan en la aplicación.",
  },
} as const;

function MemoryMovieShelf({
  profile,
  onOpenProject,
  onOpenStudio,
}: {
  profile: ReturnType<typeof useActiveProfileStore>["profile"];
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
  const { profile, commitProfile } = useActiveProfileStore();
  const initialTab = parseNicoHubHash(window.location.hash);
  const [open, setOpen] = useState(initialTab !== null);
  const [tab, setTab] = useState<NicoHubTab>(initialTab ?? "ask");
  const [editingProject, setEditingProject] = useState<MovieProject | null>(null);
  const [notice, setNotice] = useState("");
  const [memoryTarget, setMemoryTarget] = useState<Element | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const text = copy[profile.language];

  const openHub = useCallback((nextTab: NicoHubTab, project: MovieProject | null = null) => {
    setEditingProject(project);
    setTab(nextTab);
    setOpen(true);
    const nextHash = nicoHubHash(nextTab);
    const nextState = makeNicoHubHistoryState(window.history.state);
    if (parseNicoHubHash(window.location.hash)) {
      window.history.replaceState(nextState, "", nextHash);
    } else {
      window.history.pushState(nextState, "", nextHash);
    }
  }, []);

  const closeHub = useCallback(() => {
    setOpen(false);
    setNotice("");
    setEditingProject(null);
    if (!parseNicoHubHash(window.location.hash)) return;
    if (isNicoHubHistoryState(window.history.state)) {
      window.history.back();
    } else {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useDialogFocusTrap({
    open,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose: closeHub,
  });

  useEffect(() => {
    const syncFromLocation = () => {
      const next = parseNicoHubHash(window.location.hash);
      if (next) {
        setTab(next);
        setOpen(true);
      } else {
        setOpen(false);
        setEditingProject(null);
        setNotice("");
      }
    };
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenNicoDetail>).detail;
      const nextTab = detail?.tab ?? "ask";
      const project = detail?.projectId
        ? profile.movieProjects.find((item) => item.id === detail.projectId) ?? null
        : null;
      openHub(nextTab, project);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [openHub, profile.movieProjects]);

  useEffect(() => {
    if (profile.selectedSection !== "memory-book") {
      setMemoryTarget(null);
      return;
    }
    let frame = 0;
    const syncTarget = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setMemoryTarget(document.querySelector(".fw-app main")));
    };
    syncTarget();
    const observer = new MutationObserver(syncTarget);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [profile.selectedSection]);

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
    commitProfile((current) => ({
      ...current,
      movieProjects: current.movieProjects.filter((item) => item.id !== projectId),
    }));
    if (editingProject?.id === projectId) setEditingProject(null);
  };

  return (
    <>
      {memoryTarget && createPortal(
        <MemoryMovieShelf
          profile={profile}
          onOpenStudio={() => openHub("showtime")}
          onOpenProject={(project) => openHub("showtime", project)}
        />,
        memoryTarget,
        "nico-memory-shelf",
      )}

      {open && createPortal(
        <div
          className="nico-hub-backdrop"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeHub();
          }}
        >
          <section
            ref={dialogRef}
            className="nico-hub"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nico-hub-title"
            tabIndex={-1}
          >
            <header className="nico-hub__header">
              <div className="nico-hub__brand">
                <NicoCostumeFigure
                  profession={profile.nico.profession}
                  wardrobe={profile.nico.wardrobe}
                  accentColor={profile.nico.accentColor}
                  compact
                  alt="Nico"
                />
                <div>
                  <small>{profile.language === "es-MX" ? "Privado · Local · Bilingüe" : "Private · Local · Bilingual"}</small>
                  <h1 id="nico-hub-title">{text.clubhouse}</h1>
                </div>
              </div>
              <button ref={closeButtonRef} type="button" className="nico-hub__close" onClick={closeHub} aria-label={text.close}>×</button>
            </header>

            <nav className="nico-hub__tabs" aria-label={text.clubhouse}>
              {([
                ["ask", "💬", text.ask],
                ["dress", "🧵", text.dress],
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

            <div className="nico-hub__content">
              {tab === "ask" && (
                <AskNico
                  language={profile.language}
                  speechEnabled={profile.nico.speechEnabled}
                  profession={profile.nico.profession}
                  wardrobe={profile.nico.wardrobe}
                  accentColor={profile.nico.accentColor}
                />
              )}
              {tab === "dress" && (
                <NicoDressUp
                  language={profile.language}
                  preferences={profile.nico}
                  onSave={(nico) => commitProfile((current) => ({ ...current, nico }))}
                />
              )}
              {tab === "showtime" && (
                <ShowtimeStudio
                  profile={profile}
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
