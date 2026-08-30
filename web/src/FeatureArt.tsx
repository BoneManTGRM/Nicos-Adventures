import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { AnimalRecord, MonsterRecord } from "./types";

export type RobotPose = "idle" | "wave" | "launch" | "celebrate" | "dance" | "spin" | "blink" | "scan" | "charge" | "hover" | "stomp" | "salute" | "repair" | "shield" | "lights";

export const ROBOT_ACTIONS: Array<{ pose: RobotPose; icon: string; en: string; es: string }> = [
  { pose: "wave", icon: "👋", en: "Wave", es: "Saludar" },
  { pose: "launch", icon: "🚀", en: "Fly", es: "Volar" },
  { pose: "dance", icon: "💃", en: "Dance", es: "Bailar" },
  { pose: "spin", icon: "🔄", en: "Spin", es: "Girar" },
  { pose: "blink", icon: "😊", en: "Blink", es: "Parpadear" },
  { pose: "scan", icon: "📡", en: "Scan", es: "Escanear" },
  { pose: "charge", icon: "🔋", en: "Charge", es: "Cargar" },
  { pose: "hover", icon: "🛸", en: "Hover", es: "Flotar" },
  { pose: "stomp", icon: "🦾", en: "Power Stomp", es: "Pisotón" },
  { pose: "salute", icon: "🫡", en: "Salute", es: "Saludar firme" },
  { pose: "repair", icon: "🔧", en: "Repair", es: "Reparar" },
  { pose: "shield", icon: "🛡️", en: "Shield", es: "Escudo" },
  { pose: "lights", icon: "⚡", en: "Flash Lights", es: "Luces" },
  { pose: "celebrate", icon: "🎉", en: "Celebrate", es: "Celebrar" },
];

export const ROBOT_JOBS = [
  "Scout Animal Forest", "Wildlife Photographer", "Animal Translator", "Scan Monster Lab",
  "Monster Habitat Keeper", "Organize Memory Museum", "Charge the Workshop", "Recommend a Story",
  "Find a Hidden Part", "Dinosaur Fossil Hunter", "Pet Trainer", "Arcade Coach", "Art Gallery Curator",
  "Robot Home Decorator", "Rescue Pilot", "Weather Watcher", "Joke Broadcaster", "Night Guard",
  "Map Navigator", "Friendship Helper", "Science Assistant", "Repair Engineer", "Space Explorer", "Treasure Finder",
];

