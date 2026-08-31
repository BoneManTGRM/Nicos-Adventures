import { useMemo, useState } from "react";
import type { AnimalRecord, Language } from "../types";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import { WildlifeSprite } from "./WildlifeSprite";
import "./animal-generator.css";

type Quiz = { animal: AnimalRecord; options: AnimalRecord[] };

function makeQuiz(animals: AnimalRecord[], offset = 0): Quiz {
  const answerIndex = Math.abs(offset) % animals.length;
  const animal = animals[answerIndex];
  const options = [animal];
  for (let step = 1; options.length < Math.min(3, animals.length); step += 1) {
    const candidate = animals[(answerIndex + step * 7) % animals.length];
    if (!options.some((item) => item.id === candidate.id)) options.push(candidate);
  }
  return { animal, options: options.sort((a, b) => (a.id.charCodeAt(0) + offset) % 3 - (b.id.charCodeAt(0) + offset) % 3) };
}

export function AnimalGeneratorGame({
  animals,
  language,
  onGenerated,
  announce,
}: {
  animals: AnimalRecord[];
  language: Language;
  onGenerated: (animalId: string) => void;
  announce: (message: string) => void;
}) {
  const [round, setRound] = useState(5);
  const [tokens, setTokens] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const quiz = useMemo(() => makeQuiz(animals, round), [animals, round]);
  const generated = animals.find((animal) => animal.id === generatedId) ?? null;

  const answer = (animalId: string) => {
    if (answered) return;
    if (animalId !== quiz.animal.id) {
      setFeedback(language === "es-MX" ? "Casi. Mira la pista y prueba otra vez." : "Almost. Read the clue and try again.");
      return;
    }
    setAnswered(true);
    setTokens((current) => current + 1);
    const message = language === "es-MX" ? "¡Correcto! Ganaste una ficha de generación." : "Correct! You earned one generation token.";
    setFeedback(message);
    announce(message);
  };

  const nextQuestion = () => {
    setRound((current) => current + 11);
    setAnswered(false);
    setFeedback("");
  };

  const generate = () => {
    if (tokens < 1) return;
    const currentIndex = Math.max(-1, animals.findIndex((animal) => animal.id === generatedId));
    const index = (currentIndex + round * 5 + tokens * 3 + 1) % animals.length;
    const animal = animals[index];
    setTokens((current) => current - 1);
    setGeneratedId(animal.id);
    onGenerated(animal.id);
    const name = localizeAnimalCompat(animal, language).name;
    announce(language === "es-MX" ? `¡El generador reveló: ${name}!` : `The generator revealed: ${name}!`);
  };

  if (!animals.length) return null;
  const localizedQuiz = localizeAnimalCompat(quiz.animal, language);
  const localizedGenerated = generated ? localizeAnimalCompat(generated, language) : null;

  return (
    <section className="animal-generator-game" aria-labelledby="animal-generator-title">
      <div className="animal-generator-game__copy">
        <small>{language === "es-MX" ? "JUEGO DE 32 ANIMALES" : "32-ANIMAL REWARD GAME"}</small>
        <h2 id="animal-generator-title">🎲 {language === "es-MX" ? "Generador de animales misteriosos" : "Mystery Animal Generator"}</h2>
        <p>{language === "es-MX"
          ? "Responde una pregunta para ganar una ficha. Usa la ficha para revelar un animal de cuerpo completo al azar."
          : "Answer one question to earn a token. Spend the token to reveal a random full-body animal."}</p>

        <div className="animal-quiz">
          <span className="animal-quiz__clue">🔎 {language === "es-MX" ? "PISTA" : "CLUE"}</span>
          <strong>{localizedQuiz.fact}</strong>
          <p>{language === "es-MX" ? "¿Qué animal coincide con esta pista?" : "Which animal matches this clue?"}</p>
          <div className="animal-quiz__answers">
            {quiz.options.map((animal) => (
              <button type="button" key={animal.id} disabled={answered} onClick={() => answer(animal.id)}>
                {localizeAnimalCompat(animal, language).name}
              </button>
            ))}
          </div>
          {feedback && <div className={`animal-quiz__feedback${answered ? " is-correct" : ""}`} role="status">{feedback}</div>}
          {answered && <button type="button" className="animal-quiz__next" onClick={nextQuestion}>{language === "es-MX" ? "Otra pregunta →" : "Next question →"}</button>}
        </div>
      </div>

      <div className="animal-generator-machine">
        <div className="animal-generator-machine__tokens" aria-label={`${tokens} ${language === "es-MX" ? "fichas" : "tokens"}`}>
          <span>🪙</span><strong>{tokens}</strong><small>{language === "es-MX" ? "FICHAS" : "TOKENS"}</small>
        </div>
        <div className={`animal-generator-machine__chamber${generated ? " has-animal" : ""}`}>
          {generated && localizedGenerated ? (
            <>
              <WildlifeSprite animalId={generated.id} alt={localizedGenerated.name} />
              <div><strong>{localizedGenerated.name}</strong><span>{localizedGenerated.habitat}</span><p>{localizedGenerated.fact}</p></div>
            </>
          ) : <div className="animal-generator-machine__mystery" aria-hidden="true"><span>?</span><small>{language === "es-MX" ? "ANIMAL MISTERIOSO" : "MYSTERY ANIMAL"}</small></div>}
        </div>
        <button type="button" className="animal-generate-button" disabled={tokens < 1} onClick={generate}>
          {tokens < 1 ? `🔒 ${language === "es-MX" ? "Gana una ficha" : "Earn a token"}` : `🪙 ${language === "es-MX" ? "Usar ficha y generar" : "Spend token & generate"}`}
        </button>
        <small>{language === "es-MX" ? "Cada animal del bosque puede aparecer." : "Every animal in the forest can appear."}</small>
      </div>
    </section>
  );
}
