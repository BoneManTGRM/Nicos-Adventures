import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PremiumBoltBotSprite } from "../boltbot/PremiumBoltBotSprite";
import {
  BOLT_BOT_LOGIC_ANSWER,
  BOLT_BOT_LOGIC_SEQUENCE,
  BOLT_BOT_MOVEMENT_SEQUENCE,
  BOLT_BOT_SCAN_TARGETS,
  boltBotChamberStage,
  boltBotRoutePose,
  passesLogicTest,
  passesMovementTest,
  passesScannerTest,
  type MovementCommand,
} from "../game/boltBot";
import type { StarBridgeEvent, StarBridgeState } from "../game/goldenAdventure";
import { tr, type Localized } from "../i18n/core";
import type { Language, Robot } from "../types";
import "./boltbot-test-chamber.css";

const copy = {
  eyebrow: { en: "Golden Adventure · Robo Lab", "es-MX": "Aventura dorada · Laboratorio de Robots" },
  movement: { en: "Movement test", "es-MX": "Prueba de movimiento" },
  movementBody: {
    en: "Guide BoltBot across the three command pads in this order: forward, right, forward.",
    "es-MX": "Guía a BoltBot por las tres plataformas en este orden: adelante, derecha, adelante.",
  },
  scanner: { en: "Scanner test", "es-MX": "Prueba del escáner" },
  scannerBody: {
    en: "Compare every signal and choose the unique strongest source.",
    "es-MX": "Compara todas las señales y elige la única fuente con mayor intensidad.",
  },
  logic: { en: "Logic test", "es-MX": "Prueba de lógica" },
  logicBody: {
    en: "Continue the pattern: star, bolt, star, bolt… What comes next?",
    "es-MX": "Continúa el patrón: estrella, tornillo, estrella, tornillo… ¿Qué sigue?",
  },
  complete: { en: "BoltBot is bridge-ready!", "es-MX": "¡BoltBot está listo para el puente!" },
  completeBody: {
    en: "Movement, scanner, and logic systems passed. Return to the World Map for the bridge mission.",
    "es-MX": "Los sistemas de movimiento, escáner y lógica aprobaron. Vuelve al Mapa Mundial para la misión del puente.",
  },
  returnMap: { en: "Return to World Map", "es-MX": "Volver al Mapa Mundial" },
  forward: { en: "Forward", "es-MX": "Adelante" },
  left: { en: "Left", "es-MX": "Izquierda" },
  right: { en: "Right", "es-MX": "Derecha" },
  runRoute: { en: "Pass movement test", "es-MX": "Aprobar prueba de movimiento" },
  resetRoute: { en: "Try the route again", "es-MX": "Intentar la ruta de nuevo" },
  routeCorrect: { en: "Route complete!", "es-MX": "¡Ruta completa!" },
  routeWrong: { en: "That route missed a pad. Try again.", "es-MX": "Esa ruta no pasó por una plataforma. Inténtalo de nuevo." },
  confirmScan: { en: "Pass scanner test", "es-MX": "Aprobar prueba del escáner" },
  scanCorrect: { en: "Strongest signal found!", "es-MX": "¡Encontraste la señal más intensa!" },
  scanWrong: { en: "That is not the strongest signal yet.", "es-MX": "Esa todavía no es la señal más intensa." },
  confirmLogic: { en: "Complete test chamber", "es-MX": "Completar cámara de pruebas" },
  logicCorrect: { en: "Pattern solved!", "es-MX": "¡Patrón resuelto!" },
  logicWrong: { en: "Look at the alternating pattern and try again.", "es-MX": "Observa el patrón alternado e inténtalo de nuevo." },
  scene: { en: "Illustrated BoltBot test chamber", "es-MX": "Cámara ilustrada de pruebas de BoltBot" },
  instructions: { en: "Use the test controls beside the scene.", "es-MX": "Usa los controles de prueba junto a la escena." },
  signal: { en: "Signal", "es-MX": "Señal" },
  selected: { en: "Selected", "es-MX": "Seleccionado" },
} satisfies Record<string, Localized>;

const targetCopy: Record<string, Localized> = {
  "loose-bolt": { en: "Loose bolt", "es-MX": "Tornillo suelto" },
  "star-core-socket": { en: "Star Core socket", "es-MX": "Conector del Núcleo Estelar" },
  "decorative-panel": { en: "Decorative panel", "es-MX": "Panel decorativo" },
};

