import type { Robot } from "../types";

export type RobotAssemblyField = Exclude<
  keyof Robot,
  "id" | "name" | "job" | "level" | "xp"
>;

export type RobotAssemblyGroup = "finish" | "frame" | "systems" | "spirit";

export const ROBOT_ASSEMBLY_FIELDS: ReadonlyArray<{
  key: RobotAssemblyField;
  icon: string;
  group: RobotAssemblyGroup;
}> = [
  { key: "color", icon: "◉", group: "finish" },
  { key: "secondary_color", icon: "✦", group: "finish" },
  { key: "head", icon: "⏶", group: "frame" },
  { key: "eyes", icon: "◫", group: "frame" },
  { key: "body", icon: "⬡", group: "frame" },
  { key: "arms", icon: "⚒", group: "systems" },
  { key: "base", icon: "⌁", group: "systems" },
  { key: "backpack", icon: "⇧", group: "systems" },
  { key: "power", icon: "⚡", group: "systems" },
  { key: "personality", icon: "♥", group: "spirit" },
  { key: "mood", icon: "☀", group: "spirit" },
  { key: "voice", icon: "♫", group: "spirit" },
];

export function robotAssemblyField(key: RobotAssemblyField) {
  return ROBOT_ASSEMBLY_FIELDS.find((field) => field.key === key) ?? ROBOT_ASSEMBLY_FIELDS[0];
}
