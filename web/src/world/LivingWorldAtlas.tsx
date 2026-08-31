import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, MathUtils, Vector3, type Group, type Mesh } from "three";
import { CameraRig, GameCanvas, readQualityProfile } from "../game3d";
import { tr, type Localized } from "../i18n/core";
import type { Language, SectionId } from "../types";
import { WORLD_SECTIONS } from "./catalogs";
import { IllustratedWorldFallback } from "./IllustratedWorldFallback";
import { isWorldAtlasLandmarkLocked, WORLD_ATLAS_LANDMARKS } from "./livingWorldAtlas";
import "./living-world-atlas.css";

const copy = {
  eyebrow: { en: "Nico's World · Living atlas", "es-MX": "Mundo de Nico · Atlas viviente" },
  title: { en: "A whole world is waking up", "es-MX": "Todo un mundo está despertando" },
  body: {
    en: "Follow the glowing trails from Robo Lab to forests, castles, museums, and the newly discovered Dinosaur Valley.",
    "es-MX": "Sigue los senderos luminosos del Laboratorio robot a bosques, castillos, museos y el recién descubierto Valle de dinosaurios.",
  },
  scene: { en: "Living illustrated map of Nico's World", "es-MX": "Mapa ilustrado viviente del Mundo de Nico" },
  loading: { en: "Waking up Nico's World", "es-MX": "Despertando el Mundo de Nico" },
  ready: { en: "Nico's living world is ready", "es-MX": "El mundo viviente de Nico está listo" },
  lost: { en: "The illustrated world paused. Landmark buttons still work.", "es-MX": "El mundo ilustrado se pausó. Los botones de lugares aún funcionan." },
  restored: { en: "The illustrated world is moving again.", "es-MX": "El mundo ilustrado está en movimiento otra vez." },
  unavailable: { en: "The illustrated world is unavailable. Choose any landmark below.", "es-MX": "El mundo ilustrado no está disponible. Elige cualquier lugar abajo." },
  instructions: { en: "Choose a landmark below. No dragging or time limit.", "es-MX": "Elige un lugar abajo. No necesitas arrastrar ni tienes límite de tiempo." },
  pauseMotion: { en: "Pause world motion", "es-MX": "Pausar movimiento del mundo" },
  resumeMotion: { en: "Resume world motion", "es-MX": "Reanudar movimiento del mundo" },
  reducedMotion: { en: "World motion is reduced", "es-MX": "El movimiento del mundo está reducido" },
  landmarks: { en: "Featured world landmarks", "es-MX": "Lugares destacados del mundo" },
  openRoute: { en: "Star Bridge route open", "es-MX": "Ruta del Puente Estelar abierta" },
  lockedRoute: { en: "Repair the Star Bridge to open this route", "es-MX": "Repara el Puente Estelar para abrir esta ruta" },
  visit: { en: "Visit", "es-MX": "Visitar" },
} satisfies Record<string, Localized>;

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, .28, 0]}>
        <cylinderGeometry args={[.055, .08, .55, 7]} />
        <meshStandardMaterial color="#6b4427" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, .68, 0]}>
        <coneGeometry args={[.33, .72, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={.96} />
      </mesh>
      <mesh castShadow position={[0, .94, 0]}>
        <coneGeometry args={[.24, .55, 8]} />
        <meshStandardMaterial color="#65a30d" roughness={.94} />
      </mesh>
    </group>
  );
}

