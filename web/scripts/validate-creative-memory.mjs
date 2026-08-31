import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/world/creativeProgression.ts",
  "src/world/creativeProgression.test.ts",
  "src/world/ArtStudio.tsx",
  "src/world/StoryCastle.tsx",
  "src/world/storyBook.ts",
  "src/world/RobotHome.tsx",
  "src/world/Museum.tsx",
  "src/world/Badges.tsx",
  "src/world/Settings.tsx",
  "src/world/memorySystem.test.ts",
  "src/world/creative-memory.css",
];
for (const relative of requiredFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Missing creative/memory file: ${relative}`);
}

const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const fullApp = read("src/FullApp.tsx");
const art = read("src/world/ArtStudio.tsx");
const stories = read("src/world/StoryCastle.tsx");
const home = read("src/world/RobotHome.tsx");
const museum = read("src/world/Museum.tsx");
const badges = read("src/world/Badges.tsx");
const settings = read("src/world/Settings.tsx");
const creativeProgression = read("src/world/creativeProgression.ts");
const tests = read("src/world/memorySystem.test.ts");
const css = read("src/world/creative-memory.css");

for (const modulePath of ["./world/ArtStudio", "./world/StoryCastle", "./world/RobotHome", "./world/Museum", "./world/Badges", "./world/Settings"]) {
  if (!fullApp.includes(modulePath)) throw new Error(`Creative/memory destination is not integrated: ${modulePath}`);
}
for (const obsoleteImport of ["./world/CreativeWorld", "./world/MemorySettings", "./world/AdventureWorld"]) {
  if (fullApp.includes(obsoleteImport)) throw new Error(`Obsolete grouped destination import returned: ${obsoleteImport}`);
}
if (!fullApp.includes('import "./world/creative-memory.css"')) throw new Error("Creative/memory styles are not loaded");

if (!art.includes("creative-library-grid") || !art.includes("editingId") || !art.includes("completeCreativeMilestones") || !art.includes("remove =")) {
  throw new Error("Art Studio does not support editable local gallery progression");
}
if (!stories.includes("surprise") || !stories.includes("speechSynthesis") || !stories.includes("creative-library-grid") || !stories.includes("completeCreativeMilestones")) {
  throw new Error("Story Castle does not support surprise generation, narration, editing, and milestones");
}
if (!stories.includes("storyCombinationCount") || !stories.includes("story-page-turner") || !stories.includes("buildStoryPages")) {
  throw new Error("Story Castle does not provide extensive customizable multi-page storybooks");
}
if (!home.includes("roomGoals") || !home.includes("chooseRobot") || !home.includes("choosePet") || !home.includes("displayArtwork") || !home.includes("roomGoalId")) {
  throw new Error("Robot Home is not a configurable headquarters with finite goals");
}
if (!museum.includes("buildMemoryEntries") || !museum.includes("memory-category-row") || !museum.includes("openNicoWorld")) {
  throw new Error("Memory Museum is not a searchable archive with movie recreation");
}
if (!badges.includes("buildBadges") || !badges.includes("Arcade Scholar") || !badges.includes("Robot Home Designer")) {
  throw new Error("Badge Observatory does not report system-wide progress");
}
if (!settings.includes("navigator.storage.estimate") || !settings.includes("deleteProfile") || !settings.includes("renameValue") || !settings.includes("privacyCards")) {
  throw new Error("Parent and Settings lacks storage, profile safeguards, or privacy details");
}
if (!creativeProgression.includes("creativeMilestoneId") || !creativeProgression.includes("roomGoalId") || !creativeProgression.includes("completeCreativeMilestones")) {
  throw new Error("Creative and Robot Home finite progression helpers are incomplete");
}
if (!tests.includes("indexes every supported saved creation type") || !tests.includes("finite progress definition for every badge")) {
  throw new Error("Creative/memory regression coverage is incomplete");
}
for (const contract of ["creative-library-grid", "robot-home-stage", "memory-system-layout", "badge-progress-grid", "settings-system", "prefers-reduced-motion"]) {
  if (!css.includes(`.${contract}`) && contract !== "prefers-reduced-motion") throw new Error(`Creative/memory style contract missing: ${contract}`);
  if (contract === "prefers-reduced-motion" && !css.includes(contract)) throw new Error("Creative/memory reduced-motion coverage is missing");
}

console.log("Creative, Robot Home, Memory Museum, Badge Observatory, and Parent Settings validation passed.");
