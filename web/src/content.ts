import type { Language, LocalMission, LocalizedText, WorldSection } from "./types";

export const text = (value: LocalizedText, language: Language): string => value[language];

export const UI_COPY = {
  commandOnline: { en: "ROBO COMMAND ONLINE", "es-MX": "COMANDO ROBOT EN LÍNEA" },
  worldStars: { en: "WORLD STARS", "es-MX": "ESTRELLAS DEL MUNDO" },
  selectDestination: { en: "SELECT DESTINATION", "es-MX": "ELIGE UN DESTINO" },
  enter: { en: "ENTER", "es-MX": "ENTRAR" },
  lockedAt: { en: "UNLOCKS AT", "es-MX": "SE DESBLOQUEA CON" },
  mission: { en: "MISSION", "es-MX": "MISIÓN" },
  missionComplete: { en: "MISSION COMPLETE", "es-MX": "MISIÓN COMPLETADA" },
  completeMission: { en: "Complete Mission", "es-MX": "Completar misión" },
  replayMission: { en: "Already completed", "es-MX": "Ya completada" },
  activities: { en: "WHAT YOU CAN DO", "es-MX": "LO QUE PUEDES HACER" },
  launchPose: { en: "Launch Pose", "es-MX": "Pose de despegue" },
  wavePose: { en: "High Wave", "es-MX": "Saludo alto" },
  celebrate: { en: "Celebrate", "es-MX": "Celebrar" },
  idle: { en: "Stand Ready", "es-MX": "Listo para la misión" },
  world: { en: "World", "es-MX": "Mundo" },
  robots: { en: "Robots", "es-MX": "Robots" },
  missions: { en: "Missions", "es-MX": "Misiones" },
  home: { en: "Home", "es-MX": "Casa" },
  parent: { en: "Parent", "es-MX": "Adultos" },
  localSave: { en: "Saved on this device", "es-MX": "Guardado en este dispositivo" },
  localOnly: {
    en: "No account or server is used. This profile stays in this browser.",
    "es-MX": "No se usa cuenta ni servidor. Este perfil se queda en este navegador.",
  },
  player: { en: "Player", "es-MX": "Jugador" },
  language: { en: "Language", "es-MX": "Idioma" },
  english: { en: "English", "es-MX": "Inglés" },
  mexicanSpanish: { en: "Mexican Spanish", "es-MX": "Español de México" },
  profiles: { en: "Local player profiles", "es-MX": "Perfiles locales de jugador" },
  createProfile: { en: "Create profile", "es-MX": "Crear perfil" },
  profileName: { en: "Player name", "es-MX": "Nombre del jugador" },
  switchProfile: { en: "Switch profile", "es-MX": "Cambiar de perfil" },
  deleteProfile: { en: "Delete profile", "es-MX": "Eliminar perfil" },
  resetProgress: { en: "Reset progress", "es-MX": "Reiniciar progreso" },
  exportSave: { en: "Download backup", "es-MX": "Descargar respaldo" },
  importSave: { en: "Import backup", "es-MX": "Importar respaldo" },
  importSuccess: { en: "Save imported successfully.", "es-MX": "El respaldo se importó correctamente." },
  importFailure: { en: "That save file could not be read.", "es-MX": "No se pudo leer ese archivo de respaldo." },
  storageWarning: {
    en: "Browser storage can be erased by clearing site data, private browsing, or device cleanup. Download a backup for important progress.",
    "es-MX": "El almacenamiento del navegador puede borrarse al eliminar datos del sitio, usar navegación privada o limpiar el dispositivo. Descarga un respaldo para proteger el progreso importante.",
  },
  privacyTitle: { en: "Private local progress", "es-MX": "Progreso local y privado" },
  privacyBody: {
    en: "Every friend who opens the site gets separate progress in their own browser. Nothing is uploaded by this website.",
    "es-MX": "Cada amigo que abra el sitio tendrá progreso separado en su propio navegador. Este sitio no sube la información a ningún servidor.",
  },
  profileSummary: { en: "Adventure summary", "es-MX": "Resumen de aventura" },
  completed: { en: "Completed missions", "es-MX": "Misiones completadas" },
  placesVisited: { en: "Places visited", "es-MX": "Lugares visitados" },
  currentDestination: { en: "Current destination", "es-MX": "Destino actual" },
  allMissions: { en: "All local missions", "es-MX": "Todas las misiones locales" },
  ready: { en: "READY", "es-MX": "LISTO" },
  level: { en: "LV", "es-MX": "NV" },
  addNameFirst: { en: "Enter a player name first.", "es-MX": "Primero escribe el nombre del jugador." },
  cannotDeleteLast: {
    en: "At least one local profile must remain.",
    "es-MX": "Debe quedar por lo menos un perfil local.",
  },
  confirmDelete: { en: "Delete this local profile?", "es-MX": "¿Eliminar este perfil local?" },
  confirmReset: { en: "Reset this profile's progress?", "es-MX": "¿Reiniciar el progreso de este perfil?" },
  staticMode: { en: "STATIC • LOCAL-FIRST • OFFLINE READY", "es-MX": "ESTÁTICO • LOCAL • LISTO SIN INTERNET" },
} satisfies Record<string, LocalizedText>;

