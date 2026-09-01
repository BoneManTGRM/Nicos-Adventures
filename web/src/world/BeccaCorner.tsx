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
type CreatedUnicorn = { host: MagicHost; mood: UnicornMood; color: string; generation: number };

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
  song: { icon: "🎵", en: "Play a gentle rainbow song", "es-MX": "Tocar una canción arcoíris", result: { en: "The unicorn's mane sparkles in time with the melody!", "es-MX": "¡La crin del unicornio brilla al ritmo de la melodía!" } },
  kindness: { icon: "💗", en: "Whisper three kind words", "es-MX": "Susurrar tres palabras amables", result: { en: "A warm heart-shaped glow fills the workshop!", "es-MX": "¡Un brillo cálido en forma de corazón llena el taller!" } },
  starlight: { icon: "🌙", en: "Follow the moonlight trail", "es-MX": "Seguir el sendero lunar", result: { en: "Tiny stars reveal a secret prancing path!", "es-MX": "¡Pequeñas estrellas revelan un sendero secreto para trotar!" } },
};

export function BeccaCorner({ language }: { language: Language }) {
  const [host, setHost] = useState<MagicHost>("becca");
  const [mood, setMood] = useState<UnicornMood>("sweet");
  const [motion, setMotion] = useState<UnicornMotion>("prance");
  const [color, setColor] = useState("rainbow");
  const [generation, setGeneration] = useState(0);
  const [created, setCreated] = useState<CreatedUnicorn>({ host: "becca", mood: "sweet", color: "rainbow", generation: 0 });
  const [quest, setQuest] = useState<MagicQuest | null>(null);
  const unicornName = useMemo(() => names[language][(created.generation + (created.host === "lua" ? 2 : 0)) % names[language].length], [created, language]);
  const hue = created.color === "moonlight" ? "90deg" : created.color === "sunset" ? "-35deg" : "0deg";
  const colorLabel = color === "moonlight"
    ? (language === "es-MX" ? "Luz lunar" : "Moonlight")
    : color === "sunset"
      ? (language === "es-MX" ? "Atardecer" : "Sunset")
      : (language === "es-MX" ? "Arcoíris" : "Rainbow");
  const style = {
    "--becca-unicorn-strip": `url("${unicornStrip}")`,
    "--becca-unicorn-hue": hue,
  } as CSSProperties;

  const createUnicorn = () => {
    const nextGeneration = generation + 1;
    setGeneration(nextGeneration);
    setCreated({ host, mood, color, generation: nextGeneration });
    setMotion("prance");
    setQuest(null);
  };

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

      <section className="becca-team-showcase" aria-labelledby="becca-team-title">
        <header>
          <small>{language === "es-MX" ? "LAS CREADORAS DEL TALLER" : "MEET THE WORKSHOP CREATORS"}</small>
          <h2 id="becca-team-title">{language === "es-MX" ? "Becca y Lua, juntas" : "Becca and Lua, together"}</h2>
          <p>{language === "es-MX" ? "Mira a las dos creadoras de cuerpo completo y elige quién dirigirá la próxima creación." : "See both full-body creators up close, then choose who will lead the next creation."}</p>
        </header>
        <div className="becca-team-showcase__portraits">
          <article className={host === "becca" ? "active" : ""}>
            <PremiumCutout source={beccaArt} alt="Becca" className="becca-team-showcase__character" />
            <div><strong>Becca</strong><span>{language === "es-MX" ? "Inventora creativa" : "Creative inventor"}</span><button type="button" aria-pressed={host === "becca"} onClick={() => setHost("becca")}>{language === "es-MX" ? "Elegir a Becca" : "Choose Becca"}</button></div>
          </article>
          <article className={host === "lua" ? "active" : ""}>
            <PremiumCutout source={luaArt} alt="Lua" className="becca-team-showcase__character" />
            <div><strong>Lua</strong><span>{language === "es-MX" ? "Ayudante mágica" : "Magical helper"}</span><button type="button" aria-pressed={host === "lua"} onClick={() => setHost("lua")}>{language === "es-MX" ? "Elegir a Lua" : "Choose Lua"}</button></div>
          </article>
        </div>
      </section>

      <section className="unicorn-lab" aria-labelledby="unicorn-generator-title">
        <div className="unicorn-lab__stage" data-color={created.color} data-mood={created.mood} aria-live="polite">
          <div className="unicorn-lab__creation-burst" key={`burst-${created.generation}`} aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <img className="unicorn-generator-art" src={generatorArt} alt="" aria-hidden="true" />
          <PremiumCutout source={created.host === "becca" ? beccaArt : luaArt} alt={created.host === "becca" ? "Becca beside the Unicorn Generator" : "Lua beside the Unicorn Generator"} className="unicorn-lab__guide" />
          <div
            className={`becca-unicorn becca-unicorn--${motion}`}
            role="img"
            aria-label={language === "es-MX" ? `Unicornio ${unicornName} en movimiento` : `${unicornName} the unicorn moving`}
            key={`${created.generation}-${motion}`}
          />
          <div className="unicorn-nameplate">
            <small>{language === "es-MX" ? "UNICORNIO CREADO" : "UNICORN CREATED"}</small>
            <strong>{unicornName}</strong>
            <span>{created.host === "becca" ? "Becca" : "Lua"} · {moodCopy[created.mood][language]}</span>
          </div>
        </div>

        <div className="unicorn-lab__controls">
          <small>{language === "es-MX" ? "FUNCIÓN MÁGICA" : "MAGICAL FEATURE"}</small>
          <h2 id="unicorn-generator-title">{language === "es-MX" ? "Generador de unicornios" : "Unicorn Generator"}</h2>
          <p>{language === "es-MX"
            ? "Elige una guía, un brillo, una personalidad y un movimiento. Cada decisión cambia tu unicornio."
            : "Choose a guide, sparkle, personality, and movement. Every decision changes your unicorn."}</p>
          <div className="unicorn-generator-steps" aria-label={language === "es-MX" ? "Pasos del generador" : "Generator steps"}>
            <span className="complete">1 <b>{language === "es-MX" ? "Guía" : "Guide"}</b></span>
            <span className="complete">2 <b>{language === "es-MX" ? "Brillo" : "Sparkle"}</b></span>
            <span className="complete">3 <b>{language === "es-MX" ? "Personalidad" : "Personality"}</b></span>
            <span>4 <b>{language === "es-MX" ? "Crear" : "Create"}</b></span>
          </div>

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
                <button type="button" className={color === value ? "active" : ""} aria-pressed={color === value} onClick={() => setColor(value)} key={value}>{label}</button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{language === "es-MX" ? "Personalidad" : "Personality"}</legend>
            <div className="becca-choice-row">
              {(Object.keys(moodCopy) as UnicornMood[]).map((value) => (
                <button type="button" className={mood === value ? "active" : ""} aria-pressed={mood === value} onClick={() => setMood(value)} key={value}>{moodCopy[value][language]}</button>
              ))}
            </div>
          </fieldset>

          <button type="button" className="becca-create-button" onClick={createUnicorn}>
            ✨ {host === "becca"
              ? (language === "es-MX" ? "Crear con Becca" : "Create with Becca")
              : (language === "es-MX" ? "Crear con Lua" : "Create with Lua")}
          </button>

          <div className="becca-motion-grid" aria-label={language === "es-MX" ? "Movimientos del unicornio" : "Unicorn movements"}>
            {(Object.keys(motionCopy) as UnicornMotion[]).map((value) => (
              <button type="button" className={motion === value ? "active" : ""} aria-pressed={motion === value} onClick={() => setMotion(value)} key={value}>
                <span aria-hidden="true">{value === "prance" ? "🐎" : value === "spin" ? "💫" : value === "float" ? "☁️" : "🌙"}</span>{motionCopy[value][language]}
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
