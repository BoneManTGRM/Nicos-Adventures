import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { syntheticCatalog } from "../../test-fixtures/store";
import { compileStore } from "../../scripts/store-catalog";
const roots: string[] = [];
// A 2×2 synthetic solid-color bitmap: never an actual product photo.
const bitmap = Buffer.from("UklGRh4AAABXRUJQVlA4TBEAAAAvAUAAAAdQ5NLWvP+BiOh/AAA=", "base64");
async function fixture(draft = false, image = bitmap) {
  const root = await mkdtemp(path.join(tmpdir(), "nico-store-test-")); roots.push(root);
  await mkdir(path.join(root, "store/images"), { recursive: true });
  const raw = syntheticCatalog(); raw.products[0].photos[0].width = 2; raw.products[0].photos[0].height = 2;
  if (draft) raw.products[0].publication = "draft";
  Object.assign(raw, { privateNote: "DO_NOT_EMIT_PRIVATE_SENTINEL" });
  await writeFile(path.join(root, "store/catalog.json"), JSON.stringify(raw));
  if (!draft) await writeFile(path.join(root, "store/images/test-only.webp"), image);
  return { root, raw };
}
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))); });
describe("build-only public catalog compiler", () => {
  it("hashes only approved images and projects no extra fields", async () => {
    const { root } = await fixture(); const { catalog, images } = await compileStore(root);
    expect(catalog.products).toHaveLength(1); expect(images.size).toBe(1);
    expect(catalog.products[0].photos[0].src).toMatch(/^\/store-images\/[a-f0-9]{24}\.webp$/);
    expect(JSON.stringify(catalog)).not.toContain("PRIVATE_SENTINEL");
  });
  it("never even reads a draft photo and never emits orphaned assets", async () => {
    const { root } = await fixture(true); await writeFile(path.join(root, "store/images/private-draft.webp"), "PRIVATE PHOTO");
    const { catalog, images } = await compileStore(root);
    expect(catalog.products).toEqual([]); expect(images.size).toBe(0);
  });
  it("fails a missing approved photo rather than substituting an image", async () => {
    const { root } = await fixture(); await rm(path.join(root, "store/images/test-only.webp"));
    await expect(compileStore(root)).rejects.toThrow();
  });
  it("rejects mislabeled dimensions", async () => {
    const { root, raw } = await fixture(); raw.products[0].photos[0].width = 640;
    await writeFile(path.join(root, "store/catalog.json"), JSON.stringify(raw));
    await expect(compileStore(root)).rejects.toThrow(/dimension/i);
  });
  it.each(["EXIF", "XMP ", "ANIM", "ICCP", "UNKN"])("rejects metadata or unsupported chunk %s", async chunk => {
    const header = Buffer.alloc(8); header.write(chunk, 0, "ascii"); header.writeUInt32LE(2, 4);
    const image = Buffer.concat([bitmap, header, Buffer.from("XX")]); image.writeUInt32LE(image.length - 8, 4);
    const { root } = await fixture(false, image);
    await expect(compileStore(root)).rejects.toThrow();
  });
  it("rejects non-WebP, trailing data, oversize data and outside-directory symlinks", async () => {
    for (const image of [Buffer.from("not a photo"), Buffer.concat([bitmap, Buffer.from("GPS")]), Buffer.alloc(2_000_001)]) {
      const { root } = await fixture(false, image); await expect(compileStore(root)).rejects.toThrow();
    }
    const { root } = await fixture(); const imagePath = path.join(root, "store/images/test-only.webp");
    await rm(imagePath); await writeFile(path.join(root, "outside.webp"), bitmap); await symlink(path.join(root, "outside.webp"), imagePath);
    await expect(compileStore(root)).rejects.toThrow();
  });
  it("fails an explicitly published invalid entry and unapproved launch", async () => {
    const { root, raw } = await fixture(); raw.products[0].name.en = "";
    await writeFile(path.join(root, "store/catalog.json"), JSON.stringify(raw)); await expect(compileStore(root)).rejects.toThrow();
    raw.products[0].name.en = "TEST"; raw.seller.marketReviewApproved = false;
    await writeFile(path.join(root, "store/catalog.json"), JSON.stringify(raw)); await expect(compileStore(root)).rejects.toThrow();
  });
});
