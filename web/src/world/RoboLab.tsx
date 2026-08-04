import { useEffect, useState } from "react";
import { ROBOT_ACTIONS, ROBOT_JOBS, type RobotPose } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, Robot } from "../types";
import { fieldLabel, tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import { ROBOT_OPTIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { makeId } from "./common";

export function RoboLab({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<Robot>({
    ...profile.robot,
    job: profile.robot.job || ROBOT_JOBS[0],
    mood: profile.robot.mood || "Happy",
    voice: profile.robot.voice || "Classic Beep",
  });
  const [pose, setPose] = useState<RobotPose>("idle");

  useEffect(() => {
    setDraft({
      ...profile.robot,
      job: profile.robot.job || ROBOT_JOBS[0],
      mood: profile.robot.mood || "Happy",
      voice: profile.robot.voice || "Classic Beep",
    });
  }, [profile.id, profile.robot]);

  const set = (key: keyof Robot, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const play = (next: RobotPose) => {
    setPose(next);
    window.setTimeout(() => setPose("idle"), 1600);
  };
  const pick = (values: string[]) => values[Math.floor(Math.random() * values.length)];

  const randomize = () => {
    setDraft((current) => ({
      ...current,
      id: makeId("robot"),
      name: `BoltBot ${Math.floor(Math.random() * 900 + 100)}`,
      color: pick(ROBOT_OPTIONS.color),
      secondary_color: pick(ROBOT_OPTIONS.secondary_color),
      head: pick(ROBOT_OPTIONS.head),
      eyes: pick(ROBOT_OPTIONS.eyes),
      body: pick(ROBOT_OPTIONS.body),
      arms: pick(ROBOT_OPTIONS.arms),
      base: pick(ROBOT_OPTIONS.base),
      backpack: pick(ROBOT_OPTIONS.backpack),
      power: pick(ROBOT_OPTIONS.power),
      personality: pick(ROBOT_OPTIONS.personality),
      mood: pick(ROBOT_OPTIONS.mood),
      voice: pick(ROBOT_OPTIONS.voice),
      job: pick(ROBOT_JOBS),
      level: 1,
      xp: 0,
    }));
    announce(language === "es-MX" ? "Se creó un robot al azar." : "A random robot was created.");
  };

  const save = () => {
    const robot = { ...draft, id: draft.id || makeId("robot"), name: draft.name.trim() || "BoltBot" };
    const exists = profile.robots.some((item) => item.id === robot.id);
    const robots = exists
      ? profile.robots.map((item) => item.id === robot.id ? robot : item)
      : [...profile.robots, robot];
    update({ ...profile, robot, robots, stars: profile.stars + (exists ? 0 : 2) });
    setDraft(robot);
    play("celebrate");
    announce(`${robot.name}: ${tr(ui.saveSuccess, language)}`);
  };

  const doJob = () => {
    const xp = draft.xp + 20;
    const robot = { ...draft, xp, level: Math.floor(xp / 50) + 1 };
    const robots = profile.robots.some((item) => item.id === robot.id)
      ? profile.robots.map((item) => item.id === robot.id ? robot : item)
      : [...profile.robots, robot];
    setDraft(robot);
    update({ ...profile, robot, robots, stars: profile.stars + 1 });
    play("scan");
    announce(language === "es-MX" ? "Trabajo completado. Ganaste experiencia y una estrella." : "Job completed. You earned experience and one star.");
  };

  return (
    <div className="fw-builder-layout">
      <section aria-label={tr(ui.robotPreview, language)}>
        <RobotStage
          robot={draft}
          pose={pose as never}
          statusLabel={optionLabel(draft.job || tr(ui.robotPreview, language), language)}
          levelLabel={tr(ui.levelShort, language)}
        />
        <div className="robot-action-grid" role="group" aria-label={language === "es-MX" ? "Movimientos del robot" : "Robot movements"}>
          {ROBOT_ACTIONS.map((action) => (
            <button type="button" key={action.pose} onClick={() => play(action.pose)}>
              <span aria-hidden="true">{action.icon}</span> {language === "es-MX" ? action.es : action.en}
            </button>
          ))}
        </div>
      </section>

      <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
        <label>
          {tr(ui.robotName, language)}
          <input value={draft.name} maxLength={32} onChange={(event) => set("name", event.target.value)} />
        </label>
        <fieldset className="fw-fieldset-reset">
          <legend>{tr(ui.formControls, language)}</legend>
          <div className="fw-form-grid">
            {Object.entries(ROBOT_OPTIONS).map(([key, values]) => (
              <label key={key}>
                {fieldLabel(key, language)}
                <select
                  value={String(draft[key as keyof Robot] || values[0])}
                  onChange={(event) => set(key as keyof Robot, event.target.value)}
                >
                  {values.map((value) => <option value={value} key={value}>{optionLabel(value, language)}</option>)}
                </select>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="monster-form-section">
          <legend><h2>{tr(ui.robotJobs, language)}</h2></legend>
          <div className="job-grid">
            {ROBOT_JOBS.map((job) => (
              <button
                type="button"
                aria-pressed={draft.job === job}
                className={draft.job === job ? "active" : ""}
                key={job}
                onClick={() => set("job", job)}
              >
                {optionLabel(job, language)}
              </button>
            ))}
          </div>
          <div className="job-readout" role="status">
            <b>{tr(ui.currentJob, language)}:</b> {optionLabel(draft.job, language)}<br />
            <small>{tr(ui.jobHelp, language)}</small>
          </div>
          <button type="button" onClick={doJob}>⚙️ {tr(ui.doJob, language)}</button>
        </fieldset>

        <div className="fw-action-row">
          <button type="button" onClick={randomize}>🎲 {tr(ui.randomRobot, language)}</button>
          <button type="button" className="fw-primary" onClick={save}>💾 {tr(ui.saveRobot, language)}</button>
        </div>

        <section aria-labelledby="saved-robots-heading">
          <h2 id="saved-robots-heading" className="fw-subheading">{tr(ui.savedRobots, language)}</h2>
          <div className="fw-collection-row">
            {profile.robots.map((robot) => (
              <button
                type="button"
                key={robot.id}
                aria-pressed={draft.id === robot.id}
                onClick={() => {
                  setDraft({ ...robot });
                  announce(`${robot.name}: ${tr(ui.selected, language)}`);
                }}
              >
                🤖 {robot.name}
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
