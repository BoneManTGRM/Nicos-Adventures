import { useEffect, useRef, useState } from "react";
import { useAppStore } from "./app/AppStoreContext";
import { NicoCostumeFigure } from "./nico/NicoCostumeFigure";
import { NICO_BASKETBALL_MEDIA, loadBase64Media } from "./nico/nicoBasketballMedia";
import { openNicoWorld } from "./nico/NicoWorldExperience";
import "./nico-guide.css";

type GuideCopy = {
  eyebrow: string;
  title: string;
  body: string;
  worldMap: string;
  askNico: string;
  clubhouse: string;
  watchNico: string;
  switchLanguage: string;
  openLabel: string;
  closeLabel: string;
  artAlt: string;
  videoEyebrow: string;
  videoTitle: string;
  videoBody: string;
  videoPlayLabel: string;
  videoCloseLabel: string;
  videoDoneLabel: string;
  videoLoading: string;
  videoUnavailable: string;
  videoRetry: string;
};

type MediaState =
  | { status: "idle" | "loading" | "error"; videoUrl: ""; posterUrl: "" }
  | { status: "ready"; videoUrl: string; posterUrl: string };

const EMPTY_MEDIA: MediaState = { status: "idle", videoUrl: "", posterUrl: "" };

const copy: Record<"en" | "es-MX", GuideCopy> = {
  en: {
    eyebrow: "Your local adventure guide",
    title: "Hi, I'm Nico!",
    body: "Ask me safe questions, watch me play basketball, make a little movie, or continue exploring my world. Your saved progress stays on this device.",
    worldMap: "Open World Map",
    askNico: "Ask Nico",
    clubhouse: "Open Clubhouse",
    watchNico: "Watch Nico play",
    switchLanguage: "Español",
    openLabel: "Meet Nico, your local adventure guide",
    closeLabel: "Close Nico's guide",
    artAlt: "Nico in his premium explorer artwork",
    videoEyebrow: "Nico TV · Real-world moment",
    videoTitle: "Nico on the basketball court",
    videoBody: "A quick five-second highlight of Nico taking the ball to the hoop.",
    videoPlayLabel: "Video of Nico playing basketball",
    videoCloseLabel: "Close Nico's basketball video",
    videoDoneLabel: "Back to Nico's World",
    videoLoading: "Preparing Nico's basketball highlight…",
    videoUnavailable: "Nico's video could not be loaded on this device.",
    videoRetry: "Try again",
  },
  "es-MX": {
    eyebrow: "Tu guía local de aventuras",
    title: "¡Hola, soy Nico!",
    body: "Hazme preguntas seguras, mírame jugar básquetbol, crea una pequeña película o sigue explorando. Tu progreso guardado permanece en este dispositivo.",
    worldMap: "Abrir mapa del mundo",
    askNico: "Pregúntale a Nico",
    clubhouse: "Abrir Casa Club",
    watchNico: "Ver a Nico jugar",
    switchLanguage: "English",
    openLabel: "Conoce a Nico, tu guía local de aventuras",
    closeLabel: "Cerrar la guía de Nico",
    artAlt: "Nico en su ilustración prémium de explorador",
    videoEyebrow: "Nico TV · Momento de la vida real",
    videoTitle: "Nico en la cancha de básquetbol",
    videoBody: "Un momento de cinco segundos de Nico llevando el balón hasta el aro.",
    videoPlayLabel: "Video de Nico jugando básquetbol",
    videoCloseLabel: "Cerrar el video de básquetbol de Nico",
    videoDoneLabel: "Volver al Mundo de Nico",
    videoLoading: "Preparando el momento de básquetbol de Nico…",
    videoUnavailable: "No se pudo cargar el video de Nico en este dispositivo.",
    videoRetry: "Intentar de nuevo",
  },
};

