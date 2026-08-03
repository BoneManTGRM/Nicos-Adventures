import type { CSSProperties } from "react";

export type NicoPose = "avatar" | "guide" | "explorer" | "reading" | "celebrate";

type NicoCharacterProps = {
  pose?: NicoPose;
  className?: string;
  title?: string;
  decorative?: boolean;
  style?: CSSProperties;
};

type Crop = { x: number; y: number; width: number; height: number };

const SHEET_WIDTH = 1122;
const SHEET_HEIGHT = 1402;
const SHEET_SRC = "/characters/nico/nico-approved-character-sheet.webp";

const crops: Record<NicoPose, Crop> = {
  avatar: { x: 210, y: 95, width: 360, height: 350 },
  guide: { x: 150, y: 70, width: 470, height: 1280 },
  explorer: { x: 665, y: 15, width: 385, height: 455 },
  celebrate: { x: 650, y: 475, width: 420, height: 455 },
  reading: { x: 640, y: 920, width: 410, height: 465 },
};

export function NicoCharacter({
  pose = "guide",
  className = "",
  title = "Nico",
  decorative = false,
  style,
}: NicoCharacterProps) {
  const crop = crops[pose];
  const imageStyle: CSSProperties = {
    width: `${(SHEET_WIDTH / crop.width) * 100}%`,
    height: `${(SHEET_HEIGHT / crop.height) * 100}%`,
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
  };

  return (
    <span
      className={`nico-character-svg nico-character-crop nico-character-svg--${pose} ${className}`.trim()}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      style={{ aspectRatio: `${crop.width} / ${crop.height}`, ...style }}
    >
      <img
        className="nico-character-crop__sheet"
        src={SHEET_SRC}
        alt=""
        aria-hidden="true"
        draggable="false"
        style={imageStyle}
      />
    </span>
  );
}
