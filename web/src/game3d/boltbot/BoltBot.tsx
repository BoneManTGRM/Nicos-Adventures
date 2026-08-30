import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Color, MathUtils, type Group, type Material, type Mesh, type Vector3Tuple } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import type { Robot } from "../../types";
import { ADVENTURE_ASSETS } from "../assets";
import { boltBotAppearanceFromRobot } from "./appearance";

export type BoltBotAnimation = "Idle" | "Drive" | "Scan" | "Think" | "Repair" | "Celebrate";

function recolorMaterial(material: Material, primary: string, accent: string): Material {
  const clone = material.clone();
  if (!("color" in clone) || !(clone.color instanceof Color)) return clone;
  if (clone.name === "BoltBot_Primary") clone.color.set(primary);
  if (clone.name === "BoltBot_Primary_Dark") clone.color.set(primary).multiplyScalar(0.55);
  if (clone.name === "BoltBot_Accent") clone.color.set(accent);
  return clone;
}

export function BoltBot({
  animation = "Idle",
  robot,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  playbackRate,
}: {
  animation?: BoltBotAnimation;
  robot?: Pick<Robot, "color" | "secondary_color">;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number;
  playbackRate?: RefObject<number>;
}) {
  const { scene, animations } = useGLTF(ADVENTURE_ASSETS["character.boltbot"]);
  const appearance = boltBotAppearanceFromRobot(robot);
  const clone = useMemo(() => {
    const instance = SkeletonUtils.clone(scene) as Group;
    instance.traverse((node) => {
      if (!("isMesh" in node) || !(node as Mesh).isMesh) return;
      const mesh = node as Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((item) => recolorMaterial(item, appearance.primary, appearance.accent))
        : recolorMaterial(mesh.material, appearance.primary, appearance.accent);
    });
    return instance;
  }, [appearance.accent, appearance.primary, scene]);
  const { actions } = useAnimations(animations, clone);
  const currentPlaybackRate = useRef(1);

  useFrame((_, delta) => {
    const action = actions[animation];
    if (!action) return;
    const target = MathUtils.clamp(playbackRate?.current ?? 1, 0.25, 2);
    currentPlaybackRate.current = MathUtils.damp(currentPlaybackRate.current, target, 8, Math.min(delta, 0.05));
    action.timeScale = currentPlaybackRate.current;
  });

  useEffect(() => {
    const action = actions[animation];
    action?.reset().fadeIn(0.2).play();
    return () => {
      action?.fadeOut(0.16);
    };
  }, [actions, animation]);

  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}

useGLTF.preload(ADVENTURE_ASSETS["character.boltbot"]);
