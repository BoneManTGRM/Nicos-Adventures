import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetPath = path.join(root, "public/assets/3d/nico/canonical-nico.glb");
const metadataPath = path.join(root, "public/assets/3d/nico/canonical-nico.meta.json");
const buffer = fs.readFileSync(assetPath);
const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error("Canonical Nico is not a GLB asset");
if (buffer.readUInt32LE(4) !== 2) throw new Error("Canonical Nico is not glTF 2.0");
if (buffer.readUInt32LE(8) !== buffer.byteLength) throw new Error("Canonical Nico GLB length is invalid");
if (buffer.byteLength > 500_000) throw new Error(`Canonical Nico exceeds the 500 KB foundation budget: ${buffer.byteLength}`);

const jsonLength = buffer.readUInt32LE(12);
const jsonType = buffer.toString("ascii", 16, 20);
if (jsonType !== "JSON") throw new Error("Canonical Nico is missing the GLB JSON chunk");
const document = JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength).trim());
const names = new Set((document.nodes ?? []).map((node) => node.name));
for (const required of metadata.nodeContract) {
  if (!names.has(required)) throw new Error(`Canonical Nico node contract is missing: ${required}`);
}

const clips = new Set((document.animations ?? []).map((animation) => animation.name));
for (const required of ["Idle", "Walk", "Run", "Celebrate"]) {
  if (!clips.has(required)) throw new Error(`Canonical Nico animation is missing: ${required}`);
}

const sha256 = createHash("sha256").update(buffer).digest("hex");
if (metadata.sha256 !== sha256) throw new Error("Canonical Nico metadata hash does not match the GLB");
if (metadata.byteLength !== buffer.byteLength) throw new Error("Canonical Nico metadata byte length does not match the GLB");
if (metadata.privateFamilyPhotoUsed !== false) throw new Error("Canonical Nico metadata must confirm that the private family photograph was not used");

console.log(`Canonical Nico GLB validated (${buffer.byteLength} bytes, ${clips.size} animation clips).`);
