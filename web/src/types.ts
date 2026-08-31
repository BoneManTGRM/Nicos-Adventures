import type { GoldenAdventureProgress } from "./game/goldenAdventure";

export type Language = "en" | "es-MX";

export type Robot = {
  id: string;
  name: string;
  color: string;
  secondary_color: string;
  head: string;
  eyes: string;
  body: string;
  arms: string;
  base: string;
  backpack: string;
  power: string;
  personality: string;
  job?: string;
  mood?: string;
  voice?: string;
  level: number;
  xp: number;
};

export type SectionId =
  | "world-map"
  | "robo-lab"
  | "animal-forest"
  | "monster-lab"
  | "monster-habitats"
  | "art-studio"
  | "story-castle"
  | "game-arcade"
  | "dinosaur-valley"
  | "pet-workshop"
  | "robot-home"
  | "memory-book"
  | "badge-book"
  | "parent-settings";

export type NavigationView = SectionId | "world" | "robots" | "missions" | "home" | "parent";
export type LocalizedText = { en: string; "es-MX": string };

export type WorldSection = { id: SectionId; emoji: string; starsRequired: number; name: LocalizedText; description: LocalizedText; activities: LocalizedText[]; };
export type LocalMission = { id: string; sectionId: SectionId; rewardStars: number; title: LocalizedText; description: LocalizedText; objectives: LocalizedText[]; };

export type AnimalRecord = {
  id: string;
  name: string;
  habitat: string;
  emoji: string;
  fact: string;
  discovered: boolean;
  favorite: boolean;
  imageTitle?: string;
  group?: string;
  region?: string;
  adaptation?: string;
};

export type MonsterRecord = {
  id: string;
  name: string;
  body: string;
  eyes: string;
  horns: string;
  wings: string;
  color: string;
  pattern: string;
  power: string;
  personality: string;
  friendship: number;
  habitat: string;
  mouth?: string;
  arms?: string;
  legs?: string;
  tail?: string;
  texture?: string;
  animation?: string;
};

export type PetRecord = { id: string; name: string; species: string; color: string; accessory: string; personality: string; bond: number; tricks: string[]; };
export type ArtworkRecord = { id: string; title: string; background: string; subject: string; frame: string; caption: string; };
export type StoryRecord = {
  id: string;
  title: string;
  hero: string;
  place: string;
  problem: string;
  ending: string;
  language: Language;
  companion?: string;
  theme?: string;
  magicItem?: string;
  specialDetail?: string;
  pages?: string[];
};
export type DinosaurRecord = { id: string; name: string; emoji: string; period: string; discovered: boolean; };

export type NicoProfessionId =
  | "explorer"
  | "astronaut"
  | "doctor"
  | "scientist"
  | "engineer"
  | "builder"
  | "veterinarian"
  | "dinosaur"
  | "suit"
  | "firefighter"
  | "chef"
  | "artist"
  | "pilot"
  | "gardener"
  | "teacher"
  | "dentist"
  | "police-officer"
  | "zookeeper"
  | "musician"
  | "farmer"
  | "lifeguard"
  | "magician"
  | "soccer-player"
  | "tennis-player"
  | "detective"
  | "librarian";

export type WardrobeSlot =
  | "headwear"
  | "eyewear"
  | "top"
  | "outerwear"
  | "bottoms"
  | "shoes"
  | "backpack"
  | "badge"
  | "prop";

export type NicoWardrobe = {
  presetId: NicoProfessionId | null;
  headwear: string | null;
  eyewear: string | null;
  top: string | null;
  outerwear: string | null;
  bottoms: string | null;
  shoes: string | null;
  backpack: string | null;
  badge: string | null;
  prop: string | null;
  accentColor: string;
};

export type NicoPreferences = {
  profession: NicoProfessionId;
  accentColor: string;
  speechEnabled: boolean;
  wardrobe: NicoWardrobe;
};

export type MovieCharacterKind = "nico" | "robot" | "monster" | "pet";
export type MoviePose = "idle" | "wave" | "celebrate" | "launch" | "dance" | "spin" | "bounce" | "roar" | "sleep";

export type MovieCharacterRef = {
  kind: MovieCharacterKind;
  id: string;
  name: string;
};

export type MoviePoseStep = {
  pose: MoviePose;
  durationMs: number;
};

export type MovieProject = {
  id: string;
  title: string;
  characters: MovieCharacterRef[];
  poseSequence: MoviePoseStep[];
  background: string;
  caption: string;
  language: Language;
  durationMs: number;
  createdAt: string;
  lastDownloadedAt?: string;
  lastMimeType?: string;
};

export type LocalProfile = {
  schemaVersion: 4;
  id: string;
  playerName: string;
  language: Language;
  stars: number;
  selectedSection: SectionId;
  completedMissions: string[];
  sectionVisits: Partial<Record<SectionId, number>>;
  robot: Robot;
  robots: Robot[];
  activeRobotId: string;
  animals: AnimalRecord[];
  monsters: MonsterRecord[];
  pets: PetRecord[];
  activePetId: string | null;
  artwork: ArtworkRecord[];
  displayedArtworkId: string | null;
  stories: StoryRecord[];
  dinosaurs: DinosaurRecord[];
  fossils: string[];
  arcadeScores: Record<string, number>;
  decorations: string[];
  badges: string[];
  movieProjects: MovieProject[];
  adventures: GoldenAdventureProgress;
  nico: NicoPreferences;
  lastBackupAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalSaveStore = { schemaVersion: 4; activeProfileId: string; profiles: LocalProfile[]; };