function RoboLab() {
  return (
    <group position={[-2.65, .16, -1.2]}>
      <mesh castShadow position={[0, .42, 0]}>
        <cylinderGeometry args={[.52, .62, .72, 10]} />
        <meshStandardMaterial color="#0e7490" metalness={.42} roughness={.4} />
      </mesh>
      <mesh castShadow position={[0, .83, 0]} scale={[1, .55, 1]}>
        <sphereGeometry args={[.5, 16, 10]} />
        <meshStandardMaterial color="#67e8f9" emissive="#155e75" emissiveIntensity={.6} metalness={.2} roughness={.28} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <cylinderGeometry args={[.035, .055, .65, 7]} />
        <meshStandardMaterial color="#e2e8f0" metalness={.8} roughness={.25} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <octahedronGeometry args={[.12, 0]} />
        <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function AnimalForest() {
  const trees = [
    [-.45, 0, .1, .9], [-.18, 0, -.32, 1.12], [.18, 0, .08, .78], [.42, 0, -.18, 1], [.08, 0, .42, .88],
  ] as const;
  return (
    <group position={[-2.45, .14, 1.42]}>
      {trees.map(([x, y, z, scale], index) => <Tree key={index} position={[x, y, z]} scale={scale} />)}
      <mesh position={[0, .18, .02]}>
        <circleGeometry args={[.31, 14]} />
        <meshStandardMaterial color="#bef264" emissive="#3f6212" emissiveIntensity={.25} />
      </mesh>
    </group>
  );
}

function MonsterLab() {
  return (
    <group position={[-.28, .14, .72]}>
      <mesh castShadow position={[0, .36, 0]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[.48, 0]} />
        <meshStandardMaterial color="#7e22ce" emissive="#581c87" emissiveIntensity={.7} metalness={.18} roughness={.32} />
      </mesh>
      <mesh castShadow position={[-.28, .23, .18]}>
        <sphereGeometry args={[.22, 12, 9]} />
        <meshStandardMaterial color="#f0abfc" roughness={.6} />
      </mesh>
      <mesh position={[-.34, .28, .36]}>
        <sphereGeometry args={[.035, 8, 8]} />
        <meshBasicMaterial color="#1e1b4b" />
      </mesh>
    </group>
  );
}

function StoryCastle() {
  return (
    <group position={[.25, .16, -1.72]}>
      <mesh castShadow position={[0, .42, 0]}>
        <boxGeometry args={[.72, .72, .58]} />
        <meshStandardMaterial color="#f9a8d4" roughness={.82} />
      </mesh>
      {[-.42, .42].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, .52, 0]}>
            <cylinderGeometry args={[.2, .24, .92, 8]} />
            <meshStandardMaterial color="#fbcfe8" roughness={.84} />
          </mesh>
          <mesh castShadow position={[0, 1.12, 0]}>
            <coneGeometry args={[.31, .5, 8]} />
            <meshStandardMaterial color="#7c3aed" roughness={.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, .24, .31]}>
        <boxGeometry args={[.2, .42, .04]} />
        <meshStandardMaterial color="#4c1d95" roughness={.72} />
      </mesh>
    </group>
  );
}

function MemoryMuseum() {
  return (
    <group position={[2.45, .16, -1.3]}>
      <mesh castShadow position={[0, .3, 0]}>
        <cylinderGeometry args={[.62, .7, .5, 12]} />
        <meshStandardMaterial color="#e0f2fe" roughness={.62} metalness={.08} />
      </mesh>
      <mesh castShadow position={[0, .65, 0]} scale={[1, .48, 1]}>
        <sphereGeometry args={[.58, 18, 10]} />
        <meshStandardMaterial color="#67e8f9" emissive="#164e63" emissiveIntensity={.35} metalness={.2} roughness={.3} />
      </mesh>
      {[-.38, 0, .38].map((x) => (
        <mesh key={x} castShadow position={[x, .12, .42]}>
          <cylinderGeometry args={[.045, .06, .5, 7]} />
          <meshStandardMaterial color="#fef3c7" roughness={.8} />
        </mesh>
      ))}
    </group>
  );
}

