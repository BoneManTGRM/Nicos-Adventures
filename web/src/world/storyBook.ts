import type { Language, StoryRecord } from "../types";

export const STORY_OPTIONS = {
  place: {
    en: ["Animal Forest", "Dinosaur Valley", "a moon base", "a crystal cave", "Robot Home", "an underwater laboratory", "a cloud kingdom", "the Star Bridge"],
    "es-MX": ["el Bosque Animal", "el Valle de Dinosaurios", "una base lunar", "una cueva de cristal", "la Casa Robot", "un laboratorio submarino", "un reino de nubes", "el Puente Estelar"],
  },
  problem: {
    en: ["a mysterious light disappeared", "a tiny robot lost its map", "a dinosaur egg needed protection", "the bridge stopped working", "a shy monster wanted a friend", "a storm scattered important clues", "a baby dragon could not find its family", "the music of the stars went quiet"],
    "es-MX": ["una luz misteriosa desapareció", "un robot pequeño perdió su mapa", "un huevo de dinosaurio necesitaba protección", "el puente dejó de funcionar", "un monstruo tímido quería un amigo", "una tormenta dispersó pistas importantes", "un dragón bebé no encontraba a su familia", "la música de las estrellas quedó en silencio"],
  },
  ending: {
    en: ["everyone worked together and found a kind solution", "the team repaired the problem and celebrated under the stars", "a new friendship made the whole world brighter", "careful observation revealed the final clue", "the heroes returned home with a lesson and a new idea", "a brave apology turned a mistake into a friendship", "the whole valley joined a joyful parade", "the smallest clue unlocked the biggest surprise"],
    "es-MX": ["todos trabajaron juntos y encontraron una solución amable", "el equipo reparó el problema y celebró bajo las estrellas", "una nueva amistad hizo que todo el mundo brillara más", "la observación cuidadosa reveló la pista final", "los héroes regresaron a casa con una lección y una idea nueva", "una disculpa valiente convirtió un error en amistad", "todo el valle se unió a un desfile alegre", "la pista más pequeña reveló la sorpresa más grande"],
  },
  theme: {
    en: ["Courage", "Friendship", "Discovery", "Kindness", "Teamwork", "Imagination", "Patience", "Helping nature"],
    "es-MX": ["Valentía", "Amistad", "Descubrimiento", "Amabilidad", "Trabajo en equipo", "Imaginación", "Paciencia", "Cuidar la naturaleza"],
  },
  magicItem: {
    en: ["a compass that points toward kindness", "a pocket-sized star lantern", "a singing crystal", "a rainbow shield", "a map that draws new paths", "a friendly robot toolkit", "a feather that glows near clues", "a tiny telescope"],
    "es-MX": ["una brújula que apunta hacia la bondad", "una linterna estelar de bolsillo", "un cristal que canta", "un escudo arcoíris", "un mapa que dibuja caminos nuevos", "un juego de herramientas robot amistoso", "una pluma que brilla cerca de las pistas", "un telescopio pequeño"],
  },
} as const;

export const storyCombinationCount = Object.values(STORY_OPTIONS).reduce((total, group) => total * group.en.length, 1);

export function buildStoryPages(story: StoryRecord): string[] {
  const companion = story.companion || (story.language === "es-MX" ? "BoltBot" : "BoltBot");
  const theme = story.theme || STORY_OPTIONS.theme[story.language][0];
  const magicItem = story.magicItem || STORY_OPTIONS.magicItem[story.language][0];
  const detail = story.specialDetail?.trim();
  if (story.language === "es-MX") {
    return [
      `${story.hero} recibió una invitación brillante para viajar a ${story.place}. La aventura iba a tratar sobre ${theme.toLowerCase()}.`,
      `${companion} se unió al viaje. Juntos llevaron ${magicItem} y prometieron escucharse y ayudarse.`,
      `Al llegar, descubrieron que ${story.problem}. Respiraron profundo y buscaron pistas con cuidado.`,
      `${detail ? `${detail}. ` : ""}${story.hero} tuvo una idea, y ${companion} encontró una manera amable de probarla.`,
      `La primera idea no resolvió todo, pero el equipo aprendió algo importante sobre ${theme.toLowerCase()} y volvió a intentarlo.`,
      `Al final, ${story.ending}. ${story.hero} y ${companion} guardaron ${magicItem} para su próxima aventura.`,
    ];
  }
  return [
    `${story.hero} received a glowing invitation to travel to ${story.place}. This adventure would be about ${theme.toLowerCase()}.`,
    `${companion} joined the journey. Together they carried ${magicItem} and promised to listen and help each other.`,
    `When they arrived, they discovered that ${story.problem}. They took a calm breath and searched carefully for clues.`,
    `${detail ? `${detail}. ` : ""}${story.hero} had an idea, and ${companion} found a kind way to test it.`,
    `The first idea did not solve everything, but the team learned something important about ${theme.toLowerCase()} and tried again.`,
    `In the end, ${story.ending}. ${story.hero} and ${companion} saved ${magicItem} for their next adventure.`,
  ];
}

export function storyPages(story: StoryRecord): string[] {
  return story.pages?.length ? story.pages : buildStoryPages(story);
}

export const defaultStoryTitle = (language: Language): string => language === "es-MX" ? "La aventura del faro estelar" : "The Star Lantern Adventure";
