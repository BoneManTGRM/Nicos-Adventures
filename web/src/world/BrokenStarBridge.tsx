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
import {
  AdventureAudio,
  BoltBot,
  CanonicalNico,
  GameCanvas,
  readQualityProfile,
} from "../game3d";
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
  loading: { en: "Loading the Star Bridge", "es-MX": "Cargando el Puente Estelar" },
  ready: { en: "Star Bridge scene ready", "es-MX": "Escena del Puente Estelar lista" },
  lost: { en: "The 3D view paused. Repair controls still work.", "es-MX": "La vista 3D se pausó. Los controles de reparación siguen funcionando." },
  restored: { en: "The 3D view is ready again.", "es-MX": "La vista 3D está lista de nuevo." },
  unavailable: { en: "The 3D view is unavailable. Continue with the accessible repair controls.", "es-MX": "La vista 3D no está disponible. Continúa con los controles accesibles de reparación." },
  instructions: { en: "Use the repair controls beside the scene.", "es-MX": "Usa los controles de reparación junto a la escena." },
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

function BridgeScene({
  state,
  robot,
  selectedFault,
  reducedMotion,
}: {
  state: StarBridgeState;
  robot: Robot;
  selectedFault: string | null;
  reducedMotion: boolean;
}) {
  const stage = starBridgeRepairStage(state.step);
  const complete = stage === "complete";
  const coreInstalled = stage === "activate" || complete;
  const brokenDeck = [
    [-1.75, .62, -.8, 0],
    [-1.02, .55, -.8, -.13],
    [1.02, .52, -.8, .15],
    [1.75, .62, -.8, 0],
  ] as const;
  const restoredDeck = [-1.8, -1.08, -.36, .36, 1.08, 1.8].map((x) => [x, .62, -.8, 0] as const);
  const boltAnimation = reducedMotion
    ? "Idle"
    : complete
      ? "Celebrate"
      : stage === "install"
        ? "Repair"
        : stage === "inspect"
          ? "Scan"
          : "Think";

  return (
    <>
      <pointLight color={complete ? "#fde68a" : "#38bdf8"} intensity={complete ? 9 : 3} position={[0, 3, 0]} distance={10} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.04, -.3]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color={complete ? "#174c52" : "#111d3f"} roughness={.86} />
      </mesh>
      {[-2.5, 2.5].map((x) => (
        <mesh key={x} castShadow position={[x, 1.15, -.8]}>
          <boxGeometry args={[.55, 2.3, .75]} />
          <meshStandardMaterial color={complete ? "#d6b85d" : "#155e75"} metalness={.35} roughness={.42} />
        </mesh>
      ))}
      {(complete ? restoredDeck : brokenDeck).map(([x, y, z, rotation], index) => (
        <mesh key={index} castShadow receiveShadow position={[x, y, z]} rotation={[0, 0, rotation]}>
          <boxGeometry args={[.68, .16, 1.05]} />
          <meshStandardMaterial color={complete ? "#facc15" : "#287da0"} emissive={complete ? "#854d0e" : "#082f49"} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.05, -.72]} scale={selectedFault === "dark-core-socket" ? 1.12 : 1}>
        <octahedronGeometry args={[.36, 0]} />
        <meshStandardMaterial
          color={coreInstalled ? "#fde68a" : "#334155"}
          emissive={coreInstalled ? "#f59e0b" : "#020617"}
          emissiveIntensity={complete ? 3 : 1}
        />
      </mesh>
      {complete ? Array.from({ length: 10 }, (_, index) => (
        <mesh key={index} position={[-2.7 + index * .6, 1.7 + (index % 3) * .38, -1.2]}>
          <sphereGeometry args={[.045, 8, 8]} />
          <meshBasicMaterial color={index % 2 ? "#67e8f9" : "#fde68a"} />
        </mesh>
      )) : null}
      <CanonicalNico animation={reducedMotion || !complete ? "Idle" : "Celebrate"} position={[-1.45, 0, .75]} rotation={[0, .2, 0]} scale={.85} />
      <BoltBot animation={boltAnimation} robot={robot} position={[1.35, 0, .7]} rotation={[0, -.25, 0]} scale={.78} />
    </>
  );
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
  const quality = useMemo(() => readQualityProfile(), []);
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
  const labels = {
    scene: tr(copy.scene, language),
    loading: tr(copy.loading, language),
    ready: tr(copy.ready, language),
    contextLost: tr(copy.lost, language),
    contextRestored: tr(copy.restored, language),
    unavailable: tr(copy.unavailable, language),
    instructions: tr(copy.instructions, language),
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
        <GameCanvas labels={labels} quality={quality} controls={<span>{tr(title, language)}</span>}>
          <BridgeScene state={state} robot={robot} selectedFault={selectedFault} reducedMotion={quality.reducedMotion} />
        </GameCanvas>
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
