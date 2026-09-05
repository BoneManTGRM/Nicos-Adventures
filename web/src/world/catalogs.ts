import type { SectionId } from "../types";
import type { Localized } from "../i18n/core";

export type WorldSection = {
  id: SectionId;
  emoji: string;
  name: Localized;
  description: Localized;
};

export const WORLD_SECTIONS: WorldSection[] = [
  { id: "world-map", emoji: "🌍", name: { en: "World Map", "es-MX": "Mapa del mundo" }, description: { en: "Choose a destination and continue the adventure.", "es-MX": "Elige un destino y continúa la aventura." } },
  { id: "robo-lab", emoji: "🤖", name: { en: "Robo Lab", "es-MX": "Laboratorio robot" }, description: { en: "Meet BoltBot and try six polished robot movements.", "es-MX": "Conoce a BoltBot y prueba seis movimientos de robot mejorados." } },
  { id: "animal-forest", emoji: "🐾", name: { en: "Animal Forest", "es-MX": "Bosque animal" }, description: { en: "Meet 32 premium full-body animals, explore habitats, and bring discoveries into Showtime.", "es-MX": "Conoce 32 animales de cuerpo completo, explora hábitats y lleva tus descubrimientos a Showtime." } },
  { id: "becca-corner", emoji: "🦄", name: { en: "Becca’s Corner", "es-MX": "El Rincón de Becca" }, description: { en: "Create a magical unicorn friend with Becca and bring it to life.", "es-MX": "Crea una amiga unicornio con Becca y dale vida." } },
  { id: "cousins-adventure", emoji: "📖", name: { en: "Cousins’ Adventure Map", "es-MX": "Mapa de Aventuras de los Primos" }, description: { en: "Explore five illustrated worlds with Nico, Becca, and Lua and shape interactive stories.", "es-MX": "Explora cinco mundos ilustrados con Nico, Becca y Lua y crea cuentos interactivos." } },
  { id: "monster-lab", emoji: "👾", name: { en: "Monster Lab", "es-MX": "Laboratorio de monstruos" }, description: { en: "Create detailed layered monsters with powers, movement, and personalities.", "es-MX": "Crea monstruos detallados con poderes, movimientos y personalidades." } },
  { id: "monster-habitats", emoji: "🏕️", name: { en: "Monster Habitats", "es-MX": "Hábitats de monstruos" }, description: { en: "Care for monsters and grow their friendship.", "es-MX": "Cuida a los monstruos y aumenta su amistad." } },
  { id: "art-studio", emoji: "🎨", name: { en: "Art Studio", "es-MX": "Estudio de arte" }, description: { en: "Make posters and decorate Robot Home.", "es-MX": "Crea pósters y decora la Casa Robot." } },
  { id: "story-castle", emoji: "📚", name: { en: "Story Castle", "es-MX": "Castillo de cuentos" }, description: { en: "Create bilingual stories starring saved friends.", "es-MX": "Crea cuentos bilingües con tus amigos guardados." } },
  { id: "game-arcade", emoji: "🕹️", name: { en: "Game Arcade", "es-MX": "Sala de juegos" }, description: { en: "Walk with Nico and friends, explore the island, and play arcade adventures.", "es-MX": "Camina con Nico y sus amigos, explora la isla y juega aventuras." } },
  { id: "dinosaur-valley", emoji: "🦖", name: { en: "Dinosaur Valley", "es-MX": "Valle de dinosaurios" }, description: { en: "Explore, discover dinosaurs, and collect fossils.", "es-MX": "Explora, descubre dinosaurios y colecciona fósiles." } },
  { id: "pet-workshop", emoji: "🐕", name: { en: "Robot Pet Workshop", "es-MX": "Taller de mascotas robot" }, description: { en: "Build pets, train tricks, and grow bonds.", "es-MX": "Construye mascotas, entrena trucos y crea vínculos." } },
  { id: "robot-home", emoji: "🏠", name: { en: "Robot Home", "es-MX": "Casa Robot" }, description: { en: "See robots, pets, artwork, and decorations together.", "es-MX": "Ve robots, mascotas, arte y decoraciones juntos." } },
  { id: "memory-book", emoji: "🏛️", name: { en: "Memory Museum", "es-MX": "Museo de recuerdos" }, description: { en: "Review every saved creation and discovery.", "es-MX": "Revisa cada creación y descubrimiento guardado." } },
  { id: "badge-book", emoji: "🏆", name: { en: "Badge Observatory", "es-MX": "Observatorio de insignias" }, description: { en: "Track stars, levels, badges, and milestones.", "es-MX": "Sigue estrellas, niveles, insignias y logros." } },
  { id: "parent-settings", emoji: "⚙️", name: { en: "Parent & Settings", "es-MX": "Adultos y ajustes" }, description: { en: "Manage language, profiles, backups, and privacy.", "es-MX": "Administra idioma, perfiles, respaldos y privacidad." } },
];

