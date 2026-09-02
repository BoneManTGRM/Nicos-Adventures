import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MonsterStage } from "../FeatureArt";
import type { Language, LocalProfile, MonsterRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import type { Announce, UpdateProfile } from "./common";
import { EmptyState, makeId } from "./common";
import { MonsterCreatureStudio } from "./MonsterCreatureStudio";
import { MonsterPortrait } from "./MonsterPortrait";
import type { MonsterTraitKey } from "./monsterCreatureStudio";
import {
  MONSTER_MOVEMENTS,
  monsterMotionProfile,
  monsterMovement,
  type MonsterPose,
} from "./monsterMovement";
import { completeOnce, hasCompleted, monsterFriendshipMission } from "./progression";

const MonsterLabVisuals = lazy(() => import("./MonsterLabVisuals"));

type LocalizedText = { en: string; "es-MX": string };
type MonsterStatKey = "power" | "speed" | "defense" | "magic";
type MonsterStats = Record<MonsterStatKey, number>;

const labCopy = {
  title: { en: "Monster Lab", "es-MX": "Laboratorio de monstruos" },
  description: {
    en: "Create detailed layered monsters with powers, movement, and personalities.",
    "es-MX": "Crea monstruos detallados con poderes, movimientos y personalidades.",
  },
  myMonsters: { en: "My Monsters", "es-MX": "Mis monstruos" },
  close: { en: "Close Monster Lab", "es-MX": "Cerrar el Laboratorio de monstruos" },
  expand: { en: "Expand monster preview", "es-MX": "Ampliar vista del monstruo" },
  collapse: { en: "Restore monster preview", "es-MX": "Restaurar vista del monstruo" },
  newMonster: { en: "New Monster", "es-MX": "Nuevo monstruo" },
  collectionTitle: { en: "My saved monsters", "es-MX": "Mis monstruos guardados" },
  collectionEmpty: {
    en: "Save your first monster and it will appear here.",
    "es-MX": "Guarda tu primer monstruo y aparecerá aquí.",
  },
  ready: { en: "Ready", "es-MX": "Listo" },
  movementHelp: {
    en: "Choose a movement to bring this monster to life.",
    "es-MX": "Elige un movimiento para dar vida a este monstruo.",
  },
  stats: {
    power: { en: "Power", "es-MX": "Poder" },
    speed: { en: "Speed", "es-MX": "Velocidad" },
    defense: { en: "Defense", "es-MX": "Defensa" },
    magic: { en: "Magic", "es-MX": "Magia" },
  },
} as const;

const bodyDescriptions: Record<string, LocalizedText> = {
  Blob: {
    en: "A mischievous blob full of energy, bounce, and cosmic sparkles.",
    "es-MX": "Un blob travieso lleno de energía, rebotes y destellos cósmicos.",
  },
  Dragon: {
    en: "A fearless sky dragon with a bright core and a powerful guardian roar.",
    "es-MX": "Un dragón del cielo valiente con un núcleo brillante y un rugido guardián.",
  },
  "Jungle Beast": {
    en: "A wild forest guardian whose strength grows wherever living things flourish.",
    "es-MX": "Un guardián salvaje del bosque cuya fuerza crece donde prospera la vida.",
  },
  "Stone Golem": {
    en: "A patient stone protector built to stand firm through every adventure.",
    "es-MX": "Un protector de piedra paciente, creado para resistir en cada aventura.",
  },
  Spirit: {
    en: "A luminous spirit that glides between dreams and follows curious explorers.",
    "es-MX": "Un espíritu luminoso que viaja entre sueños y acompaña a exploradores curiosos.",
  },
  Cosmic: {
    en: "A mysterious star-born creature carrying a miniature galaxy inside its shell.",
    "es-MX": "Una criatura misteriosa nacida de las estrellas con una galaxia en su interior.",
  },
  Aquatic: {
    en: "A swift ocean creature that turns currents, bubbles, and waves into playful power.",
    "es-MX": "Una criatura marina veloz que convierte corrientes, burbujas y olas en poder.",
  },
  Candy: {
    en: "A cheerful candy creature powered by laughter, bright colors, and sweet surprises.",
    "es-MX": "Una criatura de caramelo alegre impulsada por risas, colores y sorpresas dulces.",
  },
  Mecha: {
    en: "A precision-built mecha monster with armored defenses and a brilliant energy core.",
    "es-MX": "Un monstruo mecha de precisión con armadura y un núcleo de energía brillante.",
  },
  Royal: {
    en: "A noble guardian whose crystal armor shines brightest when friends need help.",
    "es-MX": "Un guardián noble cuya armadura de cristal brilla cuando sus amigos lo necesitan.",
  },
  Volcano: {
    en: "A molten powerhouse forged from lava, thunder, and the heart of a volcano.",
    "es-MX": "Una fuerza ardiente creada con lava, trueno y el corazón de un volcán.",
  },
  "Ice Beast": {
    en: "A cool-headed arctic beast with frost armor and a sparkling ice blast.",
    "es-MX": "Una bestia ártica tranquila con armadura de escarcha y un rayo de hielo.",
  },
  Alien: {
    en: "A clever visitor from a distant moon with advanced senses and curious inventions.",
    "es-MX": "Un visitante inteligente de una luna lejana con sentidos e inventos avanzados.",
  },
  "Lizard Alien": {
    en: "A fast cosmic reptile whose permanent armored face was shaped on another world.",
    "es-MX": "Un reptil cósmico veloz cuya cara blindada permanente nació en otro mundo.",
  },
  Dinosaur: {
    en: "A bold prehistoric explorer with a mighty stride and a talent for finding fossils.",
    "es-MX": "Un explorador prehistórico valiente con paso poderoso y talento para hallar fósiles.",
  },
  Cloud: {
    en: "A gentle dream cloud that floats softly, changes shape, and carries moonlight.",
    "es-MX": "Una nube de sueños amable que flota, cambia de forma y lleva luz de luna.",
  },
};

function newMonster(): MonsterRecord {
  return {
    id: makeId("monster"),
    name: "Glimmer",
    body: "Blob",
    eyes: "Two eyes",
    horns: "No horns",
    wings: "No wings",
    color: "Aqua",
    pattern: "Galaxy",
    power: "Rainbow shield",
    personality: "Mischievous",
    friendship: 1,
    habitat: "Crystal Cave",
    mouth: "Fang smile",
    arms: "Tiny arms",
    legs: "Tiny feet",
    tail: "No tail",
    texture: "Slime",
    animation: "Bounce",
  };
}

function seededScore(monster: MonsterRecord, salt: MonsterStatKey): number {
  const source = [
    monster.body,
    monster.color,
    monster.pattern,
    monster.texture,
    monster.power,
    monster.personality,
    salt,
  ].join("|");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return 72 + (Math.abs(hash) % 27);
}

function monsterStats(monster: MonsterRecord): MonsterStats {
  return {
    power: seededScore(monster, "power"),
    speed: seededScore(monster, "speed"),
    defense: seededScore(monster, "defense"),
    magic: seededScore(monster, "magic"),
  };
}

function monsterDescription(monster: MonsterRecord, language: Language): string {
  const description = bodyDescriptions[monster.body] ?? bodyDescriptions.Blob;
  return description[language];
}

export function MonsterLab({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;
  const [draft, setDraft] = useState<MonsterRecord>(newMonster);
  const [activeTrait, setActiveTrait] = useState<MonsterTraitKey>("color");
  const [pose, setPose] = useState<MonsterPose>("idle");
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const motionTimer = useRef<number | null>(null);
  const motionProfile = monsterMotionProfile(draft.body);
  const activeMovement = monsterMovement(pose);
  const stats = monsterStats(draft);
  const statItems: Array<{ key: MonsterStatKey; icon: string }> = [
    { key: "power", icon: "🔥" },
    { key: "speed", icon: "🪽" },
    { key: "defense", icon: "🛡️" },
    { key: "magic", icon: "✨" },
  ];

  const clearMotionTimer = () => {
    if (motionTimer.current !== null) {
      window.clearTimeout(motionTimer.current);
      motionTimer.current = null;
    }
  };

  const returnToIdle = () => {
    clearMotionTimer();
    setPose("idle");
  };

  const play = (nextPose: Exclude<MonsterPose, "idle">) => {
    clearMotionTimer();
    const movement = monsterMovement(nextPose);
    setPose(nextPose);
    setDraft((current) => ({
      ...current,
      animation: movement?.en ?? current.animation,
    }));
    motionTimer.current = window.setTimeout(() => {
      setPose("idle");
      motionTimer.current = null;
    }, movement?.duration ?? 1900);
  };

  useEffect(() => {
    clearMotionTimer();
    setPose("idle");
    setActiveTrait("color");
    setDraft(profile.monsters.at(-1) ? { ...profile.monsters.at(-1)! } : newMonster());
  }, [profile.id]);

  useEffect(() => () => clearMotionTimer(), []);

  useEffect(() => {
    if (!collectionOpen && !expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCollectionOpen(false);
      setExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [collectionOpen, expanded]);

  const save = () => {
    const monster = { ...draft, id: draft.id || makeId("monster"), name: draft.name.trim() || (language === "es-MX" ? "Monstruo" : "Monster") };
    const exists = profile.monsters.some((item) => item.id === monster.id);
    const monsters = exists
      ? profile.monsters.map((item) => item.id === monster.id ? monster : item)
      : [...profile.monsters, monster];
    update({ ...profile, monsters, stars: profile.stars + (exists ? 0 : 2) });
    setDraft(monster);
    play("celebrate");
    announce(`${monster.name}: ${tr(ui.saveSuccess, language)}`);
  };

  const startNewMonster = () => {
    returnToIdle();
    setActiveTrait("color");
    setDraft(newMonster());
    announce(language === "es-MX" ? "Nuevo monstruo listo para personalizar." : "New monster ready to customize.");
  };

  const selectSavedMonster = (monster: MonsterRecord) => {
    returnToIdle();
    setActiveTrait("color");
    setDraft({ ...monster });
    setCollectionOpen(false);
    announce(`${monster.name}: ${tr(ui.selected, language)}`);
  };

  const switchLanguage = () => {
    const nextLanguage: Language = language === "en" ? "es-MX" : "en";
    update({ ...profile, language: nextLanguage });
    announce(tr(ui.changedLanguage, nextLanguage));
  };

  const exitLab = () => {
    returnToIdle();
    setExpanded(false);
    setCollectionOpen(false);
    update({ ...profile, selectedSection: "world-map" });
  };

  const poseLabel = activeMovement
    ? (language === "es-MX" ? activeMovement.es : activeMovement.en)
    : labCopy.ready[language];

  return (
    <section className="monster-lab-experience" aria-labelledby="monster-lab-command-title">
      <Suspense fallback={null}><MonsterLabVisuals /></Suspense>

      <header className="monster-lab-commandbar">
        <button type="button" className="monster-lab-commandbar__brand" onClick={exitLab} aria-label={language === "es-MX" ? "Volver al Mapa del mundo" : "Return to World Map"}>
          <span aria-hidden="true">⚡</span>
          <span>
            <small>{language === "es-MX" ? "EL MUNDO DE" : "NICO'S"}</small>
            <strong>{language === "es-MX" ? "NICO" : "WORLD"}</strong>
          </span>
        </button>

        <div className="monster-lab-commandbar__identity">
          <div className="monster-lab-commandbar__badge">
            <span aria-hidden="true">🧪</span>
            <h2 id="monster-lab-command-title">{labCopy.title[language]}</h2>
          </div>
          <p>{labCopy.description[language]}</p>
        </div>

        <div className="monster-lab-commandbar__actions">
          <button type="button" onClick={switchLanguage} aria-label={language === "en" ? "Cambiar a español de México" : "Switch to English"}>
            {language === "en" ? "🇲🇽 Español" : "🇺🇸 English"}
          </button>
          <button type="button" aria-expanded={collectionOpen} aria-controls="monster-collection-dialog" onClick={() => setCollectionOpen(true)}>
            <span aria-hidden="true">📖</span>
            {labCopy.myMonsters[language]}
            <b>{profile.monsters.length}</b>
          </button>
          <button type="button" className="monster-lab-commandbar__close" onClick={exitLab} aria-label={labCopy.close[language]}>×</button>
        </div>
      </header>

      <div className="fw-builder-layout monster-lab-layout">
        <section className="fw-panel monster-lab-controls" aria-label={tr(ui.formControls, language)}>
          <MonsterCreatureStudio
            monster={draft}
            language={language}
            activeTrait={activeTrait}
            selectTrait={setActiveTrait}
            sculpt={(trait, option) => {
              setDraft((current) => ({ ...current, [trait]: option }));
              if (trait === "body") returnToIdle();
            }}
          />
        </section>

        <section
          className={`monster-lab-preview${expanded ? " is-expanded" : ""}`}
          aria-label={language === "es-MX" ? "Vista previa del monstruo" : "Monster preview"}
          data-monster-motion-pose={pose}
          data-monster-motion-mass={motionProfile.mass}
          data-monster-motion-locomotion={motionProfile.locomotion}
          data-monster-motion-temperament={motionProfile.temperament}
        >
          <div className="monster-preview-stage">
            <button
              type="button"
              className="monster-preview-stage__expand"
              aria-pressed={expanded}
              aria-label={expanded ? labCopy.collapse[language] : labCopy.expand[language]}
              onClick={() => setExpanded((current) => !current)}
            >
              <span aria-hidden="true">{expanded ? "↙" : "↗"}</span>
            </button>
            <MonsterStage monster={draft} action={pose} language={language} />
          </div>

          <div className="monster-action-row" role="group" aria-label={language === "es-MX" ? "Imágenes de movimiento del monstruo" : "Monster movement images"}>
            {MONSTER_MOVEMENTS.filter((movement) => movement.pose !== "celebrate").map((movement) => (
              <button
                type="button"
                key={movement.pose}
                data-monster-motion={movement.pose}
                aria-pressed={pose === movement.pose}
                className={pose === movement.pose ? "active" : ""}
                onClick={() => play(movement.pose)}
              >
                <span aria-hidden="true">{movement.icon}</span>
                {language === "es-MX" ? movement.es : movement.en}
              </button>
            ))}
          </div>

          <div className="monster-pose-readout" role="status" aria-live="polite">
            <span aria-hidden="true">{activeMovement?.icon ?? "✦"}</span>
            <strong>{poseLabel}</strong>
            <small>{labCopy.movementHelp[language]}</small>
          </div>

          <section className="monster-summary-card" aria-label={language === "es-MX" ? "Detalles del monstruo" : "Monster details"}>
            <div className="monster-summary-card__heading">
              <label className="monster-name-editor">
                <span className="sr-only">{tr(ui.monsterName, language)}</span>
                <input
                  value={draft.name}
                  maxLength={32}
                  aria-label={tr(ui.monsterName, language)}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
                <span aria-hidden="true">✎</span>
              </label>
              <div className="monster-summary-card__tags" aria-label={language === "es-MX" ? "Rasgos principales" : "Primary traits"}>
                <span>{optionLabel(draft.body, language)}</span>
                <span>{optionLabel(draft.pattern, language)}</span>
                <span>{optionLabel(draft.power, language)}</span>
              </div>
            </div>

            <p>{monsterDescription(draft, language)}</p>

            <div className="monster-summary-card__footer">
              <div className="monster-stat-grid" aria-label={language === "es-MX" ? "Estadísticas del monstruo" : "Monster statistics"}>
                {statItems.map((item) => (
                  <div key={item.key}>
                    <span aria-hidden="true">{item.icon}</span>
                    <small>{labCopy.stats[item.key][language]}</small>
                    <strong>{stats[item.key]}</strong>
                  </div>
                ))}
              </div>
              <div className="monster-summary-actions">
                <button type="button" onClick={startNewMonster}>＋ {labCopy.newMonster[language]}</button>
                <button type="button" className="fw-primary" onClick={save}>💾 {tr(ui.saveMonster, language)}</button>
              </div>
            </div>
          </section>
        </section>
      </div>

      {collectionOpen ? (
        <div className="monster-collection-backdrop" onClick={() => setCollectionOpen(false)}>
          <section
            id="monster-collection-dialog"
            className="monster-collection-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monster-collection-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>{labCopy.title[language]}</small>
                <h2 id="monster-collection-title">{labCopy.collectionTitle[language]}</h2>
              </div>
              <button type="button" onClick={() => setCollectionOpen(false)} aria-label={language === "es-MX" ? "Cerrar colección" : "Close collection"}>×</button>
            </header>
            {!profile.monsters.length ? (
              <EmptyState emoji="👾">{labCopy.collectionEmpty[language]}</EmptyState>
            ) : (
              <div className="monster-collection-grid">
                {profile.monsters.map((monster) => (
                  <button
                    type="button"
                    aria-pressed={draft.id === monster.id}
                    key={monster.id}
                    onClick={() => selectSavedMonster(monster)}
                  >
                    <MonsterPortrait
                      body={monster.body}
                      color={monster.color}
                      arms={monster.arms}
                      label={language === "es-MX" ? `Vista de ${monster.name}` : `${monster.name} preview`}
                    />
                    <span>
                      <strong>{monster.name}</strong>
                      <small>{optionLabel(monster.body, language)} · {optionLabel(monster.pattern, language)}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="monster-collection-dialog__new" onClick={() => {
              startNewMonster();
              setCollectionOpen(false);
            }}>＋ {labCopy.newMonster[language]}</button>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export function MonsterHabitats({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const language = profile.language;

  const care = (monsterId: string, amount: number, action: { en: string; "es-MX": string }) => {
    const monster = profile.monsters.find((item) => item.id === monsterId);
    if (!monster || monster.friendship >= 100) return;
    const nextFriendship = Math.min(100, monster.friendship + amount);
    let nextProfile: LocalProfile = {
      ...profile,
      monsters: profile.monsters.map((item) => item.id === monsterId ? { ...item, friendship: nextFriendship } : item),
    };
    const earnedMilestones: number[] = [];
    for (const threshold of [50, 100] as const) {
      if (monster.friendship < threshold && nextFriendship >= threshold) {
        const completion = completeOnce(nextProfile, monsterFriendshipMission(monsterId, threshold), threshold === 50 ? 2 : 3);
        nextProfile = completion.profile;
        if (completion.awarded) earnedMilestones.push(threshold);
      }
    }
    update(nextProfile);
    const milestoneText = earnedMilestones.length
      ? (language === "es-MX"
          ? ` Alcanzó el hito ${earnedMilestones.join(" y ")} y ganó estrellas.`
          : ` Reached the ${earnedMilestones.join(" and ")} milestone and earned stars.`)
      : "";
    announce(`${monster.name}: ${action[language]}. ${tr(ui.friendship, language)} ${nextFriendship}/100.${milestoneText}`);
  };

  if (!profile.monsters.length) return <EmptyState emoji="🏕️">{tr(ui.createMonsterFirst, language)}</EmptyState>;

  return (
    <div className="fw-card-grid">
      {profile.monsters.map((monster) => (
        <article className="fw-creature-card monster-habitat-card" key={monster.id}>
          <MonsterStage monster={monster} language={language} />
          <h3>{monster.name}</h3>
          <p>{optionLabel(monster.habitat, language)} · {optionLabel(monster.personality, language)}</p>
          <label>
            {tr(ui.friendship, language)}: {monster.friendship}/100
            <progress max={100} value={monster.friendship}>{monster.friendship}%</progress>
          </label>
          <div className="friendship-milestones" aria-label={language === "es-MX" ? "Hitos de amistad" : "Friendship milestones"}>
            <span className={hasCompleted(profile, monsterFriendshipMission(monster.id, 50)) ? "earned" : ""}>⭐ 50</span>
            <span className={hasCompleted(profile, monsterFriendshipMission(monster.id, 100)) ? "earned" : ""}>🏆 100</span>
          </div>
          <div className="fw-action-row" role="group" aria-label={language === "es-MX" ? `Cuidar a ${monster.name}` : `Care for ${monster.name}`}>
            <button type="button" onClick={() => care(monster.id, 5, { en: "Fed", "es-MX": "Alimentado" })} disabled={monster.friendship >= 100}>🍎 {language === "es-MX" ? "Alimentar" : "Feed"}</button>
            <button type="button" onClick={() => care(monster.id, 10, { en: "Played together", "es-MX": "Jugaron juntos" })} disabled={monster.friendship >= 100}>🎾 {language === "es-MX" ? "Jugar" : "Play"}</button>
            <button type="button" onClick={() => care(monster.id, 5, { en: "Groomed", "es-MX": "Cepillado" })} disabled={monster.friendship >= 100}>🪮 {language === "es-MX" ? "Cepillar" : "Groom"}</button>
          </div>
        </article>
      ))}
    </div>
  );
}
