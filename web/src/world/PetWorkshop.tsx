import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LocalProfile, PetRecord } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/display";
import { PET_OPTIONS } from "./catalogs";
import type { Announce, UpdateProfile } from "./common";
import { LocalizedSelect, makeId } from "./common";
import { hasCompleted, petTrickMission } from "./progression";
import { PetArt } from "./PetArt";
import type { PetAction } from "./PetArt";
import { PetChallenge } from "./PetChallenge";
import { addPetBond, advancePetGame, beginPetGame, bondLabel, CUES, finishPetTraining, hasPetEdits, knownTrickCount, personalityGreeting, PET_LIMIT, savePetStyle, TRICKS } from "./petPlay";
import type { PetGame, TrickId } from "./petPlay";
import "./pet-workshop.css";

type Props = { profile: LocalProfile; update: UpdateProfile; announce: Announce };
type View = "play" | "train" | "style" | "pets";
type Intent = { kind: "new" } | { kind: "choose"; id: string };

function newPet(): PetRecord {
  return { id: makeId("pet"), name: "Sparky", species: "Robot Dog", color: "Blue", accessory: "Explorer Scarf", personality: "Playful", bond: 1, tricks: [] };
}

/** A profile switch must not carry another child's draft, game, or pending intent. */
export function PetWorkshop(props: Props) {
  return <PetWorkshopSession key={props.profile.id} {...props} />;
}

