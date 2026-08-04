import { useMemo } from "react";
import { RobotStage } from "../RobotStage";
import type { ArtworkRecord, LocalProfile, PetRecord, Robot } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import { ROOM_DECORATIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState } from "./common";
import { completeOnce, hasCompleted } from "./progression";
import { roomGoalId } from "./creativeProgression";

type RoomGoal = {
  id: "robot-team" | "pet-companion" | "art-display" | "decorator";
  emoji: string;
  title: { en: string; "es-MX": string };
  ready: boolean;
  reward: number;
};

function moveToEnd<T extends { id: string }>(items: T[], id: string): T[] {
  const selected = items.find((item) => item.id === id);
  if (!selected) return items;
  return [...items.filter((item) => item.id !== id), selected];
}

export function RobotHome({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const activePet = profile.pets.find((pet) => pet.id === profile.activePetId) ?? profile.pets[0];
  const displayedArtwork = profile.artwork.at(-1) ?? null;
  const roomGoals = useMemo<RoomGoal[]>(() => [
    {
      id: "robot-team",
      emoji: "🤖",
      title: { en: "Build a two-robot team", "es-MX": "Forma un equipo de dos robots" },
      ready: profile.robots.length >= 2,
      reward: 1,
    },
    {
      id: "pet-companion",
      emoji: "🐾",
      title: { en: "Choose an active pet companion", "es-MX": "Elige una mascota compañera" },
      ready: Boolean(activePet),
      reward: 1,
    },
    {
      id: "art-display",
      emoji: "🖼️",
      title: { en: "Display artwork at home", "es-MX": "Exhibe una obra en casa" },
      ready: Boolean(displayedArtwork),
      reward: 1,
    },
    {
      id: "decorator",
      emoji: "✨",
      title: { en: "Place four room decorations", "es-MX": "Coloca cuatro decoraciones" },
      ready: profile.decorations.length >= 4,
      reward: 2,
    },
  ], [activePet, displayedArtwork, profile.decorations.length, profile.robots.length]);

  const chooseRobot = (robot: Robot) => {
    update({ ...profile, robot });
    announce(language === "es-MX" ? `${robot.name} está activo en la Casa Robot.` : `${robot.name} is active in Robot Home.`);
  };

  const choosePet = (pet: PetRecord) => {
    update({ ...profile, activePetId: pet.id });
    announce(language === "es-MX" ? `${pet.name} es la mascota compañera.` : `${pet.name} is the companion pet.`);
  };

  const displayArtwork = (artwork: ArtworkRecord) => {
    update({ ...profile, artwork: moveToEnd(profile.artwork, artwork.id) });
    announce(language === "es-MX" ? `${artwork.title} está en exhibición.` : `${artwork.title} is on display.`);
  };

  const toggleDecoration = (item: string) => {
    const selected = profile.decorations.includes(item);
    const decorations = selected ? profile.decorations.filter((value) => value !== item) : [...profile.decorations, item];
    update({ ...profile, decorations });
    announce(language === "es-MX"
      ? `${optionLabel(item, language)} ${selected ? "quitada" : "agregada"}.`
      : `${item} ${selected ? "removed" : "added"}.`);
  };

  const claimGoal = (goal: RoomGoal) => {
    const missionId = roomGoalId(goal.id);
    if (!goal.ready || hasCompleted(profile, missionId)) return;
    const completion = completeOnce(profile, missionId, goal.reward);
    update(completion.profile);
    announce(language === "es-MX"
      ? `Meta de la Casa Robot completada: ${goal.title[language]}. Ganaste ${goal.reward} estrellas.`
      : `Robot Home goal completed: ${goal.title[language]}. You earned ${goal.reward} stars.`);
  };

  return (
    <div className="robot-home-system">
      <section className="robot-home-stage" aria-label={language === "es-MX" ? "Casa Robot interactiva" : "Interactive Robot Home"}>
        <div className="robot-home-stage__sky" aria-hidden="true">✦　☾　✧</div>
        <div className="robot-home-stage__art">
          {displayedArtwork ? <><span aria-hidden="true">🖼️</span><strong>{displayedArtwork.title}</strong></> : <span aria-hidden="true">＋</span>}
        </div>
        <div className="robot-home-stage__robot">
          <RobotStage robot={profile.robot} statusLabel={tr(ui.homeStatus, language)} levelLabel={tr(ui.levelShort, language)} />
        </div>
        <div className="robot-home-stage__pet">
          {activePet ? <><span aria-hidden="true">🐾</span><strong>{activePet.name}</strong><small>{optionLabel(activePet.species, language)}</small></> : <small>{language === "es-MX" ? "Sin mascota activa" : "No active pet"}</small>}
        </div>
        <div className="robot-home-stage__decor" aria-label={language === "es-MX" ? "Decoraciones activas" : "Active decorations"}>
          {profile.decorations.map((item) => <span key={item}>{optionLabel(item, language)}</span>)}
        </div>
      </section>

      <section className="robot-home-controls" aria-labelledby="robot-home-team-heading">
        <header>
          <div><small>{language === "es-MX" ? "Equipo local" : "Local team"}</small><h2 id="robot-home-team-heading">{language === "es-MX" ? "Quién vive aquí" : "Who lives here"}</h2></div>
        </header>
        <div className="robot-home-control-grid">
          <article>
            <h3>{language === "es-MX" ? "Robot activo" : "Active robot"}</h3>
            <div className="robot-home-choice-list">
              {profile.robots.map((robot) => (
                <button type="button" className={profile.robot.id === robot.id ? "active" : ""} aria-pressed={profile.robot.id === robot.id} key={robot.id} onClick={() => chooseRobot(robot)}>🤖 {robot.name}</button>
              ))}
            </div>
          </article>
          <article>
            <h3>{language === "es-MX" ? "Mascota compañera" : "Companion pet"}</h3>
            {!profile.pets.length ? <EmptyState emoji="🐾">{language === "es-MX" ? "Construye una mascota en el taller." : "Build a pet in the workshop."}</EmptyState> : (
              <div className="robot-home-choice-list">
                {profile.pets.map((pet) => (
                  <button type="button" className={activePet?.id === pet.id ? "active" : ""} aria-pressed={activePet?.id === pet.id} key={pet.id} onClick={() => choosePet(pet)}>🐾 {pet.name}</button>
                ))}
              </div>
            )}
          </article>
          <article>
            <h3>{language === "es-MX" ? "Arte en exhibición" : "Artwork on display"}</h3>
            {!profile.artwork.length ? <EmptyState emoji="🎨">{language === "es-MX" ? "Crea una obra en el Estudio de arte." : "Create artwork in Art Studio."}</EmptyState> : (
              <div className="robot-home-choice-list">
                {profile.artwork.map((artwork) => (
                  <button type="button" className={displayedArtwork?.id === artwork.id ? "active" : ""} aria-pressed={displayedArtwork?.id === artwork.id} key={artwork.id} onClick={() => displayArtwork(artwork)}>🖼️ {artwork.title}</button>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="robot-home-controls" aria-labelledby="robot-home-decor-heading">
        <header><div><small>{profile.decorations.length}/{ROOM_DECORATIONS.length}</small><h2 id="robot-home-decor-heading">{language === "es-MX" ? "Decorar la habitación" : "Decorate the room"}</h2></div></header>
        <div className="robot-home-decoration-grid">
          {ROOM_DECORATIONS.map((item) => (
            <button type="button" className={profile.decorations.includes(item) ? "active" : ""} aria-pressed={profile.decorations.includes(item)} key={item} onClick={() => toggleDecoration(item)}>{profile.decorations.includes(item) ? "✓ " : "＋ "}{optionLabel(item, language)}</button>
          ))}
        </div>
      </section>

      <section className="room-goal-panel" aria-labelledby="room-goals-heading">
        <header><div><small>{language === "es-MX" ? "Recompensas únicas" : "One-time rewards"}</small><h2 id="room-goals-heading">{language === "es-MX" ? "Metas de la Casa Robot" : "Robot Home goals"}</h2></div></header>
        <div className="room-goal-grid">
          {roomGoals.map((goal) => {
            const completed = hasCompleted(profile, roomGoalId(goal.id));
            return (
              <article className={`${goal.ready ? "ready" : ""} ${completed ? "completed" : ""}`.trim()} key={goal.id}>
                <span aria-hidden="true">{goal.emoji}</span>
                <div><h3>{goal.title[language]}</h3><small>⭐ {goal.reward}</small></div>
                <button type="button" disabled={!goal.ready || completed} onClick={() => claimGoal(goal)}>{completed ? (language === "es-MX" ? "Completada" : "Completed") : goal.ready ? (language === "es-MX" ? "Reclamar" : "Claim") : (language === "es-MX" ? "En progreso" : "In progress")}</button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
