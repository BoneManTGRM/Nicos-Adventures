import type { LocalizedText, NicoProfessionId, NicoWardrobe, WardrobeSlot } from "../../types";

export type WardrobeVariant =
  | "glasses" | "goggles" | "mask"
  | "cap" | "helmet" | "scrub-cap" | "hardhat" | "safari" | "fire-helmet" | "chef-hat"
  | "beret" | "pilot-cap" | "sun-hat" | "police-cap" | "headphones" | "straw-hat"
  | "top-hat" | "headband" | "visor" | "fedora"
  | "polo" | "shirt" | "scrubs" | "work-shirt" | "jersey"
  | "vest" | "spacesuit" | "coat" | "safety-vest" | "blazer" | "fire-coat"
  | "apron" | "jacket" | "overalls" | "cardigan" | "police-vest" | "cape" | "trench"
  | "shorts" | "pants" | "cargo" | "fire-pants" | "sport-shorts"
  | "sneakers" | "boots" | "moon-boots" | "dress-shoes" | "sandals" | "cleats"
  | "pack" | "life-pack" | "tool-pack" | "tank" | "duffel"
  | "badge" | "prop";

export type WardrobeItem = {
  id: string;
  slot: WardrobeSlot;
  variant: WardrobeVariant;
  name: LocalizedText;
  primary: string;
  secondary: string;
  accent: string;
  symbol?: string;
};

const t = (en: string, es: string): LocalizedText => ({ en, "es-MX": es });
const item = (
  id: string,
  slot: WardrobeSlot,
  variant: WardrobeVariant,
  en: string,
  es: string,
  primary: string,
  secondary = "#ffffff",
  accent = "#111827",
  symbol?: string,
): WardrobeItem => ({ id, slot, variant, name: t(en, es), primary, secondary, accent, symbol });

