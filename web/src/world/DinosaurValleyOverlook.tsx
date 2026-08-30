import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, MathUtils, Vector3, type Group, type Mesh } from "three";
import { CameraRig, CanonicalNico, GameCanvas, readQualityProfile } from "../game3d";
import { tr, type Localized } from "../i18n/core";
import type { Language } from "../types";
import type { Announce } from "./common";
import {
  DINOSAUR_VALLEY_OBSERVATIONS,
  initialDinosaurValleyObservationState,
  isDinosaurValleyObservationComplete,
  nextDinosaurValleyObservation,
  observeDinosaurValleyClue,
  type DinosaurValleyObservation,
} from "./dinosaurValleyObservation";
import "./dinosaur-valley-overlook.css";

const copy = {
  eyebrow: { en: "Dinosaur Valley · Sunrise overlook", "es-MX": "Valle de dinosaurios · Mirador al amanecer" },
  title: { en: "Follow the gentle giant", "es-MX": "Sigue al gigante tranquilo" },
  body: {
    en: "Observe three clues in order. Each one brings a long-necked dinosaur closer without disturbing the valley.",
    "es-MX": "Observa tres pistas en orden. Cada una acerca a un dinosaurio de cuello largo sin molestar al valle.",
  },
  instruction: {
    en: "Use the clue buttons. No dragging or time limit is required.",
    "es-MX": "Usa los botones de pistas. No necesitas arrastrar ni tienes límite de tiempo.",
  },
  scene: { en: "Living Dinosaur Valley overlook", "es-MX": "Mirador viviente del Valle de dinosaurios" },
  loading: { en: "Preparing the valley overlook", "es-MX": "Preparando el mirador del valle" },
  ready: { en: "Dinosaur Valley scene ready", "es-MX": "Escena del Valle de dinosaurios lista" },
  lost: { en: "The 3D view paused. Observation controls still work.", "es-MX": "La vista 3D se pausó. Los controles de observación siguen funcionando." },
  restored: { en: "The 3D valley is ready again.", "es-MX": "El valle 3D está listo de nuevo." },
  unavailable: { en: "The 3D overlook is unavailable. Continue with the accessible clues.", "es-MX": "El mirador 3D no está disponible. Continúa con las pistas accesibles." },
  progress: { en: "Observation progress", "es-MX": "Progreso de observación" },
  completeTitle: { en: "Brachiosaurus found!", "es-MX": "¡Brachiosaurus encontrado!" },
  completeBody: {
    en: "The footprints, treetop bites, and quiet herd path all pointed to this peaceful plant-eater.",
    "es-MX": "Las huellas, las mordidas en las copas y el sendero tranquilo indicaban a este pacífico herbívoro.",
  },
  reset: { en: "Start another quiet watch", "es-MX": "Iniciar otra observación tranquila" },
} satisfies Record<string, Localized>;

const clueCopy: Record<DinosaurValleyObservation, { title: Localized; description: Localized; found: Localized }> = {
  footprints: {
    title: { en: "Read the footprints", "es-MX": "Lee las huellas" },
    description: { en: "Look for broad, round tracks near the riverbank.", "es-MX": "Busca huellas anchas y redondas junto al río." },
    found: { en: "The deep round tracks belong to a very large four-legged animal.", "es-MX": "Las huellas redondas y profundas pertenecen a un animal muy grande de cuatro patas." },
  },
  canopy: {
    title: { en: "Inspect the canopy", "es-MX": "Inspecciona las copas" },
    description: { en: "Notice which fresh leaves are missing high above Nico.", "es-MX": "Observa qué hojas frescas faltan muy por encima de Nico." },
    found: { en: "Only a long neck could reach those freshly nibbled leaves.", "es-MX": "Solo un cuello largo podría alcanzar esas hojas recién mordidas." },
  },
  "herd-path": {
    title: { en: "Watch the herd path", "es-MX": "Observa el sendero de la manada" },
    description: { en: "Wait quietly where the tall cycads bend apart.", "es-MX": "Espera en silencio donde las cícadas altas se separan." },
    found: { en: "The ferns part and a gentle Brachiosaurus steps into view.", "es-MX": "Los helechos se abren y un Brachiosaurus tranquilo aparece ante ti." },
  },
};

