import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AnimationClip,
  Box3,
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  QuaternionKeyframeTrack,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  VectorKeyframeTrack,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "public/assets/3d/boltbot");
const outputPath = path.join(outputDirectory, "canonical-boltbot.glb");
const metadataPath = path.join(outputDirectory, "canonical-boltbot.meta.json");

class NodeFileReader {
  result = null;
  error = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((value) => {
        this.result = value;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.(error);
      });
  }
}

globalThis.FileReader ??= NodeFileReader;

const material = (name, color, roughness, metalness, emissive = "#000000", emissiveIntensity = 0) => {
  const value = new MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
  value.name = name;
  return value;
};

const primary = material("BoltBot_Primary", "#38bdf8", 0.4, 0.5);
const primaryDark = material("BoltBot_Primary_Dark", "#1d4f91", 0.48, 0.58);
const accent = material("BoltBot_Accent", "#facc15", 0.35, 0.5);
const pearl = material("BoltBot_Pearl", "#edf8fb", 0.34, 0.36);
const dark = material("BoltBot_Dark", "#0b1730", 0.52, 0.52);
const joint = material("BoltBot_Joint", "#334155", 0.58, 0.72);
const glow = material("BoltBot_Glow", "#bff7ff", 0.24, 0.22, "#22d3ee", 2.4);

