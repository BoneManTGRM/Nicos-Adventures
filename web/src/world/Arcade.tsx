import { lazy, Suspense, useMemo, useState } from "react";
import type { LocalProfile } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import { ARCADE_GAMES, ARCADE_ICONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { ARCADE_QUESTIONS } from "./arcadeChallenges";
import { FRIENDLY_DUEL_ID } from "./friendlyDuel";
import { arcadeMissionId, completeOnce, hasCompleted } from "./progression";

const FriendlyDuel = lazy(() => import("./FriendlyDuel").then((module) => ({ default: module.FriendlyDuel })));

export function Arcade({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState(0);

  const questions = activeGame ? ARCADE_QUESTIONS[activeGame] ?? [] : [];
  const question = questions.length ? questions[questionIndex % questions.length] : null;
  const answeredCorrectly = question && answerIndex === question.correctIndex;
  const solvedCount = useMemo(
    () => activeGame
      ? questions.filter((item) => hasCompleted(profile, arcadeMissionId(activeGame, item.id))).length
      : 0,
    [activeGame, profile, questions],
  );

  const openGame = (game: string) => {
    setActiveGame(game);
    setQuestionIndex(0);
    setAnswerIndex(null);
    setSessionScore(0);
    announce(language === "es-MX" ? `Juego abierto: ${optionLabel(game, language)}.` : `Game opened: ${game}.`);
  };

  const answer = (index: number) => {
    if (!activeGame || !question || answerIndex !== null) return;
    setAnswerIndex(index);
    const correct = index === question.correctIndex;
    if (!correct) {
      announce(language === "es-MX"
        ? `Intenta de nuevo en la siguiente ronda. ${question.explanation[language]}`
        : `Try again in the next round. ${question.explanation[language]}`);
      return;
    }

    const nextScore = sessionScore + 10;
    setSessionScore(nextScore);
    const best = Math.max(profile.arcadeScores[activeGame] ?? 0, nextScore);
    const baseProfile = { ...profile, arcadeScores: { ...profile.arcadeScores, [activeGame]: best } };
    const completion = completeOnce(baseProfile, arcadeMissionId(activeGame, question.id), 1);
    update(completion.profile);
    announce(language === "es-MX"
      ? `Respuesta correcta. ${question.explanation[language]}${completion.awarded ? " Ganaste una estrella." : ""}`
      : `Correct. ${question.explanation[language]}${completion.awarded ? " You earned one star." : ""}`);
  };

  const nextQuestion = () => {
    setQuestionIndex((current) => current + 1);
    setAnswerIndex(null);
  };

  if (activeGame === FRIENDLY_DUEL_ID) {
    return (
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando la arena…" : "Preparing the arena…"}</div>}>
        <FriendlyDuel profile={profile} update={update} announce={announce} close={() => setActiveGame(null)} />
      </Suspense>
    );
  }

  if (activeGame && question) {
    return (
      <div className="arcade-challenge-layout">
        <section className="arcade-challenge" aria-labelledby="arcade-question-heading">
          <header>
            <button type="button" onClick={() => setActiveGame(null)}>← {language === "es-MX" ? "Todos los juegos" : "All games"}</button>
            <div>
              <small>{optionLabel(activeGame, language)}</small>
              <h2 id="arcade-question-heading">{language === "es-MX" ? "Desafío" : "Challenge"} {questionIndex % questions.length + 1}/{questions.length}</h2>
            </div>
            <strong>{language === "es-MX" ? "Puntuación" : "Score"}: {sessionScore}</strong>
          </header>

          <progress max={questions.length} value={solvedCount}>{solvedCount}/{questions.length}</progress>
          <p className="arcade-question-text">{question.prompt[language]}</p>
          <div className="arcade-answer-grid" role="group" aria-label={question.prompt[language]}>
            {question.options.map((option, index) => {
              const selected = answerIndex === index;
              const correct = answerIndex !== null && index === question.correctIndex;
              const wrong = selected && !correct;
              return (
                <button
                  type="button"
                  key={option.en}
                  className={`${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`.trim()}
                  aria-pressed={selected}
                  disabled={answerIndex !== null}
                  onClick={() => answer(index)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option[language]}</strong>
                </button>
              );
            })}
          </div>

          {answerIndex !== null && (
            <div className={`arcade-feedback ${answeredCorrectly ? "correct" : "wrong"}`} role="status">
              <strong>{answeredCorrectly
                ? (language === "es-MX" ? "¡Correcto!" : "Correct!")
                : (language === "es-MX" ? "Buena práctica" : "Good practice")}</strong>
              <p>{question.explanation[language]}</p>
              <button type="button" className="fw-primary" onClick={nextQuestion}>
                {language === "es-MX" ? "Siguiente desafío" : "Next challenge"} →
              </button>
            </div>
          )}
        </section>

        <aside className="arcade-progress-card">
          <span aria-hidden="true">🏆</span>
          <h3>{language === "es-MX" ? "Progreso del juego" : "Game progress"}</h3>
          <p>{language === "es-MX" ? "Preguntas resueltas" : "Questions solved"}: {solvedCount}/{questions.length}</p>
          <p>{tr(ui.bestScore, language)}: {profile.arcadeScores[activeGame] ?? 0}</p>
          <small>{language === "es-MX"
            ? "Cada pregunta correcta otorga una estrella solo la primera vez."
            : "Each correct question awards one star only the first time."}</small>
        </aside>
      </div>
    );
  }

  return (
    <div className="arcade-hub">
      <article className="arcade-featured-duel">
        <span aria-hidden="true">🥊</span>
        <div>
          <small>{language === "es-MX" ? "NUEVO · DUELO AMISTOSO" : "NEW · FRIENDLY DUEL"}</small>
          <h2>{language === "es-MX" ? "Duelo de amistad de Nico" : "Nico's Friendship Duel"}</h2>
          <p>{language === "es-MX" ? "Uno contra uno, tranquilo y sin violencia gráfica. Convierte al rival en amigo." : "A gentle one-on-one match with no graphic violence. Turn the rival into a friend."}</p>
        </div>
        <button type="button" className="fw-primary" onClick={() => openGame(FRIENDLY_DUEL_ID)}>▶ {tr(ui.play, language)}</button>
      </article>
      <div className="fw-card-grid arcade-game-grid">
      {ARCADE_GAMES.map((game, index) => {
        const gameQuestions = ARCADE_QUESTIONS[game] ?? [];
        const solved = gameQuestions.filter((item) => hasCompleted(profile, arcadeMissionId(game, item.id))).length;
        return (
          <article className="fw-game-card" key={game}>
            <div aria-hidden="true">{ARCADE_ICONS[index]}</div>
            <h3>{optionLabel(game, language)}</h3>
            <p>{tr(ui.bestScore, language)}: {profile.arcadeScores[game] ?? 0}</p>
            <progress max={gameQuestions.length || 1} value={solved}>{solved}/{gameQuestions.length}</progress>
            <small>{language === "es-MX" ? "Desafíos resueltos" : "Challenges solved"}: {solved}/{gameQuestions.length}</small>
            <button type="button" onClick={() => openGame(game)}>▶ {tr(ui.play, language)}</button>
          </article>
        );
      })}
      </div>
    </div>
  );
}
