import type { CSSProperties } from "react";
import { boltBotColorSwatch } from "../game3d/boltbot/appearance";
import { fieldLabel, tr } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import type { Language, Robot } from "../types";
import { ROBOT_OPTIONS } from "./catalogs";
import {
  ROBOT_ASSEMBLY_FIELDS,
  robotAssemblyField,
  type RobotAssemblyField,
} from "./robotAssemblyBay";
import "./robot-assembly-bay.css";

const copy = {
  eyebrow: { en: "Robo Lab · Visual assembly deck", "es-MX": "Laboratorio robot · Plataforma visual de ensamblaje" },
  title: { en: "Build with parts you can see", "es-MX": "Construye con piezas que puedes ver" },
  body: {
    en: "Choose a system, then install a component. Every change updates this same saved BoltBot.",
    "es-MX": "Elige un sistema y después instala un componente. Cada cambio actualiza este mismo BoltBot guardado.",
  },
  systems: { en: "Robot systems", "es-MX": "Sistemas del robot" },
  components: { en: "Component shelf", "es-MX": "Estante de componentes" },
  selected: { en: "Installed", "es-MX": "Instalado" },
  groups: {
    en: { finish: "Finish", frame: "Frame", systems: "Tools", spirit: "Character" },
    "es-MX": { finish: "Acabado", frame: "Estructura", systems: "Herramientas", spirit: "Carácter" },
  },
} as const;

function optionStyle(field: RobotAssemblyField, option: string): CSSProperties | undefined {
  if (field === "color") {
    return { "--robot-part-color": boltBotColorSwatch(option, "primary") } as CSSProperties;
  }
  if (field === "secondary_color") {
    return { "--robot-part-color": boltBotColorSwatch(option, "accent") } as CSSProperties;
  }
  return undefined;
}

export function RobotAssemblyBay({
  robot,
  language,
  activeField,
  selectField,
  install,
}: {
  robot: Robot;
  language: Language;
  activeField: RobotAssemblyField;
  selectField: (field: RobotAssemblyField) => void;
  install: (field: RobotAssemblyField, option: string) => void;
}) {
  const active = robotAssemblyField(activeField);
  const options = ROBOT_OPTIONS[activeField] ?? [];
  const groupLabels = copy.groups[language];
  return (
    <section className="robot-assembly" data-active-system={active.group} aria-labelledby="robot-assembly-title">
      <header className="robot-assembly__header">
        <small>{tr(copy.eyebrow, language)}</small>
        <h2 id="robot-assembly-title">{tr(copy.title, language)}</h2>
        <p>{tr(copy.body, language)}</p>
      </header>

      <div className="robot-assembly__system-panel">
        <div className="robot-assembly__panel-label">
          <span>{tr(copy.systems, language)}</span>
          <strong>{groupLabels[active.group]}</strong>
        </div>
        <div className="robot-assembly__systems" role="group" aria-label={tr(copy.systems, language)}>
          {ROBOT_ASSEMBLY_FIELDS.map((field) => {
            const value = String(robot[field.key] ?? "");
            const selected = field.key === activeField;
            return (
              <button
                type="button"
                className="robot-assembly__system"
                data-system={field.key}
                aria-pressed={selected}
                aria-label={`${fieldLabel(field.key, language)}: ${optionLabel(value, language)}`}
                key={field.key}
                onClick={() => selectField(field.key)}
              >
                <span aria-hidden="true">{field.icon}</span>
                <span>
                  <small>{fieldLabel(field.key, language)}</small>
                  <strong>{optionLabel(value, language)}</strong>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="robot-assembly__component-panel">
        <div className="robot-assembly__panel-label">
          <span>{tr(copy.components, language)}</span>
          <strong>{fieldLabel(activeField, language)}</strong>
        </div>
        <div className="robot-assembly__choices" role="group" aria-label={`${tr(copy.components, language)}: ${fieldLabel(activeField, language)}`}>
          {options.map((option) => {
            const selected = robot[activeField] === option;
            return (
              <button
                type="button"
                className="robot-assembly__choice"
                data-option={option}
                style={optionStyle(activeField, option)}
                aria-pressed={selected}
                aria-label={`${optionLabel(option, language)}${selected ? ` · ${tr(copy.selected, language)}` : ""}`}
                key={option}
                onClick={() => install(activeField, option)}
              >
                <span className="robot-assembly__part" aria-hidden="true">{active.icon}</span>
                <strong>{optionLabel(option, language)}</strong>
                <small>{selected ? tr(copy.selected, language) : groupLabels[active.group]}</small>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
