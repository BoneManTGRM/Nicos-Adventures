import { useEffect, useState } from "react";
import "./nico-guide.css";

type GuideLanguage = "en" | "es-MX";

type GuideCopy = {
  eyebrow: string;
  title: string;
  body: string;
  worldMap: string;
  switchLanguage: string;
  openLabel: string;
  closeLabel: string;
  artAlt: string;
};

const GUIDE_LANGUAGE_KEY = "nicos-world-guide-language";
const SAVE_KEY = "nicos-world-local-save-v2";
const NICO_ART_PAYLOAD = "/assets/nico/nico-guide-art.b64?v=2";

const copy: Record<GuideLanguage, GuideCopy> = {
  en: {
    eyebrow: "Your adventure guide",
    title: "Hi, I'm Nico!",
    body: "This is my world. Pick a destination, build a robot, discover animals, create stories, and collect stars.",
    worldMap: "Open World Map",
    switchLanguage: "Español",
    openLabel: "Meet Nico, your adventure guide",
    closeLabel: "Close Nico's guide",
    artAlt: "Nico wearing red glasses and exploring with a magnifying glass",
  },
  "es-MX": {
    eyebrow: "Tu guía de aventuras",
    title: "¡Hola, soy Nico!",
    body: "Este es mi mundo. Elige un destino, construye un robot, descubre animales, crea cuentos y colecciona estrellas.",
    worldMap: "Abrir mapa del mundo",
    switchLanguage: "English",
    openLabel: "Conoce a Nico, tu guía de aventuras",
    closeLabel: "Cerrar la guía de Nico",
    artAlt: "Nico con lentes rojos explorando con una lupa",
  },
};

function detectLanguage(): GuideLanguage {
  const savedGuideLanguage = localStorage.getItem(GUIDE_LANGUAGE_KEY);
  if (savedGuideLanguage === "en" || savedGuideLanguage === "es-MX") return savedGuideLanguage;

  try {
    const store = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as {
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
  const [artSource, setArtSource] = useState<string>("");
  const text = copy[language];

  useEffect(() => {
    localStorage.setItem(GUIDE_LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(NICO_ART_PAYLOAD, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Nico art request failed: ${response.status}`);
        return response.text();
      })
      .then((payload) => {
        const encoded = payload.trim();
        if (!encoded.startsWith("/9j/")) throw new Error("Nico art payload is not a JPEG");
        setArtSource(`data:image/jpeg;base64,${encoded}`);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const openWorldMap = () => {
    document.querySelector<HTMLButtonElement>(".fw-brand")?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  const artwork = (alt: string) =>
    artSource ? (
      <img src={artSource} alt={alt} data-asset-recovery="ignore" decoding="async" />
    ) : (
      <span className="nico-guide__art-fallback" aria-hidden="true">N</span>
    );

  return (
    <aside className={`nico-guide ${isOpen ? "nico-guide--open" : ""}`} aria-label={text.openLabel}>
      {isOpen && (
        <section className="nico-guide__panel" id="nico-guide-panel" role="dialog" aria-modal="false" aria-labelledby="nico-guide-title">
          <button className="nico-guide__close" type="button" onClick={() => setIsOpen(false)} aria-label={text.closeLabel}>
            ×
          </button>
          <div className="nico-guide__portrait">{artwork(text.artAlt)}</div>
          <div className="nico-guide__copy">
            <small>{text.eyebrow}</small>
            <h2 id="nico-guide-title">{text.title}</h2>
            <p>{text.body}</p>
            <div className="nico-guide__actions">
              <button type="button" className="nico-guide__primary" onClick={openWorldMap}>
                🌍 {text.worldMap}
              </button>
              <button type="button" onClick={() => setLanguage(language === "en" ? "es-MX" : "en")}>
                {text.switchLanguage}
              </button>
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
        {artwork("")}
        <span>{language === "es-MX" ? "¡Hola!" : "Hi!"}</span>
      </button>
    </aside>
  );
}
