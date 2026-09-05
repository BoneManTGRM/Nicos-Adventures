import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import report from "../assets/cutout-repair.provenance.json";
import { copyNativeCutout, loadPremiumCutout } from "./artCutout";
afterEach(() => vi.unstubAllGlobals());
describe("reviewed native-alpha artwork", () => {
  it.each(report.records)("pins the reviewed bytes for $path", record => {
    const bytes = readFileSync(resolve(process.cwd(), record.path.replace(/^web\//, "")));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(record.sha256);
    expect(record.changedProtectedPixels).toBe(0);
    expect(record.preservedInteriorPixels).toBeGreaterThan(1000);
    expect(bytes.subarray(8,12).toString()).toBe("WEBP");
  });
  it("copies native alpha without a color-key or a pixel readback", () => {
    const drawImage = vi.fn();
    const canvas = { width:0, height:0, getContext:() => ({ drawImage }) };
    vi.stubGlobal("document", { createElement:() => canvas });
    const image = { naturalWidth:2, naturalHeight:1 } as HTMLImageElement;
    expect(copyNativeCutout(image)).toBe(canvas);
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(1);
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(image,0,0);
  });
  it("fails explicitly if composition is unsupported", () => {
    vi.stubGlobal("document", { createElement:() => ({ getContext:() => null }) });
    expect(() => copyNativeCutout({ naturalWidth:2, naturalHeight:1 } as HTMLImageElement)).toThrow("could not be composed");
  });
  it("evicts rejected loads and shares successful source work", async () => {
    let attempts = 0;
    class FakeImage {
      naturalWidth=2; naturalHeight=1; onload?:() => void; onerror?:() => void;
      set src(_value:string) { const fail=++attempts===1; queueMicrotask(() => fail ? this.onerror?.() : this.onload?.()); }
    }
    const canvas={ getContext:() => ({ drawImage:vi.fn() }) };
    vi.stubGlobal("Image",FakeImage);
    vi.stubGlobal("document",{ createElement:() => canvas });
    await expect(loadPremiumCutout("retry-native-alpha-test")).rejects.toThrow();
    const retry=loadPremiumCutout("retry-native-alpha-test");
    expect(loadPremiumCutout("retry-native-alpha-test")).toBe(retry);
    await expect(retry).resolves.toBe(canvas);
    expect(attempts).toBe(2);
  });
});
