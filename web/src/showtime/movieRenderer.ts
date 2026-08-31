import type {
  MovieCharacterKind,
  MoviePose,
  NicoProfessionId,
  Robot,
  MonsterRecord,
  PetRecord,
  AnimalRecord,
} from "../types";
import { drawWildlifeCell } from "../world/wildlifeAtlas";

export type RenderableMovieCharacter = {
  key: string;
  kind: MovieCharacterKind;
  id: string;
  name: string;
  robot?: Robot;
  monster?: MonsterRecord;
  pet?: PetRecord;
  animal?: AnimalRecord;
};

export type DrawMovieFrameOptions = {
  canvas: HTMLCanvasElement;
  sceneId: string;
  title: string;
  caption: string;
  characters: RenderableMovieCharacter[];
  pose: MoviePose;
  poseProgress: number;
  nicoArt: HTMLImageElement | null;
  nicoProfession: NicoProfessionId;
  nicoAccent: string;
  wildlifeArt: HTMLCanvasElement | null;
};

const robotColors: Record<string, string> = {
  "Electric Blue": "#38bdf8",
  "Crimson Red": "#ef4444",
  "Emerald Green": "#10b981",
  "Royal Purple": "#8b5cf6",
  "Solar Orange": "#fb923c",
  "Pearl White": "#f8fafc",
  "Midnight Black": "#111827",
  "Rose Gold": "#fb7185",
  "Arctic Cyan": "#22d3ee",
  "Volcanic Red": "#dc2626",
  "Galaxy Violet": "#7c3aed",
  "Jungle Green": "#16a34a",
};

const monsterColors: Record<string, string> = {
  Aqua: "#22d3ee",
  Purple: "#8b5cf6",
  Lime: "#84cc16",
  Orange: "#fb923c",
  Pink: "#f472b6",
  Blue: "#3b82f6",
  Red: "#ef4444",
  Gold: "#facc15",
  Midnight: "#172554",
  Pearl: "#e2e8f0",
  Emerald: "#10b981",
  Crimson: "#be123c",
};

const petIcons: Record<string, string> = {
  "Robot Dog": "🐕",
  "Robot Cat": "🐈",
  "Mini Dinosaur": "🦖",
  "Tiny Dragon": "🐉",
  "Penguin Bot": "🐧",
  "Fox Bot": "🦊",
  "Owl Scout": "🦉",
  "Space Orb": "🔮",
};

export function resolvePoseIndex(elapsedMs: number, durations: number[]): { index: number; progress: number } {
  const safeDurations = durations.length ? durations : [1000];
  const total = safeDurations.reduce((sum, value) => sum + Math.max(1, value), 0);
  const time = Math.max(0, elapsedMs) % total;
  let cursor = 0;
  for (let index = 0; index < safeDurations.length; index += 1) {
    const duration = Math.max(1, safeDurations[index]);
    if (time <= cursor + duration || index === safeDurations.length - 1) {
      return { index, progress: Math.max(0, Math.min(1, (time - cursor) / duration)) };
    }
    cursor += duration;
  }
  return { index: 0, progress: 0 };
}

