import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AnimationClip,
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  Mesh,
  MeshStandardMaterial,
  NumberKeyframeTrack,
  Quaternion,
  QuaternionKeyframeTrack,
  Scene,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "public/assets/3d/nico");
const outputPath = path.join(outputDirectory, "canonical-nico.glb");
const metadataPath = path.join(outputDirectory, "canonical-nico.meta.json");

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

const material = (name, color, roughness = 0.72, metalness = 0.02) => {
  const value = new MeshStandardMaterial({ color, roughness, metalness });
  value.name = name;
  return value;
};

const skin = material("Nico_Skin", "#d89064", 0.82);
const skinLight = material("Nico_Skin_Highlight", "#e5a078", 0.82);
const hair = material("Nico_Hair", "#171518", 0.88);
const red = material("Nico_Red_Glasses", "#c92c2c", 0.48, 0.18);
const eye = material("Nico_Eyes", "#211b1b", 0.36);
const eyeLight = material("Nico_Eye_Highlight", "#f6fbff", 0.25);
const cream = material("Nico_Cream_Shirt", "#f0e5c9", 0.88);
const green = material("Nico_Explorer_Green", "#23864b", 0.75);
const greenDark = material("Nico_Explorer_Green_Dark", "#155f38", 0.78);
const khaki = material("Nico_Khaki", "#a88c55", 0.9);
const sole = material("Nico_Shoe_Sole", "#e7eadf", 0.92);

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
scene.name = "Canonical_Nico_Asset";
const nico = new Group();
nico.name = "NicoRoot";
scene.add(nico);

const torso = new Group();
torso.name = "Torso";
torso.position.set(0, 1.48, 0);
nico.add(torso);
addMesh(torso, "Shirt", new CapsuleGeometry(0.34, 0.48, 6, 16), cream, [0, 0, 0], [1.05, 1, 0.82]);
addMesh(torso, "ExplorerVestLeft", new BoxGeometry(0.18, 0.52, 0.07), green, [-0.17, 0.02, 0.29], [1, 1, 1], [0, 0, -0.04]);
addMesh(torso, "ExplorerVestRight", new BoxGeometry(0.18, 0.52, 0.07), green, [0.17, 0.02, 0.29], [1, 1, 1], [0, 0, 0.04]);
addMesh(torso, "CollarLeft", new ConeGeometry(0.14, 0.22, 3), greenDark, [-0.12, 0.3, 0.32], [1, 0.7, 0.65], [Math.PI / 2, 0, -0.18]);
addMesh(torso, "CollarRight", new ConeGeometry(0.14, 0.22, 3), greenDark, [0.12, 0.3, 0.32], [1, 0.7, 0.65], [Math.PI / 2, 0, 0.18]);
addMesh(torso, "LeafBadge", new SphereGeometry(0.06, 12, 8), greenDark, [0.22, 0.02, 0.36], [0.65, 1, 0.35], [0, 0, -0.5]);

const hips = new Group();
hips.name = "Hips";
hips.position.set(0, 1.02, 0);
nico.add(hips);
addMesh(hips, "Shorts", new CapsuleGeometry(0.34, 0.18, 4, 14), khaki, [0, 0.08, 0], [1.08, 0.9, 0.86]);
addMesh(hips, "Belt", new TorusGeometry(0.33, 0.035, 8, 24), greenDark, [0, 0.18, 0], [1, 0.78, 1], [Math.PI / 2, 0, 0]);

const head = new Group();
head.name = "Head";
head.position.set(0, 2.28, 0.02);
nico.add(head);
addMesh(head, "HairMass", new SphereGeometry(0.52, 24, 18), hair, [0, 0.13, -0.08], [1.08, 0.98, 0.9]);
addMesh(head, "Face", new SphereGeometry(0.49, 24, 18), skin, [0, -0.02, 0.05], [1, 1.08, 0.92]);
addMesh(head, "LeftEar", new SphereGeometry(0.1, 14, 10), skin, [-0.49, -0.02, 0.02], [0.6, 1, 0.55]);
addMesh(head, "RightEar", new SphereGeometry(0.1, 14, 10), skin, [0.49, -0.02, 0.02], [0.6, 1, 0.55]);

