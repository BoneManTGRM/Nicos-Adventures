import { useEffect, useRef, useState } from "react";
import { tr, type Localized } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { DinosaurRecord, Language } from "../types";
import type { Announce } from "./common";
import { fossilExpeditionArtStyle } from "./dinosaurArt";
import {
  BRACHIOSAURUS_PERIOD,
  BRUSH_ROUTE,
  FOSSIL_LAYERS,
  brushFossilZone,
  classifyFossilPeriod,
  fossilExpeditionStage,
  initialFossilExpeditionState,
  selectFossilLayer,
  type BrushZone,
  type FossilLayer,
} from "./brachiosaurusFossilExpedition";
import "./brachiosaurus-fossil-expedition.css";

const periods = ["Triassic", "Jurassic", "Cretaceous"] as const;

const copy = {
  eyebrow: { en: "Dinosaur Valley · Fossil fieldwork", "es-MX": "Valle de dinosaurios · Trabajo de campo fósil" },
  survey: { en: "Survey the fossil layer", "es-MX": "Examina la capa fósil" },
  surveyBody: { en: "Find the calm sedimentary layer with a curved bone fragment and fern impressions.", "es-MX": "Encuentra la capa sedimentaria tranquila con un fragmento curvo de hueso e impresiones de helechos." },
  brush: { en: "Brush from edge to center", "es-MX": "Cepilla del borde hacia el centro" },
  brushBody: { en: "Protect the fossil by clearing the outer ridge, then the vertebra, then the leg bone.", "es-MX": "Protege el fósil limpiando primero el borde, después la vértebra y al final el hueso de la pata." },
  classify: { en: "Classify the discovery", "es-MX": "Clasifica el descubrimiento" },
  classifyBody: { en: "The long front limb and tall shoulder match Brachiosaurus. In which period did it live?", "es-MX": "La larga pata delantera y el hombro alto coinciden con Brachiosaurus. ¿En qué periodo vivió?" },
  complete: { en: "Brachiosaurus discovered!", "es-MX": "¡Brachiosaurus descubierto!" },
  completeBody: { en: "The fossil is safe in the field guide. You recovered one fossil and earned two stars.", "es-MX": "El fósil está seguro en la guía de campo. Recuperaste un fósil y ganaste dos estrellas." },
  completeExisting: { en: "This fossil is already safe in the field guide. Revisit the evidence or continue to another expedition.", "es-MX": "Este fósil ya está seguro en la guía de campo. Revisa la evidencia o continúa con otra expedición." },
  close: { en: "Close expedition", "es-MX": "Cerrar expedición" },
  next: { en: "Find another dinosaur", "es-MX": "Buscar otro dinosaurio" },
  instructions: { en: "Use the field buttons in order. No dragging or time limit is required.", "es-MX": "Usa los botones de campo en orden. No necesitas arrastrar ni tienes límite de tiempo." },
  correctLayer: { en: "Fern-imprint shale protects the fossil!", "es-MX": "¡La lutita con impresiones de helechos protege el fósil!" },
  wrongLayer: { en: "That layer has no matching bone clue. Survey another layer.", "es-MX": "Esa capa no tiene una pista ósea que coincida. Examina otra capa." },
  wrongPeriod: { en: "Not yet. Compare the field clue with the period choices.", "es-MX": "Todavía no. Compara la pista de campo con las opciones de periodos." },
} satisfies Record<string, Localized>;

const sceneCopy = {
  survey: { en: "Three sediment layers reveal river silt, fern-imprint shale, and volcanic ash.", "es-MX": "Tres capas de sedimento revelan limo de río, lutita con helechos y ceniza volcánica." },
  brush: { en: "A field brush carefully clears the curved fossil from fern-imprint shale.", "es-MX": "Un cepillo de campo limpia con cuidado el fósil curvo de la lutita con helechos." },
  classify: { en: "Clean vertebrae and a long front limb are ready to classify.", "es-MX": "Las vértebras limpias y una larga pata delantera están listas para clasificarse." },
  complete: { en: "Nico celebrates beside the safely uncovered Brachiosaurus fossil.", "es-MX": "Nico celebra junto al fósil de Brachiosaurus descubierto de forma segura." },
} satisfies Record<"survey" | "brush" | "classify" | "complete", Localized>;

const layerCopy: Record<FossilLayer, Localized> = {
  "river-silt": { en: "Loose river silt", "es-MX": "Limo suelto del río" },
  "fern-shale": { en: "Fern-imprint shale", "es-MX": "Lutita con impresiones de helechos" },
  "volcanic-ash": { en: "Dark volcanic ash", "es-MX": "Ceniza volcánica oscura" },
};

const brushCopy: Record<BrushZone, Localized> = {
  "outer-ridge": { en: "Brush outer ridge", "es-MX": "Cepillar el borde" },
  vertebra: { en: "Brush vertebra", "es-MX": "Cepillar la vértebra" },
  femur: { en: "Brush leg bone", "es-MX": "Cepillar el hueso de la pata" },
};

