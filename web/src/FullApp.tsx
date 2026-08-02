import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { RobotStage } from "./RobotStage";
import { createProfile, exportProfile, importProfile, loadLocalStore, saveLocalStore, touchProfile } from "./storage";
import type { ArtworkRecord, Language, LocalProfile, LocalSaveStore, MonsterRecord, PetRecord, Robot, SectionId, StoryRecord } from "./types";
import "./styles.css";
import "./full-world.css";

type Copy = { en: string; "es-MX": string };
type Pose = "idle" | "launch" | "celebrate" | "wave";
const t = (copy: Copy, language: Language) => copy[language];
const id = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

const sections: Array<{ id: SectionId; emoji: string; name: Copy; description: Copy }> = [
  ["world-map", "🌍", "World Map", "Mapa del mundo", "Choose a destination and continue the adventure.", "Elige un destino y continúa la aventura."],
  ["robo-lab", "🤖", "Robo Lab", "Laboratorio robot", "Build, customize, save, and animate robot friends.", "Construye, personaliza, guarda y anima amigos robot."],
  ["animal-forest", "🐾", "Animal Forest", "Bosque animal", "Discover wildlife, facts, habitats, favorites, and field missions.", "Descubre fauna, datos, hábitats, favoritos y misiones de campo."],
  ["monster-lab", "👾", "Monster Lab", "Laboratorio de monstruos", "Create detailed monsters with powers and personalities.", "Crea monstruos detallados con poderes y personalidades."],
  ["monster-habitats", "🏕️", "Monster Habitats", "Hábitats de monstruos", "Care for monsters and grow their friendship.", "Cuida a los monstruos y aumenta su amistad."],
  ["art-studio", "🎨", "Art Studio", "Estudio de arte", "Make posters and decorate Robot Home.", "Crea pósters y decora la Casa Robot."],
  ["story-castle", "📚", "Story Castle", "Castillo de cuentos", "Create bilingual stories starring saved friends.", "Crea cuentos bilingües con tus amigos guardados."],
  ["game-arcade", "🕹️", "Game Arcade", "Sala de juegos", "Play six quick learning and memory games.", "Juega seis juegos rápidos de aprendizaje y memoria."],
  ["dinosaur-valley", "🦖", "Dinosaur Valley", "Valle de dinosaurios", "Explore, discover dinosaurs, and collect fossils.", "Explora, descubre dinosaurios y colecciona fósiles."],
  ["pet-workshop", "🐕", "Robot Pet Workshop", "Taller de mascotas robot", "Build pets, train tricks, and grow bonds.", "Construye mascotas, entrena trucos y crea vínculos."],
  ["robot-home", "🏠", "Robot Home", "Casa Robot", "See robots, pets, artwork, and decorations together.", "Ve robots, mascotas, arte y decoraciones juntos."],
  ["memory-book", "🏛️", "Memory Museum", "Museo de recuerdos", "Review every saved creation and discovery.", "Revisa cada creación y descubrimiento guardado."],
  ["badge-book", "🏆", "Badge Observatory", "Observatorio de insignias", "Track stars, levels, badges, and milestones.", "Sigue estrellas, niveles, insignias y logros."],
  ["parent-settings", "⚙️", "Parent & Settings", "Adultos y ajustes", "Manage language, profiles, backups, and privacy.", "Administra idioma, perfiles, respaldos y privacidad."],
].map(([sectionId, emoji, en, es, descriptionEn, descriptionEs]) => ({ id: sectionId as SectionId, emoji, name: { en, "es-MX": es }, description: { en: descriptionEn, "es-MX": descriptionEs } }));

const robotOptions: Record<string, string[]> = {
  color: ["Electric Blue", "Crimson Red", "Emerald Green", "Royal Purple", "Solar Orange", "Pearl White", "Midnight Black"],
  secondary_color: ["Sunny Yellow", "Neon Cyan", "Hot Pink", "Silver", "Lime", "Copper"],
  head: ["Vanguard Crown", "Samurai Helm", "Dragon Helm", "Explorer Dome", "Knight Visor", "Cat Ear Helm"],
  eyes: ["Photon Visor", "Twin Emerald Eyes", "Cyclops Lens", "Star Eyes", "Scanner Array", "Friendly Pixels"],
  body: ["Star Reactor", "Guardian Core", "Dragon Chest", "Stealth Frame", "Rescue Armor", "Crystal Reactor"],
  arms: ["Guardian Arms", "Photon Blades", "Giant Hands", "Tool Arms", "Shield Arms", "Rocket Fists"],
  base: ["Vernier Legs", "Tank Treads", "Hover Ring", "Rocket Boots", "Spider Legs", "Speed Wheels"],
  backpack: ["Wing Binders", "Jetpack", "Pet Drone", "Rocket Rack", "Solar Wings", "Bubble Pack"],
  power: ["Star Reactor", "Bubble Blaster", "Animal Translator", "Rescue Beam", "Rainbow Shield", "Dinosaur Scanner"],
  personality: ["Brave Guardian", "Curious Explorer", "Silly Inventor", "Gentle Helper", "Fast Adventurer", "Wise Captain"],
};

