import {
  evaluateBoltBotReadiness,
  type BoltBotCapability,
} from "../game/boltBot";
import { tr, type Localized } from "../i18n/core";
import type { Language, Robot } from "../types";

const copy = {
  eyebrow: { en: "Golden Adventure · Robo Lab", "es-MX": "Aventura dorada · Laboratorio de Robots" },
  title: { en: "Build a bridge-ready BoltBot", "es-MX": "Construye un BoltBot listo para el puente" },
  body: {
    en: "Use the lab controls below to give BoltBot movement, scanning, repair, and Star power. Your saved robot profile stays the source of truth.",
    "es-MX": "Usa los controles del laboratorio para darle a BoltBot movimiento, escáner, reparación y energía estelar. Tu perfil de robot guardado sigue siendo la fuente oficial.",
  },
  useRobot: { en: "Use this BoltBot", "es-MX": "Usar este BoltBot" },
  notReady: { en: "Complete the missing systems first", "es-MX": "Primero completa los sistemas que faltan" },
} satisfies Record<string, Localized>;

const capabilityCopy: Record<BoltBotCapability, Localized> = {
  movement: { en: "Movement base", "es-MX": "Base de movimiento" },
  scanner: { en: "Scanner eyes", "es-MX": "Ojos con escáner" },
  repair: { en: "Repair arms", "es-MX": "Brazos de reparación" },
  "star-power": { en: "Star power", "es-MX": "Energía estelar" },
};

export function BoltBotConfigurationGate({ robot, language, configure }: { robot: Robot; language: Language; configure: () => void }) {
  const readiness = evaluateBoltBotReadiness(robot);
  const capabilities = Object.keys(capabilityCopy) as BoltBotCapability[];
  return (
    <section className="boltbot-mission" aria-labelledby="boltbot-mission-title">
      <header>
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="boltbot-mission-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>
      <ul className="boltbot-readiness">
        {capabilities.map((capability) => {
          const ready = !readiness.missing.includes(capability);
          return <li className={ready ? "is-ready" : "is-missing"} key={capability}><span aria-hidden="true">{ready ? "✓" : "○"}</span>{tr(capabilityCopy[capability], language)}</li>;
        })}
      </ul>
      <button type="button" className="fw-primary" disabled={!readiness.ready} onClick={configure}>
        {readiness.ready ? tr(copy.useRobot, language) : tr(copy.notReady, language)}
      </button>
    </section>
  );
}
