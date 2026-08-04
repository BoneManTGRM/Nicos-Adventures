import type { ReactNode } from "react";
import type { Language, LocalProfile, SectionId } from "../types";
import { fieldLabel, tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import { WORLD_SECTIONS } from "./catalogs";

export type UpdateProfile = (profile: LocalProfile) => void;
export type Announce = (message: string) => void;

export const makeId = (prefix: string): string => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export function AppHeader({
  profile,
  open,
  update,
  announce,
}: {
  profile: LocalProfile;
  open: (id: SectionId) => void;
  update: UpdateProfile;
  announce: Announce;
}) {
  const language = profile.language;
  const switchLanguage = () => {
    const nextLanguage: Language = language === "en" ? "es-MX" : "en";
    update({ ...profile, language: nextLanguage });
    announce(tr(ui.changedLanguage, nextLanguage));
  };

  return (
    <header className="fw-topbar">
      <button type="button" className="fw-brand" onClick={() => open("world-map")} aria-label={tr(WORLD_SECTIONS[0].name, language)}>
        <span aria-hidden="true">⚡</span>
        <div>
          <small>{language === "es-MX" ? "EL MUNDO DE" : "NICO'S"}</small>
          <strong>{language === "es-MX" ? "NICO" : "WORLD"}</strong>
        </div>
      </button>
      <div className="fw-profile-pill" aria-label={`${tr(ui.profile, language)}: ${profile.playerName}`}>👤 {profile.playerName}</div>
      <div className="fw-profile-pill" aria-label={`${profile.stars} ${tr(ui.stars, language)}`}>⭐ {profile.stars}</div>
      <button
        type="button"
        onClick={switchLanguage}
        aria-label={language === "en" ? "Cambiar a español de México" : "Switch to English"}
      >
        {language === "en" ? "🇲🇽 Español" : "🇺🇸 English"}
      </button>
    </header>
  );
}

export function PageTitle({ sectionId, language }: { sectionId: SectionId; language: Language }) {
  const section = WORLD_SECTIONS.find((item) => item.id === sectionId) ?? WORLD_SECTIONS[0];
  return (
    <header className="fw-page-header" data-section-id={section.id}>
      <span aria-hidden="true">{section.emoji}</span>
      <div>
        <small>{tr(ui.destination, language)}</small>
        <h1 id="page-title" tabIndex={-1}>{tr(section.name, language)}</h1>
        <p>{tr(section.description, language)}</p>
      </div>
    </header>
  );
}

export function BottomNavigation({
  profile,
  open,
}: {
  profile: LocalProfile;
  open: (id: SectionId) => void;
}) {
  const ids: SectionId[] = ["world-map", "robo-lab", "animal-forest", "monster-lab", "robot-home", "parent-settings"];
  return (
    <nav className="fw-bottom-nav" aria-label={tr(ui.mainNavigation, profile.language)}>
      {ids.map((sectionId) => {
        const section = WORLD_SECTIONS.find((item) => item.id === sectionId)!;
        const active = profile.selectedSection === sectionId;
        return (
          <button
            type="button"
            key={sectionId}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            aria-label={`${tr(ui.openDestination, profile.language)}: ${tr(section.name, profile.language)}`}
            onClick={() => open(sectionId)}
          >
            <span aria-hidden="true">{section.emoji}</span>
            <small>{tr(section.name, profile.language)}</small>
          </button>
        );
      })}
    </nav>
  );
}

export function LocalizedSelect({
  field,
  values,
  value,
  language,
  onChange,
}: {
  field: string;
  values: string[];
  value: string;
  language: Language;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {fieldLabel(field, language)}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => <option value={item} key={item}>{optionLabel(item, language)}</option>)}
      </select>
    </label>
  );
}

export function EmptyState({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="fw-empty fw-empty--polished" role="status">
      <span aria-hidden="true">{emoji}</span>
      <p>{children}</p>
    </div>
  );
}
