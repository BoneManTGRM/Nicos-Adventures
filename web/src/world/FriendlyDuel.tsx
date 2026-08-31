import { useState } from "react";
import { NicoCostumeFigure } from "../nico/NicoCostumeFigure";
import type { Language, LocalProfile } from "../types";
import type { Announce, UpdateProfile } from "./common";
import {
  FRIENDLY_DUEL_ID,
  FRIENDLY_DUEL_MAX,
  FRIENDLY_DUEL_MISSION,
  friendlyDuelScore,
  initialFriendlyDuelState,
  playFriendlyDuelMove,
  type FriendlyDuelEvent,
  type FriendlyDuelMove,
} from "./friendlyDuel";
import { completeOnce } from "./progression";
import "./friendly-duel.css";

const copy = {
  en: {
    title: "Nico's Friendship Duel",
    subtitle: "A gentle one-on-one arcade match—no weapons, injuries, or scary knockouts.",
    back: "All games",
    courage: "Nico's courage",
    mischief: "Mischief meter",
    charge: "Star charge",
    quick: "Quick Move",
    quickHint: "Lower mischief by 1",
    block: "Block",
    blockHint: "Stop the next trick",
    star: "Star Move",
    starHint: "Lower mischief by 2",
    recharge: "Charge with another move",
    replay: "Play again",
    friend: "Mischief Bot is a friend!",
    breather: "Nico takes a quick breather",
    breatherBody: "Nobody is hurt. Try a few more blocks next round.",
    best: "Best score",
    round: "Round",
  },
  "es-MX": {
    title: "Duelo de amistad de Nico",
    subtitle: "Un encuentro arcade uno contra uno y tranquilo, sin armas, heridas ni derrotas aterradoras.",
    back: "Todos los juegos",
    courage: "Valor de Nico",
    mischief: "Medidor de travesuras",
    charge: "Carga estelar",
    quick: "Movimiento rápido",
    quickHint: "Reduce una travesura",
    block: "Bloquear",
    blockHint: "Detén el siguiente truco",
    star: "Movimiento estelar",
    starHint: "Reduce dos travesuras",
    recharge: "Carga con otro movimiento",
    replay: "Jugar otra vez",
    friend: "¡Robot Travieso ahora es amigo!",
    breather: "Nico toma un descanso breve",
    breatherBody: "Nadie se lastimó. Intenta bloquear un poco más en la siguiente ronda.",
    best: "Mejor puntuación",
    round: "Ronda",
  },
} as const;

const eventCopy: Record<FriendlyDuelEvent, Record<Language, string>> = {
  ready: { en: "Choose a move. Nico is ready!", "es-MX": "Elige un movimiento. ¡Nico está listo!" },
  quick: { en: "Quick move! Mischief Bot answers with a silly trick.", "es-MX": "¡Movimiento rápido! Robot Travieso responde con un truco divertido." },
  blocked: { en: "Perfect block! The silly trick bounced away.", "es-MX": "¡Bloqueo perfecto! El truco divertido rebotó." },
  star: { en: "Star Move! The arena sparkles as mischief fades.", "es-MX": "¡Movimiento estelar! La arena brilla mientras desaparecen las travesuras." },
  rival: { en: "Mischief Bot made a clever move. Nico can answer!", "es-MX": "Robot Travieso hizo un movimiento astuto. ¡Nico puede responder!" },
  won: { en: "The mischief is gone. The rivals finish with a high-five!", "es-MX": "Se acabaron las travesuras. ¡Los rivales terminan chocando las manos!" },
  breather: { en: "Time for water and a reset—everyone is safe.", "es-MX": "Es hora de tomar agua y volver a empezar; todos están a salvo." },
};

