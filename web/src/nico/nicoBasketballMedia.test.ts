// @ts-nocheck -- Vitest executes this integrity test in Node while the browser app's tsconfig intentionally omits Node ambient types.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { NICO_BASKETBALL_MEDIA } from "./nicoBasketballMedia";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readAsset = (assetPath: string) =>
  readFileSync(path.join(webRoot, "public", assetPath.replace(/^\//, "")), "utf8");
const decode = (paths: readonly string[]) =>
  Buffer.from(paths.map(readAsset).join(""), "base64");
const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

describe("Nico basketball spotlight media", () => {
  it("reconstructs the optimized fast-start MP4 exactly", () => {
    const video = decode(NICO_BASKETBALL_MEDIA.videoParts);
    expect(video.byteLength).toBe(NICO_BASKETBALL_MEDIA.videoBytes);
    expect(sha256(video)).toBe(NICO_BASKETBALL_MEDIA.videoSha256);
    expect(video.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(video.indexOf(Buffer.from("moov"))).toBeGreaterThan(0);
    expect(video.indexOf(Buffer.from("moov"))).toBeLessThan(video.indexOf(Buffer.from("mdat")));
  });

  it("reconstructs the local poster exactly", () => {
    const poster = decode(NICO_BASKETBALL_MEDIA.posterParts);
    expect(poster.byteLength).toBe(NICO_BASKETBALL_MEDIA.posterBytes);
    expect(sha256(poster)).toBe(NICO_BASKETBALL_MEDIA.posterSha256);
    expect([...poster.subarray(0, 2)]).toEqual([0xff, 0xd8]);
    expect([...poster.subarray(-2)]).toEqual([0xff, 0xd9]);
  });

  it("keeps every media request same-origin and versioned", () => {
    const paths = [
      ...NICO_BASKETBALL_MEDIA.videoParts,
      ...NICO_BASKETBALL_MEDIA.posterParts,
    ];
    expect(paths).toHaveLength(8);
    expect(new Set(paths).size).toBe(paths.length);
    for (const assetPath of paths) {
      expect(assetPath).toMatch(
        /^\/assets\/media\/nico-basketball-.+-v5\.part\d{2}\.b64$/,
      );
    }
  });
});
