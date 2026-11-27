import type { StarBridgeState, StarBridgeStep } from "../game/goldenAdventure";
import { tr, type Localized } from "../i18n/core";
import bridgeBroken from "../assets/atlas/star-bridge-broken.webp";
import bridgeRestored from "../assets/atlas/star-bridge-restored.webp";
import { nextAdventure } from "./journey";
import type { Language } from "../types";

type MissionPhase = "discover" | "prepare" | "repair" | "complete";

const copy = {
  eyebrow: { en: "Golden Adventure", "es-MX": "Aventura dorada" },
  titleBroken: { en: "The Broken Star Bridge", "es-MX": "El Puente Estelar Roto" },
  titleRestored: { en: "The Star Bridge shines again!", "es-MX": "¡El Puente Estelar brilla de nuevo!" },
  brokenDescription: {
    en: "The lights went out over Dinosaur Valley. Help BoltBot find the missing spark and light the way across.",
    "es-MX": "Se apagaron las luces del Valle de Dinosaurios. Ayuda a BoltBot a encontrar la falla y a encender el puente.",
  },
  restoredDescription: {
    en: "Nico and BoltBot restored the Star Core. Dinosaur Valley is ready to explore.",
    "es-MX": "Nico y BoltBot restauraron el Núcleo Estelar. El Valle de Dinosaurios está listo para explorar.",
  },
  statusDiscover: { en: "New mission", "es-MX": "Misión nueva" },
  statusComplete: { en: "Bridge restored · Valley unlocked", "es-MX": "Puente restaurado · Valle desbloqueado" },
  begin: { en: "Begin the adventure", "es-MX": "Comenzar la aventura" },
  continue: { en: "Continue in Robo Lab", "es-MX": "Continuar en el Laboratorio de Robots" },
  travelBridge: { en: "Travel to the Star Bridge", "es-MX": "Viajar al Puente Estelar" },
  continueRepair: { en: "Continue the bridge repair", "es-MX": "Continuar la reparación del puente" },
  visitValley: { en: "Visit Dinosaur Valley", "es-MX": "Visitar el Valle de Dinosaurios" },
  bridgeBroken: { en: "Star Bridge broken", "es-MX": "Puente Estelar roto" },
  bridgeRestored: { en: "Star Bridge restored", "es-MX": "Puente Estelar restaurado" },
} satisfies Record<string, Localized>;

const phaseByStep: Record<StarBridgeStep, MissionPhase> = {
  briefing: "discover",
  map_revealed: "prepare",
  robot_configured: "prepare",
  movement_passed: "prepare",
  scanner_passed: "prepare",
  logic_passed: "repair",
  bridge_inspected: "repair",
  star_core_installed: "repair",
  complete: "complete",
};

export function starBridgeMissionPhase(state: StarBridgeState): MissionPhase {
  return phaseByStep[state.step];
}

export function StarBridgeMap({
  state,
  language,
  begin,
  openRoboLab,
  openBridge,
  openDinosaurValley,
}: {
  state: StarBridgeState;
  language: Language;
  begin: () => void;
  openRoboLab: () => void;
  openBridge: () => void;
  openDinosaurValley: () => void;
}) {
  const phase = starBridgeMissionPhase(state);
  const complete = phase === "complete";
  const action = phase === "discover"
    ? { label: copy.begin, onClick: begin }
    : phase === "prepare"
      ? { label: copy.continue, onClick: openRoboLab }
      : phase === "repair"
        ? { label: state.step === "logic_passed" ? copy.travelBridge : copy.continueRepair, onClick: openBridge }
        : { label: copy.visitValley, onClick: openDinosaurValley };
  const es = language === "es-MX";
  const milestones = es ? ["Descubre", "Prepara", "Repara", "Explora"] : ["Discover", "Prepare", "Repair", "Explore"];
  const current = (["discover", "prepare", "repair", "complete"] as const).indexOf(phase);
  const status = phase === "prepare" || phase === "repair"
    ? nextAdventure(state.step, language).label
    : tr(complete ? copy.statusComplete : copy.statusDiscover, language);

  return (
    <section id="star-bridge"
      className={`fw-star-bridge ${complete ? "is-restored" : "is-broken"}`}
      aria-labelledby="star-bridge-title"
    >
      <div className="fw-star-bridge__scene" role="img" aria-label={tr(complete ? copy.bridgeRestored : copy.bridgeBroken, language)}>
        <img src={complete ? bridgeRestored : bridgeBroken} alt="" width="1200" height="395" loading="lazy" decoding="async" />
        <span className="bridge-fireflies" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="fw-star-bridge__story">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="star-bridge-title">{tr(complete ? copy.titleRestored : copy.titleBroken, language)}</h2>
        <p>{tr(complete ? copy.restoredDescription : copy.brokenDescription, language)}</p>
        <ol className="bridge-route" aria-label={es ? "Ruta de la misión" : "Mission route"}>
          {milestones.map((name, index) => <li key={index} data-state={index < current ? "done" : undefined} aria-current={index === current ? "step" : undefined}>
            <span aria-hidden="true">{index < current ? "✓" : "✦"}</span>{name}
          </li>)}
        </ol>
        <strong className="fw-star-bridge__status">{status}</strong>
        <button type="button" className="fw-star-bridge__action" onClick={action.onClick}>
            {tr(action.label, language)}
        </button>
      </div>
    </section>
  );
}