function Fern({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, .34, 0]}>
        <cylinderGeometry args={[.045, .075, .7, 7]} />
        <meshStandardMaterial color="#3f6212" roughness={.92} />
      </mesh>
      {[-.6, -.3, 0, .3, .6].map((turn, index) => (
        <mesh key={turn} castShadow position={[Math.sin(turn) * .2, .48 + index * .055, Math.cos(turn) * .13]} rotation={[0, turn, -.72 + index * .36]}>
          <sphereGeometry args={[.2, 7, 5]} />
          <meshStandardMaterial color={index % 2 ? "#65a30d" : "#4d7c0f"} roughness={.95} />
        </mesh>
      ))}
    </group>
  );
}

function Brachiosaurus({ stage, reducedMotion }: { stage: number; reducedMotion: boolean }) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const neck = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const legs = useRef<(Group | null)[]>([]);
  const gait = useRef(0);
  const velocity = useRef(0);
  const targetX = [-3.2, -2.35, -1.35, -.15][stage] ?? -.15;
  const neckCurve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(-.28, .58, 0),
    new Vector3(-.48, 1.26, 0),
    new Vector3(-.68, 1.9, 0),
  ]), []);

  useFrame(({ clock }, delta) => {
    if (!root.current || !body.current || !neck.current || !tail.current) return;
    const safeDelta = Math.min(delta, .05);
    if (reducedMotion) {
      root.current.position.x = targetX;
      root.current.rotation.y = -.12;
      body.current.position.y = 1.25;
      neck.current.rotation.z = -.08;
      tail.current.rotation.z = .08;
      legs.current.forEach((leg) => { if (leg) leg.rotation.x = 0; });
      return;
    }

    const before = root.current.position.x;
    root.current.position.x = MathUtils.damp(before, targetX, 1.15, safeDelta);
    velocity.current = MathUtils.damp(velocity.current, (root.current.position.x - before) / Math.max(safeDelta, .001), 5, safeDelta);
    const speed = Math.abs(velocity.current);
    gait.current += speed * safeDelta * 3.2;
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, speed > .025 ? -.12 : -.04, 2.8, safeDelta);

    const step = Math.sin(gait.current);
    legs.current.forEach((leg, index) => {
      if (!leg) return;
      const diagonal = index === 0 || index === 3 ? step : -step;
      leg.rotation.x = MathUtils.damp(leg.rotation.x, diagonal * Math.min(.23, speed * .24), 8, safeDelta);
    });
    const weight = Math.min(1, speed * .8);
    body.current.position.y = 1.25 + Math.abs(Math.sin(gait.current * 2)) * .025 * weight;
    body.current.rotation.z = MathUtils.damp(body.current.rotation.z, -step * .015 * weight, 6, safeDelta);
    neck.current.rotation.z = MathUtils.damp(neck.current.rotation.z, -.08 - velocity.current * .018, 2.3, safeDelta);
    tail.current.rotation.z = MathUtils.damp(tail.current.rotation.z, .08 + velocity.current * .026, 1.8, safeDelta);
    neck.current.rotation.y = Math.sin(clock.elapsedTime * .45) * .025 * (1 - weight);
  });

  const legData = [
    [-.72, .84, .34], [-.72, .84, -.34], [.66, .84, .32], [.66, .84, -.32],
  ] as const;

  return (
    <group ref={root} position={[-3.2, 0, -.55]} rotation={[0, -.12, 0]} scale={.9}>
      <group ref={body} position={[0, 1.25, 0]}>
        <mesh castShadow scale={[1.25, .68, .62]}>
          <sphereGeometry args={[.72, 20, 14]} />
          <meshStandardMaterial color="#8faa68" roughness={.82} />
        </mesh>
        <mesh castShadow position={[-.12, .24, .53]} rotation={[.18, 0, .02]} scale={[.78, .45, .09]}>
          <sphereGeometry args={[.7, 16, 10]} />
          <meshStandardMaterial color="#d5c889" roughness={.88} />
        </mesh>
      </group>
      {legData.map(([x, y, z], index) => (
        <group key={index} ref={(node) => { legs.current[index] = node; }} position={[x, y, z]}>
          <mesh castShadow position={[0, -.24, 0]}>
            <cylinderGeometry args={[.15, .19, .9, 9]} />
            <meshStandardMaterial color={index < 2 ? "#839c61" : "#91aa69"} roughness={.9} />
          </mesh>
          <mesh castShadow position={[.07, -.71, .04]} scale={[1.35, .48, 1.1]}>
            <sphereGeometry args={[.2, 9, 7]} />
            <meshStandardMaterial color="#718651" roughness={.94} />
          </mesh>
        </group>
      ))}
      <group ref={neck} position={[-.88, 1.46, 0]} rotation={[0, 0, -.08]}>
        <mesh castShadow>
          <tubeGeometry args={[neckCurve, 28, .22, 12, false]} />
          <meshStandardMaterial color="#789451" roughness={.84} />
        </mesh>
        <mesh castShadow position={[-.78, 2.06, 0]} scale={[.56, .34, .38]} rotation={[0, 0, -.08]}>
          <sphereGeometry args={[.45, 14, 10]} />
          <meshStandardMaterial color="#86a45a" roughness={.84} />
        </mesh>
        <mesh position={[-.94, 2.15, .16]}>
          <sphereGeometry args={[.035, 8, 8]} />
          <meshStandardMaterial color="#18230e" roughness={.4} />
        </mesh>
      </group>
      <group ref={tail} position={[1.02, 1.35, 0]} rotation={[0, 0, .08]}>
        <mesh castShadow position={[.55, -.05, 0]} scale={[1.2, .34, .34]}>
          <sphereGeometry args={[.52, 14, 10]} />
          <meshStandardMaterial color="#76904f" roughness={.9} />
        </mesh>
        <mesh castShadow position={[1.36, -.1, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[.16, .86, 10]} />
          <meshStandardMaterial color="#6c8449" roughness={.92} />
        </mesh>
      </group>
    </group>
  );
}

