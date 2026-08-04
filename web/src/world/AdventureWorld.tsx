import { useState } from "react";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, PetRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import { ARCADE_GAMES, ARCADE_ICONS, PET_OPTIONS, ROOM_DECORATIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, LocalizedSelect, makeId } from "./common";

export function Arcade({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const play = (game: string) => {
    const score = Math.floor(Math.random() * 51) + 50;
    const previous = profile.arcadeScores[game] ?? 0;
    const best = Math.max(previous, score);
    update({
      ...profile,
      arcadeScores: { ...profile.arcadeScores, [game]: best },
      stars: profile.stars + (score > previous ? 1 : 0),
    });
    announce(language === "es-MX"
      ? `${optionLabel(game, language)}: ${score} puntos. Mejor puntuación: ${best}.`
      : `${game}: ${score} points. Best score: ${best}.`);
  };

  return (
    <div className="fw-card-grid">
      {ARCADE_GAMES.map((game, index) => (
        <article className="fw-game-card" key={game}>
          <div aria-hidden="true">{ARCADE_ICONS[index]}</div>
          <h3>{optionLabel(game, language)}</h3>
          <p>{tr(ui.bestScore, language)}: {profile.arcadeScores[game] ?? 0}</p>
          <button type="button" onClick={() => play(game)}>▶ {tr(ui.play, language)}</button>
        </article>
      ))}
    </div>
  );
}

export function DinosaurValley({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const discover = (dinosaurId: string) => {
    const dinosaur = profile.dinosaurs.find((item) => item.id === dinosaurId);
    if (!dinosaur || dinosaur.discovered) return;
    const fossil = `${dinosaur.name} Fossil`;
    update({
      ...profile,
      dinosaurs: profile.dinosaurs.map((item) => item.id === dinosaurId ? { ...item, discovered: true } : item),
      fossils: profile.fossils.includes(fossil) ? profile.fossils : [...profile.fossils, fossil],
      stars: profile.stars + 2,
    });
    announce(language === "es-MX"
      ? `${dinosaur.name} descubierto. Fósil recuperado y dos estrellas ganadas.`
      : `${dinosaur.name} discovered. Fossil recovered and two stars earned.`);
  };

  return (
    <div className="fw-card-grid">
      {profile.dinosaurs.map((dinosaur) => (
        <article className={`fw-dino-card ${dinosaur.discovered ? "is-discovered" : ""}`} key={dinosaur.id}>
          <div aria-hidden="true">{dinosaur.emoji}</div>
          <h3>{dinosaur.name}</h3>
          <span>{dinosaur.period}</span>
          <p>{dinosaur.discovered ? tr(ui.fieldGuideUnlocked, language) : tr(ui.startExpedition, language)}</p>
          <button type="button" onClick={() => discover(dinosaur.id)} disabled={dinosaur.discovered}>
            {dinosaur.discovered ? `✅ ${language === "es-MX" ? "Descubierto" : "Discovered"}` : `⛏️ ${tr(ui.expedition, language)}`}
          </button>
        </article>
      ))}
    </div>
  );
}

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
  const [draft, setDraft] = useState<PetRecord>(newPet);

  const save = () => {
    const pet = { ...draft, id: draft.id || makeId("pet"), name: draft.name.trim() || (language === "es-MX" ? "Mascota" : "Pet") };
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

  const chooseActive = (pet: PetRecord) => {
    update({ ...profile, activePetId: pet.id });
    setDraft({ ...pet });
    announce(language === "es-MX" ? `${pet.name} es la mascota activa.` : `${pet.name} is the active pet.`);
  };

  return (
    <div className="fw-builder-layout">
      <article className="fw-pet-stage" aria-label={draft.name}>
        <div className="fw-pet" aria-hidden="true">🐾</div>
        <h2>{draft.name}</h2>
        <p>{optionLabel(draft.species, language)} · {optionLabel(draft.accessory, language)}</p>
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
                  onClick={() => chooseActive(pet)}
                >
                  🐾 {pet.name} · {optionLabel(pet.species, language)}
                </button>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export function RobotHome({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const activePet = profile.pets.find((pet) => pet.id === profile.activePetId) ?? profile.pets[0];
  const toggleDecoration = (item: string) => {
    const selected = profile.decorations.includes(item);
    const decorations = selected ? profile.decorations.filter((value) => value !== item) : [...profile.decorations, item];
    update({ ...profile, decorations });
    announce(language === "es-MX"
      ? `${optionLabel(item, language)} ${selected ? "quitada" : "agregada"}.`
      : `${item} ${selected ? "removed" : "added"}.`);
  };

  return (
    <>
      <article className="fw-room" aria-label={language === "es-MX" ? "Casa Robot" : "Robot Home"}>
        <div className="fw-room__window" aria-hidden="true">✨</div>
        <div className="fw-room__robot"><RobotStage robot={profile.robot} statusLabel={tr(ui.homeStatus, language)} levelLabel={tr(ui.levelShort, language)} /></div>
        <div className="fw-room__pet">{activePet ? `🐾 ${activePet.name}` : ""}</div>
        <div className="fw-room__art">{profile.artwork.at(-1)?.title ?? ""}</div>
        <div className="fw-room__decor">{profile.decorations.map((item) => <span key={item}>{optionLabel(item, language)}</span>)}</div>
      </article>
      <section aria-labelledby="room-decorations-heading">
        <h2 id="room-decorations-heading" className="fw-subheading">{tr(ui.decorations, language)}</h2>
        <div className="fw-filter-row">
          {ROOM_DECORATIONS.map((item) => (
            <button
              type="button"
              className={profile.decorations.includes(item) ? "active" : ""}
              aria-pressed={profile.decorations.includes(item)}
              key={item}
              onClick={() => toggleDecoration(item)}
            >
              {optionLabel(item, language)}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
