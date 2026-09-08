import { useEffect, useMemo, useRef, useState } from "react";
import {
  STAR_BRIDGE_FAULT_TARGETS,
  STAR_CORE_INSTALL_SEQUENCE,
  isStarBridgeFault,
  passesStarCoreInstall,
  starBridgeRepairStage,
  type StarCoreCommand,
} from "../game/starBridgeRepair";
import type { StarBridgeEvent, StarBridgeState } from "../game/goldenAdventure";
import { AdventureAudio } from "../game3d/audio/AdventureAudio";
import { PremiumBoltBotSprite } from "../boltbot/PremiumBoltBotSprite";
import { NicoCostumeFigure } from "../nico/NicoCostumeFigure";
import worldArt from "../assets/world/nicos-world-map-restored-960.webp";
import { tr, type Localized } from "../i18n/core";
import type { Language, Robot } from "../types";
import "./broken-star-bridge.css";

const copy = {
  eyebrow: { en: "Golden Adventure · Star Bridge", "es-MX": "Aventura dorada · Puente Estelar" },
  inspectTitle: { en: "Inspect the bridge fault", "es-MX": "Inspecciona la falla del puente" },
  inspectBody: {
    en: "Nico spots three damaged areas. Help BoltBot find the one that stopped Star energy from reaching the bridge.",
    "es-MX": "Nico observa tres zonas dañadas. Ayuda a BoltBot a encontrar la que impide que la energía estelar llegue al puente.",
  },
  installTitle: { en: "Install the Star Core", "es-MX": "Instala el Núcleo Estelar" },
  installBody: {
    en: "Use BoltBot's repair grippers in the safe order: align, lock, then charge.",
    "es-MX": "Usa las pinzas de reparación de BoltBot en el orden seguro: alinear, fijar y cargar.",
  },
  activateTitle: { en: "Wake the Star Bridge", "es-MX": "Despierta el Puente Estelar" },
  activateBody: {
    en: "The Star Core is secure. Activate it and watch the whole valley route come alive.",
    "es-MX": "El Núcleo Estelar está asegurado. Actívalo y observa cómo cobra vida la ruta hacia el valle.",
  },
  completeTitle: { en: "The bridge is restored!", "es-MX": "¡El puente está restaurado!" },
  completeBody: {
    en: "Nico and BoltBot repaired the bridge. Dinosaur Valley is unlocked and Star Bridge Engineer is now in the Memory Museum.",
    "es-MX": "Nico y BoltBot repararon el puente. El Valle de Dinosaurios está desbloqueado y la medalla Ingeniero del Puente Estelar ya está en el Museo de Recuerdos.",
  },
  back: { en: "Back to World Map", "es-MX": "Volver al Mapa Mundial" },
  soundOn: { en: "Sound on", "es-MX": "Sonido activado" },
  soundOff: { en: "Sound off", "es-MX": "Sonido desactivado" },
  inspect: { en: "Confirm bridge fault", "es-MX": "Confirmar falla del puente" },
  install: { en: "Install Star Core", "es-MX": "Instalar Núcleo Estelar" },
  activate: { en: "Activate the bridge", "es-MX": "Activar el puente" },
  tryInstall: { en: "Try the installation again", "es-MX": "Intentar la instalación de nuevo" },
  correctFault: { en: "BoltBot found the power interruption!", "es-MX": "¡BoltBot encontró la interrupción de energía!" },
  wrongFault: { en: "That needs repair, but it did not stop the bridge. Inspect another area.", "es-MX": "Eso necesita reparación, pero no detuvo el puente. Inspecciona otra zona." },
  correctInstall: { en: "The Star Core is secure!", "es-MX": "¡El Núcleo Estelar está asegurado!" },
  wrongInstall: { en: "That order is not safe. Reset the grippers and try again.", "es-MX": "Ese orden no es seguro. Reinicia las pinzas e inténtalo de nuevo." },
  achievement: { en: "Star Bridge Engineer", "es-MX": "Ingeniero del Puente Estelar" },
  scene: { en: "Broken Star Bridge repair scene", "es-MX": "Escena de reparación del Puente Estelar Roto" },
} satisfies Record<string, Localized>;

