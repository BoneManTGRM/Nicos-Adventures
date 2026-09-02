import type { CSSProperties } from "react";
import { fieldLabel, tr } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Language, MonsterRecord } from "../types";
import { MONSTER_OPTIONS } from "./catalogs";
import type { PremiumMonsterBody } from "./monsterArt";
import { MonsterPortrait } from "./MonsterPortrait";
import {
  monsterColorSwatch,
  monsterTrait,
  monsterVisualOptions,
  monsterVisualTraits,
  type MonsterTraitKey,
} from "./monsterCreatureStudio";
import "./monster-creature-studio.css";

const copy = {
  eyebrow: { en: "Monster Lab · Creature builder", "es-MX": "Laboratorio de monstruos · Constructor de criaturas" },
  title: { en: "Build your monster", "es-MX": "Construye tu monstruo" },
  body: {
    en: "Choose a creature, then change its color and traits. Its permanent premium face always stays with its body.",
    "es-MX": "Elige una criatura y luego cambia su color y sus rasgos. Su cara prémium permanente siempre se queda con su cuerpo.",
  },
  chooseBody: { en: "1 · Choose body", "es-MX": "1 · Elige el cuerpo" },
  customize: { en: "2 · Customize traits", "es-MX": "2 · Personaliza los rasgos" },
  chooseOption: { en: "Choose an option", "es-MX": "Elige una opción" },
  bodyGallery: { en: "Monster body gallery", "es-MX": "Galería de cuerpos de monstruos" },
  applied: { en: "Selected", "es-MX": "Seleccionado" },
  bodyHint: {
    en: "The complete body gallery stays above so changing traits never hides your monsters.",
    "es-MX": "La galería completa permanece arriba para que los rasgos nunca oculten tus monstruos.",
  },
  groups: {
    en: { form: "Form", features: "Features", style: "Style" },
    "es-MX": { form: "Forma", features: "Características", style: "Estilo" },
  },
} as const;

const BODY_PREVIEW_COLORS = {
  Blob: "#19c6e9",
  Dragon: "#ef5538",
  "Jungle Beast": "#8eaa28",
  "Stone Golem": "#7d8a94",
  Spirit: "#37dcff",
  Cosmic: "#7250dc",
  Aquatic: "#1bc9df",
  Candy: "#e765b0",
  Mecha: "#5ac9ee",
  Royal: "#9365df",
  Volcano: "#e24d26",
  "Ice Beast": "#7bdcff",
  Alien: "#47d6a8",
  "Lizard Alien": "#a7ebff",
  Dinosaur: "#8c9f2d",
  Cloud: "#dceeff",
} as const satisfies Record<PremiumMonsterBody, string>;

export function monsterBodyPreviewColor(body: string): string {
  return BODY_PREVIEW_COLORS[body as PremiumMonsterBody] ?? BODY_PREVIEW_COLORS.Blob;
}

function choiceStyle(trait: MonsterTraitKey, option: string): CSSProperties | undefined {
  if (trait !== "color") return undefined;
  return { "--monster-choice-color": monsterColorSwatch(option) } as CSSProperties;
}

