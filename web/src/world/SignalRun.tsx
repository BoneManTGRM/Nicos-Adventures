import { useEffect, useMemo, useState } from "react";
import type { LocalProfile } from "../types";
import { PremiumBoltBotSprite } from "../boltbot/PremiumBoltBotSprite";
import type { Announce, UpdateProfile } from "./common";
import { completeOnce } from "./progression";
import { boardFor, GRID_SIZE, initialRobot, LEVEL_COUNT, PROGRAM_LIMIT, samePoint, SIGNAL_RUN_ID, stepRobot, type Command } from "./signalRun";
import "./signal-run.css";

const arrows = ["↑", "→", "↓", "←"];
const mission = (level: number) => `arcade:${SIGNAL_RUN_ID}:${level}`;

export function SignalRun({ profile, update, announce, close }: { profile: LocalProfile; update: UpdateProfile; announce: Announce; close: () => void }) {
  const es = profile.language === "es-MX";
  const [level, setLevel] = useState(() => {
    const next = Array.from({ length: LEVEL_COUNT }, (_, index) => index).find(index => !profile.completedMissions.includes(mission(index)));
    return next ?? 0;
  });
  const [program, setProgram] = useState<Command[]>([]);
  const board = useMemo(() => boardFor(level), [level]);
  const [robot, setRobot] = useState(() => initialRobot(board));
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"ready" | "blocked" | "unfinished" | "won">("ready");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (index >= program.length) { setRunning(false); setResult("unfinished"); return; }
    const timer = window.setTimeout(() => {
      const next = stepRobot(board, robot, program[index]);
      setRobot(next.state);
      setIndex(index + 1);
      if (next.outcome === "blocked") { setRunning(false); setResult("blocked"); setStreak(0); return; }
      if (next.outcome === "won") {
        setRunning(false); setResult("won");
        const nextScore = score + 10 + Math.max(0, 3 - Math.floor(program.length / 8)) + Math.min(streak, 5);
        setScore(nextScore); setStreak(streak + 1);
        const saved = { ...profile, arcadeScores: { ...profile.arcadeScores, [SIGNAL_RUN_ID]: Math.max(profile.arcadeScores[SIGNAL_RUN_ID] ?? 0, nextScore) } };
        const completion = completeOnce(saved, mission(level), 1);
        update(completion.profile);
        announce(es ? `¡Misión completa! ${completion.awarded ? "Ganaste una estrella." : "Ya ganaste esta estrella."}` : `Mission complete! ${completion.awarded ? "You earned a star." : "You already earned this star."}`);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [board, es, index, program, profile, robot, running, score, streak, update, announce, level]);

  const resetRobot = () => { setRunning(false); setRobot(initialRobot(board)); setIndex(0); setResult("ready"); };
  const add = (command: Command) => { if (running || result === "won" || program.length >= PROGRAM_LIMIT) return; setProgram(previous => [...previous, command]); resetRobot(); };
  const undo = () => { if (running || result === "won") return; setProgram(previous => previous.slice(0, -1)); resetRobot(); };
  const advance = () => { setRunning(false); const next = (level + 1) % LEVEL_COUNT; setLevel(next); setRobot(initialRobot(boardFor(next))); setProgram([]); setIndex(0); setResult("ready"); };
  const labels = es ? { back: "Todos los juegos", title: "Ruta de señales", subject: "Programa a BoltBot", instruction: "Coloca órdenes para recoger la batería y llegar a la señal. Girar cambia la dirección; no mueve al robot.", battery: "Batería", beacon: "Señal", wall: "Roca", robot: "BoltBot", empty: "Toca las órdenes para armar tu programa.", forward: "Avanzar", left: "Girar izquierda", right: "Girar derecha", undo: "Deshacer", clear: "Borrar", run: "Ejecutar", retry: "Volver a probar", next: "Siguiente ruta", finish: "¡Ruta completa!", blocked: "BoltBot chocó. Cambia una orden y prueba de nuevo.", unfinished: "Aún falta llegar con la batería. Agrega o cambia órdenes.", ready: "Reúne la batería antes de llegar a la señal.", best: "Mejor", streak: "Racha", level: "Ruta", finishedAll: "¡Completaste las 12 rutas! Puedes volver a jugarlas." }
    : { back: "All games", title: "Signal Run", subject: "Program BoltBot", instruction: "Queue commands to collect the battery and reach the beacon. Turning changes direction; it does not move the robot.", battery: "Battery", beacon: "Beacon", wall: "Rock", robot: "BoltBot", empty: "Tap commands to build a program.", forward: "Forward", left: "Turn left", right: "Turn right", undo: "Undo", clear: "Clear", run: "Run", retry: "Try again", next: "Next route", finish: "Route complete!", blocked: "BoltBot hit a rock. Change a command and try again.", unfinished: "The battery and beacon are still ahead. Add or change commands.", ready: "Collect the battery before reaching the beacon.", best: "Best", streak: "Streak", level: "Route", finishedAll: "You completed all 12 routes! You can play them again." };
  const completed = Array.from({ length: LEVEL_COUNT }, (_, current) => profile.completedMissions.includes(mission(current))).filter(Boolean).length;
  const status = result === "won" ? labels.finish : result === "blocked" ? labels.blocked : result === "unfinished" ? labels.unfinished : labels.ready;

  return <section className="signal-run" aria-label={labels.title} data-testid="signal-run">
    <header className="signal-run__header"><button type="button" onClick={close}>← {labels.back}</button><span>⚡ {labels.level} {level + 1}/{LEVEL_COUNT}</span><strong>🏆 {labels.best}: {profile.arcadeScores[SIGNAL_RUN_ID] ?? 0}</strong></header>
    <div className="signal-run__intro"><div><small>NICO · BOLTBOT</small><h2>{labels.title}</h2><p>{labels.instruction}</p></div><div className="signal-run__stats"><span>✦ {score}</span><span>🔥 {labels.streak}: {streak}</span><span>⭐ {completed}/{LEVEL_COUNT}</span></div></div>
    <div className="signal-run__play">
      <div className="signal-run__board" role="img" aria-label={`${labels.level} ${level + 1}: ${labels.robot} ${robot.x + 1}, ${robot.y + 1}. ${robot.charged ? labels.battery : labels.ready}`}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, cell) => {
          const point = { x: cell % GRID_SIZE, y: Math.floor(cell / GRID_SIZE) };
          const wall = board.walls.some(tile => samePoint(tile, point)), bot = samePoint(robot, point);
          const battery = !robot.charged && samePoint(board.battery, point), beacon = samePoint(board.beacon, point);
          return <div key={cell} className={`signal-run__cell${wall ? " is-wall" : ""}${beacon ? " is-beacon" : ""}${battery ? " is-battery" : ""}${bot ? " is-bot" : ""}`} aria-hidden="true">{bot ? <span className="signal-run__bot"><PremiumBoltBotSprite robot={profile.robot} action={running ? "drive" : result === "won" ? "celebrate" : "idle"} /><b>{arrows[robot.facing]}</b></span> : wall ? "▦" : battery ? "🔋" : beacon ? "✦" : ""}</div>;
        })}
      </div>
      <div className="signal-run__panel"><div className="signal-run__legend"><span>🔋 {labels.battery}</span><span>✦ {labels.beacon}</span><span>▦ {labels.wall}</span></div>
        <div className="signal-run__program"><strong>{es ? "Tu programa" : "Your program"} <span>{program.length}/{PROGRAM_LIMIT}</span></strong><div className="signal-run__chips" aria-label={es ? "Órdenes programadas" : "Programmed commands"}>{program.length ? program.map((command, commandIndex) => <span key={commandIndex} className={index === commandIndex && running ? "is-current" : ""}>{command === "forward" ? "↑" : command === "left" ? "↶" : "↷"}<small>{commandIndex + 1}</small></span>) : <p>{labels.empty}</p>}</div></div>
        <div className="signal-run__controls"><button type="button" disabled={running || result === "won" || program.length >= PROGRAM_LIMIT} onClick={() => add("forward")}>↑ <span>{labels.forward}</span></button><button type="button" disabled={running || result === "won" || program.length >= PROGRAM_LIMIT} onClick={() => add("left")}>↶ <span>{labels.left}</span></button><button type="button" disabled={running || result === "won" || program.length >= PROGRAM_LIMIT} onClick={() => add("right")}>↷ <span>{labels.right}</span></button></div>
        <div className="signal-run__edit"><button type="button" disabled={running || result === "won" || program.length === 0} onClick={undo}>{labels.undo}</button><button type="button" disabled={running || result === "won" || program.length === 0} onClick={() => { setProgram([]); resetRobot(); }}>{labels.clear}</button></div>
        <p className={`signal-run__feedback ${result}`} role="status" aria-live="polite">{status}</p>
        {result === "won" ? <button type="button" className="signal-run__primary" onClick={advance}>{labels.next} →</button> : <button type="button" className="signal-run__primary" disabled={running || !program.length} onClick={() => { resetRobot(); setRunning(true); }}>{result === "ready" ? labels.run : labels.retry} ▶</button>}
        {completed === LEVEL_COUNT && <small className="signal-run__mastered">{labels.finishedAll}</small>}
      </div>
    </div>
  </section>;
}