export const WARDROBE_ITEMS: WardrobeItem[] = [
  item("nico-red-glasses", "eyewear", "glasses", "Red adventure glasses", "Lentes rojos de aventura", "#dc2626", "#111827", "#fef3c7"),
  item("science-goggles", "eyewear", "goggles", "Science goggles", "Gafas de ciencia", "#dbeafe", "#64748b", "#22d3ee"),
  item("round-reading-glasses", "eyewear", "glasses", "Round reading glasses", "Lentes redondos de lectura", "#7c2d12", "#fef3c7", "#111827"),
  item("medical-mask", "eyewear", "mask", "Medical mask", "Cubrebocas médico", "#bfdbfe", "#ffffff", "#0f766e"),

  item("explorer-cap", "headwear", "cap", "Explorer cap", "Gorra de explorador", "#2563eb", "#60a5fa", "#facc15"),
  item("astronaut-helmet", "headwear", "helmet", "Astronaut helmet", "Casco de astronauta", "#f8fafc", "#cbd5e1", "#2563eb"),
  item("scrub-cap", "headwear", "scrub-cap", "Scrub cap", "Gorro quirúrgico", "#0d9488", "#99f6e4", "#134e4a"),
  item("orange-hardhat", "headwear", "hardhat", "Orange hardhat", "Casco naranja", "#f97316", "#fdba74", "#7c2d12"),
  item("yellow-hardhat", "headwear", "hardhat", "Yellow hardhat", "Casco amarillo", "#facc15", "#fef08a", "#854d0e"),
  item("safari-hat", "headwear", "safari", "Safari hat", "Sombrero de safari", "#a16207", "#fef3c7", "#713f12"),
  item("firefighter-helmet", "headwear", "fire-helmet", "Firefighter helmet", "Casco de bombero", "#dc2626", "#f97316", "#facc15"),
  item("chef-hat", "headwear", "chef-hat", "Chef hat", "Gorro de chef", "#ffffff", "#e2e8f0", "#16a34a"),
  item("artist-beret", "headwear", "beret", "Artist beret", "Boina de artista", "#111827", "#475569", "#ec4899"),
  item("pilot-cap", "headwear", "pilot-cap", "Pilot cap", "Gorra de piloto", "#0f172a", "#1e3a8a", "#facc15"),
  item("garden-sun-hat", "headwear", "sun-hat", "Garden sun hat", "Sombrero de jardín", "#65a30d", "#bef264", "#3f6212"),
  item("police-cap", "headwear", "police-cap", "Community officer cap", "Gorra de oficial comunitario", "#1e3a8a", "#60a5fa", "#facc15"),
  item("music-headphones", "headwear", "headphones", "Music headphones", "Audífonos musicales", "#db2777", "#f9a8d4", "#7e22ce"),
  item("farmer-straw-hat", "headwear", "straw-hat", "Farmer straw hat", "Sombrero de paja", "#d97706", "#fde68a", "#78350f"),
  item("lifeguard-cap", "headwear", "cap", "Lifeguard cap", "Gorra de salvavidas", "#ef4444", "#ffffff", "#0ea5e9"),
  item("magician-top-hat", "headwear", "top-hat", "Magician top hat", "Sombrero de mago", "#111827", "#6d28d9", "#facc15"),
  item("soccer-headband", "headwear", "headband", "Soccer headband", "Banda de fútbol", "#16a34a", "#ffffff", "#facc15"),
  item("tennis-visor", "headwear", "visor", "Tennis visor", "Visera de tenis", "#ffffff", "#84cc16", "#1f2937"),
  item("detective-fedora", "headwear", "fedora", "Detective fedora", "Sombrero de detective", "#57534e", "#a8a29e", "#292524"),

  item("nico-green-polo", "top", "polo", "Nico's green polo", "Polo verde de Nico", "#f8fafc", "#16a34a", "#166534"),
  item("space-top", "top", "shirt", "Space suit top", "Parte superior espacial", "#f8fafc", "#dbeafe", "#2563eb"),
  item("teal-scrubs", "top", "scrubs", "Teal scrubs", "Uniforme médico turquesa", "#0d9488", "#5eead4", "#134e4a"),
  item("science-shirt", "top", "shirt", "Science shirt", "Camisa científica", "#f8fafc", "#0ea5e9", "#1e3a8a"),
  item("orange-work-shirt", "top", "work-shirt", "Engineering work shirt", "Camisa de ingeniería", "#1f2937", "#f97316", "#facc15"),
  item("yellow-work-shirt", "top", "work-shirt", "Builder work shirt", "Camisa de constructor", "#374151", "#facc15", "#f97316"),
  item("vet-scrubs", "top", "scrubs", "Veterinary scrubs", "Uniforme veterinario", "#0f766e", "#5eead4", "#ffffff"),
  item("explorer-shirt", "top", "shirt", "Explorer shirt", "Camisa de explorador", "#fef3c7", "#84cc16", "#365314"),
  item("leader-shirt", "top", "shirt", "Young leader shirt", "Camisa de líder joven", "#f8fafc", "#1e3a8a", "#facc15"),
  item("fire-shirt", "top", "work-shirt", "Fire station shirt", "Camisa de estación de bomberos", "#111827", "#dc2626", "#facc15"),
  item("chef-shirt", "top", "shirt", "Chef jacket shirt", "Camisa de chef", "#ffffff", "#16a34a", "#166534"),
  item("artist-shirt", "top", "shirt", "Artist shirt", "Camisa de artista", "#f8fafc", "#ec4899", "#7e22ce"),
  item("pilot-shirt", "top", "shirt", "Pilot shirt", "Camisa de piloto", "#ffffff", "#1e3a8a", "#facc15"),
  item("garden-shirt", "top", "shirt", "Garden shirt", "Camisa de jardín", "#ecfccb", "#16a34a", "#365314"),
  item("teacher-shirt", "top", "shirt", "Teacher shirt", "Camisa de maestro", "#f8fafc", "#7c3aed", "#facc15"),
  item("dentist-scrubs", "top", "scrubs", "Dental scrubs", "Uniforme dental", "#0891b2", "#cffafe", "#0e7490"),
  item("police-shirt", "top", "work-shirt", "Community safety shirt", "Camisa de seguridad comunitaria", "#1e3a8a", "#93c5fd", "#facc15"),
  item("zoo-shirt", "top", "shirt", "Zookeeper shirt", "Camisa de cuidador de zoológico", "#fef3c7", "#a16207", "#365314"),
  item("music-shirt", "top", "shirt", "Music stage shirt", "Camisa de escenario musical", "#111827", "#db2777", "#22d3ee"),
  item("farmer-shirt", "top", "work-shirt", "Farmer plaid shirt", "Camisa de granjero", "#b91c1c", "#fef3c7", "#166534"),
  item("lifeguard-shirt", "top", "jersey", "Lifeguard shirt", "Camisa de salvavidas", "#ef4444", "#ffffff", "#0ea5e9"),
  item("magician-shirt", "top", "shirt", "Magician formal shirt", "Camisa formal de mago", "#f8fafc", "#6d28d9", "#facc15"),
  item("soccer-jersey", "top", "jersey", "Soccer jersey", "Jersey de fútbol", "#16a34a", "#ffffff", "#facc15"),
  item("tennis-polo", "top", "polo", "Tennis polo", "Polo de tenis", "#ffffff", "#84cc16", "#1f2937"),
  item("detective-shirt", "top", "shirt", "Detective shirt", "Camisa de detective", "#f5f5f4", "#57534e", "#7c2d12"),
  item("librarian-shirt", "top", "shirt", "Librarian shirt", "Camisa de bibliotecario", "#fef3c7", "#7c2d12", "#1f2937"),

  item("explorer-vest", "outerwear", "vest", "Explorer vest", "Chaleco de explorador", "#65a30d", "#a3e635", "#365314"),
  item("spacesuit-shell", "outerwear", "spacesuit", "Space suit shell", "Traje espacial", "#f8fafc", "#cbd5e1", "#2563eb"),
  item("lab-coat", "outerwear", "coat", "Laboratory coat", "Bata de laboratorio", "#ffffff", "#dbeafe", "#0ea5e9"),
  item("orange-safety-vest", "outerwear", "safety-vest", "Orange safety vest", "Chaleco de seguridad naranja", "#f97316", "#facc15", "#111827"),
  item("yellow-safety-vest", "outerwear", "safety-vest", "Yellow safety vest", "Chaleco de seguridad amarillo", "#facc15", "#f97316", "#111827"),
  item("vet-coat", "outerwear", "coat", "Veterinary coat", "Bata veterinaria", "#ffffff", "#ccfbf1", "#0f766e"),
  item("dino-vest", "outerwear", "vest", "Dinosaur explorer vest", "Chaleco de explorador de dinosaurios", "#4d7c0f", "#bef264", "#713f12"),
  item("navy-blazer", "outerwear", "blazer", "Young leader blazer", "Saco de líder joven", "#1e3a8a", "#60a5fa", "#facc15"),
  item("fire-coat", "outerwear", "fire-coat", "Firefighter coat", "Chaqueta de bombero", "#111827", "#dc2626", "#facc15"),
  item("chef-apron", "outerwear", "apron", "Chef apron", "Mandil de chef", "#16a34a", "#ffffff", "#166534"),
  item("artist-apron", "outerwear", "apron", "Paint-splash apron", "Mandil con pintura", "#111827", "#ec4899", "#22d3ee"),
  item("pilot-jacket", "outerwear", "jacket", "Pilot jacket", "Chaqueta de piloto", "#f8fafc", "#1e3a8a", "#facc15"),
  item("green-overalls", "outerwear", "overalls", "Garden overalls", "Overol de jardín", "#15803d", "#4ade80", "#365314"),
  item("teacher-cardigan", "outerwear", "cardigan", "Teacher cardigan", "Cárdigan de maestro", "#7c3aed", "#c4b5fd", "#facc15"),
  item("dentist-coat", "outerwear", "coat", "Dental coat", "Bata dental", "#ffffff", "#cffafe", "#0891b2"),
  item("police-vest", "outerwear", "police-vest", "Community officer vest", "Chaleco de oficial comunitario", "#1e40af", "#60a5fa", "#facc15"),
  item("zoo-vest", "outerwear", "vest", "Zookeeper vest", "Chaleco de cuidador de zoológico", "#a16207", "#fde68a", "#365314"),
  item("music-jacket", "outerwear", "jacket", "Music jacket", "Chaqueta musical", "#7e22ce", "#db2777", "#22d3ee"),
  item("denim-overalls", "outerwear", "overalls", "Farmer overalls", "Overol de granjero", "#1d4ed8", "#60a5fa", "#78350f"),
  item("red-rescue-vest", "outerwear", "vest", "Rescue vest", "Chaleco de rescate", "#ef4444", "#ffffff", "#0ea5e9"),
  item("magician-cape", "outerwear", "cape", "Magician cape", "Capa de mago", "#6d28d9", "#111827", "#facc15"),
  item("detective-trench", "outerwear", "trench", "Detective trench coat", "Gabardina de detective", "#a16207", "#fde68a", "#57534e"),
  item("librarian-cardigan", "outerwear", "cardigan", "Librarian cardigan", "Cárdigan de bibliotecario", "#7c2d12", "#fecaca", "#facc15"),

  item("nico-khaki-shorts", "bottoms", "shorts", "Khaki shorts", "Shorts caqui", "#b45309", "#fde68a", "#78350f"),
  item("space-pants", "bottoms", "pants", "Space pants", "Pantalón espacial", "#f8fafc", "#cbd5e1", "#2563eb"),
  item("teal-pants", "bottoms", "pants", "Teal scrub pants", "Pantalón médico turquesa", "#0d9488", "#5eead4", "#134e4a"),
  item("dark-pants", "bottoms", "pants", "Dark pants", "Pantalón oscuro", "#1f2937", "#475569", "#111827"),
  item("cargo-pants", "bottoms", "cargo", "Cargo pants", "Pantalón cargo", "#57534e", "#a8a29e", "#292524"),
  item("navy-pants", "bottoms", "pants", "Navy pants", "Pantalón azul marino", "#1e3a8a", "#3b82f6", "#0f172a"),
  item("fire-pants", "bottoms", "fire-pants", "Firefighter pants", "Pantalón de bombero", "#111827", "#dc2626", "#facc15"),
  item("black-pants", "bottoms", "pants", "Black pants", "Pantalón negro", "#111827", "#374151", "#020617"),
  item("artist-pants", "bottoms", "pants", "Artist pants", "Pantalón de artista", "#374151", "#ec4899", "#22d3ee"),
  item("garden-pants", "bottoms", "cargo", "Garden pants", "Pantalón de jardín", "#166534", "#4ade80", "#365314"),
  item("denim-pants", "bottoms", "pants", "Denim pants", "Pantalón de mezclilla", "#1d4ed8", "#60a5fa", "#1e3a8a"),
  item("rescue-shorts", "bottoms", "sport-shorts", "Rescue shorts", "Shorts de rescate", "#ef4444", "#ffffff", "#0ea5e9"),
  item("soccer-shorts", "bottoms", "sport-shorts", "Soccer shorts", "Shorts de fútbol", "#16a34a", "#ffffff", "#facc15"),
  item("tennis-shorts", "bottoms", "sport-shorts", "Tennis shorts", "Shorts de tenis", "#ffffff", "#84cc16", "#1f2937"),
  item("tan-pants", "bottoms", "pants", "Tan pants", "Pantalón café claro", "#a16207", "#fde68a", "#713f12"),
  item("brown-pants", "bottoms", "pants", "Brown pants", "Pantalón café", "#78350f", "#d97706", "#451a03"),

  item("nico-green-sneakers", "shoes", "sneakers", "Green sneakers", "Tenis verdes", "#16a34a", "#ffffff", "#166534"),
  item("moon-boots", "shoes", "moon-boots", "Moon boots", "Botas lunares", "#f8fafc", "#cbd5e1", "#2563eb"),
  item("white-sneakers", "shoes", "sneakers", "White sneakers", "Tenis blancos", "#ffffff", "#dbeafe", "#0f766e"),
  item("work-boots", "shoes", "boots", "Work boots", "Botas de trabajo", "#78350f", "#d97706", "#451a03"),
  item("fire-boots", "shoes", "boots", "Firefighter boots", "Botas de bombero", "#111827", "#facc15", "#dc2626"),
  item("black-dress-shoes", "shoes", "dress-shoes", "Black dress shoes", "Zapatos negros", "#111827", "#475569", "#020617"),
  item("artist-sneakers", "shoes", "sneakers", "Painted sneakers", "Tenis pintados", "#ffffff", "#ec4899", "#22d3ee"),
  item("garden-boots", "shoes", "boots", "Garden boots", "Botas de jardín", "#15803d", "#4ade80", "#365314"),
  item("police-boots", "shoes", "boots", "Community safety boots", "Botas de seguridad comunitaria", "#111827", "#1e40af", "#facc15"),
  item("casual-shoes", "shoes", "sneakers", "Casual shoes", "Zapatos casuales", "#7c2d12", "#fef3c7", "#111827"),
  item("sandals", "shoes", "sandals", "Beach sandals", "Sandalias de playa", "#0ea5e9", "#ffffff", "#ef4444"),
  item("soccer-cleats", "shoes", "cleats", "Soccer cleats", "Tacos de fútbol", "#111827", "#16a34a", "#facc15"),
  item("tennis-shoes", "shoes", "sneakers", "Tennis shoes", "Tenis para cancha", "#ffffff", "#84cc16", "#1f2937"),
  item("detective-shoes", "shoes", "dress-shoes", "Detective shoes", "Zapatos de detective", "#57534e", "#a8a29e", "#292524"),

  item("explorer-pack", "backpack", "pack", "Explorer backpack", "Mochila de explorador", "#78350f", "#65a30d", "#facc15"),
  item("life-support-pack", "backpack", "life-pack", "Life-support pack", "Mochila de soporte vital", "#cbd5e1", "#2563eb", "#facc15"),
  item("tool-pack", "backpack", "tool-pack", "Tool backpack", "Mochila de herramientas", "#57534e", "#f97316", "#facc15"),
  item("vet-pack", "backpack", "pack", "Veterinary kit", "Mochila veterinaria", "#0f766e", "#ccfbf1", "#ffffff"),
  item("fire-tank", "backpack", "tank", "Fire-rescue tank", "Tanque de rescate", "#dc2626", "#111827", "#facc15"),
  item("art-pack", "backpack", "pack", "Art supply pack", "Mochila de arte", "#7e22ce", "#ec4899", "#22d3ee"),
  item("garden-pack", "backpack", "pack", "Garden tool pack", "Mochila de jardinería", "#166534", "#84cc16", "#facc15"),
  item("music-pack", "backpack", "duffel", "Music gear bag", "Bolsa de música", "#111827", "#db2777", "#22d3ee"),
  item("rescue-pack", "backpack", "duffel", "Rescue pack", "Mochila de rescate", "#ef4444", "#0ea5e9", "#ffffff"),
  item("sports-bag", "backpack", "duffel", "Sports bag", "Bolsa deportiva", "#16a34a", "#ffffff", "#facc15"),
  item("detective-pack", "backpack", "pack", "Clue kit", "Mochila de pistas", "#57534e", "#a16207", "#fef3c7"),

  ...[
    ["nico-world-leaf", "Nico's World badge", "Insignia del Mundo de Nico", "#16a34a", "🌿"],
    ["space-badge", "Space badge", "Insignia espacial", "#2563eb", "★"],
    ["medical-badge", "Medical helper badge", "Insignia médica", "#0d9488", "+"],
    ["science-badge", "Science badge", "Insignia científica", "#0284c7", "⚛"],
    ["gear-badge", "Engineering badge", "Insignia de ingeniería", "#f97316", "⚙"],
    ["builder-badge", "Builder badge", "Insignia de constructor", "#facc15", "⌂"],
    ["paw-badge", "Animal care badge", "Insignia de animales", "#0f766e", "♥"],
    ["fossil-badge", "Fossil badge", "Insignia de fósil", "#65a30d", "◆"],
    ["leader-badge", "Young leader badge", "Insignia de líder", "#1e3a8a", "★"],
    ["fire-badge", "Fire safety badge", "Insignia de seguridad", "#dc2626", "✦"],
    ["chef-badge", "Chef badge", "Insignia de chef", "#16a34a", "♨"],
    ["art-badge", "Artist badge", "Insignia de artista", "#9333ea", "✿"],
    ["wings-badge", "Pilot wings", "Alas de piloto", "#1d4ed8", "✈"],
    ["plant-badge", "Gardener badge", "Insignia de jardinero", "#15803d", "♧"],
    ["teacher-badge", "Teacher badge", "Insignia de maestro", "#7c3aed", "A"],
    ["tooth-badge", "Dental badge", "Insignia dental", "#0891b2", "◇"],
    ["police-badge", "Community safety badge", "Insignia comunitaria", "#1e40af", "★"],
    ["zoo-badge", "Zookeeper badge", "Insignia de zoológico", "#a16207", "●"],
    ["music-badge", "Music badge", "Insignia musical", "#db2777", "♫"],
    ["farm-badge", "Farm badge", "Insignia de granja", "#a16207", "♨"],
    ["rescue-badge", "Rescue badge", "Insignia de rescate", "#e11d48", "✚"],
    ["magic-badge", "Magic badge", "Insignia mágica", "#6d28d9", "✦"],
    ["soccer-badge", "Soccer badge", "Insignia de fútbol", "#16a34a", "●"],
    ["tennis-badge", "Tennis badge", "Insignia de tenis", "#65a30d", "●"],
    ["detective-badge", "Detective badge", "Insignia de detective", "#475569", "?"],
    ["book-badge", "Library badge", "Insignia de biblioteca", "#7c2d12", "B"],
  ].map(([id, en, es, primary, symbol]) => item(id, "badge", "badge", en, es, primary, "#ffffff", "#111827", symbol)),

  ...[
    ["compass-prop", "Compass", "Brújula", "#65a30d", "🧭"],
    ["rocket-prop", "Rocket model", "Modelo de cohete", "#2563eb", "🚀"],
    ["stethoscope-prop", "Stethoscope", "Estetoscopio", "#0d9488", "🩺"],
    ["flask-prop", "Science flask", "Matraz científico", "#0284c7", "⚗"],
    ["blueprint-prop", "Blueprint", "Plano", "#f97316", "▤"],
    ["hammer-prop", "Builder hammer", "Martillo", "#facc15", "🔨"],
    ["puppy-prop", "Puppy friend", "Cachorro", "#0f766e", "🐶"],
    ["fossil-prop", "Fossil", "Fósil", "#65a30d", "🦴"],
    ["clipboard-prop", "Mission clipboard", "Portapapeles", "#1e3a8a", "▣"],
    ["hose-prop", "Fire hose", "Manguera", "#dc2626", "〰"],
    ["spoon-prop", "Wooden spoon", "Cuchara", "#16a34a", "🥄"],
    ["palette-prop", "Paint palette", "Paleta de pintura", "#9333ea", "🎨"],
    ["plane-prop", "Model airplane", "Avión de juguete", "#1d4ed8", "✈"],
    ["watering-can-prop", "Watering can", "Regadera", "#15803d", "♨"],
    ["book-prop", "Adventure book", "Libro de aventuras", "#7c3aed", "📖"],
    ["toothbrush-prop", "Toothbrush", "Cepillo dental", "#0891b2", "▰"],
    ["radio-prop", "Safety radio", "Radio", "#1e40af", "▥"],
    ["feed-bucket-prop", "Animal feed bucket", "Cubeta de alimento", "#a16207", "▱"],
    ["guitar-prop", "Guitar", "Guitarra", "#db2777", "♫"],
    ["basket-prop", "Harvest basket", "Canasta", "#a16207", "▤"],
    ["rescue-ring-prop", "Rescue ring", "Salvavidas", "#e11d48", "◯"],
    ["wand-prop", "Magic wand", "Varita mágica", "#6d28d9", "✦"],
    ["soccer-ball-prop", "Soccer ball", "Balón de fútbol", "#16a34a", "⚽"],
    ["racket-prop", "Tennis racket", "Raqueta", "#65a30d", "🎾"],
    ["magnifier-prop", "Magnifying glass", "Lupa", "#475569", "⌕"],
  ].map(([id, en, es, primary, symbol]) => item(id, "prop", "prop", en, es, primary, "#ffffff", "#111827", symbol)),
];