const addMesh = (parent, name, geometry, surface, position, scale = [1, 1, 1], rotation = [0, 0, 0]) => {
  const mesh = new Mesh(geometry, surface);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const scene = new Scene();
scene.name = "Canonical_BoltBot_Asset";
const boltBot = new Group();
boltBot.name = "BoltBotRoot";
scene.add(boltBot);

const base = new Group();
base.name = "DriveBase";
base.position.set(0, 0.24, 0);
boltBot.add(base);
addMesh(base, "DriveHousing", new CapsuleGeometry(0.34, 0.22, 6, 18), primaryDark, [0, 0.04, 0], [1.26, 0.55, 0.82]);
addMesh(base, "FrontBumper", new BoxGeometry(0.58, 0.12, 0.13), pearl, [0, 0.02, 0.34]);
addMesh(base, "RearBattery", new BoxGeometry(0.48, 0.24, 0.16), dark, [0, 0.1, -0.31]);

for (const [side, sign] of [["Left", -1], ["Right", 1]]) {
  const axle = new Group();
  axle.name = `WheelAxle${side}`;
  axle.position.set(sign * 0.39, -0.06, 0.02);
  base.add(axle);
  addMesh(axle, `Wheel${side}`, new CylinderGeometry(0.19, 0.19, 0.14, 24), dark, [0, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
  addMesh(axle, `WheelHub${side}`, new CylinderGeometry(0.085, 0.085, 0.155, 18), accent, [0, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
}
addMesh(base, "FrontCaster", new SphereGeometry(0.095, 16, 10), joint, [0, -0.13, 0.29], [1, 0.72, 1]);

const torso = new Group();
torso.name = "Torso";
torso.position.set(0, 0.82, 0);
boltBot.add(torso);
addMesh(torso, "TorsoArmor", new CapsuleGeometry(0.34, 0.28, 6, 20), primary, [0, 0, 0], [1.05, 1, 0.78]);
addMesh(torso, "ChestPlate", new BoxGeometry(0.48, 0.38, 0.08), pearl, [0, 0.02, 0.31]);
addMesh(torso, "ChestFrame", new TorusGeometry(0.16, 0.035, 10, 28), accent, [0, 0.03, 0.37]);
addMesh(torso, "StarCore", new SphereGeometry(0.105, 20, 14), glow, [0, 0.03, 0.39], [1, 1, 0.55]);
addMesh(torso, "LeftVent", new BoxGeometry(0.055, 0.2, 0.04), dark, [-0.23, -0.02, 0.35], [1, 1, 1], [0, 0, -0.12]);
addMesh(torso, "RightVent", new BoxGeometry(0.055, 0.2, 0.04), dark, [0.23, -0.02, 0.35], [1, 1, 1], [0, 0, 0.12]);

const head = new Group();
head.name = "Head";
head.position.set(0, 1.43, 0.02);
boltBot.add(head);
addMesh(head, "HeadShell", new CapsuleGeometry(0.31, 0.22, 6, 22), pearl, [0, 0, 0], [1.12, 0.9, 0.78]);
addMesh(head, "FaceScreen", new BoxGeometry(0.49, 0.2, 0.055), dark, [0, -0.015, 0.31]);
for (const [side, x] of [["Left", -0.14], ["Right", 0.14]]) {
  addMesh(head, `${side}Optic`, new SphereGeometry(0.055, 16, 10), glow, [x, 0, 0.355], [1, 0.78, 0.48]);
  addMesh(head, `${side}CheekLight`, new BoxGeometry(0.08, 0.025, 0.025), accent, [x, -0.105, 0.35]);
}
addMesh(head, "FriendlyMouth", new TorusGeometry(0.085, 0.012, 6, 18, Math.PI), accent, [0, -0.085, 0.345], [1, 0.55, 1], [0, 0, Math.PI]);

const scanner = new Group();
scanner.name = "ScannerDish";
scanner.position.set(0, 0.3, 0);
head.add(scanner);
addMesh(scanner, "AntennaStem", new CylinderGeometry(0.025, 0.032, 0.24, 12), joint, [0, 0.09, 0]);
addMesh(scanner, "AntennaGlow", new SphereGeometry(0.065, 14, 10), glow, [0, 0.24, 0]);
addMesh(scanner, "Dish", new ConeGeometry(0.14, 0.09, 22), primary, [0, 0.18, -0.02], [1, 0.6, 1], [Math.PI, 0, 0]);

for (const [side, sign] of [["Left", -1], ["Right", 1]]) {
  const arm = new Group();
  arm.name = `Arm${side}`;
  arm.position.set(sign * 0.43, 1.05, 0);
  arm.rotation.z = sign * -0.12;
  boltBot.add(arm);
  addMesh(arm, `Shoulder${side}`, new SphereGeometry(0.14, 16, 12), accent, [0, 0, 0]);
  addMesh(arm, `UpperArm${side}`, new CapsuleGeometry(0.075, 0.18, 4, 12), primary, [0, -0.22, 0]);
  const elbow = new Group();
  elbow.name = `Elbow${side}`;
  elbow.position.set(0, -0.4, 0);
  arm.add(elbow);
  addMesh(elbow, `ElbowJoint${side}`, new SphereGeometry(0.095, 14, 10), joint, [0, 0, 0]);
  addMesh(elbow, `Forearm${side}`, new CapsuleGeometry(0.085, 0.2, 4, 12), pearl, [0, -0.19, 0.02]);
  const gripper = new Group();
  gripper.name = `Gripper${side}`;
  gripper.position.set(0, -0.39, 0.04);
  elbow.add(gripper);
  addMesh(gripper, `Palm${side}`, new SphereGeometry(0.105, 14, 10), primaryDark, [0, 0, 0], [0.9, 0.75, 0.85]);
  addMesh(gripper, `ClawOuter${side}`, new ConeGeometry(0.045, 0.16, 10), accent, [sign * 0.06, -0.09, 0.02], [1, 1, 0.72], [0, 0, sign * -0.35]);
  addMesh(gripper, `ClawInner${side}`, new ConeGeometry(0.045, 0.16, 10), accent, [sign * -0.06, -0.09, 0.02], [1, 1, 0.72], [0, 0, sign * 0.35]);
}

addMesh(boltBot, "Neck", new CylinderGeometry(0.13, 0.16, 0.18, 16), joint, [0, 1.18, 0]);

const vector = (target, times, values) => new VectorKeyframeTrack(target, times, values.flat());
const rotation = (target, axis, times, values, baseRotation = [0, 0, 0]) => {
  const samples = values.flatMap((value) => {
    const euler = new Euler(...baseRotation);
    euler[axis] = value;
    const quaternion = new Quaternion().setFromEuler(euler);
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
  });
  return new QuaternionKeyframeTrack(`${target}.quaternion`, times, samples);
};
const eulerRotation = (target, times, values) => new QuaternionKeyframeTrack(
  `${target}.quaternion`,
  times,
  values.flatMap((value) => {
    const quaternion = new Quaternion().setFromEuler(new Euler(...value));
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
  }),
);

const animations = [
  new AnimationClip("Idle", 2.8, [
    vector("Torso.scale", [0, 1.4, 2.8], [[1, 1, 1], [1.01, 1.02, 1.01], [1, 1, 1]]),
    vector("BoltBotRoot.position", [0, 1.4, 2.8], [[0, 0, 0], [0, 0.01, 0], [0, 0, 0]]),
    rotation("Head", "y", [0, 0.7, 1.4, 2.1, 2.8], [0, 0.045, 0, -0.045, 0]),
    rotation("ScannerDish", "z", [0, 0.7, 1.4, 2.1, 2.8], [0, -0.04, 0, 0.04, 0]),
  ]),
  new AnimationClip("Drive", 1.0, [
    vector("BoltBotRoot.position", [0, 0.25, 0.5, 0.75, 1], [[0, 0, 0], [0, 0.025, 0], [0, 0, 0], [0, 0.025, 0], [0, 0, 0]]),
    rotation("Torso", "z", [0, 0.25, 0.5, 0.75, 1], [0.025, 0, -0.025, 0, 0.025]),
    rotation("ArmLeft", "x", [0, 0.25, 0.5, 0.75, 1], [0.18, 0, -0.18, 0, 0.18], [0, 0, 0.12]),
    rotation("ArmRight", "x", [0, 0.25, 0.5, 0.75, 1], [-0.18, 0, 0.18, 0, -0.18], [0, 0, -0.12]),
    rotation("WheelAxleLeft", "x", [0, 0.25, 0.5, 0.75, 1], [0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]),
    rotation("WheelAxleRight", "x", [0, 0.25, 0.5, 0.75, 1], [0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]),
  ]),
  new AnimationClip("Scan", 2.0, [
    rotation("Head", "y", [0, 0.4, 1, 1.6, 2], [0, -0.5, 0.5, -0.32, 0]),
    rotation("ScannerDish", "y", [0, 0.5, 1, 1.5, 2], [0, 0.7, 1.4, 2.1, 2.8]),
    vector("StarCore.scale", [0, 0.5, 1, 1.5, 2], [[1, 1, 0.55], [1.18, 1.18, 0.55], [1, 1, 0.55], [1.18, 1.18, 0.55], [1, 1, 0.55]]),
  ]),
  new AnimationClip("Think", 1.8, [
    rotation("Head", "z", [0, 0.45, 1.35, 1.8], [0, -0.13, -0.13, 0]),
    rotation("ArmRight", "z", [0, 0.45, 1.35, 1.8], [-0.12, 0.82, 0.82, -0.12]),
    rotation("ElbowRight", "x", [0, 0.45, 1.35, 1.8], [0, 0.85, 0.85, 0]),
    rotation("ScannerDish", "z", [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8], [0, -0.08, 0.08, -0.08, 0.08, -0.04, 0]),
  ]),
  new AnimationClip("Repair", 1.6, [
    eulerRotation("ArmRight", [0, 0.35, 0.8, 1.25, 1.6], [[0, 0, -0.12], [-0.95, 0, 0.3], [-1.02, 0, 0.3], [-0.86, 0, 0.25], [0, 0, -0.12]]),
    rotation("ElbowRight", "x", [0, 0.35, 0.8, 1.25, 1.6], [0, 0.62, 0.92, 0.58, 0]),
    rotation("GripperRight", "z", [0, 0.5, 0.8, 1.1, 1.6], [0, -0.18, 0.18, -0.12, 0]),
    rotation("Head", "y", [0, 0.35, 1.25, 1.6], [0, 0.18, 0.18, 0]),
  ]),
  new AnimationClip("Celebrate", 1.8, [
    rotation("ArmLeft", "z", [0, 0.45, 1.35, 1.8], [0.12, -2.2, -2.2, 0.12]),
    rotation("ArmRight", "z", [0, 0.45, 1.35, 1.8], [-0.12, 2.2, 2.2, -0.12]),
    rotation("ElbowLeft", "z", [0, 0.45, 1.35, 1.8], [0, -0.18, -0.08, 0]),
    rotation("ElbowRight", "z", [0, 0.45, 1.35, 1.8], [0, 0.18, 0.08, 0]),
    vector("BoltBotRoot.position", [0, 0.18, 0.55, 0.9, 1.35, 1.8], [[0, 0, 0], [0, -0.025, 0], [0, 0.13, 0], [0, 0, 0], [0, 0.06, 0], [0, 0, 0]]),
    rotation("Head", "z", [0, 0.45, 0.9, 1.35, 1.8], [0, -0.09, 0.09, -0.06, 0]),
    vector("StarCore.scale", [0, 0.45, 0.9, 1.35, 1.8], [[1, 1, 0.55], [1.22, 1.22, 0.55], [1, 1, 0.55], [1.22, 1.22, 0.55], [1, 1, 0.55]]),
  ]),
];

const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) => {
  exporter.parse(scene, (result) => resolve(Buffer.from(result)), reject, {
    animations,
    binary: true,
    includeCustomExtensions: false,
    onlyVisible: true,
    trs: true,
  });
});

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, glb);
const sha256 = createHash("sha256").update(glb).digest("hex");
boltBot.updateMatrixWorld(true);
const bounds = new Box3().setFromObject(boltBot);
const dimensions = bounds.getSize(new Vector3());
const metadata = {
  assetId: "character.boltbot.canonical",
  version: 1,
  artStatus: "canonical-foundation",
  format: "glTF 2.0 binary",
  sourceOfTruth: "Nico's World BoltBot visual identity and existing profile configuration",
  provenance: "Project-owned procedural model; no private family media used",
  license: "Project-owned original asset",
  privateFamilyPhotoUsed: false,
  units: "metres",
  upAxis: "+Y",
  forwardAxis: "+Z",
  groundOrigin: true,
  boundsMeters: { min: bounds.min.toArray(), max: bounds.max.toArray(), dimensions: dimensions.toArray() },
  pivot: { node: "BoltBotRoot", position: [0, 0, 0] },
  anchors: {
    scanner: "ScannerDish",
    starCore: "StarCore",
    leftGripper: "GripperLeft",
    rightGripper: "GripperRight",
    driveBase: "DriveBase",
  },
  rigType: "hierarchical articulated transform rig",
  animationClips: animations.map((clip) => clip.name),
  animationDurationsSeconds: Object.fromEntries(animations.map((clip) => [clip.name, clip.duration])),
  nodeContract: [
    "BoltBotRoot", "DriveBase", "WheelAxleLeft", "WheelAxleRight", "Torso", "StarCore", "Head", "ScannerDish",
    "ArmLeft", "ElbowLeft", "GripperLeft", "ArmRight", "ElbowRight", "GripperRight",
  ],
  materials: [primary, primaryDark, accent, pearl, dark, joint, glow].map((item) => item.name),
  byteLength: glb.byteLength,
  sha256,
};
fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Generated ${path.relative(root, outputPath)} (${glb.byteLength} bytes, sha256 ${sha256})`);
