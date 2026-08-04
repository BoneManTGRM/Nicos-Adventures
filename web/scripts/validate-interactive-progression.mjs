import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/world/progression.ts",
  "src/world/progression.test.ts",
  "src/world/arcadeChallenges.ts",
  "src/world/arcadeChallenges.test.ts",
  "src/world/Arcade.tsx",
  "src/world/DinosaurValley.tsx",
  "src/world/PetWorkshop.tsx",
  "src/world/progression.css",
];

for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing interactive progression file: ${relative}`);
}

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const fullApp = read("src/FullApp.tsx");
const progression = read("src/world/progression.ts");
const robot = read("src/world/RoboLab.tsx");
const animals = read("src/world/AnimalForest.tsx");
const monsters = read("src/world/MonsterWorld.tsx");
const arcade = read("src/world/Arcade.tsx");
const arcadeQuestions = read("src/world/arcadeChallenges.ts");
const dinosaurs = read("src/world/DinosaurValley.tsx");
const pets = read("src/world/PetWorkshop.tsx");
const css = read("src/world/progression.css");
const progressionTests = read("src/world/progression.test.ts");
const arcadeTests = read("src/world/arcadeChallenges.test.ts");

for (const moduleName of ["./world/Arcade", "./world/DinosaurValley", "./world/PetWorkshop"]) {
  if (!fullApp.includes(moduleName)) throw new Error(`Interactive destination is not integrated: ${moduleName}`);
}
if (!fullApp.includes('import "./world/progression.css"')) throw new Error("Interactive progression styles are not loaded");
if (fullApp.includes("Arcade, DinosaurValley, PetWorkshop, RobotHome")) {
  throw new Error("FullApp still imports the obsolete grouped adventure implementations");
}

for (const helper of ["completeOnce", "robotJobMission", "monsterFriendshipMission", "petTrickMission", "fieldMissionId", "arcadeMissionId", "dinosaurDiscoveryMission"]) {
  if (!progression.includes(`function ${helper}`)) throw new Error(`Progression helper is missing: ${helper}`);
}

if (!robot.includes("selectedJobComplete") || !robot.includes("robotJobMission") || !robot.includes("completeOnce")) {
  throw new Error("Robo Lab jobs are not finite per-robot certifications");
}
if (!animals.includes("fieldMissions") || !animals.includes("claimMission") || !animals.includes("disabled={sourceAnimal.discovered}")) {
  throw new Error("Animal Forest missions or one-way discovery protection is incomplete");
}
if (!monsters.includes("monsterFriendshipMission") || !monsters.includes("earnedMilestones") || !monsters.includes("nextFriendship")) {
  throw new Error("Monster Habitat care milestones are incomplete");
}
if (arcade.includes("Math.random") || !arcade.includes("ARCADE_QUESTIONS") || !arcade.includes("arcadeMissionId")) {
  throw new Error("The Arcade is not using deterministic bilingual question challenges");
}
for (const game of ["Animal Clue", "Pattern Power", "Robot Memory", "Dino Dig", "Monster Maze", "Rocket Math"]) {
  if (!arcadeQuestions.includes(`"${game}"`)) throw new Error(`Arcade question bank is missing: ${game}`);
}
if (!dinosaurs.includes("dinosaurDiscoveryMission") || !dinosaurs.includes("dino-period-options") || !dinosaurs.includes("period !== active.period")) {
  throw new Error("Dinosaur discoveries do not require the expedition period challenge");
}
if (!pets.includes("TRICKS") || !pets.includes("petTrickMission") || !pets.includes("bond: Math.min(100")) {
  throw new Error("Pet Workshop trick training or bond progression is incomplete");
}

for (const styleContract of ["field-mission-grid", "arcade-challenge-layout", "dino-expedition-panel", "pet-trick-grid", "friendship-milestones"]) {
  if (!css.includes(`.${styleContract}`)) throw new Error(`Interactive progression style is missing: ${styleContract}`);
}
if (!progressionTests.includes("awards a mission exactly once") || !arcadeTests.includes("three valid bilingual questions")) {
  throw new Error("Interactive progression regression tests are incomplete");
}

console.log("Interactive progression validation passed for robot certifications, animal field missions, monster care milestones, six Arcade challenge banks, dinosaur expeditions, and pet trick training.");
