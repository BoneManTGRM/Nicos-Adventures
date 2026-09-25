import type { Language } from "../types";
import { CUES, TRICKS } from "./petPlay";
import type { PetGame } from "./petPlay";

export function PetChallenge({ game, language, choose, again, close }: {
  game: PetGame; language: Language; choose: (choice: number) => void; again: () => void; close: () => void;
}) {
  const es = language === "es-MX";
  const trick = TRICKS.find((item) => item.id === game.trickId);
  return <section className="pet-haven__challenge" aria-label={es ? "Juego de mascota" : "Pet challenge"}>
    <header><h3>{game.won ? (es ? "¡Gran trabajo en equipo!" : "Great teamwork!")
      : game.kind === "fetch" ? (es ? "Encuentra las herramientas" : "Tool treasure hunt")
      : `${es ? "Aprendemos" : "Let's practice"}: ${trick?.name[language] ?? ""}`}</h3>
      <span className="pet-haven__pill">{game.step}/{game.route.length}</span></header>
    {game.won ? <>
      <p>{es ? "¡Lo lograron juntos! Juega otra vez o elige una nueva aventura." : "You did it together! Play again or choose a new adventure."}</p>
      <div className="pet-haven__actions"><button type="button" onClick={again}>{es ? "Otra vez" : "Play again"}</button>
        <button type="button" onClick={close}>{es ? "Listo" : "Done"}</button></div>
    </> : <>
      <p>{game.kind === "fetch"
        ? (es ? "Toca la herramienta para que tu mascota la encuentre. ¡Busca cinco!" : "Tap the tool to help your pet find it. Find all five!")
        : (es ? "Sigue las señales en orden. La señal marcada es la siguiente. Sin cronómetro." : "Follow the cues in order. The highlighted cue is next. No timer.")}</p>
      {game.kind === "training" ? <>
        <ol className="pet-haven__sequence" aria-label={es ? "Orden de las señales" : "Cue order"}>
          {game.route.map((cue, index) => <li key={index} aria-current={index === game.step ? "step" : undefined}
            className={index < game.step ? "complete" : ""}>
            <span aria-hidden="true">{index < game.step ? "✓" : CUES[cue].emoji}</span>
            <small>{index + 1}. {CUES[cue].name[language]}</small></li>)}
        </ol>
        <div className="pet-haven__cue-buttons">
          {CUES.map((cue, index) => <button type="button" key={index} onClick={() => choose(index)}>
            <span aria-hidden="true">{cue.emoji}</span>{cue.name[language]}</button>)}
        </div>
      </> : <div className="pet-haven__hunt" aria-label={es ? "Jardín de herramientas" : "Tool garden"}>
        {Array.from({ length: 6 }, (_, index) => <button type="button" key={index}
          className={game.route[game.step] === index ? "has-tool" : ""}
          aria-label={`${game.route[game.step] === index ? (es ? "Recoger herramienta" : "Collect tool") : (es ? "Buscar aquí" : "Look here")} ${index + 1}`}
          onClick={() => choose(index)}>
          <span aria-hidden="true">{game.route[game.step] === index ? "🔧" : ["🌿", "🌼", "🌱", "🍄", "🌸", "🍀"][index]}</span>
        </button>)}
      </div>}
      <button type="button" className="pet-haven__quiet" onClick={close}>{es ? "Salir del juego" : "Leave game"}</button>
    </>}
  </section>;
}
