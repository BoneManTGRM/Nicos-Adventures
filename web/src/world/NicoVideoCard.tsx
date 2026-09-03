import { useEffect, useRef, useState } from "react";
import type { LocalProfile } from "../types";
import "./nico-video-card.css";

const VIDEO_PARTS = Array.from({ length: 11 }, (_, index) =>
  `/assets/nico/video/nico-basketball.part${String(index + 1).padStart(2, "0")}.b64?v=1`,
);
const POSTER_PART = "/assets/nico/video/nico-basketball-poster.b64?v=1";

const copy = {
  en: {
    eyebrow: "A moment with Nico",
    title: "Watch Nico play",
    body: "A fun clip of Nico playing basketball.",
    play: "Play Nico’s video",
    loading: "Loading Nico’s video…",
    fallback: "Your browser cannot play this video.",
  },
  "es-MX": {
    eyebrow: "Un momento con Nico",
    title: "Mira a Nico jugar",
    body: "Un divertido clip de Nico jugando básquetbol.",
    play: "Reproducir el video de Nico",
    loading: "Cargando el video de Nico…",
    fallback: "Tu navegador no puede reproducir este video.",
  },
} as const;

async function fetchText(path: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(path, { cache: "force-cache", signal });
  if (!response.ok) throw new Error(`Nico video asset failed: ${response.status}`);
  return (await response.text()).trim();
}

function base64ToBlobUrl(encoded: string, mimeType: string): string {
  const decoded = atob(encoded);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) bytes[index] = decoded.charCodeAt(index);
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

export function NicoVideoCard({ language }: { language: LocalProfile["language"] }) {
  const text = copy[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let createdVideoUrl = "";
    const load = async () => {
      try {
        const [videoParts, poster] = await Promise.all([
          Promise.all(VIDEO_PARTS.map((part) => fetchText(part, controller.signal))),
          fetchText(POSTER_PART, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        createdVideoUrl = base64ToBlobUrl(videoParts.join(""), "video/mp4");
        setVideoUrl(createdVideoUrl);
        setPosterUrl(`data:image/jpeg;base64,${poster}`);
      } catch {
        if (!controller.signal.aborted) {
          setVideoUrl("");
          setPosterUrl("");
        }
      }
    };
    void load();
    return () => {
      controller.abort();
      if (createdVideoUrl) URL.revokeObjectURL(createdVideoUrl);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [videoUrl]);

  const play = () => {
    void videoRef.current?.play();
  };

  return (
    <article className="nico-video-card" aria-labelledby="nico-video-title">
      <div className="nico-video-card__copy">
        <small>{text.eyebrow}</small>
        <h2 id="nico-video-title">{text.title}</h2>
        <p>{text.body}</p>
        <button type="button" className="nico-video-card__play" onClick={play} disabled={!videoUrl}>
          <span aria-hidden="true">▶</span> {videoUrl ? text.play : text.loading}
        </button>
      </div>
      <div className={`nico-video-card__frame${playing ? " is-playing" : ""}`}>
        <video
          key={videoUrl}
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={posterUrl || undefined}
          aria-label={text.play}
        >
          {videoUrl && <source src={videoUrl} type="video/mp4" />}
          {text.fallback}
        </video>
      </div>
    </article>
  );
}