const rawAnimals: Array<[string,string,string,string,string,string,string,string]> = [
  ["jaguar","Jaguar","Rainforest","🐆","Jaguars are powerful swimmers and can bite through turtle shells.","Mammal","Central and South America","Spotted fur helps them disappear in broken forest light."],
  ["toucan","Toucan","Rainforest","🦜","A toucan's huge bill is surprisingly light because it contains air spaces.","Bird","Central and South America","Its long bill reaches fruit on branches too thin to stand on."],
  ["sloth","Sloth","Rainforest","🦥","Sloths can hold their breath longer than many dolphins.","Mammal","Central and South America","Moving slowly saves energy on a low-calorie leaf diet."],
  ["poison-dart-frog","Poison Dart Frog","Rainforest","🐸","Some poison dart frogs carry tadpoles on their backs.","Amphibian","Central and South America","Bright colors warn predators to stay away."],
  ["blue-whale","Blue Whale","Ocean","🐋","A blue whale is the largest animal known to have lived on Earth.","Mammal","Worldwide oceans","Baleen plates filter tiny krill from enormous mouthfuls of water."],
  ["giant-pacific-octopus","Giant Pacific Octopus","Ocean","🐙","An octopus has three hearts and blue blood.","Mollusk","North Pacific","It can change color and texture to hide almost instantly."],
  ["sea-turtle","Sea Turtle","Ocean","🐢","Female sea turtles often return to the beach where they hatched.","Reptile","Warm oceans","Long front flippers carry them across entire oceans."],
  ["manta-ray","Manta Ray","Ocean","🐟","Manta rays can recognize themselves in a mirror.","Fish","Tropical oceans","Wide fins let them glide efficiently while filtering plankton."],
  ["lion","Lion","Savanna","🦁","Lion prides cooperate to guard territory and raise cubs.","Mammal","Africa","A rough tongue helps scrape meat from bones."],
  ["african-elephant","African Elephant","Savanna","🐘","Elephants communicate using low rumbles that travel through the ground.","Mammal","Africa","Large ears release heat like giant cooling fans."],
  ["giraffe","Giraffe","Savanna","🦒","Giraffes have the same number of neck bones as people: seven.","Mammal","Africa","A long neck and tongue reach leaves other animals cannot."],
  ["meerkat","Meerkat","Savanna","🐾","One meerkat often stands guard while the rest search for food.","Mammal","Southern Africa","Dark patches around the eyes reduce sun glare."],
  ["polar-bear","Polar Bear","Arctic","🐻‍❄️","Polar bear skin is black beneath its clear-looking fur.","Mammal","Arctic Ocean","Thick fat and hollow fur trap heat in freezing weather."],
  ["arctic-fox","Arctic Fox","Arctic","🦊","Arctic foxes can hear small animals moving beneath snow.","Mammal","Arctic tundra","Their coat changes color with the seasons."],
  ["emperor-penguin","Emperor Penguin","Arctic","🐧","Emperor penguin fathers balance eggs on their feet through winter.","Bird","Antarctica","Groups huddle and rotate positions to share warmth."],
  ["walrus","Walrus","Arctic","🦭","Walruses use sensitive whiskers to find clams on dark seafloors.","Mammal","Arctic seas","Tusks help pull their heavy bodies onto ice."],
  ["fennec-fox","Fennec Fox","Desert","🦊","Fennec foxes can hear prey moving underground.","Mammal","Sahara Desert","Huge ears release heat and detect quiet sounds."],
  ["camel","Camel","Desert","🐫","Camel humps store fat, not water.","Mammal","Africa and Asia","Closing nostrils and double eyelashes block blowing sand."],
  ["roadrunner","Roadrunner","Desert","🐦","Roadrunners can run fast enough to catch rattlesnakes.","Bird","North America","Long legs and a balancing tail help with sudden turns."],
  ["gila-monster","Gila Monster","Desert","🦎","Gila monsters may eat only a few large meals each year.","Reptile","North America","Fat stored in the tail helps them survive scarce food."],
  ["red-panda","Red Panda","Forest","🐾","Red pandas wrap their fluffy tails around themselves like blankets.","Mammal","Himalayan forests","A false thumb helps grip bamboo."],
  ["flying-squirrel","Flying Squirrel","Forest","🐿️","Flying squirrels glide rather than truly fly.","Mammal","Forests worldwide","A skin membrane works like a controllable parachute."],
  ["great-horned-owl","Great Horned Owl","Forest","🦉","Owls can turn their heads far because extra neck bones protect blood flow.","Bird","The Americas","Soft-edged feathers make flight nearly silent."],
  ["beaver","Beaver","Forest","🦫","Beaver dams create wetlands used by many other species.","Mammal","North America and Europe","Transparent eyelids work like swimming goggles."],
  ["axolotl","Axolotl","Wetlands","🦎","Axolotls can regrow limbs and parts of several organs.","Amphibian","Mexico","Feathery external gills gather oxygen underwater."],
  ["capybara","Capybara","Wetlands","🦫","Capybaras are the world's largest rodents.","Mammal","South America","Eyes, ears, and nostrils sit high on the head for swimming."],
  ["flamingo","Flamingo","Wetlands","🦩","Flamingos are pink because of pigments in their food.","Bird","Worldwide wetlands","Their upside-down bills filter tiny food from water."],
  ["platypus","Platypus","Wetlands","🦆","Platypuses are mammals that lay eggs.","Mammal","Australia","Their bills sense electrical signals from prey."],
  ["snow-leopard","Snow Leopard","Mountains","🐆","A snow leopard's tail can be nearly as long as its body.","Mammal","Central Asia","Its tail balances jumps and wraps around the face for warmth."],
  ["mountain-goat","Mountain Goat","Mountains","🐐","Mountain goats can climb slopes that look almost vertical.","Mammal","North America","Split hooves spread apart and rough pads grip rock."],
  ["andean-condor","Andean Condor","Mountains","🦅","Andean condors can soar for hours while barely flapping.","Bird","South America","Huge wings ride rising columns of warm air."],
  ["yak","Yak","Mountains","🐂","Yaks have large lungs and hearts for life at high altitude.","Mammal","Central Asia","Dense wool and a thick undercoat block icy wind."],
];

export const ANIMAL_LIBRARY: AnimalRecord[] = rawAnimals.map(([id,name,habitat,emoji,fact,group,region,adaptation]) => ({ id,name,habitat,emoji,fact,group,region,adaptation,discovered:false,favorite:false,imageTitle:name }));

