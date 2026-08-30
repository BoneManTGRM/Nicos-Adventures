import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { Group, Vector3Tuple } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { ADVENTURE_ASSETS } from "../assets";

export type NicoAnimation = "Idle" | "Walk" | "Run" | "Celebrate";

export function CanonicalNico({
  animation = "Idle",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: {
  animation?: NicoAnimation;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: number;
}) {
  const { scene, animations } = useGLTF(ADVENTURE_ASSETS["character.nico"]);
  const clone = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene]);
  const { actions } = useAnimations(animations, clone);

  useEffect(() => {
    clone.traverse((node) => {
      if ("castShadow" in node) node.castShadow = true;
      if ("receiveShadow" in node) node.receiveShadow = true;
    });
  }, [clone]);

  useEffect(() => {
    const action = actions[animation];
    action?.reset().fadeIn(0.22).play();
    return () => {
      action?.fadeOut(0.18);
    };
  }, [actions, animation]);

  return <primitive object={clone} position={position} rotation={rotation} scale={scale} />;
}

useGLTF.preload(ADVENTURE_ASSETS["character.nico"]);