function ValleyScene({ stage, reducedMotion }: { stage: number; reducedMotion: boolean }) {
  const sun = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (sun.current && !reducedMotion) sun.current.rotation.z = clock.elapsedTime * .025;
  });

  return (
    <>
      <color attach="background" args={["#7cc6cc"]} />
      <fog attach="fog" args={["#8ac7c5", 9, 28]} />
      <CameraRig position={[0, 2.45, 6.35]} target={[-.35, 1.38, 0]} damping={6} />
      <directionalLight castShadow color="#ffd58a" intensity={1.05} position={[-4, 7, 5]} />
      <mesh ref={sun} position={[-4.5, 4.5, -8]}>
        <circleGeometry args={[.75, 32]} />
        <meshBasicMaterial color="#fff0a6" />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.04, -1]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#536f35" roughness={1} />
      </mesh>
      <mesh position={[0, .01, 1.25]} rotation={[-Math.PI / 2, 0, -.08]} scale={[1, .32, 1]}>
        <planeGeometry args={[12, 2]} />
        <meshStandardMaterial color="#3a9ab0" metalness={.08} roughness={.35} />
      </mesh>
      {[[-4.8, 1.4, -5, 2.4], [-1.8, 1.1, -6.2, 2], [2.1, 1.5, -6.8, 2.7], [5.2, 1.2, -5.4, 2.1]].map(([x, y, z, scale], index) => (
        <mesh key={index} castShadow position={[x, y, z]} scale={[scale, scale * 1.3, scale]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={index % 2 ? "#526d58" : "#617860"} roughness={.98} />
        </mesh>
      ))}
      {[[-4.1, 0, -.2, 1.1], [-3.1, 0, -1.1, .8], [-2.1, 0, -1.8, 1.3], [1.4, 0, -.9, 1.2], [2.4, 0, -1.4, .9], [3.4, 0, -.5, 1.35], [4.2, 0, -2, 1]].map(([x, y, z, scale], index) => (
        <Fern key={index} position={[x, y, z]} scale={scale} />
      ))}
      {stage >= 1 ? [-1.05, -.55, -.05].map((x) => (
        <mesh key={x} position={[x, .025, .68]} rotation={[-Math.PI / 2, 0, -.12]} scale={[1.35, .78, 1]}>
          <ringGeometry args={[.12, .2, 14]} />
          <meshBasicMaterial color="#f6d88e" />
        </mesh>
      )) : null}
      {stage >= 2 ? <pointLight color="#e4f29d" intensity={5} distance={4} position={[-1.5, 2.8, -.4]} /> : null}
      {stage >= 3 ? <pointLight color="#fff1ad" intensity={7} distance={7} position={[0, 3.2, 1]} /> : null}
      <Brachiosaurus stage={stage} reducedMotion={reducedMotion} />
      <CanonicalNico animation={reducedMotion || stage < 3 ? "Idle" : "Celebrate"} position={[1.45, 0, .5]} rotation={[0, -.38, 0]} scale={.66} />
    </>
  );
}

