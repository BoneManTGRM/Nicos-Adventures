import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MonsterStage } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import showtimeData from "../catalogs/showtime.json";
import { NicoCostumeFigure } from "../nico/NicoCostumeFigure";
import type {
  LocalProfile,
  LocalizedText,
  MovieCharacterKind,
  MovieCharacterRef,
  MoviePose,
  MovieProject,
} from "../types";
import { composeNicoImage } from "./composeNicoImage";
import { drawMovieFrame, resolvePoseIndex, type RenderableMovieCharacter } from "./movieRenderer";
import { canRecordCanvasMovie, downloadMovieBlob, recordCanvasMovie } from "./recordMovie";

type SceneOption = {
  id: string;
  emoji: string;
  name: LocalizedText;
  background: string;
};

type PoseOption = {
  id: MoviePose;
  emoji: string;
  name: LocalizedText;
  durationMs: number;
  kinds: MovieCharacterKind[];
};

type Props = {
  profile: LocalProfile;
  nicoBaseSource?: string;
  nicoOutfitSource?: string;
  initialProject?: MovieProject | null;
  onProjectSaved: (project: MovieProject) => void;
  onProjectDownloaded: (projectId: string, mimeType: string) => void;
};

type CharacterOption = RenderableMovieCharacter & {
  emoji: string;
};

const catalog = showtimeData as {
  durationOptionsMs: number[];
  scenes: SceneOption[];
  poses: PoseOption[];
};

const copy = {
  en: {
    title: "Showtime Studio",
    intro: "Make a short movie entirely on this device with Nico’s premium artwork. The video is never uploaded and only project instructions are saved.",
    characters: "1. Choose 1–3 characters",
    poses: "2. Build the pose sequence",
    scene: "3. Choose the stage",
    caption: "4. Add a title and caption",
    duration: "Movie length",
    preview: "Play preview",
    stop: "Stop preview",
    parent: "A grown-up is helping with this recording and download.",
    make: "Make Video",
    recording: "Recording…",
    download: "Download .webm",
    read: "Read caption aloud",
    unsupported: "This browser can preview the movie but cannot create a downloadable video here.",
    saved: "Movie project saved in the Memory Museum. The full video remains only in this browser session until downloaded.",
    addPose: "Add pose",
    remove: "Remove",
    noCaption: "Our next adventure begins!",
    live: "Live pose preview",
    canvas: "Video frame preview",
  },
  "es-MX": {
    title: "Estudio Showtime",
    intro: "Crea una película corta completamente en este dispositivo con la ilustración prémium de Nico. El video nunca se sube y solo se guardan las instrucciones del proyecto.",
    characters: "1. Elige de 1 a 3 personajes",
    poses: "2. Crea la secuencia de poses",
    scene: "3. Elige el escenario",
    caption: "4. Agrega título y texto",
    duration: "Duración",
    preview: "Reproducir vista previa",
    stop: "Detener vista previa",
    parent: "Un adulto está ayudando con esta grabación y descarga.",
    make: "Crear video",
    recording: "Grabando…",
    download: "Descargar .webm",
    read: "Leer el texto en voz alta",
    unsupported: "Este navegador puede mostrar la vista previa, pero no puede crear un video descargable aquí.",
    saved: "El proyecto quedó guardado en el Museo de Recuerdos. El video completo permanece solo en esta sesión hasta descargarlo.",
    addPose: "Agregar pose",
    remove: "Quitar",
    noCaption: "¡Comienza nuestra próxima aventura!",
    live: "Vista previa de poses",
    canvas: "Vista previa del video",
  },
} as const;

