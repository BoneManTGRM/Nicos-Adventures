import professionData from "./catalogs/nico-professions.json";
import type {
  AnimalRecord,
  ArtworkRecord,
  DinosaurRecord,
  Language,
  LocalProfile,
  LocalSaveStore,
  MonsterRecord,
  MovieCharacterKind,
  MoviePose,
  MovieProject,
  NicoPreferences,
  NicoProfessionId,
  NicoWardrobe,
  PetRecord,
  Robot,
  SectionId,
  StoryRecord,
  WardrobeSlot,
} from "./types";

export const SCHEMA_VERSION = 4 as const;
export const STORAGE_KEY = "nicos-world-local-save-v4";
export const PROFILE_EVENT = "nicos-world-profile-updated";
const LEGACY_KEYS = [
  "nicos-world-local-save-v3",
  "nicos-world-local-save-v2",
  "nicos-world-local-save-v1",
] as const;
const now = (): string => new Date().toISOString();
const id = (prefix: string): string => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

const professionIds = professionData.map((item) => item.id) as NicoProfessionId[];
const characterKinds: MovieCharacterKind[] = ["nico", "robot", "monster", "pet"];
const moviePoses: MoviePose[] = ["idle", "wave", "celebrate", "launch", "dance", "spin", "bounce", "roar", "sleep"];
const sectionIds: SectionId[] = [
  "world-map", "robo-lab", "animal-forest", "monster-lab", "monster-habitats",
  "art-studio", "story-castle", "game-arcade", "dinosaur-valley", "pet-workshop",
  "robot-home", "memory-book", "badge-book", "parent-settings",
];
const wardrobeSlots: WardrobeSlot[] = [
  "headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop",
];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
const clampText = (value: unknown, max: number, fallback = ""): string => String(value ?? fallback).trim().slice(0, max);
const optionalText = (value: unknown, max: number): string | undefined => {
  const text = clampText(value, max);
  return text || undefined;
};
const nullableText = (value: unknown, max: number): string | null => {
  const text = clampText(value, max);
  return text || null;
};
const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(min, Math.min(max, numeric)) : fallback;
};
const normalizeLanguage = (value: unknown): Language => value === "es-MX" ? "es-MX" : "en";
const normalizeBoolean = (value: unknown, fallback = false): boolean => typeof value === "boolean" ? value : fallback;
const normalizeSection = (value: unknown): SectionId => sectionIds.includes(value as SectionId) ? value as SectionId : "world-map";
const uniqueNewest = (values: unknown[], max: number, textLimit = 100): string[] => {
  const seen = new Set<string>();
  const newest: string[] = [];
  for (let index = values.length - 1; index >= 0 && newest.length < max; index -= 1) {
    const value = clampText(values[index], textLimit);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    newest.unshift(value);
  }
  return newest;
};

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

export const defaultWardrobe = (
  profession: NicoProfessionId = "explorer",
  accentColor = "#22c55e",
): NicoWardrobe => ({
  presetId: profession,
  headwear: null,
  eyewear: "nico-red-glasses",
  top: "nico-green-polo",
  outerwear: null,
  bottoms: "nico-khaki-shorts",
  shoes: "nico-green-sneakers",
  backpack: null,
  badge: "nico-world-leaf",
  prop: null,
  accentColor,
});

const defaultNicoPreferences = (): NicoPreferences => ({
  profession: "explorer",
  accentColor: "#22c55e",
  speechEnabled: true,
  wardrobe: defaultWardrobe(),
});

