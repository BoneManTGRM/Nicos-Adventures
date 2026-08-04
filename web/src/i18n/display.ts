import type { Language } from "../types";
import { hasSpanishOption, optionLabel as baseOptionLabel } from "./options";

const legacySpanish: Record<string, string> = {
  "Jungle": "Selva",
  "Meadow": "Prado",
  "Antarctic": "Antártico",
  "Bamboo Forest": "Bosque de bambú",
  "Star eyes": "Ojos de estrella",
  "Anime eyes": "Ojos anime",
  "Giant hands": "Manos gigantes",
  "Spring legs": "Piernas de resorte",
  "Rainbow shield": "Escudo arcoíris",
  "Cretaceous": "Cretácico",
  "Jurassic": "Jurásico",
  "Fossil": "Fósil",
};

export function optionLabel(value: string | undefined, language: Language): string {
  if (!value) return "";
  if (language === "en") return value;
  return legacySpanish[value] ?? baseOptionLabel(value, language);
}

export function hasSpanishDisplay(value: string): boolean {
  return Boolean(legacySpanish[value]) || hasSpanishOption(value);
}

export function fossilLabel(value: string, language: Language): string {
  if (language === "en" || !value.endsWith(" Fossil")) return value;
  return `${value.slice(0, -" Fossil".length)} ${legacySpanish.Fossil}`;
}
