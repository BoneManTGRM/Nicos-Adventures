import type { StarBridgeState, StarBridgeStep } from "../game/goldenAdventure";
import { tr, type Localized } from "../i18n/core";
import type { Language } from "../types";

type MissionPhase = "discover" | "prepare" | "repair" | "complete";

const copy = {
  eyebrow: { en: "Golden Adventure", "es-MX": "Aventura dorada" },
  titleBroken: { en: "The Broken Star Bridge", "es-MX": "El Puente Estelar Roto" },
  titleRestored: { en: "The Star Bridge shines again!", "es-MX": "¡El Puente Estelar brilla de nuevo!" },
  brokenDescription: {
    en: "The bridge to Dinosaur Valley has gone dark. Nico needs a clever robot partner to discover what happened.",
    "es-MX": "El puente hacia el Valle de Dinosaurios se apagó. Nico necesita un robot muy ingenioso para descubrir qué pasó.",
  },
  restoredDescription: {
    en: "Nico and BoltBot restored the Star Core. Dinosaur Valley is ready to explore.",
    "es-MX": "Nico y BoltBot restauraron el Núcleo Estelar. El Valle de Dinosaurios está listo para explorar.",
  },
  statusDiscover: { en: "New mission", "es-MX": "Misión nueva" },
  statusPrepare: { en: "Prepare BoltBot", "es-MX": "Prepara a BoltBot" },
  statusRepair: { en: "Repair in progress", "es-MX": "Reparación en curso" },
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
  const status = phase === "discover"
    ? copy.statusDiscover
    : phase === "prepare"
      ? copy.statusPrepare
      : phase === "repair"
        ? copy.statusRepair
        : copy.statusComplete;

  return (
    <section
      className={`fw-star-bridge ${complete ? "is-restored" : "is-broken"}`}
      aria-labelledby="star-bridge-title"
    >
      <div className="fw-star-bridge__story">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="star-bridge-title">{tr(complete ? copy.titleRestored : copy.titleBroken, language)}</h2>
        <p>{tr(complete ? copy.restoredDescription : copy.brokenDescription, language)}</p>
        <strong className="fw-star-bridge__status">{tr(status, language)}</strong>
        {action ? (
          <button type="button" className="fw-star-bridge__action" onClick={action.onClick}>
            {tr(action.label, language)}
          </button>
        ) : null}
      </div>
      <div
        className="fw-star-bridge__scene"
        role="img"
        aria-label={tr(complete ? copy.bridgeRestored : copy.bridgeBroken, language)}
      >
        <span className="fw-star-bridge__tower fw-star-bridge__tower--left" aria-hidden="true">✦</span>
        <span className="fw-star-bridge__beam fw-star-bridge__beam--left" aria-hidden="true" />
        <span className="fw-star-bridge__core" aria-hidden="true">★</span>
        <span className="fw-star-bridge__beam fw-star-bridge__beam--right" aria-hidden="true" />
        <span className="fw-star-bridge__tower fw-star-bridge__tower--right" aria-hidden="true">✦</span>
        {!complete ? <span className="fw-star-bridge__fault" aria-hidden="true">⚡</span> : null}
      </div>
    </section>
  );
}