export const createProfile = (playerName: string, language: Language = "en"): LocalProfile => {
  const timestamp = now();
  const cleanName = playerName.trim().slice(0, 24) || "Explorer";
  const robot = starterRobot(cleanName);
  return {
    schemaVersion: SCHEMA_VERSION,
    id: id("player"),
    playerName: cleanName,
    language,
    stars: 0,
    selectedSection: "world-map",
    completedMissions: [],
    sectionVisits: { "world-map": 1 },
    robot,
    robots: [robot],
    activeRobotId: robot.id,
    animals: starterAnimals(),
    monsters: [],
    pets: [],
    activePetId: null,
    artwork: [],
    displayedArtworkId: null,
    stories: [],
    dinosaurs: starterDinosaurs(),
    fossils: [],
    arcadeScores: {},
    decorations: ["Charging Dock"],
    badges: [],
    movieProjects: [],
    nico: defaultNicoPreferences(),
    lastBackupAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

function normalizeRobot(candidate: unknown, fallback: Robot): Robot {
  const value = asRecord(candidate) ?? {};
  return {
    id: clampText(value.id, 80, fallback.id),
    name: clampText(value.name, 32, fallback.name),
    color: clampText(value.color, 40, fallback.color),
    secondary_color: clampText(value.secondary_color, 40, fallback.secondary_color),
    head: clampText(value.head, 60, fallback.head),
    eyes: clampText(value.eyes, 60, fallback.eyes),
    body: clampText(value.body, 60, fallback.body),
    arms: clampText(value.arms, 60, fallback.arms),
    base: clampText(value.base, 60, fallback.base),
    backpack: clampText(value.backpack, 60, fallback.backpack),
    power: clampText(value.power, 60, fallback.power),
    personality: clampText(value.personality, 60, fallback.personality),
    job: optionalText(value.job, 80),
    mood: optionalText(value.mood, 40),
    voice: optionalText(value.voice, 40),
    level: Math.round(clampNumber(value.level, 1, 999, fallback.level)),
    xp: Math.round(clampNumber(value.xp, 0, 999999, fallback.xp)),
  };
}

function normalizeAnimal(candidate: unknown, fallback?: AnimalRecord): AnimalRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const animalId = clampText(value.id, 80, fallback?.id ?? "");
  if (!animalId) return null;
  return {
    id: animalId,
    name: clampText(value.name, 60, fallback?.name ?? "Animal"),
    habitat: clampText(value.habitat, 50, fallback?.habitat ?? "Unknown"),
    emoji: clampText(value.emoji, 12, fallback?.emoji ?? "🐾"),
    fact: clampText(value.fact, 500, fallback?.fact ?? ""),
    discovered: normalizeBoolean(value.discovered, fallback?.discovered ?? false),
    favorite: normalizeBoolean(value.favorite, fallback?.favorite ?? false),
    imageTitle: optionalText(value.imageTitle, 100) ?? fallback?.imageTitle,
    group: optionalText(value.group, 60) ?? fallback?.group,
    region: optionalText(value.region, 100) ?? fallback?.region,
    adaptation: optionalText(value.adaptation, 400) ?? fallback?.adaptation,
  };
}

function normalizeMonster(candidate: unknown): MonsterRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const monsterId = clampText(value.id, 80);
  if (!monsterId) return null;
  return {
    id: monsterId,
    name: clampText(value.name, 32, "Monster"),
    body: clampText(value.body, 60, "Dragon"),
    eyes: clampText(value.eyes, 60, "Two eyes"),
    horns: clampText(value.horns, 60, "No horns"),
    wings: clampText(value.wings, 60, "No wings"),
    color: clampText(value.color, 40, "Aqua"),
    pattern: clampText(value.pattern, 60, "Plain"),
    power: clampText(value.power, 80, "Friendship"),
    personality: clampText(value.personality, 60, "Curious"),
    friendship: Math.round(clampNumber(value.friendship, 0, 100, 1)),
    habitat: clampText(value.habitat, 60, "Crystal Cave"),
    mouth: optionalText(value.mouth, 60),
    arms: optionalText(value.arms, 60),
    legs: optionalText(value.legs, 60),
    tail: optionalText(value.tail, 60),
    texture: optionalText(value.texture, 60),
    animation: optionalText(value.animation, 40),
  };
}

function normalizePet(candidate: unknown): PetRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const petId = clampText(value.id, 80);
  if (!petId) return null;
  return {
    id: petId,
    name: clampText(value.name, 32, "Pet"),
    species: clampText(value.species, 60, "Robot Dog"),
    color: clampText(value.color, 40, "Blue"),
    accessory: clampText(value.accessory, 60, "None"),
    personality: clampText(value.personality, 60, "Playful"),
    bond: Math.round(clampNumber(value.bond, 0, 100, 1)),
    tricks: uniqueNewest(Array.isArray(value.tricks) ? value.tricks : [], 30, 60),
  };
}