for (const [index, x, angle] of [
  [0, -0.34, -0.35],
  [1, -0.18, -0.16],
  [2, 0, 0.02],
  [3, 0.18, 0.18],
  [4, 0.34, 0.34],
]) {
  addMesh(head, `HairTuft${index}`, new ConeGeometry(0.1, 0.28, 8), hair, [x, 0.5 - Math.abs(x) * 0.2, 0.02], [1, 1, 0.75], [0.15, 0, angle]);
}

for (const [side, x] of [["Left", -0.19], ["Right", 0.19]]) {
  addMesh(head, `${side}Eye`, new SphereGeometry(0.105, 18, 12), eye, [x, 0.04, 0.48], [1, 1.1, 0.48]);
  addMesh(head, `${side}EyeHighlight`, new SphereGeometry(0.022, 10, 8), eyeLight, [x - 0.025, 0.085, 0.535]);
  addMesh(head, `${side}Glasses`, new TorusGeometry(0.19, 0.028, 10, 32), red, [x, 0.045, 0.53]);
  addMesh(head, `${side}Eyebrow`, new CapsuleGeometry(0.014, 0.14, 3, 8), hair, [x, 0.205, 0.49], [1, 1, 0.65], [0, 0, Math.PI / 2 + (side === "Left" ? -0.08 : 0.08)]);
}
addMesh(head, "GlassesBridge", new BoxGeometry(0.12, 0.035, 0.035), red, [0, 0.045, 0.535]);
addMesh(head, "Nose", new SphereGeometry(0.045, 12, 8), skinLight, [0, -0.045, 0.515], [0.85, 1.15, 0.55]);
addMesh(head, "Smile", new TorusGeometry(0.105, 0.012, 6, 20, Math.PI), hair, [0, -0.19, 0.5], [1, 0.55, 1], [0, 0, Math.PI]);

const createArm = (side, sign) => {
  const arm = new Group();
  arm.name = `Arm${side}`;
  arm.position.set(sign * 0.42, 1.75, 0);
  nico.add(arm);
  addMesh(arm, `${side}Sleeve`, new CapsuleGeometry(0.12, 0.16, 4, 12), green, [0, -0.11, 0]);
  addMesh(arm, `${side}Forearm`, new CapsuleGeometry(0.09, 0.34, 4, 12), skin, [0, -0.42, 0.015]);
  addMesh(arm, `${side}Hand`, new SphereGeometry(0.105, 14, 10), skin, [0, -0.69, 0.025], [0.9, 1.1, 0.85]);
  arm.rotation.z = sign * -0.08;
  return arm;
};

const createLeg = (side, sign) => {
  const leg = new Group();
  leg.name = `Leg${side}`;
  leg.position.set(sign * 0.2, 1.03, 0);
  nico.add(leg);
  addMesh(leg, `${side}ShortLeg`, new CapsuleGeometry(0.15, 0.13, 4, 12), khaki, [0, -0.14, 0]);
  addMesh(leg, `${side}LowerLeg`, new CapsuleGeometry(0.105, 0.4, 4, 12), skin, [0, -0.49, 0]);
  addMesh(leg, `${side}Sock`, new CylinderGeometry(0.11, 0.12, 0.12, 12), cream, [0, -0.75, 0]);
  addMesh(leg, `${side}Shoe`, new CapsuleGeometry(0.13, 0.16, 4, 12), green, [0, -0.87, 0.1], [1.05, 0.72, 1.45], [Math.PI / 2, 0, 0]);
  addMesh(leg, `${side}Sole`, new BoxGeometry(0.25, 0.045, 0.36), sole, [0, -0.94, 0.12]);
  return leg;
};

createArm("Left", -1);
createArm("Right", 1);
createLeg("Left", -1);
createLeg("Right", 1);

addMesh(nico, "Neck", new CylinderGeometry(0.13, 0.15, 0.18, 14), skin, [0, 1.92, 0]);