export const WARDROBE_ITEM_BY_ID = new Map(WARDROBE_ITEMS.map((entry) => [entry.id, entry]));

const base = (accentColor = "#22c55e"): NicoWardrobe => ({
  presetId: null,
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

const preset = (
  id: NicoProfessionId,
  accentColor: string,
  pieces: Partial<Record<WardrobeSlot, string | null>>,
): NicoWardrobe => ({ ...base(accentColor), ...pieces, presetId: id, accentColor });

export const PROFESSION_WARDROBE_PRESETS: Record<NicoProfessionId, NicoWardrobe> = {
  explorer: preset("explorer", "#65a30d", { headwear: "explorer-cap", top: "explorer-shirt", outerwear: "explorer-vest", bottoms: "nico-khaki-shorts", shoes: "work-boots", backpack: "explorer-pack", badge: "nico-world-leaf", prop: "compass-prop" }),
  astronaut: preset("astronaut", "#2563eb", { headwear: "astronaut-helmet", eyewear: null, top: "space-top", outerwear: "spacesuit-shell", bottoms: "space-pants", shoes: "moon-boots", backpack: "life-support-pack", badge: "space-badge", prop: "rocket-prop" }),
  doctor: preset("doctor", "#0d9488", { headwear: "scrub-cap", top: "teal-scrubs", outerwear: "lab-coat", bottoms: "teal-pants", shoes: "white-sneakers", badge: "medical-badge", prop: "stethoscope-prop" }),
  scientist: preset("scientist", "#0284c7", { eyewear: "science-goggles", top: "science-shirt", outerwear: "lab-coat", bottoms: "dark-pants", shoes: "white-sneakers", badge: "science-badge", prop: "flask-prop" }),
  engineer: preset("engineer", "#f97316", { headwear: "orange-hardhat", top: "orange-work-shirt", outerwear: "orange-safety-vest", bottoms: "cargo-pants", shoes: "work-boots", backpack: "tool-pack", badge: "gear-badge", prop: "blueprint-prop" }),
  builder: preset("builder", "#facc15", { headwear: "yellow-hardhat", top: "yellow-work-shirt", outerwear: "yellow-safety-vest", bottoms: "cargo-pants", shoes: "work-boots", backpack: "tool-pack", badge: "builder-badge", prop: "hammer-prop" }),
  veterinarian: preset("veterinarian", "#0f766e", { headwear: "scrub-cap", top: "vet-scrubs", outerwear: "vet-coat", bottoms: "teal-pants", shoes: "white-sneakers", backpack: "vet-pack", badge: "paw-badge", prop: "puppy-prop" }),
  dinosaur: preset("dinosaur", "#4d7c0f", { headwear: "safari-hat", top: "explorer-shirt", outerwear: "dino-vest", bottoms: "nico-khaki-shorts", shoes: "work-boots", backpack: "explorer-pack", badge: "fossil-badge", prop: "fossil-prop" }),
  suit: preset("suit", "#1e3a8a", { top: "leader-shirt", outerwear: "navy-blazer", bottoms: "tan-pants", shoes: "black-dress-shoes", badge: "leader-badge", prop: "clipboard-prop" }),
  firefighter: preset("firefighter", "#dc2626", { headwear: "firefighter-helmet", top: "fire-shirt", outerwear: "fire-coat", bottoms: "fire-pants", shoes: "fire-boots", backpack: "fire-tank", badge: "fire-badge", prop: "hose-prop" }),
  chef: preset("chef", "#16a34a", { headwear: "chef-hat", top: "chef-shirt", outerwear: "chef-apron", bottoms: "black-pants", shoes: "white-sneakers", badge: "chef-badge", prop: "spoon-prop" }),
  artist: preset("artist", "#9333ea", { headwear: "artist-beret", top: "artist-shirt", outerwear: "artist-apron", bottoms: "artist-pants", shoes: "artist-sneakers", backpack: "art-pack", badge: "art-badge", prop: "palette-prop" }),
  pilot: preset("pilot", "#1d4ed8", { headwear: "pilot-cap", top: "pilot-shirt", outerwear: "pilot-jacket", bottoms: "navy-pants", shoes: "black-dress-shoes", badge: "wings-badge", prop: "plane-prop" }),
  gardener: preset("gardener", "#15803d", { headwear: "garden-sun-hat", top: "garden-shirt", outerwear: "green-overalls", bottoms: "garden-pants", shoes: "garden-boots", backpack: "garden-pack", badge: "plant-badge", prop: "watering-can-prop" }),
  teacher: preset("teacher", "#7c3aed", { eyewear: "round-reading-glasses", top: "teacher-shirt", outerwear: "teacher-cardigan", bottoms: "tan-pants", shoes: "casual-shoes", badge: "teacher-badge", prop: "book-prop" }),
  dentist: preset("dentist", "#0891b2", { headwear: "scrub-cap", eyewear: "medical-mask", top: "dentist-scrubs", outerwear: "dentist-coat", bottoms: "teal-pants", shoes: "white-sneakers", badge: "tooth-badge", prop: "toothbrush-prop" }),
  "police-officer": preset("police-officer", "#1e40af", { headwear: "police-cap", top: "police-shirt", outerwear: "police-vest", bottoms: "navy-pants", shoes: "police-boots", badge: "police-badge", prop: "radio-prop" }),
  zookeeper: preset("zookeeper", "#a16207", { headwear: "safari-hat", top: "zoo-shirt", outerwear: "zoo-vest", bottoms: "nico-khaki-shorts", shoes: "work-boots", backpack: "explorer-pack", badge: "zoo-badge", prop: "feed-bucket-prop" }),
  musician: preset("musician", "#db2777", { headwear: "music-headphones", top: "music-shirt", outerwear: "music-jacket", bottoms: "denim-pants", shoes: "artist-sneakers", backpack: "music-pack", badge: "music-badge", prop: "guitar-prop" }),
  farmer: preset("farmer", "#a16207", { headwear: "farmer-straw-hat", top: "farmer-shirt", outerwear: "denim-overalls", bottoms: "brown-pants", shoes: "work-boots", badge: "farm-badge", prop: "basket-prop" }),
  lifeguard: preset("lifeguard", "#e11d48", { headwear: "lifeguard-cap", top: "lifeguard-shirt", outerwear: "red-rescue-vest", bottoms: "rescue-shorts", shoes: "sandals", backpack: "rescue-pack", badge: "rescue-badge", prop: "rescue-ring-prop" }),
  magician: preset("magician", "#6d28d9", { headwear: "magician-top-hat", top: "magician-shirt", outerwear: "magician-cape", bottoms: "black-pants", shoes: "black-dress-shoes", badge: "magic-badge", prop: "wand-prop" }),
  "soccer-player": preset("soccer-player", "#16a34a", { headwear: "soccer-headband", top: "soccer-jersey", bottoms: "soccer-shorts", shoes: "soccer-cleats", backpack: "sports-bag", badge: "soccer-badge", prop: "soccer-ball-prop" }),
  "tennis-player": preset("tennis-player", "#65a30d", { headwear: "tennis-visor", top: "tennis-polo", bottoms: "tennis-shorts", shoes: "tennis-shoes", backpack: "sports-bag", badge: "tennis-badge", prop: "racket-prop" }),
  detective: preset("detective", "#475569", { headwear: "detective-fedora", eyewear: "round-reading-glasses", top: "detective-shirt", outerwear: "detective-trench", bottoms: "brown-pants", shoes: "detective-shoes", backpack: "detective-pack", badge: "detective-badge", prop: "magnifier-prop" }),
  librarian: preset("librarian", "#7c2d12", { eyewear: "round-reading-glasses", top: "librarian-shirt", outerwear: "librarian-cardigan", bottoms: "tan-pants", shoes: "casual-shoes", badge: "book-badge", prop: "book-prop" }),
};

export function wardrobeForPreset(id: NicoProfessionId, accentColor?: string): NicoWardrobe {
  const source = PROFESSION_WARDROBE_PRESETS[id];
  const accent = accentColor ?? source.accentColor;
  return { ...source, accentColor: accent, presetId: id };
}

export function itemsForSlot(slot: WardrobeSlot): WardrobeItem[] {
  return WARDROBE_ITEMS.filter((entry) => entry.slot === slot);
}

export function resolveWardrobeItem(id: string | null | undefined): WardrobeItem | null {
  return id ? WARDROBE_ITEM_BY_ID.get(id) ?? null : null;
}
