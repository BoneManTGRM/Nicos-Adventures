import type { Language, NicoProfessionId } from "../types";

export type CousinLead = "nico" | "becca" | "lua";
export type AdventureTheme = "brave" | "kind" | "curious";
export type CousinsDestinationId = "rainbow-forest" | "dino-valley" | "star-harbor" | "sky-castle" | "moon-garden";

type Localized = { en: string; "es-MX": string };

export type CousinsDestination = {
  id: CousinsDestinationId;
  icon: string;
  name: Localized;
  scene: Localized;
  challenge: Localized;
  answer: Localized;
  keepsake: Localized;
  beccaOutfit: Localized;
  luaOutfit: Localized;
  nicoProfession: NicoProfessionId;
  mapX: number;
  mapY: number;
  artIndex: number;
};

export type CousinsStoryPage = {
  title: string;
  text: string;
};

export const COUSINS_DESTINATIONS: CousinsDestination[] = [
  {
    id: "rainbow-forest", icon: "🌈", artIndex: 0, mapX: 18, mapY: 73, nicoProfession: "explorer",
    name: { en: "Rainbow Forest", "es-MX": "Bosque Arcoíris" },
    scene: { en: "a forest where glowing streams paint rainbows between the trees", "es-MX": "un bosque donde arroyos brillantes pintan arcoíris entre los árboles" },
    challenge: { en: "The firefly lanterns had lost their colors, so the cousins tested which glowing flowers could safely restore each wavelength.", "es-MX": "Las linternas de luciérnagas perdieron sus colores, así que los primos probaron qué flores brillantes podían restaurar cada longitud de onda." },
    answer: { en: "They observed, sorted, and matched every lantern to a flower, rebuilding the rainbow trail with nature science.", "es-MX": "Observaron, clasificaron y combinaron cada linterna con una flor, reconstruyendo el sendero arcoíris con ciencias naturales." },
    keepsake: { en: "a prism leaf that glows when friends help one another", "es-MX": "una hoja prisma que brilla cuando los amigos se ayudan" },
    beccaOutfit: { en: "Lavender woodland explorer", "es-MX": "Exploradora lavanda del bosque" },
    luaOutfit: { en: "Pink trail scout", "es-MX": "Exploradora rosa del sendero" },
  },
  {
    id: "dino-valley", icon: "🦕", artIndex: 1, mapX: 26, mapY: 25, nicoProfession: "dinosaur",
    name: { en: "Dinosaur Valley", "es-MX": "Valle de Dinosaurios" },
    scene: { en: "a sunny fossil excavation filled with giant footprints and gentle long-necked dinosaurs", "es-MX": "una excavación soleada llena de fósiles, huellas gigantes y dinosaurios de cuello largo" },
    challenge: { en: "A line of unusual tracks led to a partly buried fossil bed—and a baby dinosaur watching from the ferns.", "es-MX": "Una línea de huellas extrañas conducía a un yacimiento de fósiles parcialmente enterrado y a un dinosaurio bebé que observaba desde los helechos." },
    answer: { en: "They mapped the tracks, brushed the fossils carefully, measured every clue, and guided the baby safely back to its herd.", "es-MX": "Trazaron las huellas, limpiaron los fósiles con cuidado, midieron cada pista y guiaron al dinosaurio bebé de regreso a su manada." },
    keepsake: { en: "a fossil-shaped friendship badge", "es-MX": "una insignia de amistad con forma de fósil" },
    beccaOutfit: { en: "Junior paleontologist", "es-MX": "Paleontóloga juvenil" },
    luaOutfit: { en: "Fossil field helper", "es-MX": "Ayudante de fósiles" },
  },
  {
    id: "star-harbor", icon: "🚀", artIndex: 2, mapX: 81, mapY: 26, nicoProfession: "astronaut",
    name: { en: "Star Harbor", "es-MX": "Puerto Estelar" },
    scene: { en: "a sparkling space-science harbor where observatories and friendly rockets orbit the planets", "es-MX": "un puerto de ciencias espaciales donde observatorios y cohetes amistosos orbitan los planetas" },
    challenge: { en: "A tiny comet had tangled the harbor's guiding lights, so the cousins compared its orbit with a holographic constellation map.", "es-MX": "Un pequeño cometa enredó las luces del puerto, así que los primos compararon su órbita con un mapa holográfico de constelaciones." },
    answer: { en: "They calculated the repeating star pattern, tested it at the control console, and relit the launch runway in the perfect order.", "es-MX": "Calcularon el patrón repetitivo de estrellas, lo probaron en la consola y encendieron la pista de lanzamiento en el orden perfecto." },
    keepsake: { en: "a pocket star map that twinkles at bedtime", "es-MX": "un mapa estelar de bolsillo que brilla a la hora de dormir" },
    beccaOutfit: { en: "Cyan star navigator", "es-MX": "Navegante estelar cian" },
    luaOutfit: { en: "Junior moon pilot", "es-MX": "Piloto lunar juvenil" },
  },
  {
    id: "sky-castle", icon: "🏰", artIndex: 3, mapX: 50, mapY: 47, nicoProfession: "detective",
    name: { en: "Sky Castle", "es-MX": "Castillo del Cielo" },
    scene: { en: "a floating castle with cloud bridges, secret towers, and friendly dragons", "es-MX": "un castillo flotante con puentes de nubes, torres secretas y dragones amistosos" },
    challenge: { en: "The castle's music key was hidden behind three cloud-door riddles about sound, gears, and air pressure.", "es-MX": "La llave musical del castillo estaba escondida tras tres acertijos sobre sonido, engranes y presión del aire." },
    answer: { en: "They engineered a cloud-powered instrument, opened the doors, and returned music to every tower.", "es-MX": "Construyeron un instrumento impulsado por nubes, abrieron las puertas y devolvieron la música a cada torre." },
    keepsake: { en: "a silver bell that rings only for teamwork", "es-MX": "una campana de plata que suena solo con trabajo en equipo" },
    beccaOutfit: { en: "Royal adventure cape", "es-MX": "Capa de aventura real" },
    luaOutfit: { en: "Little cloud cartographer", "es-MX": "Pequeña cartógrafa de nubes" },
  },
  {
    id: "moon-garden", icon: "🦄", artIndex: 4, mapX: 80, mapY: 75, nicoProfession: "magician",
    name: { en: "Moon Garden", "es-MX": "Jardín de la Luna" },
    scene: { en: "a moonlit garden where crystal flowers sing and unicorns follow stardust trails", "es-MX": "un jardín lunar donde flores de cristal cantan y los unicornios siguen senderos de estrellas" },
    challenge: { en: "A shy unicorn needed help discovering which light, sound, and kindness made the sleeping moonflowers open.", "es-MX": "Una unicornio tímida necesitaba descubrir qué combinación de luz, sonido y amabilidad abría las flores lunares." },
    answer: { en: "They recorded their observations and found a gentle rhythm of light, chimes, and kind words that made the whole garden bloom.", "es-MX": "Registraron sus observaciones y encontraron un ritmo suave de luz, campanitas y palabras amables que hizo florecer todo el jardín." },
    keepsake: { en: "a moonflower charm filled with a tiny rainbow", "es-MX": "un dije de flor lunar con un pequeño arcoíris" },
    beccaOutfit: { en: "Lavender starlight cape", "es-MX": "Capa lavanda de luz estelar" },
    luaOutfit: { en: "Pink moonflower cape", "es-MX": "Capa rosa de flor lunar" },
  },
];