const scalar = (target, times, values) => new NumberKeyframeTrack(target, times, values);
const rotation = (target, axis, times, values, base = [0, 0, 0]) => {
  const samples = values.flatMap((value) => {
    const euler = new Euler(...base);
    euler[axis] = value;
    const quaternion = new Quaternion().setFromEuler(euler);
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
  });
  return new QuaternionKeyframeTrack(`${target}.quaternion`, times, samples);
};
const animations = [
  new AnimationClip("Idle", 3.2, [
    scalar("Torso.scale[y]", [0, 1.6, 3.2], [1, 1.025, 1]),
    rotation("Head", "y", [0, 0.8, 1.6, 2.4, 3.2], [0, 0.035, 0, -0.035, 0]),
    scalar("NicoRoot.position[y]", [0, 1.6, 3.2], [0, 0.012, 0]),
  ]),
  new AnimationClip("Walk", 1.2, [
    rotation("ArmLeft", "x", [0, 0.3, 0.6, 0.9, 1.2], [0.38, 0, -0.38, 0, 0.38], [0, 0, 0.08]),
    rotation("ArmRight", "x", [0, 0.3, 0.6, 0.9, 1.2], [-0.38, 0, 0.38, 0, -0.38], [0, 0, -0.08]),
    rotation("LegLeft", "x", [0, 0.3, 0.6, 0.9, 1.2], [-0.42, 0, 0.42, 0, -0.42]),
    rotation("LegRight", "x", [0, 0.3, 0.6, 0.9, 1.2], [0.42, 0, -0.42, 0, 0.42]),
    scalar("NicoRoot.position[y]", [0, 0.3, 0.6, 0.9, 1.2], [0, 0.025, 0, 0.025, 0]),
    rotation("Torso", "y", [0, 0.3, 0.6, 0.9, 1.2], [0.04, 0, -0.04, 0, 0.04]),
  ]),
  new AnimationClip("Run", 0.72, [
    rotation("ArmLeft", "x", [0, 0.18, 0.36, 0.54, 0.72], [0.72, 0, -0.72, 0, 0.72], [0, 0, 0.08]),
    rotation("ArmRight", "x", [0, 0.18, 0.36, 0.54, 0.72], [-0.72, 0, 0.72, 0, -0.72], [0, 0, -0.08]),
    rotation("LegLeft", "x", [0, 0.18, 0.36, 0.54, 0.72], [-0.68, 0, 0.68, 0, -0.68]),
    rotation("LegRight", "x", [0, 0.18, 0.36, 0.54, 0.72], [0.68, 0, -0.68, 0, 0.68]),
    scalar("NicoRoot.position[y]", [0, 0.18, 0.36, 0.54, 0.72], [0, 0.055, 0, 0.055, 0]),
    rotation("Torso", "x", [0, 0.36, 0.72], [0.08, 0.11, 0.08]),
  ]),
  new AnimationClip("Celebrate", 1.8, [
    rotation("ArmLeft", "z", [0, 0.45, 1.35, 1.8], [0.08, -2.35, -2.35, 0.08]),
    rotation("ArmRight", "z", [0, 0.45, 1.35, 1.8], [-0.08, 2.35, 2.35, -0.08]),
    scalar("NicoRoot.position[y]", [0, 0.35, 0.7, 1.05, 1.4, 1.8], [0, 0.14, 0, 0.16, 0, 0]),
    rotation("Head", "z", [0, 0.45, 0.9, 1.35, 1.8], [0, -0.08, 0.08, -0.06, 0]),
  ]),
];

const exporter = new GLTFExporter();
const glb = await new Promise((resolve, reject) => {
  exporter.parse(
    scene,
    (result) => resolve(Buffer.from(result)),
    reject,
    {
      animations,
      binary: true,
      includeCustomExtensions: false,
      onlyVisible: true,
      trs: true,
    },
  );
});

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, glb);
const sha256 = createHash("sha256").update(glb).digest("hex");
const metadata = {
  assetId: "character.nico.canonical",
  version: 1,
  format: "glTF 2.0 binary",
  sourceOfTruth: "Approved illustrated Nico production references",
  privateFamilyPhotoUsed: false,
  units: "metres",
  upAxis: "+Y",
  forwardAxis: "+Z",
  groundOrigin: true,
  animationClips: animations.map((clip) => clip.name),
  nodeContract: ["NicoRoot", "Torso", "Hips", "Head", "ArmLeft", "ArmRight", "LegLeft", "LegRight"],
  materials: [skin, skinLight, hair, red, eye, eyeLight, cream, green, greenDark, khaki, sole].map((item) => item.name),
  byteLength: glb.byteLength,
  sha256,
};
fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Generated ${path.relative(root, outputPath)} (${glb.byteLength} bytes, sha256 ${sha256})`);
