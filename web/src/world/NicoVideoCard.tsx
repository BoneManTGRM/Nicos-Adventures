import { useEffect, useRef, useState } from "react";
import type { LocalProfile } from "../types";
import "./nico-video-card.css";

const VIDEO_URL = "/assets/nico/nico-basketball.mp4?v=1";
const POSTER_URL = "/assets/nico/nico-basketball-poster.jpg?v=1";

const copy = {
  en: {
    eyebrow: "A moment with Nico",
    title: "Watch Nico play",
    body: "A quick real-life clip from Nico’s adventures.",
    play: "Play Nico’s video",
    fallback: "Your browser cannot play this video.",
  },
  "es-MX": {
    eyebrow: "Un momento con Nico",
    title: "Mira a Nico jugar",
    body: "Un clip corto de la vida real de las aventuras de Nico.",
    play: "Reproducir el video de Nico",
    fallback: "Tu navegador no puede reproducir este video.",
  },
} as const;

export function NicoVideoCard({ language }: { language: LocalProfile["language"] }) {
  const text = copy[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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
  }, []);

  const play = () => {
    void videoRef.current?.play();
  };

  return (
    <article className="nico-video-card" aria-labelledby="nico-video-title">
      <div className="nico-video-card__copy">
        <small>{text.eyebrow}</small>
        <h2 id="nico-video-title">{text.title}</h2>
        <p>{text.body}</p>
        <button type="button" className="nico-video-card__play" onClick={play}>
          <span aria-hidden="true">▶</span> {text.play}
        </button>
      </div>
      <div className={`nico-video-card__frame${playing ? " is-playing" : ""}`}>
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster={POSTER_URL}
          aria-label={text.play}
        >
          <source src={VIDEO_URL} type="video/mp4" />
          {text.fallback}
        </video>
      </div>
    </article>
  );
}