function normalizeArtwork(candidate: unknown): ArtworkRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const artworkId = clampText(value.id, 80);
  if (!artworkId) return null;
  return {
    id: artworkId,
    title: clampText(value.title, 60, "Untitled Artwork"),
    background: clampText(value.background, 60, "Starry Space"),
    subject: clampText(value.subject, 80, "Nico"),
    frame: clampText(value.frame, 60, "Gold Frame"),
    caption: clampText(value.caption, 140),
  };
}

function normalizeStory(candidate: unknown): StoryRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const storyId = clampText(value.id, 80);
  if (!storyId) return null;
  return {
    id: storyId,
    title: clampText(value.title, 60, "Untitled Story"),
    hero: clampText(value.hero, 80, "Nico"),
    place: clampText(value.place, 100, "Nico's World"),
    problem: clampText(value.problem, 300),
    ending: clampText(value.ending, 300),
    language: normalizeLanguage(value.language),
  };
}

function normalizeDinosaur(candidate: unknown, fallback?: DinosaurRecord): DinosaurRecord | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const dinosaurId = clampText(value.id, 80, fallback?.id ?? "");
  if (!dinosaurId) return null;
  return {
    id: dinosaurId,
    name: clampText(value.name, 80, fallback?.name ?? "Dinosaur"),
    emoji: clampText(value.emoji, 12, fallback?.emoji ?? "🦖"),
    period: clampText(value.period, 40, fallback?.period ?? "Unknown"),
    discovered: normalizeBoolean(value.discovered, fallback?.discovered ?? false),
  };
}

function normalizeWardrobe(candidate: unknown, profession: NicoProfessionId, accentColor: string): NicoWardrobe {
  const value = asRecord(candidate);
  const fallback = defaultWardrobe(profession, accentColor);
  if (!value) return fallback;
  const preset = professionIds.includes(value.presetId as NicoProfessionId)
    ? value.presetId as NicoProfessionId
    : profession;
  const wardrobe = { ...fallback, presetId: preset };
  for (const slot of wardrobeSlots) wardrobe[slot] = nullableText(value[slot], 80);
  wardrobe.accentColor = /^#[0-9a-f]{6}$/i.test(String(value.accentColor ?? ""))
    ? String(value.accentColor)
    : accentColor;
  return wardrobe;
}

function normalizeNico(candidate: unknown): NicoPreferences {
  const value = asRecord(candidate);
  if (!value) return defaultNicoPreferences();
  const profession = professionIds.includes(value.profession as NicoProfessionId)
    ? value.profession as NicoProfessionId
    : "explorer";
  const accentColor = /^#[0-9a-f]{6}$/i.test(String(value.accentColor ?? ""))
    ? String(value.accentColor)
    : "#22c55e";
  return {
    profession,
    accentColor,
    speechEnabled: value.speechEnabled !== false,
    wardrobe: normalizeWardrobe(value.wardrobe, profession, accentColor),
  };
}

function normalizeMovieProject(candidate: unknown): MovieProject | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const characters = Array.isArray(value.characters)
    ? value.characters.flatMap((item) => {
        const character = asRecord(item);
        if (!character) return [];
        const kind = characterKinds.includes(character.kind as MovieCharacterKind)
          ? character.kind as MovieCharacterKind
          : null;
        if (!kind) return [];
        return [{
          kind,
          id: clampText(character.id, 80, kind),
          name: clampText(character.name, 48, kind),
        }];
      }).slice(0, 3)
    : [];
  if (!characters.length) return null;

  const poseSequence = Array.isArray(value.poseSequence)
    ? value.poseSequence.flatMap((item) => {
        const step = asRecord(item);
        if (!step) return [];
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
    createdAt: clampText(value.createdAt, 50, now()),
    lastDownloadedAt: optionalText(value.lastDownloadedAt, 50),
    lastMimeType: optionalText(value.lastMimeType, 80),
  };
}

