import { useEffect, useRef, useState } from "react";
import { useAppStore } from "./app/AppStoreContext";
import { NicoCostumeFigure } from "./nico/NicoCostumeFigure";
import { openNicoWorld } from "./nico/NicoWorldExperience";
import "./nico-guide.css";

type GuideCopy = {
  eyebrow: string;
  title: string;
  body: string;
  worldMap: string;
  askNico: string;
  clubhouse: string;
  switchLanguage: string;
  openLabel: string;
  closeLabel: string;
  artAlt: string;
};

const copy: Record<"en" | "es-MX", GuideCopy> = {
  en: {
    eyebrow: "Your local adventure guide",
    title: "Hi, I'm Nico!",
    body: "Ask me safe questions, build my outfit piece by piece, make a little movie, or continue exploring my world. Everything stays on this device.",
    worldMap: "Open World Map",
    askNico: "Ask Nico",
    clubhouse: "Open Clubhouse",
    switchLanguage: "Español",
    openLabel: "Meet Nico, your local adventure guide",
    closeLabel: "Close Nico's guide",
    artAlt: "Nico wearing his saved layered wardrobe",
  },
  "es-MX": {
    eyebrow: "Tu guía local de aventuras",
    title: "¡Hola, soy Nico!",
    body: "Hazme preguntas seguras, arma mi ropa pieza por pieza, crea una pequeña película o sigue explorando. Todo permanece en este dispositivo.",
    worldMap: "Abrir mapa del mundo",
    askNico: "Pregúntale a Nico",
    clubhouse: "Abrir Casa Club",
    switchLanguage: "English",
    openLabel: "Conoce a Nico, tu guía local de aventuras",
    closeLabel: "Cerrar la guía de Nico",
    artAlt: "Nico con su guardarropa en capas guardado",
  },
};

export default function NicoGuide() {
  const { profile, commitProfile } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
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

  const openWorldMap = () => {
    commitProfile((current) => ({ ...current, selectedSection: "world-map" }));
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      document.getElementById("page-title")?.focus({ preventScroll: true });
    });
    setIsOpen(false);
  };

  const openNico = (tab: "ask" | "dress") => {
    openNicoWorld(tab);
    setIsOpen(false);
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
              <button type="button" className="nico-guide__primary" onClick={() => openNico("ask")}>💬 {text.askNico}</button>
              <button type="button" onClick={() => openNico("dress")}>🧰 {text.clubhouse}</button>
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
        <span>{profile.language === "es-MX" ? "¡Hola!" : "Hi!"}</span>
      </button>
    </aside>
  );
}
