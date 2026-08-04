import { useEffect, useState } from "react";
import { ROBOT_ACTIONS, ROBOT_JOBS, type RobotPose } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, Robot } from "../types";
import { fieldLabel, tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import { ROBOT_OPTIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { makeId } from "./common";
import { completeOnce, hasCompleted, robotJobMission } from "./progression";

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
  const selectedJob = draft.job || ROBOT_JOBS[0];
  const selectedJobMission = robotJobMission(draft.id, selectedJob);
  const selectedJobComplete = hasCompleted(profile, selectedJobMission);
  const completedJobs = ROBOT_JOBS.filter((job) => hasCompleted(profile, robotJobMission(draft.id, job))).length;

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
    update({ ...profile, robot, robots, activeRobotId: robot.id, stars: profile.stars + (exists ? 0 : 2) });
    setDraft(robot);
    play("celebrate");
    announce(`${robot.name}: ${tr(ui.saveSuccess, language)}`);
  };

  const doJob = () => {
    if (selectedJobComplete) return;
    const xp = draft.xp + 20;
    const robot = { ...draft, job: selectedJob, xp, level: Math.floor(xp / 50) + 1 };
    const robots = profile.robots.some((item) => item.id === robot.id)
      ? profile.robots.map((item) => item.id === robot.id ? robot : item)
      : [...profile.robots, robot];
    const completion = completeOnce({ ...profile, robot, robots, activeRobotId: robot.id }, selectedJobMission, 1);
    setDraft(robot);
    update(completion.profile);
    play("scan");
    announce(language === "es-MX"
      ? `Certificación completada: ${optionLabel(selectedJob, language)}. Ganaste 20 de experiencia y una estrella.`
      : `Certification completed: ${selectedJob}. You earned 20 XP and one star.`);
  };

  return (
    <div className="fw-builder-layout">
      <section aria-label={tr(ui.robotPreview, language)}>
        <RobotStage
          robot={draft}
          pose={pose as never}
          statusLabel={optionLabel(selectedJob, language)}
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
          <p className="fw-progress-summary">
            {language === "es-MX" ? "Certificaciones" : "Certifications"}: {completedJobs}/{ROBOT_JOBS.length}
          </p>
          <div className="job-grid">
            {ROBOT_JOBS.map((job) => {
              const certified = hasCompleted(profile, robotJobMission(draft.id, job));
              return (
                <button
                  type="button"
                  aria-pressed={selectedJob === job}
                  className={`${selectedJob === job ? "active" : ""} ${certified ? "completed" : ""}`.trim()}
                  key={job}
                  onClick={() => set("job", job)}
                >
                  {certified ? "✅ " : ""}{optionLabel(job, language)}
                </button>
              );
            })}
          </div>
          <div className="job-readout" role="status">
            <b>{tr(ui.currentJob, language)}:</b> {optionLabel(selectedJob, language)}<br />
            <small>{selectedJobComplete
              ? (language === "es-MX" ? "Este robot ya obtuvo esta certificación." : "This robot already earned this certification.")
              : tr(ui.jobHelp, language)}</small>
          </div>
          <button type="button" onClick={doJob} disabled={selectedJobComplete}>
            {selectedJobComplete ? "✅" : "⚙️"} {selectedJobComplete
              ? (language === "es-MX" ? "Certificación completada" : "Certification complete")
              : tr(ui.doJob, language)}
          </button>
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
                aria-pressed={profile.activeRobotId === robot.id}
                className={profile.activeRobotId === robot.id ? "active" : ""}
                onClick={() => {
                  setDraft({ ...robot });
                  update({ ...profile, robot, activeRobotId: robot.id });
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
