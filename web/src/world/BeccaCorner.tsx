import { useMemo, useState, type CSSProperties } from "react";
import beccaArt from "../assets/art/becca-premium.webp";
import luaArt from "../assets/art/lua-premium.webp";
import magicWorkshopArt from "../assets/art/becca-lua-magic-workshop.webp";
import generatorArt from "../assets/art/unicorn-generator.webp";
import unicornStrip from "../assets/art/unicorn-prance-strip.webp";
import type { Language } from "../types";
import { PremiumCutout } from "./PremiumCutout";
import "./becca-corner.css";
import "./becca-corner-refresh.css";

type UnicornMood = "brave" | "sweet" | "curious";
type UnicornMotion = "prance" | "spin" | "float" | "rest";
type MagicHost = "becca" | "lua";
type MagicQuest = "song" | "kindness" | "starlight";

const names = {
  en: ["Starlight", "Moonbeam", "Rainbow", "Twinkle", "Nova", "Daisy"],
  "es-MX": ["Estrellita", "Lunita", "Arcoíris", "Destello", "Nova", "Margarita"],
} as const;

const moodCopy: Record<UnicornMood, { en: string; "es-MX": string }> = {
  brave: { en: "Brave", "es-MX": "Valiente" },
  sweet: { en: "Sweet", "es-MX": "Dulce" },
  curious: { en: "Curious", "es-MX": "Curiosa" },
};

const motionCopy: Record<UnicornMotion, { en: string; "es-MX": string }> = {
  prance: { en: "Prance", "es-MX": "Trotar" },
  spin: { en: "Spin", "es-MX": "Girar" },
  float: { en: "Float", "es-MX": "Flotar" },
  rest: { en: "Rest", "es-MX": "Descansar" },
};

const hostCopy: Record<MagicHost, { en: string; "es-MX": string; detail: { en: string; "es-MX": string } }> = {
  becca: { en: "Becca leads", "es-MX": "Becca guía", detail: { en: "Creative inventor", "es-MX": "Inventora creativa" } },
  lua: { en: "Lua leads", "es-MX": "Lua guía", detail: { en: "Magical helper", "es-MX": "Ayudante mágica" } },
};

const questCopy: Record<MagicQuest, { icon: string; en: string; "es-MX": string; result: { en: string; "es-MX": string } }> = {
  song: { icon: "🎵", en: "Play a gentle rainbow song", "es-MX": "Tocar una canción arcoíris", result: { en: "The unicorn's mane sparkles in time with the melody!", "es-MX": "¡La melena de la unicornio brilla al ritmo de la melodía!" } },
  kindness: { icon: "💗", en: "Whisper three kind words", "es-MX": "Susurrar tres palabras amables", result: { en: "A warm heart-shaped glow fills the workshop!", "es-MX": "¡Un brillo cálido en forma de corazón llena el taller!" } },
  starlight: { icon: "🌙", en: "Follow the moonlight trail", "es-MX": "Seguir el sendero lunar", result: { en: "Tiny stars reveal a secret prancing path!", "es-MX": "¡Pequeñas estrellas revelan un sendero secreto para trotar!" } },
};