function normalizeProfile(candidate: unknown): LocalProfile | null {
  const value = asRecord(candidate);
  if (!value) return null;
  const sourceSchema = Math.round(clampNumber(value.schemaVersion, 1, SCHEMA_VERSION, 1));
  const playerName = clampText(value.playerName, 24, "Explorer") || "Explorer";
  const language = normalizeLanguage(value.language);
  const fresh = createProfile(playerName, language);
  const candidateRobot = normalizeRobot(value.robot, fresh.robot);
  const rawRobots = Array.isArray(value.robots) ? value.robots : [];
  const normalizedRobots = rawRobots.map((item) => normalizeRobot(item, candidateRobot)).slice(-50);
  if (!normalizedRobots.some((robot) => robot.id === candidateRobot.id)) normalizedRobots.push(candidateRobot);
  const robots = normalizedRobots.length ? normalizedRobots : [candidateRobot];
  const legacyActiveId = candidateRobot.id;
  const requestedActiveId = sourceSchema >= 4 ? clampText(value.activeRobotId, 80, legacyActiveId) : legacyActiveId;
  const activeRobot = robots.find((robot) => robot.id === requestedActiveId) ?? robots.find((robot) => robot.id === legacyActiveId) ?? robots[0];

  const freshAnimals = starterAnimals();
  const animalFallbacks = new Map(freshAnimals.map((animal) => [animal.id, animal]));
  const animals = Array.isArray(value.animals) && value.animals.length
    ? value.animals.flatMap((item) => {
        const record = asRecord(item);
        const fallback = record ? animalFallbacks.get(clampText(record.id, 80)) : undefined;
        const normalized = normalizeAnimal(item, fallback);
        return normalized ? [normalized] : [];
      }).slice(-120)
    : freshAnimals;

  const freshDinosaurs = starterDinosaurs();
  const dinosaurFallbacks = new Map(freshDinosaurs.map((dinosaur) => [dinosaur.id, dinosaur]));
  const dinosaurs = Array.isArray(value.dinosaurs) && value.dinosaurs.length
    ? value.dinosaurs.flatMap((item) => {
        const record = asRecord(item);
        const fallback = record ? dinosaurFallbacks.get(clampText(record.id, 80)) : undefined;
        const normalized = normalizeDinosaur(item, fallback);
        return normalized ? [normalized] : [];
      }).slice(-100)
    : freshDinosaurs;

  const monsters = (Array.isArray(value.monsters) ? value.monsters : []).flatMap((item) => {
    const normalized = normalizeMonster(item);
    return normalized ? [normalized] : [];
  }).slice(-60);
  const pets = (Array.isArray(value.pets) ? value.pets : []).flatMap((item) => {
    const normalized = normalizePet(item);
    return normalized ? [normalized] : [];
  }).slice(-60);
  const artwork = (Array.isArray(value.artwork) ? value.artwork : []).flatMap((item) => {
    const normalized = normalizeArtwork(item);
    return normalized ? [normalized] : [];
  }).slice(-60);
  const stories = (Array.isArray(value.stories) ? value.stories : []).flatMap((item) => {
    const normalized = normalizeStory(item);
    return normalized ? [normalized] : [];
  }).slice(-60);
  const movieProjects = (Array.isArray(value.movieProjects) ? value.movieProjects : []).flatMap((item) => {
    const normalized = normalizeMovieProject(item);
    return normalized ? [normalized] : [];
  }).slice(-40);

  const rawVisits = asRecord(value.sectionVisits) ?? {};
  const sectionVisits: Partial<Record<SectionId, number>> = {};
  for (const sectionId of sectionIds) {
    if (rawVisits[sectionId] !== undefined) {
      sectionVisits[sectionId] = Math.round(clampNumber(rawVisits[sectionId], 0, 999999, 0));
    }
  }
  if (!sectionVisits["world-map"]) sectionVisits["world-map"] = 1;

  const rawScores = asRecord(value.arcadeScores) ?? {};
  const arcadeScores: Record<string, number> = {};
  for (const [key, score] of Object.entries(rawScores).slice(0, 100)) {
    const cleanKey = clampText(key, 80);
    if (cleanKey) arcadeScores[cleanKey] = Math.round(clampNumber(score, 0, 999999, 0));
  }

  const activePetId = pets.some((pet) => pet.id === value.activePetId) ? String(value.activePetId) : null;
  const legacyDisplayedArtworkId = artwork.at(-1)?.id ?? null;
  const displayedArtworkId = artwork.some((item) => item.id === value.displayedArtworkId)
    ? String(value.displayedArtworkId)
    : legacyDisplayedArtworkId;

  return {
    schemaVersion: SCHEMA_VERSION,
    id: clampText(value.id, 80, fresh.id),
    playerName,
    language,
    stars: Math.round(clampNumber(value.stars, 0, 99999, 0)),
    selectedSection: normalizeSection(value.selectedSection),
    completedMissions: uniqueNewest(Array.isArray(value.completedMissions) ? value.completedMissions : [], 1000, 140),
    sectionVisits,
    robot: activeRobot,
    robots,
    activeRobotId: activeRobot.id,
    animals,
    monsters,
    pets,
    activePetId,
    artwork,
    displayedArtworkId,
    stories,
    dinosaurs,
    fossils: uniqueNewest(Array.isArray(value.fossils) ? value.fossils : [], 200, 100),
    arcadeScores,
    decorations: uniqueNewest(Array.isArray(value.decorations) ? value.decorations : fresh.decorations, 100, 80),
    badges: uniqueNewest(Array.isArray(value.badges) ? value.badges : [], 200, 100),
    movieProjects,
    nico: normalizeNico(value.nico),
    lastBackupAt: nullableText(value.lastBackupAt, 50),
    createdAt: clampText(value.createdAt, 50, fresh.createdAt),
    updatedAt: clampText(value.updatedAt, 50, now()),
  };
}

