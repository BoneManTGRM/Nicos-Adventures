import { describe, expect, it } from "vitest";
import { boltBotColorSwatch } from "../game3d/boltbot/appearance";
import { ROBOT_OPTIONS } from "./catalogs";
import { ROBOT_ASSEMBLY_FIELDS, robotAssemblyField } from "./robotAssemblyBay";

describe("Robo Lab visual assembly contract", () => {
  it("keeps every schema-v4 robot option field available", () => {
    expect(ROBOT_ASSEMBLY_FIELDS.map((field) => field.key)).toEqual(Object.keys(ROBOT_OPTIONS));
    expect(new Set(ROBOT_ASSEMBLY_FIELDS.map((field) => field.key)).size).toBe(ROBOT_ASSEMBLY_FIELDS.length);
  });

  it("routes known fields to a stable themed component group", () => {
    expect(robotAssemblyField("color")).toMatchObject({ icon: "◉", group: "finish" });
    expect(robotAssemblyField("arms")).toMatchObject({ icon: "⚒", group: "systems" });
    expect(robotAssemblyField("personality")).toMatchObject({ icon: "♥", group: "spirit" });
  });

  it("gives every catalog finish a distinct visible swatch", () => {
    const primary = ROBOT_OPTIONS.color.map((value) => boltBotColorSwatch(value, "primary"));
    const accent = ROBOT_OPTIONS.secondary_color.map((value) => boltBotColorSwatch(value, "accent"));
    expect(new Set(primary).size).toBe(ROBOT_OPTIONS.color.length);
    expect(new Set(accent).size).toBe(ROBOT_OPTIONS.secondary_color.length);
    expect([...primary, ...accent].every((value) => /^#[0-9a-f]{6}$/i.test(value))).toBe(true);
  });
});
