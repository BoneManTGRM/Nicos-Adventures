import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { optionLabel } from "./i18n/display";
import type { AnimalRecord, Language, MonsterRecord } from "./types";
import { monsterColorSwatch } from "./world/monsterCreatureStudio";
import "./monster-stage-premium.css";

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

export function MonsterStage({ monster, action = "idle", language = "en" }: { monster: MonsterRecord; action?: string; language?: Language }) {
  const color = monsterColorSwatch(monster.color);
  const family = monster.body.toLowerCase().replace(/\s+/g,"-");
  const texture = String(monster.texture || "smooth").toLowerCase().replace(/\s+/g,"-");
  const eyes = monster.eyes.includes("Three") ? 3 : monster.eyes.includes("One") || monster.eyes.includes("Cyclops") ? 1 : monster.eyes.includes("Four") ? 4 : 2;
  const hasWings = !monster.wings.toLowerCase().includes("no ");
  const hasHorns = !monster.horns.toLowerCase().includes("no ");
  const bodyPath = family.includes("dragon")
    ? "M149 182Q260 70 371 182L398 357Q360 430 260 432Q160 430 122 357Z"
    : family.includes("cosmic") || family.includes("spirit")
      ? "M154 150Q260 65 366 150L407 330Q365 435 260 452Q155 435 113 330Z"
      : family.includes("stone")
        ? "M139 176L203 105 320 112 386 193 370 373 292 433 177 410 121 318Z"
        : "M145 164Q260 78 375 164L402 352Q358 432 260 440Q162 432 118 352Z";
  const eyePositions = eyes === 1 ? [260] : eyes === 2 ? [215, 305] : eyes === 3 ? [185, 260, 335] : [185, 235, 285, 335];
  const patternFill = monster.pattern.includes("Spot")
    ? `url(#spots-${monster.id})`
    : monster.pattern.includes("Stripe")
      ? `url(#stripes-${monster.id})`
      : monster.pattern.includes("Galaxy")
        ? `url(#galaxy-${monster.id})`
        : undefined;
  return <article className={`monster-stage monster-stage--${action}`} style={{ "--monster-main": color } as CSSProperties}>
    <div className="monster-stage__environment" aria-hidden="true"><i/><i/><i/></div>
    <div className="monster-atmosphere" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <svg className={`monster-v2 monster-family--${family} monster-texture--${texture}`} viewBox="0 0 520 520" role="img" aria-label={`${monster.name}, ${optionLabel(monster.body, language)} ${language === "es-MX" ? "monstruo" : "monster"}`}>
      <defs>
        <radialGradient id={`skin-${monster.id}`} cx="31%" cy="18%" r="78%"><stop offset="0" stopColor="#fff" stopOpacity=".82"/><stop offset=".13" stopColor={color}/><stop offset=".58" stopColor={color}/><stop offset="1" stopColor="#020817"/></radialGradient>
        <linearGradient id={`limb-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".42"/><stop offset=".23" stopColor={color}/><stop offset=".72" stopColor={color}/><stop offset="1" stopColor="#020817"/></linearGradient>
        <linearGradient id={`wing-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".62"/><stop offset=".35" stopColor={color} stopOpacity=".76"/><stop offset="1" stopColor="#111827" stopOpacity=".9"/></linearGradient>
        <linearGradient id={`horn-${monster.id}`} x1="0" y1="0" x2=".75" y2="1"><stop stopColor="#fff7c2"/><stop offset=".34" stopColor="#facc15"/><stop offset="1" stopColor="#854d0e"/></linearGradient>
        <radialGradient id={`eye-${monster.id}`} cx="35%" cy="30%"><stop offset="0" stopColor="#e0fbff"/><stop offset=".36" stopColor="#3ddcf3"/><stop offset=".74" stopColor="#155e75"/><stop offset="1" stopColor="#020617"/></radialGradient>
        <radialGradient id={`core-${monster.id}`} cx="38%" cy="32%"><stop offset="0" stopColor="#fff"/><stop offset=".24" stopColor="#cffafe"/><stop offset=".62" stopColor="#22d3ee"/><stop offset="1" stopColor="#164e63"/></radialGradient>
        <filter id={`monster-glow-${monster.id}`}><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id={`monster-shadow-${monster.id}`} x="-35%" y="-35%" width="170%" height="185%"><feDropShadow dx="0" dy="18" stdDeviation="13" floodColor="#00040d" floodOpacity=".72"/></filter>
        <pattern id={`spots-${monster.id}`} width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="13" cy="12" r="8" fill="#fff" opacity=".2"/><circle cx="38" cy="36" r="4" fill="#020617" opacity=".22"/></pattern>
        <pattern id={`stripes-${monster.id}`} width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="12" height="46" fill="#fff" opacity=".16"/><rect x="16" width="4" height="46" fill="#020617" opacity=".18"/></pattern>
        <pattern id={`galaxy-${monster.id}`} width="76" height="76" patternUnits="userSpaceOnUse"><circle cx="14" cy="19" r="3" fill="#fff" opacity=".78"/><circle cx="54" cy="13" r="2" fill="#bae6fd" opacity=".82"/><circle cx="37" cy="56" r="4" fill="#e9d5ff" opacity=".68"/><path d="M4 64Q35 38 72 50" fill="none" stroke="#c4b5fd" strokeWidth="7" opacity=".16"/></pattern>
      </defs>
      <ellipse className="monster-ground-shadow" cx="260" cy="474" rx="128" ry="23" fill="#01030a" opacity=".72"/>
      <g className="monster-anatomy" filter={`url(#monster-shadow-${monster.id})`}>
        {hasWings && <g className="monster-wings" stroke="#06101f" strokeWidth="8" strokeLinejoin="round"><path d="M166 230C101 122 43 142 72 252c10 38 28 68 54 91l76-70z" fill={`url(#wing-${monster.id})`}/><path d="M354 230c65-108 123-88 94 22-10 38-28 68-54 91l-76-70z" fill={`url(#wing-${monster.id})`}/><path d="M84 190q50 36 93 96M436 190q-50 36-93 96" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="5"/></g>}
        <g className="monster-tail"><path d="M367 349c101 8 109 91 47 113 22-28 4-54-45-51" fill="none" stroke="#031020" strokeWidth="38" strokeLinecap="round"/><path d="M367 346c97 9 98 77 49 99" fill="none" stroke={`url(#limb-${monster.id})`} strokeWidth="24" strokeLinecap="round"/><path d="M388 357q47 10 53 38" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round"/></g>
        <g className="monster-legs" stroke="#06101f" strokeWidth="9" strokeLinejoin="round"><path d="M190 372l-37 91q31 19 81 1l13-82zM330 372l37 91q-31 19-81 1l-13-82z" fill={`url(#limb-${monster.id})`}/><path d="M163 449l20-9m1 18 20-13m153 4-20-9m-1 18-20-13" stroke="#e0f2fe" strokeOpacity=".72" strokeWidth="6" strokeLinecap="round"/></g>
        <g className="monster-arms" stroke="#06101f" strokeWidth="9" strokeLinejoin="round"><path d="M164 246c-69 12-97 86-60 123 17 17 37 15 57 1l26-78" fill={`url(#limb-${monster.id})`}/><path d="M356 246c69 12 97 86 60 123-17 17-37 15-57 1l-26-78" fill={`url(#limb-${monster.id})`}/><path d="M115 343q14 11 31 2m259-2q-14 11-31 2" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="5" strokeLinecap="round"/></g>
        <path className="monster-body" d={bodyPath} fill={`url(#skin-${monster.id})`} stroke="#06101f" strokeWidth="10" strokeLinejoin="round"/>
        {patternFill && <path className="monster-surface-pattern" d={bodyPath} fill={patternFill}/>} 
        <path className="monster-belly-light" d="M205 318Q260 343 315 318Q310 398 260 416Q210 398 205 318Z" fill="#fff" opacity=".08"/>
        <path className="monster-rim-light" d="M164 177Q255 94 347 169" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="8" strokeLinecap="round"/>
        {hasHorns && <g className="monster-horns" fill={`url(#horn-${monster.id})`} stroke="#4a2a08" strokeWidth="7" strokeLinejoin="round"><path d="M191 164l-35-91q47 25 78 62z"/><path d="M329 164l35-91q-47 25-78 62z"/><path d="M170 100l37 44m143-44-37 44" stroke="#fff" strokeOpacity=".38" strokeWidth="4"/></g>}
        <g className="monster-face">{eyePositions.map((position,index) => <g className="monster-eye" key={index}><ellipse cx={position} cy="231" rx="31" ry="34" fill="#e8f5f7" stroke="#07111e" strokeWidth="7"/><ellipse cx={position} cy="236" rx="15" ry="20" fill={`url(#eye-${monster.id})`}/><ellipse cx={position} cy="239" rx="6" ry="10" fill="#01040a"/><circle cx={position-7} cy="226" r="5" fill="#fff"/><path d={`M${position-25} 214Q${position} 195 ${position+25} 214`} fill="none" stroke="#07111e" strokeWidth="6" strokeLinecap="round"/></g>)}<g className="monster-mouth">{monster.mouth?.includes("Fang") ? <><path d="M204 306Q260 354 316 306Q307 368 260 374Q213 368 204 306Z" fill="#170812" stroke="#07111e" strokeWidth="7"/><path d="M218 313l18 34 13-27m53-7-18 34-13-27" fill="#fff8e8" stroke="#d9e3e8" strokeWidth="3" strokeLinejoin="round"/><path d="M235 358q25-15 50 0" fill="none" stroke="#f472b6" strokeWidth="8" strokeLinecap="round"/></> : <path d={monster.mouth?.includes("Grin") ? "M204 312Q260 357 316 312" : "M216 321Q260 345 304 321"} fill="none" stroke="#f8fafc" strokeWidth="8" strokeLinecap="round"/>}</g></g>
        <g className="monster-core" filter={`url(#monster-glow-${monster.id})`}><circle cx="260" cy="387" r="39" fill="#051525" stroke="#a5f3fc" strokeOpacity=".65" strokeWidth="4"/><circle cx="260" cy="387" r="27" fill={`url(#core-${monster.id})`}/><circle cx="251" cy="378" r="8" fill="#fff" opacity=".78"/></g>
      </g>
    </svg>
    <div className="monster-nameplate"><strong>{monster.name}</strong><span>{optionLabel(monster.body, language)} · {optionLabel(monster.pattern, language)} · {optionLabel(monster.power, language)}</span></div>
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
