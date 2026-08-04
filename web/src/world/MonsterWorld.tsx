import { useEffect, useState } from "react";
import { MonsterStage, useMonsterMotion } from "../FeatureArt";
import type { LocalProfile, MonsterRecord } from "../types";
import { fieldLabel, tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import { MONSTER_OPTIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";

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

const motions = ["bounce", "spin", "roar", "fly", "dance", "sleep"] as const;

export function MonsterLab({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<MonsterRecord>(newMonster);
  const motion = useMonsterMotion();

  useEffect(() => {
    if (!profile.monsters.length) return;
    if (!profile.monsters.some((monster) => monster.id === draft.id)) setDraft({ ...profile.monsters.at(-1)! });
  }, [draft.id, profile.id, profile.monsters]);

  const save = () => {
    const monster = { ...draft, id: draft.id || makeId("monster"), name: draft.name.trim() || (language === "es-MX" ? "Monstruo" : "Monster") };
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
      <section aria-label={language === "es-MX" ? "Vista previa del monstruo" : "Monster preview"}>
        <MonsterStage monster={draft} action={motion.action} />
        <div className="monster-action-row" role="group" aria-label={language === "es-MX" ? "Movimientos del monstruo" : "Monster movements"}>
          {motions.map((action) => (
            <button type="button" key={action} onClick={() => motion.play(action)}>{optionLabel(action[0].toUpperCase() + action.slice(1), language)}</button>
          ))}
        </div>
      </section>

      <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
        <label>
          {tr(ui.monsterName, language)}
          <input value={draft.name} maxLength={32} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <fieldset className="fw-fieldset-reset">
          <legend>{tr(ui.formControls, language)}</legend>
          <div className="fw-form-grid">
            {Object.entries(MONSTER_OPTIONS).map(([key, values]) => (
              <label key={key}>
                {fieldLabel(key, language)}
                <select
                  value={String(draft[key as keyof MonsterRecord] || values[0])}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                >
                  {values.map((value) => <option value={value} key={value}>{optionLabel(value, language)}</option>)}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="fw-action-row">
          <button type="button" onClick={() => {
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
  const befriend = (monsterId: string) => {
    const monster = profile.monsters.find((item) => item.id === monsterId);
    if (!monster) return;
    const nextFriendship = Math.min(100, monster.friendship + 10);
    update({
      ...profile,
      monsters: profile.monsters.map((item) => item.id === monsterId ? { ...item, friendship: nextFriendship } : item),
      stars: profile.stars + (nextFriendship === 100 && monster.friendship < 100 ? 2 : 1),
    });
    announce(language === "es-MX"
      ? `${monster.name} ahora tiene ${nextFriendship} de amistad.`
      : `${monster.name} now has ${nextFriendship} friendship.`);
  };

  if (!profile.monsters.length) return <EmptyState emoji="🏕️">{tr(ui.createMonsterFirst, language)}</EmptyState>;

  return (
    <div className="fw-card-grid">
      {profile.monsters.map((monster) => (
        <article className="fw-creature-card" key={monster.id}>
          <MonsterStage monster={monster} />
          <h3>{optionLabel(monster.habitat, language)}</h3>
          <label>
            {tr(ui.friendship, language)}: {monster.friendship}/100
            <progress max={100} value={monster.friendship}>{monster.friendship}%</progress>
          </label>
          <button type="button" onClick={() => befriend(monster.id)} disabled={monster.friendship >= 100}>🍎 {tr(ui.feedPlay, language)}</button>
        </article>
      ))}
    </div>
  );
}