function Header({ profile, open, update }: { profile: LocalProfile; open: (id: SectionId) => void; update: (profile: LocalProfile) => void }) {
  return <header className="fw-topbar"><button className="fw-brand" onClick={() => open("world-map")}><span>⚡</span><div><small>{profile.language === "es-MX" ? "EL MUNDO DE" : "NICO'S"}</small><strong>{profile.language === "es-MX" ? "NICO" : "WORLD"}</strong></div></button><div className="fw-profile-pill">👤 {profile.playerName}</div><div className="fw-profile-pill">⭐ {profile.stars}</div><button onClick={() => update({ ...profile, language: profile.language === "en" ? "es-MX" : "en" })}>{profile.language === "en" ? "🇲🇽 Español" : "🇺🇸 English"}</button></header>;
}

function PageTitle({ id: sectionId, language }: { id: SectionId; language: Language }) {
  const section = sections.find((item) => item.id === sectionId) ?? sections[0];
  return <header className="fw-page-header"><span>{section.emoji}</span><div><small>{t({ en: "Nico's World destination", "es-MX": "Destino del Mundo de Nico" }, language)}</small><h1>{t(section.name, language)}</h1><p>{t(section.description, language)}</p></div></header>;
}

function WorldMap({ profile, open }: { profile: LocalProfile; open: (id: SectionId) => void }) {
  return <div className="fw-grid fw-grid--map"><article className="fw-hero-card"><RobotStage robot={profile.robot} statusLabel={t({ en: "READY", "es-MX": "LISTO" }, profile.language)} levelLabel={profile.language === "es-MX" ? "NV" : "LV"} /><div className="fw-stat-row"><span>⭐ {profile.stars}</span><span>🤖 {profile.robots.length}</span><span>🐾 {profile.animals.filter((a) => a.discovered).length}</span><span>👾 {profile.monsters.length}</span></div></article><section className="fw-destination-grid">{sections.filter((item) => item.id !== "world-map").map((section) => <button className="fw-destination" key={section.id} onClick={() => open(section.id)}><span>{section.emoji}</span><strong>{t(section.name, profile.language)}</strong><small>{t(section.description, profile.language)}</small></button>)}</section></div>;
}