export const createDefaultStore = (): LocalSaveStore => {
  const profile = createProfile("Nico", "en");
  return { schemaVersion: SCHEMA_VERSION, activeProfileId: profile.id, profiles: [profile] };
};

export const normalizeStore = (candidate: unknown): LocalSaveStore => {
  const value = asRecord(candidate);
  if (!value) return createDefaultStore();
  const profiles = (Array.isArray(value.profiles) ? value.profiles : [])
    .flatMap((item) => {
      const normalized = normalizeProfile(item);
      return normalized ? [normalized] : [];
    })
    .slice(-12);
  if (!profiles.length) return createDefaultStore();
  const activeProfileId = profiles.some((profile) => profile.id === value.activeProfileId)
    ? String(value.activeProfileId)
    : profiles[0].id;
  return { schemaVersion: SCHEMA_VERSION, activeProfileId, profiles };
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

export type ProfileEventDetail = {
  source: "app" | "shared";
  store: LocalSaveStore;
};

export const saveLocalStore = (store: LocalSaveStore, source: ProfileEventDetail["source"] = "shared"): boolean => {
  try {
    const normalized = normalizeStore(store);
    const next = JSON.stringify(normalized);
    const previous = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, next);
    if (previous !== next && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<ProfileEventDetail>(PROFILE_EVENT, { detail: { source, store: normalized } }));
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
  saveLocalStore(next, "shared");
  return next;
};

export const exportProfile = (profile: LocalProfile): string => JSON.stringify({
  format: "nicos-world-local-profile-v4",
  exportedAt: now(),
  profile: { ...profile, schemaVersion: SCHEMA_VERSION, updatedAt: now() },
}, null, 2);

export const importProfile = (raw: string): LocalProfile => {
  const parsed = JSON.parse(raw) as unknown;
  const record = asRecord(parsed);
  const candidate = record && "profile" in record ? record.profile : parsed;
  const profile = normalizeProfile(candidate);
  if (!profile) throw new Error("Invalid Nico's World profile");
  return { ...profile, id: id("player"), schemaVersion: SCHEMA_VERSION, updatedAt: now() };
};

export const touchProfile = (profile: LocalProfile): LocalProfile => ({ ...profile, schemaVersion: SCHEMA_VERSION, updatedAt: now() });