export const WORLD_SECTIONS: WorldSection[] = [
  {
    id: "world-map", emoji: "🌐", starsRequired: 0,
    name: { en: "Living World Map", "es-MX": "Mapa del Mundo Vivo" },
    description: {
      en: "Choose an adventure and watch the world grow with every discovery.",
      "es-MX": "Elige una aventura y mira cómo crece el mundo con cada descubrimiento.",
    },
    activities: [
      { en: "Explore all destinations", "es-MX": "Explorar todos los destinos" },
      { en: "Track world growth", "es-MX": "Ver el crecimiento del mundo" },
      { en: "Choose the next mission", "es-MX": "Elegir la siguiente misión" },
    ],
  },
  {
    id: "robo-lab", emoji: "🤖", starsRequired: 0,
    name: { en: "Robo Lab", "es-MX": "Laboratorio de Robots" },
    description: {
      en: "Build, paint, name, and animate an original robot sidekick.",
      "es-MX": "Construye, pinta, nombra y anima a un compañero robot original.",
    },
    activities: [
      { en: "Choose robot parts", "es-MX": "Elegir piezas del robot" },
      { en: "Change armor colors", "es-MX": "Cambiar colores de la armadura" },
      { en: "Practice robot moves", "es-MX": "Practicar movimientos del robot" },
    ],
  },
  {
    id: "animal-forest", emoji: "🌳", starsRequired: 0,
    name: { en: "Animal Forest", "es-MX": "Bosque de Animales" },
    description: {
      en: "Discover 64 animals, habitats, adaptations, photos, and field challenges.",
      "es-MX": "Descubre 64 animales, hábitats, adaptaciones, fotos y retos de campo.",
    },
    activities: [
      { en: "Explore animal habitats", "es-MX": "Explorar hábitats de animales" },
      { en: "Complete wildlife quizzes", "es-MX": "Resolver retos de vida silvestre" },
      { en: "Save field-guide discoveries", "es-MX": "Guardar descubrimientos en la guía" },
    ],
  },
  {
    id: "monster-lab", emoji: "👾", starsRequired: 3,
    name: { en: "Monster Lab", "es-MX": "Laboratorio de Monstruos" },
    description: {
      en: "Create friendly monsters with unique bodies, powers, colors, and personalities.",
      "es-MX": "Crea monstruos amistosos con cuerpos, poderes, colores y personalidades únicas.",
    },
    activities: [
      { en: "Mix monster parts", "es-MX": "Combinar partes de monstruos" },
      { en: "Choose powers and moods", "es-MX": "Elegir poderes y estados de ánimo" },
      { en: "Animate monster friends", "es-MX": "Animar a los amigos monstruos" },
    ],
  },
  {
    id: "monster-habitats", emoji: "🏕️", starsRequired: 5,
    name: { en: "Monster Habitats", "es-MX": "Hábitats de Monstruos" },
    description: {
      en: "Build comfortable homes and grow friendship with every monster.",
      "es-MX": "Construye hogares cómodos y aumenta la amistad con cada monstruo.",
    },
    activities: [
      { en: "Choose a habitat theme", "es-MX": "Elegir el estilo del hábitat" },
      { en: "Pick food and toys", "es-MX": "Escoger comida y juguetes" },
      { en: "Care for monster friends", "es-MX": "Cuidar a los amigos monstruos" },
    ],
  },
  {
    id: "art-studio", emoji: "🎨", starsRequired: 6,
    name: { en: "Art Studio", "es-MX": "Estudio de Arte" },
    description: {
      en: "Create posters, emblems, story art, and decorations for Robot Home.",
      "es-MX": "Crea pósteres, emblemas, ilustraciones y decoraciones para la Casa del Robot.",
    },
    activities: [
      { en: "Design illustrated posters", "es-MX": "Diseñar pósteres ilustrados" },
      { en: "Add frames and stickers", "es-MX": "Agregar marcos y estampas" },
      { en: "Feature art at home", "es-MX": "Exhibir arte en casa" },
    ],
  },
  {
    id: "story-castle", emoji: "🏰", starsRequired: 7,
    name: { en: "Story Castle", "es-MX": "Castillo de Historias" },
    description: {
      en: "Write illustrated adventures starring robots, animals, monsters, and pets.",
      "es-MX": "Escribe aventuras ilustradas con robots, animales, monstruos y mascotas.",
    },
    activities: [
      { en: "Choose heroes and locations", "es-MX": "Elegir héroes y lugares" },
      { en: "Create bilingual stories", "es-MX": "Crear historias bilingües" },
      { en: "Use local read-aloud", "es-MX": "Usar lectura en voz alta local" },
    ],
  },
  {
    id: "game-arcade", emoji: "🕹️", starsRequired: 8,
    name: { en: "Game Arcade", "es-MX": "Arcade de Juegos" },
    description: {
      en: "Play learning games about animals, patterns, memory, dinosaurs, and math.",
      "es-MX": "Juega retos de animales, patrones, memoria, dinosaurios y matemáticas.",
    },
    activities: [
      { en: "Solve animal clues", "es-MX": "Resolver pistas de animales" },
      { en: "Practice memory and patterns", "es-MX": "Practicar memoria y patrones" },
      { en: "Defend space with math", "es-MX": "Defender el espacio con matemáticas" },
    ],
  },
  {
    id: "dinosaur-valley", emoji: "🦕", starsRequired: 9,
    name: { en: "Dinosaur Valley", "es-MX": "Valle de Dinosaurios" },
    description: {
      en: "Lead expeditions, identify prehistoric animals, and recover fossils.",
      "es-MX": "Dirige expediciones, identifica animales prehistóricos y recupera fósiles.",
    },
    activities: [
      { en: "Discover prehistoric animals", "es-MX": "Descubrir animales prehistóricos" },
      { en: "Recover fossils", "es-MX": "Recuperar fósiles" },
      { en: "Complete field challenges", "es-MX": "Completar retos de campo" },
    ],
  },
  {
    id: "pet-workshop", emoji: "🐾", starsRequired: 10,
    name: { en: "Robot Pet Workshop", "es-MX": "Taller de Mascotas Robot" },
    description: {
      en: "Build expressive robot pets, grow their bond, and teach them tricks.",
      "es-MX": "Construye mascotas robot expresivas, aumenta su vínculo y enséñales trucos.",
    },
    activities: [
      { en: "Choose a pet species", "es-MX": "Elegir una especie de mascota" },
      { en: "Add colors and accessories", "es-MX": "Agregar colores y accesorios" },
      { en: "Train tricks and friendship", "es-MX": "Entrenar trucos y amistad" },
    ],
  },
  {
    id: "robot-home", emoji: "🏠", starsRequired: 11,
    name: { en: "Robot Home", "es-MX": "Casa del Robot" },
    description: {
      en: "Decorate a living headquarters for the robot, pet, artwork, and trophies.",
      "es-MX": "Decora una base viva para el robot, la mascota, el arte y los trofeos.",
    },
    activities: [
      { en: "Place room decorations", "es-MX": "Colocar decoraciones" },
      { en: "Change weather and lighting", "es-MX": "Cambiar clima e iluminación" },
      { en: "Play with the robot and pet", "es-MX": "Jugar con el robot y la mascota" },
    ],
  },
  {
    id: "memory-book", emoji: "📚", starsRequired: 0,
    name: { en: "Memory Museum", "es-MX": "Museo de Recuerdos" },
    description: {
      en: "Review every creation, discovery, story, mission, pet, and adventure memory.",
      "es-MX": "Revisa cada creación, descubrimiento, historia, misión, mascota y recuerdo.",
    },
    activities: [
      { en: "View the adventure timeline", "es-MX": "Ver la línea del tiempo" },
      { en: "Browse every collection", "es-MX": "Explorar todas las colecciones" },
      { en: "Download a complete backup", "es-MX": "Descargar un respaldo completo" },
    ],
  },
  {
    id: "badge-book", emoji: "🏅", starsRequired: 0,
    name: { en: "Badge Observatory", "es-MX": "Observatorio de Insignias" },
    description: {
      en: "Track stars, levels, badges, milestones, and completed challenges.",
      "es-MX": "Consulta estrellas, niveles, insignias, logros y retos completados.",
    },
    activities: [
      { en: "Review earned badges", "es-MX": "Revisar insignias ganadas" },
      { en: "Track explorer levels", "es-MX": "Consultar niveles de explorador" },
      { en: "Find the next milestone", "es-MX": "Encontrar el siguiente logro" },
    ],
  },
  {
    id: "parent-settings", emoji: "⚙️", starsRequired: 0,
    name: { en: "Parent & Settings", "es-MX": "Adultos y Configuración" },
    description: {
      en: "Manage language, local profiles, backups, accessibility, and privacy.",
      "es-MX": "Administra idioma, perfiles locales, respaldos, accesibilidad y privacidad.",
    },
    activities: [
      { en: "Switch English or Mexican Spanish", "es-MX": "Cambiar entre inglés y español de México" },
      { en: "Manage local player profiles", "es-MX": "Administrar perfiles locales" },
      { en: "Export or import a backup", "es-MX": "Exportar o importar un respaldo" },
    ],
  },
];

export const LOCAL_MISSIONS: LocalMission[] = WORLD_SECTIONS.filter(
  (section) => section.id !== "parent-settings" && section.id !== "memory-book" && section.id !== "badge-book",
).map((section, index) => ({
  id: `local-${section.id}`,
  sectionId: section.id,
  rewardStars: index < 3 ? 2 : index < 7 ? 3 : 4,
  title: {
    en: `Explore ${section.name.en}`,
    "es-MX": `Explora ${section.name["es-MX"]}`,
  },
  description: {
    en: `Visit ${section.name.en} and complete its three starter activities.`,
    "es-MX": `Visita ${section.name["es-MX"]} y completa sus tres actividades iniciales.`,
  },
  objectives: section.activities,
}));

export const sectionById = (id: string): WorldSection =>
  WORLD_SECTIONS.find((section) => section.id === id) ?? WORLD_SECTIONS[0];

export const missionForSection = (id: string): LocalMission | undefined =>
  LOCAL_MISSIONS.find((mission) => mission.sectionId === id);