export const ROBOT_OPTIONS: Record<string, string[]> = {
  color: ["Electric Blue", "Crimson Red", "Emerald Green", "Royal Purple", "Solar Orange", "Pearl White", "Midnight Black", "Rose Gold", "Arctic Cyan", "Volcanic Red", "Galaxy Violet", "Jungle Green"],
  secondary_color: ["Sunny Yellow", "Neon Cyan", "Hot Pink", "Silver", "Lime", "Copper", "Pearl White", "Orange", "Electric Purple", "Ice Blue"],
  head: ["Vanguard Crown", "Samurai Helm", "Dragon Helm", "Explorer Dome", "Knight Visor", "Cat Ear Helm", "Gundam Crest", "Shogun Kabuto", "Falcon Helm", "Astronaut Bubble", "Dino Helm", "Lion Mane Helm", "Ninja Hood", "Crystal Crown", "Rescue Helmet"],
  eyes: ["Photon Visor", "Twin Emerald Eyes", "Cyclops Lens", "Star Eyes", "Scanner Array", "Friendly Pixels", "Anime Eyes", "Laser Eyes", "Night Vision", "Rainbow Optics", "Hologram Face", "Six Sensor Array"],
  body: ["Star Reactor", "Guardian Core", "Dragon Chest", "Stealth Frame", "Rescue Armor", "Crystal Reactor", "Mecha Samurai", "Heavy Titan", "Speed Frame", "Aqua Armor", "Space Knight", "Dinosaur Core", "Solar Guardian", "Construction Frame"],
  arms: ["Guardian Arms", "Photon Blades", "Giant Hands", "Tool Arms", "Shield Arms", "Rocket Fists", "Drill Arms", "Claw Hands", "Magnet Hands", "Rescue Grippers", "Energy Cannons", "Painter Arms"],
  base: ["Vernier Legs", "Tank Treads", "Hover Ring", "Rocket Boots", "Spider Legs", "Speed Wheels", "Dino Legs", "Moon Boots", "Skates", "Aqua Fins", "Spring Legs", "Four-Wheel Drive"],
  backpack: ["Wing Binders", "Jetpack", "Pet Drone", "Rocket Rack", "Solar Wings", "Bubble Pack", "Samurai Flags", "Rescue Crane", "Satellite Dish", "Dino Tail Pack", "Tool Workshop", "Parachute"],
  power: ["Star Reactor", "Bubble Blaster", "Animal Translator", "Rescue Beam", "Rainbow Shield", "Dinosaur Scanner", "Time Slow Field", "Plant Grower", "Weather Maker", "Super Magnet", "Healing Light", "Portal Generator"],
  personality: ["Brave Guardian", "Curious Explorer", "Silly Inventor", "Gentle Helper", "Fast Adventurer", "Wise Captain", "Loyal Sidekick", "Joke Master", "Quiet Scientist", "Bold Rescue Hero", "Creative Artist", "Animal Friend"],
  mood: ["Happy", "Excited", "Curious", "Brave", "Silly", "Calm", "Sleepy", "Focused"],
  voice: ["Classic Beep", "Hero Voice", "Tiny Chirp", "Deep Captain", "Silly Squeak", "Robot Whisper", "Musical Chime", "Space Radio"],
};

