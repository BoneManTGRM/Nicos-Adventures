import { useMemo, useState, type CSSProperties } from "react";
import beccaArt from "../assets/art/becca-premium.webp";
import luaArt from "../assets/art/lua-premium.webp";
import mapArt from "../assets/art/cousins-adventure-map.webp";
import rainbowOne from "../assets/art/story-rainbow-1.webp";
import rainbowTwo from "../assets/art/story-rainbow-2.webp";
import rainbowThree from "../assets/art/story-rainbow-3.webp";
import rainbowFour from "../assets/art/story-rainbow-4.webp";
import rainbowFive from "../assets/art/story-rainbow-5.webp";
import rainbowSix from "../assets/art/story-rainbow-6.webp";
import dinoOne from "../assets/art/story-dino-1.webp";
import dinoTwo from "../assets/art/story-dino-2.webp";
import dinoThree from "../assets/art/story-dino-3.webp";
import dinoFour from "../assets/art/story-dino-4.webp";
import dinoFive from "../assets/art/story-dino-5.webp";
import dinoSix from "../assets/art/story-dino-6.webp";
import starOne from "../assets/art/story-star-1.webp";
import starTwo from "../assets/art/story-star-2.webp";
import starThree from "../assets/art/story-star-3.webp";
import starFour from "../assets/art/story-star-4.webp";
import starFive from "../assets/art/story-star-5.webp";
import starSix from "../assets/art/story-star-6.webp";
import castleOne from "../assets/art/story-castle-1.webp";
import castleTwo from "../assets/art/story-castle-2.webp";
import castleThree from "../assets/art/story-castle-3.webp";
import castleFour from "../assets/art/story-castle-4.webp";
import castleFive from "../assets/art/story-castle-5.webp";
import castleSix from "../assets/art/story-castle-6.webp";
import moonOne from "../assets/art/story-moon-1.webp";
import moonTwo from "../assets/art/story-moon-2.webp";
import moonThree from "../assets/art/story-moon-3.webp";
import moonFour from "../assets/art/story-moon-4.webp";
import moonFive from "../assets/art/story-moon-5.webp";
import moonSix from "../assets/art/story-moon-6.webp";
import { NicoCostumeFigure } from "../nico/NicoCostumeFigure";
import type { Language } from "../types";
import { PremiumCutout } from "./PremiumCutout";
import {
  buildCousinsStory,
  COUSINS_DESTINATIONS,
  THEME_LABELS,
  type AdventureTheme,
  type CousinLead,
  type CousinsDestinationId,
} from "./cousinsAdventureStories";
import "./cousins-adventure.css";

const leadLabels: Record<CousinLead, string> = { nico: "Nico", becca: "Becca", lua: "Lua" };
const storyScenes: Record<CousinsDestinationId, [string, string, string, string, string, string]> = {
  "rainbow-forest": [rainbowOne, rainbowTwo, rainbowThree, rainbowFour, rainbowFive, rainbowSix],
  "dino-valley": [dinoOne, dinoTwo, dinoThree, dinoFour, dinoFive, dinoSix],
  "star-harbor": [starOne, starTwo, starThree, starFour, starFive, starSix],
  "sky-castle": [castleOne, castleTwo, castleThree, castleFour, castleFive, castleSix],
  "moon-garden": [moonOne, moonTwo, moonThree, moonFour, moonFive, moonSix],
};

const interactiveChoices = {
  en: [
    { id: "look", icon: "🔎", label: "Look for a tiny clue", result: "You spotted a hidden trail marker. Great observing!" },
    { id: "listen", icon: "👂", label: "Listen for a friendly sound", result: "You heard the direction of the next clue. Careful listening worked!" },
    { id: "team", icon: "🤝", label: "Ask the cousins to compare ideas", result: "All three ideas fit together and revealed the path. Teamwork wins!" },
  ],
  "es-MX": [
    { id: "look", icon: "🔎", label: "Buscar una pista pequeñita", result: "Encontraste una señal escondida. ¡Qué buena observación!" },
    { id: "listen", icon: "👂", label: "Escuchar un sonido amistoso", result: "Escuchaste la dirección de la siguiente pista. ¡Funcionó escuchar con cuidado!" },
    { id: "team", icon: "🤝", label: "Comparar las ideas de los primos", result: "Las tres ideas encajaron y revelaron el camino. ¡Ganó el trabajo en equipo!" },
  ],
} as const;

const pathChoices = {
  en: [
    { id: "build", icon: "🧰", label: "Build a clever helper", result: "They built exactly what the adventure needed from the materials nearby." },
    { id: "befriend", icon: "💗", label: "Ask a new friend for help", result: "A friendly creature joined the team and showed them a path they had missed." },
    { id: "experiment", icon: "✨", label: "Try a safe magical experiment", result: "Their careful experiment revealed a bright new route through the mystery." },
  ],
  "es-MX": [
    { id: "build", icon: "🧰", label: "Construir una ayuda ingeniosa", result: "Construyeron justo lo que la aventura necesitaba con los materiales cercanos." },
    { id: "befriend", icon: "💗", label: "Pedir ayuda a una nueva amistad", result: "Una criatura amistosa se unió al equipo y les mostró un camino escondido." },
    { id: "experiment", icon: "✨", label: "Probar un experimento mágico seguro", result: "Su experimento cuidadoso reveló una ruta brillante por el misterio." },
  ],
} as const;

