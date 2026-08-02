import type {
  AnimalRecord,
  DinosaurRecord,
  Language,
  LocalProfile,
  LocalSaveStore,
  Robot,
  SectionId,
} from "./types";

export const STORAGE_KEY = "nicos-world-local-save-v2";
const LEGACY_KEY = "nicos-world-local-save-v1";
const now = (): string => new Date().toISOString();
const id = (prefix: string): string => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export const starterRobot = (playerName = "Explorer"): Robot => ({
  id: "starter-boltbot",
  name: `${playerName.slice(0, 14) || "Explorer"}'s BoltBot`,
  color: "Electric Blue",
  secondary_color: "Sunny Yellow",
  head: "Vanguard Crown",
  eyes: "Photon Visor",
  body: "Star Reactor",
  arms: "Guardian Arms",
  base: "Vernier Legs",
  backpack: "Wing Binders",
  power: "Star Reactor",
  personality: "Brave Guardian",
  level: 1,
  xp: 0,
});

const starterAnimals = (): AnimalRecord[] => [
  ["jaguar", "Jaguar", "Jungle", "🐆", "Jaguars are powerful swimmers."],
  ["axolotl", "Axolotl", "Wetlands", "🦎", "Axolotls can regrow damaged limbs."],
  ["vaquita", "Vaquita", "Ocean", "🐬", "The vaquita lives only in Mexico's Gulf of California."],
  ["wolf", "Mexican Gray Wolf", "Mountains", "🐺", "Mexican gray wolves communicate with howls."],
  ["monarch", "Monarch Butterfly", "Meadow", "🦋", "Monarchs migrate thousands of kilometers to Mexico."],
  ["panda", "Giant Panda", "Bamboo Forest", "🐼", "Pandas spend much of the day eating bamboo."],
  ["lion", "Lion", "Savanna", "🦁", "A lion family is called a pride."],
  ["penguin", "Emperor Penguin", "Antarctic", "🐧", "Emperor penguin dads keep eggs warm."],
  ["elephant", "African Elephant", "Savanna", "🐘", "Elephants use low rumbles to communicate."],
  ["octopus", "Giant Pacific Octopus", "Ocean", "🐙", "Octopuses have three hearts."],
  ["owl", "Great Horned Owl", "Forest", "🦉", "Owls can rotate their heads very far."],
  ["tapir", "Baird's Tapir", "Rainforest", "🦣", "Tapirs help forests by spreading seeds."],
].map(([animalId, name, habitat, emoji, fact]) => ({ id: animalId, name, habitat, emoji, fact, discovered: false, favorite: false }));

const starterDinosaurs = (): DinosaurRecord[] => [
  ["trex", "Tyrannosaurus rex", "🦖", "Cretaceous"],
  ["triceratops", "Triceratops", "🦕", "Cretaceous"],
  ["stegosaurus", "Stegosaurus", "🦕", "Jurassic"],
  ["brachiosaurus", "Brachiosaurus", "🦕", "Jurassic"],
  ["ankylosaurus", "Ankylosaurus", "🦖", "Cretaceous"],
  ["velociraptor", "Velociraptor", "🦖", "Cretaceous"],
].map(([dinoId, name, emoji, period]) => ({ id: dinoId, name, emoji, period, discovered: false }));