const faultCopy: Record<string, { name: Localized; clue: Localized }> = {
  "cracked-handrail": {
    name: { en: "Cracked handrail", "es-MX": "Barandal agrietado" },
    clue: { en: "The safety rail is bent, but its lights still glow.", "es-MX": "El barandal está doblado, pero sus luces siguen encendidas." },
  },
  "dark-core-socket": {
    name: { en: "Dark Star Core socket", "es-MX": "Conector oscuro del Núcleo Estelar" },
    clue: { en: "No pulse reaches the center bridge beams.", "es-MX": "Ningún pulso llega a las vigas centrales del puente." },
  },
  "loose-banner-cable": {
    name: { en: "Loose banner cable", "es-MX": "Cable suelto del estandarte" },
    clue: { en: "The banner flickers, but the tower still has power.", "es-MX": "El estandarte parpadea, pero la torre todavía tiene energía." },
  },
};

const commandCopy: Record<StarCoreCommand, Localized> = {
  align: { en: "Align", "es-MX": "Alinear" },
  lock: { en: "Lock", "es-MX": "Fijar" },
  charge: { en: "Charge", "es-MX": "Cargar" },
};

function BridgeScene({ state, robot, selectedFault, language }: {
  state: StarBridgeState; robot: Robot; selectedFault: string | null; language: Language;
}) {
  const stage = starBridgeRepairStage(state.step);
  const complete = stage === "complete";
  return <div className="illustrated-bridge" data-renderer="premium-2d" data-stage={stage} role="img" aria-label={tr(copy.scene, language)}>
    <img className="illustrated-bridge__landscape" src={worldArt} alt="" />
    <div className="illustrated-bridge__mist" />
    <svg className="illustrated-bridge__deck" viewBox="0 0 600 300" aria-hidden="true">
      <path d="M0 270 Q140 180 260 245 L260 300H0Z M340 245Q460 180 600 270V300H340Z" fill="#153c52"/>
      <path d="M70 200 Q300 290 530 200" fill="none" stroke="#756399" strokeWidth="22"/>
      <path d={complete ? "M70 200 Q300 240 530 200" : "M70 200L237 224 M365 224L530 200"} fill="none" stroke={complete ? "#f9db86" : "#a6c1cf"} strokeWidth="18"/>
      {[90,180,420,510].map(x=><g key={x}><path d={`M${x} 215V100`} stroke="#bd9a6d" strokeWidth="12"/><circle cx={x} cy="100" r="9" fill="#ffeab2"/></g>)}
      <path d="M90 105Q300 210 510 105" fill="none" stroke="#e7c792" strokeWidth="4"/>
      <path d="M275 224L300 190L325 224L300 254Z" fill={stage === "activate" || complete ? "#ffeaa1" : "#17253c"} stroke={selectedFault === "dark-core-socket" ? "#ffdc7a" : "#76dce6"} strokeWidth="5"/>
      {complete && <path d="M90 204Q300 246 510 204" fill="none" stroke="#fff4b3" strokeWidth="4"/>}
    </svg>
    <div className="illustrated-bridge__nico"><NicoCostumeFigure profession="explorer" alt="Nico" /></div>
    <div className="illustrated-bridge__robot"><PremiumBoltBotSprite robot={robot} action={complete ? "celebrate" : stage === "install" ? "repair" : "scan"} alt={robot.name} /></div>
    <span className="illustrated-bridge__caption">✦ {language === "es-MX" ? "Puente Estelar" : "Star Bridge"}</span>
  </div>;
}

