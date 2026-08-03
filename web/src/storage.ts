import type {
  AnimalRecord,
  DinosaurRecord,
  Language,
  LocalProfile,
  LocalSaveStore,
  MovieCharacterKind,
  MoviePose,
  MovieProject,
  NicoPreferences,
  NicoProfessionId,
  Robot,
  SectionId,
} from "./types";

export const STORAGE_KEY = "nicos-world-local-save-v3";
export const PROFILE_EVENT = "nicos-world-profile-updated";
const LEGACY_KEYS = ["nicos-world-local-save-v2", "nicos-world-local-save-v1"] as const;
const now = (): string => new Date().toISOString();
const id = (prefix: string): string => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

const professionIds: NicoProfessionId[] = [
  "explorer",
  "astronaut",
  "doctor",
  "scientist",
  "engineer",
  "veterinarian",
  "dinosaur",
  "suit",
  "firefighter",
  "chef",
  "artist",
  "pilot",
];
const characterKinds: MovieCharacterKind[] = ["nico", "robot", "monster", "pet"];
const moviePoses: MoviePose[] = ["idle", "wave", "celebrate", "launch", "dance", "spin", "bounce", "roar", "sleep"];

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

const defaultNicoPreferences = (): NicoPreferences => ({
  profession: "explorer",
  accentColor: "#22c55e",
  speechEnabled: true,
});

export const createProfile = (playerName: string, language: Language = "en"): LocalProfile => {
  const timestamp = now();
  const cleanName = playerName.trim().slice(0, 24) || "Explorer";
  const robot = starterRobot(cleanName);
  return {
    schemaVersion: 3,
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
    movieProjects: [],
    nico: defaultNicoPreferences(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const normalizeLanguage = (value: unknown): Language => value === "es-MX" ? "es-MX" : "en";
const clampText = (value: unknown, max: number, fallback = ""): string => String(value ?? fallback).trim().slice(0, max);
const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(min, Math.min(max, numeric)) : fallback;
};

const normalizeNico = (candidate: unknown): NicoPreferences => {
  if (!candidate || typeof candidate !== "object") return defaultNicoPreferences();
  const value = candidate as Partial<NicoPreferences>;
  const profession = professionIds.includes(value.profession as NicoProfessionId)
    ? value.profession as NicoProfessionId
    : "explorer";
  const accentColor = /^#[0-9a-f]{6}$/i.test(String(value.accentColor ?? ""))
    ? String(value.accentColor)
    : "#22c55e";
  return { profession, accentColor, speechEnabled: value.speechEnabled !== false };
};

const normalizeMovieProject = (candidate: unknown): MovieProject | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<MovieProject>;
  const characters = Array.isArray(value.characters)
    ? value.characters.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const character = item as { kind?: unknown; id?: unknown; name?: unknown };
        const kind = characterKinds.includes(character.kind as MovieCharacterKind)
          ? character.kind as MovieCharacterKind
          : null;
        if (!kind) return [];
        return [{ kind, id: clampText(character.id, 80, kind), name: clampText(character.name, 48, kind) }];
      }).slice(0, 3)
    : [];
  if (!characters.length) return null;

  const poseSequence = Array.isArray(value.poseSequence)
    ? value.poseSequence.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const step = item as { pose?: unknown; durationMs?: unknown };
        const pose = moviePoses.includes(step.pose as MoviePose) ? step.pose as MoviePose : null;
        if (!pose) return [];
        return [{ pose, durationMs: Math.round(clampNumber(step.durationMs, 400, 3000, 1200)) }];
      }).slice(0, 8)
    : [];
  if (!poseSequence.length) return null;

  const calculatedDuration = poseSequence.reduce((total, step) => total + step.durationMs, 0);
  return {
    id: clampText(value.id, 80, id("movie")),
    title: clampText(value.title, 48, "My Little Movie"),
    characters,
    poseSequence,
    background: clampText(value.background, 40, "Star Stage"),
    caption: clampText(value.caption, 140),
    language: normalizeLanguage(value.language),
    durationMs: Math.round(clampNumber(value.durationMs, 4000, 8000, Math.max(4000, Math.min(8000, calculatedDuration)))),
    createdAt: String(value.createdAt ?? now()),
    lastDownloadedAt: value.lastDownloadedAt ? String(value.lastDownloadedAt) : undefined,
    lastMimeType: value.lastMimeType ? clampText(value.lastMimeType, 80) : undefined,
  };
};

const normalizeProfile = (candidate: unknown): LocalProfile | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<LocalProfile> & { schemaVersion?: number };
  const playerName = String(value.playerName ?? "Explorer").trim().slice(0, 24) || "Explorer";
  const fresh = createProfile(playerName, normalizeLanguage(value.language));
  const robot = value.robot && typeof value.robot === "object"
    ? { ...fresh.robot, ...value.robot, id: String(value.robot.id ?? fresh.robot.id) }
    : fresh.robot;
  const movieProjects = Array.isArray(value.movieProjects)
    ? value.movieProjects.map(normalizeMovieProject).filter((item): item is MovieProject => item !== null).slice(-40)
    : [];
  return {
    ...fresh,
    ...value,
    schemaVersion: 3,
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
    badges: Array.isArray(value.badges) ? [...new Set(value.badges.map(String))].slice(0, 100) : [],
    movieProjects,
    nico: normalizeNico(value.nico),
    createdAt: String(value.createdAt ?? fresh.createdAt),
    updatedAt: String(value.updatedAt ?? now()),
  };
};

export const createDefaultStore = (): LocalSaveStore => {
  const profile = createProfile("Nico", "en");
  return { schemaVersion: 3, activeProfileId: profile.id, profiles: [profile] };
};

export const normalizeStore = (candidate: unknown): LocalSaveStore => {
  if (!candidate || typeof candidate !== "object") return createDefaultStore();
  const value = candidate as Partial<LocalSaveStore>;
  const profiles = Array.isArray(value.profiles)
    ? value.profiles.map(normalizeProfile).filter((item): item is LocalProfile => item !== null).slice(0, 12)
    : [];
  if (!profiles.length) return createDefaultStore();
  const activeProfileId = profiles.some((profile) => profile.id === value.activeProfileId) ? String(value.activeProfileId) : profiles[0].id;
  return { schemaVersion: 3, activeProfileId, profiles };
};

export const loadLocalStore = (): LocalSaveStore => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
      ?? LEGACY_KEYS.map((key) => localStorage.getItem(key)).find((value) => value !== null)
      ?? null;
    return saved ? normalizeStore(JSON.parse(saved)) : createDefaultStore();
  } catch {
    return createDefaultStore();
  }
};

export const saveLocalStore = (store: LocalSaveStore): boolean => {
  try {
    const serialized = JSON.stringify(normalizeStore(store));
    if (localStorage.getItem(STORAGE_KEY) === serialized) return true;
    localStorage.setItem(STORAGE_KEY, serialized);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: { source: "app" } }));
    }
    return true;
  } catch {
    return false;
  }
};

export const updateActiveProfile = (mutate: (profile: LocalProfile) => LocalProfile): LocalSaveStore => {
  const store = loadLocalStore();
  const profiles = store.profiles.map((profile) => profile.id === store.activeProfileId ? touchProfile(mutate(profile)) : profile);
  const next = normalizeStore({ ...store, profiles });
  saveLocalStore(next);
  return next;
};

export const exportProfile = (profile: LocalProfile): string => JSON.stringify({
  format: "nicos-world-local-profile-v3",
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