function drawScene(ctx: CanvasRenderingContext2D, sceneId: string, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (sceneId === "robot-home") {
    gradient.addColorStop(0, "#0c4a6e");
    gradient.addColorStop(0.48, "#1e3a8a");
    gradient.addColorStop(1, "#5b3a22");
  } else if (sceneId === "jungle") {
    gradient.addColorStop(0, "#38bdf8");
    gradient.addColorStop(0.42, "#15803d");
    gradient.addColorStop(1, "#713f12");
  } else if (sceneId === "space") {
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#312e81");
  } else if (sceneId === "dinosaur-valley") {
    gradient.addColorStop(0, "#7dd3fc");
    gradient.addColorStop(0.45, "#65a30d");
    gradient.addColorStop(1, "#854d0e");
  } else if (sceneId === "castle") {
    gradient.addColorStop(0, "#312e81");
    gradient.addColorStop(0.6, "#7c2d12");
    gradient.addColorStop(1, "#f59e0b");
  } else {
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(0.55, "#1d4ed8");
    gradient.addColorStop(1, "#7c3aed");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = "#e0f2fe";
  for (let index = 0; index < 26; index += 1) {
    const x = (index * 173) % width;
    const y = (index * 97) % Math.round(height * 0.65);
    ctx.beginPath();
    ctx.arc(x, y, index % 3 === 0 ? 3 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(2,6,23,.28)";
  ctx.fillRect(0, height * 0.76, width, height * 0.24);
}

function poseTransform(pose: MoviePose, progress: number, index: number) {
  const wave = Math.sin(progress * Math.PI * 4);
  if (pose === "celebrate") return { y: -Math.abs(Math.sin(progress * Math.PI * 2)) * 34, rotation: wave * 0.05, scale: 1 + Math.sin(progress * Math.PI) * 0.06 };
  if (pose === "launch") return { y: -progress * 130, rotation: 0, scale: 1 - progress * 0.08 };
  if (pose === "dance") return { y: -Math.abs(wave) * 12, rotation: wave * 0.16, scale: 1 };
  if (pose === "spin") return { y: 0, rotation: progress * Math.PI * 2, scale: 1 };
  if (pose === "bounce") return { y: -Math.abs(Math.sin(progress * Math.PI * 3)) * 28, rotation: wave * 0.04, scale: 1 };
  if (pose === "roar") return { y: 0, rotation: wave * 0.025, scale: 1 + Math.sin(progress * Math.PI) * 0.12 };
  if (pose === "sleep") return { y: 16, rotation: -0.12, scale: 0.96 };
  if (pose === "wave") return { y: -Math.abs(wave) * 5, rotation: (index % 2 ? -1 : 1) * wave * 0.04, scale: 1 };
  return { y: Math.sin((progress + index * 0.2) * Math.PI * 2) * 4, rotation: 0, scale: 1 };
}

function drawName(ctx: CanvasRenderingContext2D, name: string, x: number, y: number) {
  ctx.save();
  ctx.font = "700 23px system-ui, sans-serif";
  ctx.textAlign = "center";
  const width = Math.min(210, ctx.measureText(name).width + 30);
  ctx.fillStyle = "rgba(2,6,23,.76)";
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - 27, width, 36, 18);
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(name.slice(0, 24), x, y - 2);
  ctx.restore();
}

function drawRobot(ctx: CanvasRenderingContext2D, robot: Robot | undefined, x: number, y: number, size: number) {
  const primary = robotColors[robot?.color ?? "Electric Blue"] ?? "#38bdf8";
  const secondary = robotColors[robot?.secondary_color ?? "Solar Orange"] ?? "#facc15";
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(4, size * 0.035);
  ctx.strokeStyle = "#0f172a";

  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.roundRect(-size * 0.26, -size * 0.44, size * 0.52, size * 0.45, size * 0.09);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#07142d";
  ctx.beginPath();
  ctx.roundRect(-size * 0.18, -size * 0.35, size * 0.36, size * 0.14, size * 0.05);
  ctx.fill();
  ctx.strokeStyle = "#67e8f9";
  ctx.stroke();
  ctx.fillStyle = "#67e8f9";
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.28, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.28, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f172a";
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.47);
  ctx.lineTo(-size * 0.07, -size * 0.64);
  ctx.lineTo(0, -size * 0.45);
  ctx.lineTo(size * 0.07, -size * 0.64);
  ctx.lineTo(size * 0.2, -size * 0.47);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.roundRect(-size * 0.3, -size * 0.02, size * 0.6, size * 0.55, size * 0.1);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(0, size * 0.18, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = secondary;
  ctx.stroke();

  ctx.strokeStyle = primary;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.27, size * 0.08);
  ctx.lineTo(-size * 0.48, size * 0.32);
  ctx.moveTo(size * 0.27, size * 0.08);
  ctx.lineTo(size * 0.48, size * 0.32);
  ctx.moveTo(-size * 0.13, size * 0.48);
  ctx.lineTo(-size * 0.19, size * 0.73);
  ctx.moveTo(size * 0.13, size * 0.48);
  ctx.lineTo(size * 0.19, size * 0.73);
  ctx.stroke();
  ctx.restore();
}

function drawMonster(ctx: CanvasRenderingContext2D, monster: MonsterRecord | undefined, x: number, y: number, size: number) {
  const color = monsterColors[monster?.color ?? "Aqua"] ?? "#22d3ee";
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(4, size * 0.035);
  ctx.strokeStyle = "#020617";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.39, size * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const eyes = monster?.eyes.includes("Three") ? 3 : monster?.eyes.includes("One") ? 1 : 2;
  for (let index = 0; index < eyes; index += 1) {
    const offset = eyes === 1 ? 0 : (index - (eyes - 1) / 2) * size * 0.2;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(offset, -size * 0.12, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(offset, -size * 0.12, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = size * 0.035;
  ctx.beginPath();
  ctx.arc(0, size * 0.13, size * 0.16, 0.1, Math.PI - 0.1);
  ctx.stroke();
  if (monster && !monster.horns.toLowerCase().includes("no ")) {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(-size * 0.24, -size * 0.42);
    ctx.lineTo(-size * 0.12, -size * 0.72);
    ctx.lineTo(-size * 0.02, -size * 0.43);
    ctx.moveTo(size * 0.24, -size * 0.42);
    ctx.lineTo(size * 0.12, -size * 0.72);
    ctx.lineTo(size * 0.02, -size * 0.43);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawPet(ctx: CanvasRenderingContext2D, pet: PetRecord | undefined, x: number, y: number, size: number) {
  const icon = petIcons[pet?.species ?? "Robot Dog"] ?? "🐾";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(size * 0.82)}px Apple Color Emoji, Segoe UI Emoji, sans-serif`;
  ctx.fillText(icon, x, y);
  ctx.restore();
}

function drawNico(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  _profession: NicoProfessionId,
  accent: string,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  if (image?.complete && image.naturalWidth > 0) {
    const targetHeight = size * 1.42;
    const targetWidth = targetHeight * (image.naturalWidth / image.naturalHeight);
    ctx.drawImage(image, x - targetWidth / 2, y - targetHeight, targetWidth, targetHeight);
  } else {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `800 ${Math.round(size * 0.4)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", x, y);
  }

  ctx.restore();
}

export function drawMovieFrame({
  canvas,
  sceneId,
  title,
  caption,
  characters,
  pose,
  poseProgress,
  nicoArt,
  nicoProfession,
  nicoAccent,
  wildlifeArt,
}: DrawMovieFrameOptions): void {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas drawing is unavailable.");
  const { width, height } = canvas;
  drawScene(context, sceneId, width, height);

  context.save();
  context.fillStyle = "rgba(2,6,23,.72)";
  context.beginPath();
  context.roundRect(34, 26, width - 68, 70, 24);
  context.fill();
  context.fillStyle = "#f8fafc";
  context.font = "800 36px system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(title.slice(0, 48), width / 2, 72);
  context.restore();

  const count = Math.max(1, characters.length);
  const spacing = width / (count + 1);
  const size = count === 1 ? 225 : count === 2 ? 205 : 170;
  const floorY = height * 0.75;
  characters.forEach((character, index) => {
    const x = spacing * (index + 1);
    const transform = poseTransform(pose, poseProgress, index);
    context.save();
    context.translate(x, floorY + transform.y);
    context.rotate(transform.rotation);
    context.scale(transform.scale, transform.scale);
    context.translate(-x, -floorY);

    context.fillStyle = "rgba(2,6,23,.32)";
    context.beginPath();
    context.ellipse(x, floorY + 5, size * 0.45, size * 0.1, 0, 0, Math.PI * 2);
    context.fill();

    if (character.kind === "nico") drawNico(context, nicoArt, nicoProfession, nicoAccent, x, floorY, size);
    else if (character.kind === "robot") drawRobot(context, character.robot, x, floorY - size * 0.73, size);
    else if (character.kind === "monster") drawMonster(context, character.monster, x, floorY - size * 0.57, size);
    else if (character.kind === "animal" && character.animal && wildlifeArt) drawWildlifeCell(context, wildlifeArt, character.animal.id, x - size * 0.68, floorY - size * 1.36, size * 1.36);
    else drawPet(context, character.pet, x, floorY - size * 0.41, size);
    context.restore();
    drawName(context, character.name, x, height * 0.82);
  });

  if (caption.trim()) {
    context.save();
    context.fillStyle = "rgba(2,6,23,.82)";
    context.beginPath();
    context.roundRect(50, height - 78, width - 100, 54, 20);
    context.fill();
    context.fillStyle = "#fff7ed";
    context.font = "700 25px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(caption.trim().slice(0, 120), width / 2, height - 43);
    context.restore();
  }
}
