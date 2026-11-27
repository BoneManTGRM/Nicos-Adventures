import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointer } from 'react';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { AdventureAudio } from '../game3d/audio/AdventureAudio';
import { ROSTER, type Friend } from '../game/friendsMap/simulation';
import { FRIEND_NAMES, type MapAssets } from '../game/friendsMap/renderer';
import { chapterKey, COURSES, POWERS } from '../game/canopy/levels';
import {
  changeLeader,
  count,
  dropPerch,
  jump,
  power,
  savedEvents,
  startRun,
  step,
} from '../game/canopy/platformer';
import {
  cameraTarget,
  loadPainting,
  paintCanopy,
  scenery,
  trailHint,
  viewFor,
  type Painting,
} from '../game/canopy/paint';
import { completeOnce } from './progression';
import { hasScoreCapacity } from '../learning/arcadeLearning';
import type { LocalProfile } from '../types';
import type { UpdateProfile } from './common';
import './clockwork-canopy.css';

type Panel = 'play' | 'pause' | 'crew' | 'courses' | 'win';
type Props = { profile: LocalProfile; update: UpdateProfile; close: () => void; assets: MapAssets };
const clock = (sec: number) => Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0');
const bestKey = (stage: number) => chapterKey(stage) + ':tenths';
export function ClockworkCanopy({ profile, update, assets, close }: Props) {
  const es = profile.language === 'es-MX',
    lang = es ? 1 : 0;
  const next = COURSES.findIndex((_, i) => !profile.completedMissions.includes(chapterKey(i) + ':home'));
  const [run, setRun] = useState(() => startRun(next < 0 ? 0 : next, profile.completedMissions));
  const [panel, setPanel] = useState<Panel>('play'),
    [art, setArt] = useState<Painting | null>(null),
    [failed, setFailed] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [revision, publish] = useState(0),
    [sound, setSound] = useState(false),
    [auto, setAuto] = useState(false);
  const [audio] = useState(() => new AdventureAudio());
  const region = useRef<HTMLDivElement>(null),
    sheet = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const held = useRef(new Set<string>()),
    override = useRef(new Map<number, string>());
  const camera = useRef(0),
    panelRef = useRef<Panel>(panel);
  panelRef.current = panel;
  const current = useRef({ profile, update, sound, auto, assets, es });
  current.current = { profile, update, sound, auto, assets, es };
  const course = COURSES[run.stage],
    hero = run.friend;
  const portraits = useMemo(
    () => Object.fromEntries(ROSTER.map((f) => [f, assets.sprites[f].toDataURL()])),
    [assets],
  );
  const clear = useCallback(() => {
    held.current.clear();
    override.current.clear();
  }, []);
  const show = useCallback(
    (p: Panel) => {
      clear();
      panelRef.current = p;
      setPanel(p);
    },
    [clear],
  );
  const escape = useCallback(() => {
    if (panelRef.current === 'play') show('pause');
    else if (panelRef.current === 'win') close();
    else show('play');
  }, [show, close]);
  useDialogFocusTrap({
    open: panel === 'play',
    dialogRef: region,
    initialFocusRef: canvas,
    onClose: escape,
  });
  useDialogFocusTrap({ open: panel !== 'play', dialogRef: sheet, onClose: escape });
  useEffect(
    () => () => {
      void audio.dispose();
    },
    [audio],
  );
  useEffect(() => {
    let active = true;
    setFailed(false);
    setArt(null);
    void loadPainting(run.stage)
      .then((a) => {
        if (active) setArt(a);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [run.stage, attempt]);
  const cue = useCallback(
    (which: 'inspect' | 'install' | 'activate') => {
      if (current.current.sound) void audio.playCue(which).catch(() => {});
    },
    [audio],
  );
  const resume = () => {
    show('play');
    canvas.current?.focus({ preventScroll: true });
  };
  const movePower = useCallback(() => {
    if (panelRef.current === 'play' && !run.won && power(run)) {
      cue('inspect');
      publish((n) => n + 1);
    }
  }, [run, cue]);
  const save = useCallback(() => {
    let nextProfile = current.current.profile;
    for (const id of savedEvents(run)) {
      const reward = id.includes(':post') ? 0 : id.endsWith(':home') ? 3 : 1;
      nextProfile = completeOnce(nextProfile, id, reward).profile;
    }
    if (run.won && !run.resumed) {
      const key = bestKey(run.stage),
        tenths = Math.max(1, Math.round(run.elapsed * 10));
      if (
        hasScoreCapacity(nextProfile.arcadeScores, key) &&
        (!nextProfile.arcadeScores[key] || tenths < nextProfile.arcadeScores[key])
      ) {
        nextProfile = { ...nextProfile, arcadeScores: { ...nextProfile.arcadeScores, [key]: tenths } };
      }
    }
    if (nextProfile !== current.current.profile) {
      current.current.profile = nextProfile;
      current.current.update(nextProfile);
    }
  }, [run]);
  useEffect(() => {
    const blur = () => {
      if (panelRef.current === 'play' && !run.won) show('pause');
    };
    const hidden = () => {
      if (document.hidden) blur();
    };
    const down = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        panelRef.current !== 'play' ||
        !region.current?.contains(document.activeElement)
      )
        return;
      if (
        [
          'ArrowLeft',
          'KeyA',
          'ArrowRight',
          'KeyD',
          'ArrowUp',
          'KeyW',
          'ArrowDown',
          'KeyS',
          'KeyJ',
          'Space',
          'KeyE',
          'KeyC',
          'ShiftLeft',
          'ShiftRight',
          'KeyP',
        ].includes(e.code)
      ) {
        if (e.code === 'Space' && e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        if (e.repeat) return;
        held.current.add(e.code);
        if (['ArrowUp', 'KeyW', 'KeyJ', 'Space'].includes(e.code)) jump(run);
        if (['ShiftLeft', 'ShiftRight', 'KeyE'].includes(e.code)) movePower();
        if (e.code === 'ArrowDown' || e.code === 'KeyS') dropPerch(run);
        if (e.code === 'KeyC') show('crew');
        if (e.code === 'KeyP') show('pause');
      }
    };
    const up = (e: KeyboardEvent) => {
      held.current.delete(e.code);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', hidden);
      clear();
    };
  }, [run, clear, movePower, show]);
  useEffect(() => {
    if (!art || !canvas.current || panel !== 'play') return;
    const el = canvas.current,
      ctx = el.getContext('2d');
    if (!ctx) {
      setFailed(true);
      return;
    }
    el.focus({ preventScroll: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0,
      last = 0,
      accumulator = 0,
      w = 1,
      h = 1,
      stamp = '',
      saved = run.revision;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.65, 1600 / w, 1200 / h);
      el.width = Math.round(w * ratio);
      el.height = Math.round(h * ratio);
      ctx.setTransform(el.width / w, 0, 0, el.height / h, 0, 0);
      camera.current = cameraTarget(run, viewFor(w, h).width);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    function tick(now: number) {
      if (document.hidden || panelRef.current !== 'play') return;
      const dt = last ? Math.min(0.14, (now - last) / 1000) : 1 / 60;
      last = now;
      accumulator += dt;
      const keys = held.current,
        touch = [...override.current.values()];
      const left = keys.has('ArrowLeft') || keys.has('KeyA') || touch.includes('left');
      const right = keys.has('ArrowRight') || keys.has('KeyD') || touch.includes('right');
      const heldJump =
        ['Space', 'KeyW', 'ArrowUp', 'KeyJ'].some((k) => keys.has(k)) || touch.includes('jump');
      const axis = left ? -1 : right || current.current.auto ? 1 : 0;
      while (accumulator >= 1 / 120) {
        step(run, { axis, heldJump }, 1 / 120);
        accumulator -= 1 / 120;
      }
      if (run.revision !== saved) {
        saved = run.revision;
        save();
        cue(run.won ? 'activate' : run.feedback === 'save' ? 'inspect' : 'install');
      }
      const target = cameraTarget(run, viewFor(w, h).width);
      camera.current =
        run.respawnGlow > 0.6 || reduced
          ? target
          : camera.current + (target - camera.current) * (1 - Math.exp(-8 * dt));
      paintCanopy(ctx!, w, h, art!, current.current.assets, run, camera.current, reduced);
      const hint = trailHint(run, current.current.es),
        label = [run.revision, run.friend, run.used, run.ground, run.falls, hint].join('/');
      if (label !== stamp) {
        stamp = label;
        publish((n) => n + 1);
      }
      el.dataset.ground = String(run.ground);
      el.dataset.x = String(Math.round(run.x));
      el.dataset.y = String(Math.round(run.y));
      if (run.won && run.arrival >= (reduced ? 0.7 : 2.5)) {
        show('win');
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [art, panel, run, cue, save, show]);
  function board(stage: number, fresh = false) {
    if (stage > 0 && !current.current.profile.completedMissions.includes(chapterKey(stage - 1) + ':home'))
      return;
    clear();
    if (stage !== run.stage) setArt(null);
    const s = startRun(stage, fresh ? [] : current.current.profile.completedMissions, run.friend);
    setRun(s);
    setAuto(false);
    show('play');
  }
  function pointer(e: ReactPointer<HTMLButtonElement>, action: string) {
    if (panelRef.current !== 'play' || !art || run.won) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    override.current.set(e.pointerId, action);
    if (action === 'jump') jump(run);
    if (action === 'power') movePower();
  }
  const release = (e: ReactPointer<HTMLButtonElement>) => {
    override.current.delete(e.pointerId);
  };
  function keyClick(action: string, detail: number) {
    // Native keyboard activation and assistive technology send a zero-detail click.
    if (detail || panel !== 'play' || !art || run.won) return;
    if (action === 'jump') jump(run);
    if (action === 'power') movePower();
    if (action === 'left' || action === 'right') {
      run.facing = action === 'left' ? -1 : 1;
      run.vx = run.facing * 210;
    }
  }
  const touchButton = (action: string, label: string, icon: string, disabled = false) => (
    <button
      type="button"
      className={'cc-control cc-' + action}
      data-canopy-control={action}
      aria-label={label}
      disabled={!art || failed || disabled || run.won || panel !== 'play'}
      onPointerDown={(e) => pointer(e, action)}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onClick={(e) => keyClick(action, e.detail)}
    >
      <b aria-hidden="true">{icon}</b>
      <span>{label}</span>
    </button>
  );
  const stat = (label: string, n: number, symbol: string) => (
    <span className="cc-stat" aria-label={label + ' ' + n + '/3'}>
      <b aria-hidden="true">{symbol}</b> {n}/3
    </span>
  );
  const oldBest = profile.arcadeScores[bestKey(run.stage)];
  return (
    <div
      className="canopy-game"
      role="dialog"
      aria-modal="true"
      aria-label={es ? 'El bosque de engranajes' : 'Clockwork Canopy'}
      ref={region}
      data-panel={panel}
      data-stage={run.stage}
      data-hero={hero}
      data-owlets={count(run.owls)}
      data-revision={revision}
      style={{ '--cc-accent': course.color, '--hero-color': POWERS[hero].color } as CSSProperties}
    >
      <header className="cc-bar" inert={panel !== 'play'}>
        <button type="button" onClick={() => show('courses')}>
          {es ? 'Rutas' : 'Routes'}
        </button>
        <div>
          <small>{es ? 'BOSQUE DE ENGRANAJES' : 'CLOCKWORK CANOPY'}</small>
          <h2>{course.name[lang]}</h2>
        </div>
        <button type="button" onClick={() => (panel === 'play' ? show('pause') : resume())}>
          {panel === 'play' ? (es ? 'Pausa' : 'Pause') : es ? 'Volver' : 'Back'}
        </button>
      </header>
      <div className="cc-scene" style={{ backgroundImage: 'url(' + scenery[run.stage] + ')' }}>
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label={
            es
              ? 'Aventura de plataformas. Flechas para moverte, espacio para saltar, E para usar tu poder.'
              : 'Platform adventure. Arrows to run, Space to jump, E to use your power.'
          }
        />
        <div className="cc-ribbon">
          {stat(es ? 'Polluelos' : 'Owlets', count(run.owls), '◉')}
          {stat(es ? 'Plumas' : 'Feathers', count(run.feathers), '✧')}
          {run.chimes.length > 0 && stat(es ? 'Campanas' : 'Bells', count(run.chimes), '♬')}
        </div>
        {panel === 'play' && art && !failed && (
          <div className="cc-hint" role="status">
            {trailHint(run, es)}
          </div>
        )}
        {panel === 'play' && run.ground >= 0 && course.ledges[run.ground].kind === 'perch' && (
          <button type="button" className="cc-drop" onClick={() => dropPerch(run)}>
            {es ? 'Bajar' : 'Drop down'} ▾
          </button>
        )}
        {(!art || failed) && (
          <div className="cc-shade">
            <div className="cc-sheet">
              <h3>
                {failed
                  ? es
                    ? 'No cargó la ilustración'
                    : 'The scene could not load'
                  : es
                    ? 'Abriendo el sendero…'
                    : 'Opening the trail…'}
              </h3>
              {failed && (
                <button onClick={() => setAttempt((v) => v + 1)}>{es ? 'Reintentar' : 'Try again'}</button>
              )}
              <button onClick={close}>{es ? 'Volver a la isla' : 'Back to island'}</button>
            </div>
          </div>
        )}
      </div>
      <footer className="cc-dock" inert={panel !== 'play'}>
        <button
          className="cc-crew-key"
          onClick={() => show('crew')}
          aria-label={es ? 'Cambiar de amigo' : 'Switch friend'}
        >
          <img src={portraits[hero]} alt="" />
          <span>
            <small>{es ? 'EQUIPO' : 'CREW'}</small>
            <strong>{FRIEND_NAMES[hero]}</strong>
          </span>
        </button>
        <div className="cc-steer">
          {touchButton('left', es ? 'Izquierda' : 'Left', '◀')}
          {touchButton('right', es ? 'Derecha' : 'Right', '▶')}
        </div>
        <div className="cc-actions">
          {touchButton('jump', es ? 'Saltar' : 'Jump', '↥')}
          {touchButton('power', POWERS[hero].name[lang], POWERS[hero].mark, run.used)}
        </div>
      </footer>
      {panel !== 'play' && (
        <div className="cc-shade cc-panel">
          <div className="cc-sheet" ref={sheet}>
            {panel === 'crew' && (
              <>
                <h3>{es ? 'Elige un amigo' : 'Choose a friend'}</h3>
                <div className="cc-crew-list">
                  {ROSTER.map((f) => (
                    <button
                      key={f}
                      aria-pressed={f === hero}
                      onClick={() => {
                        changeLeader(run, f);
                        publish((n) => n + 1);
                        resume();
                      }}
                      style={{ '--gem': POWERS[f].color } as CSSProperties}
                    >
                      <img alt="" src={portraits[f]} />
                      <span>
                        <strong>
                          {FRIEND_NAMES[f]} · {POWERS[f].name[lang]}
                        </strong>
                        <small>{POWERS[f].hint[lang]}</small>
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={resume}>{es ? 'Seguir jugando' : 'Keep playing'}</button>
              </>
            )}
            {panel === 'courses' && (
              <>
                <h3>{es ? 'Rutas del guardián' : 'Guardian trails'}</h3>
                <div className="cc-course-list">
                  {COURSES.map((c, i) => {
                    const done = profile.completedMissions.includes(chapterKey(i) + ':home'),
                      locked = i > 0 && !profile.completedMissions.includes(chapterKey(i - 1) + ':home');
                    const feathers = c.feathers.filter((_, f) =>
                      profile.completedMissions.includes(chapterKey(i) + ':feather' + f),
                    ).length;
                    return (
                      <button
                        key={c.key}
                        disabled={locked}
                        onClick={() => (i === run.stage && !run.won ? resume() : board(i))}
                        style={{
                          backgroundImage:
                            'linear-gradient(90deg,#0b1d2cf2,#14283559),url(' + scenery[i] + ')',
                        }}
                      >
                        <strong>{c.name[lang]}</strong>
                        <small>
                          {locked
                            ? es
                              ? 'Completa la ruta anterior'
                              : 'Finish the previous trail'
                            : done
                              ? (es ? 'Familia reunida' : 'Family reunited') + ' · ✧ ' + feathers + '/3'
                              : c.subtitle[lang]}
                        </small>
                      </button>
                    );
                  })}
                </div>
                <button onClick={close}>{es ? 'Volver a la isla' : 'Back to island'}</button>
              </>
            )}
            {panel === 'pause' && (
              <>
                <h3>{es ? 'Un respiro' : 'Trail paused'}</h3>
                <p>{course.subtitle[lang]}</p>
                <p>
                  <strong>
                    {FRIEND_NAMES[hero]} · {POWERS[hero].name[lang]}
                  </strong>
                  <br />
                  {POWERS[hero].hint[lang]}
                </p>
                <div className="cc-options">
                  <button aria-pressed={auto} onClick={() => setAuto((v) => !v)}>
                    {es ? 'Correr automáticamente' : 'Auto-run'} ·{' '}
                    {auto ? (es ? 'Sí' : 'On') : es ? 'No' : 'Off'}
                  </button>
                  <button
                    aria-pressed={sound}
                    onClick={() => {
                      setSound((v) => !v);
                      if (!sound) void audio.playCue('inspect').catch(() => {});
                    }}
                  >
                    {es ? 'Sonido' : 'Sound'} · {sound ? (es ? 'Sí' : 'On') : es ? 'No' : 'Off'}
                  </button>
                </div>
                <button className="cc-primary" onClick={resume}>
                  {es ? 'Continuar' : 'Resume'}
                </button>
                <button onClick={() => show('crew')}>{es ? 'Cambiar de amigo' : 'Switch friend'}</button>
                <button onClick={close}>{es ? 'Volver a la isla' : 'Back to island'}</button>
              </>
            )}
            {panel === 'win' && (
              <>
                <span className="cc-medal" aria-hidden="true">
                  ✦
                </span>
                <h3>
                  {run.stage === 2
                    ? es
                      ? 'El guardián vuelve a volar'
                      : 'The guardian flies again'
                    : es
                      ? '¡Al nido!'
                      : 'Home to the roost!'}
                </h3>
                <p>
                  {run.stage === 2
                    ? es
                      ? 'Las tres campanas despiertan al guardián. Los nueve polluelos vuelven a casa.'
                      : 'The three bells wake the guardian. All nine owlets are home.'
                    : es
                      ? 'El guardián se lleva a los tres polluelos. Ya puedes explorar la siguiente ruta.'
                      : 'The guardian lifts all three chicks to safety. Your next trail is open.'}
                </p>
                <div className="cc-results">
                  <strong>
                    {es ? 'Plumas doradas' : 'Gold feathers'}　{count(run.feathers)}/3
                  </strong>
                  {!run.resumed && (
                    <span>
                      {es ? 'Tiempo' : 'Time'}　{clock(run.elapsed)}
                    </span>
                  )}
                  {oldBest > 0 && (
                    <span>
                      {es ? 'Récord' : 'Best'}　{clock(oldBest / 10)}
                    </span>
                  )}
                </div>
                {run.stage < 2 && (
                  <button className="cc-primary" onClick={() => board(run.stage + 1)}>
                    {es ? 'Siguiente ruta' : 'Next trail'}
                  </button>
                )}
                <button onClick={() => board(run.stage, true)}>
                  {es ? 'Repetir la ruta' : 'Replay trail'}
                </button>
                <button onClick={() => show('courses')}>{es ? 'Ver rutas' : 'Trail map'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
