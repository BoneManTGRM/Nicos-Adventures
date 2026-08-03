import { describe, expect, it } from "vitest";
import { resolvePoseIndex } from "./movieRenderer";
import { selectSupportedMimeType } from "./recordMovie";

describe("Showtime recording helpers", () => {
  it("chooses the first supported WebM format", () => {
    const fakeRecorder = {
      isTypeSupported: (mimeType: string) => mimeType === "video/webm;codecs=vp8" || mimeType === "video/webm",
    } as Pick<typeof MediaRecorder, "isTypeSupported">;
    expect(selectSupportedMimeType(fakeRecorder)).toBe("video/webm;codecs=vp8");
  });

  it("returns null when MediaRecorder support is unavailable", () => {
    expect(selectSupportedMimeType(undefined)).toBeNull();
  });

  it("maps elapsed time into the saved pose timeline", () => {
    expect(resolvePoseIndex(0, [1000, 1500, 500])).toEqual({ index: 0, progress: 0 });
    expect(resolvePoseIndex(1500, [1000, 1500, 500])).toEqual({ index: 1, progress: 1 / 3 });
    expect(resolvePoseIndex(2750, [1000, 1500, 500])).toEqual({ index: 2, progress: 0.5 });
  });
});
