import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import FullApp from "./FullApp";
import { NicoCharacter, type NicoPose } from "./NicoCharacter";
import "./nico-character.css";

type NicoSection =
  | "world-map"
  | "robo-lab"
  | "animal-forest"
  | "monster-lab"
  | "monster-habitats"
  | "art-studio"
  | "story-castle"
  | "game-arcade"
  | "dinosaur-valley"
  | "pet-workshop"
  | "robot-home"
  | "memory-book"
  | "badge-book"
  | "parent-settings";

type Language = "en" | "es-MX";
type Copy = { en: string; "es-MX": string };

type Targets = {
  brand: Element | null;
  hero: Element | null;
  pageHeader: Element | null;
  storyPage: Element | null;
  storyHeroSelect: Element | null;
  room: Element | null;
};

type Snapshot = Targets & {
  heading: string;
  language: Language;
};

const sectionByHeading: Record<string, NicoSection> = {
  "World Map": "world-map",
  "Mapa del mundo": "world-map",
  "Robo Lab": "robo-lab",
  "Laboratorio robot": "robo-lab",
  "Animal Forest": "animal-forest",
  "Bosque animal": "animal-forest",
  "Monster Lab": "monster-lab",
  "Laboratorio de monstruos": "monster-lab",
  "Monster Habitats": "monster-habitats",
  "Hábitats de monstruos": "monster-habitats",
  "Art Studio": "art-studio",
  "Estudio de arte": "art-studio",
  "Story Castle": "story-castle",
  "Castillo de cuentos": "story-castle",
  "Game Arcade": "game-arcade",
  "Sala de juegos": "game-arcade",
  "Dinosaur Valley": "dinosaur-valley",
  "Valle de dinosaurios": "dinosaur-valley",
  "Robot Pet Workshop": "pet-workshop",
  "Taller de mascotas robot": "pet-workshop",
  "Robot Home": "robot-home",
  "Casa Robot": "robot-home",
  "Memory Museum": "memory-book",
  "Museo de recuerdos": "memory-book",
  "Badge Observatory": "badge-book",
  "Observatorio de insignias": "badge-book",
  "Parent & Settings": "parent-settings",
  "Adultos y ajustes": "parent-settings",
};

const guideCopy: Record<NicoSection, Copy> = {
  "world-map": {
    en: "Welcome to my world. Choose our next adventure!",
    "es-MX": "Bienvenido a mi mundo. ¡Elige nuestra próxima aventura!",
  },
  "robo-lab": {
    en: "Let’s build a robot teammate.",
    "es-MX": "Construyamos un compañero robot.",
  },
  "animal-forest": {
    en: "Bring your field guide. Let’s discover an animal.",
    "es-MX": "Trae tu guía de campo. Descubramos un animal.",
  },
  "monster-lab": {
    en: "Every friendly monster begins with an idea.",
    "es-MX": "Cada monstruo amistoso comienza con una idea.",
  },
  "monster-habitats": {
    en: "Kindness helps every creature feel at home.",
    "es-MX": "La amabilidad ayuda a cada criatura a sentirse en casa.",
  },
  "art-studio": {
    en: "Make something only you could imagine.",
    "es-MX": "Crea algo que solo tú podrías imaginar.",
  },
  "story-castle": {
    en: "Choose Nico as a hero, then build our next story.",
    "es-MX": "Elige a Nico como héroe y crea nuestra próxima historia.",
  },
  "game-arcade": {
    en: "Let’s beat your best score!",
    "es-MX": "¡Superemos tu mejor puntuación!",
  },
  "dinosaur-valley": {
    en: "Stay curious. Every fossil has a story.",
    "es-MX": "Sigue curioso. Cada fósil tiene una historia.",
  },
  "pet-workshop": {
    en: "Let’s create a loyal robot pet.",
    "es-MX": "Creemos una mascota robot leal.",
  },
  "robot-home": {
    en: "This is our headquarters. Everyone belongs here.",
    "es-MX": "Esta es nuestra base. Todos pertenecen aquí.",
  },
  "memory-book": {
    en: "Look at everything we have discovered together.",
    "es-MX": "Mira todo lo que hemos descubierto juntos.",
  },
  "badge-book": {
    en: "Every badge marks a real accomplishment.",
    "es-MX": "Cada insignia representa un logro real.",
  },
  "parent-settings": {
    en: "Grown-ups can manage language, profiles, and private backups here.",
    "es-MX": "Los adultos pueden administrar idioma, perfiles y respaldos privados aquí.",
  },
};

