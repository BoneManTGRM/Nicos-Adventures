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
const nodeNames = (document.nodes ?? []).map((node) => node.name);
const names = new Set(nodeNames);
for (const required of metadata.nodeContract) {
  if (!names.has(required)) throw new Error(`Canonical Nico node contract is missing: ${required}`);
}

const animationByName = new Map((document.animations ?? []).map((animation) => [animation.name, animation]));
const clips = new Set(animationByName.keys());
for (const required of ["Idle", "Walk", "Run", "Celebrate"]) {
  if (!clips.has(required)) throw new Error(`Canonical Nico animation is missing: ${required}`);
}

const expectedAccessorType = { rotation: "VEC4", scale: "VEC3", translation: "VEC3", weights: "SCALAR" };
for (const [clipName, animation] of animationByName) {
  for (const channel of animation.channels ?? []) {
    const sampler = animation.samplers?.[channel.sampler];
    const accessor = document.accessors?.[sampler?.output];
    const expected = expectedAccessorType[channel.target?.path];
    if (!expected || accessor?.type !== expected) {
      throw new Error(`Canonical Nico ${clipName} has an invalid ${channel.target?.path} output accessor`);
    }
  }
}

const requiredTargets = {
  Idle: ["NicoRoot", "Torso", "Hips", "Head", "ArmLeft", "ArmRight"],
  Walk: ["NicoRoot", "Torso", "Hips", "Head", "ArmLeft", "ElbowLeft", "ArmRight", "ElbowRight", "LegLeft", "KneeLeft", "FootLeft", "LegRight", "KneeRight", "FootRight"],
  Run: ["NicoRoot", "Torso", "Hips", "Head", "ArmLeft", "ElbowLeft", "ArmRight", "ElbowRight", "LegLeft", "KneeLeft", "FootLeft", "LegRight", "KneeRight", "FootRight"],
  Celebrate: ["NicoRoot", "Torso", "Head", "ArmLeft", "ElbowLeft", "ArmRight", "ElbowRight", "KneeLeft", "KneeRight"],
};
for (const [clipName, requiredNodes] of Object.entries(requiredTargets)) {
  const animation = animationByName.get(clipName);
  const targets = new Set((animation.channels ?? []).map((channel) => nodeNames[channel.target.node]));
  for (const required of requiredNodes) {
    if (!targets.has(required)) throw new Error(`Canonical Nico ${clipName} does not animate required node: ${required}`);
  }
}

const sha256 = createHash("sha256").update(buffer).digest("hex");
if (metadata.sha256 !== sha256) throw new Error("Canonical Nico metadata hash does not match the GLB");
if (metadata.byteLength !== buffer.byteLength) throw new Error("Canonical Nico metadata byte length does not match the GLB");
if (metadata.privateFamilyPhotoUsed !== false) throw new Error("Canonical Nico metadata must confirm that the private family photograph was not used");
if (metadata.artStatus !== "canonical-foundation") throw new Error("Canonical Nico must declare its review status");
if (Math.abs(metadata.boundsMeters?.min?.[1] ?? 1) > 0.01) throw new Error("Canonical Nico ground origin is outside tolerance");
if ((metadata.boundsMeters?.dimensions?.[1] ?? 0) < 2) throw new Error("Canonical Nico height metadata is invalid");
for (const anchor of Object.values(metadata.anchors ?? {})) {
  if (!names.has(anchor)) throw new Error(`Canonical Nico anchor is missing: ${anchor}`);
}

console.log(`Canonical Nico GLB validated (${buffer.byteLength} bytes, ${clips.size} animation clips).`);