export function CousinsAdventure({ language }: { language: Language }) {
  const [destinationId, setDestinationId] = useState<CousinsDestinationId>("rainbow-forest");
  const [theme, setTheme] = useState<AdventureTheme>("brave");
  const [lead, setLead] = useState<CousinLead>("nico");
  const [pageIndex, setPageIndex] = useState(0);
  const [clueChoice, setClueChoice] = useState<string | null>(null);
  const [pathChoice, setPathChoice] = useState<string | null>(null);
  const destination = COUSINS_DESTINATIONS.find((item) => item.id === destinationId) ?? COUSINS_DESTINATIONS[0];
  const pages = useMemo(() => buildCousinsStory(language, destinationId, theme, lead), [destinationId, language, lead, theme]);
  const page = pages[pageIndex];
  const chooseDestination = (next: CousinsDestinationId) => {
    setDestinationId(next);
    setPageIndex(0);
    setClueChoice(null);
    setPathChoice(null);
  };
  const clueResult = interactiveChoices[language].find((item) => item.id === clueChoice)?.result;
  const pathResult = pathChoices[language].find((item) => item.id === pathChoice)?.result;
  const activeScene = storyScenes[destinationId][pageIndex];

  return (
    <div className="cousins-adventure">
      <section className="cousins-hero">
        <div className="cousins-hero__copy">
          <small>{language === "es-MX" ? "TRES PRIMOS · UN MAPA · AVENTURAS SIN FIN" : "THREE COUSINS · ONE MAP · ENDLESS ADVENTURES"}</small>
          <h2>{language === "es-MX" ? "El mapa de aventuras" : "The Adventure Map"}</h2>
          <p>{language === "es-MX"
            ? "Toca un libro del mapa. Elige quién encuentra la primera pista y crea un cuento interactivo de seis páginas."
            : "Tap a book on the map. Choose who finds the first clue, then create a six-page interactive story."}</p>
          <div className="cousins-hero__names" aria-label={language === "es-MX" ? "Los primos" : "The cousins"}>
            <span>⚡ Nico</span><span>✦ Becca</span><span>♥ Lua</span>
          </div>
        </div>
        <div className="cousins-hero__team" aria-label={language === "es-MX" ? "Nico, Becca y Lua" : "Nico, Becca, and Lua"}>
          <NicoCostumeFigure profession="explorer" compact alt="Nico" />
          <PremiumCutout source={beccaArt} alt="Becca" className="cousins-hero__becca" />
          <PremiumCutout source={luaArt} alt="Lua" className="cousins-hero__lua" />
        </div>
      </section>

      <section className="adventure-map-card" aria-labelledby="adventure-map-title">
        <div className="adventure-map-card__heading">
          <div><small>{language === "es-MX" ? "LIBROS EN EL CAMINO" : "STORYBOOK STOPS"}</small><h2 id="adventure-map-title">{language === "es-MX" ? "Elige un destino" : "Choose a destination"}</h2></div>
          <span>{language === "es-MX" ? "5 aventuras" : "5 adventures"}</span>
        </div>
        <div className="cousins-map">
          <img src={mapArt} alt={language === "es-MX" ? "Mapa mágico con cinco destinos" : "Magical map with five destinations"} />
          {COUSINS_DESTINATIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`cousins-map__stop${item.id === destinationId ? " is-active" : ""}`}
              style={{ "--map-x": `${item.mapX}%`, "--map-y": `${item.mapY}%` } as CSSProperties}
              onClick={() => chooseDestination(item.id)}
              aria-pressed={item.id === destinationId}
              aria-label={`${language === "es-MX" ? "Abrir cuento" : "Open story"}: ${item.name[language]}`}
            >
              <span aria-hidden="true">📖</span>
              <strong>{item.name[language]}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="story-workshop" aria-labelledby="story-workshop-title">
        <div className="story-workshop__heading">
          <small>{language === "es-MX" ? "CREA TU CUENTO" : "BUILD YOUR STORY"}</small>
          <h2 id="story-workshop-title">{destination.icon} {destination.name[language]}</h2>
        </div>

        <div className="story-options">
          <fieldset>
            <legend>{language === "es-MX" ? "Tipo de aventura" : "Adventure style"}</legend>
            <div>
              {(Object.keys(THEME_LABELS) as AdventureTheme[]).map((item) => (
                <button type="button" key={item} className={theme === item ? "is-active" : ""} aria-pressed={theme === item} onClick={() => { setTheme(item); setPageIndex(0); setClueChoice(null); setPathChoice(null); }}>
                  {item === "brave" ? "🛡️" : item === "kind" ? "💗" : "🔎"} {THEME_LABELS[item][language]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{language === "es-MX" ? "¿Quién encuentra la primera pista?" : "Who finds the first clue?"}</legend>
            <div>
              {(Object.keys(leadLabels) as CousinLead[]).map((item) => (
                <button type="button" key={item} className={lead === item ? "is-active" : ""} aria-pressed={lead === item} onClick={() => { setLead(item); setPageIndex(0); setClueChoice(null); setPathChoice(null); }}>
                  {item === "nico" ? "⚡" : item === "becca" ? "✦" : "♥"} {leadLabels[item]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <article className="cousins-storybook" aria-live="polite">
          <div className="cousins-storybook__art" style={{ "--story-art": `url(${activeScene})`, "--story-page": pageIndex } as CSSProperties}>
            <span>{destination.name[language]}</span>
          </div>
          <div className="cousins-storybook__page">
            <div className="storybook-page-count">{language === "es-MX" ? "PÁGINA" : "PAGE"} {pageIndex + 1} / {pages.length}</div>
            <h3>{page.title}</h3>
            <p>{page.text}</p>
            {pageIndex === 1 && !clueChoice && (
              <div className="storybook-choice" role="group" aria-label={language === "es-MX" ? "Elige cómo buscar la pista" : "Choose how to find the clue"}>
                <strong>{language === "es-MX" ? "¿Qué deberían hacer?" : "What should they do?"}</strong>
                {interactiveChoices[language].map((item) => (
                  <button type="button" key={item.id} onClick={() => { setClueChoice(item.id); setPageIndex(2); }}>
                    <span aria-hidden="true">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            )}
            {pageIndex === 2 && clueResult && <div className="storybook-result">✨ {clueResult}</div>}
            {pageIndex === 3 && !pathChoice && (
              <div className="storybook-choice" role="group" aria-label={language === "es-MX" ? "Elige cómo seguir la aventura" : "Choose how to continue the adventure"}>
                <strong>{language === "es-MX" ? "¿Qué camino deberían probar?" : "Which path should they try?"}</strong>
                {pathChoices[language].map((item) => (
                  <button type="button" key={item.id} onClick={() => { setPathChoice(item.id); setPageIndex(4); }}>
                    <span aria-hidden="true">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            )}
            {pageIndex >= 4 && pathResult && <div className="storybook-result">✨ {pathResult}</div>}
            <div className="storybook-progress" aria-hidden="true">
              {pages.map((_, index) => <i className={index === pageIndex ? "is-active" : ""} key={index} />)}
            </div>
            <div className="storybook-controls">
              <button type="button" disabled={pageIndex === 0} onClick={() => setPageIndex((current) => Math.max(0, current - 1))}>← {language === "es-MX" ? "Atrás" : "Back"}</button>
              <button type="button" disabled={(pageIndex === 1 && !clueChoice) || (pageIndex === 3 && !pathChoice)} onClick={() => {
                if (pageIndex === pages.length - 1) {
                  setPageIndex(0);
                  setClueChoice(null);
                  setPathChoice(null);
                  return;
                }
                setPageIndex((current) => current + 1);
              }}>
                {pageIndex === pages.length - 1 ? (language === "es-MX" ? "Leer de nuevo" : "Read again") : (language === "es-MX" ? "Siguiente" : "Next")} →
              </button>
            </div>
          </div>
        </article>

        <div className="adventure-outfits">
          <strong>{language === "es-MX" ? "Vestuario de esta aventura" : "Outfits for this adventure"}</strong>
          <div><span>✦ <b>Becca</b><small>{destination.beccaOutfit[language]}</small></span><span>♥ <b>Lua</b><small>{destination.luaOutfit[language]}</small></span></div>
          <p>{language === "es-MX" ? "Los atuendos cambian automáticamente en cada libro." : "Their coordinated outfits change automatically in every storybook."}</p>
        </div>
      </section>

      <section className="adventure-library" aria-label={language === "es-MX" ? "Colección de aventuras" : "Adventure collection"}>
        <div><small>{language === "es-MX" ? "COLECCIÓN ILUSTRADA" : "ILLUSTRATED COLLECTION"}</small><h2>{language === "es-MX" ? "Cinco mundos, muchísimas historias" : "Five worlds, so many stories"}</h2></div>
        <div className="adventure-library__rail">
          {COUSINS_DESTINATIONS.map((item) => (
            <button type="button" key={item.id} onClick={() => chooseDestination(item.id)} className={item.id === destinationId ? "is-active" : ""}>
              <span className="adventure-library__thumb" style={{ "--story-art": `url(${storyScenes[item.id][1]})` } as CSSProperties} />
              <strong>{item.icon} {item.name[language]}</strong>
              <small>{item.beccaOutfit[language]} · {item.luaOutfit[language]}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
