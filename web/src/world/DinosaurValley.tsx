import { lazy, Suspense, useMemo, useState } from "react";
import type { DinosaurRecord, LocalProfile } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Announce, UpdateProfile } from "./common";
import { completeOnce, dinosaurDiscoveryMission } from "./progression";
import { DinosaurArt } from "./DinosaurArt";

const DinosaurValleyOverlook = lazy(() => import("./DinosaurValleyOverlook").then((module) => ({
  default: module.DinosaurValleyOverlook,
})));

const periods = ["Triassic", "Jurassic", "Cretaceous"] as const;

const facts: Record<string, { en: string; "es-MX": string }> = {
  trex: {
    en: "Tyrannosaurus rex had powerful jaws and lived near the end of the Cretaceous period.",
    "es-MX": "Tyrannosaurus rex tenía mandíbulas poderosas y vivió cerca del final del periodo Cretácico.",
  },
  triceratops: {
    en: "Triceratops used three horns and a large frill for display and protection.",
    "es-MX": "Triceratops usaba tres cuernos y un gran volante para exhibición y protección.",
  },
  stegosaurus: {
    en: "Stegosaurus carried tall plates along its back and spikes on its tail.",
    "es-MX": "Stegosaurus tenía placas altas en la espalda y púas en la cola.",
  },
  brachiosaurus: {
    en: "Brachiosaurus had longer front legs that helped it reach high vegetation.",
    "es-MX": "Brachiosaurus tenía patas delanteras más largas que le ayudaban a alcanzar vegetación alta.",
  },
  ankylosaurus: {
    en: "Ankylosaurus had armored plates and a heavy club at the end of its tail.",
    "es-MX": "Ankylosaurus tenía placas de armadura y una maza pesada al final de la cola.",
  },
  velociraptor: {
    en: "Velociraptor was a small feathered predator with a curved claw on each foot.",
    "es-MX": "Velociraptor era un depredador pequeño con plumas y una garra curva en cada pie.",
  },
};

export function DinosaurValley({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const active = useMemo(() => profile.dinosaurs.find((item) => item.id === activeId) ?? null, [activeId, profile.dinosaurs]);
  const discoveredCount = profile.dinosaurs.filter((item) => item.discovered).length;

  const openExpedition = (dinosaur: DinosaurRecord) => {
    setActiveId(dinosaur.id);
    setAnswer(null);
    setFeedback("");
  };

  const submit = (period: string) => {
    if (!active || active.discovered || answer !== null) return;
    setAnswer(period);
    if (period !== active.period) {
      const message = language === "es-MX"
        ? "Todavía no. Observa la forma del dinosaurio y las pistas del periodo, luego inténtalo otra vez."
        : "Not yet. Study the dinosaur shape and period clues, then try again.";
      setFeedback(message);
      announce(message);
      return;
    }

    const fossil = `${active.name} Fossil`;
    const baseProfile: LocalProfile = {
      ...profile,
      dinosaurs: profile.dinosaurs.map((item) => item.id === active.id ? { ...item, discovered: true } : item),
      fossils: profile.fossils.includes(fossil) ? profile.fossils : [...profile.fossils, fossil],
    };
    const completion = completeOnce(baseProfile, dinosaurDiscoveryMission(active.id), 2);
    update(completion.profile);
    const message = language === "es-MX"
      ? `¡Correcto! ${active.name} fue descubierto. Recuperaste un fósil y ganaste dos estrellas.`
      : `Correct! ${active.name} was discovered. You recovered a fossil and earned two stars.`;
    setFeedback(message);
    announce(message);
  };

  const nextUndiscovered = () => {
    const next = profile.dinosaurs.find((item) => !item.discovered && item.id !== activeId)
      ?? profile.dinosaurs.find((item) => !item.discovered)
      ?? null;
    if (next) openExpedition(next);
    else setActiveId(null);
  };

  return (
    <>
      <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando el mirador del valle…" : "Preparing the valley overlook…"}</div>}>
        <DinosaurValleyOverlook language={language} announce={announce} />
      </Suspense>
      <section className="dino-progress-panel" aria-label={language === "es-MX" ? "Progreso de dinosaurios" : "Dinosaur progress"}>
        <div>
          <small>{language === "es-MX" ? "Guía de campo local" : "Local field guide"}</small>
          <h2>{language === "es-MX" ? "Descubrimientos ilustrados" : "Illustrated discoveries"}</h2>
        </div>
        <progress max={profile.dinosaurs.length} value={discoveredCount}>{discoveredCount}/{profile.dinosaurs.length}</progress>
        <strong>{discoveredCount}/{profile.dinosaurs.length}</strong>
      </section>

      {active && (
        <section className="dino-expedition-panel" aria-labelledby="dino-expedition-heading">
          <button type="button" className="dino-expedition-close" onClick={() => setActiveId(null)} aria-label={language === "es-MX" ? "Cerrar expedición" : "Close expedition"}>×</button>
          <DinosaurArt dinosaur={active} language={language} discovered={active.discovered} />
          <div>
            <small>{active.discovered ? tr(ui.fieldGuideUnlocked, language) : tr(ui.expedition, language)}</small>
            <h2 id="dino-expedition-heading">{active.name}</h2>
            {active.discovered ? (
              <>
                <p>{facts[active.id]?.[language] ?? tr(ui.fieldGuideUnlocked, language)}</p>
                <button type="button" onClick={nextUndiscovered} disabled={discoveredCount >= profile.dinosaurs.length}>
                  {language === "es-MX" ? "Buscar otro dinosaurio" : "Find another dinosaur"} →
                </button>
              </>
            ) : (
              <>
                <p>{language === "es-MX"
                  ? `¿En qué periodo vivió ${active.name}? Identifica la era correcta para completar la expedición.`
                  : `Which period did ${active.name} live in? Identify the correct era to complete the expedition.`}</p>
                <div className="dino-period-options" role="group" aria-label={language === "es-MX" ? "Periodos geológicos" : "Geological periods"}>
                  {periods.map((period) => {
                    const selected = answer === period;
                    const correct = answer !== null && period === active.period;
                    return (
                      <button
                        type="button"
                        key={period}
                        className={`${selected ? "selected" : ""} ${correct ? "correct" : ""}`.trim()}
                        aria-pressed={selected}
                        disabled={answer !== null}
                        onClick={() => submit(period)}
                      >
                        {optionLabel(period, language)}
                      </button>
                    );
                  })}
                </div>
                {feedback && (
                  <div className={`dino-feedback ${answer === active.period ? "correct" : "wrong"}`} role="status">
                    <p>{feedback}</p>
                    {answer !== active.period && <button type="button" onClick={() => { setAnswer(null); setFeedback(""); }}>{language === "es-MX" ? "Intentar otra vez" : "Try again"}</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <div className="fw-card-grid">
        {profile.dinosaurs.map((dinosaur) => (
          <article className={`fw-dino-card ${dinosaur.discovered ? "is-discovered" : ""}`} key={dinosaur.id}>
            <DinosaurArt dinosaur={dinosaur} language={language} discovered={dinosaur.discovered} />
            <p>{dinosaur.discovered ? facts[dinosaur.id]?.[language] ?? tr(ui.fieldGuideUnlocked, language) : tr(ui.startExpedition, language)}</p>
            <button type="button" onClick={() => openExpedition(dinosaur)}>
              {dinosaur.discovered
                ? `📖 ${language === "es-MX" ? "Abrir guía" : "Open guide"}`
                : `⛏️ ${tr(ui.expedition, language)}`}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
