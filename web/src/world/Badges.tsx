import { mergeAnimalLibrary } from "../FeatureArt";
import type { LocalProfile } from "../types";
import { creativeMilestoneId, roomGoalId } from "./creativeProgression";
import { hasCompleted } from "./progression";

type BadgeDefinition = {
  id: string;
  emoji: string;
  name: { en: string; "es-MX": string };
  requirement: { en: string; "es-MX": string };
  current: number;
  target: number;
  earned: boolean;
};

const capped = (value: number, target: number) => Math.min(value, target);

export function buildBadges(profile: LocalProfile): BadgeDefinition[] {
  const discoveredAnimals = mergeAnimalLibrary(profile.animals).filter((item) => item.discovered).length;
  const certifiedJobs = profile.completedMissions.filter((id) => id.startsWith("robot-job:")).length;
  const solvedArcade = profile.completedMissions.filter((id) => id.startsWith("arcade:")).length;
  const trainedTricks = profile.pets.reduce((sum, pet) => sum + pet.tricks.length, 0);
  const maxMonsterFriendship = Math.max(0, ...profile.monsters.map((monster) => monster.friendship));
  const allRoomGoals = ["robot-team", "pet-companion", "art-display", "decorator"] as const;
  const completedRoomGoals = allRoomGoals.filter((goal) => hasCompleted(profile, roomGoalId(goal))).length;

  return [
    { id: "stars-5", emoji: "⭐", name: { en: "Star Starter", "es-MX": "Inicio estelar" }, requirement: { en: "Earn 5 stars", "es-MX": "Gana 5 estrellas" }, current: capped(profile.stars, 5), target: 5, earned: profile.stars >= 5 },
    { id: "stars-50", emoji: "🌟", name: { en: "Constellation Builder", "es-MX": "Creador de constelaciones" }, requirement: { en: "Earn 50 stars", "es-MX": "Gana 50 estrellas" }, current: capped(profile.stars, 50), target: 50, earned: profile.stars >= 50 },
    { id: "robots-2", emoji: "🤖", name: { en: "Robot Engineer", "es-MX": "Ingeniero robot" }, requirement: { en: "Save 2 robots", "es-MX": "Guarda 2 robots" }, current: capped(profile.robots.length, 2), target: 2, earned: profile.robots.length >= 2 },
    { id: "robot-certifications", emoji: "⚙️", name: { en: "Career Coach", "es-MX": "Entrenador de profesiones" }, requirement: { en: "Complete 5 robot certifications", "es-MX": "Completa 5 certificaciones robot" }, current: capped(certifiedJobs, 5), target: 5, earned: certifiedJobs >= 5 },
    { id: "animals-5", emoji: "🐾", name: { en: "Wildlife Explorer", "es-MX": "Explorador de fauna" }, requirement: { en: "Discover 5 animals", "es-MX": "Descubre 5 animales" }, current: capped(discoveredAnimals, 5), target: 5, earned: discoveredAnimals >= 5 },
    { id: "animals-20", emoji: "🔭", name: { en: "Field Guide Expert", "es-MX": "Experto en guía de campo" }, requirement: { en: "Discover 20 animals", "es-MX": "Descubre 20 animales" }, current: capped(discoveredAnimals, 20), target: 20, earned: discoveredAnimals >= 20 },
    { id: "monster-maker", emoji: "👾", name: { en: "Monster Maker", "es-MX": "Creador de monstruos" }, requirement: { en: "Create a monster", "es-MX": "Crea un monstruo" }, current: capped(profile.monsters.length, 1), target: 1, earned: profile.monsters.length >= 1 },
    { id: "monster-friend", emoji: "💚", name: { en: "Monster Best Friend", "es-MX": "Mejor amigo de monstruos" }, requirement: { en: "Reach 100 friendship", "es-MX": "Alcanza 100 de amistad" }, current: capped(maxMonsterFriendship, 100), target: 100, earned: maxMonsterFriendship >= 100 },
    { id: "pet-partner", emoji: "🐕", name: { en: "Pet Partner", "es-MX": "Compañero de mascotas" }, requirement: { en: "Build a robot pet", "es-MX": "Construye una mascota robot" }, current: capped(profile.pets.length, 1), target: 1, earned: profile.pets.length >= 1 },
    { id: "pet-trainer", emoji: "🎾", name: { en: "Master Pet Trainer", "es-MX": "Maestro entrenador de mascotas" }, requirement: { en: "Teach 5 tricks", "es-MX": "Enseña 5 trucos" }, current: capped(trainedTricks, 5), target: 5, earned: trainedTricks >= 5 },
    { id: "art-3", emoji: "🎨", name: { en: "Gallery Artist", "es-MX": "Artista de galería" }, requirement: { en: "Save 3 artworks", "es-MX": "Guarda 3 obras" }, current: capped(profile.artwork.length, 3), target: 3, earned: hasCompleted(profile, creativeMilestoneId("artwork", 3)) || profile.artwork.length >= 3 },
    { id: "stories-3", emoji: "📚", name: { en: "Story Builder", "es-MX": "Creador de cuentos" }, requirement: { en: "Save 3 stories", "es-MX": "Guarda 3 cuentos" }, current: capped(profile.stories.length, 3), target: 3, earned: hasCompleted(profile, creativeMilestoneId("story", 3)) || profile.stories.length >= 3 },
    { id: "dinos", emoji: "🦖", name: { en: "Fossil Hunter", "es-MX": "Cazador de fósiles" }, requirement: { en: "Discover 3 dinosaurs", "es-MX": "Descubre 3 dinosaurios" }, current: capped(profile.dinosaurs.filter((item) => item.discovered).length, 3), target: 3, earned: profile.dinosaurs.filter((item) => item.discovered).length >= 3 },
    { id: "arcade", emoji: "🕹️", name: { en: "Arcade Scholar", "es-MX": "Estudiante de la sala de juegos" }, requirement: { en: "Solve 9 Arcade challenges", "es-MX": "Resuelve 9 desafíos de juegos" }, current: capped(solvedArcade, 9), target: 9, earned: solvedArcade >= 9 },
    { id: "room", emoji: "🏠", name: { en: "Robot Home Designer", "es-MX": "Diseñador de la Casa Robot" }, requirement: { en: "Complete all 4 room goals", "es-MX": "Completa las 4 metas de la habitación" }, current: completedRoomGoals, target: 4, earned: completedRoomGoals >= 4 },
    { id: "showtime", emoji: "🎬", name: { en: "Movie Director", "es-MX": "Director de cine" }, requirement: { en: "Make a Showtime movie", "es-MX": "Crea una película Showtime" }, current: capped(profile.movieProjects.length, 1), target: 1, earned: profile.badges.includes("showtime-director") || profile.movieProjects.length >= 1 },
  ];
}

