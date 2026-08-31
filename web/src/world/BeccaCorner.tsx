import { useMemo, useState, type CSSProperties } from "react";
import beccaArt from "../assets/art/becca-premium.webp";
import generatorArt from "../assets/art/unicorn-generator.webp";
import unicornStrip from "../assets/art/unicorn-prance-strip.webp";
import type { Language } from "../types";
import { PremiumCutout } from "./PremiumCutout";

type UnicornMood = "brave" | "sweet" | "curious";
type UnicornMotion = "prance" | "spin" | "float" | "rest";

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

export function BeccaCorner({ language }: { language: Language }) {
  const [mood, setMood] = useState<UnicornMood>("sweet");
  const [motion, setMotion] = useState<UnicornMotion>("prance");
  const [color, setColor] = useState("rainbow");
  const [generation, setGeneration] = useState(0);
  const unicornName = useMemo(() => names[language][generation % names[language].length], [generation, language]);
  const hue = color === "moonlight" ? "90deg" : color === "sunset" ? "-35deg" : "0deg";
  const style = {
    "--becca-unicorn-strip": `url("${unicornStrip}")`,
    "--becca-unicorn-hue": hue,
  } as CSSProperties;

  return (
    <div className="becca-corner" style={style}>
      <section className="becca-hero">
        <div className="becca-hero__copy">
          <small>{language === "es-MX" ? "IMAGINACIÓN · AMISTAD · MAGIA" : "IMAGINATION · FRIENDSHIP · MAGIC"}</small>
          <h2>{language === "es-MX" ? "El Rincón de Becca" : "Becca’s Corner"}</h2>
          <p>{language === "es-MX"
            ? "Crea una amiga unicornio, elige su personalidad y dale vida con movimientos mágicos."
            : "Create a unicorn friend, choose her personality, and bring her to life with magical moves."}</p>
          <div className="becca-traits" aria-label={language === "es-MX" ? "Cualidades de Becca" : "Becca's qualities"}>
            <span>💜 {language === "es-MX" ? "Dulce" : "Sweet"}</span>
            <span>💡 {language === "es-MX" ? "Creativa" : "Creative"}</span>
            <span>🛡️ {language === "es-MX" ? "Valiente" : "Brave"}</span>
          </div>
        </div>
        <PremiumCutout source={beccaArt} alt="Becca" className="becca-hero__character" />
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
            ? "Elige una chispa, una personalidad y un movimiento. Cada creación es segura, amable y única."
            : "Choose a sparkle, a personality, and a movement. Every creation is gentle, friendly, and unique."}</p>

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
          }}>
            ✨ {language === "es-MX" ? "Crear mi unicornio" : "Create my unicorn"}
          </button>

          <div className="becca-motion-grid" aria-label={language === "es-MX" ? "Movimientos del unicornio" : "Unicorn movements"}>
            {(Object.keys(motionCopy) as UnicornMotion[]).map((value) => (
              <button type="button" className={motion === value ? "active" : ""} onClick={() => setMotion(value)} key={value}>
                {motionCopy[value][language]}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