export const createProfile = (playerName: string, language: Language = "en"): LocalProfile => {
  const timestamp = now();
  const cleanName = playerName.trim().slice(0, 24) || "Explorer";
  const robot = starterRobot(cleanName);
  return {
    schemaVersion: 2,
    id: id("player"),
    playerName: cleanName,
    language,
    stars: 0,
    selectedSection: "world-map",
    completedMissions: [],
    sectionVisits: { "world-map": 1 },
    robot,
    robots: [robot],
    animals: starterAnimals(),
    monsters: [],
    pets: [],
    activePetId: null,
    artwork: [],
    stories: [],
    dinosaurs: starterDinosaurs(),
    fossils: [],
    arcadeScores: {},
    decorations: ["Charging Dock"],
    badges: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const normalizeLanguage = (value: unknown): Language => value === "es-MX" ? "es-MX" : "en";

const normalizeProfile = (candidate: unknown): LocalProfile | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<LocalProfile> & { schemaVersion?: number };
  const playerName = String(value.playerName ?? "Explorer").trim().slice(0, 24) || "Explorer";
  const fresh = createProfile(playerName, normalizeLanguage(value.language));
  const robot = value.robot && typeof value.robot === "object"
    ? { ...fresh.robot, ...value.robot, id: String(value.robot.id ?? fresh.robot.id) }
    : fresh.robot;
  return {
    ...fresh,
    ...value,
    schemaVersion: 2,
    id: String(value.id ?? fresh.id).slice(0, 80),
    playerName,
    language: normalizeLanguage(value.language),
    stars: Math.max(0, Math.min(99999, Number(value.stars) || 0)),
    selectedSection: String(value.selectedSection ?? "world-map") as SectionId,
    completedMissions: Array.isArray(value.completedMissions) ? [...new Set(value.completedMissions.map(String))].slice(0, 200) : [],
    sectionVisits: value.sectionVisits && typeof value.sectionVisits === "object" ? { ...value.sectionVisits } : { "world-map": 1 },
    robot,
    robots: Array.isArray(value.robots) && value.robots.length ? value.robots.map((item) => ({ ...fresh.robot, ...item })) : [robot],
    animals: Array.isArray(value.animals) && value.animals.length ? value.animals : fresh.animals,
    monsters: Array.isArray(value.monsters) ? value.monsters : [],
    pets: Array.isArray(value.pets) ? value.pets : [],
    activePetId: typeof value.activePetId === "string" ? value.activePetId : null,
    artwork: Array.isArray(value.artwork) ? value.artwork : [],
    stories: Array.isArray(value.stories) ? value.stories : [],
    dinosaurs: Array.isArray(value.dinosaurs) && value.dinosaurs.length ? value.dinosaurs : fresh.dinosaurs,
    fossils: Array.isArray(value.fossils) ? value.fossils.map(String) : [],
    arcadeScores: value.arcadeScores && typeof value.arcadeScores === "object" ? value.arcadeScores : {},
    decorations: Array.isArray(value.decorations) ? value.decorations.map(String) : fresh.decorations,
    badges: Array.isArray(value.badges) ? value.badges.map(String) : [],
    createdAt: String(value.createdAt ?? fresh.createdAt),
    updatedAt: String(value.updatedAt ?? now()),
  };
};

export const createDefaultStore = (): LocalSaveStore => {
  const profile = createProfile("Nico", "en");
  return { schemaVersion: 2, activeProfileId: profile.id, profiles: [profile] };
};

export const normalizeStore = (candidate: unknown): LocalSaveStore => {
  if (!candidate || typeof candidate !== "object") return createDefaultStore();
  const value = candidate as Partial<LocalSaveStore>;
  const profiles = Array.isArray(value.profiles)
    ? value.profiles.map(normalizeProfile).filter((item): item is LocalProfile => item !== null).slice(0, 12)
    : [];
  if (!profiles.length) return createDefaultStore();
  const activeProfileId = profiles.some((profile) => profile.id === value.activeProfileId) ? String(value.activeProfileId) : profiles[0].id;
  return { schemaVersion: 2, activeProfileId, profiles };
};

export const loadLocalStore = (): LocalSaveStore => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    return saved ? normalizeStore(JSON.parse(saved)) : createDefaultStore();
  } catch {
    return createDefaultStore();
  }
};

export const saveLocalStore = (store: LocalSaveStore): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStore(store)));
    return true;
  } catch {
    return false;
  }
};

export const exportProfile = (profile: LocalProfile): string => JSON.stringify({
  format: "nicos-world-local-profile-v2",
  exportedAt: now(),
  profile: { ...profile, updatedAt: now() },
}, null, 2);

export const importProfile = (raw: string): LocalProfile => {
  const parsed = JSON.parse(raw) as { profile?: unknown } | LocalProfile;
  const candidate = "profile" in parsed ? parsed.profile : parsed;
  const profile = normalizeProfile(candidate);
  if (!profile) throw new Error("Invalid Nico's World profile");
  return { ...profile, id: id("player"), updatedAt: now() };
};

export const touchProfile = (profile: LocalProfile): LocalProfile => ({ ...profile, updatedAt: now() });