export const THEME_LABELS: Record<AdventureTheme, Localized> = {
  brave: { en: "Brave Quest", "es-MX": "Misión Valiente" },
  kind: { en: "Kindness Quest", "es-MX": "Misión Amable" },
  curious: { en: "Science Quest", "es-MX": "Misión Científica" },
};

const themeMoment: Record<AdventureTheme, Localized> = {
  brave: { en: "They took one brave step together and promised nobody would face the mystery alone.", "es-MX": "Dieron un paso valiente juntos y prometieron que nadie enfrentaría el misterio a solas." },
  kind: { en: "They stopped to listen, helped a new friend, and discovered that kindness was the strongest magic.", "es-MX": "Se detuvieron a escuchar, ayudaron a una nueva amiga y descubrieron que la amabilidad era la magia más fuerte." },
  curious: { en: "They asked clever questions, tested each clue, and let curiosity guide the way.", "es-MX": "Hicieron preguntas ingeniosas, probaron cada pista y dejaron que la curiosidad guiara el camino." },
};

const leadNames: Record<CousinLead, string> = { nico: "Nico", becca: "Becca", lua: "Lua" };

export function buildCousinsStory(
  language: Language,
  destinationId: CousinsDestinationId,
  theme: AdventureTheme,
  lead: CousinLead,
): CousinsStoryPage[] {
  const destination = COUSINS_DESTINATIONS.find((item) => item.id === destinationId) ?? COUSINS_DESTINATIONS[0];
  const place = destination.name[language];
  const leadName = leadNames[lead];
  if (language === "es-MX") {
    return [
      { title: `Rumbo a ${place}`, text: `Nico, Becca y Lua abrieron el libro-mapa. De sus páginas apareció ${destination.scene[language]}. ¡La nueva aventura había comenzado!` },
      { title: "Una pista inesperada", text: destination.challenge[language] },
      { title: `${leadName} tiene una idea`, text: `${leadName} miró con atención y encontró la primera pista. ${themeMoment[theme][language]}` },
      { title: "El camino se divide", text: "Dos rutas mágicas aparecieron delante de los primos. Para avanzar, tendrían que decidir cómo usar sus tres talentos juntos." },
      { title: "Los tres juntos", text: destination.answer[language] },
      { title: "Un recuerdo mágico", text: `La aventura terminó con sonrisas y ${destination.keepsake[language]}. El libro-mapa encendió otro destino para la próxima vez.` },
    ];
  }
  return [
    { title: `Onward to ${place}`, text: `Nico, Becca, and Lua opened the book-map. Out of its pages appeared ${destination.scene[language]}. Their newest adventure had begun!` },
    { title: "An unexpected clue", text: destination.challenge[language] },
    { title: `${leadName} has an idea`, text: `${leadName} looked closely and found the first clue. ${themeMoment[theme][language]}` },
    { title: "The path divides", text: "Two magical routes appeared ahead. To keep going, the cousins had to decide how to combine all three of their talents." },
    { title: "All three together", text: destination.answer[language] },
    { title: "A magical keepsake", text: `The adventure ended with smiles and ${destination.keepsake[language]}. The book-map lit up another destination for next time.` },
  ];
}
