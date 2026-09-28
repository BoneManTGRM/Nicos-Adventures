import type {Language} from '../types';
const t=(en:string,es:string):Record<Language,string>=>({en,'es-MX':es});
export const arcadeWords=[
 {id:'robot',picture:'🤖',label:t('robot','robot')},{id:'key',picture:'🔑',label:t('key','llave')},
 {id:'door',picture:'🚪',label:t('door','puerta')},{id:'battery',picture:'🔋',label:t('battery','batería')},
 {id:'apple',picture:'🍎',label:t('apple','manzana')},{id:'cat',picture:'🐱',label:t('cat','gato')},
 {id:'sun',picture:'☀️',label:t('sun','sol')},{id:'water',picture:'💧',label:t('water','agua')},
];
export type MatchCard={id:string;word:string;kind:'word'|'picture'};
export function shuffled<T>(items:readonly T[],seed:number):T[]{
 const list=[...items];let n=seed>>>0;
 for(let i=list.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[list[i],list[j]]=[list[j],list[i]];}
 return list;
}
export function makeDeck(seed:number,set:number):MatchCard[]{return shuffled(arcadeWords.slice(set===1?4:0,set===1?8:4).flatMap(w=>(['word','picture'] as const).map(kind=>({id:`${w.id}:${kind}`,word:w.id,kind}))),seed);}
export type MatchState={open:string[];matched:string[];attempts:number;feedback:'none'|'match'|'mismatch'};
export const initialMatch=():MatchState=>({open:[],matched:[],attempts:0,feedback:'none'});
export function turnCard(p:MatchState,deck:MatchCard[],id:string):MatchState{
 const card=deck.find(c=>c.id===id);if(!card||p.feedback==='mismatch'||p.matched.includes(card.word)||p.open.includes(id))return p;
 const open=p.feedback==='match'?[]:p.open;
 if(!open.length)return {...p,open:[id],feedback:'none'};
 const first=deck.find(c=>c.id===open[0]);if(!first)return p;
 const match=first.word===card.word&&first.kind!==card.kind;
 return {...p,open:[first.id,id],attempts:p.attempts+1,matched:match?[...p.matched,card.word]:p.matched,feedback:match?'match':'mismatch'};
}
export const clearMismatch=(p:MatchState):MatchState=>p.feedback==='mismatch'?{...p,open:[],feedback:'none'}:p;
export const phrases=[
 {id:'open',picture:'🔑 🚪',tokens:{en:['Open','the','door'],'es-MX':['Abre','la','puerta']}},
 {id:'find',picture:'🔎 🔑',tokens:{en:['Find','the','key'],'es-MX':['Encuentra','la','llave']}},
 {id:'robot',picture:'🤖 🔋',tokens:{en:['The','robot','needs','a','battery'],'es-MX':['El','robot','necesita','una','batería']}},
 {id:'water',picture:'🐱 💧',tokens:{en:['The','cat','drinks','water'],'es-MX':['El','gato','bebe','agua']}},
 {id:"sentence-5",picture:"🐶 ⚽",tokens:{en:["The", "dog", "plays"],'es-MX':["El", "perro", "juega"]}},
 {id:"sentence-6",picture:"🐦 🎵",tokens:{en:["The", "bird", "sings"],'es-MX':["El", "pájaro", "canta"]}},
 {id:"sentence-7",picture:"🐟 💧",tokens:{en:["The", "fish", "swims"],'es-MX':["El", "pez", "nada"]}},
 {id:"sentence-8",picture:"🐰 🥕",tokens:{en:["The", "rabbit", "eats", "carrots"],'es-MX':["El", "conejo", "come", "zanahorias"]}},
 {id:"sentence-9",picture:"🍎 😋",tokens:{en:["I", "eat", "an", "apple"],'es-MX':["Yo", "como", "una", "manzana"]}},
 {id:"sentence-10",picture:"🥛 💧",tokens:{en:["I", "drink", "water"],'es-MX':["Yo", "bebo", "agua"]}},
 {id:"sentence-11",picture:"🍌 🟡",tokens:{en:["The", "banana", "is", "yellow"],'es-MX':["El", "plátano", "es", "amarillo"]}},
 {id:"sentence-12",picture:"🍞 🍽️",tokens:{en:["The", "bread", "is", "on", "the", "plate"],'es-MX':["El", "pan", "está", "en", "el", "plato"]}},
 {id:"sentence-13",picture:"⚽ 🤲",tokens:{en:["Pass", "the", "ball"],'es-MX':["Pasa", "la", "pelota"]}},
 {id:"sentence-14",picture:"🧱 🏰",tokens:{en:["Build", "a", "tower"],'es-MX':["Construye", "una", "torre"]}},
 {id:"sentence-15",picture:"🖍️ ⭐",tokens:{en:["Draw", "a", "star"],'es-MX':["Dibuja", "una", "estrella"]}},
 {id:"sentence-16",picture:"📖 👀",tokens:{en:["Read", "the", "book"],'es-MX':["Lee", "el", "libro"]}},
 {id:"sentence-17",picture:"☀️ ✨",tokens:{en:["The", "sun", "shines"],'es-MX':["El", "sol", "brilla"]}},
 {id:"sentence-18",picture:"🌸 🩷",tokens:{en:["The", "flower", "is", "pink"],'es-MX':["La", "flor", "es", "rosa"]}},
 {id:"sentence-19",picture:"🌳 🟢",tokens:{en:["The", "tree", "has", "green", "leaves"],'es-MX':["El", "árbol", "tiene", "hojas", "verdes"]}},
 {id:"sentence-20",picture:"🦋 🌸",tokens:{en:["The", "butterfly", "visits", "the", "flower"],'es-MX':["La", "mariposa", "visita", "la", "flor"]}},
 {id:"sentence-21",picture:"🐱 🪑",tokens:{en:["The", "cat", "is", "under", "the", "chair"],'es-MX':["El", "gato", "está", "debajo", "de", "la", "silla"]}},
 {id:"sentence-22",picture:"📖 🛏️",tokens:{en:["The", "book", "is", "on", "the", "bed"],'es-MX':["El", "libro", "está", "en", "la", "cama"]}},
 {id:"sentence-23",picture:"⚽ 📦",tokens:{en:["The", "ball", "is", "inside", "the", "box"],'es-MX':["La", "pelota", "está", "dentro", "de", "la", "caja"]}},
 {id:"sentence-24",picture:"🐶 🚪",tokens:{en:["The", "dog", "is", "near", "the", "door"],'es-MX':["El", "perro", "está", "cerca", "de", "la", "puerta"]}},
 {id:"sentence-25",picture:"🧼 🤲",tokens:{en:["Wash", "your", "hands"],'es-MX':["Lávate", "las", "manos"]}},
 {id:"sentence-26",picture:"🪥 🦷",tokens:{en:["Brush", "your", "teeth"],'es-MX':["Cepíllate", "los", "dientes"]}},
 {id:"sentence-27",picture:"👟 👣",tokens:{en:["Put", "on", "your", "shoes"],'es-MX':["Ponte", "los", "zapatos"]}},
 {id:"sentence-28",picture:"🧸 📦",tokens:{en:["Put", "away", "the", "toys"],'es-MX':["Guarda", "los", "juguetes"]}},
 {id:"sentence-29",picture:"🤖 🔵",tokens:{en:["The", "robot", "has", "blue", "eyes"],'es-MX':["El", "robot", "tiene", "ojos", "azules"]}},
 {id:"sentence-30",picture:"🔑 📦",tokens:{en:["The", "key", "opens", "the", "box"],'es-MX':["La", "llave", "abre", "la", "caja"]}},
 {id:"sentence-31",picture:"🔋 🤖",tokens:{en:["Give", "the", "robot", "a", "battery"],'es-MX':["Dale", "una", "batería", "al", "robot"]}},
 {id:"sentence-32",picture:"🤖 🌉",tokens:{en:["The", "robot", "crosses", "the", "bridge"],'es-MX':["El", "robot", "cruza", "el", "puente"]}},
 {id:"sentence-33",picture:"🐢 🐾",tokens:{en:["The", "turtle", "walks", "slowly"],'es-MX':["La", "tortuga", "camina", "despacio"]}},
 {id:"sentence-34",picture:"🐸 💦",tokens:{en:["The", "frog", "jumps", "into", "the", "pond"],'es-MX':["La", "rana", "salta", "al", "estanque"]}},
 {id:"sentence-35",picture:"🐝 🌼",tokens:{en:["The", "bee", "lands", "on", "a", "flower"],'es-MX':["La", "abeja", "se", "posa", "en", "una", "flor"]}},
 {id:"sentence-36",picture:"🦆 🐥",tokens:{en:["The", "duck", "swims", "with", "its", "babies"],'es-MX':["El", "pato", "nada", "con", "sus", "crías"]}},
 {id:"sentence-37",picture:"🎒 📚",tokens:{en:["I", "carry", "books", "in", "my", "backpack"],'es-MX':["Llevo", "libros", "en", "mi", "mochila"]}},
 {id:"sentence-38",picture:"✏️ 📄",tokens:{en:["I", "write", "with", "a", "pencil"],'es-MX':["Escribo", "con", "un", "lápiz"]}},
 {id:"sentence-39",picture:"✂️ 📄",tokens:{en:["We", "cut", "paper", "with", "scissors"],'es-MX':["Cortamos", "papel", "con", "tijeras"]}},
 {id:"sentence-40",picture:"🖍️ 🌈",tokens:{en:["We", "draw", "a", "colorful", "rainbow"],'es-MX':["Dibujamos", "un", "arcoíris", "de", "colores"]}},
 {id:"sentence-41",picture:"🧺 🍓",tokens:{en:["We", "put", "strawberries", "in", "the", "basket"],'es-MX':["Ponemos", "fresas", "en", "la", "canasta"]}},
 {id:"sentence-42",picture:"🥪 🌳",tokens:{en:["We", "eat", "sandwiches", "under", "the", "tree"],'es-MX':["Comemos", "sándwiches", "debajo", "del", "árbol"]}},
 {id:"sentence-43",picture:"💧 🌱",tokens:{en:["I", "water", "the", "little", "plant"],'es-MX':["Riego", "la", "plantita"]}},
 {id:"sentence-44",picture:"🌻 ☀️",tokens:{en:["The", "sunflower", "grows", "toward", "the", "sun"],'es-MX':["El", "girasol", "crece", "hacia", "el", "sol"]}},
 {id:"sentence-45",picture:"🚀 🌙",tokens:{en:["The", "rocket", "travels", "to", "the", "moon"],'es-MX':["El", "cohete", "viaja", "a", "la", "luna"]}},
 {id:"sentence-46",picture:"⭐ 🌌",tokens:{en:["We", "see", "bright", "stars", "at", "night"],'es-MX':["Vemos", "estrellas", "brillantes", "por", "la", "noche"]}},
 {id:"sentence-47",picture:"🤖 🔭",tokens:{en:["The", "robot", "looks", "through", "the", "telescope"],'es-MX':["El", "robot", "mira", "por", "el", "telescopio"]}},
 {id:"sentence-48",picture:"🏠 🤖",tokens:{en:["We", "help", "the", "robot", "get", "home"],'es-MX':["Ayudamos", "al", "robot", "a", "llegar", "a", "casa"]}},
 {id:"level-1",picture:"🏃 🏫",tokens:{en:["I", "walked", "to", "school", "yesterday"],'es-MX':["Ayer", "caminé", "a", "la", "escuela"]}},
 {id:"level-2",picture:"🐘 🐭",tokens:{en:["The", "elephant", "is", "bigger", "than", "the", "mouse"],'es-MX':["El", "elefante", "es", "más", "grande", "que", "el", "ratón"]}},
 {id:"level-3",picture:"📖 🛏️",tokens:{en:["She", "is", "reading", "in", "her", "bedroom"],'es-MX':["Ella", "está", "leyendo", "en", "su", "habitación"]}},
 {id:"level-4",picture:"⚽ 🏞️",tokens:{en:["We", "played", "in", "the", "park", "yesterday"],'es-MX':["Ayer", "jugamos", "en", "el", "parque"]}},
 {id:"level-5",picture:"🥪 🍽️",tokens:{en:["He", "ate", "a", "sandwich", "for", "lunch"],'es-MX':["Él", "comió", "un", "sándwich", "a", "la", "hora", "de", "comer"]}},
 {id:"level-6",picture:"🐶 🏃",tokens:{en:["The", "dog", "ran", "to", "the", "garden"],'es-MX':["El", "perro", "corrió", "al", "jardín"]}},
 {id:"level-7",picture:"🧥 ❄️",tokens:{en:["Put", "on", "a", "coat", "because", "it", "is", "cold"],'es-MX':["Ponte", "un", "abrigo", "porque", "hace", "frío"]}},
 {id:"level-8",picture:"🐱 🐶",tokens:{en:["The", "cat", "is", "smaller", "than", "the", "dog"],'es-MX':["El", "gato", "es", "más", "pequeño", "que", "el", "perro"]}},
 {id:"level-9",picture:"🎵 🏠",tokens:{en:["I", "like", "singing", "at", "home"],'es-MX':["Me", "gusta", "cantar", "en", "casa"]}},
 {id:"level-10",picture:"🚲 🏞️",tokens:{en:["She", "rides", "her", "bike", "every", "morning"],'es-MX':["Ella", "anda", "en", "bicicleta", "cada", "mañana"]}},
 {id:"level-11",picture:"🏊 💧",tokens:{en:["He", "is", "good", "at", "swimming"],'es-MX':["Él", "es", "bueno", "para", "nadar"]}},
 {id:"level-12",picture:"📚 🏫",tokens:{en:["We", "went", "to", "the", "library", "after", "school"],'es-MX':["Fuimos", "a", "la", "biblioteca", "después", "de", "la", "escuela"]}},
 {id:"level-13",picture:"🌧️ 🏠",tokens:{en:["We", "stayed", "inside", "because", "it", "was", "cold"],'es-MX':["Nos", "quedamos", "adentro", "porque", "hacía", "frío"]}},
 {id:"level-14",picture:"🍎 🍌",tokens:{en:["I", "would", "like", "an", "apple", "please"],'es-MX':["Quisiera", "una", "manzana", "por", "favor"]}},
 {id:"level-15",picture:"🎒 🪑",tokens:{en:["Your", "bag", "is", "behind", "the", "chair"],'es-MX':["Tu", "mochila", "está", "detrás", "de", "la", "silla"]}},
 {id:"level-16",picture:"🐢 🐰",tokens:{en:["The", "rabbit", "is", "faster", "than", "the", "turtle"],'es-MX':["El", "conejo", "es", "más", "rápido", "que", "la", "tortuga"]}},
 {id:"level-17",picture:"📖 🚪",tokens:{en:["I", "was", "reading", "when", "she", "arrived"],'es-MX':["Yo", "estaba", "leyendo", "cuando", "ella", "llegó"]}},
 {id:"level-18",picture:"🌧️ 🎲",tokens:{en:["We", "were", "playing", "when", "it", "started", "raining"],'es-MX':["Estábamos", "jugando", "cuando", "empezó", "a", "llover"]}},
 {id:"level-19",picture:"🧺 🌳",tokens:{en:["We", "will", "have", "a", "picnic", "tomorrow"],'es-MX':["Mañana", "haremos", "un", "pícnic"]}},
 {id:"level-20",picture:"📚 ✅",tokens:{en:["I", "have", "finished", "my", "book"],'es-MX':["He", "terminado", "mi", "libro"]}},
 {id:"level-21",picture:"🌧️ 🏠",tokens:{en:["If", "it", "rains", "we", "will", "stay", "inside"],'es-MX':["Si", "llueve", "nos", "quedaremos", "adentro"]}},
 {id:"level-22",picture:"🔑 👀",tokens:{en:["This", "is", "the", "key", "that", "I", "found"],'es-MX':["Esta", "es", "la", "llave", "que", "encontré"]}},
 {id:"level-23",picture:"🏔️ ☁️",tokens:{en:["That", "is", "the", "highest", "mountain", "here"],'es-MX':["Esa", "es", "la", "montaña", "más", "alta", "de", "aquí"]}},
 {id:"level-24",picture:"🍽️ 🤲",tokens:{en:["You", "should", "wash", "your", "hands", "before", "eating"],'es-MX':["Deberías", "lavarte", "las", "manos", "antes", "de", "comer"]}},
 {id:"level-25",picture:"🎬 🏠",tokens:{en:["We", "have", "already", "seen", "that", "movie"],'es-MX':["Ya", "hemos", "visto", "esa", "película"]}},
 {id:"level-26",picture:"🧩 🧠",tokens:{en:["This", "puzzle", "is", "more", "difficult", "than", "that", "one"],'es-MX':["Este", "rompecabezas", "es", "más", "difícil", "que", "ese"]}},
 {id:"level-27",picture:"📞 🎨",tokens:{en:["She", "was", "painting", "when", "the", "phone", "rang"],'es-MX':["Ella", "estaba", "pintando", "cuando", "sonó", "el", "teléfono"]}},
 {id:"level-28",picture:"🎒 📚",tokens:{en:["I", "will", "pack", "my", "bag", "after", "breakfast"],'es-MX':["Prepararé", "mi", "mochila", "después", "del", "desayuno"]}},
 {id:"level-29",picture:"🚲 🔧",tokens:{en:["My", "bike", "is", "made", "of", "metal"],'es-MX':["Mi", "bicicleta", "está", "hecha", "de", "metal"]}},
 {id:"level-30",picture:"👩 📚",tokens:{en:["She", "is", "the", "teacher", "who", "helped", "me"],'es-MX':["Ella", "es", "la", "maestra", "que", "me", "ayudó"]}},
 {id:"level-31",picture:"🏠 🌳",tokens:{en:["We", "have", "lived", "here", "for", "two", "years"],'es-MX':["Hemos", "vivido", "aquí", "durante", "dos", "años"]}},
 {id:"level-32",picture:"🌱 💧",tokens:{en:["If", "you", "water", "the", "plant", "it", "will", "grow"],'es-MX':["Si", "riegas", "la", "planta", "crecerá"]}},
] as const;
export function checkSentence(tokens:readonly string[],order:readonly number[]):boolean{return order.length===tokens.length&&new Set(order).size===tokens.length&&order.every((id,i)=>Number.isInteger(id)&&id>=0&&id<tokens.length&&tokens[id]===tokens[i]);}

export function hasScoreCapacity(scores:Record<string,number>,key:string):boolean{return Object.hasOwn(scores,key)||Object.keys(scores).length<100;}

// Suggested practice groupings, not an assessment or complete exam syllabus.
export type SentenceLevel='all'|'pre-a1'|'a1'|'a2';
export function sentencesForLevel(level:SentenceLevel){
 if(level==='pre-a1')return phrases.slice(0,16);
 if(level==='a1')return phrases.slice(48,64);
 if(level==='a2')return phrases.slice(64,80);
 return [...phrases];
}