export const MONSTER_OPTIONS: Record<string, string[]> = {
  body: ["Blob", "Dragon", "Jungle Beast", "Stone Golem", "Spirit", "Cosmic", "Aquatic", "Candy", "Mecha", "Royal", "Volcano", "Ice Beast", "Alien", "Lizard Alien", "Dinosaur", "Cloud"],
  eyes: ["One eye", "Two eyes", "Three eyes", "Four eyes", "Star eyes", "Sleepy eyes", "Robot visor", "Anime eyes", "Fire eyes", "Galaxy eyes"],
  mouth: ["Friendly smile", "Fang smile", "Big grin", "Tiny mouth", "Beak", "Robot speaker", "Dragon snout"],
  horns: ["No horns", "Tiny horns", "Crystal horns", "Dragon horns", "Antlers", "Unicorn horn", "Mecha antenna", "Flame horns"],
  wings: ["No wings", "Bat wings", "Dragon wings", "Star wings", "Butterfly wings", "Mecha wings", "Angel wings", "Fire wings"],
  arms: ["Tiny arms", "Claw arms", "Four arms", "Tentacles", "Giant hands", "Robot arms", "Wing arms"],
  legs: ["Tiny feet", "Dinosaur legs", "Spider legs", "Hover base", "Spring legs", "Robot treads", "Mermaid tail"],
  tail: ["No tail", "Dragon tail", "Lion tail", "Scorpion tail", "Fish tail", "Flame tail", "Robot cable"],
  color: ["Aqua", "Purple", "Lime", "Orange", "Pink", "Blue", "Red", "Gold", "Midnight", "Pearl", "Emerald", "Crimson"],
  pattern: ["Solid", "Spots", "Stripes", "Galaxy", "Scales", "Candy swirl", "Lightning", "Stars", "Camouflage", "Circuit lines"],
  texture: ["Smooth", "Furry", "Crystal", "Stone", "Slime", "Metal", "Cloud", "Lava"],
  power: ["Rainbow shield", "Bubble beam", "Plant growth", "Moonlight", "Super jump", "Friendly roar", "Fire breath", "Ice blast", "Teleport", "Healing sparkle", "Thunder clap", "Invisibility"],
  personality: ["Curious", "Silly", "Brave", "Shy", "Helpful", "Sleepy", "Loyal", "Mischievous", "Wise", "Playful"],
  habitat: ["Crystal Cave", "Cloud Nest", "Jungle Hut", "Ocean Dome", "Candy Castle", "Moon Base", "Volcano Fort", "Ice Palace", "Mecha Garage", "Star Garden"],
  animation: ["Bounce", "Spin", "Roar", "Fly", "Dance", "Sleep"],
};

export const PET_OPTIONS: Record<string, string[]> = {
  species: ["Robot Dog", "Robot Cat", "Mini Dinosaur", "Tiny Dragon", "Penguin Bot", "Fox Bot", "Owl Scout", "Space Orb"],
  color: ["Blue", "Red", "Purple", "Green", "Gold", "Pink"],
  accessory: ["Explorer Scarf", "Jetpack", "Star Collar", "Goggles", "Tiny Crown", "Tool Pack"],
  personality: ["Playful", "Brave", "Gentle", "Curious", "Silly", "Wise"],
};

export const ROOM_DECORATIONS = ["Charging Dock", "Animal Photo Wall", "Trophy Shelf", "Mecha Banner", "Monster Plush", "Star Window", "Dino Fossil Case", "Art Gallery"];
export const ARCADE_GAMES = ["Animal Clue", "Pattern Power", "Robot Memory", "Dino Dig", "Monster Maze", "Rocket Math"];
export const ARCADE_ICONS = ["🐾", "🧩", "🤖", "🦖", "👾", "🚀"];
