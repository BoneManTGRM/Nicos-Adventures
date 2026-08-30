import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { CatmullRomCurve3, MathUtils, Vector3, type Group, type Mesh } from "three";
import { CameraRig, GameCanvas, readQualityProfile } from "../game3d";
import { tr, type Localized } from "../i18n/core";
import type { Language, SectionId } from "../types";
import { WORLD_SECTIONS } from "./catalogs";
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

export function IllustratedWorldFallback({
  language,
  dinosaurValleyAvailable,
}: {
  language: Language;
  dinosaurValleyAvailable: boolean;
}) {
  return (
    <div className="world-atlas-fallback" role="alert" data-valley-status={dinosaurValleyAvailable ? "open" : "locked"}>
      <svg viewBox="0 0 1000 560" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="atlas-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ec5d7" />
            <stop offset=".42" stopColor="#31698a" />
            <stop offset="1" stopColor="#102944" />
          </linearGradient>
          <radialGradient id="atlas-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fffbd2" stopOpacity=".98" />
            <stop offset=".34" stopColor="#fde68a" stopOpacity=".72" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="atlas-water" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#49b6c2" />
            <stop offset=".5" stopColor="#227b91" />
            <stop offset="1" stopColor="#123e62" />
          </linearGradient>
          <linearGradient id="atlas-land" x1=".12" y1="0" x2=".8" y2="1">
            <stop offset="0" stopColor="#a8c979" />
            <stop offset=".48" stopColor="#658c55" />
            <stop offset="1" stopColor="#385844" />
          </linearGradient>
          <linearGradient id="atlas-cliff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b58a" />
            <stop offset="1" stopColor="#6e5a48" />
          </linearGradient>
          <linearGradient id="atlas-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d9fbff" />
            <stop offset=".35" stopColor="#50d5df" />
            <stop offset="1" stopColor="#176079" />
          </linearGradient>
          <linearGradient id="atlas-crystal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5d0fe" />
            <stop offset=".42" stopColor="#a855f7" />
            <stop offset="1" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="atlas-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff7bc" />
            <stop offset=".42" stopColor="#facc15" />
            <stop offset="1" stopColor="#a16207" />
          </linearGradient>
          <filter id="atlas-soft-shadow" x="-30%" y="-30%" width="170%" height="190%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#02101c" floodOpacity=".55" />
          </filter>
          <filter id="atlas-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1000" height="560" fill="url(#atlas-sky)" />
        <circle cx="818" cy="97" r="108" fill="url(#atlas-sun)" />
        <path d="M0 248Q100 168 198 236T393 210T575 234T760 192T1000 234V362H0Z" fill="#244c5c" opacity=".72" />
        <path d="M0 281Q104 210 221 271T442 250T655 263T856 223T1000 255V363H0Z" fill="#173d4f" opacity=".9" />
        <g className="world-atlas-fallback__clouds" fill="#f0fbff" opacity=".72">
          <path d="M82 105c20-29 60-24 72 7 25-17 62 0 62 31H52c0-22 13-36 30-38Z" />
          <path d="M662 142c17-24 50-21 61 5 20-13 51 2 51 27H638c0-17 10-29 24-32Z" />
        </g>

        <path d="M0 332Q156 274 318 310T625 298T1000 326V560H0Z" fill="url(#atlas-water)" />
        <path d="M90 378Q151 277 283 246Q433 194 578 232Q745 258 899 367Q839 495 680 520Q503 545 327 514Q170 493 90 378Z" fill="url(#atlas-cliff)" opacity=".94" filter="url(#atlas-soft-shadow)" />
        <path d="M100 354Q165 259 289 231Q439 183 578 221Q741 244 888 346Q824 454 679 480Q506 511 341 484Q187 467 100 354Z" fill="url(#atlas-land)" stroke="#d9e3b2" strokeOpacity=".36" strokeWidth="4" />
        <path d="M128 361Q225 398 338 366Q453 329 564 354Q682 381 844 338" fill="none" stroke="#d9efe7" strokeOpacity=".52" strokeWidth="18" strokeLinecap="round" />
        <path d="M128 361Q225 398 338 366Q453 329 564 354Q682 381 844 338" fill="none" stroke="#50b8c9" strokeWidth="12" strokeLinecap="round" />
        <path d="M184 312Q318 262 449 303Q592 345 770 288" fill="none" stroke="#fff1b8" strokeOpacity=".82" strokeWidth="8" strokeDasharray="4 13" strokeLinecap="round" />

        <g className="world-atlas-fallback__landmark world-atlas-fallback__robo-lab" filter="url(#atlas-soft-shadow)" transform="translate(166 255)">
          <ellipse cx="0" cy="74" rx="66" ry="18" fill="#112b34" opacity=".38" />
          <path d="M-42 63V9Q0-25 42 9v54Z" fill="#14687b" stroke="#e0fbff" strokeOpacity=".34" strokeWidth="3" />
          <path d="M-37 10Q0-25 37 10Z" fill="url(#atlas-glass)" />
          <path d="M0-22v-30" stroke="#dff8ff" strokeWidth="6" strokeLinecap="round" />
          <path d="m0-61 10 15H-10Z" fill="url(#atlas-gold)" filter="url(#atlas-glow)" />
          <rect x="-16" y="37" width="32" height="28" rx="9" fill="#062b3b" />
          <circle cx="-27" cy="23" r="5" fill="#a5f3fc" /><circle cx="27" cy="23" r="5" fill="#a5f3fc" />
        </g>

        <g className="world-atlas-fallback__landmark world-atlas-fallback__forest" filter="url(#atlas-soft-shadow)" transform="translate(302 376)">
          <ellipse cx="0" cy="51" rx="79" ry="19" fill="#183426" opacity=".46" />
          {[-45, -15, 18, 49].map((x, index) => <g key={x} transform={`translate(${x} ${index % 2 ? 4 : 13})`}><path d="M0 43V5" stroke="#684a31" strokeWidth="9" strokeLinecap="round" /><path d="M0-35-29 15h17l-25 34h74L12 15h17Z" fill={index % 2 ? "#3f7a48" : "#579554"} stroke="#c1dfa2" strokeOpacity=".23" strokeWidth="3" /></g>)}
          <circle cx="-64" cy="39" r="8" fill="#f8d477" /><circle cx="62" cy="32" r="6" fill="#f3a8bc" />
        </g>

        <g className="world-atlas-fallback__landmark world-atlas-fallback__monster-lab" filter="url(#atlas-soft-shadow)" transform="translate(458 333)">
          <ellipse cx="0" cy="57" rx="59" ry="16" fill="#24133b" opacity=".46" />
          <path d="M0-54 49 0 27 56h-54L-49 0Z" fill="url(#atlas-crystal)" stroke="#f5d0fe" strokeOpacity=".52" strokeWidth="4" />
          <path d="M0-42V44M-38 0l38-42L38 0 0 44Z" fill="none" stroke="#fff" strokeOpacity=".31" strokeWidth="4" />
          <circle cx="0" cy="17" r="13" fill="#e9d5ff" filter="url(#atlas-glow)" />
        </g>

        <g className="world-atlas-fallback__landmark world-atlas-fallback__castle" filter="url(#atlas-soft-shadow)" transform="translate(490 209)">
          <ellipse cx="0" cy="76" rx="78" ry="17" fill="#35243a" opacity=".33" />
          <rect x="-50" y="12" width="100" height="64" rx="8" fill="#f1b5b1" />
          {[-54, 54].map((x) => <g key={x}><rect x={x-18} y="-5" width="36" height="81" rx="8" fill="#f9d5cb" /><path d={`M${x-25}-5 ${x} -43 ${x+25}-5Z`} fill="#7041a3" /><circle cx={x} cy="27" r="8" fill="#54306f" /></g>)}
          <path d="M-11 76V45Q0 32 11 45v31Z" fill="#643d6c" />
          <path d="M0-5v-27l24 9-24 9" fill="#facc15" />
        </g>

        <g className="world-atlas-fallback__landmark world-atlas-fallback__museum" filter="url(#atlas-soft-shadow)" transform="translate(685 270)">
          <ellipse cx="0" cy="61" rx="68" ry="17" fill="#16303b" opacity=".4" />
          <path d="M-56 16Q0-28 56 16v43H-56Z" fill="url(#atlas-glass)" stroke="#dff8ff" strokeOpacity=".42" strokeWidth="4" />
          <path d="M-67 16 0-22l67 38Z" fill="#d8edf0" />
          {[-38, -13, 13, 38].map((x) => <path key={x} d={`M${x} 22v35`} stroke="#edf8f6" strokeWidth="8" />)}
          <path d="M-66 59H66" stroke="#abc8c7" strokeWidth="10" strokeLinecap="round" />
        </g>

        <g className="world-atlas-fallback__landmark world-atlas-fallback__dinosaur-gate" filter="url(#atlas-soft-shadow)" transform="translate(816 377)">
          <ellipse cx="0" cy="54" rx="66" ry="18" fill="#233124" opacity=".48" />
          <path d="M-48 51V-5M48 51V-5" stroke="#dbc9a5" strokeWidth="17" strokeLinecap="round" />
          <path d="M-48-3Q0-59 48-3" fill="none" stroke="#dbc9a5" strokeWidth="17" strokeLinecap="round" />
          <path d="M-38-4Q0-42 38-4" fill="none" stroke={dinosaurValleyAvailable ? "#f9d75e" : "#7a8890"} strokeWidth="7" />
          <path d="m0 0 15 22L0 38l-15-16Z" fill={dinosaurValleyAvailable ? "url(#atlas-gold)" : "#8b6672"} filter="url(#atlas-glow)" />
        </g>

        <g className={`world-atlas-fallback__bridge ${dinosaurValleyAvailable ? "is-open" : "is-locked"}`} filter="url(#atlas-soft-shadow)">
          <path d="M565 385Q655 420 748 380" fill="none" stroke="#453826" strokeWidth="13" strokeLinecap="round" opacity=".72" />
          {(dinosaurValleyAvailable ? [0, 1, 2, 3, 4, 5] : [0, 1, 4, 5]).map((index) => <rect key={index} x={570 + index * 30} y={382 + Math.abs(2.5-index) * 7} width="25" height="12" rx="4" fill={dinosaurValleyAvailable ? "url(#atlas-gold)" : "#87919a"} transform={`rotate(${index < 3 ? 9 : -9} ${582 + index * 30} ${389 + Math.abs(2.5-index) * 7})`} />)}
        </g>

        <g className="world-atlas-fallback__foreground" opacity=".92">
          <path d="M0 560V432q40 18 67 128Zm1000 0V418q-47 22-79 142Z" fill="#112f32" />
          <path d="M0 533q38-52 72 27m928-42q-47-38-84 42" fill="none" stroke="#3a6d4e" strokeWidth="22" strokeLinecap="round" />
        </g>
      </svg>
      <p>{tr(copy.unavailable, language)}</p>
    </div>
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
        unavailableFallback={<IllustratedWorldFallback language={language} dinosaurValleyAvailable={dinosaurValleyAvailable} />}
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
