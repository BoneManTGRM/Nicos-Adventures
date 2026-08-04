import type { NicoProfessionId } from "../types";

export type ProfessionVisual = {
  emoji: string;
  head?: string;
  prop?: string;
  badge?: string;
  tint: string;
  signature: string;
};

export const PROFESSION_VISUALS: Record<NicoProfessionId, ProfessionVisual> = {
  explorer: { emoji: "🧭", head: "🧢", prop: "🔎", badge: "🌿", tint: "#65a30d", signature: "explorer-cap-magnifier" },
  astronaut: { emoji: "🚀", head: "🪐", prop: "🧑‍🚀", badge: "⭐", tint: "#2563eb", signature: "astronaut-planet-helmet" },
  doctor: { emoji: "🩺", head: "🥼", prop: "🩺", badge: "➕", tint: "#0d9488", signature: "doctor-coat-stethoscope" },
  scientist: { emoji: "🔬", head: "🥽", prop: "⚗️", badge: "🧪", tint: "#0284c7", signature: "scientist-goggles-flask" },
  engineer: { emoji: "⚙️", head: "⛑️", prop: "🔧", badge: "⚙️", tint: "#ea580c", signature: "engineer-helmet-wrench" },
  builder: { emoji: "🛠️", head: "👷", prop: "📐", badge: "🔨", tint: "#d97706", signature: "builder-hardhat-blueprint" },
  veterinarian: { emoji: "🐾", head: "🥼", prop: "🐶", badge: "🐾", tint: "#0f766e", signature: "vet-coat-puppy" },
  dinosaur: { emoji: "🦖", head: "🤠", prop: "🦴", badge: "🌋", tint: "#4d7c0f", signature: "dino-hat-fossil" },
  suit: { emoji: "👔", head: "🎓", prop: "📋", badge: "🏛️", tint: "#1e3a8a", signature: "leader-tie-clipboard" },
  firefighter: { emoji: "🚒", head: "🧑‍🚒", prop: "🧯", badge: "🔥", tint: "#dc2626", signature: "fire-helmet-extinguisher" },
  chef: { emoji: "👨‍🍳", head: "👨‍🍳", prop: "🥄", badge: "🍳", tint: "#16a34a", signature: "chef-hat-spoon" },
  artist: { emoji: "🎨", head: "🧑‍🎨", prop: "🖌️", badge: "🌈", tint: "#9333ea", signature: "artist-beret-brush" },
  pilot: { emoji: "✈️", head: "🧑‍✈️", prop: "🧭", badge: "🛩️", tint: "#1d4ed8", signature: "pilot-cap-wings" },
  gardener: { emoji: "🌱", head: "👒", prop: "🪴", badge: "🌻", tint: "#15803d", signature: "gardener-hat-plant" },
  teacher: { emoji: "📚", head: "🎓", prop: "✏️", badge: "ABC", tint: "#7c3aed", signature: "teacher-pencil-books" },
  dentist: { emoji: "🦷", head: "🥼", prop: "🪥", badge: "✨", tint: "#0891b2", signature: "dentist-coat-toothbrush" },
  "police-officer": { emoji: "👮", head: "👮", prop: "📻", badge: "⭐", tint: "#1e40af", signature: "police-cap-radio" },
  zookeeper: { emoji: "🦒", head: "🧢", prop: "🦒", badge: "🐾", tint: "#a16207", signature: "zookeeper-cap-giraffe" },
  musician: { emoji: "🎵", head: "🎧", prop: "🎸", badge: "♫", tint: "#db2777", signature: "musician-headphones-guitar" },
  farmer: { emoji: "🌾", head: "🤠", prop: "🚜", badge: "🌽", tint: "#a16207", signature: "farmer-hat-tractor" },
  lifeguard: { emoji: "🛟", head: "🧢", prop: "🛟", badge: "🌊", tint: "#e11d48", signature: "lifeguard-cap-ring" },
  magician: { emoji: "🪄", head: "🎩", prop: "🪄", badge: "✨", tint: "#6d28d9", signature: "magician-hat-wand" },
  "soccer-player": { emoji: "⚽", head: "🏅", prop: "⚽", badge: "🥅", tint: "#16a34a", signature: "soccer-medal-ball" },
  "tennis-player": { emoji: "🎾", head: "🧢", prop: "🎾", badge: "🏆", tint: "#65a30d", signature: "tennis-cap-racket" },
  detective: { emoji: "🕵️", head: "🕵️", prop: "🔎", badge: "🧩", tint: "#475569", signature: "detective-hat-magnifier" },
  librarian: { emoji: "🔖", head: "👓", prop: "📚", badge: "🔖", tint: "#7c2d12", signature: "librarian-glasses-books" },
};

export function professionVisual(id: NicoProfessionId): ProfessionVisual {
  return PROFESSION_VISUALS[id];
}
