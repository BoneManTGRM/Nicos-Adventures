import type { Language, LocalProfile, PetRecord } from "../types";
import { completeOnce, petTrickMission } from "./progression";

export const PET_LIMIT = 60; // Matches the existing profile normalizer; never evict a saved friend.
export const TRICKS = [
  { id: "Sit", emoji: "🪑", name: { en: "Sit", "es-MX": "Sentarse" } },
  { id: "Spin", emoji: "🌀", name: { en: "Spin", "es-MX": "Girar" } },
  { id: "Fetch Tool", emoji: "🔧", name: { en: "Fetch a tool", "es-MX": "Traer una herramienta" } },
  { id: "High Five", emoji: "✋", name: { en: "High five", "es-MX": "Chocar los cinco" } },
  { id: "Scout", emoji: "🔭", name: { en: "Scout ahead", "es-MX": "Explorar adelante" } },
  { id: "Dance", emoji: "🎵", name: { en: "Dance", "es-MX": "Bailar" } },
] as const;
export type TrickId = typeof TRICKS[number]["id"];
export const CUES = [
  { emoji: "🐾", name: { en: "Paw", "es-MX": "Huella" } },
  { emoji: "⭐", name: { en: "Star", "es-MX": "Estrella" } },
  { emoji: "💚", name: { en: "Heart", "es-MX": "Corazón" } },
] as const;

export type PetGame = {
  kind: "fetch" | "training";
  petId: string;
  trickId?: TrickId;
  route: readonly number[];
  step: number;
  won: boolean;
};

export function beginPetGame(petId: string, trickId?: TrickId, round = 0): PetGame {
  const offset = Math.abs(Math.floor(Number.isFinite(round) ? round : 0));
  const index = TRICKS.findIndex((trick) => trick.id === trickId);
  return {
    kind: trickId ? "training" : "fetch", petId, trickId, step: 0, won: false,
    route: trickId
      ? [0, 1, 2].map((value) => (value + Math.max(0, index) + offset) % CUES.length)
      : [0, 4, 2, 3, 1].map((value) => (value + offset) % 6),
  };
}

/** No timer, random loss, or wrong-answer penalty. Completion is terminal. */
export function advancePetGame(game: PetGame, choice: number): PetGame {
  if (game.won || !Number.isInteger(choice) || choice !== game.route[game.step]) return game;
  const step = game.step + 1;
  return { ...game, step, won: step === game.route.length };
}

export function knownTrickCount(pet: PetRecord): number {
  return TRICKS.filter((trick) => pet.tricks.includes(trick.id)).length;
}

const cosmeticKeys = ["name", "species", "color", "accessory", "personality"] as const;
export function hasPetEdits(draft: PetRecord, saved?: PetRecord | null): boolean {
  return !saved || cosmeticKeys.some((key) => draft[key] !== saved[key]);
}

/** Save only appearance fields onto the latest record, never stale bond or tricks. */
export function savePetStyle(profile: LocalProfile, draft: PetRecord, wasSaved: boolean): LocalProfile | null {
  const saved = profile.pets.find((pet) => pet.id === draft.id);
  if ((wasSaved && !saved) || (!saved && profile.pets.length >= PET_LIMIT)) return null;
  const pet: PetRecord = {
    ...(saved ?? { ...draft, bond: 1, tricks: [] }),
    name: draft.name.trim().slice(0, 32) || (profile.language === "es-MX" ? "Mascota" : "Pet"),
    species: draft.species, color: draft.color, accessory: draft.accessory, personality: draft.personality,
    tricks: [...(saved?.tricks ?? [])],
  };
  return {
    ...profile,
    pets: saved ? profile.pets.map((item) => item.id === pet.id ? pet : item) : [...profile.pets, pet],
    activePetId: pet.id,
    stars: profile.stars + (saved ? 0 : 2),
  };
}

export function addPetBond(profile: LocalProfile, petId: string, amount: number): LocalProfile | null {
  const pet = profile.pets.find((item) => item.id === petId);
  if (!pet || !Number.isFinite(amount) || amount < 0) return null;
  const next = { ...pet, bond: Math.min(100, Math.max(0, pet.bond) + Math.min(4, Math.floor(amount))) };
  return { ...profile, pets: profile.pets.map((item) => item.id === petId ? next : item) };
}

/** Keep the established 1/3/5-trick rewards. Replays give bond, never more stars. */
export function finishPetTraining(profile: LocalProfile, petId: string, trickId: TrickId): LocalProfile | null {
  const pet = profile.pets.find((item) => item.id === petId);
  if (!pet || !TRICKS.some((trick) => trick.id === trickId)) return null;
  if (pet.tricks.includes(trickId)) return addPetBond(profile, petId, 2);
  const nextPet = { ...pet, tricks: [...new Set([...pet.tricks, trickId])], bond: Math.min(100, pet.bond + 12) };
  let next: LocalProfile = {
    ...profile, pets: profile.pets.map((item) => item.id === petId ? nextPet : item), activePetId: petId,
  };
  const before = knownTrickCount(pet), after = knownTrickCount(nextPet);
  for (const count of [1, 3, 5] as const) {
    if (before < count && after >= count) {
      next = completeOnce(next, petTrickMission(petId, count), count === 1 ? 1 : count === 3 ? 2 : 3).profile;
    }
  }
  return next;
}

export function bondLabel(bond: number, language: Language): string {
  const labels = bond >= 100 ? ["Best friends", "Mejores amigos"]
    : bond >= 75 ? ["A wonderful team", "Un gran equipo"]
    : bond >= 50 ? ["Trusted friend", "Amistad de confianza"]
    : bond >= 25 ? ["Adventure buddies", "Compañeros de aventura"]
    : ["A new friendship", "Una nueva amistad"];
  return labels[language === "es-MX" ? 1 : 0];
}

export function personalityGreeting(personality: string, language: Language): string {
  const lines: Record<string, [string, string]> = {
    Playful: ["Ready for a little playtime?", "¿Jugamos un ratito?"],
    Brave: ["Every adventure is better together!", "¡Toda aventura es mejor en equipo!"],
    Gentle: ["A little kindness makes a big difference.", "Un poquito de cariño hace la diferencia."],
    Curious: ["What shall we discover together?", "¿Qué vamos a descubrir juntos?"],
    Silly: ["Beep boop… did somebody say dance?", "Bip, bop… ¿alguien dijo baile?"],
    Wise: ["Take your time. We are learning together.", "Sin prisa. Aprendemos juntos."],
  };
  return (lines[personality] ?? lines.Playful)[language === "es-MX" ? 1 : 0];
}