export default function NicoGuide() {
  const { profile, commitProfile } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mediaAttempt, setMediaAttempt] = useState(0);
  const [media, setMedia] = useState<MediaState>(EMPTY_MEDIA);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const videoDialogRef = useRef<HTMLElement>(null);
  const videoCloseRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const text = copy[profile.language];

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      launcherRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isVideoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => videoCloseRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsVideoOpen(false);
        launcherRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(videoDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), video[controls], [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      videoRef.current?.pause();
    };
  }, [isVideoOpen]);

  useEffect(() => {
    if (!isVideoOpen) {
      setMedia(EMPTY_MEDIA);
      return;
    }

    const controller = new AbortController();
    let videoUrl = "";
    let posterUrl = "";
    setMedia({ status: "loading", videoUrl: "", posterUrl: "" });

    void Promise.all([
      loadBase64Media(
        NICO_BASKETBALL_MEDIA.videoParts,
        "video/mp4",
        NICO_BASKETBALL_MEDIA.videoBytes,
        controller.signal,
      ),
      loadBase64Media(
        NICO_BASKETBALL_MEDIA.posterParts,
        "image/jpeg",
        NICO_BASKETBALL_MEDIA.posterBytes,
        controller.signal,
      ),
    ]).then(([videoBlob, posterBlob]) => {
      if (controller.signal.aborted) return;
      videoUrl = URL.createObjectURL(videoBlob);
      posterUrl = URL.createObjectURL(posterBlob);
      setMedia({ status: "ready", videoUrl, posterUrl });
    }).catch(() => {
      if (!controller.signal.aborted) setMedia({ status: "error", videoUrl: "", posterUrl: "" });
    });

    return () => {
      controller.abort();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (posterUrl) URL.revokeObjectURL(posterUrl);
    };
  }, [isVideoOpen, mediaAttempt]);

  const openWorldMap = () => {
    commitProfile((current) => ({ ...current, selectedSection: "world-map" }));
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("page-title")?.focus({ preventScroll: true });
      });
    });
    setIsOpen(false);
  };

  const openNico = (tab: "ask") => {
    openNicoWorld(tab);
    setIsOpen(false);
  };

  const openVideo = () => {
    setIsOpen(false);
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    videoRef.current?.pause();
    setIsVideoOpen(false);
    window.requestAnimationFrame(() => launcherRef.current?.focus());
  };

  const switchLanguage = () => {
    commitProfile((current) => ({
      ...current,
      language: current.language === "en" ? "es-MX" : "en",
    }));
  };

  const character = (alt: string) => (
    <NicoCostumeFigure
      profession={profile.nico.profession}
      wardrobe={profile.nico.wardrobe}
      accentColor={profile.nico.accentColor}
      compact
      alt={alt}
    />
  );

  return (
    <>
      <aside className={`nico-guide ${isOpen ? "nico-guide--open" : ""}`} aria-label={text.openLabel}>
        {isOpen && (
          <section className="nico-guide__panel" id="nico-guide-panel" role="dialog" aria-modal="false" aria-labelledby="nico-guide-title">
            <button className="nico-guide__close" type="button" onClick={() => setIsOpen(false)} aria-label={text.closeLabel}>×</button>
            <div className="nico-guide__portrait">{character(text.artAlt)}</div>
            <div className="nico-guide__copy">
              <small>{text.eyebrow}</small>
              <h2 id="nico-guide-title">{text.title}</h2>
              <p>{text.body}</p>
              <div className="nico-guide__actions">
                <button type="button" className="nico-guide__primary" onClick={openVideo}>🏀 {text.watchNico}</button>
                <button type="button" onClick={() => openNico("ask")}>💬 {text.askNico}</button>
                <button type="button" onClick={() => openNico("ask")}>🏠 {text.clubhouse}</button>
                <button type="button" onClick={openWorldMap}>🌍 {text.worldMap}</button>
                <button type="button" onClick={switchLanguage}>{text.switchLanguage}</button>
              </div>
            </div>
          </section>
        )}

        <button
          ref={launcherRef}
          className="nico-guide__launcher"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="nico-guide-panel"
          aria-label={isOpen ? text.closeLabel : text.openLabel}
        >
          {character("")}
          <span className="nico-guide__video-badge" aria-hidden="true">▶</span>
          <span>{profile.language === "es-MX" ? "¡Hola!" : "Hi!"}</span>
        </button>
      </aside>

      {isVideoOpen && (
        <div
          className="nico-video"
          onClick={(event) => {
            if (event.currentTarget === event.target) closeVideo();
          }}
        >
          <section
            ref={videoDialogRef}
            className="nico-video__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nico-video-title"
            aria-describedby="nico-video-description"
          >
            <button
              ref={videoCloseRef}
              className="nico-video__close"
              type="button"
              onClick={closeVideo}
              aria-label={text.videoCloseLabel}
            >
              ×
            </button>
            <div className="nico-video__media">
              {media.status === "ready" ? (
                <video
                  ref={videoRef}
                  key={media.videoUrl}
                  src={media.videoUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={media.posterUrl}
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                  aria-label={text.videoPlayLabel}
                  onCanPlay={() => {
                    void videoRef.current?.play().catch(() => undefined);
                  }}
                >
                  {text.videoUnavailable}
                </video>
              ) : (
                <div className={`nico-video__status nico-video__status--${media.status}`} role="status" aria-live="polite">
                  {media.status === "error" ? (
                    <>
                      <span aria-hidden="true">🏀</span>
                      <p>{text.videoUnavailable}</p>
                      <button type="button" onClick={() => setMediaAttempt((attempt) => attempt + 1)}>
                        ↻ {text.videoRetry}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="nico-video__spinner" aria-hidden="true" />
                      <p>{text.videoLoading}</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="nico-video__copy">
              <small>{text.videoEyebrow}</small>
              <h2 id="nico-video-title">{text.videoTitle}</h2>
              <p id="nico-video-description">{text.videoBody}</p>
              <button className="nico-video__done" type="button" onClick={closeVideo}>
                ← {text.videoDoneLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