const palette: Record<string,string> = { Aqua:"#22d3ee", Purple:"#8b5cf6", Lime:"#84cc16", Orange:"#fb923c", Pink:"#f472b6", Blue:"#3b82f6", Red:"#ef4444", Gold:"#facc15", Midnight:"#172554", Pearl:"#e2e8f0", Emerald:"#10b981", Crimson:"#be123c" };
export function MonsterStage({ monster, action = "idle" }: { monster: MonsterRecord; action?: string }) {
  const color = palette[monster.color] || monster.color || "#22d3ee";
  const family = monster.body.toLowerCase().replace(/\s+/g,"-");
  const eyes = monster.eyes.includes("Three") ? 3 : monster.eyes.includes("One") || monster.eyes.includes("Cyclops") ? 1 : monster.eyes.includes("Four") ? 4 : 2;
  const hasWings = !monster.wings.toLowerCase().includes("no ");
  const hasHorns = !monster.horns.toLowerCase().includes("no ");
  return <article className={`monster-stage monster-stage--${action}`} style={{ "--monster-main": color } as CSSProperties}>
    <div className="monster-atmosphere"><i/><i/><i/><i/><i/></div>
    <svg className={`monster-v2 monster-family--${family}`} viewBox="0 0 520 520" role="img" aria-label={`${monster.name}, ${monster.body} monster`}>
      <defs>
        <radialGradient id={`skin-${monster.id}`} cx="35%" cy="25%"><stop offset="0" stopColor="#fff" stopOpacity=".7"/><stop offset=".22" stopColor={color}/><stop offset="1" stopColor="#07142d"/></radialGradient>
        <linearGradient id={`belly-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={color}/><stop offset="1" stopColor="#020617"/></linearGradient>
        <filter id={`monster-glow-${monster.id}`}><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <pattern id={`spots-${monster.id}`} width="38" height="38" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="7" fill="#fff" opacity=".22"/></pattern>
        <pattern id={`stripes-${monster.id}`} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="12" height="34" fill="#fff" opacity=".18"/></pattern>
      </defs>
      {hasWings && <g className="monster-wings"><path d="M162 224C70 104 38 198 108 304l88-35z" fill={color} stroke="#020617" strokeWidth="14"/><path d="M358 224c92-120 124-26 54 80l-88-35z" fill={color} stroke="#020617" strokeWidth="14"/></g>}
      <g className="monster-tail"><path d="M370 344c104 22 88 111 22 100 43-18 34-52-20-46" fill="none" stroke={color} strokeWidth="30" strokeLinecap="round"/></g>
      <g className="monster-legs"><path d="M192 384l-34 82 74-5 10-79zM328 384l34 82-74-5-10-79z" fill={`url(#belly-${monster.id})`} stroke="#020617" strokeWidth="14"/></g>
      <g className="monster-arms"><path d="M164 250c-81 14-97 112-32 130l53-92" fill={color} stroke="#020617" strokeWidth="14"/><path d="M356 250c81 14 97 112 32 130l-53-92" fill={color} stroke="#020617" strokeWidth="14"/></g>
      <path className="monster-body" d={family.includes("dragon") ? "M149 182Q260 70 371 182L398 357Q360 430 260 432Q160 430 122 357Z" : family.includes("cosmic") || family.includes("spirit") ? "M154 150Q260 65 366 150L407 330Q365 435 260 452Q155 435 113 330Z" : family.includes("stone") ? "M139 176L203 105 320 112 386 193 370 373 292 433 177 410 121 318Z" : "M145 164Q260 78 375 164L402 352Q358 432 260 440Q162 432 118 352Z"} fill={`url(#skin-${monster.id})`} stroke="#020617" strokeWidth="16"/>
      {monster.pattern.includes("Spot") && <path d="M145 164Q260 78 375 164L402 352Q358 432 260 440Q162 432 118 352Z" fill={`url(#spots-${monster.id})`}/>} 
      {monster.pattern.includes("Stripe") && <path d="M145 164Q260 78 375 164L402 352Q358 432 260 440Q162 432 118 352Z" fill={`url(#stripes-${monster.id})`}/>} 
      {hasHorns && <g className="monster-horns" fill="#facc15" stroke="#020617" strokeWidth="10"><path d="M190 161l-38-91 79 61z"/><path d="M330 161l38-91-79 61z"/></g>}
      <g className="monster-face">{Array.from({length:eyes}).map((_,index) => { const positions = eyes===1?[260]:eyes===2?[215,305]:eyes===3?[185,260,335]:[185,235,285,335]; return <g key={index}><circle cx={positions[index]} cy={230} r="29" fill="#f8fafc" stroke="#020617" strokeWidth="9"/><circle cx={positions[index]} cy={234} r="12" fill="#07142d"/><circle cx={positions[index]-4} cy={229} r="4" fill="#67e8f9"/></g>;})}<path d={monster.mouth?.includes("Fang") ? "M205 300Q260 348 315 300L292 350 260 322 228 350Z" : monster.mouth?.includes("Grin") ? "M197 302Q260 366 323 302" : "M215 310Q260 345 305 310"} fill={monster.mouth?.includes("Fang") ? "#f8fafc" : "none"} stroke="#f8fafc" strokeWidth="10" strokeLinecap="round"/></g>
      <circle cx="260" cy="374" r="30" fill="#22d3ee" stroke="#fff" strokeWidth="10" filter={`url(#monster-glow-${monster.id})`}/>
    </svg>
    <div className="monster-nameplate"><strong>{monster.name}</strong><span>{monster.body} · {monster.pattern} · {monster.power}</span></div>
  </article>;
}

export function mergeAnimalLibrary(saved: AnimalRecord[]): AnimalRecord[] {
  const byId = new Map(saved.map((animal) => [animal.id, animal]));
  return ANIMAL_LIBRARY.map((animal) => ({ ...animal, ...(byId.get(animal.id) || {}) }));
}

export function useMonsterMotion() {
  const [action,setAction] = useState("idle");
  const play = (next:string) => { setAction(next); window.setTimeout(() => setAction("idle"),1500); };
  return useMemo(() => ({ action, play }), [action]);
}