export function Badges({ profile }: { profile: LocalProfile }) {
  const language = profile.language;
  const badges = buildBadges(profile);
  const earned = badges.filter((badge) => badge.earned).length;

  return (
    <div className="badge-system">
      <section className="badge-summary" aria-label={language === "es-MX" ? "Resumen de insignias" : "Badge summary"}>
        <div><span aria-hidden="true">🏆</span><div><small>{language === "es-MX" ? "Insignias desbloqueadas" : "Badges unlocked"}</small><strong>{earned}/{badges.length}</strong></div></div>
        <progress max={badges.length} value={earned}>{earned}/{badges.length}</progress>
        <p>{language === "es-MX" ? "Cada insignia refleja progreso real guardado en este dispositivo." : "Every badge reflects real progress saved on this device."}</p>
      </section>
      <div className="badge-progress-grid">
        {badges.map((badge) => (
          <article className={badge.earned ? "earned" : "locked"} key={badge.id}>
            <span aria-hidden="true">{badge.earned ? badge.emoji : "🔒"}</span>
            <div><h3>{badge.name[language]}</h3><p>{badge.earned ? (language === "es-MX" ? "Desbloqueada" : "Unlocked") : badge.requirement[language]}</p></div>
            <progress max={badge.target} value={badge.current}>{badge.current}/{badge.target}</progress>
            <small>{badge.current}/{badge.target}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