function PetWorkshopSession({ profile, update, announce }: Props) {
  const language = profile.language, es = language === "es-MX";
  const initial = profile.pets.find((pet) => pet.id === profile.activePetId) ?? profile.pets[0];
  const [draft, setDraft] = useState<PetRecord>(() => initial ? { ...initial, tricks: [...initial.tricks] } : newPet());
  const [wasSaved, setWasSaved] = useState(Boolean(initial));
  const [view, setView] = useState<View>(initial ? "play" : "style");
  const [scene, setScene] = useState("garden");
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState<Intent | null>(null);
  const [performance, setPerformance] = useState<{ action: PetAction; run: number } | null>(null);
  const [game, setGame] = useState<PetGame | null>(null);
  const gameRef = useRef<PetGame | null>(null);
  const rounds = useRef(0), runs = useRef(0);
  const careThisVisit = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardHeading = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLElement>(null);
  const savedPet = profile.pets.find((pet) => pet.id === draft.id);
  const pet = savedPet ? { ...draft, bond: savedPet.bond, tricks: savedPet.tricks } : draft;
  const lostPet = wasSaved && !savedPet;
  const dirty = hasPetEdits(draft, savedPet);
  const learned = knownTrickCount(pet);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useLayoutEffect(() => { if (pending) guardHeading.current?.focus(); }, [pending]);
  useEffect(() => {
    if (!savedPet) { gameRef.current = null; setGame(null); }
  }, [savedPet?.id]);

  const setChallenge = (next: PetGame | null) => { gameRef.current = next; setGame(next); };
  const say = (message: string) => { setReply(message); announce(message); };
  const perform = (action: PetAction) => {
    if (timer.current) clearTimeout(timer.current);
    setPerformance({ action, run: ++runs.current });
    timer.current = setTimeout(() => setPerformance(null), 1600);
  };
  const transition = (intent: Intent, current = profile) => {
    const chosen = intent.kind === "choose" ? current.pets.find((item) => item.id === intent.id) : undefined;
    if (intent.kind === "choose" && !chosen) { setPending(null); return; }
    if (timer.current) clearTimeout(timer.current);
    setPerformance(null); setChallenge(null); setReply(""); setPending(null);
    setDraft(chosen ? { ...chosen, tricks: [...chosen.tricks] } : newPet());
    setWasSaved(Boolean(chosen)); setView(chosen ? "play" : "style");
    if (chosen) update({ ...current, activePetId: chosen.id });
  };
  const request = (intent: Intent) => {
    if (intent.kind === "choose" && intent.id === draft.id) return;
    if (dirty && !lostPet) setPending(intent); else transition(intent);
  };
  const save = (then?: Intent) => {
    const next = savePetStyle(profile, draft, wasSaved);
    if (!next) {
      say(lostPet ? (es ? "Esta mascota ya no está en el perfil. Elige otra mascota." : "This pet is no longer in the profile. Choose another pet.")
        : (es ? "Tu colección está llena. Tus 60 mascotas siguen a salvo." : "Your collection is full. All 60 saved pets are safe."));
      return;
    }
    update(next);
    if (then) transition(then, next);
    else { setDraft(next.pets.find((item) => item.id === draft.id)!); setWasSaved(true); setView("play"); setPending(null); }
    say(`${draft.name.trim() || (es ? "Mascota" : "Pet")}: ${tr(ui.saveSuccess, language)}`);
  };
  const begin = (trickId?: TrickId) => {
    if (!savedPet) return;
    setChallenge(beginPetGame(savedPet.id, trickId, rounds.current++));
    setView(trickId ? "train" : "play");
    setReply("");
  };
  const chooseCue = (choice: number) => {
    const current = gameRef.current;
    if (!current || current.won || !savedPet || current.petId !== savedPet.id) return;
    const nextGame = advancePetGame(current, choice);
    if (nextGame === current) {
      say(current.kind === "training"
        ? `${es ? "Prueba con" : "Try"} ${CUES[current.route[current.step]].name[language]}. ${es ? "¡Sin prisa!" : "Take your time!"}`
        : (es ? "Busca la herramienta brillante. ¡Tú puedes!" : "Look for the bright tool. You've got this!"));
      return;
    }
    // Claim the terminal step synchronously: rapid taps cannot award the same round twice.
    setChallenge(nextGame);
    if (!nextGame.won) {
      perform(current.kind === "fetch" ? "Fetch Tool" : "High Five");
      say(current.kind === "training"
        ? `${es ? "¡Bien! Sigue" : "Nice! Next is"} ${CUES[nextGame.route[nextGame.step]].name[language]}.`
        : `${es ? "Herramientas encontradas" : "Tools found"}: ${nextGame.step}/5.`);
      return;
    }
    const next = current.trickId ? finishPetTraining(profile, current.petId, current.trickId) : addPetBond(profile, current.petId, 4);
    if (!next) { setChallenge(null); return; }
    const result = next.pets.find((item) => item.id === current.petId)!;
    const gain = result.bond - savedPet.bond;
    update(next); perform(current.trickId ?? "Fetch Tool");
    say(`${es ? "¡Gran trabajo en equipo!" : "Great teamwork!"} ${gain > 0 ? `+${gain} ${es ? "de vínculo" : "bond"}.` : bondLabel(result.bond, language) + "."}${next.stars > profile.stars ? ` +${next.stars - profile.stars} ⭐` : ""}`);
  };
  const care = (kind: "cuddle" | "charge") => {
    if (!savedPet) return;
    const key = `${savedPet.id}:${kind}`;
    const first = !careThisVisit.current.has(key);
    careThisVisit.current.add(key);
    const next = first ? addPetBond(profile, savedPet.id, 1) : null;
    if (next) update(next);
    perform(kind === "cuddle" ? "High Five" : "Sit");
    say(kind === "cuddle"
      ? (es ? `¡A ${pet.name} le encantan tus cariños!` : `${pet.name} loves a little kindness!`)
      : (es ? "¡Energía de amistad recargada!" : "Friendship batteries recharged!"));
  };
  const navigation: { id: View; icon: string; en: string; es: string }[] = [
    { id: "play", icon: "🎾", en: "Play", es: "Jugar" }, { id: "train", icon: "✨", en: "Train", es: "Trucos" },
    { id: "style", icon: "🎨", en: "Style", es: "Diseño" }, { id: "pets", icon: "🐾", en: "My pets", es: "Mascotas" },
  ];
  const activeChallenge = game && game.petId === savedPet?.id && ((view === "train" && game.kind === "training") || (view === "play" && game.kind === "fetch"));

  return <div className="pet-workshop-layout pet-haven" data-pet-workshop="play-first">
    <nav className="pet-haven__nav" aria-label={es ? "Actividades de mascotas" : "Pet activities"}>
      {navigation.map((item) => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>
        <span aria-hidden="true">{item.icon}</span>{es ? item.es : item.en}</button>)}
    </nav>
    {pending && <section className="pet-haven__save-guard" aria-labelledby="pet-save-guard">
      <h3 id="pet-save-guard" ref={guardHeading} tabIndex={-1}>{es ? "¿Guardamos tus cambios?" : "Keep your changes?"}</h3>
      <p>{es ? "Tu diseño tiene cambios sin guardar." : "Your pet design has unsaved changes."}</p>
      <div className="pet-haven__actions">
        <button type="button" onClick={() => save(pending)}>{es ? "Guardar y continuar" : "Save and continue"}</button>
        <button type="button" onClick={() => transition(pending)}>{es ? "Descartar cambios" : "Discard changes"}</button>
        <button type="button" onClick={() => setPending(null)}>{es ? "Seguir editando" : "Keep editing"}</button>
      </div>
    </section>}
    <div className="pet-haven__layout">
      <article ref={stage} className={`pet-haven__stage pet-haven__stage--${scene}`} aria-label={pet.name}>
        <header><div><small>{es ? "TU COMPAÑERO" : "YOUR COMPANION"}</small><h2>{pet.name || (es ? "Tu mascota" : "Your pet")}</h2></div>
          <span className="pet-haven__pill">{learned}/6 {es ? "trucos" : "tricks"}</span></header>
        <p className="pet-haven__identity">{optionLabel(pet.species, language)} · {optionLabel(pet.personality, language)}</p>
        <button type="button" className="pet-haven__pet-touch" onClick={() => care("cuddle")} disabled={!savedPet}
          aria-label={es ? `Acariciar a ${pet.name}` : `Pet ${pet.name}`}>
          <span key={performance?.run ?? "idle"} className="pet-haven__actor" data-action={performance?.action}>
            <PetArt pet={pet} language={language} action={performance?.action} decorative />
          </span>
        </button>
        <p className="pet-haven__speech">{reply || personalityGreeting(pet.personality, language)}</p>
        <label className="pet-haven__bond"><span><strong>{bondLabel(pet.bond, language)}</strong><span>{es ? "Vínculo" : "Bond"} {pet.bond}/100</span></span>
          <progress max={100} value={pet.bond} aria-label={es ? "Vínculo con tu mascota" : "Pet bond"}>{pet.bond}%</progress></label>
        {dirty && <span className="pet-haven__draft">{es ? "Diseño sin guardar" : "Unsaved design"}</span>}
      </article>
      <section className="pet-haven__panel" aria-label={es ? navigation.find((item) => item.id === view)!.es : navigation.find((item) => item.id === view)!.en}>
        {lostPet && <p className="pet-haven__warning">{es ? "Esta mascota ya no está en el perfil. Elige otra en Mascotas." : "This pet is no longer in the profile. Choose another in My pets."}</p>}
        {!savedPet && !lostPet && view !== "style" && view !== "pets" && <div className="pet-haven__welcome">
          <h3>{es ? "¡Conoce a tu nuevo amigo!" : "Meet your new friend!"}</h3><p>{es ? "Guarda tu mascota para empezar a jugar." : "Save your pet to start playing together."}</p>
          <button type="button" onClick={() => save()}>{es ? "Guardar y jugar" : "Save and play"}</button></div>}
        {view === "play" && savedPet && <>
          <h2>{es ? "Un ratito de aventura" : "A little adventure together"}</h2>
          <div className="pet-haven__care"><button type="button" onClick={() => care("cuddle")}>🖐 {es ? "Dar cariño" : "Cuddle"}</button>
            <button type="button" onClick={() => care("charge")}>⚡ {es ? "Recargar" : "Recharge"}</button></div>
          {activeChallenge ? <PetChallenge game={game!} language={language} choose={chooseCue} again={() => begin()} close={() => setChallenge(null)} />
            : <div className="pet-haven__play-cards">
              <button type="button" onClick={() => begin()}><span aria-hidden="true">🔧</span><span><strong>{es ? "Búsqueda de herramientas" : "Tool treasure hunt"}</strong><small>{es ? "Encuentra cinco · hasta +4 de vínculo" : "Find five · up to +4 bond"}</small></span><span aria-hidden="true">↗</span></button>
              <button type="button" onClick={() => setView("train")}><span aria-hidden="true">✨</span><span><strong>{es ? "Estudio de trucos" : "Trick studio"}</strong><small>{es ? "Aprende, practica y presume tus trucos" : "Learn, practice, and put on a show"}</small></span><span aria-hidden="true">↗</span></button>
            </div>}
          <fieldset className="pet-haven__scenes"><legend>{es ? "Escenario de esta visita" : "Scene for this visit"}</legend>
            {[{ id: "garden", en: "Garden", es: "Jardín", icon: "🌿" }, { id: "space", en: "Space", es: "Espacio", icon: "🌙" }, { id: "sunset", en: "Sunset", es: "Atardecer", icon: "🌅" }].map((item) => <button type="button" key={item.id} aria-pressed={scene === item.id} onClick={() => setScene(item.id)}>{item.icon} {es ? item.es : item.en}</button>)}
          </fieldset>
        </>}
        {view === "train" && savedPet && <section className="pet-training-panel" aria-labelledby="pet-training-heading">
          <header><h2 id="pet-training-heading">{es ? "Estudio de trucos" : "Trick studio"}</h2><span>{learned}/6</span></header>
          <p>{learned === TRICKS.length ? (es ? "¡Dominas los seis! Sigue jugando para fortalecer tu amistad." : "All six mastered! Keep playing to grow your friendship.") : (es ? "Sigue tres señales para aprender un truco. Practica a tu ritmo." : "Follow three cues to learn a trick. Practice at your own pace.")}</p>
          {activeChallenge && <PetChallenge game={game!} language={language} choose={chooseCue} again={() => begin(game?.trickId)} close={() => setChallenge(null)} />}
          <div className="pet-trick-grid pet-haven__tricks">
            {TRICKS.map((trick) => {
              const known = savedPet.tricks.includes(trick.id);
              return <article key={trick.id} className={known ? "learned" : ""}>
                <span className="pet-haven__trick-icon" aria-hidden="true">{trick.emoji}</span><h3>{trick.name[language]}</h3>
                <button type="button" onClick={() => { if (known) { stage.current?.scrollIntoView({ block: "center", behavior: "auto" }); perform(trick.id); say(`${pet.name}: ${trick.name[language]}!`); } else begin(trick.id); }}>
                  {known ? (es ? "Ver truco" : "Perform") : (es ? "Aprender" : "Learn")}</button>
                {known ? <button type="button" className="pet-haven__quiet" onClick={() => begin(trick.id)}>{es ? "Practicar · +2 de vínculo" : "Practice · +2 bond"}</button>
                  : <small>{es ? "+12 de vínculo" : "+12 bond"}</small>}
              </article>;
            })}
          </div>
          <div className="pet-haven__milestones" aria-label={es ? "Hitos de entrenamiento" : "Training milestones"}>
            {([1, 3, 5] as const).map((count) => <span key={count} className={hasCompleted(profile, petTrickMission(savedPet.id, count)) ? "earned" : ""}>
              {hasCompleted(profile, petTrickMission(savedPet.id, count)) ? "🏆" : "○"} {count} {es ? "trucos" : "tricks"} · {count === 1 ? 1 : count === 3 ? 2 : 3} ⭐</span>)}
          </div>
        </section>}
        {view === "style" && <section className="pet-haven__editor">
          <h2>{es ? "Un amigo a tu estilo" : "Make this friend your own"}</h2>
          <p>{es ? "Prueba nuevos looks. El vínculo y los trucos no se pierden." : "Try a new look. Your bond and learned tricks stay with your pet."}</p>
          <label>{tr(ui.petName, language)}<input value={draft.name} maxLength={32} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <div className="fw-form-grid">{Object.entries(PET_OPTIONS).map(([key, values]) => <LocalizedSelect key={key} field={key} values={values}
            value={String(draft[key as keyof PetRecord] ?? values[0])} language={language} onChange={(value) => setDraft({ ...draft, [key]: value })} />)}</div>
          <div className="pet-haven__actions"><button type="button" className="fw-primary" disabled={lostPet} onClick={() => save()}>🐾 {tr(ui.savePet, language)}</button>
            <button type="button" disabled={profile.pets.length >= PET_LIMIT} onClick={() => request({ kind: "new" })}>＋ {es ? "Nueva mascota" : "New pet"}</button></div>
        </section>}
        {view === "pets" && <section>
          <header className="pet-haven__collection-heading"><h2>{es ? "Tu equipo de amigos" : "Your crew of friends"}</h2><span>{profile.pets.length}/{PET_LIMIT}</span></header>
          <p>{es ? "Elige quién te acompaña. Cada mascota conserva su propia amistad y sus trucos." : "Choose your companion. Every pet keeps its own friendship and tricks."}</p>
          <button type="button" disabled={profile.pets.length >= PET_LIMIT} onClick={() => request({ kind: "new" })}>＋ {es ? "Crear una mascota" : "Create a pet"}</button>
          {!profile.pets.length && <p>{es ? "Tu primera amistad empieza con un diseño." : "Your first friendship starts with a design."}</p>}
          <div className="pet-haven__roster">{profile.pets.map((item) => <button type="button" key={item.id} className="pet-collection-button"
            aria-pressed={item.id === draft.id} onClick={() => request({ kind: "choose", id: item.id })}>
            <PetArt pet={item} language={language} decorative /><span><strong>{item.name}</strong><small>{optionLabel(item.species, language)} · {knownTrickCount(item)}/6</small>
              <small>{bondLabel(item.bond, language)} · {item.bond}/100</small></span></button>)}</div>
          {profile.pets.length >= PET_LIMIT && <p>{es ? "Colección completa: tus 60 mascotas están a salvo." : "Full collection: all 60 pets are safe."}</p>}
        </section>}
      </section>
    </div>
    <p className="pet-haven__privacy">{es ? "Usa el guardado de tu perfil. Tu mascota nunca pierde vínculo mientras estás fuera." : "Uses your existing profile save. Your pet never loses bond while you're away."}</p>
  </div>;
}
