import { useEffect, useRef, useState } from "react";
import { tr, type Localized } from "../i18n/core";
import type { Language } from "../types";
import type { Announce } from "./common";
import { dinosaurOverlookArtStyle } from "./dinosaurArt";
import {
  DINOSAUR_VALLEY_OBSERVATIONS,
  initialDinosaurValleyObservationState,
  isDinosaurValleyObservationComplete,
  nextDinosaurValleyObservation,
  observeDinosaurValleyClue,
  type DinosaurValleyObservation,
} from "./dinosaurValleyObservation";
import "./dinosaur-valley-overlook.css";

const copy = {
  eyebrow: { en: "Dinosaur Valley · Sunrise overlook", "es-MX": "Valle de dinosaurios · Mirador al amanecer" },
  title: { en: "Follow the gentle giant", "es-MX": "Sigue al gigante tranquilo" },
  body: {
    en: "Observe three clues in order. Each one brings a long-necked dinosaur closer without disturbing the valley.",
    "es-MX": "Observa tres pistas en orden. Cada una acerca a un dinosaurio de cuello largo sin molestar al valle.",
  },
  instruction: {
    en: "Use the clue buttons. No dragging or time limit is required.",
    "es-MX": "Usa los botones de pistas. No necesitas arrastrar ni tienes límite de tiempo.",
  },
  progress: { en: "Observation progress", "es-MX": "Progreso de observación" },
  completeTitle: { en: "Brachiosaurus found!", "es-MX": "¡Brachiosaurus encontrado!" },
  completeBody: {
    en: "The footprints, treetop bites, and quiet herd path all pointed to this peaceful plant-eater.",
    "es-MX": "Las huellas, las mordidas en las copas y el sendero tranquilo indicaban a este pacífico herbívoro.",
  },
  reset: { en: "Start another quiet watch", "es-MX": "Iniciar otra observación tranquila" },
} satisfies Record<string, Localized>;

const sceneCopy: Localized[] = [
  { en: "A distant long neck rises beyond broad tracks by the sunrise river.", "es-MX": "Un cuello largo y distante se eleva detrás de huellas anchas junto al río al amanecer." },
  { en: "The tracks lead toward leaves nibbled high above the valley floor.", "es-MX": "Las huellas conducen hacia hojas mordidas muy arriba del suelo del valle." },
  { en: "The ferns part as the gentle giant follows the quiet herd path.", "es-MX": "Los helechos se abren mientras el gigante tranquilo sigue el sendero de la manada." },
  { en: "Nico safely watches a Brachiosaurus step into the golden river light.", "es-MX": "Nico observa con seguridad cómo un Brachiosaurus entra en la luz dorada del río." },
];

const clueCopy: Record<DinosaurValleyObservation, { title: Localized; description: Localized; found: Localized }> = {
  footprints: {
    title: { en: "Read the footprints", "es-MX": "Lee las huellas" },
    description: { en: "Look for broad, round tracks near the riverbank.", "es-MX": "Busca huellas anchas y redondas junto al río." },
    found: { en: "The deep round tracks belong to a very large four-legged animal.", "es-MX": "Las huellas redondas y profundas pertenecen a un animal muy grande de cuatro patas." },
  },
  canopy: {
    title: { en: "Inspect the canopy", "es-MX": "Inspecciona las copas" },
    description: { en: "Notice which fresh leaves are missing high above Nico.", "es-MX": "Observa qué hojas frescas faltan muy por encima de Nico." },
    found: { en: "Only a long neck could reach those freshly nibbled leaves.", "es-MX": "Solo un cuello largo podría alcanzar esas hojas recién mordidas." },
  },
  "herd-path": {
    title: { en: "Watch the herd path", "es-MX": "Observa el sendero de la manada" },
    description: { en: "Wait quietly where the tall cycads bend apart.", "es-MX": "Espera en silencio donde las cícadas altas se separan." },
    found: { en: "The ferns part and a gentle Brachiosaurus steps into view.", "es-MX": "Los helechos se abren y un Brachiosaurus tranquilo aparece ante ti." },
  },
};

export function DinosaurValleyOverlook({ language, announce }: { language: Language; announce: Announce }) {
  const [state, setState] = useState(initialDinosaurValleyObservationState);
  const next = nextDinosaurValleyObservation(state);
  const complete = isDinosaurValleyObservationComplete(state);
  const stage = state.completed.length;
  const buttons = useRef<Partial<Record<DinosaurValleyObservation, HTMLButtonElement | null>>>({});
  const reveal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (next && state.completed.length > 0) buttons.current[next]?.focus();
    if (!next && state.completed.length === DINOSAUR_VALLEY_OBSERVATIONS.length) reveal.current?.focus();
  }, [next, state.completed.length]);

  const observe = (observation: DinosaurValleyObservation) => {
    const updated = observeDinosaurValleyClue(state, observation);
    if (updated === state) return;
    setState(updated);
    announce(tr(clueCopy[observation].found, language));
  };
  const reset = () => {
    setState(initialDinosaurValleyObservationState());
    window.requestAnimationFrame(() => buttons.current.footprints?.focus());
  };

  return (
    <section className={`dino-overlook ${complete ? "is-complete" : ""}`} data-dinosaur-renderer="premium-2d" aria-labelledby="dino-overlook-title">
      <header className="dino-overlook__intro">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="dino-overlook-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>
      <div className="dino-overlook__layout">
        <figure className="dino-overlook__art" data-dinosaur-overlook-stage={stage}>
          <div key={stage} className="dinosaur-premium-scene" role="img" aria-label={tr(sceneCopy[stage], language)} style={dinosaurOverlookArtStyle(stage)} />
          <figcaption>
            <span>{stage}/{DINOSAUR_VALLEY_OBSERVATIONS.length} · {tr(copy.progress, language)}</span>
            <strong>{tr(sceneCopy[stage], language)}</strong>
          </figcaption>
        </figure>
        <div className="dino-overlook__controls">
          <p className="dino-overlook__instruction">{tr(copy.instruction, language)}</p>
          <progress aria-label={tr(copy.progress, language)} max={DINOSAUR_VALLEY_OBSERVATIONS.length} value={stage}>{stage}/{DINOSAUR_VALLEY_OBSERVATIONS.length}</progress>
          <ol className="dino-clue-list">
            {DINOSAUR_VALLEY_OBSERVATIONS.map((observation, index) => {
              const found = state.completed.includes(observation);
              const available = next === observation;
              return (
                <li key={observation} className={found ? "is-found" : available ? "is-next" : ""}>
                  <button
                    ref={(node) => { buttons.current[observation] = node; }}
                    type="button"
                    disabled={!available}
                    aria-pressed={found}
                    onClick={() => observe(observation)}
                  >
                    <span>{found ? "✓" : index + 1}</span>
                    <span>
                      <strong>{tr(clueCopy[observation].title, language)}</strong>
                      <small>{found ? tr(clueCopy[observation].found, language) : tr(clueCopy[observation].description, language)}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {complete ? (
            <div className="dino-overlook__reveal" role="status" ref={reveal} tabIndex={-1}>
              <span aria-hidden="true">🦕</span>
              <div><strong>{tr(copy.completeTitle, language)}</strong><p>{tr(copy.completeBody, language)}</p></div>
              <button type="button" onClick={reset}>{tr(copy.reset, language)}</button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
