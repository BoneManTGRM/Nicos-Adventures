import { useEffect, useMemo, useState } from "react";
import type { LocalProfile } from "../types";
import { PremiumBoltBotSprite } from "../boltbot/PremiumBoltBotSprite";
import type { Announce, UpdateProfile } from "./common";
import { completeOnce } from "./progression";
import { ANSWERS_PER_CHECKPOINT, CHECKPOINT_COUNT, makeQuestion, SIGNAL_RUN_ID, SPRINT_SECONDS, type DashQuestion } from "./signalRun";
import "./signal-run.css";

type Phase = "ready" | "playing" | "feedback" | "finished";
const mission = (checkpoint: number) => `arcade:${SIGNAL_RUN_ID}:${checkpoint}`;

export function SignalRun({ profile, update, announce, close }: { profile: LocalProfile; update: UpdateProfile; announce: Announce; close: () => void }) {
  const es = profile.language === "es-MX";
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000) + 1);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const maxEnergy = profile.robot.upgrades?.includes('battery') ? 4 : 3;
  const startSeconds = SPRINT_SECONDS + (profile.robot.upgrades?.includes('turbo') ? 10 : 0);
  const [seconds, setSeconds] = useState(startSeconds);
  const [energy, setEnergy] = useState(maxEnergy);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answeredQuestion, setAnsweredQuestion] = useState<DashQuestion | null>(null);
  const [earned, setEarned] = useState(false);
  const completed = Array.from({ length: CHECKPOINT_COUNT }, (_, index) => profile.completedMissions.includes(mission(index))).filter(Boolean).length;
  const checkpoint = Math.min(completed, CHECKPOINT_COUNT - 1);
  const question = useMemo(() => makeQuestion(seed + round * 7919, checkpoint), [seed, round, checkpoint]);
  const visibleQuestion = phase === "feedback" && answeredQuestion ? answeredQuestion : question;
  const labels = es ? {
    title: "Carrera de números", back: "Todos los juegos", guide: "Elige el resultado correcto. ¡Carga a BoltBot y encadena aciertos!", best: "Récord", checkpoint: "Etapa", score: "Puntos", energy: "Energía", time: "Tiempo", goal: "5 aciertos para una estrella", ready: "¡Toca una respuesta para empezar!", good: "¡Correcto!", wrong: "Casi. La respuesta es", star: "¡Etapa superada! Ganaste una estrella.", finish: "¡Buena carrera!", retry: "Jugar otra vez", mastered: "¡Conseguiste las 12 estrellas! Sigue mejorando tu récord.", keys: "Toca una puerta o usa 1, 2, 3.", boost: "¡Racha!"
  } : {
    title: "Number Dash", back: "All games", guide: "Pick the right answer. Power up BoltBot and build a combo!", best: "Best", checkpoint: "Stage", score: "Score", energy: "Energy", time: "Time", goal: "5 right answers earn a star", ready: "Tap an answer to start!", good: "Nice hit!", wrong: "Close. The answer is", star: "Stage cleared! You earned a star.", finish: "Nice run!", retry: "Play again", mastered: "All 12 stars earned! Keep beating your best score.", keys: "Tap a gate or press 1, 2, 3.", boost: "Combo!"
  };

  useEffect(() => {
    if (phase !== "playing" && phase !== "feedback") return;
    const timer = window.setInterval(() => setSeconds(current => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => { if (seconds === 0 && phase !== "ready") setPhase("finished"); }, [seconds, phase]);
  useEffect(() => {
    if (phase !== "feedback") return;
    const timer = window.setTimeout(() => {
      if (energy === 0) setPhase("finished");
      else { setSelected(null); setAnsweredQuestion(null); setEarned(false); setRound(value => value + 1); setPhase("playing"); }
    }, earned ? 1500 : 1150);
    return () => window.clearTimeout(timer);
  }, [phase, energy, earned]);

  const choose = (choiceIndex: number) => {
    if (phase === "feedback" || phase === "finished") return;
    const correct = question.choices[choiceIndex] === question.answer;
    setSelected(choiceIndex);
    setAnsweredQuestion(question);
    setEarned(false);
    if (correct) {
      const nextStreak = streak + 1;
      const nextScore = score + 10 + Math.min(nextStreak - 1, 10) * 2;
      const nextProgress = progress + 1;
      setStreak(nextStreak); setScore(nextScore);
      const saved = { ...profile, arcadeScores: { ...profile.arcadeScores, [SIGNAL_RUN_ID]: Math.max(profile.arcadeScores[SIGNAL_RUN_ID] ?? 0, nextScore) } };
      if (nextProgress === ANSWERS_PER_CHECKPOINT) {
        const completion = completeOnce(saved, mission(checkpoint), 1);
        setEarned(completion.awarded);
        setProgress(0);
        update(completion.profile);
        if (completion.awarded) announce(labels.star);
      } else { setProgress(nextProgress); update(saved); }
    } else { setStreak(0); setEnergy(value => value - 1); }
    setPhase("feedback");
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || !["1", "2", "3"].includes(event.key)) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable=true]")) return;
      choose(Number(event.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const restart = () => { setSeed(Math.floor(Math.random() * 1000000) + 1); setRound(0); setPhase("ready"); setSeconds(startSeconds); setEnergy(maxEnergy); setStreak(0); setScore(0); setProgress(0); setSelected(null); setAnsweredQuestion(null); setEarned(false); };
  const right = selected !== null && answeredQuestion !== null && answeredQuestion.choices[selected] === answeredQuestion.answer;
  const feedback = phase === "finished" ? `${labels.finish} ${labels.score}: ${score}` : selected === null ? labels.ready : `${right ? labels.good : `${labels.wrong} ${visibleQuestion.answer}.`} ${visibleQuestion.explanation[es ? "es-MX" : "en"]}${earned ? ` ${labels.star}` : ""}`;

  return <section className="signal-run" aria-label={labels.title} data-testid="signal-run">
    <header className="signal-run__header"><button type="button" onClick={close}>← {labels.back}</button><strong>⚡ {labels.title}</strong><span>🏆 {labels.best}: {profile.arcadeScores[SIGNAL_RUN_ID] ?? 0}</span></header>
    <div className="signal-run__hud"><span>⭐ {completed}/{CHECKPOINT_COUNT}</span><span>🔥 {streak}</span><span>✦ {score}</span><span className={seconds < 16 ? "is-urgent" : ""}>⏱ {seconds}s</span><span aria-label={`${labels.energy}: ${energy}/${maxEnergy}`}>{"♥".repeat(energy)}<i>{"♡".repeat(maxEnergy - energy)}</i></span></div>
    <div className="signal-run__scene" data-result={selected === null ? "idle" : right ? "correct" : "wrong"}>
      <div className="signal-run__sky"><span className="signal-run__sun" /><span className="signal-run__mountains" /><span className="signal-run__city" /></div>
      <div className="signal-run__goal"><span>★</span><strong>{labels.checkpoint} {checkpoint + 1}/{CHECKPOINT_COUNT}</strong><small>{progress}/{ANSWERS_PER_CHECKPOINT} · {labels.goal}</small></div>
      <div className="signal-run__road"><span /><span /><span /></div>
      <div className="signal-run__robot"><PremiumBoltBotSprite robot={profile.robot} action={right ? "celebrate" : phase === "playing" ? "drive" : "ready"} alt="BoltBot" /></div>
      {streak > 1 && <div className="signal-run__combo">{labels.boost} ×{streak}</div>}
    </div>
    <div className="signal-run__challenge"><p>{labels.guide}</p><strong data-testid="dash-question">{visibleQuestion.prompt}</strong><small>{labels.keys}</small></div>
    <div className="signal-run__gates" role="group" aria-label={visibleQuestion.prompt}>
      {visibleQuestion.choices.map((choice, index) => <button key={`${round}-${index}`} type="button" className={`${selected === index ? "is-picked" : ""} ${selected !== null && choice === visibleQuestion.answer ? "is-correct" : ""}`} disabled={phase === "feedback" || phase === "finished"} onClick={() => choose(index)} aria-label={`${index + 1}: ${choice}`}><small>{index + 1}</small><strong>{choice}</strong><span>➜</span></button>)}
    </div>
    <div className={`signal-run__feedback ${selected === null ? "" : right ? "is-good" : "is-wrong"}`} role="status" aria-live="polite">{feedback}</div>
    {phase === "finished" && <button className="signal-run__retry" type="button" onClick={restart}>↻ {labels.retry}</button>}
    {completed === CHECKPOINT_COUNT && <p className="signal-run__mastered">{labels.mastered}</p>}
  </section>;
}
