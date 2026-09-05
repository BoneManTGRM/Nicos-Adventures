import { useEffect, useRef } from "react";
import { drawContained, loadPremiumCutout } from "./artCutout";
export function PremiumCutout({ source, alt, className = "" }: { source:string; alt:string; className?:string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    if (canvasRef.current) canvasRef.current.dataset.artState = "loading";
    void loadPremiumCutout(source).then(image => {
      const canvas = canvasRef.current;
      if (!active || !canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      drawContained(context, image, canvas.width, canvas.height);
      canvas.dataset.artState = "ready";
    }).catch(() => {
      if (active && canvasRef.current) canvasRef.current.dataset.artState = "error";
    });
    return () => { active = false; };
  }, [source]);
  return <canvas ref={canvasRef} className={`premium-cutout ${className}`.trim()} width={640} height={960} role="img" aria-label={alt} />;
}
