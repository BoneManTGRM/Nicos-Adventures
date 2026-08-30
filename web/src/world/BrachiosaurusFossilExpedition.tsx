import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, type Group, type Mesh, type MeshStandardMaterial } from "three";
import { CameraRig, CanonicalNico, GameCanvas, readQualityProfile } from "../game3d";
import { tr, type Localized } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { DinosaurRecord, Language } from "../types";
import type { Announce } from "./common";
import {
  BRACHIOSAURUS_PERIOD,
  BRUSH_ROUTE,
  FOSSIL_LAYERS,
  brushFossilZone,
  classifyFossilPeriod,
  fossilExpeditionStage,
  initialFossilExpeditionState,
  selectFossilLayer,
  type BrushZone,
  type FossilLayer,
} from "./brachiosaurusFossilExpedition";
import "./brachiosaurus-fossil-expedition.css";

const periods = ["Triassic", "Jurassic", "Cretaceous"] as const;

const copy = {
  eyebrow: { en: "Dinosaur Valley · Fossil fieldwork", "es-MX": "Valle de dinosaurios · Trabajo de campo fósil" },
  survey: { en: "Survey the fossil layer", "es-MX": "Examina la capa fósil" },
  surveyBody: {
    en: "Find the calm sedimentary layer with a curved bone fragment and fern impressions.",
    "es-MX": "Encuentra la capa sedimentaria tranquila con un fragmento curvo de hueso e impresiones de helechos.",
  },
  brush: { en: "Brush from edge to center", "es-MX": "Cepilla del borde hacia el centro" },
  brushBody: {
    en: "Protect the fossil by clearing the outer ridge, then the vertebra, then the leg bone.",
    "es-MX": "Protege el fósil limpiando primero el borde, después la vértebra y al final el hueso de la pata.",
  },
  classify: { en: "Classify the discovery", "es-MX": "Clasifica el descubrimiento" },
  classifyBody: {
    en: "The long front limb and tall shoulder match Brachiosaurus. In which period did it live?",
    "es-MX": "La larga pata delantera y el hombro alto coinciden con Brachiosaurus. ¿En qué periodo vivió?",
  },
  complete: { en: "Brachiosaurus discovered!", "es-MX": "¡Brachiosaurus descubierto!" },
  completeBody: {
    en: "The fossil is safe in the field guide. You recovered one fossil and earned two stars.",
    "es-MX": "El fósil está seguro en la guía de campo. Recuperaste un fósil y ganaste dos estrellas.",
  },
  completeExisting: {
    en: "This fossil is already safe in the field guide. Revisit the evidence or continue to another expedition.",
    "es-MX": "Este fósil ya está seguro en la guía de campo. Revisa la evidencia o continúa con otra expedición.",
  },
  close: { en: "Close expedition", "es-MX": "Cerrar expedición" },
  next: { en: "Find another dinosaur", "es-MX": "Buscar otro dinosaurio" },
  scene: { en: "Brachiosaurus fossil excavation", "es-MX": "Excavación del fósil de Brachiosaurus" },
  loading: { en: "Preparing the fossil trench", "es-MX": "Preparando la zanja fósil" },
  ready: { en: "Fossil trench ready", "es-MX": "Zanja fósil lista" },
  lost: { en: "The 3D trench paused. Excavation controls still work.", "es-MX": "La zanja 3D se pausó. Los controles de excavación siguen funcionando." },
  restored: { en: "The 3D trench is ready again.", "es-MX": "La zanja 3D está lista de nuevo." },
  unavailable: { en: "The 3D trench is unavailable. Continue with the accessible field controls.", "es-MX": "La zanja 3D no está disponible. Continúa con los controles de campo accesibles." },
  instructions: { en: "Use the field buttons in order. No dragging or time limit is required.", "es-MX": "Usa los botones de campo en orden. No necesitas arrastrar ni tienes límite de tiempo." },
  correctLayer: { en: "Fern-imprint shale protects the fossil!", "es-MX": "¡La lutita con impresiones de helechos protege el fósil!" },
  wrongLayer: { en: "That layer has no matching bone clue. Survey another layer.", "es-MX": "Esa capa no tiene una pista ósea que coincida. Examina otra capa." },
  wrongPeriod: { en: "Not yet. Compare the field clue with the period choices.", "es-MX": "Todavía no. Compara la pista de campo con las opciones de periodos." },
} satisfies Record<string, Localized>;

const layerCopy: Record<FossilLayer, Localized> = {
  "river-silt": { en: "Loose river silt", "es-MX": "Limo suelto del río" },
  "fern-shale": { en: "Fern-imprint shale", "es-MX": "Lutita con impresiones de helechos" },
  "volcanic-ash": { en: "Dark volcanic ash", "es-MX": "Ceniza volcánica oscura" },
};

const brushCopy: Record<BrushZone, Localized> = {
  "outer-ridge": { en: "Brush outer ridge", "es-MX": "Cepillar el borde" },
  vertebra: { en: "Brush vertebra", "es-MX": "Cepillar la vértebra" },
  femur: { en: "Brush leg bone", "es-MX": "Cepillar el hueso de la pata" },
};

