import { useEffect, useRef, useState } from "react";
import type { Language } from "../types";
import { loadNicoBasketball, NICO_POSTER } from "./nicoBasketball";
import "./nico-video-card.css";
export function NicoVideoCard({ language }: { language: Language }) {
  const es = language === 'es-MX', video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const attempt = useRef(0);
  useEffect(() => {
    const pause = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener("visibilitychange", pause);
    return () => { attempt.current++; document.removeEventListener("visibilitychange", pause); };
  }, []);
  const play = async () => {
    const el = video.current;
    if (!el) return;
    const current = ++attempt.current;
    setError(false);
    try {
      if (!el.getAttribute("src")) {
        setLoading(true);
        el.load();
        const url = await loadNicoBasketball();
        if (current !== attempt.current) return;
        el.src = url;
        setLoading(false);
      } else if (el.error) {
        el.load();
      }
      await el.play();
    } catch (cause) {
      // A browser that requires a second gesture can now use the loaded native controls.
      if (current === attempt.current && !(cause instanceof DOMException && cause.name === "NotAllowedError")) {
        setError(true);
      }
    } finally {
      if (current === attempt.current) setLoading(false);
    }
  };
  return <article id="nico-tv" className="nico-video-card" aria-label="Nico TV">
    <div className="nico-video-card__copy"><small>Nico TV</small><h2>{es ? 'Mira a Nico jugar' : 'Watch Nico play'}</h2>
      <p>{es ? 'Mira una aventura. Después, crea la tuya.' : 'Watch an adventure. Then make your own.'}</p>
      <button className="nico-video-card__play" type="button" onClick={play} disabled={loading}>{loading ? (es ? "Cargando…" : "Loading…") : <>▶ {es ? 'Reproducir el video de Nico' : 'Play Nico’s video'}</>}</button>
      {error && <div className="nico-video-card__error" role="status"><p>{es ? 'No se pudo reproducir el video.' : 'The video could not play.'}</p><button onClick={play}>{es ? 'Intentar de nuevo' : 'Try again'}</button></div>}
    </div><div className="nico-video-card__frame"><video ref={video} onClick={() => { if (!video.current?.getAttribute("src")) play(); }} poster={NICO_POSTER} controls playsInline preload="none" aria-label={es ? 'Video de Nico' : 'Nico video'} onError={() => { if (video.current?.getAttribute("src")) setError(true); }} onPlaying={() => setError(false)} /></div>
  </article>;
}
