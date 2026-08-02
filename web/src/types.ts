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

export type NavigationView = "world" | "robots" | "missions" | "home" | "parent";

export type LocalizedText = {
  en: string;
  "es-MX": string;
};

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

export type LocalProfile = {
  schemaVersion: 1;
  id: string;
  playerName: string;
  language: Language;
  stars: number;
  selectedSection: SectionId;
  completedMissions: string[];
  sectionVisits: Partial<Record<SectionId, number>>;
  robot: Robot;
  createdAt: string;
  updatedAt: string;
};

export type LocalSaveStore = {
  schemaVersion: 1;
  activeProfileId: string;
  profiles: LocalProfile[];
};
