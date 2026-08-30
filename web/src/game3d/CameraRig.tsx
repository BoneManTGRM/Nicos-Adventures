import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3, type Vector3Tuple } from "three";

export function CameraRig({
  position = [0, 2.1, 5.5],
  target = [0, 1, 0],
  damping = 7,
}: {
  position?: Vector3Tuple;
  target?: Vector3Tuple;
  damping?: number;
}) {
  const desiredPosition = useMemo(() => new Vector3(...position), [position]);
  const desiredTarget = useMemo(() => new Vector3(...target), [target]);

  useFrame(({ camera }, delta) => {
    const alpha = 1 - Math.exp(-damping * Math.min(delta, 0.05));
    camera.position.lerp(desiredPosition, alpha);
    camera.lookAt(desiredTarget);
  });

  return null;
}