const makeId = () => `movie-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
const petIcons: Record<string, string> = {
  "Robot Dog": "🐕",
  "Robot Cat": "🐈",
  "Mini Dinosaur": "🦖",
  "Tiny Dragon": "🐉",
  "Penguin Bot": "🐧",
  "Fox Bot": "🦊",
  "Owl Scout": "🦉",
  "Space Orb": "🔮",
};

const projectCharacterKey = (character: MovieCharacterRef) => `${character.kind}:${character.id}`;

export function ShowtimeStudio({
  profile,
  initialProject,
  onProjectSaved,
  onProjectDownloaded,
}: Props) {
  const text = copy[profile.language];
  const characterOptions = useMemo<CharacterOption[]>(() => [
    { key: "nico:nico", kind: "nico", id: "nico", name: "Nico", emoji: "🧒" },
    { key: `robot:${profile.robot.id}`, kind: "robot", id: profile.robot.id, name: profile.robot.name, emoji: "🤖", robot: profile.robot },
    ...profile.monsters.map((monster) => ({ key: `monster:${monster.id}`, kind: "monster" as const, id: monster.id, name: monster.name, emoji: "👾", monster })),
    ...profile.pets.map((pet) => ({ key: `pet:${pet.id}`, kind: "pet" as const, id: pet.id, name: pet.name, emoji: petIcons[pet.species] ?? "🐾", pet })),
  ], [profile.monsters, profile.pets, profile.robot]);

  const initialSelected = useMemo(() => {
    const keys = initialProject?.characters.map(projectCharacterKey).filter((key) => characterOptions.some((item) => item.key === key)) ?? [];
    return keys.length ? keys.slice(0, 3) : characterOptions.slice(0, Math.min(2, characterOptions.length)).map((item) => item.key);
  }, [characterOptions, initialProject]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelected);
  const [sequence, setSequence] = useState<MoviePose[]>(initialProject?.poseSequence.map((step) => step.pose) ?? ["idle", "wave", "celebrate", "dance"]);
  const [sceneId, setSceneId] = useState(initialProject?.background ?? catalog.scenes[0].id);
  const [title, setTitle] = useState(initialProject?.title ?? (profile.language === "es-MX" ? "Mi película" : "My Little Movie"));
  const [caption, setCaption] = useState(initialProject?.caption ?? text.noCaption);
  const [durationMs, setDurationMs] = useState(initialProject?.durationMs ?? 6000);
  const [previewing, setPreviewing] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [parentConfirmed, setParentConfirmed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [savedProject, setSavedProject] = useState<MovieProject | null>(initialProject ?? null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nicoImageRef = useRef<HTMLImageElement | null>(null);

  const selectedCharacters = useMemo(
    () => selectedKeys.flatMap((key) => characterOptions.find((item) => item.key === key) ?? []),
    [characterOptions, selectedKeys],
  );
  const scene = catalog.scenes.find((item) => item.id === sceneId) ?? catalog.scenes[0];
  const currentPose = sequence[previewStep] ?? sequence[0] ?? "idle";
  const recordingSupported = useMemo(() => canRecordCanvasMovie(), []);

  useEffect(() => {
    setSelectedKeys(initialSelected);
    setSequence(initialProject?.poseSequence.map((step) => step.pose) ?? ["idle", "wave", "celebrate", "dance"]);
    setSceneId(initialProject?.background ?? catalog.scenes[0].id);
    setTitle(initialProject?.title ?? (profile.language === "es-MX" ? "Mi película" : "My Little Movie"));
    setCaption(initialProject?.caption ?? text.noCaption);
    setDurationMs(initialProject?.durationMs ?? 6000);
    setSavedProject(initialProject ?? null);
  }, [initialProject, initialSelected, profile.language, text.noCaption]);

  useEffect(() => {
    let cancelled = false;
    nicoImageRef.current = null;
    void composeNicoImage(profile.nico.profession)
      .then((image) => {
        if (cancelled) return;
        nicoImageRef.current = image;
        renderCanvasFrame(0);
      })
      .catch(() => {
        if (cancelled) return;
        nicoImageRef.current = null;
        renderCanvasFrame(0);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.nico.profession]);

  useEffect(() => {
    if (!previewing || !sequence.length) return;
    const perStep = durationMs / sequence.length;
    const timer = window.setTimeout(() => setPreviewStep((current) => (current + 1) % sequence.length), perStep);
    return () => window.clearTimeout(timer);
  }, [durationMs, previewStep, previewing, sequence.length]);

  useEffect(() => {
    renderCanvasFrame(0);
  }, [caption, durationMs, profile.nico.accentColor, profile.nico.profession, profile.nico.wardrobe, sceneId, selectedCharacters, sequence, title]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const toggleCharacter = (key: string) => {
    setSelectedKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : current.length < 3 ? [...current, key] : current);
  };

  const addPose = (pose: MoviePose) => {
    setSequence((current) => current.length >= 8 ? current : [...current, pose]);
  };

  const removePose = (index: number) => {
    setSequence((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    setPreviewStep(0);
  };

  const normalizedSteps = () => {
    const poses = sequence.length ? sequence : ["idle" as MoviePose];
    const base = Math.floor(durationMs / poses.length);
    return poses.map((pose, index) => ({
      pose,
      durationMs: index === poses.length - 1 ? durationMs - base * (poses.length - 1) : base,
    }));
  };

  const renderCanvasFrame = (elapsedMs: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const steps = normalizedSteps();
    const frame = resolvePoseIndex(elapsedMs, steps.map((step) => step.durationMs));
    drawMovieFrame({
      canvas,
      sceneId,
      title: title.trim() || (profile.language === "es-MX" ? "Mi película" : "My Little Movie"),
      caption,
      characters: selectedCharacters,
      pose: steps[frame.index]?.pose ?? "idle",
      poseProgress: frame.progress,
      nicoArt: nicoImageRef.current,
      nicoProfession: profile.nico.profession,
      nicoAccent: profile.nico.accentColor,
    });
  };

  const makeProject = (): MovieProject => ({
    id: initialProject?.id ?? makeId(),
    title: title.trim().slice(0, 48) || (profile.language === "es-MX" ? "Mi película" : "My Little Movie"),
    characters: selectedCharacters.map(({ kind, id, name }) => ({ kind, id, name })),
    poseSequence: normalizedSteps(),
    background: sceneId,
    caption: caption.trim().slice(0, 140),
    language: profile.language,
    durationMs,
    createdAt: initialProject?.createdAt ?? new Date().toISOString(),
    lastDownloadedAt: initialProject?.lastDownloadedAt,
    lastMimeType: initialProject?.lastMimeType,
  });

  const makeVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !recordingSupported || !parentConfirmed || !selectedCharacters.length || !sequence.length) return;
    setRecording(true);
    setRecordingError(null);
    setRecordingProgress(0);
    setVideoBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await recordCanvasMovie({
        canvas,
        durationMs,
        drawFrame: renderCanvasFrame,
        onProgress: setRecordingProgress,
        signal: controller.signal,
      });
      const nextUrl = URL.createObjectURL(result.blob);
      const project = { ...makeProject(), lastMimeType: result.mimeType };
      setVideoBlob(result.blob);
      setVideoUrl(nextUrl);
      setSavedProject(project);
      onProjectSaved(project);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setRecordingError(error instanceof Error ? error.message : "Video recording failed.");
    } finally {
      setRecording(false);
      abortRef.current = null;
      setRecordingProgress(0);
      renderCanvasFrame(0);
    }
  };

  const cancelRecording = () => abortRef.current?.abort();

  const downloadVideo = () => {
    if (!videoBlob || !savedProject) return;
    downloadMovieBlob(videoBlob, savedProject.title);
    onProjectDownloaded(savedProject.id, videoBlob.type || savedProject.lastMimeType || "video/webm");
  };

  const speakCaption = () => {
    if (!("speechSynthesis" in window) || !caption.trim()) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(caption.trim());
    utterance.lang = profile.language === "es-MX" ? "es-MX" : "en-US";
    speechSynthesis.speak(utterance);
  };

  const livePoseFor = (kind: MovieCharacterKind): MoviePose => {
    const option = catalog.poses.find((item) => item.id === currentPose);
    return option?.kinds.includes(kind) ? currentPose : "idle";
  };

  return (
    <section className="showtime-studio" aria-labelledby="showtime-title">
      <header className="nico-feature-heading">
        <div>
          <small>🎬 {profile.language === "es-MX" ? "Video local y privado" : "Local private video"}</small>
          <h2 id="showtime-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>

      <div className="showtime-layout">
        <div className="showtime-controls">
          <fieldset>
            <legend>{text.characters}</legend>
            <div className="showtime-choice-grid">
              {characterOptions.map((character) => {
                const selected = selectedKeys.includes(character.key);
                return (
                  <button
                    type="button"
                    className={selected ? "selected" : ""}
                    key={character.key}
                    aria-pressed={selected}
                    onClick={() => toggleCharacter(character.key)}
                  >
                    <span>{character.emoji}</span>
                    <strong>{character.name}</strong>
                  </button>
                );
              })}
            </div>
            <small>{selectedCharacters.length}/3</small>
          </fieldset>

          <fieldset>
            <legend>{text.poses}</legend>
            <div className="showtime-timeline" aria-label={text.poses}>
              {sequence.map((pose, index) => {
                const option = catalog.poses.find((item) => item.id === pose)!;
                return (
                  <div className="showtime-step" key={`${pose}-${index}`}>
                    <button type="button" className={index === previewStep ? "active" : ""} onClick={() => setPreviewStep(index)}>
                      <span>{option.emoji}</span><strong>{option.name[profile.language]}</strong>
                    </button>
                    <button type="button" className="showtime-remove" onClick={() => removePose(index)} aria-label={`${text.remove} ${option.name[profile.language]}`}>×</button>
                  </div>
                );
              })}
            </div>
            <div className="showtime-pose-picker" aria-label={text.addPose}>
              {catalog.poses.map((pose) => (
                <button type="button" key={pose.id} onClick={() => addPose(pose.id)} disabled={sequence.length >= 8}>
                  {pose.emoji} {pose.name[profile.language]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{text.scene}</legend>
            <div className="showtime-scene-grid">
              {catalog.scenes.map((item) => (
                <button type="button" className={sceneId === item.id ? "selected" : ""} key={item.id} onClick={() => setSceneId(item.id)} aria-pressed={sceneId === item.id}>
                  <span>{item.emoji}</span><strong>{item.name[profile.language]}</strong>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{text.caption}</legend>
            <label>{profile.language === "es-MX" ? "Título" : "Title"}<input value={title} maxLength={48} onChange={(event) => setTitle(event.target.value)} /></label>
            <label>{profile.language === "es-MX" ? "Texto" : "Caption"}<input value={caption} maxLength={140} onChange={(event) => setCaption(event.target.value)} /></label>
            <button type="button" className="nico-secondary-action" onClick={speakCaption}>🔊 {text.read}</button>
          </fieldset>

          <fieldset>
            <legend>{text.duration}</legend>
            <div className="showtime-duration-grid">
              {catalog.durationOptionsMs.map((value) => (
                <button type="button" className={durationMs === value ? "selected" : ""} key={value} onClick={() => setDurationMs(value)} aria-pressed={durationMs === value}>
                  {value / 1000}s
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="showtime-preview-column">
          <section className="showtime-live" style={{ "--showtime-background": scene.background } as CSSProperties} aria-label={text.live}>
            <div className="showtime-live__characters">
              {selectedCharacters.map((character) => {
                const pose = livePoseFor(character.kind);
                if (character.kind === "nico") {
                  return (
                    <div className={`showtime-character showtime-character--${pose}`} key={character.key}>
                      <NicoCostumeFigure
                        profession={profile.nico.profession}
                        wardrobe={profile.nico.wardrobe}
                        accentColor={profile.nico.accentColor}
                        compact
                        alt="Nico"
                      />
                    </div>
                  );
                }
                if (character.kind === "robot" && character.robot) {
                  return <div className="showtime-character showtime-character--robot" key={character.key}><RobotStage robot={character.robot} pose={pose as never} statusLabel="SHOWTIME" levelLabel="LV" /></div>;
                }
                if (character.kind === "monster" && character.monster) {
                  return <div className="showtime-character showtime-character--monster" key={character.key}><MonsterStage monster={character.monster} action={pose} language={profile.language} /></div>;
                }
                return <div className={`showtime-character showtime-character--pet showtime-character--${pose}`} key={character.key}><span>{character.emoji}</span><strong>{character.name}</strong></div>;
              })}
            </div>
            <p>{caption}</p>
          </section>

          <div className="showtime-preview-actions">
            <button type="button" className="nico-secondary-action" onClick={() => setPreviewing((current) => !current)} disabled={!sequence.length}>
              {previewing ? `⏹ ${text.stop}` : `▶ ${text.preview}`}
            </button>
          </div>

          <section className="showtime-canvas-panel" aria-label={text.canvas}>
            <canvas ref={canvasRef} width={960} height={540} />
          </section>

          {!recordingSupported && <p className="showtime-warning" role="status">⚠️ {text.unsupported}</p>}
          <label className="showtime-parent-check">
            <input type="checkbox" checked={parentConfirmed} onChange={(event) => setParentConfirmed(event.target.checked)} />
            <span>{text.parent}</span>
          </label>

          <button
            type="button"
            className="showtime-record-button"
            disabled={!recordingSupported || !parentConfirmed || !selectedCharacters.length || !sequence.length || recording}
            onClick={makeVideo}
          >
            {recording ? `● ${text.recording} ${Math.round(recordingProgress * 100)}%` : `🎥 ${text.make}`}
          </button>
          {recording && <button type="button" className="nico-secondary-action" onClick={cancelRecording}>{profile.language === "es-MX" ? "Cancelar" : "Cancel"}</button>}
          {recordingError && <p className="showtime-error" role="alert">{recordingError}</p>}

          {videoUrl && (
            <section className="showtime-result" aria-live="polite">
              <video src={videoUrl} controls playsInline />
              <p>{text.saved}</p>
              <button type="button" className="nico-primary-action" onClick={downloadVideo}>⬇️ {text.download}</button>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
