import { describe, expect, it } from "vitest";
import { ROOM_DECORATIONS } from "./catalogs";
import { ROOM_DECORATION_VISUALS } from "./RobotHome";

describe("Robot Home visual decorations", () => {
  it("gives every selectable decoration its own room object", () => {
    expect(Object.keys(ROOM_DECORATION_VISUALS).sort()).toEqual([...ROOM_DECORATIONS].sort());
    expect(new Set(Object.values(ROOM_DECORATION_VISUALS).map((item) => item.className)).size).toBe(ROOM_DECORATIONS.length);
    expect(Object.values(ROOM_DECORATION_VISUALS).every((item) => item.icon.length > 0)).toBe(true);
  });
});
