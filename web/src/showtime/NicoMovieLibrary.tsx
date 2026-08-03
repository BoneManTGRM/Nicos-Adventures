import type { Language, MovieProject } from "../types";

type Props = {
  language: Language;
  projects: MovieProject[];
  onRecreate: (project: MovieProject) => void;
  onNewMovie: () => void;
  onDelete: (projectId: string) => void;
};

const copy = {
  en: {
    title: "My Little Movies",
    intro: "Only the project instructions are saved. Recreate a project to make and download a new local video file.",
    empty: "No movie projects yet.",
    newMovie: "Make the first movie",
    recreate: "Recreate video",
    delete: "Delete project",
    characters: "characters",
    seconds: "seconds",
    lastDownload: "Last downloaded",
    never: "Not downloaded yet",
  },
  "es-MX": {
    title: "Mis pequeñas películas",
    intro: "Solo se guardan las instrucciones del proyecto. Recrea un proyecto para crear y descargar un nuevo archivo de video local.",
    empty: "Todavía no hay proyectos de película.",
    newMovie: "Crear la primera película",
    recreate: "Recrear video",
    delete: "Eliminar proyecto",
    characters: "personajes",
    seconds: "segundos",
    lastDownload: "Última descarga",
    never: "Aún no se ha descargado",
  },
} as const;

export function NicoMovieLibrary({ language, projects, onRecreate, onNewMovie, onDelete }: Props) {
  const text = copy[language];
  const formatter = new Intl.DateTimeFormat(language === "es-MX" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="nico-movie-library" aria-labelledby="nico-movies-title">
      <header className="nico-feature-heading">
        <div>
          <small>🎞️ {language === "es-MX" ? "Metadatos ligeros" : "Lightweight project metadata"}</small>
          <h2 id="nico-movies-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
        <button type="button" className="nico-primary-action" onClick={onNewMovie}>＋ {language === "es-MX" ? "Nueva película" : "New movie"}</button>
      </header>

      {!projects.length ? (
        <div className="nico-movie-empty">
          <span aria-hidden="true">🎬</span>
          <p>{text.empty}</p>
          <button type="button" className="nico-primary-action" onClick={onNewMovie}>{text.newMovie}</button>
        </div>
      ) : (
        <div className="nico-movie-grid">
          {[...projects].reverse().map((project) => (
            <article key={project.id} className="nico-movie-card">
              <div className="nico-movie-card__poster">
                <span aria-hidden="true">🎬</span>
                <strong>{project.title}</strong>
              </div>
              <div className="nico-movie-card__body">
                <p>{project.characters.map((character) => character.name).join(" · ")}</p>
                <div className="nico-movie-card__meta">
                  <span>{project.characters.length} {text.characters}</span>
                  <span>{project.durationMs / 1000} {text.seconds}</span>
                  <span>{formatter.format(new Date(project.createdAt))}</span>
                </div>
                <small>{text.lastDownload}: {project.lastDownloadedAt ? formatter.format(new Date(project.lastDownloadedAt)) : text.never}</small>
                <div className="nico-movie-card__actions">
                  <button type="button" className="nico-primary-action" onClick={() => onRecreate(project)}>🎥 {text.recreate}</button>
                  <button type="button" className="nico-danger-action" onClick={() => onDelete(project.id)} aria-label={`${text.delete}: ${project.title}`}>🗑️ {text.delete}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