function FossilScene({ brushed, stage, reducedMotion }: { brushed: number; stage: string; reducedMotion: boolean }) {
  const brush = useRef<Group>(null);
  const dust = useRef<MeshStandardMaterial>(null);
  const sediment = useRef<(Mesh | null)[]>([]);
  const targets = [-1.15, -.35, .48, 1.05];

  useFrame(({ clock }, delta) => {
    const safeDelta = Math.min(delta, .05);
    if (brush.current) {
      const target = targets[brushed] ?? targets[3];
      brush.current.position.x = reducedMotion ? target : MathUtils.damp(brush.current.position.x, target, 5, safeDelta);
      brush.current.rotation.z = reducedMotion ? -.18 : -.18 + Math.sin(clock.elapsedTime * 3.1) * .08;
    }
    sediment.current.forEach((mesh, index) => {
      if (!mesh) return;
      const targetScale = index < brushed ? .05 : 1;
      mesh.scale.y = reducedMotion ? targetScale : MathUtils.damp(mesh.scale.y, targetScale, 6, safeDelta);
    });
    if (dust.current) {
      const active = stage === "brush" && brushed < BRUSH_ROUTE.length && !reducedMotion;
      dust.current.opacity = MathUtils.damp(dust.current.opacity, active ? .35 : 0, 5, safeDelta);
    }
  });

  const complete = stage === "complete";
  return (
    <>
      <color attach="background" args={["#8a6340"]} />
      <fog attach="fog" args={["#9a7652", 8, 24]} />
      <CameraRig position={[0, 3.05, 6.1]} target={[0, .5, -.25]} damping={7} />
      <directionalLight color="#ffd89a" intensity={1.35} position={[-3, 6, 4]} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.08, -.5]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#6f4e31" roughness={1} />
      </mesh>
      {[[-2.6, .25, -1.8, "#5f432f"], [0, .32, -2.05, "#806044"], [2.6, .2, -1.7, "#4b3b35"]].map(([x, y, z, color], index) => (
        <mesh key={index} castShadow receiveShadow position={[x as number, y as number, z as number]}>
          <boxGeometry args={[2.45, .5 + index * .12, 1.4]} />
          <meshStandardMaterial color={color as string} roughness={.96} />
        </mesh>
      ))}
      <mesh receiveShadow position={[0, .04, -.15]}>
        <boxGeometry args={[4.5, .2, 2.55]} />
        <meshStandardMaterial color="#b58a58" roughness={.98} />
      </mesh>
      <group position={[-.62, .2, -.12]} rotation={[Math.PI / 2, 0, .12]}>
        <mesh castShadow>
          <torusGeometry args={[.42, .11, 10, 24, Math.PI * 1.55]} />
          <meshStandardMaterial color="#ead7a4" roughness={.7} emissive={complete ? "#6b4f18" : "#000000"} emissiveIntensity={complete ? .35 : 0} />
        </mesh>
        {[-.2, .08, .36].map((x) => (
          <mesh key={x} castShadow position={[x, -.36, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[.08, .1, .38, 10]} />
            <meshStandardMaterial color="#e5cf98" roughness={.72} />
          </mesh>
        ))}
        <mesh castShadow position={[1.15, -.1, 0]} rotation={[0, 0, 1.12]}>
          <capsuleGeometry args={[.13, 1.05, 6, 10]} />
          <meshStandardMaterial color="#f0dda9" roughness={.72} />
        </mesh>
      </group>
      {[[-1.05, .27, -.05], [-.28, .25, -.05], [.7, .28, -.05]].map(([x, y, z], index) => (
        <mesh key={index} ref={(node) => { sediment.current[index] = node; }} position={[x, y, z]}>
          <sphereGeometry args={[.5, 10, 7]} />
          <meshStandardMaterial color="#b88955" roughness={1} />
        </mesh>
      ))}
      <group ref={brush} position={[-1.15, .55, .75]} rotation={[0, 0, -.18]} visible={stage !== "survey"}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[.06, .72, 5, 8]} />
          <meshStandardMaterial color="#2f5d45" roughness={.72} />
        </mesh>
        <mesh castShadow position={[-.47, 0, 0]}>
          <boxGeometry args={[.24, .25, .18]} />
          <meshStandardMaterial color="#d7b879" roughness={.9} />
        </mesh>
      </group>
      <mesh position={[targets[Math.min(brushed, 2)], .35, .78]} visible={stage === "brush"}>
        <sphereGeometry args={[.26, 10, 8]} />
        <meshStandardMaterial ref={dust} color="#ead2a8" transparent opacity={0} depthWrite={false} />
      </mesh>
      <CanonicalNico animation={reducedMotion || !complete ? "Idle" : "Celebrate"} position={[2.15, 0, .55]} rotation={[0, -.45, 0]} scale={.62} />
    </>
  );
}