function RoboLab({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const [draft, setDraft] = useState<Robot>({ ...profile.robot });
  const [pose, setPose] = useState<Pose>("idle");
  const set = (key: keyof Robot, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const randomize = () => { const pick = (values: string[]) => values[Math.floor(Math.random() * values.length)]; setDraft((current) => ({ ...current, id: id("robot"), name: `BoltBot ${Math.floor(Math.random() * 900 + 100)}`, color: pick(robotOptions.color), secondary_color: pick(robotOptions.secondary_color), head: pick(robotOptions.head), eyes: pick(robotOptions.eyes), body: pick(robotOptions.body), arms: pick(robotOptions.arms), base: pick(robotOptions.base), backpack: pick(robotOptions.backpack), power: pick(robotOptions.power), personality: pick(robotOptions.personality), level: 1, xp: 0 })); };
  const save = () => { const robot = { ...draft, id: draft.id || id("robot"), name: draft.name.trim() || "BoltBot" }; const robots = profile.robots.some((item) => item.id === robot.id) ? profile.robots.map((item) => item.id === robot.id ? robot : item) : [...profile.robots, robot]; update({ ...profile, robot, robots, stars: profile.stars + 2 }); setPose("celebrate"); setTimeout(() => setPose("idle"), 1200); };
  return <div className="fw-builder-layout"><div><RobotStage robot={draft} pose={pose} statusLabel="BUILD PREVIEW" levelLabel="LV" /><div className="fw-action-row"><button onClick={() => setPose("wave")}>👋 Wave</button><button onClick={() => setPose("launch")}>🚀 Fly</button><button onClick={randomize}>🎲 Random</button></div></div><section className="fw-panel"><label>Robot name<input value={draft.name} onChange={(event) => set("name", event.target.value)} /></label><div className="fw-form-grid">{Object.entries(robotOptions).map(([key, values]) => <label key={key}>{key.replaceAll("_", " ")}<select value={String(draft[key as keyof Robot])} onChange={(event) => set(key as keyof Robot, event.target.value)}>{values.map((value) => <option key={value}>{value}</option>)}</select></label>)}</div><button className="fw-primary" onClick={save}>💾 Save robot</button><div className="fw-collection-row">{profile.robots.map((robot) => <button key={robot.id} onClick={() => setDraft({ ...robot })}>🤖 {robot.name}</button>)}</div></section></div>;
}

function AnimalForest({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const [habitat, setHabitat] = useState("All");
  const habitats = ["All", ...new Set(profile.animals.map((animal) => animal.habitat))];
  const shown = habitat === "All" ? profile.animals : profile.animals.filter((animal) => animal.habitat === habitat);
  const toggle = (animalId: string, field: "discovered" | "favorite") => { const animal = profile.animals.find((item) => item.id === animalId); update({ ...profile, animals: profile.animals.map((item) => item.id === animalId ? { ...item, [field]: !item[field] } : item), stars: field === "discovered" && animal && !animal.discovered ? profile.stars + 1 : profile.stars }); };
  return <><div className="fw-filter-row">{habitats.map((item) => <button className={item === habitat ? "active" : ""} key={item} onClick={() => setHabitat(item)}>{item}</button>)}</div><div className="fw-card-grid">{shown.map((animal) => <article className={`fw-creature-card ${animal.discovered ? "is-discovered" : ""}`} key={animal.id}><div className="fw-creature-art">{animal.emoji}</div><h3>{animal.name}</h3><span>{animal.habitat}</span><p>{animal.discovered ? animal.fact : "Complete a field scan to reveal this fact."}</p><div className="fw-action-row"><button onClick={() => toggle(animal.id, "discovered")}>{animal.discovered ? "✅" : "🔭"} Discover</button><button onClick={() => toggle(animal.id, "favorite")}>{animal.favorite ? "⭐" : "☆"}</button></div></article>)}</div></>;
}

function MonsterLab({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const blank = (): MonsterRecord => ({ id: id("monster"), name: "Glimmer", body: "Dragon", eyes: "Three eyes", horns: "Crystal horns", wings: "Star wings", color: "Aqua", pattern: "Galaxy", power: "Rainbow shield", personality: "Curious", friendship: 1, habitat: "Crystal Cave" });
  const [draft, setDraft] = useState<MonsterRecord>(blank());
  const options: Record<string, string[]> = { body: ["Blob", "Dragon", "Jungle", "Stone", "Spirit", "Cosmic", "Aquatic", "Candy", "Mecha", "Royal"], eyes: ["One eye", "Two eyes", "Three eyes", "Star eyes", "Sleepy eyes", "Robot visor"], horns: ["No horns", "Tiny horns", "Crystal horns", "Dragon horns", "Antlers"], wings: ["No wings", "Bat wings", "Dragon wings", "Star wings", "Butterfly wings"], color: ["Aqua", "Purple", "Lime", "Orange", "Pink", "Blue", "Red", "Gold"], pattern: ["Solid", "Spots", "Stripes", "Galaxy", "Scales", "Candy swirl"], power: ["Rainbow shield", "Bubble beam", "Plant growth", "Moonlight", "Super jump", "Friendly roar"], personality: ["Curious", "Silly", "Brave", "Shy", "Helpful", "Sleepy"], habitat: ["Crystal Cave", "Cloud Nest", "Jungle Hut", "Ocean Dome", "Candy Castle", "Moon Base"] };
  const save = () => { const monster = { ...draft, id: draft.id || id("monster"), name: draft.name.trim() || "Monster" }; const monsters = profile.monsters.some((item) => item.id === monster.id) ? profile.monsters.map((item) => item.id === monster.id ? monster : item) : [...profile.monsters, monster]; update({ ...profile, monsters, stars: profile.stars + 2 }); setDraft(blank()); };
  return <div className="fw-builder-layout"><article className="fw-monster-stage" style={{ "--monster-color": draft.color.toLowerCase() } as CSSProperties}><div className={`fw-monster fw-monster--${draft.body.toLowerCase()}`}><span className="horns">{draft.horns === "No horns" ? "" : "▲ ▲"}</span><span className="eyes">{draft.eyes === "Three eyes" ? "● ● ●" : draft.eyes === "One eye" ? "●" : "● ●"}</span><span className="mouth">⌣</span><span className="wings">{draft.wings === "No wings" ? "" : "◀ ▶"}</span></div><h2>{draft.name}</h2><p>{draft.pattern} · {draft.power}</p></article><section className="fw-panel"><label>Monster name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><div className="fw-form-grid">{Object.entries(options).map(([key, values]) => <label key={key}>{key}<select value={String(draft[key as keyof MonsterRecord])} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}>{values.map((value) => <option key={value}>{value}</option>)}</select></label>)}</div><button className="fw-primary" onClick={save}>👾 Save monster</button><div className="fw-collection-row">{profile.monsters.map((monster) => <button key={monster.id} onClick={() => setDraft({ ...monster })}>👾 {monster.name}</button>)}</div></section></div>;
}

function MonsterHabitats({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const care = (monsterId: string, amount: number) => update({ ...profile, monsters: profile.monsters.map((monster) => monster.id === monsterId ? { ...monster, friendship: Math.min(100, monster.friendship + amount) } : monster), stars: profile.stars + 1 });
  if (!profile.monsters.length) return <div className="fw-empty">👾 Create a monster first in Monster Lab.</div>;
  return <div className="fw-card-grid">{profile.monsters.map((monster) => <article className="fw-habitat-card" key={monster.id}><div className="fw-habitat-scene"><span>🏕️</span><b>{monster.name}</b><small>{monster.habitat}</small></div><progress value={monster.friendship} max={100} /><p>💖 {monster.friendship}/100</p><div className="fw-action-row"><button onClick={() => care(monster.id, 5)}>🍎 Feed</button><button onClick={() => care(monster.id, 7)}>🧸 Play</button><button onClick={() => care(monster.id, 3)}>👋 Visit</button></div></article>)}</div>;
}

function ArtStudio({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const [draft, setDraft] = useState<ArtworkRecord>({ id: id("art"), title: "Star Patrol", background: "Space", subject: "Robot", frame: "Gold", caption: "Adventure starts here!" });
  const save = () => update({ ...profile, artwork: [...profile.artwork, { ...draft, id: id("art") }], stars: profile.stars + 2 });
  return <div className="fw-builder-layout"><article className={`fw-poster bg-${draft.background.toLowerCase()}`}><div className={`fw-frame frame-${draft.frame.toLowerCase()}`}><span>{draft.subject === "Robot" ? "🤖" : draft.subject === "Monster" ? "👾" : draft.subject === "Animal" ? "🦁" : "🦖"}</span><h2>{draft.title}</h2><p>{draft.caption}</p></div></article><section className="fw-panel"><label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><div className="fw-form-grid"><label>Background<select value={draft.background} onChange={(event) => setDraft({ ...draft, background: event.target.value })}>{["Space", "Jungle", "Ocean", "Sunset", "Snow"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Subject<select value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })}>{["Robot", "Monster", "Animal", "Dinosaur"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Frame<select value={draft.frame} onChange={(event) => setDraft({ ...draft, frame: event.target.value })}>{["Gold", "Neon", "Wood", "Crystal"].map((value) => <option key={value}>{value}</option>)}</select></label></div><label>Caption<input value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></label><button className="fw-primary" onClick={save}>🎨 Save artwork</button></section></div>;
}

function StoryCastle({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const heroes = [profile.robot.name, ...profile.monsters.map((monster) => monster.name), ...profile.pets.map((pet) => pet.name)];
  const [draft, setDraft] = useState<StoryRecord>({ id: id("story"), title: "The Lost Star", hero: heroes[0] ?? "BoltBot", place: "Moon Castle", problem: "A star map disappeared", ending: "Everyone worked together and found it", language: profile.language });
  const text = draft.language === "es-MX" ? `${draft.hero} viajó a ${draft.place}. Un día, ${draft.problem.toLowerCase()}. Después de una gran aventura, ${draft.ending.toLowerCase()}.` : `${draft.hero} traveled to ${draft.place}. One day, ${draft.problem.toLowerCase()}. After a great adventure, ${draft.ending.toLowerCase()}.`;
  const save = () => update({ ...profile, stories: [...profile.stories, { ...draft, id: id("story") }], stars: profile.stars + 2 });
  const speak = () => { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); };
  return <div className="fw-builder-layout"><article className="fw-story-page"><small>{draft.language === "es-MX" ? "CUENTO" : "STORY"}</small><h2>{draft.title}</h2><p>{text}</p><button onClick={speak}>🔊 Read aloud</button></article><section className="fw-panel"><label>Title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>Hero<select value={draft.hero} onChange={(event) => setDraft({ ...draft, hero: event.target.value })}>{heroes.map((value) => <option key={value}>{value}</option>)}</select></label><label>Place<input value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })} /></label><label>Problem<input value={draft.problem} onChange={(event) => setDraft({ ...draft, problem: event.target.value })} /></label><label>Ending<input value={draft.ending} onChange={(event) => setDraft({ ...draft, ending: event.target.value })} /></label><label>Language<select value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value as Language })}><option value="en">English</option><option value="es-MX">Español de México</option></select></label><button className="fw-primary" onClick={save}>📚 Save story</button></section></div>;
}

