import { useEffect, useState } from "react";
import { ApprovedNicoCharacter, useApprovedNicoArt } from "./nico/approvedNicoArt";
import "./nico-guide.css";

type GuideLanguage = "en" | "es-MX";
type NicoHubTab = "ask" | "dress" | "showtime" | "movies";

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

const GUIDE_LANGUAGE_KEY = "nicos-world-guide-language";
const SAVE_KEYS = ["nicos-world-local-save-v3", "nicos-world-local-save-v2"] as const;
const OPEN_NICO_EVENT = "nicos-world-open-nico";

const copy: Record<GuideLanguage, GuideCopy> = {
  en: {
    eyebrow: "Your local adventure guide",
    title: "Hi, I'm Nico!",
    body: "Ask me safe questions, choose an outfit, make a little movie, or continue exploring my world. Your questions and creations stay on this device.",
    worldMap: "Open World Map",
    askNico: "Ask Nico",
    clubhouse: "Open Clubhouse",
    switchLanguage: "Español",
    openLabel: "Meet Nico, your local adventure guide",
    closeLabel: "Close Nico's guide",
    artAlt: "Nico wearing red glasses and exploring with a magnifying glass",
  },
  "es-MX": {
    eyebrow: "Tu guía local de aventuras",
    title: "¡Hola, soy Nico!",
    body: "Hazme preguntas seguras, elige un traje, crea una pequeña película o sigue explorando mi mundo. Tus preguntas y creaciones permanecen en este dispositivo.",
    worldMap: "Abrir mapa del mundo",
    askNico: "Pregúntale a Nico",
    clubhouse: "Abrir Casa Club",
    switchLanguage: "English",
    openLabel: "Conoce a Nico, tu guía local de aventuras",
    closeLabel: "Cerrar la guía de Nico",
    artAlt: "Nico con lentes rojos explorando con una lupa",
  },
};

function detectLanguage(): GuideLanguage {
  const savedGuideLanguage = localStorage.getItem(GUIDE_LANGUAGE_KEY);
  if (savedGuideLanguage === "en" || savedGuideLanguage === "es-MX") return savedGuideLanguage;

  try {
    const raw = SAVE_KEYS.map((key) => localStorage.getItem(key)).find((value) => value !== null) ?? "null";
    const store = JSON.parse(raw) as {
      activeProfileId?: string;
      profiles?: Array<{ id?: string; language?: string }>;
    } | null;
    const activeProfile = store?.profiles?.find((profile) => profile.id === store.activeProfileId) ?? store?.profiles?.[0];
    if (activeProfile?.language === "es-MX") return "es-MX";
  } catch {
    // Fall back to the browser language when no valid local save is available.
  }

  return navigator.language.toLowerCase().startsWith("es") ? "es-MX" : "en";
}

export default function NicoGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<GuideLanguage>(detectLanguage);
  const art = useApprovedNicoArt();
  const text = copy[language];

  useEffect(() => {
    localStorage.setItem(GUIDE_LANGUAGE_KEY, language);
  }, [language]);

  const openWorldMap = () => {
    document.querySelector<HTMLButtonElement>(".fw-brand")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  const openNico = (tab: NicoHubTab) => {
    window.dispatchEvent(new CustomEvent(OPEN_NICO_EVENT, { detail: { tab } }));
    setIsOpen(false);
  };

  return (
    <aside className={`nico-guide ${isOpen ? "nico-guide--open" : ""}`} aria-label={text.openLabel}>
      {isOpen && (
        <section className="nico-guide__panel" id="nico-guide-panel" role="dialog" aria-modal="false" aria-labelledby="nico-guide-title">
          <button className="nico-guide__close" type="button" onClick={() => setIsOpen(false)} aria-label={text.closeLabel}>
            ×
          </button>
          <div className="nico-guide__portrait">
            <ApprovedNicoCharacter source={art.characterSource} pose="guide" className="nico-guide__approved-portrait" alt={text.artAlt} />
          </div>
          <div className="nico-guide__copy">
            <small>{text.eyebrow}</small>
            <h2 id="nico-guide-title">{text.title}</h2>
            <p>{text.body}</p>
            <div className="nico-guide__actions">
              <button type="button" className="nico-guide__primary" onClick={() => openNico("ask")}>
                💬 {text.askNico}
              </button>
              <button type="button" onClick={() => openNico("dress")}>🧰 {text.clubhouse}</button>
              <button type="button" onClick={openWorldMap}>🌍 {text.worldMap}</button>
              <button type="button" onClick={() => setLanguage(language === "en" ? "es-MX" : "en")}>{text.switchLanguage}</button>
            </div>
          </div>
        </section>
      )}

      <button
        className="nico-guide__launcher"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="nico-guide-panel"
        aria-label={isOpen ? text.closeLabel : text.openLabel}
      >
        <ApprovedNicoCharacter source={art.characterSource} pose="guide" className="nico-guide__approved-launcher" alt="" />
        <span>{language === "es-MX" ? "¡Hola!" : "Hi!"}</span>
      </button>
    </aside>
  );
}
