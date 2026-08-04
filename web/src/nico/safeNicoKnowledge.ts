import type { Language } from "../types";

export type NicoTopic =
  | "app"
  | "animals"
  | "robots"
  | "monsters"
  | "dinosaurs"
  | "creativity"
  | "science"
  | "math"
  | "feelings"
  | "privacy"
  | "safety"
  | "professions"
  | "unknown";

export type NicoConfidence = "high" | "guided" | "boundary" | "unknown";

export type NicoReply = {
  topic: NicoTopic;
  confidence: NicoConfidence;
  text: string;
  followUps: string[];
};

type LocalAnswer = {
  id: string;
  topic: NicoTopic;
  keywords: string[];
  en: string;
  es: string;
  followUps: { en: string[]; es: string[] };
};

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("en-US")
  .replace(/[^a-z0-9ñáéíóúü+\-*/().¿? ]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const entries: LocalAnswer[] = [
  {
    id: "what-here",
    topic: "app",
    keywords: ["what can i do", "que puedo hacer", "help app", "ayuda aplicacion", "nico world", "mundo de nico"],
    en: "You can build robots and pets, discover animals and dinosaurs, create monsters, stories, artwork and short movies, play learning games, and collect stars and badges. Everything is saved locally in this browser.",
    es: "Puedes construir robots y mascotas, descubrir animales y dinosaurios, crear monstruos, cuentos, arte y películas cortas, jugar juegos de aprendizaje y coleccionar estrellas e insignias. Todo se guarda localmente en este navegador.",
    followUps: {
      en: ["How do I earn stars?", "How do I make a movie?", "How do I back up my progress?"],
      es: ["¿Cómo gano estrellas?", "¿Cómo hago una película?", "¿Cómo respaldo mi progreso?"],
    },
  },
  {
    id: "stars",
    topic: "app",
    keywords: ["earn stars", "get stars", "ganar estrellas", "consigo estrellas", "stars", "estrellas"],
    en: "Stars come from real first-time progress: creating friends, completing robot certifications and field missions, solving new Arcade questions, discovering dinosaurs, training pets, reaching friendship milestones, and making creative projects. Repeating the same completed task does not award the same star again.",
    es: "Las estrellas vienen del progreso real por primera vez: crear amigos, completar certificaciones robot y misiones de campo, resolver preguntas nuevas, descubrir dinosaurios, entrenar mascotas, alcanzar hitos de amistad y crear proyectos. Repetir una tarea ya completada no entrega la misma estrella otra vez.",
    followUps: { en: ["What is a field mission?", "How do robot certifications work?"], es: ["¿Qué es una misión de campo?", "¿Cómo funcionan las certificaciones robot?"] },
  },
  {
    id: "movies",
    topic: "app",
    keywords: ["make a movie", "make video", "showtime", "hacer pelicula", "hacer video", "pelicula"],
    en: "Open Nico’s Clubhouse and choose Showtime. Pick one to three saved characters, choose poses, a background and caption, ask a grown-up to confirm, then make and download the video. The video stays on this device and is not stored inside the profile.",
    es: "Abre la Casa Club de Nico y elige Showtime. Selecciona de uno a tres personajes guardados, poses, fondo y texto, pide confirmación a un adulto y crea y descarga el video. El video permanece en este dispositivo y no se guarda dentro del perfil.",
    followUps: { en: ["Which characters can be in a movie?", "Is my movie uploaded?"], es: ["¿Qué personajes pueden estar en una película?", "¿Se sube mi película?"] },
  },
  {
    id: "backup",
    topic: "privacy",
    keywords: ["backup", "back up", "restore", "respaldo", "respaldar", "restaurar", "save progress", "guardar progreso"],
    en: "Open Parent & Settings and choose Download backup. Keep the JSON file somewhere a grown-up can find it. Restore backup imports that file as a new local profile. Nothing is uploaded by Nico’s World.",
    es: "Abre Adultos y ajustes y elige Descargar respaldo. Guarda el archivo JSON donde un adulto pueda encontrarlo. Restaurar respaldo importa ese archivo como un perfil local nuevo. Nico’s World no sube nada.",
    followUps: { en: ["Where is my progress stored?", "Can advertisers see my data?"], es: ["¿Dónde se guarda mi progreso?", "¿Los anunciantes pueden ver mis datos?"] },
  },
  {
    id: "privacy",
    topic: "privacy",
    keywords: ["private", "privacy", "data", "upload", "advertiser", "account", "privado", "privacidad", "datos", "subir", "anunciante", "cuenta"],
    en: "Nico’s World has no child account, advertising or analytics. Profiles and questions stay in this browser. Downloaded movie files stay on the device. Do not type your address, password, school name, phone number or other private information into any app.",
    es: "Nico’s World no tiene cuentas infantiles, publicidad ni analítica. Los perfiles y preguntas permanecen en este navegador. Los videos descargados quedan en el dispositivo. No escribas tu dirección, contraseña, escuela, teléfono u otra información privada en ninguna aplicación.",
    followUps: { en: ["How do I back up my progress?", "What information should stay private?"], es: ["¿Cómo respaldo mi progreso?", "¿Qué información debe permanecer privada?"] },
  },
  {
    id: "ai",
    topic: "app",
    keywords: ["are you ai", "are you an ai", "eres ia", "eres una ia", "inteligencia artificial"],
    en: "I am an AI-like local guide, not an online chatbot. I match your question to a safe bilingual library inside the app, can do simple arithmetic, and clearly say when I do not know. I do not send your question to an external AI service.",
    es: "Soy una guía local parecida a una IA, no un chatbot en línea. Relaciono tu pregunta con una biblioteca bilingüe segura dentro de la aplicación, puedo hacer aritmética sencilla y digo con claridad cuando no sé. No envío tu pregunta a un servicio externo de IA.",
    followUps: { en: ["What can you answer?", "Do my questions stay private?"], es: ["¿Qué puedes responder?", "¿Mis preguntas permanecen privadas?"] },
  },
  {
    id: "robots",
    topic: "robots",
    keywords: ["robot", "robots", "robo lab", "laboratorio robot", "certification", "certificacion"],
    en: "A robot combines a head, eyes, body, arms, base, backpack, power, personality, mood, voice and job. Save different robots, animate them, and complete one-time job certifications for each robot.",
    es: "Un robot combina cabeza, ojos, cuerpo, brazos, base, mochila, poder, personalidad, estado de ánimo, voz y trabajo. Guarda robots diferentes, anímalos y completa certificaciones de trabajo únicas para cada robot.",
    followUps: { en: ["How do robot certifications work?", "What robot should I build?"], es: ["¿Cómo funcionan las certificaciones robot?", "¿Qué robot debo construir?"] },
  },
  {
    id: "animals",
    topic: "animals",
    keywords: ["animal", "animals", "wildlife", "forest", "animales", "fauna", "bosque", "habitat", "hábitat"],
    en: "Animal Forest has a local field guide with real wildlife facts and optional Wikipedia/Wikimedia photos when internet is available. Discoveries remain usable offline after the app and data are cached. Field missions reward variety, favorites and careful exploration.",
    es: "Bosque animal tiene una guía local con datos reales de fauna y fotos opcionales de Wikipedia/Wikimedia cuando hay internet. Los descubrimientos siguen disponibles sin conexión después de guardar la aplicación y los datos. Las misiones premian variedad, favoritos y exploración cuidadosa.",
    followUps: { en: ["Which animal has three hearts?", "Why are habitats important?"], es: ["¿Qué animal tiene tres corazones?", "¿Por qué son importantes los hábitats?"] },
  },
  {
    id: "octopus",
    topic: "animals",
    keywords: ["three hearts", "3 hearts", "tres corazones", "octopus", "pulpo"],
    en: "An octopus has three hearts. Two move blood through the gills and one moves it through the rest of the body. Its blood uses copper-rich hemocyanin, which looks blue.",
    es: "Un pulpo tiene tres corazones. Dos mueven sangre por las branquias y uno por el resto del cuerpo. Su sangre usa hemocianina rica en cobre, que se ve azul.",
    followUps: { en: ["How smart are octopuses?", "What is a gill?"], es: ["¿Qué tan inteligentes son los pulpos?", "¿Qué es una branquia?"] },
  },
  {
    id: "habitat",
    topic: "animals",
    keywords: ["why habitat", "habitats important", "por que habitat", "habitats", "hábitats"],
    en: "A habitat provides food, water, shelter, space and the conditions a living thing needs. Protecting different habitats helps many connected species survive.",
    es: "Un hábitat proporciona alimento, agua, refugio, espacio y las condiciones que necesita un ser vivo. Proteger hábitats distintos ayuda a sobrevivir a muchas especies conectadas.",
    followUps: { en: ["What is an adaptation?", "Tell me an animal fact."], es: ["¿Qué es una adaptación?", "Dime un dato de animales."] },
  },
  {
    id: "dinosaurs",
    topic: "dinosaurs",
    keywords: ["dinosaur", "dinosaurs", "dinosaurio", "dinosaurios", "fossil", "fosil", "fósil"],
    en: "Dinosaur Valley uses period-identification expeditions. A correct investigation unlocks the dinosaur’s local field-guide fact, recovers a fossil and awards its one-time stars. Fossils are evidence of ancient organisms or their activity.",
    es: "Valle de dinosaurios usa expediciones para identificar periodos. Una investigación correcta desbloquea el dato local, recupera un fósil y entrega sus estrellas una sola vez. Los fósiles son evidencia de organismos antiguos o de su actividad.",
    followUps: { en: ["What is the Cretaceous period?", "How do fossils form?"], es: ["¿Qué es el periodo Cretácico?", "¿Cómo se forman los fósiles?"] },
  },
  {
    id: "fossil-form",
    topic: "dinosaurs",
    keywords: ["how fossils form", "form fossil", "como se forman los fosiles", "forman fosiles"],
    en: "Many fossils form when remains or traces are buried quickly by sediment. Over a very long time, minerals, pressure and chemical changes preserve a shape or replace parts of the original material.",
    es: "Muchos fósiles se forman cuando restos o huellas quedan enterrados rápidamente por sedimento. Durante muchísimo tiempo, minerales, presión y cambios químicos conservan una forma o reemplazan partes del material original.",
    followUps: { en: ["What can fossils teach us?", "Which dinosaurs lived in the Cretaceous?"], es: ["¿Qué nos enseñan los fósiles?", "¿Qué dinosaurios vivieron en el Cretácico?"] },
  },
  {
    id: "monsters",
    topic: "monsters",
    keywords: ["monster", "monsters", "monstruo", "monstruos", "friendship", "amistad"],
    en: "Monster Lab builds a layered imaginary friend. Monster Habitats lets you feed, play and groom it. Friendship milestones at 50 and 100 award finite progress, so care matters without rewarding endless tapping.",
    es: "Laboratorio de monstruos construye un amigo imaginario por capas. Hábitats permite alimentarlo, jugar y cepillarlo. Los hitos de amistad en 50 y 100 entregan progreso finito, así que el cuidado importa sin premiar toques infinitos.",
    followUps: { en: ["Help me invent a monster.", "How do I raise friendship?"], es: ["Ayúdame a inventar un monstruo.", "¿Cómo aumento la amistad?"] },
  },
  {
    id: "creativity",
    topic: "creativity",
    keywords: ["story", "stories", "art", "creative", "cuento", "cuentos", "arte", "creativo", "idea"],
    en: "Start with one clear choice: a hero, a place, and a problem. Then ask what the character notices, tries, learns and changes. Art Studio and Story Castle let you reopen and improve saved work instead of starting over.",
    es: "Empieza con una elección clara: protagonista, lugar y problema. Luego pregunta qué nota, intenta, aprende y cambia el personaje. Estudio de arte y Castillo de cuentos permiten reabrir y mejorar lo guardado.",
    followUps: { en: ["Give me a story idea.", "How can I improve my artwork?"], es: ["Dame una idea de cuento.", "¿Cómo mejoro mi obra?"] },
  },
  {
    id: "story-idea",
    topic: "creativity",
    keywords: ["story idea", "idea de cuento", "invent story", "inventar cuento"],
    en: "Try this: Nico and a shy robot discover that the stars above Animal Forest are blinking in a secret pattern. They must ask three animals for clues before sunrise.",
    es: "Prueba esto: Nico y un robot tímido descubren que las estrellas sobre el Bosque animal parpadean con un patrón secreto. Deben pedir pistas a tres animales antes del amanecer.",
    followUps: { en: ["Who should be the hero?", "What could the secret pattern mean?"], es: ["¿Quién debe ser el protagonista?", "¿Qué podría significar el patrón secreto?"] },
  },
  {
    id: "science-method",
    topic: "science",
    keywords: ["scientific method", "science experiment", "metodo cientifico", "experimento", "hipotesis", "hypothesis"],
    en: "A simple investigation asks a question, makes a testable prediction, changes one important thing, observes carefully, records results and checks whether the evidence supports the prediction. A grown-up should supervise real experiments.",
    es: "Una investigación sencilla hace una pregunta, crea una predicción comprobable, cambia una cosa importante, observa con cuidado, registra resultados y revisa si la evidencia apoya la predicción. Un adulto debe supervisar experimentos reales.",
    followUps: { en: ["What is a hypothesis?", "Suggest a safe observation activity."], es: ["¿Qué es una hipótesis?", "Sugiere una actividad segura de observación."] },
  },
  {
    id: "professions",
    topic: "professions",
    keywords: ["job", "profession", "career", "trabajo", "profesion", "profesión", "carrera", "outfit", "traje"],
    en: "Nico can explore 26 professions and adventures. A profession is more than clothing: it uses skills, learning, teamwork and responsibility. Dress Up lets you compare roles, then the selected outfit follows Nico into the guide, Clubhouse and Showtime.",
    es: "Nico puede explorar 26 profesiones y aventuras. Una profesión es más que ropa: usa habilidades, aprendizaje, trabajo en equipo y responsabilidad. Disfraces permite comparar roles y el traje sigue a Nico en la guía, Casa Club y Showtime.",
    followUps: { en: ["What does an engineer do?", "What does a veterinarian do?", "Which job uses science?"], es: ["¿Qué hace un ingeniero?", "¿Qué hace un veterinario?", "¿Qué trabajo usa ciencia?"] },
  },
  {
    id: "engineer",
    topic: "professions",
    keywords: ["engineer", "builder", "ingeniero", "ingeniera", "constructor", "constructora"],
    en: "Engineers define a problem, design possible solutions, build and test prototypes, learn from failures and improve the design. Builders use plans, measurement, tools and teamwork to make structures safely.",
    es: "Los ingenieros definen un problema, diseñan soluciones, construyen y prueban prototipos, aprenden de fallas y mejoran el diseño. Los constructores usan planos, medidas, herramientas y trabajo en equipo para crear estructuras con seguridad.",
    followUps: { en: ["What is a prototype?", "Give me a building challenge."], es: ["¿Qué es un prototipo?", "Dame un desafío de construcción."] },
  },
  {
    id: "veterinarian",
    topic: "professions",
    keywords: ["veterinarian", "vet", "veterinario", "veterinaria"],
    en: "A veterinarian studies animal health, examines animals, prevents disease, treats injuries and teaches people how to care for pets and wildlife. Real medical care must come from a qualified veterinarian and a trusted adult.",
    es: "Un veterinario estudia la salud animal, examina animales, previene enfermedades, trata lesiones y enseña cómo cuidar mascotas y fauna. La atención real debe venir de un veterinario calificado y un adulto de confianza.",
    followUps: { en: ["How can I care for a pet safely?", "What subjects do veterinarians study?"], es: ["¿Cómo cuido una mascota con seguridad?", "¿Qué materias estudian los veterinarios?"] },
  },
  {
    id: "feelings",
    topic: "feelings",
    keywords: ["sad", "angry", "scared", "worried", "lonely", "triste", "enojado", "enojada", "miedo", "preocupado", "preocupada", "solo", "sola"],
    en: "Big feelings are real and deserve support. Pause, breathe slowly, name the feeling, and tell a trusted adult what happened and what you need. If you feel unsafe or might hurt yourself or someone else, get a trusted adult immediately.",
    es: "Las emociones grandes son reales y merecen apoyo. Haz una pausa, respira lento, nombra la emoción y cuenta a un adulto de confianza qué pasó y qué necesitas. Si no te sientes seguro o podrías lastimarte o lastimar a alguien, busca a un adulto de confianza de inmediato.",
    followUps: { en: ["How can I calm my body?", "How do I ask an adult for help?"], es: ["¿Cómo calmo mi cuerpo?", "¿Cómo pido ayuda a un adulto?"] },
  },
  {
    id: "calm",
    topic: "feelings",
    keywords: ["calm down", "calm body", "calmar", "calmo mi cuerpo", "breathing", "respirar"],
    en: "Try a slow square breath with an adult: breathe in for four gentle counts, pause, breathe out for four, and pause. Repeat a few times without forcing your breath. Then name five things you can see and one person who can help.",
    es: "Prueba una respiración cuadrada lenta con un adulto: inhala cuatro tiempos suaves, pausa, exhala cuatro y pausa. Repite sin forzar la respiración. Luego nombra cinco cosas que ves y una persona que puede ayudarte.",
    followUps: { en: ["How do I name a feeling?", "How do I ask for help?"], es: ["¿Cómo nombro una emoción?", "¿Cómo pido ayuda?"] },
  },
];

const boundarySets: Array<{ patterns: string[]; en: string; es: string; followEn: string[]; followEs: string[] }> = [
  {
    patterns: ["hurt myself", "kill myself", "want to die", "suicide", "self harm", "lastimarme", "matarme", "quiero morir", "suicidio", "autolesion"],
    en: "I am glad you said something. I cannot keep you safe by myself. Go to a trusted adult right now and tell them exactly what you are feeling. If there is immediate danger, the adult should contact local emergency services. Do not stay alone with this feeling.",
    es: "Me alegra que lo hayas dicho. Yo no puedo mantenerte seguro por mí mismo. Ve con un adulto de confianza ahora y dile exactamente lo que sientes. Si hay peligro inmediato, el adulto debe contactar a los servicios locales de emergencia. No te quedes solo con esta emoción.",
    followEn: ["Who is a trusted adult near me?", "What words can I use to ask for help?"],
    followEs: ["¿Qué adulto de confianza está cerca?", "¿Qué palabras puedo usar para pedir ayuda?"],
  },
  {
    patterns: ["someone hurt me", "touching me", "secret touch", "abuse", "me lastima", "me toca", "toque secreto", "abuso"],
    en: "You deserve to be safe. Tell a trusted adult who is not involved, such as a parent, teacher, counselor or another safe caregiver. Keep telling safe adults until someone helps. If you are in immediate danger, move to a safer place and have an adult contact emergency services.",
    es: "Mereces estar seguro. Cuéntaselo a un adulto de confianza que no esté involucrado, como un padre, maestro, orientador u otro cuidador seguro. Sigue contándolo hasta que alguien ayude. Si hay peligro inmediato, ve a un lugar más seguro y pide a un adulto que contacte emergencias.",
    followEn: ["How do I tell a trusted adult?", "What if the first adult does not listen?"],
    followEs: ["¿Cómo se lo digo a un adulto de confianza?", "¿Qué hago si el primer adulto no escucha?"],
  },
  {
    patterns: ["chest pain", "cant breathe", "cannot breathe", "bleeding a lot", "poison", "dolor de pecho", "no puedo respirar", "sangro mucho", "veneno"],
    en: "That could need urgent real-world help. Tell a trusted adult immediately. The adult should contact local emergency services or a medical professional. I cannot diagnose or treat an emergency.",
    es: "Eso podría necesitar ayuda urgente en el mundo real. Díselo a un adulto de confianza inmediatamente. El adulto debe contactar servicios de emergencia o a un profesional médico. Yo no puedo diagnosticar ni tratar una emergencia.",
    followEn: ["Which trusted adult can I tell now?"],
    followEs: ["¿A qué adulto de confianza puedo avisar ahora?"],
  },
  {
    patterns: ["medicine", "dose", "diagnose", "symptoms", "medicina", "dosis", "diagnostico", "diagnóstico", "sintomas", "síntomas"],
    en: "I can share general learning information, but I cannot diagnose an illness or tell a child what medicine or dose to use. Show the question to a trusted adult, doctor, nurse or pharmacist.",
    es: "Puedo compartir información general de aprendizaje, pero no puedo diagnosticar una enfermedad ni decir a un niño qué medicina o dosis usar. Muestra la pregunta a un adulto de confianza, médico, enfermero o farmacéutico.",
    followEn: ["How can I describe symptoms to an adult?"],
    followEs: ["¿Cómo describo síntomas a un adulto?"],
  },
  {
    patterns: ["address", "password", "phone number", "school name", "meet stranger", "direccion", "dirección", "contraseña", "telefono", "teléfono", "nombre de escuela", "encontrar desconocido"],
    en: "Keep private details private. Do not share an address, password, phone number, school, exact location or private photo with me or an online stranger. Ask a trusted adult before communicating or meeting with anyone you only know online.",
    es: "Mantén privados los datos privados. No compartas dirección, contraseña, teléfono, escuela, ubicación exacta o foto privada conmigo ni con un desconocido en línea. Pregunta a un adulto de confianza antes de comunicarte o reunirte con alguien que solo conoces por internet.",
    followEn: ["What information is safe to share?", "How do I block an online stranger?"],
    followEs: ["¿Qué información es segura compartir?", "¿Cómo bloqueo a un desconocido en línea?"],
  },
];

function arithmetic(question: string, language: Language): NicoReply | null {
  const compact = question.replace(/\s+/g, "");
  const match = compact.match(/^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)\??$/);
  if (!match) return null;
  const left = Number(match[1]);
  const right = Number(match[3]);
  let result: number;
  if (match[2] === "+") result = left + right;
  else if (match[2] === "-") result = left - right;
  else if (match[2] === "*") result = left * right;
  else {
    if (right === 0) return {
      topic: "math",
      confidence: "guided",
      text: language === "es-MX" ? "No se puede dividir entre cero. Prueba con otro divisor." : "Division by zero is not defined. Try another divisor.",
      followUps: language === "es-MX" ? ["¿Por qué no se puede dividir entre cero?"] : ["Why is division by zero undefined?"],
    };
    result = left / right;
  }
  const shown = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(6)));
  return {
    topic: "math",
    confidence: "high",
    text: language === "es-MX" ? `${match[1]} ${match[2]} ${match[3]} = ${shown}.` : `${match[1]} ${match[2]} ${match[3]} = ${shown}.`,
    followUps: language === "es-MX" ? ["Dame otro problema de matemáticas.", "¿Cómo puedo comprobar la respuesta?"] : ["Give me another math problem.", "How can I check the answer?"],
  };
}