const poseBySection: Record<NicoSection, NicoPose> = {
  "world-map": "guide",
  "robo-lab": "guide",
  "animal-forest": "explorer",
  "monster-lab": "guide",
  "monster-habitats": "guide",
  "art-studio": "guide",
  "story-castle": "reading",
  "game-arcade": "celebrate",
  "dinosaur-valley": "explorer",
  "pet-workshop": "guide",
  "robot-home": "guide",
  "memory-book": "reading",
  "badge-book": "celebrate",
  "parent-settings": "avatar",
};

const emptySnapshot: Snapshot = {
  heading: "",
  language: "en",
  brand: null,
  hero: null,
  pageHeader: null,
  storyPage: null,
  storyHeroSelect: null,
  room: null,
};

function readSnapshot(): Snapshot {
  const language: Language = document.documentElement.lang === "es-MX" ? "es-MX" : "en";
  return {
    heading: document.querySelector<HTMLElement>(".fw-page-header h1")?.textContent?.trim() ?? "",
    language,
    brand: document.querySelector(".fw-brand > span"),
    hero: document.querySelector(".fw-hero-card"),
    pageHeader: document.querySelector(".fw-page-header"),
    storyPage: document.querySelector(".fw-story-page"),
    storyHeroSelect: document.querySelector(".fw-story-page + .fw-panel select"),
    room: document.querySelector(".fw-room"),
  };
}

function snapshotsMatch(left: Snapshot, right: Snapshot) {
  return (
    left.heading === right.heading &&
    left.language === right.language &&
    left.brand === right.brand &&
    left.hero === right.hero &&
    left.pageHeader === right.pageHeader &&
    left.storyPage === right.storyPage &&
    left.storyHeroSelect === right.storyHeroSelect &&
    left.room === right.room
  );
}

function GuideBubble({ message, label }: { message: string; label: string }) {
  return (
    <div className="nico-speech" role="note" aria-label={label}>
      <strong>Nico</strong>
      <span>{message}</span>
    </div>
  );
}

export default function NicoEnhancedApp() {
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readSnapshot();
        setSnapshot((current) => (snapshotsMatch(current, next) ? current : next));
      });
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
      childList: true,
      characterData: true,
      subtree: true,
    });
    window.addEventListener("storage", sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);

  const section = sectionByHeading[snapshot.heading] ?? "world-map";
  const message = guideCopy[section][snapshot.language];
  const pose = poseBySection[section];
  const guideLabel = snapshot.language === "es-MX" ? "Mensaje de Nico" : "Message from Nico";
  const characterTitle = snapshot.language === "es-MX" ? "Nico, tu guía" : "Nico, your guide";

  const portals = useMemo(() => {
    const output: ReactNode[] = [];

    if (snapshot.brand) {
      output.push(
        createPortal(
          <NicoCharacter pose="avatar" className="nico-brand-avatar" decorative />,
          snapshot.brand,
          "nico-brand-avatar",
        ),
      );
    }

    if (snapshot.hero && section === "world-map") {
      output.push(
        createPortal(
          <aside className="nico-world-guide" aria-label={guideLabel}>
            <NicoCharacter pose="guide" className="nico-world-guide__character" title={characterTitle} />
            <GuideBubble message={message} label={guideLabel} />
          </aside>,
          snapshot.hero,
          "nico-world-guide",
        ),
      );
    }

    if (snapshot.pageHeader && section !== "world-map") {
      output.push(
        createPortal(
          <aside className="nico-page-guide" aria-label={guideLabel}>
            <NicoCharacter pose={pose} className="nico-page-guide__character" title={characterTitle} />
            <GuideBubble message={message} label={guideLabel} />
          </aside>,
          snapshot.pageHeader,
          "nico-page-guide",
        ),
      );
    }

    if (snapshot.storyHeroSelect && section === "story-castle") {
      output.push(createPortal(<option value="Nico">Nico</option>, snapshot.storyHeroSelect, "nico-story-option"));
    }

    if (snapshot.storyPage && section === "story-castle") {
      output.push(
        createPortal(
          <NicoCharacter pose="reading" className="nico-story-companion" decorative />,
          snapshot.storyPage,
          "nico-story-companion",
        ),
      );
    }

    if (snapshot.room && section === "robot-home") {
      output.push(
        createPortal(
          <div className="nico-room-companion" aria-label={characterTitle}>
            <NicoCharacter pose="guide" decorative />
            <span>{snapshot.language === "es-MX" ? "Base de Nico" : "Nico’s headquarters"}</span>
          </div>,
          snapshot.room,
          "nico-room-companion",
        ),
      );
    }

    return output;
  }, [characterTitle, guideLabel, message, pose, section, snapshot]);

  return (
    <>
      <FullApp />
      {portals}
    </>
  );
}
