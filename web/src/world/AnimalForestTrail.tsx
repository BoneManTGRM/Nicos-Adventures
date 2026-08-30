import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { CameraRig, GameCanvas, readQualityProfile } from "../game3d";
import { tr, type Localized } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Language } from "../types";
import { habitatTrail } from "./animalForestTrail";
import "./animal-forest-trail.css";

const copy = {
  eyebrow: { en: "Animal Forest · Private field expedition", "es-MX": "Bosque animal · Expedición de campo privada" },
  title: { en: "Choose a living habitat trail", "es-MX": "Elige un sendero de hábitat viviente" },
  body: {
    en: "Follow one local-first trail at a time. Every animal, fact, favorite, and discovery stays on this device.",
    "es-MX": "Sigue un sendero local a la vez. Cada animal, dato, favorito y descubrimiento permanece en este dispositivo.",
  },
  scene: { en: "Living Animal Forest habitat trail", "es-MX": "Sendero viviente de hábitats del Bosque animal" },
  loading: { en: "Growing the Animal Forest", "es-MX": "Haciendo crecer el Bosque animal" },
  ready: { en: "Animal Forest trail ready", "es-MX": "El sendero del Bosque animal está listo" },
  lost: { en: "The forest view paused. Habitat buttons still work.", "es-MX": "La vista del bosque se pausó. Los botones de hábitat siguen funcionando." },
  restored: { en: "The forest view is moving again.", "es-MX": "La vista del bosque está en movimiento otra vez." },
  unavailable: { en: "The illustrated forest is unavailable. Choose a habitat below.", "es-MX": "El bosque ilustrado no está disponible. Elige un hábitat abajo." },
  instructions: { en: "Choose a habitat below. No dragging or time limit.", "es-MX": "Elige un hábitat abajo. No necesitas arrastrar ni tienes límite de tiempo." },
  habitats: { en: "Habitat trails", "es-MX": "Senderos de hábitat" },
  progress: { en: "Field guide", "es-MX": "Guía de campo" },
  all: { en: "All trails", "es-MX": "Todos los senderos" },
} satisfies Record<string, Localized>;

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, .42, 0]}>
        <cylinderGeometry args={[.07, .11, .84, 7]} />
        <meshStandardMaterial color="#6b4427" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <coneGeometry args={[.5, 1.18, 8]} />
        <meshStandardMaterial color="#3f7b38" roughness={.96} />
      </mesh>
      <mesh castShadow position={[0, 1.48, 0]}>
        <coneGeometry args={[.34, .8, 8]} />
        <meshStandardMaterial color="#65a30d" roughness={.94} />
      </mesh>
    </group>
  );
}