export function MonsterCreatureStudio({
  monster,
  language,
  activeTrait,
  selectTrait,
  sculpt,
}: {
  monster: MonsterRecord;
  language: Language;
  activeTrait: MonsterTraitKey;
  selectTrait: (trait: MonsterTraitKey) => void;
  sculpt: (trait: MonsterTraitKey, option: string) => void;
}) {
  const visibleTraits = monsterVisualTraits(monster);
  const resolvedActiveTrait = visibleTraits.some((trait) => trait.key === activeTrait)
    ? activeTrait
    : "color";
  const active = monsterTrait(resolvedActiveTrait);
  const options = monsterVisualOptions(resolvedActiveTrait, MONSTER_OPTIONS[resolvedActiveTrait] ?? []);
  const bodyOptions = monsterVisualOptions("body", MONSTER_OPTIONS.body ?? []);
  const groupLabels = copy.groups[language];

  return (
    <section
      className="monster-studio monster-studio--approved"
      data-active-group={active.group}
      data-active-trait={resolvedActiveTrait}
      aria-labelledby="monster-studio-title"
    >
      <header className="monster-studio__header">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="monster-studio-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>

      <section className="monster-studio__body-panel" aria-labelledby="monster-body-gallery-title">
        <div className="monster-studio__panel-label">
          <span id="monster-body-gallery-title">{tr(copy.chooseBody, language)}</span>
          <strong>{optionLabel(monster.body, language)}</strong>
        </div>
        <div className="monster-studio__body-grid" role="group" aria-label={tr(copy.bodyGallery, language)}>
          {bodyOptions.map((option) => {
            const selected = monster.body === option;
            const optionName = optionLabel(option, language);
            const previewColor = selected ? monsterColorSwatch(monster.color) : monsterBodyPreviewColor(option);
            return (
              <button
                type="button"
                className="monster-studio__choice monster-studio__body-choice"
                data-option={option}
                data-monster-preview-color={previewColor}
                aria-pressed={selected}
                aria-label={`${optionName}${selected ? ` · ${tr(copy.applied, language)}` : ""}`}
                key={option}
                onClick={() => sculpt("body", option)}
              >
                <MonsterPortrait
                  body={option}
                  color={previewColor}
                  arms={option === monster.body ? monster.arms : "Tiny arms"}
                  label={language === "es-MX" ? `Vista de ${optionName}` : `${optionName} preview`}
                />
                <span className="monster-studio__body-copy">
                  <strong>{optionName}</strong>
                  <small>{selected ? tr(copy.applied, language) : groupLabels.form}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="monster-studio__customize-panel" aria-labelledby="monster-customize-title">
        <div className="monster-studio__panel-label">
          <span id="monster-customize-title">{tr(copy.customize, language)}</span>
          <strong>{fieldLabel(resolvedActiveTrait, language)}</strong>
        </div>
        <div className="monster-studio__traits" role="group" aria-label={tr(copy.customize, language)}>
          {visibleTraits.map((trait) => {
            const value = String(monster[trait.key] ?? MONSTER_OPTIONS[trait.key]?.[0] ?? "");
            return (
              <button
                type="button"
                className="monster-studio__trait"
                data-trait={trait.key}
                aria-pressed={trait.key === resolvedActiveTrait}
                aria-label={`${fieldLabel(trait.key, language)}: ${optionLabel(value, language)}`}
                key={trait.key}
                onClick={() => selectTrait(trait.key)}
              >
                <span aria-hidden="true">{trait.icon}</span>
                <span>
                  <small>{fieldLabel(trait.key, language)}</small>
                  <strong>{optionLabel(value, language)}</strong>
                </span>
              </button>
            );
          })}
        </div>

        {resolvedActiveTrait === "body" ? (
          <p className="monster-studio__body-hint">{tr(copy.bodyHint, language)}</p>
        ) : (
          <div className="monster-studio__choice-panel">
            <div className="monster-studio__panel-label monster-studio__panel-label--choices">
              <span>{tr(copy.chooseOption, language)}</span>
              <strong>{groupLabels[active.group]}</strong>
            </div>
            <div
              className="monster-studio__choices"
              role="group"
              aria-label={`${tr(copy.chooseOption, language)}: ${fieldLabel(resolvedActiveTrait, language)}`}
            >
              {options.map((option) => {
                const selected = monster[resolvedActiveTrait] === option;
                return (
                  <button
                    type="button"
                    className={`monster-studio__choice monster-studio__choice--${resolvedActiveTrait}`}
                    data-option={option}
                    style={choiceStyle(resolvedActiveTrait, option)}
                    aria-pressed={selected}
                    aria-label={`${optionLabel(option, language)}${selected ? ` · ${tr(copy.applied, language)}` : ""}`}
                    key={option}
                    onClick={() => sculpt(resolvedActiveTrait, option)}
                  >
                    <span className="monster-studio__sample" aria-hidden="true">{active.icon}</span>
                    <strong>{optionLabel(option, language)}</strong>
                    <small>{selected ? tr(copy.applied, language) : groupLabels[active.group]}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
