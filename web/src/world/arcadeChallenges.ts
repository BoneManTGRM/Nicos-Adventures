import type { Localized } from "../i18n/core";

export type ArcadeQuestion = {
  id: string;
  prompt: Localized;
  options: Localized[];
  correctIndex: number;
  explanation: Localized;
};

const same = (value: string): Localized => ({ en: value, "es-MX": value });

export const ARCADE_QUESTIONS: Record<string, ArcadeQuestion[]> = {
  "Animal Clue": [
    {
      id: "three-hearts",
      prompt: { en: "Which animal has three hearts?", "es-MX": "¿Qué animal tiene tres corazones?" },
      options: [
        { en: "Giant Pacific octopus", "es-MX": "Pulpo gigante del Pacífico" },
        { en: "Blue whale", "es-MX": "Ballena azul" },
        { en: "Sea turtle", "es-MX": "Tortuga marina" },
      ],
      correctIndex: 0,
      explanation: { en: "An octopus has three hearts and blue blood.", "es-MX": "Un pulpo tiene tres corazones y sangre azul." },
    },
    {
      id: "glider",
      prompt: { en: "Which animal glides between trees instead of truly flying?", "es-MX": "¿Qué animal planea entre árboles en lugar de volar de verdad?" },
      options: [
        { en: "Flying squirrel", "es-MX": "Ardilla voladora" },
        { en: "Toucan", "es-MX": "Tucán" },
        { en: "Arctic fox", "es-MX": "Zorro ártico" },
      ],
      correctIndex: 0,
      explanation: { en: "A flying squirrel uses a skin membrane like a controllable parachute.", "es-MX": "La ardilla voladora usa una membrana de piel como paracaídas controlable." },
    },
    {
      id: "black-skin",
      prompt: { en: "Which animal has black skin under clear-looking fur?", "es-MX": "¿Qué animal tiene piel negra debajo de un pelaje que parece blanco?" },
      options: [
        { en: "Polar bear", "es-MX": "Oso polar" },
        { en: "Emperor penguin", "es-MX": "Pingüino emperador" },
        { en: "Walrus", "es-MX": "Morsa" },
      ],
      correctIndex: 0,
      explanation: { en: "Polar bear skin is black, while its hollow fur scatters light.", "es-MX": "La piel del oso polar es negra y su pelaje hueco dispersa la luz." },
    },
  ],
  "Pattern Power": [
    {
      id: "even-numbers",
      prompt: { en: "What comes next: 2, 4, 6, __?", "es-MX": "¿Qué sigue: 2, 4, 6, __?" },
      options: [same("7"), same("8"), same("10")],
      correctIndex: 1,
      explanation: { en: "The pattern adds 2 each time.", "es-MX": "El patrón suma 2 cada vez." },
    },
    {
      id: "colors",
      prompt: { en: "What comes next: red, blue, red, blue, __?", "es-MX": "¿Qué sigue: rojo, azul, rojo, azul, __?" },
      options: [{ en: "Red", "es-MX": "Rojo" }, { en: "Green", "es-MX": "Verde" }, { en: "Yellow", "es-MX": "Amarillo" }],
      correctIndex: 0,
      explanation: { en: "The two colors alternate.", "es-MX": "Los dos colores se alternan." },
    },
    {
      id: "growing",
      prompt: { en: "What comes next: 1, 1, 2, 3, __?", "es-MX": "¿Qué sigue: 1, 1, 2, 3, __?" },
      options: [same("4"), same("5"), same("6")],
      correctIndex: 1,
      explanation: { en: "Each number is the sum of the two before it.", "es-MX": "Cada número es la suma de los dos anteriores." },
    },
  ],
  "Robot Memory": [
    {
      id: "star-gear-rocket",
      prompt: { en: "Remember: star, gear, rocket. Which item was second?", "es-MX": "Recuerda: estrella, engrane, cohete. ¿Cuál fue el segundo?" },
      options: [{ en: "Star", "es-MX": "Estrella" }, { en: "Gear", "es-MX": "Engrane" }, { en: "Rocket", "es-MX": "Cohete" }],
      correctIndex: 1,
      explanation: { en: "Gear was between star and rocket.", "es-MX": "Engrane estaba entre estrella y cohete." },
    },
    {
      id: "blue-red-green",
      prompt: { en: "Remember: blue, red, green. Which color came last?", "es-MX": "Recuerda: azul, rojo, verde. ¿Qué color fue el último?" },
      options: [{ en: "Green", "es-MX": "Verde" }, { en: "Blue", "es-MX": "Azul" }, { en: "Red", "es-MX": "Rojo" }],
      correctIndex: 0,
      explanation: { en: "Green was the third and final color.", "es-MX": "Verde fue el tercer y último color." },
    },
    {
      id: "three-symbols",
      prompt: { en: "Remember: moon, key, paw. Which symbol came first?", "es-MX": "Recuerda: luna, llave, huella. ¿Qué símbolo fue primero?" },
      options: [{ en: "Paw", "es-MX": "Huella" }, { en: "Moon", "es-MX": "Luna" }, { en: "Key", "es-MX": "Llave" }],
      correctIndex: 1,
      explanation: { en: "Moon started the sequence.", "es-MX": "Luna inició la secuencia." },
    },
  ],
  "Dino Dig": [
    {
      id: "trex-period",
      prompt: { en: "Tyrannosaurus rex lived during which period?", "es-MX": "¿En qué periodo vivió el Tyrannosaurus rex?" },
      options: [{ en: "Cretaceous", "es-MX": "Cretácico" }, { en: "Jurassic", "es-MX": "Jurásico" }, { en: "Triassic", "es-MX": "Triásico" }],
      correctIndex: 0,
      explanation: { en: "T. rex lived late in the Cretaceous period.", "es-MX": "El T. rex vivió al final del periodo Cretácico." },
    },
    {
      id: "stegosaurus-period",
      prompt: { en: "Stegosaurus lived during which period?", "es-MX": "¿En qué periodo vivió el Stegosaurus?" },
      options: [{ en: "Jurassic", "es-MX": "Jurásico" }, { en: "Cretaceous", "es-MX": "Cretácico" }, { en: "Modern", "es-MX": "Actual" }],
      correctIndex: 0,
      explanation: { en: "Stegosaurus lived during the Jurassic period.", "es-MX": "Stegosaurus vivió durante el periodo Jurásico." },
    },
    {
      id: "fossil",
      prompt: { en: "What can a fossil help scientists learn?", "es-MX": "¿Qué puede ayudar a aprender un fósil?" },
      options: [
        { en: "How ancient life looked and lived", "es-MX": "Cómo era y vivía la vida antigua" },
        { en: "Tomorrow's weather", "es-MX": "El clima de mañana" },
        { en: "A robot password", "es-MX": "Una contraseña de robot" },
      ],
      correctIndex: 0,
      explanation: { en: "Fossils preserve evidence of ancient organisms and environments.", "es-MX": "Los fósiles conservan evidencia de organismos y ambientes antiguos." },
    },
  ],
  "Monster Maze": [
    {
      id: "turn-right",
      prompt: { en: "You face north and turn right. Which direction do you face?", "es-MX": "Miras al norte y giras a la derecha. ¿Hacia dónde miras?" },
      options: [{ en: "East", "es-MX": "Este" }, { en: "West", "es-MX": "Oeste" }, { en: "South", "es-MX": "Sur" }],
      correctIndex: 0,
      explanation: { en: "Right from north points east.", "es-MX": "A la derecha del norte está el este." },
    },
    {
      id: "opposite-east",
      prompt: { en: "Which direction is opposite east?", "es-MX": "¿Qué dirección es opuesta al este?" },
      options: [{ en: "North", "es-MX": "Norte" }, { en: "West", "es-MX": "Oeste" }, { en: "South", "es-MX": "Sur" }],
      correctIndex: 1,
      explanation: { en: "West is directly opposite east.", "es-MX": "Oeste está directamente opuesto al este." },
    },
    {
      id: "two-lefts",
      prompt: { en: "You face south and turn left twice. Which direction do you face?", "es-MX": "Miras al sur y giras a la izquierda dos veces. ¿Hacia dónde miras?" },
      options: [{ en: "North", "es-MX": "Norte" }, { en: "East", "es-MX": "Este" }, { en: "West", "es-MX": "Oeste" }],
      correctIndex: 0,
      explanation: { en: "Two left turns make a half-turn, so south becomes north.", "es-MX": "Dos giros a la izquierda forman media vuelta: sur se convierte en norte." },
    },
  ],
  "Rocket Math": [
    {
      id: "addition",
      prompt: { en: "A rocket has 7 fuel cells and receives 5 more. How many now?", "es-MX": "Un cohete tiene 7 celdas de combustible y recibe 5 más. ¿Cuántas tiene?" },
      options: [same("10"), same("12"), same("13")],
      correctIndex: 1,
      explanation: { en: "7 + 5 = 12.", "es-MX": "7 + 5 = 12." },
    },
    {
      id: "subtraction",
      prompt: { en: "There are 15 stars. A cloud hides 6. How many remain visible?", "es-MX": "Hay 15 estrellas. Una nube oculta 6. ¿Cuántas siguen visibles?" },
      options: [same("8"), same("9"), same("10")],
      correctIndex: 1,
      explanation: { en: "15 − 6 = 9.", "es-MX": "15 − 6 = 9." },
    },
    {
      id: "groups",
      prompt: { en: "Three robots each carry 4 tools. How many tools altogether?", "es-MX": "Tres robots llevan 4 herramientas cada uno. ¿Cuántas herramientas hay en total?" },
      options: [same("7"), same("10"), same("12")],
      correctIndex: 2,
      explanation: { en: "3 groups of 4 make 12.", "es-MX": "3 grupos de 4 forman 12." },
    },
  ],
};