export function BrokenStarBridge({
  state,
  robot,
  language,
  advance,
  close,
}: {
  state: StarBridgeState;
  robot: Robot;
  language: Language;
  advance: (event: StarBridgeEvent) => void;
  close: () => void;
}) {
  const stage = starBridgeRepairStage(state.step);
  const audio = useMemo(() => new AdventureAudio(), []);
  const heading = useRef<HTMLHeadingElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedFault, setSelectedFault] = useState<string | null>(null);
  const [commands, setCommands] = useState<StarCoreCommand[]>([]);

  useEffect(() => () => { void audio.dispose(); }, [audio]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => heading.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  if (stage === "inactive") return null;

  const installComplete = commands.length === STAR_CORE_INSTALL_SEQUENCE.length;
  const installPassed = installComplete && passesStarCoreInstall(commands);
  const faultCorrect = selectedFault !== null && isStarBridgeFault(selectedFault);
  const title = stage === "inspect" ? copy.inspectTitle : stage === "install" ? copy.installTitle : stage === "activate" ? copy.activateTitle : copy.completeTitle;
  const body = stage === "inspect" ? copy.inspectBody : stage === "install" ? copy.installBody : stage === "activate" ? copy.activateBody : copy.completeBody;
  const playCue = (cue: "inspect" | "install" | "activate") => {
    if (soundEnabled) void audio.playCue(cue).catch(() => undefined);
  };


  return (
    <section className={`broken-bridge ${stage === "complete" ? "is-restored" : "is-broken"}`} aria-labelledby="broken-bridge-title">
      <header className="broken-bridge__header">
        <button type="button" onClick={close}>← {tr(copy.back, language)}</button>
        <button type="button" aria-pressed={soundEnabled} onClick={() => setSoundEnabled((current) => !current)}>
          {soundEnabled ? "🔊" : "🔇"} {tr(soundEnabled ? copy.soundOn : copy.soundOff, language)}
        </button>
      </header>
      <div className="broken-bridge__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="broken-bridge-title" ref={heading} tabIndex={-1}>{tr(title, language)}</h2>
        <p>{tr(body, language)}</p>
      </div>
      <div className="broken-bridge__layout">
        <BridgeScene state={state} robot={robot} selectedFault={selectedFault} language={language} />
        <div className="broken-bridge__controls">
          {stage === "inspect" ? (
            <>
              <div className="bridge-fault-grid" role="group" aria-label={tr(copy.inspectTitle, language)}>
                {STAR_BRIDGE_FAULT_TARGETS.map((target) => (
                  <button type="button" aria-pressed={selectedFault === target.id} key={target.id} onClick={() => setSelectedFault(target.id)}>
                    <strong>{tr(faultCopy[target.id].name, language)}</strong>
                    <span>{tr(faultCopy[target.id].clue, language)}</span>
                    <small>{language === "es-MX" ? "Nivel de daño" : "Damage level"}: {target.severity}</small>
                  </button>
                ))}
              </div>
              {selectedFault ? <p className={faultCorrect ? "bridge-feedback is-correct" : "bridge-feedback is-wrong"} role="status">{tr(faultCorrect ? copy.correctFault : copy.wrongFault, language)}</p> : null}
              {faultCorrect ? <button type="button" className="fw-primary" onClick={() => { playCue("inspect"); advance({ type: "INSPECT_BRIDGE" }); }}>{tr(copy.inspect, language)}</button> : null}
            </>
          ) : null}
          {stage === "install" ? (
            <>
              <div className="bridge-install-route" aria-label={language === "es-MX" ? "Secuencia de instalación" : "Installation sequence"}>
                {[0, 1, 2].map((index) => <span key={index}>{commands[index] ? tr(commandCopy[commands[index]], language) : index + 1}</span>)}
              </div>
              <div className="bridge-command-grid" role="group" aria-label={tr(copy.installTitle, language)}>
                {(["align", "lock", "charge"] as const).map((command) => (
                  <button type="button" disabled={installComplete} key={command} onClick={() => setCommands((current) => [...current, command])}>{tr(commandCopy[command], language)}</button>
                ))}
              </div>
              {installComplete ? <p className={installPassed ? "bridge-feedback is-correct" : "bridge-feedback is-wrong"} role="status">{tr(installPassed ? copy.correctInstall : copy.wrongInstall, language)}</p> : null}
              {installPassed ? <button type="button" className="fw-primary" onClick={() => { playCue("install"); advance({ type: "INSTALL_STAR_CORE" }); }}>{tr(copy.install, language)}</button> : null}
              {installComplete && !installPassed ? <button type="button" onClick={() => setCommands([])}>{tr(copy.tryInstall, language)}</button> : null}
            </>
          ) : null}
          {stage === "activate" ? <button type="button" className="bridge-activate" onClick={() => { playCue("activate"); advance({ type: "COMPLETE_ADVENTURE" }); }}>★ {tr(copy.activate, language)}</button> : null}
          {stage === "complete" ? (
            <div className="bridge-achievement" role="status">
              <span aria-hidden="true">🏅</span>
              <strong>{tr(copy.achievement, language)}</strong>
              <button type="button" className="fw-primary" onClick={close}>{tr(copy.back, language)}</button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
