import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetPath = path.join(root, "public/assets/3d/boltbot/canonical-boltbot.glb");
const metadataPath = path.join(root, "public/assets/3d/boltbot/canonical-boltbot.meta.json");
const buffer = fs.readFileSync(assetPath);
const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error("Canonical BoltBot is not a GLB asset");
if (buffer.readUInt32LE(4) !== 2) throw new Error("Canonical BoltBot is not glTF 2.0");
if (buffer.readUInt32LE(8) !== buffer.byteLength) throw new Error("Canonical BoltBot GLB length is invalid");
if (buffer.byteLength > 600_000) throw new Error(`Canonical BoltBot exceeds the 600 KB foundation budget: ${buffer.byteLength}`);

const jsonLength = buffer.readUInt32LE(12);
if (buffer.toString("ascii", 16, 20) !== "JSON") throw new Error("Canonical BoltBot is missing the GLB JSON chunk");
const document = JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength).trim());
const nodeNames = (document.nodes ?? []).map((node) => node.name);
const names = new Set(nodeNames);
for (const required of metadata.nodeContract) {
  if (!names.has(required)) throw new Error(`Canonical BoltBot node contract is missing: ${required}`);
}

const animationByName = new Map((document.animations ?? []).map((animation) => [animation.name, animation]));
const requiredTargets = {
  Idle: ["BoltBotRoot", "Torso", "Head", "ScannerDish"],
  Drive: ["BoltBotRoot", "Torso", "ArmLeft", "ArmRight", "WheelAxleLeft", "WheelAxleRight"],
  Scan: ["Head", "ScannerDish", "StarCore"],
  Think: ["Head", "ArmRight", "ElbowRight", "ScannerDish"],
  Repair: ["Head", "ArmRight", "ElbowRight", "GripperRight"],
  Celebrate: ["BoltBotRoot", "Head", "StarCore", "ArmLeft", "ElbowLeft", "ArmRight", "ElbowRight"],
};
const expectedAccessorType = { rotation: "VEC4", scale: "VEC3", translation: "VEC3", weights: "SCALAR" };
for (const [clipName, requiredNodes] of Object.entries(requiredTargets)) {
  const animation = animationByName.get(clipName);
  if (!animation) throw new Error(`Canonical BoltBot animation is missing: ${clipName}`);
  const targets = new Set();
  const boundProperties = new Set();
  for (const channel of animation.channels ?? []) {
    const nodeName = nodeNames[channel.target.node];
    const binding = `${nodeName}.${channel.target.path}`;
    if (boundProperties.has(binding)) throw new Error(`Canonical BoltBot ${clipName} duplicates animation binding: ${binding}`);
    boundProperties.add(binding);
    targets.add(nodeName);
    const sampler = animation.samplers?.[channel.sampler];
    const accessor = document.accessors?.[sampler?.output];
    const expected = expectedAccessorType[channel.target?.path];
    if (!expected || accessor?.type !== expected) {
      throw new Error(`Canonical BoltBot ${clipName} has an invalid ${channel.target?.path} output accessor`);
    }
  }
  for (const required of requiredNodes) {
    if (!targets.has(required)) throw new Error(`Canonical BoltBot ${clipName} does not animate required node: ${required}`);
  }
}

const sha256 = createHash("sha256").update(buffer).digest("hex");
if (metadata.sha256 !== sha256) throw new Error("Canonical BoltBot metadata hash does not match the GLB");
if (metadata.byteLength !== buffer.byteLength) throw new Error("Canonical BoltBot metadata byte length does not match the GLB");
if (metadata.privateFamilyPhotoUsed !== false) throw new Error("Canonical BoltBot metadata must confirm that private family media was not used");
if (metadata.artStatus !== "canonical-foundation") throw new Error("Canonical BoltBot must declare its review status");
if (Math.abs(metadata.boundsMeters?.min?.[1] ?? 1) > 0.02) throw new Error("Canonical BoltBot ground origin is outside tolerance");
if ((metadata.boundsMeters?.dimensions?.[1] ?? 0) < 1) throw new Error("Canonical BoltBot height metadata is invalid");
for (const anchor of Object.values(metadata.anchors ?? {})) {
  if (!names.has(anchor)) throw new Error(`Canonical BoltBot anchor is missing: ${anchor}`);
}

console.log(`Canonical BoltBot GLB validated (${buffer.byteLength} bytes, ${animationByName.size} animation clips).`);
