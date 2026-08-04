import type { AnimalRecord, Language } from "../types";
import { localizeAnimal } from "./animals";

const legacyAnimals: Record<string, Partial<AnimalRecord>> = {
  penguin: {
    name: "Pingüino emperador",
    habitat: "Antártico",
    fact: "Los padres pingüino emperador mantienen los huevos calientes sobre sus patas.",
    group: "Ave",
    region: "Antártida",
  },
  elephant: {
    name: "Elefante africano",
    habitat: "Sabana",
    fact: "Los elefantes usan sonidos graves para comunicarse a grandes distancias.",
    group: "Mamífero",
    region: "África",
  },
  octopus: {
    name: "Pulpo gigante del Pacífico",
    habitat: "Océano",
    fact: "Los pulpos tienen tres corazones.",
    group: "Molusco",
    region: "Pacífico Norte",
  },
  owl: {
    name: "Búho cornudo",
    habitat: "Bosque",
    fact: "Los búhos pueden girar mucho la cabeza sin detener el flujo de sangre.",
    group: "Ave",
    region: "América",
  },
};

export function localizeAnimalCompat(animal: AnimalRecord, language: Language): AnimalRecord {
  const localized = localizeAnimal(animal, language);
  if (language === "en") return localized;
  return { ...localized, ...(legacyAnimals[animal.id] ?? {}) };
}