function DinosaurGate({ available }: { available: boolean }) {
  return (
    <group position={[2.6, .15, 1.28]}>
      <mesh castShadow position={[.2, .48, -.28]} scale={[.82, 1.18, .72]}>
        <dodecahedronGeometry args={[.72, 0]} />
        <meshStandardMaterial color={available ? "#55754a" : "#475569"} roughness={.98} />
      </mesh>
      {[-.34, .34].map((x) => (
        <mesh key={x} castShadow position={[x, .55, .34]}>
          <cylinderGeometry args={[.12, .18, 1.1, 8]} />
          <meshStandardMaterial color="#d6c49c" roughness={.94} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.05, .34]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[.37, .09, 8, 16, Math.PI]} />
        <meshStandardMaterial color={available ? "#fde68a" : "#b9a989"} emissive={available ? "#92400e" : "#1e293b"} emissiveIntensity={available ? .55 : .1} roughness={.82} />
      </mesh>
      <mesh position={[0, .55, .39]}>
        <octahedronGeometry args={[.16, 0]} />
        <meshStandardMaterial color={available ? "#fef08a" : "#fb7185"} emissive={available ? "#f59e0b" : "#7f1d1d"} emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}

function BridgeRoute({ available }: { available: boolean }) {
  const segments = available
    ? [[1.2, 0], [1.55, 0], [1.9, 0]]
    : [[1.18, -.08], [1.92, .1]];
  return (
    <group position={[0, .12, .85]} rotation={[0, -.14, 0]}>
      {segments.map(([x, y], index) => (
        <mesh key={index} castShadow position={[x, .18 + y, 0]} rotation={[0, 0, available ? 0 : index ? -.12 : .12]}>
          <boxGeometry args={[.3, .12, .45]} />
          <meshStandardMaterial color={available ? "#fde68a" : "#64748b"} emissive={available ? "#a16207" : "#0f172a"} emissiveIntensity={available ? .62 : .12} metalness={.35} roughness={.4} />
        </mesh>
      ))}
    </group>
  );
}

function LivingWorldScene({ dinosaurValleyAvailable, reducedMotion }: { dinosaurValleyAvailable: boolean; reducedMotion: boolean }) {
  const world = useRef<Group>(null);
  const clouds = useRef<Group>(null);
  const beacon = useRef<Mesh>(null);
  const path = useMemo(() => new CatmullRomCurve3([
    new Vector3(-2.65, .2, -1.2),
    new Vector3(-1.15, .2, -.15),
    new Vector3(-.28, .2, .72),
    new Vector3(.92, .2, .28),
    new Vector3(2.08, .2, -.7),
    new Vector3(2.6, .2, 1.28),
  ], false, "catmullrom", .36), []);

  useFrame(({ clock }, delta) => {
    if (reducedMotion) {
      if (world.current) world.current.rotation.y = 0;
      if (clouds.current) clouds.current.position.x = 0;
      if (beacon.current) beacon.current.scale.setScalar(1);
      return;
    }
    const safeDelta = Math.min(delta, .05);
    if (world.current) world.current.rotation.y = MathUtils.damp(world.current.rotation.y, Math.sin(clock.elapsedTime * .13) * .025, 1.8, safeDelta);
    if (clouds.current) clouds.current.position.x = Math.sin(clock.elapsedTime * .18) * .28;
    if (beacon.current) beacon.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.1) * .08);
  });

  return (
    <>
      <color attach="background" args={[dinosaurValleyAvailable ? "#244d68" : "#183451"]} />
      <fog attach="fog" args={["#315f72", 10, 24]} />
      <CameraRig position={[0, 5.4, 7.9]} target={[0, .18, 0]} damping={5} />
      <ambientLight intensity={.72} color="#d9f7ff" />
      <directionalLight castShadow intensity={1.45} color="#ffe5a3" position={[-4, 8, 5]} />
      <pointLight color={dinosaurValleyAvailable ? "#fde047" : "#fb7185"} intensity={dinosaurValleyAvailable ? 8 : 4} distance={5} position={[2.6, 2.2, 1.2]} />
      <group ref={clouds} position={[0, 3.4, -2.8]}>
        {[[-3.1, 0, 0, .75], [-2.5, .08, .1, .52], [2.1, .2, -.4, .65], [2.7, .1, -.3, .46]].map(([x, y, z, scale], index) => (
          <mesh key={index} position={[x, y, z]} scale={[scale * 1.65, scale * .45, scale]}>
            <sphereGeometry args={[.55, 12, 8]} />
            <meshStandardMaterial color="#dff8ff" roughness={.98} transparent opacity={.66} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7.2, 48]} />
        <meshStandardMaterial color="#155e75" metalness={.12} roughness={.32} />
      </mesh>
      <group ref={world}>
        <mesh receiveShadow position={[0, -.17, 0]}>
          <cylinderGeometry args={[4.45, 4.1, .62, 16]} />
          <meshStandardMaterial color="#547b4b" roughness={.98} />
        </mesh>
        {[[-2.55, .03, -1.15, 1.2, "#406d50"], [-2.35, .04, 1.32, 1.3, "#4f7b3a"], [-.25, .04, .72, .9, "#647446"], [.26, .04, -1.66, 1.05, "#71664f"], [2.48, .04, -1.22, 1.05, "#4b7181"], [2.5, .04, 1.22, 1.28, "#61734d"]].map(([x, y, z, scale, color], index) => (
          <mesh key={index} receiveShadow position={[Number(x), Number(y), Number(z)]} scale={[Number(scale), .16, Number(scale)]}>
            <dodecahedronGeometry args={[.82, 0]} />
            <meshStandardMaterial color={String(color)} roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, .09, 0]}>
          <tubeGeometry args={[path, 72, .07, 7, false]} />
          <meshStandardMaterial color="#fef3c7" emissive="#92400e" emissiveIntensity={.3} roughness={.7} />
        </mesh>
        <mesh receiveShadow position={[.8, .05, .5]} rotation={[-Math.PI / 2, 0, -.38]} scale={[1, .32, 1]}>
          <planeGeometry args={[4.2, .7]} />
          <meshStandardMaterial color="#38a9b7" metalness={.1} roughness={.32} />
        </mesh>
        <RoboLab />
        <AnimalForest />
        <MonsterLab />
        <StoryCastle />
        <MemoryMuseum />
        <DinosaurGate available={dinosaurValleyAvailable} />
        <BridgeRoute available={dinosaurValleyAvailable} />
        <mesh ref={beacon} position={[0, .34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[.2, .31, 20]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </>
  );
}

export function LivingWorldAtlas({
  language,
  dinosaurValleyAvailable,
  open,
}: {
  language: Language;
  dinosaurValleyAvailable: boolean;
  open: (id: SectionId) => void;
}) {
  const quality = useMemo(() => readQualityProfile(), []);
  const [motionPaused, setMotionPaused] = useState(false);
  const motionReduced = quality.reducedMotion || motionPaused;
  return (
    <section
      className="world-atlas"
      data-valley-status={dinosaurValleyAvailable ? "open" : "locked"}
      data-world-motion={quality.reducedMotion ? "reduced" : motionPaused ? "paused" : "ambient"}
      aria-labelledby="world-atlas-title"
    >
      <header className="world-atlas__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="world-atlas-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
        <strong className={`world-atlas__route-status ${dinosaurValleyAvailable ? "is-open" : "is-locked"}`}>
          <span aria-hidden="true">{dinosaurValleyAvailable ? "✦" : "◆"}</span>
          {tr(dinosaurValleyAvailable ? copy.openRoute : copy.lockedRoute, language)}
        </strong>
      </header>
      <GameCanvas
        quality={quality}
        unavailableFallback={(
          <IllustratedWorldFallback
            alt={tr(copy.scene, language)}
            unavailableMessage={tr(copy.unavailable, language)}
            dinosaurValleyAvailable={dinosaurValleyAvailable}
          />
        )}
        labels={{
          scene: tr(copy.scene, language),
          loading: tr(copy.loading, language),
          ready: tr(copy.ready, language),
          contextLost: tr(copy.lost, language),
          contextRestored: tr(copy.restored, language),
          unavailable: tr(copy.unavailable, language),
          instructions: tr(copy.instructions, language),
        }}
        controls={(
          <button
            type="button"
            className="world-atlas__motion-control"
            aria-pressed={motionReduced}
            disabled={quality.reducedMotion}
            onClick={() => setMotionPaused((paused) => !paused)}
          >
            <span aria-hidden="true">{motionReduced ? "▶" : "Ⅱ"}</span>
            {tr(quality.reducedMotion ? copy.reducedMotion : motionPaused ? copy.resumeMotion : copy.pauseMotion, language)}
          </button>
        )}
      >
        <LivingWorldScene dinosaurValleyAvailable={dinosaurValleyAvailable} reducedMotion={motionReduced} />
      </GameCanvas>
      <nav className="world-atlas__landmarks" aria-label={tr(copy.landmarks, language)}>
        {WORLD_ATLAS_LANDMARKS.map((landmark) => {
          const section = WORLD_SECTIONS.find((candidate) => candidate.id === landmark.id);
          if (!section) return null;
          const locked = isWorldAtlasLandmarkLocked(landmark.id, dinosaurValleyAvailable);
          return (
            <button
              type="button"
              className={`world-atlas__landmark${locked ? " is-locked" : ""}`}
              style={{ "--landmark-accent": landmark.accent } as React.CSSProperties}
              key={landmark.id}
              disabled={locked}
              onClick={() => open(landmark.id)}
              aria-label={`${tr(copy.visit, language)} ${tr(section.name, language)}. ${locked ? tr(copy.lockedRoute, language) : tr(section.description, language)}`}
            >
              <span aria-hidden="true">{locked ? "🔒" : section.emoji}</span>
              <strong>{tr(section.name, language)}</strong>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
