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

export type NavigationView = SectionId;
export type LocalizedText = { en: string; "es-MX": string };

export type WorldSection = {
  id: SectionId;
  emoji: string;
  starsRequired: number;
  name: LocalizedText;
  description: LocalizedText;
  activities: LocalizedText[];
};

export type LocalMission = {
  id: string;
  sectionId: SectionId;
  rewardStars: number;
  title: LocalizedText;
  description: LocalizedText;
  objectives: LocalizedText[];
};

export type AnimalRecord = {
  id: string;
  name: string;
  habitat: string;
  emoji: string;
  fact: string;
  discovered: boolean;
  favorite: boolean;
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
};

export type PetRecord = {
  id: string;
  name: string;
  species: string;
  color: string;
  accessory: string;
  personality: string;
  bond: number;
  tricks: string[];
};

export type ArtworkRecord = {
  id: string;
  title: string;
  background: string;
  subject: string;
  frame: string;
  caption: string;
};

export type StoryRecord = {
  id: string;
  title: string;
  hero: string;
  place: string;
  problem: string;
  ending: string;
  language: Language;
};

export type DinosaurRecord = {
  id: string;
  name: string;
  emoji: string;
  period: string;
  discovered: boolean;
};

export type LocalProfile = {
  schemaVersion: 2;
  id: string;
  playerName: string;
  language: Language;
  stars: number;
  selectedSection: SectionId;
  completedMissions: string[];
  sectionVisits: Partial<Record<SectionId, number>>;
  robot: Robot;
  robots: Robot[];
  animals: AnimalRecord[];
  monsters: MonsterRecord[];
  pets: PetRecord[];
  activePetId: string | null;
  artwork: ArtworkRecord[];
  stories: StoryRecord[];
  dinosaurs: DinosaurRecord[];
  fossils: string[];
  arcadeScores: Record<string, number>;
  decorations: string[];
  badges: string[];
  createdAt: string;
  updatedAt: string;
};

export type LocalSaveStore = {
  schemaVersion: 2;
  activeProfileId: string;
  profiles: LocalProfile[];
};
