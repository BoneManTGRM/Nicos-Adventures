import { useEffect, useState } from "react";
import { MonsterStage, useMonsterMotion } from "../FeatureArt";
import type { LocalProfile, MonsterRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";
import type { MonsterTraitKey } from "./monsterCreatureStudio";
import { applyMonsterFamilyPreset } from "./monsterFamily";
import { completeOnce, hasCompleted, monsterFriendshipMission } from "./progression";

function newMonster(): MonsterRecord {
  return {
    id: makeId("monster"),
    name: "Glimmer",
    body: "Lizard Alien",
    eyes: "Two eyes",
    horns: "No horns",
    wings: "No wings",
    color: "Aqua",
    pattern: "Solid",
    power: "Rainbow shield",
    personality: "Curious",
    friendship: 1,
    habitat: "Crystal Cave",
    mouth: "Dragon snout",
    arms: "Claw arms",
    legs: "Dinosaur legs",
    tail: "No tail",
    texture: "Smooth",
    animation: "Bounce",
  };
}

const motions = ["bounce", "spin", "roar", "fly", "dance", "sleep"] as const;

export function MonsterLab({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<MonsterRecord>(newMonster);
  const [activeTrait, setActiveTrait] = useState<MonsterTraitKey>("body");
  const motion = useMonsterMotion();

  useEffect(() => {
    const saved = profile.monsters.at(-1);
    setDraft(saved ? { ...saved, body: "Lizard Alien" } : newMonster());
  }, [profile.id]);

  const save = () => {
    const monster = { ...draft, body: "Lizard Alien", id: draft.id || makeId("monster"), name: draft.name.trim() || (language === "es-MX" ? "Monstruo" : "Monster") };
    const exists = profile.monsters.some((item) => item.id === monster.id);
    const monsters = exists
      ? profile.monsters.map((item) => item.id === monster.id ? monster : item)
      : [...profile.monsters, monster];
    update({ ...profile, monsters, stars: profile.stars + (exists ? 0 : 2) });
    setDraft(monster);
    motion.play("dance");
    announce(`${monster.name}: ${tr(ui.saveSuccess, language)}`);
  };

  return (
    <div className="fw-builder-layout">
      <section className="monster-lab-preview" aria-label={language === "es-MX" ? "Vista previa del monstruo" : "Monster preview"}>
        <MonsterStage monster={draft} action={motion.action} language={language} />
        <div className="monster-action-row" role="group" aria-label={language === "es-MX" ? "Movimientos del monstruo" : "Monster movements"}>
          {motions.map((action) => (
            <button type="button" key={action} onClick={() => motion.play(action)}>{optionLabel(action[0].toUpperCase() + action.slice(1), language)}</button>
          ))}
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
          sculpt={(trait, option) => setDraft({ ...draft, [trait]: option, body: "Lizard Alien" })}
          choosePreset={(preset) => {
            setDraft((current) => applyMonsterFamilyPreset({ ...current, id: makeId("monster") }, preset));
            setActiveTrait("color");
            announce(language === "es-MX" ? `${preset.name} listo para personalizar.` : `${preset.name} ready to customize.`);
          }}
        />
        <div className="fw-action-row">
          <button type="button" onClick={() => {
            setDraft(newMonster());
            setActiveTrait("body");
            announce(language === "es-MX" ? "Nuevo monstruo Lizard Alien listo para personalizar." : "New Lizard Alien monster ready to customize.");
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
                    setDraft({ ...monster, body: "Lizard Alien" });
                    announce(`${monster.name}: ${tr(ui.selected, language)}`);
                  }}
                >
                  👾 {monster.name} · {optionLabel("Lizard Alien", language)}
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
          <MonsterStage monster={{ ...monster, body: "Lizard Alien" }} language={language} />
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