function ForestScene({ habitat, reducedMotion }: { habitat: string; reducedMotion: boolean }) {
  const fireflies = useRef<Group>(null);
  const active = habitat === "All" ? null : habitatTrail(habitat);
  const lights = useMemo(() => Array.from({ length: 15 }, (_, index) => ({
    x: -2.8 + (index * 1.37) % 5.6,
    y: .45 + (index % 5) * .28,
    z: -1.7 + (index * .83) % 3.4,
  })), []);

  useFrame(({ clock }) => {
    if (!fireflies.current) return;
    fireflies.current.rotation.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * .17) * .14;
  });

  return (
    <>
      <color attach="background" args={[active?.sky ?? "#123f51"]} />
      <fog attach="fog" args={[active?.sky ?? "#123f51", 8, 18]} />
      <CameraRig position={[0, 3.6, 6.4]} target={[0, .55, 0]} damping={5} />
      <ambientLight intensity={.72} color="#d9fff2" />
      <directionalLight castShadow intensity={1.5} color="#ffe7a3" position={[-4, 7, 4]} />
      <pointLight color={active?.color ?? "#67e8f9"} intensity={7} distance={6} position={[0, 2.8, -.6]} />

      <mesh receiveShadow position={[0, -.18, 0]}>
        <cylinderGeometry args={[4.2, 3.8, .5, 20]} />
        <meshStandardMaterial color="#386641" roughness={.98} />
      </mesh>
      <mesh receiveShadow position={[0, .1, .2]} rotation={[-Math.PI / 2, 0, -.16]}>
        <planeGeometry args={[1.1, 7.2]} />
        <meshStandardMaterial color="#8b6f47" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[-1.8, .09, -.1]} rotation={[-Math.PI / 2, 0, .08]}>
        <planeGeometry args={[1.05, 5]} />
        <meshStandardMaterial color="#2ba6b7" roughness={.28} metalness={.08} />
      </mesh>

      {[
        [-3.2, .02, -1.65, 1.1], [-2.45, .02, -2.05, .78], [-1.42, .02, -2.2, .95],
        [1.45, .02, -2.18, .8], [2.45, .02, -1.95, 1.1], [3.22, .02, -1.42, .8],
        [-3.15, .02, 1.25, .85], [2.95, .02, 1.4, .9],
      ].map(([x, y, z, scale], index) => <Tree key={index} position={[x, y, z]} scale={scale} />)}

      <group ref={fireflies}>
        {lights.map((light, index) => (
          <mesh key={index} position={[light.x, light.y, light.z]}>
            <sphereGeometry args={[.035, 7, 7]} />
            <meshBasicMaterial color={index % 3 === 0 ? "#fde047" : active?.color ?? "#a7f3d0"} />
          </mesh>
        ))}
      </group>

      <group position={[.18, .13, -.5]}>
        <mesh castShadow position={[0, .35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[.46, .11, 10, 22, Math.PI]} />
          <meshStandardMaterial color={active?.color ?? "#fef3c7"} emissive={active?.color ?? "#a16207"} emissiveIntensity={.42} roughness={.72} />
        </mesh>
        <mesh position={[0, .3, .04]}>
          <ringGeometry args={[.16, .24, 18]} />
          <meshStandardMaterial color="#fef08a" emissive={active?.color ?? "#facc15"} emissiveIntensity={1.1} />
        </mesh>
      </group>
    </>
  );
}

export function AnimalForestTrail({
  language,
  habitat,
  habitats,
  discovered,
  total,
  select,
}: {
  language: Language;
  habitat: string;
  habitats: string[];
  discovered: number;
  total: number;
  select: (habitat: string) => void;
}) {
  const quality = useMemo(() => readQualityProfile(), []);
  return (
    <section className="animal-forest-trail" data-habitat={habitat} aria-labelledby="animal-forest-trail-title">
      <header className="animal-forest-trail__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="animal-forest-trail-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>
      <GameCanvas
        quality={quality}
        labels={{
          scene: tr(copy.scene, language),
          loading: tr(copy.loading, language),
          ready: tr(copy.ready, language),
          contextLost: tr(copy.lost, language),
          contextRestored: tr(copy.restored, language),
          unavailable: tr(copy.unavailable, language),
          instructions: tr(copy.instructions, language),
        }}
        controls={<strong className="animal-forest-trail__progress">{tr(copy.progress, language)} · {discovered}/{total}</strong>}
      >
        <ForestScene habitat={habitat} reducedMotion={quality.reducedMotion} />
      </GameCanvas>
      <nav className="animal-forest-trail__habitats" aria-label={tr(copy.habitats, language)}>
        {habitats.map((item) => {
          const trail = item === "All" ? null : habitatTrail(item);
          return (
            <button
              type="button"
              className="animal-forest-trail__habitat"
              data-habitat={item}
              aria-pressed={item === habitat}
              key={item}
              onClick={() => select(item)}
            >
              <span aria-hidden="true">{trail?.icon ?? "🧭"}</span>
              <strong>{item === "All" ? tr(copy.all, language) : optionLabel(item, language)}</strong>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