function scoreEntry(normalizedQuestion: string, entry: LocalAnswer): number {
  let score = 0;
  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) continue;
    if (normalizedQuestion === normalizedKeyword) score += 12;
    else if (normalizedQuestion.includes(normalizedKeyword)) score += Math.max(3, normalizedKeyword.split(" ").length * 2);
    else {
      const tokens = normalizedKeyword.split(" ");
      const matched = tokens.filter((token) => token.length > 2 && normalizedQuestion.includes(token)).length;
      score += matched;
    }
  }
  return score;
}

export const initialNicoQuestions = (language: Language): string[] => language === "es-MX"
  ? ["¿Qué puedo hacer aquí?", "¿Cómo gano estrellas?", "Dime un dato de animales.", "¿Eres una IA?", "¿Cómo respaldo mi progreso?"]
  : ["What can I do here?", "How do I earn stars?", "Tell me an animal fact.", "Are you an AI?", "How do I back up my progress?"];

export function answerSafeNicoQuestion(question: string, language: Language): NicoReply {
  const normalizedQuestion = normalize(question);
  for (const boundary of boundarySets) {
    if (boundary.patterns.some((pattern) => normalizedQuestion.includes(normalize(pattern)))) {
      return {
        topic: "safety",
        confidence: "boundary",
        text: language === "es-MX" ? boundary.es : boundary.en,
        followUps: language === "es-MX" ? boundary.followEs : boundary.followEn,
      };
    }
  }

  const mathReply = arithmetic(normalizedQuestion, language);
  if (mathReply) return mathReply;

  const ranked = entries
    .map((entry) => ({ entry, score: scoreEntry(normalizedQuestion, entry) }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  if (best && best.score >= 3) {
    return {
      topic: best.entry.topic,
      confidence: best.score >= 7 ? "high" : "guided",
      text: language === "es-MX" ? best.entry.es : best.entry.en,
      followUps: language === "es-MX" ? best.entry.followUps.es : best.entry.followUps.en,
    };
  }

  return {
    topic: "unknown",
    confidence: "unknown",
    text: language === "es-MX"
      ? "Todavía no sé esa respuesta. No quiero inventarla. Puedo ayudar con Nico’s World, animales, robots, monstruos, dinosaurios, creatividad, profesiones, emociones seguras, privacidad y aritmética sencilla. Para otra pregunta, pregúntale a un adulto de confianza o consulta una fuente confiable con él."
      : "I do not know that answer yet, and I do not want to invent it. I can help with Nico’s World, animals, robots, monsters, dinosaurs, creativity, professions, safe feelings support, privacy and simple arithmetic. For something else, ask a trusted adult or check a reliable source together.",
    followUps: initialNicoQuestions(language).slice(0, 3),
  };
}