export function BrachiosaurusFossilExpedition({
  dinosaur,
  language,
  discovered,
  announce,
  completeDiscovery,
  close,
  nextDinosaur,
}: {
  dinosaur: DinosaurRecord;
  language: Language;
  discovered: boolean;
  announce: Announce;
  completeDiscovery: () => void;
  close: () => void;
  nextDinosaur: () => void;
}) {
  const [state, setState] = useState(() => initialFossilExpeditionState(discovered));
  const [completedThisVisit, setCompletedThisVisit] = useState(false);
  const stage = fossilExpeditionStage(state);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => heading.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [stage]);

  const title = stage === "survey" ? copy.survey : stage === "brush" ? copy.brush : stage === "classify" ? copy.classify : copy.complete;
  const completionBody = completedThisVisit ? copy.completeBody : copy.completeExisting;
  const body = stage === "survey" ? copy.surveyBody : stage === "brush" ? copy.brushBody : stage === "classify" ? copy.classifyBody : completionBody;

  const chooseLayer = (layer: FossilLayer) => {
    const next = selectFossilLayer(state, layer);
    setState(next);
    announce(tr(layer === "fern-shale" ? copy.correctLayer : copy.wrongLayer, language));
  };
  const brush = (zone: BrushZone) => {
    const next = brushFossilZone(state, zone);
    if (next === state) return;
    setState(next);
    announce(tr(brushCopy[zone], language));
  };
  const classify = (period: string) => {
    const next = classifyFossilPeriod(state, period);
    setState(next);
    if (period === BRACHIOSAURUS_PERIOD) {
      setCompletedThisVisit(true);
      completeDiscovery();
    } else announce(tr(copy.wrongPeriod, language));
  };

  return (
    <section className={`fossil-expedition is-${stage}`} data-dinosaur-renderer="premium-2d" aria-labelledby="fossil-expedition-title">
      <header className="fossil-expedition__header">
        <div><small>{tr(copy.eyebrow, language)}</small><h2 id="fossil-expedition-title" ref={heading} tabIndex={-1}>{tr(title, language)}</h2><p>{tr(body, language)}</p></div>
        <button type="button" onClick={close} aria-label={tr(copy.close, language)}>×</button>
      </header>
      <div className="fossil-expedition__layout">
        <figure className="fossil-expedition__art" data-fossil-stage={stage} data-brushed-zones={state.brushed.length}>
          <div key={stage} className="dinosaur-premium-scene" role="img" aria-label={tr(sceneCopy[stage], language)} style={fossilExpeditionArtStyle(stage)} />
          <figcaption><span>{dinosaur.name}</span><strong>{tr(sceneCopy[stage], language)}</strong></figcaption>
        </figure>
        <div className="fossil-expedition__controls">
          <p className="fossil-expedition__instruction">{tr(copy.instructions, language)}</p>
          {stage === "survey" ? (
            <div className="fossil-option-grid" role="group" aria-label={tr(copy.survey, language)}>
              {FOSSIL_LAYERS.map((layer) => (
                <button type="button" key={layer} aria-pressed={state.layer === layer} onClick={() => chooseLayer(layer)}>
                  <span aria-hidden="true">{layer === "river-silt" ? "≈" : layer === "fern-shale" ? "❧" : "◆"}</span>{tr(layerCopy[layer], language)}
                </button>
              ))}
              {state.layer ? <p className={state.layer === "fern-shale" ? "is-correct" : "is-wrong"} role="status">{tr(state.layer === "fern-shale" ? copy.correctLayer : copy.wrongLayer, language)}</p> : null}
            </div>
          ) : null}
          {stage === "brush" ? (
            <ol className="fossil-brush-route" aria-label={tr(copy.brush, language)}>
              {BRUSH_ROUTE.map((zone, index) => {
                const done = state.brushed.includes(zone);
                const available = state.brushed.length === index;
                return <li key={zone} className={done ? "is-done" : available ? "is-next" : ""}><button type="button" disabled={!available} onClick={() => brush(zone)}><span>{done ? "✓" : index + 1}</span>{tr(brushCopy[zone], language)}</button></li>;
              })}
            </ol>
          ) : null}
          {stage === "classify" ? (
            <div className="fossil-period-grid" role="group" aria-label={tr(copy.classify, language)}>
              {periods.map((period) => <button type="button" key={period} aria-pressed={state.period === period} onClick={() => classify(period)}>{optionLabel(period, language)}</button>)}
              {state.period && state.period !== BRACHIOSAURUS_PERIOD ? <p className="is-wrong" role="status">{tr(copy.wrongPeriod, language)}</p> : null}
            </div>
          ) : null}
          {stage === "complete" ? (
            <div className="fossil-expedition__complete" role="status"><span aria-hidden="true">✓</span><strong>{tr(copy.complete, language)}</strong><p>{tr(completionBody, language)}</p><button type="button" onClick={nextDinosaur}>{tr(copy.next, language)} →</button></div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
