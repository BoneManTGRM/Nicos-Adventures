import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Color, type Group, type Material, type Mesh, type Vector3Tuple } from "three";
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
}: {
  animation?: BoltBotAnimation;
  robot?: Pick<Robot, "color" | "secondary_color">;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number;
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