export function BeccaCorner({ language }: { language: Language }) {
  const [host, setHost] = useState<MagicHost>("becca");
  const [mood, setMood] = useState<UnicornMood>("sweet");
  const [motion, setMotion] = useState<UnicornMotion>("prance");
  const [color, setColor] = useState("rainbow");
  const [generation, setGeneration] = useState(0);
  const [quest, setQuest] = useState<MagicQuest | null>(null);
  const unicornName = useMemo(() => names[language][(generation + (host === "lua" ? 2 : 0)) % names[language].length], [generation, host, language]);
  const hue = color === "moonlight" ? "90deg" : color === "sunset" ? "-35deg" : "0deg";
  const colorLabel = color === "moonlight"
    ? (language === "es-MX" ? "Luz lunar" : "Moonlight")
    : color === "sunset"
      ? (language === "es-MX" ? "Atardecer" : "Sunset")
      : (language === "es-MX" ? "Arcoíris" : "Rainbow");
  const style = {
    "--becca-unicorn-strip": `url("${unicornStrip}")`,
    "--becca-unicorn-hue": hue,
  } as CSSProperties;

  return (
    <div className="becca-corner" style={style}>
      <section className="becca-hero">
        <img className="becca-hero__scene" src={magicWorkshopArt} alt={language === "es-MX" ? "Becca y Lua crean una unicornio en su taller mágico" : "Becca and Lua create a unicorn in their magical workshop"} />
        <div className="becca-hero__copy">
          <small>{language === "es-MX" ? "BECCA + LUA · IMAGINACIÓN · AMISTAD · MAGIA" : "BECCA + LUA · IMAGINATION · FRIENDSHIP · MAGIC"}</small>
          <h2>{language === "es-MX" ? "El Rincón de Becca" : "Becca’s Corner"}</h2>
          <p>{language === "es-MX"
            ? "Becca y Lua dirigen un taller mágico de unicornios. Elige quién guía, crea una nueva amiga y resuelve una pequeña misión juntas."
            : "Becca and Lua run a magical unicorn workshop. Choose who leads, create a new friend, and solve a little quest together."}</p>
          <div className="becca-traits" aria-label={language === "es-MX" ? "Cualidades de Becca" : "Becca's qualities"}>
            <span>💜 {language === "es-MX" ? "Dulce" : "Sweet"}</span>
            <span>💡 {language === "es-MX" ? "Creativa" : "Creative"}</span>
            <span>🛡️ {language === "es-MX" ? "Valiente" : "Brave"}</span>
            <span>✨ Lua · {language === "es-MX" ? "Mágica" : "Magical"}</span>
          </div>
        </div>
      </section>

      <section className="unicorn-lab" aria-labelledby="unicorn-generator-title">
        <div className="unicorn-lab__stage">
          <img className="unicorn-generator-art" src={generatorArt} alt="" aria-hidden="true" />
          <div
            className={`becca-unicorn becca-unicorn--${motion}`}
            role="img"
            aria-label={language === "es-MX" ? `Unicornio ${unicornName} en movimiento` : `${unicornName} the unicorn moving`}
            key={generation}
          />
          <div className="unicorn-nameplate">
            <small>{language === "es-MX" ? "UNICORNIO CREADO" : "UNICORN CREATED"}</small>
            <strong>{unicornName}</strong>
            <span>{moodCopy[mood][language]}</span>
          </div>
        </div>

        <div className="unicorn-lab__controls">
          <small>{language === "es-MX" ? "FUNCIÓN MÁGICA" : "MAGICAL FEATURE"}</small>
          <h2 id="unicorn-generator-title">{language === "es-MX" ? "Generador de unicornios" : "Unicorn Generator"}</h2>
          <p>{language === "es-MX"
            ? "Elige una guía, un brillo, una personalidad y un movimiento. Cada decisión cambia tu unicornio."
            : "Choose a guide, sparkle, personality, and movement. Every decision changes your unicorn."}</p>

          <fieldset className="magic-host-picker">
            <legend>{language === "es-MX" ? "¿Quién guía la creación?" : "Who leads the creation?"}</legend>
            <div>
              {(["becca", "lua"] as MagicHost[]).map((value) => (
                <button type="button" className={host === value ? "active" : ""} aria-pressed={host === value} onClick={() => setHost(value)} key={value}>
                  <PremiumCutout source={value === "becca" ? beccaArt : luaArt} alt={value === "becca" ? "Becca" : "Lua"} />
                  <span><strong>{hostCopy[value][language]}</strong><small>{hostCopy[value].detail[language]}</small></span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "es-MX" ? "Brillo" : "Sparkle"}</legend>
            <div className="becca-choice-row">
              {[
                ["rainbow", language === "es-MX" ? "Arcoíris" : "Rainbow"],
                ["moonlight", language === "es-MX" ? "Luz lunar" : "Moonlight"],
                ["sunset", language === "es-MX" ? "Atardecer" : "Sunset"],
              ].map(([value, label]) => (
                <button type="button" className={color === value ? "active" : ""} onClick={() => setColor(value)} key={value}>{label}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "es-MX" ? "Personalidad" : "Personality"}</legend>
            <div className="becca-choice-row">
              {(Object.keys(moodCopy) as UnicornMood[]).map((value) => (
                <button type="button" className={mood === value ? "active" : ""} onClick={() => setMood(value)} key={value}>{moodCopy[value][language]}</button>
              ))}
            </div>
          </fieldset>

          <button type="button" className="becca-create-button" onClick={() => {
            setGeneration((current) => current + 1);
            setMotion("prance");
            setQuest(null);
          }}>
            ✨ {host === "becca"
              ? (language === "es-MX" ? "Crear con Becca" : "Create with Becca")
              : (language === "es-MX" ? "Crear con Lua" : "Create with Lua")}
          </button>

          <div className="becca-motion-grid" aria-label={language === "es-MX" ? "Movimientos del unicornio" : "Unicorn movements"}>
            {(Object.keys(motionCopy) as UnicornMotion[]).map((value) => (
              <button type="button" className={motion === value ? "active" : ""} onClick={() => setMotion(value)} key={value}>
                {motionCopy[value][language]}
              </button>
            ))}
          </div>

          <div className="unicorn-recipe" aria-label={language === "es-MX" ? "Receta mágica actual" : "Current magic recipe"}>
            <small>{language === "es-MX" ? "RECETA MÁGICA" : "MAGIC RECIPE"}</small>
            <div><span>🪄 <b>{host === "becca" ? "Becca" : "Lua"}</b></span><span>🌈 <b>{colorLabel}</b></span><span>💗 <b>{moodCopy[mood][language]}</b></span><span>💫 <b>{motionCopy[motion][language]}</b></span></div>
          </div>
        </div>
      </section>

      <section className="becca-magic-quest" aria-labelledby="becca-magic-quest-title">
        <div className="becca-magic-quest__copy">
          <small>{language === "es-MX" ? "MINI AVENTURA INTERACTIVA" : "INTERACTIVE MINI ADVENTURE"}</small>
          <h2 id="becca-magic-quest-title">{language === "es-MX" ? "Ayuda a tu unicornio a encontrar su magia" : "Help your unicorn find her magic"}</h2>
          <p>{language === "es-MX" ? "Elige una idea. Tu decisión cambia lo que sucede en el taller." : "Choose an idea. Your decision changes what happens in the workshop."}</p>
        </div>
        <div className="becca-magic-quest__choices" role="group" aria-label={language === "es-MX" ? "Elige una idea mágica" : "Choose a magic idea"}>
          {(Object.keys(questCopy) as MagicQuest[]).map((value) => (
            <button type="button" className={quest === value ? "active" : ""} aria-pressed={quest === value} onClick={() => { setQuest(value); setMotion(value === "song" ? "spin" : value === "kindness" ? "rest" : "float"); }} key={value}>
              <span aria-hidden="true">{questCopy[value].icon}</span><strong>{questCopy[value][language]}</strong>
            </button>
          ))}
        </div>
        <div className={`becca-magic-quest__result${quest ? " is-revealed" : ""}`} aria-live="polite">
          <strong>{quest ? `✨ ${unicornName}` : "✨ ?"}</strong>
          <span>{quest ? questCopy[quest].result[language] : (language === "es-MX" ? "Elige una idea para revelar la siguiente parte." : "Choose an idea to reveal what happens next.")}</span>
        </div>
      </section>
    </div>
  );
}
