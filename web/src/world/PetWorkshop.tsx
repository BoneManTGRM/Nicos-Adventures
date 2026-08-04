import { useMemo, useState } from "react";
import type { LocalProfile, PetRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import { PET_OPTIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, LocalizedSelect, makeId } from "./common";
import { completeOnce, hasCompleted, petTrickMission } from "./progression";

type Trick = {
  id: string;
  emoji: string;
  name: { en: string; "es-MX": string };
};

const TRICKS: Trick[] = [
  { id: "Sit", emoji: "🪑", name: { en: "Sit", "es-MX": "Sentarse" } },
  { id: "Spin", emoji: "🌀", name: { en: "Spin", "es-MX": "Girar" } },
  { id: "Fetch Tool", emoji: "🔧", name: { en: "Fetch a tool", "es-MX": "Traer una herramienta" } },
  { id: "High Five", emoji: "✋", name: { en: "High five", "es-MX": "Chocar los cinco" } },
  { id: "Scout", emoji: "🔭", name: { en: "Scout ahead", "es-MX": "Explorar adelante" } },
  { id: "Dance", emoji: "🎵", name: { en: "Dance", "es-MX": "Bailar" } },
];

function newPet(): PetRecord {
  return {
    id: makeId("pet"),
    name: "Sparky",
    species: "Robot Dog",
    color: "Blue",
    accessory: "Explorer Scarf",
    personality: "Playful",
    bond: 1,
    tricks: [],
  };
}

export function PetWorkshop({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<PetRecord>(() => {
    const active = profile.pets.find((pet) => pet.id === profile.activePetId) ?? profile.pets[0];
    return active ? { ...active, tricks: [...active.tricks] } : newPet();
  });
  const savedPet = profile.pets.find((pet) => pet.id === draft.id) ?? null;
  const learned = useMemo(() => new Set(savedPet?.tricks ?? draft.tricks), [draft.tricks, savedPet?.tricks]);

  const save = () => {
    const pet = {
      ...draft,
      id: draft.id || makeId("pet"),
      name: draft.name.trim() || (language === "es-MX" ? "Mascota" : "Pet"),
      tricks: [...new Set(draft.tricks)],
    };
    const exists = profile.pets.some((item) => item.id === pet.id);
    const pets = exists ? profile.pets.map((item) => item.id === pet.id ? pet : item) : [...profile.pets, pet];
    update({
      ...profile,
      pets,
      activePetId: profile.activePetId ?? pet.id,
      stars: profile.stars + (exists ? 0 : 2),
    });
    setDraft(pet);
    announce(`${pet.name}: ${tr(ui.saveSuccess, language)}`);
  };

  const choosePet = (pet: PetRecord) => {
    setDraft({ ...pet, tricks: [...pet.tricks] });
    update({ ...profile, activePetId: pet.id });
    announce(language === "es-MX" ? `${pet.name} es la mascota activa.` : `${pet.name} is the active pet.`);
  };

  const train = (trick: Trick) => {
    const pet = profile.pets.find((item) => item.id === draft.id);
    if (!pet || pet.tricks.includes(trick.id)) return;
    const tricks = [...pet.tricks, trick.id];
    const nextPet = { ...pet, tricks, bond: Math.min(100, pet.bond + 12) };
    let nextProfile: LocalProfile = {
      ...profile,
      pets: profile.pets.map((item) => item.id === pet.id ? nextPet : item),
      activePetId: pet.id,
    };
    const earned: number[] = [];
    for (const milestone of [1, 3, 5] as const) {
      if (pet.tricks.length < milestone && tricks.length >= milestone) {
        const completion = completeOnce(nextProfile, petTrickMission(pet.id, milestone), milestone === 1 ? 1 : milestone === 3 ? 2 : 3);
        nextProfile = completion.profile;
        if (completion.awarded) earned.push(milestone);
      }
    }
    update(nextProfile);
    setDraft(nextPet);
    announce(language === "es-MX"
      ? `${pet.name} aprendió ${trick.name[language]}. Vínculo ${nextPet.bond}/100.${earned.length ? " Ganaste estrellas por un hito de entrenamiento." : ""}`
      : `${pet.name} learned ${trick.name[language]}. Bond ${nextPet.bond}/100.${earned.length ? " You earned stars for a training milestone." : ""}`);
  };

  return (
    <div className="pet-workshop-layout">
      <section className="fw-builder-layout">
        <article className="fw-pet-stage pet-training-stage" aria-label={draft.name}>
          <div className="fw-pet" aria-hidden="true">🐾</div>
          <h2>{draft.name}</h2>
          <p>{optionLabel(draft.species, language)} · {optionLabel(draft.accessory, language)}</p>
          <label>
            {language === "es-MX" ? "Vínculo" : "Bond"}: {draft.bond}/100
            <progress max={100} value={draft.bond}>{draft.bond}%</progress>
          </label>
          <div className="pet-trick-summary" aria-label={language === "es-MX" ? "Trucos aprendidos" : "Learned tricks"}>
            {TRICKS.map((trick) => <span className={learned.has(trick.id) ? "learned" : ""} key={trick.id}>{learned.has(trick.id) ? trick.emoji : "○"}</span>)}
          </div>
        </article>

        <section className="fw-panel" aria-label={tr(ui.formControls, language)}>
          <label>{tr(ui.petName, language)}<input value={draft.name} maxLength={32} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <div className="fw-form-grid">
            {Object.entries(PET_OPTIONS).map(([key, values]) => (
              <LocalizedSelect
                key={key}
                field={key}
                values={values}
                value={String(draft[key as keyof PetRecord] ?? values[0])}
                language={language}
                onChange={(value) => setDraft({ ...draft, [key]: value })}
              />
            ))}
          </div>
          <div className="fw-action-row">
            <button type="button" onClick={() => setDraft(newPet())}>＋ {language === "es-MX" ? "Nueva mascota" : "New pet"}</button>
            <button type="button" className="fw-primary" onClick={save}>🐾 {tr(ui.savePet, language)}</button>
          </div>

          <section aria-labelledby="pet-collection-heading">
            <h2 id="pet-collection-heading" className="fw-subheading">{tr(ui.pets, language)}</h2>
            {!profile.pets.length ? <EmptyState emoji="🐾">{tr(ui.noPet, language)}</EmptyState> : (
              <div className="fw-collection-row">
                {profile.pets.map((pet) => (
                  <button
                    type="button"
                    className={profile.activePetId === pet.id ? "active" : ""}
                    aria-pressed={profile.activePetId === pet.id}
                    key={pet.id}
                    onClick={() => choosePet(pet)}
                  >
                    🐾 {pet.name} · {pet.tricks.length}/{TRICKS.length}
                  </button>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>

      <section className="pet-training-panel" aria-labelledby="pet-training-heading">
        <header>
          <div>
            <small>{language === "es-MX" ? "Progreso local" : "Local progress"}</small>
            <h2 id="pet-training-heading">{language === "es-MX" ? "Entrenamiento de trucos" : "Trick training"}</h2>
          </div>
          <span>{savedPet ? `${savedPet.tricks.length}/${TRICKS.length}` : "0/6"}</span>
        </header>
        {!savedPet ? (
          <EmptyState emoji="💾">{language === "es-MX" ? "Guarda la mascota antes de comenzar el entrenamiento." : "Save the pet before beginning training."}</EmptyState>
        ) : (
          <div className="pet-trick-grid">
            {TRICKS.map((trick) => {
              const known = savedPet.tricks.includes(trick.id);
              return (
                <button type="button" className={known ? "learned" : ""} key={trick.id} disabled={known} onClick={() => train(trick)}>
                  <span aria-hidden="true">{trick.emoji}</span>
                  <strong>{trick.name[language]}</strong>
                  <small>{known
                    ? (language === "es-MX" ? "Aprendido" : "Learned")
                    : (language === "es-MX" ? "+12 de vínculo" : "+12 bond")}</small>
                </button>
              );
            })}
          </div>
        )}
        {savedPet && (
          <div className="pet-milestone-row" aria-label={language === "es-MX" ? "Hitos de entrenamiento" : "Training milestones"}>
            {[1, 3, 5].map((count) => (
              <span className={hasCompleted(profile, petTrickMission(savedPet.id, count as 1 | 3 | 5)) ? "earned" : ""} key={count}>
                {hasCompleted(profile, petTrickMission(savedPet.id, count as 1 | 3 | 5)) ? "🏆" : "○"} {count}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