export function FriendlyDuel({ profile, update, announce, close }: {
  profile: LocalProfile;
  update: UpdateProfile;
  announce: Announce;
  close: () => void;
}) {
  const language = profile.language;
  const labels = copy[language];
  const [state, setState] = useState(initialFriendlyDuelState);

  const play = (move: FriendlyDuelMove) => {
    const next = playFriendlyDuelMove(state, move);
    if (next === state) {
      announce(labels.recharge);
      return;
    }
    setState(next);
    announce(eventCopy[next.lastEvent][language]);
    if (next.status === "won" && state.status === "playing") {
      const score = friendlyDuelScore(next);
      const scored = { ...profile, arcadeScores: { ...profile.arcadeScores, [FRIENDLY_DUEL_ID]: Math.max(profile.arcadeScores[FRIENDLY_DUEL_ID] ?? 0, score) } };
      const completion = completeOnce(scored, FRIENDLY_DUEL_MISSION, 2);
      update(completion.profile);
      if (completion.awarded) announce(language === "es-MX" ? "¡Ganaste dos estrellas y un nuevo amigo!" : "You earned two stars and a new friend!");
    }
  };

  const reset = () => {
    setState(initialFriendlyDuelState);
    announce(language === "es-MX" ? "Nueva ronda lista." : "New round ready.");
  };

  return (
    <section className="friendly-duel" data-duel-status={state.status} aria-labelledby="friendly-duel-title">
      <header className="friendly-duel__header">
        <button type="button" onClick={close}>← {labels.back}</button>
        <div><small>{labels.round} {state.round}</small><h2 id="friendly-duel-title">{labels.title}</h2><p>{labels.subtitle}</p></div>
        <strong>🏆 {labels.best}: {profile.arcadeScores[FRIENDLY_DUEL_ID] ?? 0}</strong>
      </header>

      <div className="friendly-duel__meters">
        <label><span>💚 {labels.courage}</span><progress max={FRIENDLY_DUEL_MAX} value={state.nicoCourage}>{state.nicoCourage}/{FRIENDLY_DUEL_MAX}</progress></label>
        <label><span>✨ {labels.mischief}</span><progress max={FRIENDLY_DUEL_MAX} value={state.rivalMischief}>{state.rivalMischief}/{FRIENDLY_DUEL_MAX}</progress></label>
      </div>

      <div className={`friendly-duel__arena move-${state.lastMove ?? "ready"}`}>
        <div className="friendly-duel__fighter friendly-duel__fighter--nico">
          <NicoCostumeFigure profession={profile.nico.profession} wardrobe={profile.nico.wardrobe} accentColor={profile.nico.accentColor} compact alt="Nico" />
          <strong>Nico</strong>
        </div>
        <div className="friendly-duel__burst" aria-hidden="true">✦</div>
        <div className="friendly-duel__fighter friendly-duel__fighter--rival" role="img" aria-label={language === "es-MX" ? "Robot Travieso, rival amistoso" : "Mischief Bot, friendly rival"}>
          <div className="mischief-bot" aria-hidden="true"><i/><span>◉ ◉</span><b>⌁</b></div>
          <strong>{language === "es-MX" ? "Robot Travieso" : "Mischief Bot"}</strong>
        </div>
      </div>

      <p className="friendly-duel__status" role="status" aria-live="polite">{eventCopy[state.lastEvent][language]}</p>

      {state.status === "playing" ? (
        <div className="friendly-duel__controls" role="group" aria-label={language === "es-MX" ? "Movimientos de Nico" : "Nico's moves"}>
          <button type="button" onClick={() => play("quick")}><span>⚡</span><strong>{labels.quick}</strong><small>{labels.quickHint}</small></button>
          <button type="button" onClick={() => play("block")}><span>🛡️</span><strong>{labels.block}</strong><small>{labels.blockHint}</small></button>
          <button type="button" disabled={state.starCharge < 2} onClick={() => play("star")}><span>⭐</span><strong>{labels.star}</strong><small>{state.starCharge < 2 ? `${labels.charge}: ${state.starCharge}/2` : labels.starHint}</small></button>
        </div>
      ) : (
        <div className={`friendly-duel__finish friendly-duel__finish--${state.status}`}>
          <span aria-hidden="true">{state.status === "won" ? "🤝" : "💧"}</span>
          <div><h3>{state.status === "won" ? labels.friend : labels.breather}</h3>{state.status === "breather" && <p>{labels.breatherBody}</p>}</div>
          <button type="button" className="fw-primary" onClick={reset}>{labels.replay}</button>
        </div>
      )}
    </section>
  );
}
