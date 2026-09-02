import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { optionLabel } from "./i18n/display";
import type { AnimalRecord, Language, MonsterRecord } from "./types";
import { monsterAccessoryLayout, monsterAccessoryTransform, monsterBodyArtStyle } from "./world/monsterArt";
import { MonsterFaceArt, monsterFaceTreatment } from "./world/monsterFaceArt";
import { monsterColorSwatch } from "./world/monsterCreatureStudio";
import "./monster-stage-premium.css";
import "./monster-faces.css";

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
  const faceTreatment = monsterFaceTreatment(monster.body);
  const hasWings = !monster.wings.toLowerCase().includes("no ");
  const hasHorns = !String(monster.horns || "No horns").toLowerCase().includes("no ");
  const hasTail = monster.body !== "Lizard Alien" && !String(monster.tail || "No tail").toLowerCase().includes("no ");
  const accessoryLayout = monsterAccessoryLayout(monster.body);
  return <article className={`monster-stage monster-stage--${action}`} style={{ "--monster-main": color } as CSSProperties}>
    <div className="monster-stage__environment" aria-hidden="true"><i/><i/><i/></div>
    <div className="monster-atmosphere" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div
      className={`monster-v2 monster-family--${family} monster-texture--${texture}`}
      data-monster-body-art={monster.body}
      data-monster-arms-art={monster.arms}
      data-monster-pattern={pattern}
      data-monster-horns={hasHorns ? "on" : "off"}
      data-monster-face-treatment={faceTreatment}
      style={monsterBodyArtStyle(monster.body, color, monster.arms)}
      role="img"
      aria-label={`${monster.name}, ${optionLabel(monster.body, language)} ${language === "es-MX" ? "monstruo" : "monster"}`}
    >
      <svg className="monster-traits monster-traits--rear" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
        <linearGradient id={`rear-limb-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".42"/><stop offset=".23" stopColor={color}/><stop offset=".72" stopColor={color}/><stop offset="1" stopColor="#020817"/></linearGradient>
        <linearGradient id={`rear-wing-${monster.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".62"/><stop offset=".35" stopColor={color} stopOpacity=".76"/><stop offset="1" stopColor="#111827" stopOpacity=".9"/></linearGradient>
        </defs>
        <ellipse className="monster-ground-shadow" cx="260" cy="470" rx="118" ry="18" fill="#01030a" opacity=".55"/>
        <g className="monster-anatomy monster-anatomy--rear">
        {hasWings && <g className="monster-wings" transform={monsterAccessoryTransform("wings", accessoryLayout.wings)} stroke="#06101f" strokeWidth="8" strokeLinejoin="round"><path d="M166 230C101 122 43 142 72 252c10 38 28 68 54 91l76-70z" fill={`url(#rear-wing-${monster.id})`}/><path d="M354 230c65-108 123-88 94 22-10 38-28 68-54 91l-76-70z" fill={`url(#rear-wing-${monster.id})`}/><path d="M84 190q50 36 93 96M436 190q-50 36-93 96" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="5"/></g>}
        {hasTail && <g className="monster-tail" transform={monsterAccessoryTransform("tail", accessoryLayout.tail)}><path d="M367 349c101 8 109 91 47 113 22-28 4-54-45-51" fill="none" stroke="#031020" strokeWidth="38" strokeLinecap="round"/><path d="M367 346c97 9 98 77 49 99" fill="none" stroke={`url(#rear-limb-${monster.id})`} strokeWidth="24" strokeLinecap="round"/><path d="M388 357q47 10 53 38" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="5" strokeLinecap="round"/></g>}
        </g>
      </svg>
      <span className="monster-premium-body" aria-hidden="true">
        <span className="monster-premium-body__art" />
        <span className="monster-premium-body__tint" />
        <span className="monster-premium-body__pattern" />
      </span>
      <svg className="monster-traits monster-traits--front" viewBox="0 0 520 520" aria-hidden="true">
        <defs>
        <linearGradient id={`horn-${monster.id}`} x1="0" y1="0" x2=".75" y2="1"><stop stopColor="#fff" stopOpacity=".82"/><stop offset=".38" stopColor={color}/><stop offset="1" stopColor="#071426"/></linearGradient>
        <radialGradient id={`eye-${monster.id}`} cx="35%" cy="30%"><stop offset="0" stopColor="#fff"/><stop offset=".32" stopColor={color}/><stop offset=".74" stopColor="#164e63"/><stop offset="1" stopColor="#020617"/></radialGradient>
        <radialGradient id={`core-${monster.id}`} cx="38%" cy="32%"><stop offset="0" stopColor="#fff"/><stop offset=".24" stopColor="#cffafe"/><stop offset=".62" stopColor="#22d3ee"/><stop offset="1" stopColor="#164e63"/></radialGradient>
        <filter id={`monster-glow-${monster.id}`}><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g className="monster-anatomy monster-anatomy--front">
        {hasHorns && <g className="monster-horns" transform={monsterAccessoryTransform("horns", accessoryLayout.horns)} fill={`url(#horn-${monster.id})`} stroke="#071426" strokeWidth="6" strokeLinejoin="round" filter={`url(#monster-glow-${monster.id})`}><path d="M205 164l-25-67q34 19 56 51z"/><path d="M315 164l25-67q-34 19-56 51z"/><path d="M191 116l29 37m109-37-29 37" stroke="#fff" strokeOpacity=".3" strokeWidth="3"/></g>}
        <MonsterFaceArt body={monster.body} monsterId={monster.id} color={color} layout={accessoryLayout} />
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
