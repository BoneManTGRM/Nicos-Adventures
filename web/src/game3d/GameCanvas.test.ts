import { describe, expect, it, vi } from "vitest";
import { canUseWebGL } from "./GameCanvas";

describe("GameCanvas WebGL capability", () => {
  it("accepts WebGL 2 and falls back to WebGL 1", () => {
    expect(canUseWebGL((kind) => kind === "webgl2" ? {} : null)).toBe(true);
    expect(canUseWebGL((kind) => kind === "webgl" ? {} : null)).toBe(true);
  });

  it("reports unavailable when contexts are missing or creation throws", () => {
    expect(canUseWebGL(() => null)).toBe(false);
    expect(canUseWebGL(vi.fn(() => { throw new Error("context unavailable"); }))).toBe(false);
  });
});
