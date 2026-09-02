import type { CSSProperties } from "react";
import { fieldLabel, tr } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Language, MonsterRecord } from "../types";
import lizardAlienBody from "../assets/monsters/premium-lizard-alien.webp";
import { MONSTER_OPTIONS } from "./catalogs";
import { MONSTER_FAMILY_PRESETS, type MonsterFamilyPreset } from "./monsterFamily";
import {
  monsterColorSwatch,
  monsterTrait,
  monsterVisualOptions,
  monsterVisualTraits,
  type MonsterTraitKey,
} from "./monsterCreatureStudio";
import "./monster-creature-studio.css";

const copy = {
  eyebrow: { en: "Monster Lab · Permanent-face creature family", "es-MX": "Laboratorio de monstruos · Familia de criaturas con rostro permanente" },
  title: { en: "Pick a monster. Keep its face.", "es-MX": "Elige un monstruo. Conserva su rostro." },
  body: {
    en: "Every monster now belongs to the premium Lizard Alien family. Pick a permanent-face monster, then change its body family color whenever you want.",
    "es-MX": "Ahora todos los monstruos pertenecen a la familia prémium Lizard Alien. Elige un monstruo con rostro permanente y cambia el color de su cuerpo cuando quieras.",
  },
  family: { en: "Monster family", "es-MX": "Familia de monstruos" },
  familyHint: { en: "18 permanent-face monsters", "es-MX": "18 monstruos con rostro permanente" },
  traits: { en: "Simple controls", "es-MX": "Controles sencillos" },
  specimens: { en: "Color drawer", "es-MX": "Cajón de colores" },
  applied: { en: "Applied", "es-MX": "Aplicado" },
  permanent: { en: "Permanent face & species", "es-MX": "Rostro y especie permanentes" },
  groups: {
    en: { form: "Body", features: "Features", style: "Color" },
    "es-MX": { form: "Cuerpo", features: "Características", style: "Color" },
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
  choosePreset,
}: {
  monster: MonsterRecord;
  language: Language;
  activeTrait: MonsterTraitKey;
  selectTrait: (trait: MonsterTraitKey) => void;
  sculpt: (trait: MonsterTraitKey, option: string) => void;
  choosePreset: (preset: MonsterFamilyPreset) => void;
}) {
  const active = monsterTrait(activeTrait);
  const options = monsterVisualOptions(activeTrait, MONSTER_OPTIONS[activeTrait] ?? []);
  const visibleTraits = monsterVisualTraits(monster);
  const groupLabels = copy.groups[language];
  return (
    <section className="monster-studio" data-active-group={active.group} aria-labelledby="monster-studio-title">
      <header className="monster-studio__header">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="monster-studio-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>

      <div className="monster-studio__family-panel">
        <div className="monster-studio__panel-label">
          <span>{tr(copy.family, language)}</span>
          <strong>{tr(copy.familyHint, language)}</strong>
        </div>
        <div className="monster-studio__family" role="list" aria-label={tr(copy.family, language)}>
          {MONSTER_FAMILY_PRESETS.map((preset) => {
            const selected = monster.name === preset.name && monster.body === "Lizard Alien";
            return (
              <button
                type="button"
                className="monster-studio__family-card"
                aria-pressed={selected}
                key={preset.id}
                onClick={() => choosePreset(preset)}
              >
                <span className="monster-studio__family-portrait" aria-hidden="true">
                  <img src={lizardAlienBody} alt="" style={{ filter: preset.filter }} />
                </span>
                <strong>{preset.name}</strong>
                <small>{optionLabel(preset.color, language)}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="monster-studio__trait-panel">
        <div className="monster-studio__panel-label">
          <span>{tr(copy.traits, language)}</span>
          <strong>{tr(copy.permanent, language)}</strong>
        </div>
        <div className="monster-studio__traits" role="group" aria-label={tr(copy.traits, language)}>
          {visibleTraits.map((trait) => {
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
