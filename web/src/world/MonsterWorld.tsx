import { useEffect, useRef, useState } from "react";
import { MonsterStage } from "../FeatureArt";
import type { LocalProfile, MonsterRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";
import type { MonsterTraitKey } from "./monsterCreatureStudio";
import {
  MONSTER_MOVEMENTS,
  monsterMotionProfile,
  monsterMovement,
  type MonsterPose,
} from "./monsterMovement";
import { completeOnce, hasCompleted, monsterFriendshipMission } from "./progression";
import "./monster-movement-poses.css";

function newMonster(): MonsterRecord {
  return {
    id: makeId("monster"),
    name: "Glimmer",
    body: "Dragon",
    eyes: "Three eyes",
    horns: "Crystal horns",
    wings: "Star wings",
    color: "Aqua",
    pattern: "Galaxy",
    power: "Rainbow shield",
    personality: "Curious",
    friendship: 1,
    habitat: "Crystal Cave",
    mouth: "Fang smile",
    arms: "Claw arms",
    legs: "Dinosaur legs",
    tail: "Dragon tail",
    texture: "Crystal",
    animation: "Bounce",
  };
}

export function MonsterLab({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<MonsterRecord>(newMonster);
  const [activeTrait, setActiveTrait] = useState<MonsterTraitKey>("body");
  const [pose, setPose] = useState<MonsterPose>("idle");
  const motionTimer = useRef<number | null>(null);
  const motionProfile = monsterMotionProfile(draft.body);
  const activeMovement = monsterMovement(pose);

  const clearMotionTimer = () => {
    if (motionTimer.current !== null) {
      window.clearTimeout(motionTimer.current);
      motionTimer.current = null;
    }
  };

  const returnToIdle = () => {
    clearMotionTimer();
    setPose("idle");
  };

  const play = (nextPose: Exclude<MonsterPose, "idle">) => {
    clearMotionTimer();
    const movement = monsterMovement(nextPose);
    setPose(nextPose);
    setDraft((current) => ({
      ...current,
      animation: movement?.en ?? current.animation,
    }));
    motionTimer.current = window.setTimeout(() => {
      setPose("idle");
      motionTimer.current = null;
    }, movement?.duration ?? 1900);
  };

  useEffect(() => {
    clearMotionTimer();
    setPose("idle");
    setDraft(profile.monsters.at(-1) ? { ...profile.monsters.at(-1)! } : newMonster());
  }, [profile.id]);

  useEffect(() => () => clearMotionTimer(), []);

  const save = () => {
    const monster = { ...draft, id: draft.id || makeId("monster"), name: draft.name.trim() || (language === "es-MX" ? "Monstruo" : "Monster") };
    const exists = profile.monsters.some((item) => item.id === monster.id);
    const monsters = exists
      ? profile.monsters.map((item) => item.id === monster.id ? monster : item)
      : [...profile.monsters, monster];
    update({ ...profile, monsters, stars: profile.stars + (exists ? 0 : 2) });
    setDraft(monster);
    play("celebrate");
    announce(`${monster.name}: ${tr(ui.saveSuccess, language)}`);
  };

  const poseLabel = activeMovement
    ? (language === "es-MX" ? activeMovement.es : activeMovement.en)
    : (language === "es-MX" ? "Listo" : "Ready");

  return (
    <div className="fw-builder-layout">
      <section
        className="monster-lab-preview"
        aria-label={language === "es-MX" ? "Vista previa del monstruo" : "Monster preview"}
        data-monster-motion-pose={pose}
        data-monster-motion-mass={motionProfile.mass}
        data-monster-motion-locomotion={motionProfile.locomotion}
        data-monster-motion-temperament={motionProfile.temperament}
      >
        <MonsterStage monster={draft} action={pose} language={language} />
        <div className="monster-action-row" role="group" aria-label={language === "es-MX" ? "Imágenes de movimiento del monstruo" : "Monster movement images"}>
          {MONSTER_MOVEMENTS.map((movement) => (
            <button
              type="button"
              key={movement.pose}
              data-monster-motion={movement.pose}
              aria-pressed={pose === movement.pose}
              className={pose === movement.pose ? "active" : ""}
              onClick={() => play(movement.pose)}
            >
              <span aria-hidden="true">{movement.icon}</span>
              {language === "es-MX" ? movement.es : movement.en}
            </button>
          ))}
        </div>
        <div className="monster-pose-readout" role="status" aria-live="polite">
          <span aria-hidden="true">{activeMovement?.icon ?? "✦"}</span>
          <strong>{poseLabel}</strong>
          <small>
            {language === "es-MX"
              ? "Cada botón muestra una pose ilustrada distinta y conserva el cuerpo, el color y la cara permanente."
              : "Each button shows a distinct illustrated pose while preserving the body, color, and permanent face."}
          </small>
        </div>
      </section>

      <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
        <label className="monster-lab-name">
          {tr(ui.monsterName, language)}
          <input value={draft.name} maxLength={32} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <MonsterCreatureStudio
          monster={draft}
          language={language}
          activeTrait={activeTrait}
          selectTrait={setActiveTrait}
          sculpt={(trait, option) => {
            setDraft((current) => ({ ...current, [trait]: option }));
            if (trait === "body") returnToIdle();
          }}
        />
        <div className="fw-action-row">
          <button type="button" onClick={() => {
            returnToIdle();
            setDraft(newMonster());
            announce(language === "es-MX" ? "Nuevo monstruo listo para personalizar." : "New monster ready to customize.");
          }}>＋ {language === "es-MX" ? "Nuevo monstruo" : "New monster"}</button>
          <button type="button" className="fw-primary" onClick={save}>👾 {tr(ui.saveMonster, language)}</button>
        </div>
        <section aria-labelledby="saved-monsters-heading">
          <h2 id="saved-monsters-heading" className="fw-subheading">{tr(ui.savedMonsters, language)}</h2>
          {!profile.monsters.length ? <EmptyState emoji="👾">{tr(ui.createMonsterFirst, language)}</EmptyState> : (
            <div className="monster-collection">
              {profile.monsters.map((monster) => (
                <button
                  type="button"
                  aria-pressed={draft.id === monster.id}
                  key={monster.id}
                  onClick={() => {
                    returnToIdle();
                    setDraft({ ...monster });
                    announce(`${monster.name}: ${tr(ui.selected, language)}`);
                  }}
                >
                  👾 {monster.name} · {optionLabel(monster.body, language)}
                </button>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export function MonsterHabitats({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;

  const care = (monsterId: string, amount: number, action: { en: string; "es-MX": string }) => {
    const monster = profile.monsters.find((item) => item.id === monsterId);
    if (!monster || monster.friendship >= 100) return;
    const nextFriendship = Math.min(100, monster.friendship + amount);
    let nextProfile: LocalProfile = {
      ...profile,
      monsters: profile.monsters.map((item) => item.id === monsterId ? { ...item, friendship: nextFriendship } : item),
    };
    const earnedMilestones: number[] = [];
    for (const threshold of [50, 100] as const) {
      if (monster.friendship < threshold && nextFriendship >= threshold) {
        const completion = completeOnce(nextProfile, monsterFriendshipMission(monsterId, threshold), threshold === 50 ? 2 : 3);
        nextProfile = completion.profile;
        if (completion.awarded) earnedMilestones.push(threshold);
      }
    }
    update(nextProfile);
    const milestoneText = earnedMilestones.length
      ? (language === "es-MX"
          ? ` Alcanzó el hito ${earnedMilestones.join(" y ")} y ganó estrellas.`
          : ` Reached the ${earnedMilestones.join(" and ")} milestone and earned stars.`)
      : "";
    announce(`${monster.name}: ${action[language]}. ${tr(ui.friendship, language)} ${nextFriendship}/100.${milestoneText}`);
  };

  if (!profile.monsters.length) return <EmptyState emoji="🏕️">{tr(ui.createMonsterFirst, language)}</EmptyState>;

  return (
    <div className="fw-card-grid">
      {profile.monsters.map((monster) => (
        <article className="fw-creature-card monster-habitat-card" key={monster.id}>
          <MonsterStage monster={monster} language={language} />
          <h3>{monster.name}</h3>
          <p>{optionLabel(monster.habitat, language)} · {optionLabel(monster.personality, language)}</p>
          <label>
            {tr(ui.friendship, language)}: {monster.friendship}/100
            <progress max={100} value={monster.friendship}>{monster.friendship}%</progress>
          </label>
          <div className="friendship-milestones" aria-label={language === "es-MX" ? "Hitos de amistad" : "Friendship milestones"}>
            <span className={hasCompleted(profile, monsterFriendshipMission(monster.id, 50)) ? "earned" : ""}>⭐ 50</span>
            <span className={hasCompleted(profile, monsterFriendshipMission(monster.id, 100)) ? "earned" : ""}>🏆 100</span>
          </div>
          <div className="fw-action-row" role="group" aria-label={language === "es-MX" ? `Cuidar a ${monster.name}` : `Care for ${monster.name}`}>
            <button type="button" onClick={() => care(monster.id, 5, { en: "Fed", "es-MX": "Alimentado" })} disabled={monster.friendship >= 100}>🍎 {language === "es-MX" ? "Alimentar" : "Feed"}</button>
            <button type="button" onClick={() => care(monster.id, 10, { en: "Played together", "es-MX": "Jugaron juntos" })} disabled={monster.friendship >= 100}>🎾 {language === "es-MX" ? "Jugar" : "Play"}</button>
            <button type="button" onClick={() => care(monster.id, 5, { en: "Groomed", "es-MX": "Cepillado" })} disabled={monster.friendship >= 100}>🪮 {language === "es-MX" ? "Cepillar" : "Groom"}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
