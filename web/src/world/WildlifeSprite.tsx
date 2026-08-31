import { useEffect, useRef } from "react";
import { drawWildlifeCell, loadPremiumWildlifeAtlas } from "./wildlifeAtlas";

export function WildlifeSprite({
  animalId,
  alt,
  className = "",
}: {
  animalId: string;
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;
    void loadPremiumWildlifeAtlas().then((atlas) => {
      const canvas = canvasRef.current;
      if (!active || !canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawWildlifeCell(context, atlas, animalId, 0, 0, canvas.width);
    });
    return () => {
      active = false;
    };
  }, [animalId]);

  return (
    <canvas
      ref={canvasRef}
      className={`wildlife-sprite ${className}`.trim()}
      width={320}
      height={320}
      role="img"
      aria-label={alt}
      data-animal-id={animalId}
    />
  );
}
