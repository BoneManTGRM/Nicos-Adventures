import type { CSSProperties } from "react";
import { fieldLabel, tr } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Language, MonsterRecord } from "../types";
import { MONSTER_OPTIONS } from "./catalogs";
import {
  MONSTER_TRAITS,
  monsterColorSwatch,
  monsterTrait,
  type MonsterTraitKey,
} from "./monsterCreatureStudio";
import "./monster-creature-studio.css";

const copy = {
  eyebrow: { en: "Monster Lab · Creature sculpting table", "es-MX": "Laboratorio de monstruos · Mesa para esculpir criaturas" },
  title: { en: "Sculpt a creature you can see", "es-MX": "Esculpe una criatura que puedas ver" },
  body: {
    en: "Choose a trait, then press a specimen tile. Your creature changes instantly and stays private on this device.",
    "es-MX": "Elige un rasgo y después presiona una muestra. Tu criatura cambia al instante y permanece privada en este dispositivo.",
  },
  traits: { en: "Creature traits", "es-MX": "Rasgos de la criatura" },
  specimens: { en: "Specimen drawer", "es-MX": "Cajón de muestras" },
  applied: { en: "Applied", "es-MX": "Aplicado" },
  groups: {
    en: { form: "Form", features: "Features", style: "Style", story: "Story" },
    "es-MX": { form: "Forma", features: "Características", style: "Estilo", story: "Historia" },
  },
} as const;

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
  const active = monsterTrait(activeTrait);
  const options = MONSTER_OPTIONS[activeTrait] ?? [];
  const groupLabels = copy.groups[language];
  return (
    <section className="monster-studio" data-active-group={active.group} aria-labelledby="monster-studio-title">
      <header className="monster-studio__header">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="monster-studio-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>

      <div className="monster-studio__trait-panel">
        <div className="monster-studio__panel-label">
          <span>{tr(copy.traits, language)}</span>
          <strong>{groupLabels[active.group]}</strong>
        </div>
        <div className="monster-studio__traits" role="group" aria-label={tr(copy.traits, language)}>
          {MONSTER_TRAITS.map((trait) => {
            const value = String(monster[trait.key] ?? MONSTER_OPTIONS[trait.key]?.[0] ?? "");
            return (
              <button
                type="button"
                className="monster-studio__trait"
                data-trait={trait.key}
                aria-pressed={trait.key === activeTrait}
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
      </div>

      <div className="monster-studio__choice-panel">
        <div className="monster-studio__panel-label">
          <span>{tr(copy.specimens, language)}</span>
          <strong>{fieldLabel(activeTrait, language)}</strong>
        </div>
        <div className="monster-studio__choices" role="group" aria-label={`${tr(copy.specimens, language)}: ${fieldLabel(activeTrait, language)}`}>
          {options.map((option) => {
            const selected = monster[activeTrait] === option;
            return (
              <button
                type="button"
                className="monster-studio__choice"
                data-option={option}
                style={choiceStyle(activeTrait, option)}
                aria-pressed={selected}
                aria-label={`${optionLabel(option, language)}${selected ? ` · ${tr(copy.applied, language)}` : ""}`}
                key={option}
                onClick={() => sculpt(activeTrait, option)}
              >
                <span className="monster-studio__sample" aria-hidden="true">{active.icon}</span>
                <strong>{optionLabel(option, language)}</strong>
                <small>{selected ? tr(copy.applied, language) : groupLabels[active.group]}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