function Arcade({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const games = ["Animal Clue", "Pattern Power", "Robot Memory", "Dino Dig", "Monster Maze", "Rocket Math"];
  const play = (game: string) => { const score = Math.floor(Math.random() * 51) + 50; update({ ...profile, arcadeScores: { ...profile.arcadeScores, [game]: Math.max(score, profile.arcadeScores[game] ?? 0) }, stars: profile.stars + 1 }); };
  return <div className="fw-card-grid">{games.map((game, index) => <article className="fw-game-card" key={game}><div>{["🐾", "🧩", "🤖", "🦖", "👾", "🚀"][index]}</div><h3>{game}</h3><p>Best score: {profile.arcadeScores[game] ?? 0}</p><button onClick={() => play(game)}>▶ Play</button></article>)}</div>;
}

function DinosaurValley({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const discover = (dinosaurId: string, name: string) => update({ ...profile, dinosaurs: profile.dinosaurs.map((dinosaur) => dinosaur.id === dinosaurId ? { ...dinosaur, discovered: true } : dinosaur), fossils: profile.fossils.includes(`${name} Fossil`) ? profile.fossils : [...profile.fossils, `${name} Fossil`], stars: profile.stars + 2 });
  return <div className="fw-card-grid">{profile.dinosaurs.map((dinosaur) => <article className={`fw-dino-card ${dinosaur.discovered ? "is-discovered" : ""}`} key={dinosaur.id}><div>{dinosaur.emoji}</div><h3>{dinosaur.name}</h3><span>{dinosaur.period}</span><p>{dinosaur.discovered ? "Field guide unlocked and fossil recovered." : "Start an expedition to discover this dinosaur."}</p><button onClick={() => discover(dinosaur.id, dinosaur.name)}>⛏️ Expedition</button></article>)}</div>;
}

function PetWorkshop({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const [draft, setDraft] = useState<PetRecord>({ id: id("pet"), name: "Sparky", species: "Robot Dog", color: "Blue", accessory: "Explorer Scarf", personality: "Playful", bond: 1, tricks: [] });
  const options: Record<string, string[]> = { species: ["Robot Dog", "Robot Cat", "Mini Dinosaur", "Tiny Dragon", "Penguin Bot", "Fox Bot", "Owl Scout", "Space Orb"], color: ["Blue", "Red", "Purple", "Green", "Gold", "Pink"], accessory: ["Explorer Scarf", "Jetpack", "Star Collar", "Goggles", "Tiny Crown", "Tool Pack"], personality: ["Playful", "Brave", "Gentle", "Curious", "Silly", "Wise"] };
  const save = () => { const pet = { ...draft, id: id("pet") }; update({ ...profile, pets: [...profile.pets, pet], activePetId: profile.activePetId ?? pet.id, stars: profile.stars + 2 }); };
  const train = (petId: string) => update({ ...profile, pets: profile.pets.map((pet) => pet.id === petId ? { ...pet, bond: Math.min(100, pet.bond + 8), tricks: pet.tricks.includes("Spin") ? pet.tricks : [...pet.tricks, "Spin"] } : pet), stars: profile.stars + 1 });
  const emoji = draft.species.includes("Dog") ? "🐕" : draft.species.includes("Cat") ? "🐈" : draft.species.includes("Dinosaur") ? "🦕" : draft.species.includes("Dragon") ? "🐉" : draft.species.includes("Penguin") ? "🐧" : draft.species.includes("Fox") ? "🦊" : draft.species.includes("Owl") ? "🦉" : "🛸";
  return <div className="fw-builder-layout"><article className="fw-pet-stage"><div className="fw-pet">{emoji}</div><h2>{draft.name}</h2><p>{draft.accessory} · {draft.personality}</p></article><section className="fw-panel"><label>Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><div className="fw-form-grid">{Object.entries(options).map(([key, values]) => <label key={key}>{key}<select value={String(draft[key as keyof PetRecord])} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}>{values.map((value) => <option key={value}>{value}</option>)}</select></label>)}</div><button className="fw-primary" onClick={save}>🐾 Save pet</button><div className="fw-collection-row">{profile.pets.map((pet) => <button key={pet.id} onClick={() => train(pet.id)}>🐾 {pet.name} · 💖 {pet.bond}</button>)}</div></section></div>;
}

function RobotHome({ profile, update }: { profile: LocalProfile; update: (profile: LocalProfile) => void }) {
  const activePet = profile.pets.find((pet) => pet.id === profile.activePetId) ?? profile.pets[0];
  const decor = ["Charging Dock", "Animal Photo Wall", "Trophy Shelf", "Mecha Banner", "Monster Plush", "Star Window", "Dino Fossil Case", "Art Gallery"];
  const toggle = (item: string) => update({ ...profile, decorations: profile.decorations.includes(item) ? profile.decorations.filter((value) => value !== item) : [...profile.decorations, item] });
  return <><article className="fw-room"><div className="fw-room__window">✨</div><div className="fw-room__robot"><RobotStage robot={profile.robot} statusLabel="HOME" levelLabel="LV" /></div><div className="fw-room__pet">{activePet ? `🐾 ${activePet.name}` : ""}</div><div className="fw-room__art">{profile.artwork.at(-1)?.title ?? ""}</div><div className="fw-room__decor">{profile.decorations.map((item) => <span key={item}>{item}</span>)}</div></article><div className="fw-filter-row">{decor.map((item) => <button className={profile.decorations.includes(item) ? "active" : ""} key={item} onClick={() => toggle(item)}>{item}</button>)}</div></>;
}

function Museum({ profile }: { profile: LocalProfile }) {
  const groups: Array<[string, string, string[]]> = [["🤖", "Robots", profile.robots.map((item) => item.name)], ["🐾", "Animals", profile.animals.filter((item) => item.discovered).map((item) => item.name)], ["👾", "Monsters", profile.monsters.map((item) => item.name)], ["🐕", "Pets", profile.pets.map((item) => item.name)], ["🎨", "Artwork", profile.artwork.map((item) => item.title)], ["📚", "Stories", profile.stories.map((item) => item.title)], ["🦖", "Dinosaurs", profile.dinosaurs.filter((item) => item.discovered).map((item) => item.name)], ["🦴", "Fossils", profile.fossils]];
  return <div className="fw-card-grid">{groups.map(([emoji, title, items]) => <article className="fw-memory-card" key={title}><div>{emoji}</div><h3>{title}</h3><strong>{items.length}</strong><ul>{items.slice(-8).map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>;
}

function Badges({ profile }: { profile: LocalProfile }) {
  const badges: Array<[boolean, string, string]> = [[profile.stars >= 5, "⭐", "Star Starter"], [profile.robots.length >= 2, "🤖", "Robot Engineer"], [profile.animals.filter((item) => item.discovered).length >= 5, "🐾", "Wildlife Explorer"], [profile.monsters.length >= 1, "👾", "Monster Maker"], [profile.pets.length >= 1, "🐕", "Pet Partner"], [profile.artwork.length >= 1, "🎨", "Young Artist"], [profile.stories.length >= 1, "📚", "Story Builder"], [profile.fossils.length >= 3, "🦴", "Fossil Hunter"]];
  return <div className="fw-badge-grid">{badges.map(([earned, emoji, name]) => <article className={earned ? "earned" : "locked"} key={name}><span>{earned ? emoji : "🔒"}</span><h3>{name}</h3><p>{earned ? "Unlocked" : "Keep exploring"}</p></article>)}</div>;
}

function Settings({ store, profile, setStore, update }: { store: LocalSaveStore; profile: LocalProfile; setStore: (store: LocalSaveStore) => void; update: (profile: LocalProfile) => void }) {
  const [name, setName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const create = () => { if (!name.trim()) return; const next = createProfile(name, profile.language); setStore({ ...store, activeProfileId: next.id, profiles: [...store.profiles, next].slice(-12) }); setName(""); };
  const download = () => { const blob = new Blob([exportProfile(profile)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `nicos-world-${profile.playerName}.json`; anchor.click(); URL.revokeObjectURL(url); };
  const restore = async (file?: File) => { if (!file) return; const imported = importProfile(await file.text()); setStore({ ...store, activeProfileId: imported.id, profiles: [...store.profiles, imported].slice(-12) }); };
  return <div className="fw-settings-grid"><article className="fw-panel"><h2>Language / Idioma</h2><select value={profile.language} onChange={(event) => update({ ...profile, language: event.target.value as Language })}><option value="en">English</option><option value="es-MX">Español de México</option></select><h2>Profiles on this device</h2><select value={profile.id} onChange={(event) => setStore({ ...store, activeProfileId: event.target.value })}>{store.profiles.map((item) => <option key={item.id} value={item.id}>{item.playerName}</option>)}</select><div className="fw-action-row"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Friend's name" /><button onClick={create}>＋</button></div></article><article className="fw-panel"><h2>Private local save</h2><p>Progress is stored only in this browser. Each friend gets a separate save on their own device.</p><div className="fw-action-row"><button onClick={download}>⬇️ Backup</button><button onClick={() => fileInput.current?.click()}>⬆️ Restore</button><input hidden ref={fileInput} type="file" accept=".json,application/json" onChange={(event) => void restore(event.target.files?.[0])} /></div></article></div>;
}

export default function FullApp() {
  const [store, setStore] = useState<LocalSaveStore>(() => loadLocalStore());
  const profile = useMemo(() => store.profiles.find((item) => item.id === store.activeProfileId) ?? store.profiles[0], [store]);
  useEffect(() => { saveLocalStore(store); }, [store]);
  useEffect(() => { document.documentElement.lang = profile.language; document.title = profile.language === "es-MX" ? "El Mundo de Nico" : "Nico's World"; }, [profile.language]);
  useEffect(() => { navigator.serviceWorker?.register("/sw.js").catch(() => undefined); }, []);
  const update = (next: LocalProfile) => setStore((current) => ({ ...current, profiles: current.profiles.map((item) => item.id === current.activeProfileId ? touchProfile(next) : item) }));
  const open = (sectionId: SectionId) => update({ ...profile, selectedSection: sectionId, sectionVisits: { ...profile.sectionVisits, [sectionId]: Number(profile.sectionVisits[sectionId] ?? 0) + 1 } });
  const page = (() => { switch (profile.selectedSection) { case "world-map": return <WorldMap profile={profile} open={open} />; case "robo-lab": return <RoboLab profile={profile} update={update} />; case "animal-forest": return <AnimalForest profile={profile} update={update} />; case "monster-lab": return <MonsterLab profile={profile} update={update} />; case "monster-habitats": return <MonsterHabitats profile={profile} update={update} />; case "art-studio": return <ArtStudio profile={profile} update={update} />; case "story-castle": return <StoryCastle profile={profile} update={update} />; case "game-arcade": return <Arcade profile={profile} update={update} />; case "dinosaur-valley": return <DinosaurValley profile={profile} update={update} />; case "pet-workshop": return <PetWorkshop profile={profile} update={update} />; case "robot-home": return <RobotHome profile={profile} update={update} />; case "memory-book": return <Museum profile={profile} />; case "badge-book": return <Badges profile={profile} />; case "parent-settings": return <Settings store={store} profile={profile} setStore={setStore} update={update} />; default: return <WorldMap profile={profile} open={open} />; } })();
  const nav = ["world-map", "robo-lab", "animal-forest", "monster-lab", "robot-home", "parent-settings"] as SectionId[];
  return <div className="fw-app"><Header profile={profile} open={open} update={update} /><main><PageTitle id={profile.selectedSection} language={profile.language} />{page}</main><nav className="fw-bottom-nav">{nav.map((sectionId) => { const section = sections.find((item) => item.id === sectionId)!; return <button key={sectionId} className={profile.selectedSection === sectionId ? "active" : ""} onClick={() => open(sectionId)}><span>{section.emoji}</span><small>{t(section.name, profile.language)}</small></button>; })}</nav></div>;
}
