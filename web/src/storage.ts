import type { Language, LocalProfile, LocalSaveStore, Robot, SectionId } from "./types";

export const STORAGE_KEY = "nicos-world-local-save-v1";

const now = (): string => new Date().toISOString();

const id = (prefix: string): string => {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
};

export const starterRobot = (playerName = "Explorer"): Robot => ({
  id: "starter-boltbot",
  name: `${playerName.slice(0, 14) || "Explorer"}'s BoltBot`,
  color: "Electric Blue",
  secondary_color: "Sunny Yellow",
  head: "mecha_vanguard",
  eyes: "mecha_visor",
  body: "mecha_reactor_frame",
  arms: "mecha_photon_blades",
  base: "mecha_vernier_legs",
  backpack: "mecha_wing_binders",
  power: "mecha_star_reactor",
  personality: "Brave Guardian",
  level: 1,
  xp: 0,
});

export const createProfile = (playerName: string, language: Language = "en"): LocalProfile => {
  const timestamp = now();
  const cleanName = playerName.trim().slice(0, 24) || "Explorer";
  return {
    schemaVersion: 1,
    id: id("player"),
    playerName: cleanName,
    language,
    stars: 0,
    selectedSection: "world-map",
    completedMissions: [],
    sectionVisits: { "world-map": 1 },
    robot: starterRobot(cleanName),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const normalizeLanguage = (value: unknown): Language => value === "es-MX" ? "es-MX" : "en";

const normalizeProfile = (candidate: unknown): LocalProfile | null => {
  if (!candidate || typeof candidate !== "object") return null;
  const value = candidate as Partial<LocalProfile>;
  const playerName = String(value.playerName ?? "Explorer").trim().slice(0, 24) || "Explorer";
  const profileId = String(value.id ?? id("player")).slice(0, 80);
  const selectedSection = String(value.selectedSection ?? "world-map") as SectionId;
  const sectionVisits = value.sectionVisits && typeof value.sectionVisits === "object"
    ? value.sectionVisits
    : { "world-map": 1 };
  const robot = value.robot && typeof value.robot === "object"
    ? { ...starterRobot(playerName), ...value.robot, id: String(value.robot.id ?? "starter-boltbot") }
    : starterRobot(playerName);
  return {
    schemaVersion: 1,
    id: profileId,
    playerName,
    language: normalizeLanguage(value.language),
    stars: Math.max(0, Math.min(99999, Number(value.stars) || 0)),
    selectedSection,
    completedMissions: Array.isArray(value.completedMissions)
      ? [...new Set(value.completedMissions.map((item) => String(item).slice(0, 80)))].slice(0, 100)
      : [],
    sectionVisits: { ...sectionVisits },
    robot,
    createdAt: String(value.createdAt ?? now()),
    updatedAt: String(value.updatedAt ?? now()),
  };
};

export const createDefaultStore = (): LocalSaveStore => {
  const profile = createProfile("Nico", "en");
  return { schemaVersion: 1, activeProfileId: profile.id, profiles: [profile] };
};

export const normalizeStore = (candidate: unknown): LocalSaveStore => {
  if (!candidate || typeof candidate !== "object") return createDefaultStore();
  const value = candidate as Partial<LocalSaveStore>;
  const profiles = Array.isArray(value.profiles)
    ? value.profiles.map(normalizeProfile).filter((item): item is LocalProfile => item !== null).slice(0, 12)
    : [];
  if (!profiles.length) return createDefaultStore();
  const activeProfileId = profiles.some((profile) => profile.id === value.activeProfileId)
    ? String(value.activeProfileId)
    : profiles[0].id;
  return { schemaVersion: 1, activeProfileId, profiles };
};

export const loadLocalStore = (): LocalSaveStore => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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
  format: "nicos-world-local-profile",
  exportedAt: now(),
  profile: { ...profile, updatedAt: now() },
}, null, 2);

export const importProfile = (raw: string): LocalProfile => {
  const parsed = JSON.parse(raw) as { format?: unknown; profile?: unknown } | LocalProfile;
  const candidate = "profile" in parsed ? parsed.profile : parsed;
  const profile = normalizeProfile(candidate);
  if (!profile) throw new Error("Invalid Nico's World profile");
  return { ...profile, id: id("player"), updatedAt: now() };
};

export const touchProfile = (profile: LocalProfile): LocalProfile => ({
  ...profile,
  updatedAt: now(),
});
