import { useEffect, useRef, useState } from "react";
import type { Language } from "../types";
import "./nico-video-card.css";
export const NICO_VIDEO = "/assets/nico/video/nico-basketball.mp4";
export const NICO_POSTER = "/assets/nico/video/nico-basketball-poster.jpg";
export function NicoVideoCard({ language }: { language: Language }) {
  const es = language === 'es-MX', video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const attempt = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => {
    const pause = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener('visibilitychange', pause);
    return () => { attempt.current++; clearTimer(); document.removeEventListener('visibilitychange', pause); };
  }, []);
  const play = () => {
    const current = ++attempt.current;
    clearTimer();
    const el = video.current; if (!el) return;
    if (!el.getAttribute('src')) el.src = NICO_VIDEO;
    if (error || el.error) el.load();
    setError(false);
    // WebKit can leave play() pending on a failed media request without an error event.
    timer.current = setTimeout(() => { if (attempt.current === current) setError(true); }, 8000);
    void el.play().catch(() => { if (attempt.current === current) { clearTimer(); setError(true); } });
  };
  return <article className="nico-video-card" aria-label="Nico TV">
    <div className="nico-video-card__copy"><small>Nico TV</small><h2>{es ? 'Mira a Nico jugar' : 'Watch Nico play'}</h2>
      <p>{es ? 'Mira una aventura. Después, crea la tuya.' : 'Watch an adventure. Then make your own.'}</p>
      <button className="nico-video-card__play" type="button" onClick={play}>▶ {es ? 'Reproducir el video de Nico' : 'Play Nico’s video'}</button>
      {error && <div className="nico-video-card__error" role="status"><p>{es ? 'No se pudo reproducir el video.' : 'The video could not play.'}</p><button onClick={play}>{es ? 'Intentar de nuevo' : 'Try again'}</button></div>}
    </div><div className="nico-video-card__frame"><video ref={video} onClick={() => { if (!video.current?.getAttribute("src")) play(); }} poster={NICO_POSTER} controls playsInline preload="none" aria-label={es ? 'Video de Nico' : 'Nico video'} onError={() => { clearTimer(); setError(true); }} onPlaying={() => { clearTimer(); setError(false); }} /></div>
  </article>;
}
