import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useActiveProfileStore } from "../hooks/useActiveProfileStore";
import type { SectionId } from "../types";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { openNicoWorld } from "./NicoWorldExperience";

type Targets = {
  worldGrid: Element | null;
  room: Element | null;
};

const emptyTargets: Targets = { worldGrid: null, room: null };

const copy = {
  en: {
    clubhouse: "Nico’s Clubhouse",
    clubhouseDescription: "Ask Nico questions and make little movies.",
    robotHome: "Visit Nico’s Clubhouse",
  },
  "es-MX": {
    clubhouse: "Casa Club de Nico",
    clubhouseDescription: "Pregúntale a Nico y crea pequeñas películas.",
    robotHome: "Visitar la Casa Club de Nico",
  },
} as const;

function readTargets(section: SectionId): Targets {
  return {
    worldGrid: section === "world-map" ? document.querySelector(".fw-destination-grid") : null,
    room: section === "robot-home" ? document.querySelector(".fw-room") : null,
  };
}

function equalTargets(left: Targets, right: Targets) {
  return left.worldGrid === right.worldGrid && left.room === right.room;
}

export default function NicoPortalArt() {
  const { profile } = useActiveProfileStore();
  const [targets, setTargets] = useState<Targets>(emptyTargets);
  const text = copy[profile.language];

  useEffect(() => {
    let frame = 0;
    const syncTargets = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readTargets(profile.selectedSection);
        setTargets((current) => equalTargets(current, next) ? current : next);
      });
    };
    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [profile.selectedSection]);

  const character = (alt: string) => (
    <NicoCostumeFigure
      profession={profile.nico.profession}
      wardrobe={profile.nico.wardrobe}
      accentColor={profile.nico.accentColor}
      compact
      alt={alt}
    />
  );

  const portals: ReactNode[] = [];
  if (targets.worldGrid) {
    portals.push(createPortal(
      <button
        type="button"
        className="fw-destination nico-world-destination"
        onClick={() => openNicoWorld("ask")}
        aria-label={`${text.clubhouse}. ${text.clubhouseDescription}`}
      >
        <span className="nico-world-destination__art">{character(text.clubhouse)}</span>
        <strong>{text.clubhouse}</strong>
        <small>{text.clubhouseDescription}</small>
      </button>,
      targets.worldGrid,
      "nico-world-destination",
    ));
  }
  if (targets.room) {
    portals.push(createPortal(
      <button type="button" className="nico-room-entry" onClick={() => openNicoWorld("ask")}>
        <span className="nico-room-entry__art">{character(text.robotHome)}</span>
        <strong>{text.robotHome}</strong>
      </button>,
      targets.room,
      "nico-room-entry",
    ));
  }

  return <>{portals}</>;
}
