import { useMemo, useRef, useState, type FormEvent } from "react";
import { answerNicoQuestion, suggestedQuestions, type NicoAnswer } from "./knowledge";
import type { Language } from "../types";

type Props = {
  language: Language;
  speechEnabled: boolean;
};

type Exchange = {
  id: string;
  question: string;
  answer: NicoAnswer;
};

const copy = {
  en: {
    title: "Ask Nico",
    intro: "I answer from a safe bilingual library stored inside this app. Nothing you type is sent online.",
    placeholder: "Ask about robots, animals, movies, stars, or the app…",
    ask: "Ask",
    read: "Read answer",
    fallback: "Try one of these questions",
    private: "Private and on-device",
  },
  "es-MX": {
    title: "Pregúntale a Nico",
    intro: "Respondo con una biblioteca bilingüe segura guardada dentro de esta app. Nada de lo que escribes se envía en línea.",
    placeholder: "Pregunta sobre robots, animales, películas, estrellas o la app…",
    ask: "Preguntar",
    read: "Leer respuesta",
    fallback: "Prueba una de estas preguntas",
    private: "Privado y en este dispositivo",
  },
} as const;

const makeId = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

export function AskNico({ language, speechEnabled }: Props) {
  const text = copy[language];
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => suggestedQuestions(language), [language]);
  const latest = exchanges.at(-1);

  const submitQuestion = (raw: string) => {
    const clean = raw.trim().slice(0, 180);
    if (!clean) return;
    const answer = answerNicoQuestion(clean, language);
    setExchanges((current) => [...current.slice(-5), { id: makeId(), question: clean, answer }]);
    setQuestion("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion(question);
  };

  const speak = () => {
    if (!latest || !speechEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latest.answer.text);
    utterance.lang = language === "es-MX" ? "es-MX" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="nico-ask" aria-labelledby="nico-ask-title">
      <header className="nico-feature-heading">
        <div>
          <small>🔒 {text.private}</small>
          <h2 id="nico-ask-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="nico-chat-log" aria-live="polite">
        {exchanges.length === 0 ? (
          <div className="nico-chat-empty">
            <span aria-hidden="true">💬</span>
            <strong>{text.fallback}</strong>
          </div>
        ) : exchanges.map((exchange) => (
          <article className="nico-chat-exchange" key={exchange.id}>
            <p className="nico-chat-question"><strong>{language === "es-MX" ? "Tú" : "You"}:</strong> {exchange.question}</p>
            <p className={`nico-chat-answer nico-chat-answer--${exchange.answer.confidence}`}>
              <strong>Nico:</strong> {exchange.answer.text}
            </p>
          </article>
        ))}
      </div>

      <div className="nico-suggestion-grid" aria-label={text.fallback}>
        {suggestions.map((suggestion) => (
          <button type="button" key={suggestion} onClick={() => submitQuestion(suggestion)}>{suggestion}</button>
        ))}
      </div>

      <form className="nico-question-form" onSubmit={onSubmit}>
        <label htmlFor="nico-question" className="sr-only">{text.placeholder}</label>
        <input
          id="nico-question"
          ref={inputRef}
          value={question}
          maxLength={180}
          autoComplete="off"
          inputMode="text"
          placeholder={text.placeholder}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button className="nico-primary-action" type="submit" disabled={!question.trim()}>{text.ask}</button>
      </form>

      {latest && speechEnabled && "speechSynthesis" in window && (
        <button type="button" className="nico-secondary-action" onClick={speak}>🔊 {text.read}</button>
      )}
    </section>
  );
}