export function DinosaurValleyOverlook({ language, announce }: { language: Language; announce: Announce }) {
  const quality = useMemo(() => readQualityProfile(), []);
  const [state, setState] = useState(initialDinosaurValleyObservationState);
  const next = nextDinosaurValleyObservation(state);
  const complete = isDinosaurValleyObservationComplete(state);
  const buttons = useRef<Partial<Record<DinosaurValleyObservation, HTMLButtonElement | null>>>({});
  const reveal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (next && state.completed.length > 0) buttons.current[next]?.focus();
    if (!next && state.completed.length === DINOSAUR_VALLEY_OBSERVATIONS.length) reveal.current?.focus();
  }, [next, state.completed.length]);

  const observe = (observation: DinosaurValleyObservation) => {
    const updated = observeDinosaurValleyClue(state, observation);
    if (updated === state) return;
    setState(updated);
    announce(tr(clueCopy[observation].found, language));
  };
  const reset = () => {
    setState(initialDinosaurValleyObservationState());
    window.requestAnimationFrame(() => buttons.current.footprints?.focus());
  };

  const labels = {
    scene: tr(copy.scene, language),
    loading: tr(copy.loading, language),
    ready: tr(copy.ready, language),
    contextLost: tr(copy.lost, language),
    contextRestored: tr(copy.restored, language),
    unavailable: tr(copy.unavailable, language),
    instructions: tr(copy.instruction, language),
  };

  return (
    <section className={`dino-overlook ${complete ? "is-complete" : ""}`} aria-labelledby="dino-overlook-title">
      <header className="dino-overlook__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="dino-overlook-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>
      <div className="dino-overlook__layout">
        <GameCanvas
          labels={labels}
          quality={quality}
          controls={<span>{state.completed.length}/{DINOSAUR_VALLEY_OBSERVATIONS.length} · {tr(copy.progress, language)}</span>}
        >
          <ValleyScene stage={state.completed.length} reducedMotion={quality.reducedMotion} />
        </GameCanvas>
        <div className="dino-overlook__controls">
          <p className="dino-overlook__instruction">{tr(copy.instruction, language)}</p>
          <progress
            aria-label={tr(copy.progress, language)}
            max={DINOSAUR_VALLEY_OBSERVATIONS.length}
            value={state.completed.length}
          >
            {state.completed.length}/{DINOSAUR_VALLEY_OBSERVATIONS.length}
          </progress>
          <ol className="dino-clue-list">
            {DINOSAUR_VALLEY_OBSERVATIONS.map((observation, index) => {
              const found = state.completed.includes(observation);
              const available = next === observation;
              return (
                <li key={observation} className={found ? "is-found" : available ? "is-next" : ""}>
                  <button
                    ref={(node) => { buttons.current[observation] = node; }}
                    type="button"
                    disabled={!available}
                    aria-pressed={found}
                    onClick={() => observe(observation)}
                  >
                    <span>{found ? "✓" : index + 1}</span>
                    <span>
                      <strong>{tr(clueCopy[observation].title, language)}</strong>
                      <small>{found ? tr(clueCopy[observation].found, language) : tr(clueCopy[observation].description, language)}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {complete ? (
            <div className="dino-overlook__reveal" role="status" ref={reveal} tabIndex={-1}>
              <span aria-hidden="true">🦕</span>
              <div>
                <strong>{tr(copy.completeTitle, language)}</strong>
                <p>{tr(copy.completeBody, language)}</p>
              </div>
              <button type="button" onClick={reset}>{tr(copy.reset, language)}</button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