function IllustratedChamber({
  robot,
  commands,
  action,
  selectedScan,
  language,
  routeActive,
  reportMotion,
}: {
  robot: Robot;
  commands: readonly MovementCommand[];
  action: string;
  selectedScan: string | null;
  language: Language;
  routeActive: boolean;
  reportMotion: (motion: "programmed" | "moving" | "settled" | "reduced") => void;
}) {
  const [routeAction, setRouteAction] = useState("idle");
  const pose = boltBotRoutePose(commands);
  const xProgress = Math.max(0, Math.min(1, (pose.x + .8) / .85));
  const zProgress = Math.max(0, Math.min(1, (pose.z + .75) / .85));
  const robotStyle = {
    left: `${25 + xProgress * 27}%`,
    top: `${58 - zProgress * 22}%`,
  } as CSSProperties;

  useEffect(() => {
    if (!routeActive) {
      setRouteAction("idle");
      reportMotion("settled");
      return;
    }
    if (!commands.length) {
      setRouteAction("idle");
      reportMotion("programmed");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRouteAction("idle");
      reportMotion("reduced");
      return;
    }
    setRouteAction("drive");
    reportMotion("moving");
    const timer = window.setTimeout(() => {
      setRouteAction("idle");
      reportMotion("settled");
    }, 1_450);
    return () => window.clearTimeout(timer);
  }, [commands, reportMotion, routeActive]);

  const displayAction = action.toLowerCase() === "idle" ? routeAction : action;

  return (
    <div
      className="boltbot-illustrated-chamber"
      data-renderer="premium-2d"
      role="img"
      aria-label={`${tr(copy.scene, language)}. ${tr(copy.instructions, language)}`}
    >
      <div className="boltbot-illustrated-chamber__window" aria-hidden="true"><span>✦</span><span>✧</span><span>★</span></div>
      <div className="boltbot-illustrated-chamber__route" aria-hidden="true">
        {[0, 1, 2].map((index) => <span className={index < commands.length ? "is-active" : ""} key={index}>{index + 1}</span>)}
      </div>
      <div className="boltbot-illustrated-chamber__signals" aria-hidden="true">
        {BOLT_BOT_SCAN_TARGETS.map((target) => (
          <span className={selectedScan === target.id ? "is-selected" : ""} key={target.id}>
            <i />{target.signal}
          </span>
        ))}
      </div>
      <div className="boltbot-illustrated-chamber__robot" style={robotStyle}>
        <PremiumBoltBotSprite robot={robot} action={displayAction} alt="" />
      </div>
      <div className="boltbot-illustrated-chamber__console" aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>
  );
}

