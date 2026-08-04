import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { loadLocalStore, PROFILE_EVENT } from "../storage";
import type { NicoPreferences } from "../types";
import { NicoCostumeFigure } from "./NicoCostumeFigure";

type Targets = {
  world: Element | null;
  room: Element | null;
};

const emptyTargets: Targets = { world: null, room: null };

function activeNico(): NicoPreferences {
  const store = loadLocalStore();
  return (store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0]).nico;
}

function readTargets(): Targets {
  const world = document.querySelector(".nico-world-destination > span:first-child");
  const room = document.querySelector(".nico-room-entry > span:first-child");
  if (world?.textContent?.trim()) world.textContent = "";
  if (room?.textContent?.trim()) room.textContent = "";
  return { world, room };
}

function equalTargets(left: Targets, right: Targets) {
  return left.world === right.world && left.room === right.room;
}

export default function NicoPortalArt() {
  const [targets, setTargets] = useState<Targets>(emptyTargets);
  const [nico, setNico] = useState<NicoPreferences>(activeNico);

  useEffect(() => {
    let frame = 0;
    const syncTargets = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readTargets();
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
  }, []);

  useEffect(() => {
    const syncProfile = () => setNico(activeNico());
    window.addEventListener("storage", syncProfile);
    window.addEventListener(PROFILE_EVENT, syncProfile);
    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener(PROFILE_EVENT, syncProfile);
    };
  }, []);

  const portals: ReactNode[] = [];
  if (targets.world) {
    portals.push(createPortal(
      <NicoCostumeFigure profession={nico.profession} accentColor={nico.accentColor} compact alt="" />,
      targets.world,
      "nico-world-art",
    ));
  }
  if (targets.room) {
    portals.push(createPortal(
      <NicoCostumeFigure profession={nico.profession} accentColor={nico.accentColor} compact alt="" />,
      targets.room,
      "nico-room-art",
    ));
  }

  return <>{portals}</>;
}
