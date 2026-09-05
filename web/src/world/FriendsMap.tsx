import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocalProfile } from '../types';
import type { Announce, UpdateProfile } from './common';
import { completeOnce } from './progression';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { busy, cameraFor, createMapState, destination, frameDue, FRAME_MS, missionIds, nearbyStop, pauseMap, progress, ROSTER, score, screenToWorld, selectFriend, STOPS, stepMap, TOKENS } from '../game/friendsMap/simulation';
import type { Friend, Input, MapState, Mode, Point, Viewport } from '../game/friendsMap/simulation';
import { drawMap, FRIEND_NAMES, loadMapAssets } from '../game/friendsMap/renderer';
import type { MapAssets } from '../game/friendsMap/renderer';
import './friends-map.css';

const modeCopy: Record<Mode, { en: string; es: string; help: string; ayuda: string }> = {
  explore: { en: 'Island helpers', es: 'Ayudantes de la isla', help: 'Visit the five places and help your friends. Walk to a numbered marker, then press the action button.', ayuda: 'Visita los cinco lugares y ayuda a tus amigos. Camina hasta un número y pulsa el botón de acción.' },
  stars: { en: 'Star trail', es: 'Sendero de estrellas', help: 'Find all eight golden stars along the island paths. Walk over a star to collect it.', ayuda: 'Encuentra las ocho estrellas doradas en los caminos. Camina sobre una estrella para recogerla.' },
  parade: { en: 'Friendship parade', es: 'Desfile de amigos', help: 'Let every friend lead. Choose each character, walk to any numbered place, and do an activity together.', ayuda: 'Todos pueden guiar. Elige a cada personaje, camina a un lugar numerado y hagan una actividad juntos.' },
};
function hud(s: MapState) { return { status: s.status, leader: s.leader, mode: s.mode, near: nearbyStop(s)?.id, action: s.action?.id, actionProgress: Math.round((s.action?.elapsed ?? 0) * 4), count: progress(s).count, total: progress(s).total, score: score(s), completed: s.completed.join(','), collected: s.collected.join(','), greeted: s.greeted.join(',') }; }
export function FriendsMap({ profile, update, announce, close }: { profile: LocalProfile; update: UpdateProfile; announce: Announce; close: () => void }) {
  const es = profile.language === 'es-MX';
  const [s] = useState(() => createMapState(profile.completedMissions));
  const [view, setView] = useState(() => hud(s));
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  const [menu, setMenu] = useState(false), [notice, setNotice] = useState(''), [overview, setOverview] = useState(false);
  const overviewRef = useRef(false), input = useRef<Input>({ x: 0, y: 0, interact: false });
  const keys = useRef(new Set<string>()), pointers = useRef(new Map<number, Point>());
  const canvas = useRef<HTMLCanvasElement>(null), surface = useRef<HTMLDivElement>(null), region = useRef<HTMLElement>(null), dialog = useRef<HTMLDivElement>(null);
  const camera = useRef<Viewport>(cameraFor(s.player, 800, 500));
  const latest = useRef({ profile, update, announce }); latest.current = { profile, update, announce };
  const control = useRef({ wake: () => {}, cancel: () => {} });
  const syncHud = useCallback(() => setView(old => { const next = hud(s); return JSON.stringify(old) === JSON.stringify(next) ? old : next; }), [s]);
  const clear = useCallback(() => { keys.current.clear(); pointers.current.clear(); input.current = { x: 0, y: 0, interact: false }; }, []);
  const pause = useCallback(() => { clear(); if (s.status === 'playing') pauseMap(s); control.current.cancel(); syncHud(); }, [s, clear, syncHud]);
  const dismissMenu = useCallback(() => setMenu(false), []);
  useDialogFocusTrap({ open: menu, dialogRef: dialog, onClose: dismissMenu });
  const syncInput = useCallback(() => {
    const k = keys.current, touches = [...pointers.current.values()];
    input.current.x = Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft')) + touches.reduce((v, p) => v + p.x, 0);
    input.current.y = Number(k.has('KeyS') || k.has('ArrowDown')) - Number(k.has('KeyW') || k.has('ArrowUp')) + touches.reduce((v, p) => v + p.y, 0);
    control.current.wake();
  }, []);
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; document.body.classList.add('friends-map-open');
    return () => { document.body.style.overflow = oldOverflow; document.body.classList.remove('friends-map-open'); };
  }, []);
  useEffect(() => {
    let alive = true, assets: MapAssets | null = null, timer = 0, raf = 0, lastFrame = 0, frames = 0, handled = s.revision;
    let totalWork = 0, worstWork = 0, bufferedWidth = 800, bufferedHeight = 500;
    const element = canvas.current!, ctx = element.getContext('2d', { alpha: false });
    setReady(false); setFailed(false);
    const cancel = () => { clearTimeout(timer); cancelAnimationFrame(raf); timer = raf = 0; };
    const save = () => {
      if (handled === s.revision) return;
      handled = s.revision; const latestProfile = latest.current.profile;
      let next = latestProfile;
      for (const id of missionIds(s)) next = completeOnce(next, id, 1).profile;
      const best = Math.max(next.arcadeScores['friends-map'] ?? 0, score(s));
      if (best !== next.arcadeScores['friends-map']) next = { ...next, arcadeScores: { ...next.arcadeScores, 'friends-map': best } };
      if (next !== latestProfile) { latest.current.profile = next; latest.current.update(next); }
    };
    const wake = () => {
      if (!alive || !assets || !ctx || document.hidden || timer || raf) return;
      timer = window.setTimeout(() => { timer = 0; raf = requestAnimationFrame(frame); }, Math.max(1, Math.ceil(FRAME_MS - (performance.now() - lastFrame))));
    };
    const frame = () => {
      const now = performance.now();
      raf = 0; if (!alive || document.hidden || !assets || !ctx) return;
      if (!frameDue(now, lastFrame)) { wake(); return; }
      const start = performance.now(), previousAction = s.action?.id, previousRevision = s.revision;
      stepMap(s, input.current, lastFrame ? (now - lastFrame) / 1000 : 1 / 30); lastFrame = now;
      camera.current = cameraFor(s.player, bufferedWidth, bufferedHeight, overviewRef.current);
      drawMap(ctx, assets, s, camera.current); frames++;
      if (previousAction && !s.action && s.revision !== previousRevision && s.completed.includes(previousAction)) {
        const stop = STOPS.find(p => p.id === previousAction)!;
        const message = latest.current.profile.language === 'es-MX' ? stop.resultado : stop.result;
        setNotice(message); latest.current.announce(message);
      }
      save(); syncHud();
      const work = performance.now() - start; totalWork += work; worstWork = Math.max(worstWork, work);
      Object.assign(element.dataset, { frames: String(frames), x: s.player.x.toFixed(2), y: s.player.y.toFixed(2), traveled: s.traveled.toFixed(2), path: String(s.path.length), averageFrameMs: (totalWork / frames).toFixed(3), worstFrameMs: worstWork.toFixed(3), renderer: 'canvas2d', frameCap: '30', companions: '4' });
      if (busy(s, input.current)) wake();
    };
    const resize = () => {
      if (!surface.current) return;
      const rect = surface.current.getBoundingClientRect();
      // Ignore retina DPR. A bounded backing buffer avoids mobile fill-rate spikes.
      const ratio = Math.min(1, 1024 / Math.max(1, rect.width), 640 / Math.max(1, rect.height));
      bufferedWidth = Math.max(1, Math.round(rect.width * ratio)); bufferedHeight = Math.max(1, Math.round(rect.height * ratio));
      element.width = bufferedWidth; element.height = bufferedHeight; wake();
    };
    const observer = new ResizeObserver(resize); observer.observe(surface.current!); resize();
    control.current = { wake, cancel };
    const hidden = () => { if (document.hidden) pause(); else wake(); };
    const down = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !region.current?.contains(document.activeElement) || dialog.current?.contains(document.activeElement)) return;
      if (event.code === 'Escape') { event.preventDefault(); pause(); return; }
      if (s.status !== 'playing' || (event.target as HTMLElement)?.matches('input,select,textarea,[contenteditable="true"]')) return;
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(event.code)) { event.preventDefault(); keys.current.add(event.code); syncInput(); }
      if (!event.repeat && (event.code === 'KeyE' || (event.code === 'Space' && event.target === element))) { event.preventDefault(); input.current.interact = true; wake(); }
    };
    const up = (event: KeyboardEvent) => { if (keys.current.delete(event.code)) syncInput(); };
    const blur = () => pause();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', hidden);
    const bootTimer = window.setTimeout(() => { if (alive && !assets) setFailed(true); }, 18000);
    if (!ctx) setFailed(true);
    else void loadMapAssets(latest.current.profile.nico.profession).then(result => {
      if (!alive) { Object.values(result.sprites).forEach(img => { img.width = img.height = 1; }); return; }
      assets = result; clearTimeout(bootTimer); setFailed(false); setReady(true); resize();
    }).catch(() => { if (alive) { clearTimeout(bootTimer); setFailed(true); } });
    return () => {
      alive = false; cancel(); clearTimeout(bootTimer); observer.disconnect(); clear();
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden);
      if (assets) Object.values(assets.sprites).forEach(img => { img.width = img.height = 1; });
      element.width = element.height = 1; control.current = { wake: () => {}, cancel: () => {} };
    };
  }, [attempt, s, pause, clear, syncHud, syncInput]);
  const focus = () => canvas.current?.focus({ preventScroll: true });
  const start = () => { clear(); s.status = 'playing'; syncHud(); setMenu(false); focus(); control.current.wake(); };
  const walk = (point: Point) => { clear(); s.status = 'playing'; destination(s, point); setNotice(''); setMenu(false); syncHud(); focus(); control.current.wake(); };
  const choose = (friend: Friend) => { clear(); selectFriend(s, friend); syncHud(); focus(); control.current.wake(); };
  const action = () => { if (s.status !== 'playing') return; input.current.interact = true; setNotice(''); control.current.wake(); };
  const active = view.status === 'playing', near = STOPS.find(stop => stop.id === view.near);
  const instructions = modeCopy[view.mode];
  return <section ref={region} className="friends-map" aria-label={es ? 'Nico y sus amigos' : 'Nico & Friends'} data-map-status={view.status} data-map-mode={view.mode} data-map-progress={view.count} data-map-completed={view.completed}>
    <header className="friends-map__top"><button type="button" onClick={() => { pause(); close(); }}>← {es ? 'Juegos' : 'Games'}</button><strong>Nico <span>{es ? 'y sus amigos' : '& Friends'}</span></strong><button type="button" data-testid="map-pause" disabled={!active} onClick={pause}>{es ? 'Pausa' : 'Pause'} Ⅱ</button></header>
    <div className="friends-map__status"><span>{es ? instructions.es : instructions.en} <b>{view.count}/{view.total}</b></span><span>★ {view.score}</span><button type="button" disabled={!ready || failed} onClick={() => { pause(); setMenu(true); }}>{es ? 'Lugares y modos' : 'Places & modes'}</button></div>
    <div ref={surface} className="friends-map__surface">
      <canvas ref={canvas} tabIndex={0} role="img" aria-label={es ? 'Mapa jugable. Usa las flechas o toca un camino para caminar.' : 'Playable map. Use arrow keys or tap a path to walk.'} data-testid="friends-map-canvas"
        onPointerUp={event => {
          if (!active || menu) return;
          const r = event.currentTarget.getBoundingClientRect();
          walk(screenToWorld(camera.current, { x: (event.clientX - r.left) / r.width * event.currentTarget.width, y: (event.clientY - r.top) / r.height * event.currentTarget.height }));
        }} />
      {active && <button type="button" className="friends-map__overview" aria-pressed={overview} onClick={() => { overviewRef.current = !overviewRef.current; setOverview(overviewRef.current); control.current.wake(); }}>{overview ? (es ? 'Seguir' : 'Follow') : (es ? 'Ver isla' : 'Whole island')}</button>}
      {(!active || failed) && !menu && <div className="friends-map__overlay">
        <small>{es ? 'EXPLORA · JUEGA · AYUDA' : 'EXPLORE · PLAY · HELP'}</small><h2>{view.status === 'paused' ? (es ? 'Un pequeño descanso' : 'A little breather') : (es ? 'La isla de los amigos' : 'Friendship Island')}</h2>
        <p>{failed ? (es ? 'No se pudo cargar el mapa. Intenta de nuevo.' : 'The map could not load. Please try again.') : (es ? instructions.ayuda : instructions.help)}</p>
        {failed ? <button type="button" onClick={() => setAttempt(n => n + 1)}>{es ? 'Reintentar' : 'Try again'}</button> : <button type="button" className="friends-map__primary" data-testid="map-start" disabled={!ready} onClick={start}>{!ready ? (es ? 'Preparando la isla…' : 'Preparing the island…') : view.status === 'paused' ? (es ? 'Continuar' : 'Resume') : (es ? 'Vamos a explorar' : 'Let’s explore')}</button>}
        <span>{es ? 'Nico, Becca, Lua, BoltBot y Sparky' : 'Nico, Becca, Lua, BoltBot & Sparky'}</span><small>{es ? '2D ligero · Sin chat ni jugadores desconocidos' : 'Lightweight 2D · No chat or unknown players'}</small>
      </div>}
    </div>
    <div className="friends-map__team" role="group" aria-label={es ? 'Elige quién guía' : 'Choose who leads'}>{ROSTER.map(friend => <button type="button" key={friend} data-map-friend={friend} disabled={!ready || menu} aria-pressed={view.leader === friend} onClick={() => choose(friend)}>{FRIEND_NAMES[friend]}{view.greeted.split(',').includes(friend) ? ' ✓' : ''}</button>)}</div>
    <footer className="friends-map__controls">
      <div className="friends-map__dpad" role="group" aria-label={es ? 'Caminar' : 'Walk'}>{([{ name: 'up', x: 0, y: -1, icon: '↑' }, { name: 'left', x: -1, y: 0, icon: '←' }, { name: 'down', x: 0, y: 1, icon: '↓' }, { name: 'right', x: 1, y: 0, icon: '→' }]).map(dir => <button type="button" key={dir.name} disabled={!active} data-map-direction={dir.name} aria-label={es ? ({ up: 'Arriba', left: 'Izquierda', down: 'Abajo', right: 'Derecha' } as Record<string,string>)[dir.name] : dir.name}
        onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); pointers.current.set(event.pointerId, dir); syncInput(); }}
        onPointerUp={event => { pointers.current.delete(event.pointerId); syncInput(); }} onPointerCancel={event => { pointers.current.delete(event.pointerId); syncInput(); }} onLostPointerCapture={event => { pointers.current.delete(event.pointerId); syncInput(); }}
        onClick={event => { if (event.detail === 0) walk({ x: s.player.x + dir.x * 35, y: s.player.y + dir.y * 35 }); }}>{dir.icon}</button>)}</div>
      <div className="friends-map__context"><p role="status">{notice || (view.count === view.total ? (es ? '¡Lo lograron! Sigue explorando o elige otro modo.' : 'You did it! Keep exploring or choose another mode.') : near ? (es ? near.es : near.en) : (es ? 'Toca un camino para caminar juntos.' : 'Tap a path to walk together.'))}</p><small>{es ? 'Flechas / WASD: caminar · E: ayudar' : 'Arrows / WASD: walk · E: help'}</small></div>
      <button type="button" className="friends-map__action" data-testid="map-action" disabled={!active || !near || Boolean(view.action)} onClick={action}>{view.action ? (es ? 'Ayudando…' : 'Helping…') : near ? (es ? near.accion : near.action) : (es ? 'Explorar' : 'Explore')}</button>
    </footer>
    {menu && <div className="friends-map__scrim"><div ref={dialog} className="friends-map__menu" role="dialog" aria-modal="true" aria-label={es ? 'Lugares y modos' : 'Places & modes'}>
      <header><h2>{es ? 'Nuestra aventura' : 'Our adventure'}</h2><button type="button" onClick={() => setMenu(false)}>{es ? 'Cerrar' : 'Close'}</button></header>
      <div className="friends-map__modes">{(Object.keys(modeCopy) as Mode[]).map(mode => <button key={mode} type="button" data-map-mode-choice={mode} aria-pressed={view.mode === mode} onClick={() => { s.mode = mode; syncHud(); }}>{es ? modeCopy[mode].es : modeCopy[mode].en}</button>)}</div>
      <p>{es ? instructions.ayuda : instructions.help}</p>
      <div className="friends-map__destinations">{(view.mode === 'stars' ? TOKENS : STOPS).map((point, i) => <button type="button" key={point.id} data-map-destination={point.id} onClick={() => walk(point)}><b>{i + 1}</b><span>{view.mode === 'stars' ? `${es ? 'Estrella' : 'Star'} ${i + 1}` : (es ? STOPS[i].es : STOPS[i].en)}</span><span>{new Set<string>(view.mode === 'stars' ? s.collected : s.completed).has(point.id) ? '✓' : '→'}</span></button>)}</div>
      <p className="friends-map__privacy">{es ? 'Los amigos son personajes de este dispositivo, no jugadores en línea. Progreso guardado con tu perfil; sin cuenta nueva. El mapa se dibuja solo al jugar y descansa al quedar quieto.' : 'Friends are characters on this device, not online players. Progress saves with your profile; no new account. The map draws while playing and rests when still.'}</p>
      <button type="button" className="friends-map__primary" onClick={start}>{es ? 'Volver al mapa' : 'Back to the map'}</button>
    </div></div>}
  </section>;
}