export function BoltBotTestChamber({
  state,
  robot,
  language,
  advance,
  returnToMap,
}: {
  state: StarBridgeState;
  robot: Robot;
  language: Language;
  advance: (event: StarBridgeEvent) => void;
  returnToMap: () => void;
}) {
  const stage = boltBotChamberStage(state.step);
  const [commands, setCommands] = useState<MovementCommand[]>([]);
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [logicAnswer, setLogicAnswer] = useState<string | null>(null);
  const [animation, setAnimation] = useState("Idle");
  const [routeMotion, setRouteMotion] = useState<"programmed" | "moving" | "settled" | "reduced">("settled");
  const timer = useRef<number | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setAnimation(stage === "complete" ? "Celebrate" : "Idle");
  }, [stage]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => heading.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  const play = (next: string, duration = 900) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setAnimation(next);
    timer.current = window.setTimeout(() => setAnimation(stage === "complete" ? "Celebrate" : "Idle"), duration);
  };

  if (stage === "inactive" || stage === "configuration") return null;

  const routeComplete = commands.length === BOLT_BOT_MOVEMENT_SEQUENCE.length;
  const routePassed = routeComplete && passesMovementTest(commands);
  const scanPassed = selectedScan !== null && passesScannerTest(selectedScan);
  const logicPassed = logicAnswer !== null && passesLogicTest(logicAnswer);
  const visualCommands = stage === "movement" ? commands : BOLT_BOT_MOVEMENT_SEQUENCE;
  const title = stage === "movement" ? copy.movement : stage === "scanner" ? copy.scanner : stage === "logic" ? copy.logic : copy.complete;
  const body = stage === "movement" ? copy.movementBody : stage === "scanner" ? copy.scannerBody : stage === "logic" ? copy.logicBody : copy.completeBody;

  const selectMovement = (command: MovementCommand) => {
    if (routeComplete) return;
    setCommands((current) => [...current, command]);
  };

  return (
    <section className="boltbot-mission" data-route-motion={routeMotion} aria-labelledby="boltbot-mission-title">
      <header>
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="boltbot-mission-title" ref={heading} tabIndex={-1}>{tr(title, language)}</h2>
        <p>{tr(body, language)}</p>
      </header>
      <div className="boltbot-chamber-layout">
        <IllustratedChamber
          robot={robot}
          commands={visualCommands}
          action={animation}
          selectedScan={selectedScan}
          language={language}
          routeActive={stage === "movement"}
          reportMotion={setRouteMotion}
        />
        <div className="boltbot-test-controls">
          {stage === "movement" ? (
            <>
              <div className="boltbot-command-route" aria-label={language === "es-MX" ? "Ruta programada" : "Programmed route"}>
                {[0, 1, 2].map((index) => <span key={index}>{commands[index] ? tr(copy[commands[index]], language) : index + 1}</span>)}
              </div>
              <div className="boltbot-choice-grid" role="group" aria-label={tr(copy.movement, language)}>
                {(["forward", "left", "right"] as const).map((command) => (
                  <button type="button" key={command} disabled={routeComplete} onClick={() => selectMovement(command)}>{tr(copy[command], language)}</button>
                ))}
              </div>
              {routeComplete ? <p className={routePassed ? "test-feedback is-correct" : "test-feedback is-wrong"} role="status">{tr(routePassed ? copy.routeCorrect : copy.routeWrong, language)}</p> : null}
              {routePassed ? <button type="button" className="fw-primary" onClick={() => advance({ type: "PASS_MOVEMENT_TEST" })}>{tr(copy.runRoute, language)}</button> : null}
              {routeComplete && !routePassed ? <button type="button" onClick={() => { setCommands([]); play("Idle", 0); }}>{tr(copy.resetRoute, language)}</button> : null}
            </>
          ) : null}
          {stage === "scanner" ? (
            <>
              <div className="boltbot-scan-grid" role="group" aria-label={tr(copy.scanner, language)}>
                {BOLT_BOT_SCAN_TARGETS.map((target) => (
                  <button type="button" aria-pressed={selectedScan === target.id} key={target.id} onClick={() => { setSelectedScan(target.id); play("Scan", 1100); }}>
                    <strong>{tr(targetCopy[target.id], language)}</strong>
                    <span>{tr(copy.signal, language)} {target.signal}</span>
                    {selectedScan === target.id ? <small>{tr(copy.selected, language)}</small> : null}
                  </button>
                ))}
              </div>
              {selectedScan ? <p className={scanPassed ? "test-feedback is-correct" : "test-feedback is-wrong"} role="status">{tr(scanPassed ? copy.scanCorrect : copy.scanWrong, language)}</p> : null}
              {scanPassed ? <button type="button" className="fw-primary" onClick={() => advance({ type: "PASS_SCANNER_TEST" })}>{tr(copy.confirmScan, language)}</button> : null}
            </>
          ) : null}
          {stage === "logic" ? (
            <>
              <div className="boltbot-logic-sequence" aria-label={language === "es-MX" ? "Patrón de lógica" : "Logic pattern"}>
                {BOLT_BOT_LOGIC_SEQUENCE.map((item, index) => (
                  <span key={`${item}-${index}`} aria-label={item === "star" ? (language === "es-MX" ? "Estrella" : "Star") : (language === "es-MX" ? "Tornillo" : "Bolt")}>
                    {item === "star" ? "★" : "⬡"}
                  </span>
                ))}
                <span aria-label={language === "es-MX" ? "Elemento desconocido" : "Unknown item"}>?</span>
              </div>
              <div className="boltbot-choice-grid" role="group" aria-label={tr(copy.logic, language)}>
                <button type="button" aria-pressed={logicAnswer === "star"} onClick={() => { setLogicAnswer("star"); play("Think", 1000); }}>★ {language === "es-MX" ? "Estrella" : "Star"}</button>
                <button type="button" aria-pressed={logicAnswer === "bolt"} onClick={() => { setLogicAnswer("bolt"); play("Think", 1000); }}>⬡ {language === "es-MX" ? "Tornillo" : "Bolt"}</button>
              </div>
              {logicAnswer ? <p className={logicPassed ? "test-feedback is-correct" : "test-feedback is-wrong"} role="status">{tr(logicPassed ? copy.logicCorrect : copy.logicWrong, language)}</p> : null}
              {logicAnswer === BOLT_BOT_LOGIC_ANSWER ? <button type="button" className="fw-primary" onClick={() => advance({ type: "PASS_LOGIC_TEST" })}>{tr(copy.confirmLogic, language)}</button> : null}
            </>
          ) : null}
          {stage === "complete" ? <button type="button" className="fw-primary" onClick={returnToMap}>{tr(copy.returnMap, language)}</button> : null}
        </div>
      </div>
    </section>
  );
}