export function BrachiosaurusFossilExpedition({
  dinosaur,
  language,
  discovered,
  announce,
  completeDiscovery,
  close,
  nextDinosaur,
}: {
  dinosaur: DinosaurRecord;
  language: Language;
  discovered: boolean;
  announce: Announce;
  completeDiscovery: () => void;
  close: () => void;
  nextDinosaur: () => void;
}) {
  const quality = useMemo(() => readQualityProfile(), []);
  const [state, setState] = useState(() => initialFossilExpeditionState(discovered));
  const [completedThisVisit, setCompletedThisVisit] = useState(false);
  const stage = fossilExpeditionStage(state);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => heading.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  const title = stage === "survey" ? copy.survey : stage === "brush" ? copy.brush : stage === "classify" ? copy.classify : copy.complete;
  const completionBody = completedThisVisit ? copy.completeBody : copy.completeExisting;
  const body = stage === "survey" ? copy.surveyBody : stage === "brush" ? copy.brushBody : stage === "classify" ? copy.classifyBody : completionBody;
  const labels = {
    scene: tr(copy.scene, language),
    loading: tr(copy.loading, language),
    ready: tr(copy.ready, language),
    contextLost: tr(copy.lost, language),
    contextRestored: tr(copy.restored, language),
    unavailable: tr(copy.unavailable, language),
    instructions: tr(copy.instructions, language),
  };

  const chooseLayer = (layer: FossilLayer) => {
    const next = selectFossilLayer(state, layer);
    setState(next);
    announce(tr(layer === "fern-shale" ? copy.correctLayer : copy.wrongLayer, language));
  };
  const brush = (zone: BrushZone) => {
    const next = brushFossilZone(state, zone);
    if (next === state) return;
    setState(next);
    announce(tr(brushCopy[zone], language));
  };
  const classify = (period: string) => {
    const next = classifyFossilPeriod(state, period);
    setState(next);
    if (period === BRACHIOSAURUS_PERIOD) {
      setCompletedThisVisit(true);
      completeDiscovery();
    }
    else announce(tr(copy.wrongPeriod, language));
  };

  return (
    <section className={`fossil-expedition is-${stage}`} aria-labelledby="fossil-expedition-title">
      <header className="fossil-expedition__header">
        <div>
          <small>{tr(copy.eyebrow, language)}</small>
          <h2 id="fossil-expedition-title" ref={heading} tabIndex={-1}>{tr(title, language)}</h2>
          <p>{tr(body, language)}</p>
        </div>
        <button type="button" onClick={close} aria-label={tr(copy.close, language)}>×</button>
      </header>
      <div className="fossil-expedition__layout">
        <GameCanvas labels={labels} quality={quality} controls={<span>{dinosaur.name} · {tr(title, language)}</span>}>
          <FossilScene brushed={state.brushed.length} stage={stage} reducedMotion={quality.reducedMotion} />
        </GameCanvas>
        <div className="fossil-expedition__controls">
          {stage === "survey" ? (
            <div className="fossil-option-grid" role="group" aria-label={tr(copy.survey, language)}>
              {FOSSIL_LAYERS.map((layer) => (
                <button type="button" key={layer} aria-pressed={state.layer === layer} onClick={() => chooseLayer(layer)}>
                  <span aria-hidden="true">{layer === "river-silt" ? "≈" : layer === "fern-shale" ? "❧" : "◆"}</span>
                  {tr(layerCopy[layer], language)}
                </button>
              ))}
              {state.layer ? <p className={state.layer === "fern-shale" ? "is-correct" : "is-wrong"} role="status">{tr(state.layer === "fern-shale" ? copy.correctLayer : copy.wrongLayer, language)}</p> : null}
            </div>
          ) : null}
          {stage === "brush" ? (
            <ol className="fossil-brush-route" aria-label={tr(copy.brush, language)}>
              {BRUSH_ROUTE.map((zone, index) => {
                const done = state.brushed.includes(zone);
                const available = state.brushed.length === index;
                return (
                  <li key={zone} className={done ? "is-done" : available ? "is-next" : ""}>
                    <button type="button" disabled={!available} onClick={() => brush(zone)}>
                      <span>{done ? "✓" : index + 1}</span>{tr(brushCopy[zone], language)}
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}
          {stage === "classify" ? (
            <div className="fossil-period-grid" role="group" aria-label={tr(copy.classify, language)}>
              {periods.map((period) => (
                <button type="button" key={period} aria-pressed={state.period === period} onClick={() => classify(period)}>{optionLabel(period, language)}</button>
              ))}
              {state.period && state.period !== BRACHIOSAURUS_PERIOD ? <p className="is-wrong" role="status">{tr(copy.wrongPeriod, language)}</p> : null}
            </div>
          ) : null}
          {stage === "complete" ? (
            <div className="fossil-expedition__complete" role="status">
              <span aria-hidden="true">🦴</span>
              <strong>{tr(copy.complete, language)}</strong>
              <p>{tr(completionBody, language)}</p>
              <button type="button" onClick={nextDinosaur}>{tr(copy.next, language)} →</button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
