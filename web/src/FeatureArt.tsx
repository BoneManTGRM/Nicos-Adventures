import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { optionLabel } from "./i18n/display";
import type { AnimalRecord, Language, MonsterRecord } from "./types";
import { monsterBodyArtStyle } from "./world/monsterArt";
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
  const pattern = String(monster.pattern || "solid").toLowerCase().replace(/\s+/g,"-");
  const eyes = monster.eyes.includes("Three") ? 3 : monster.eyes.includes("One") || monster.eyes.includes("Cyclops") ? 1 : monster.eyes.includes("Four") ? 4 : 2;
  const hasWings = !monster.wings.toLowerCase().includes("no ");
  const hasHorns = !monster.horns.toLowerCase().includes("no ");
  const hasTail = !String(monster.tail || "No tail").toLowerCase().includes("no ");
  const sleepyEyes = monster.eyes.toLowerCase().includes("sleepy");
  const robotVisor = monster.eyes.toLowerCase().includes("visor");
  const eyePositions = eyes === 1 ? [260] : eyes === 2 ? [215, 305] : eyes === 3 ? [185, 260, 335] : [185, 235, 285, 335];
  return <article className={`monster-stage monster-stage--${action}`} style={{ "--monster-main": color } as CSSProperties}>
    <div className="monster-stage__environment" aria-hidden="true"><i/><i/><i/></div>
    <div className="monster-atmosphere" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div
      className={`monster-v2 monster-family--${family} monster-texture--${texture}`}
      data-monster-body-art={monster.body}
      data-monster-arms-art={monster.arms}
      data-monster-pattern={pattern}
      style={monsterBodyArtStyle(monster.body, color, monster.arms)}
      role="img"
      aria-label={`${monster.name}, ${optionLabel(monster.body, language)} ${language === "es-MX" ? "monstruo" : "monster"}`}
    >
      <span className="monster-premium-body" aria-hidden="true">
        <span className="monster-premium-body__art" />
        <span className="monster-premium-body__tint" />
        <span className="monster-premium-body__pattern" />
      </span>
      <svg className="monster-traits" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
        <linearGradient id={`limb-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".42"/><stop offset=".23" stopColor={color}/><stop offset=".72" stopColor={color}/><stop offset="1" stopColor="#020817"/></linearGradient>
        <linearGradient id={`wing-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".62"/><stop offset=".35" stopColor={color} stopOpacity=".76"/><stop offset="1" stopColor="#111827" stopOpacity=".9"/></linearGradient>
        <linearGradient id={`horn-${monster.id}`} x1="0" y1="0" x2=".75" y2="1"><stop stopColor="#fff7c2"/><stop offset=".34" stopColor="#facc15"/><stop offset="1" stopColor="#854d0e"/></linearGradient>
        <radialGradient id={`eye-${monster.id}`} cx="35%" cy="30%"><stop offset="0" stopColor="#e0fbff"/><stop offset=".36" stopColor="#3ddcf3"/><stop offset=".74" stopColor="#155e75"/><stop offset="1" stopColor="#020617"/></radialGradient>
        <radialGradient id={`core-${monster.id}`} cx="38%" cy="32%"><stop offset="0" stopColor="#fff"/><stop offset=".24" stopColor="#cffafe"/><stop offset=".62" stopColor="#22d3ee"/><stop offset="1" stopColor="#164e63"/></radialGradient>
        <filter id={`monster-glow-${monster.id}`}><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <ellipse className="monster-ground-shadow" cx="260" cy="470" rx="118" ry="18" fill="#01030a" opacity=".55"/>
        <g className="monster-anatomy">
        {hasWings && <g className="monster-wings" stroke="#06101f" strokeWidth="8" strokeLinejoin="round"><path d="M166 230C101 122 43 142 72 252c10 38 28 68 54 91l76-70z" fill={`url(#wing-${monster.id})`}/><path d="M354 230c65-108 123-88 94 22-10 38-28 68-54 91l-76-70z" fill={`url(#wing-${monster.id})`}/><path d="M84 190q50 36 93 96M436 190q-50 36-93 96" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="5"/></g>}
        {hasTail && <g className="monster-tail"><path d="M367 349c101 8 109 91 47 113 22-28 4-54-45-51" fill="none" stroke="#031020" strokeWidth="38" strokeLinecap="round"/><path d="M367 346c97 9 98 77 49 99" fill="none" stroke={`url(#limb-${monster.id})`} strokeWidth="24" strokeLinecap="round"/><path d="M388 357q47 10 53 38" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round"/></g>}
        {hasHorns && <g className="monster-horns" transform="translate(0 -34)" fill={`url(#horn-${monster.id})`} stroke="#4a2a08" strokeWidth="7" strokeLinejoin="round"><path d="M191 164l-35-91q47 25 78 62z"/><path d="M329 164l35-91q-47 25-78 62z"/><path d="M170 100l37 44m143-44-37 44" stroke="#fff" strokeOpacity=".38" strokeWidth="4"/></g>}
        <g className="monster-face" transform="translate(0 -100)">
          {robotVisor
            ? <g className="monster-eye monster-eye--visor"><rect x="181" y="198" width="158" height="70" rx="30" fill="#07111e" stroke="#a5f3fc" strokeWidth="6"/><rect x="196" y="212" width="128" height="40" rx="18" fill={`url(#eye-${monster.id})`}/><circle cx="235" cy="232" r="8" fill="#fff"/><circle cx="286" cy="232" r="8" fill="#fff"/></g>
            : eyePositions.map((position,index) => sleepyEyes
              ? <path className="monster-eye monster-eye--sleepy" key={index} d={`M${position-25} 232Q${position} 250 ${position+25} 232`} fill="none" stroke="#253044" strokeWidth="7" strokeLinecap="round"/>
              : <g className="monster-eye" key={index}><ellipse cx={position} cy="231" rx={eyes > 2 ? 25 : 31} ry={eyes > 2 ? 29 : 34} fill="#f8fdff" stroke="#253044" strokeWidth="5"/><ellipse cx={position} cy="236" rx={eyes > 2 ? 12 : 15} ry={eyes > 2 ? 17 : 20} fill={`url(#eye-${monster.id})`}/><ellipse cx={position} cy="239" rx="6" ry="10" fill="#01040a"/><circle cx={position-7} cy="226" r="5" fill="#fff"/><path d={`M${position-24} 211Q${position} 196 ${position+24} 211`} fill="none" stroke="#253044" strokeWidth="5" strokeLinecap="round"/></g>)}
          <g className="monster-mouth">{monster.mouth?.includes("Fang") ? <><path d="M211 304Q260 342 309 304Q301 354 260 360Q219 354 211 304Z" fill="#29101c" stroke="#253044" strokeWidth="5"/><path d="M224 311l15 29 12-23m45-6-15 29-12-23" fill="#fff8e8" stroke="#d9e3e8" strokeWidth="2" strokeLinejoin="round"/><path d="M238 348q22-12 44 0" fill="none" stroke="#f472b6" strokeWidth="7" strokeLinecap="round"/></> : <path d={monster.mouth?.includes("Grin") ? "M211 311Q260 347 309 311" : "M222 320Q260 340 298 320"} fill="none" stroke="#f8fafc" strokeWidth="7" strokeLinecap="round"/>}</g>
        </g>
        <g className="monster-core" transform="translate(0 -70)" filter={`url(#monster-glow-${monster.id})`}><circle cx="260" cy="387" r="36" fill="#051525" stroke="#a5f3fc" strokeOpacity=".65" strokeWidth="4"/><circle cx="260" cy="387" r="25" fill={`url(#core-${monster.id})`}/><circle cx="251" cy="378" r="7" fill="#fff" opacity=".78"/></g>
        </g>
      </svg>
    </div>
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
