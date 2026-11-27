import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AdventureAudio } from '../game3d/audio/AdventureAudio';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { advanceFlight, finaleUnlocked, flightBestKey, flightMission, newFlight, steer, usePower, VOYAGES } from '../game/friendsMap/voyage';
import type { Flight } from '../game/friendsMap/voyage';
import { paintFlight } from '../game/friendsMap/voyageArt';
import { FRIEND_NAMES } from '../game/friendsMap/renderer';
import type { MapAssets } from '../game/friendsMap/renderer';
import type { LocalProfile } from '../types';
import { completeOnce } from './progression';
import { hasScoreCapacity } from '../learning/arcadeLearning';
import type { UpdateProfile } from './common';
import harbor from '../assets/art/starwhale-voyage.webp';
import blossom from '../assets/art/kingdom/kingdom-dragon.webp';
import cloud from '../assets/art/kingdom/kingdom-cloud.webp';
import night from '../assets/art/kingdom/kingdom-fox.webp';
import shipFile from '../assets/art/starwhale-skiff.webp';
import whaleFile from '../assets/art/starwhale-rider.webp';
import './starwhale.css';

const skies = [blossom, harbor, cloud, night, night, harbor];
const uniqueSkies = [...new Set(skies)];
const insignia = ['✿','ϟ','♫','☾','✦','≈'];
type Screen = 'chart' | 'flying' | 'paused' | 'result';
const getHud = (s: Flight) => [s.collected, s.score, s.hull, s.cooldown > 0 ? 1 : 0, s.streak] as const;
export function StarwhaleVoyage({ profile, update, close, assets }: { profile: LocalProfile; update: UpdateProfile; close: () => void; assets: MapAssets | null }) {
  const es = profile.language === 'es-MX', lang = es ? 1 : 0;
  const completed = (i: number) => profile.completedMissions.includes(flightMission(i));
  const first = VOYAGES.findIndex((_,i) => !completed(i));
  const [chapter, setChapter] = useState(Math.max(0,first));
  const [wild,setWild] = useState(false), [screen,setScreen] = useState<Screen>('chart');
  const [sound,setSound] = useState(false), [artStatus,setArtStatus] = useState('loading'), [attempt,setAttempt] = useState(0);
  const [audio] = useState(() => new AdventureAudio());
  const dialog = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]), game = useRef(newFlight(chapter));
  const [hud,setHud] = useState(() => getHud(game.current));
  const latest = useRef({ profile, update, sound, assets }); latest.current = { profile, update, sound, assets };
  const liveScreen = useRef(screen); liveScreen.current = screen;
  const closeOrPause = useCallback(() => {
    if (liveScreen.current === 'flying') { liveScreen.current = 'paused'; setScreen('paused'); }
    else if (liveScreen.current === 'paused') setScreen('chart');
    else close();
  },[close]);
  useDialogFocusTrap({ open: true, dialogRef: dialog, onClose: closeOrPause });
  useEffect(() => {
    let mounted = true; setArtStatus('loading');
    const sources = [shipFile,whaleFile,...uniqueSkies];
    void Promise.all(sources.map(src => new Promise<HTMLImageElement>((resolve,reject) => {
      const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = src;
    }))).then(loaded => { if (mounted) { images.current = loaded; setArtStatus('ready'); } }).catch(() => { if (mounted) setArtStatus('failed'); });
    return () => { mounted = false; };
  },[attempt]);
  useEffect(() => () => { void audio.dispose(); },[audio]);
  const cue = useCallback((name: 'inspect'|'install'|'activate') => { if (latest.current.sound) void audio.playCue(name).catch(() => {}); },[audio]);
  const special = useCallback(() => { if (liveScreen.current === 'flying' && usePower(game.current)) cue('inspect'); },[cue]);
  useEffect(() => {
    if (screen !== 'flying') return;
    const el = canvas.current!, ctx = el.getContext('2d');
    if (!ctx) { setArtStatus('failed'); setScreen('chart'); return; }
    el.focus({preventScroll:true});
    const s = game.current;
    let raf = 0, last = 0, width = 1, height = 1, previousHud = '';
    const resize = () => {
      const rect = el.getBoundingClientRect(); width = Math.max(1,rect.width); height = Math.max(1,rect.height);
      const ratio = Math.min(1.65,window.devicePixelRatio || 1,1536/width,1100/height);
      el.width = Math.round(width*ratio); el.height = Math.round(height*ratio); ctx.setTransform(el.width/width,0,0,el.height/height,0,0);
    };
    const obs = new ResizeObserver(resize); obs.observe(el); resize();
    function tick(now: number) {
      if (liveScreen.current !== 'flying' || document.hidden) return;
      if (!last || now - last >= 1000/45 - .25) {
        const before = s.collected;
        advanceFlight(s,last ? (now-last)/1000 : 1/60); last = now;
        paintFlight(ctx!,width,height,s,images.current[0],images.current[1],latest.current.assets?.sprites[VOYAGES[s.chapter].pilot], images.current[2+uniqueSkies.indexOf(skies[s.chapter])]);
        const next = getHud(s), stamp = next.join('/');
        if (stamp !== previousHud) { previousHud = stamp; setHud(next); }
        if (s.result !== 'flying') {
          if (s.result === 'won') {
            const { profile: current, update: save } = latest.current;
            let nextProfile = completeOnce(current,flightMission(s.chapter),s.chapter===5?5:2).profile;
            const key = flightBestKey(s.chapter,s.wild);
            if (hasScoreCapacity(nextProfile.arcadeScores,key) && s.score > (nextProfile.arcadeScores[key] ?? 0)) {
              nextProfile = { ...nextProfile, arcadeScores: { ...nextProfile.arcadeScores,[key]:s.score } };
            }
            if (nextProfile !== current) { latest.current.profile = nextProfile; save(nextProfile); }
            cue('activate');
          }
          liveScreen.current = 'result'; setScreen('result'); return;
        }
        if (s.collected > before) cue('install');
      }
      raf = requestAnimationFrame(tick);
    }
    function pause() { if (liveScreen.current === 'flying') { liveScreen.current = 'paused'; setScreen('paused'); } }
    function visibility() { if (document.hidden) pause(); }
    function key(e: KeyboardEvent) {
      if (liveScreen.current !== 'flying' || !dialog.current?.contains(document.activeElement)) return;
      if (['ArrowUp','KeyW','ArrowDown','KeyS','KeyE','Space'].includes(e.code)) {
        if (e.code === 'Space' && e.target instanceof HTMLButtonElement) return;
        e.preventDefault(); if (e.repeat) return;
        if (e.code==='Space'||e.code==='KeyE') special(); else steer(s,s.lane + (['ArrowUp','KeyW'].includes(e.code) ? -1 : 1));
      }
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener('blur',pause); document.addEventListener('visibilitychange',visibility); window.addEventListener('keydown',key);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); window.removeEventListener('blur',pause); document.removeEventListener('visibilitychange',visibility); window.removeEventListener('keydown',key); };
  },[screen,cue,special]);
  const selected = VOYAGES[chapter], best = profile.arcadeScores[flightBestKey(chapter,wild)] ?? 0;
  const launch = () => {
    if (artStatus !== 'ready' || (chapter === 5 && !finaleUnlocked(profile.completedMissions))) return;
    game.current = newFlight(chapter,wild); setHud(getHud(game.current)); setScreen('flying'); cue('inspect');
  };
  const aim = (clientY: number) => {
    const bounds = canvas.current!.getBoundingClientRect();
    steer(game.current,((clientY-bounds.top)/bounds.height-.25)/.24);
  };
  const active = screen === 'flying', won = game.current.result === 'won';
  const next = VOYAGES.findIndex((_,i) => !completed(i));
  return <div ref={dialog} className="voyage" role="dialog" aria-modal="true" aria-label={es?'Viaje de la ballena estelar':'Starwhale Voyage'} data-screen={screen} style={{'--voyage-color':selected.color,'--voyage-sky':'url('+skies[chapter]+')'} as CSSProperties}>
    <header className="voyage-bar"><button onClick={active?closeOrPause:close}>{active?(es?'Pausa':'Pause'):(es?'Volver a la isla':'Back to island')}</button><strong>{es?'Bitácora de vuelo':'Flight log'} <i>✦</i> {VOYAGES.filter((_,i)=>completed(i)).length}/6</strong><button aria-pressed={sound} aria-label={es?'Sonido':'Sound'} onClick={() => { const on = !sound; setSound(on); if (on) void audio.playCue('inspect').catch(()=>{}); }}>{sound?'♫':'♩'} <span>{sound?(es?'Sí':'On'):(es?'No':'Off')}</span></button></header>
    {screen === 'chart' ? <div className="voyage-chart">
      <div className="voyage-cover"><div><small>{es?'NICO Y SUS AMIGOS':'NICO & FRIENDS'}</small><h2>{es?'Viaje de la ballena estelar':'Starwhale Voyage'}</h2><p>{es?'Una ballena se perdió sobre la isla. Enciende cinco faros para guiarla a casa.':'A whale is lost above the island. Light five beacons to guide her home.'}</p></div></div>
      <div className="voyage-plan"><div className="voyage-chapters" aria-label={es?'Elige un vuelo':'Choose a flight'}>{VOYAGES.map((c,i) => <button key={c.id} aria-label={c.title[lang]} aria-pressed={chapter===i} disabled={i===5 && !finaleUnlocked(profile.completedMissions)} onClick={()=>setChapter(i)} style={{'--gem':c.color} as CSSProperties}><b>{insignia[i]}</b><small>{i===5?(es?'Final':'Finale'):FRIEND_NAMES[c.pilot]}</small>{completed(i)&&<i>✓</i>}</button>)}</div>
      <h3>{selected.title[lang]}</h3><p>{selected.instruction[lang]}</p>
      <div className="voyage-settings"><div role="group" aria-label={es?'Dificultad':'Difficulty'}>{[false,true].map(value=><button key={String(value)} aria-pressed={wild===value} onClick={()=>setWild(value)}>{value?(es?'Tormenta':'Wild skies'):(es?'Calma':'Calm skies')}</button>)}</div><small>{wild?(es?'3 impactos':'3 hits'):(es?'Vidas infinitas':'Unlimited lives')}{best>0?' · ★ '+best:''}</small></div>
      {artStatus==='failed'?<button className="voyage-primary" onClick={()=>setAttempt(n=>n+1)}>{es?'Recargar el arte':'Reload artwork'}</button>:<button className="voyage-primary" disabled={artStatus!=='ready'} onClick={launch}>{artStatus!=='ready'?(es?'Preparando el vuelo…':'Preparing flight…'):(es?'Despegar con ':'Fly with ')+FRIEND_NAMES[selected.pilot]}</button>}
      </div></div> : <>
      <div className="voyage-hud"><div><small>{FRIEND_NAMES[selected.pilot]}</small><h2>{selected.title[lang]}</h2></div><strong>{insignia[chapter]} {hud[0]}/{selected.goal}</strong><span>★ {hud[1]}{wild?' · ♥ '+hud[2]:''}</span></div>
      <div className="voyage-field"><canvas ref={canvas} aria-label={es?'Zona de vuelo. Toca una altura o usa las flechas y E.':'Flight area. Tap an altitude or use the arrow keys and E.'} tabIndex={0} onPointerDown={e=>{if(!active)return;e.currentTarget.setPointerCapture(e.pointerId);aim(e.clientY);}} onPointerMove={e=>{if(active && e.currentTarget.hasPointerCapture(e.pointerId))aim(e.clientY);}} />
      {screen==='paused' && <div className="voyage-card"><h3>{es?'Vuelo en pausa':'Flight paused'}</h3><button className="voyage-primary" onClick={()=>setScreen('flying')}>{es?'Continuar vuelo':'Resume flight'}</button><button onClick={()=>setScreen('chart')}>{es?'Elegir otro vuelo':'Choose another flight'}</button></div>}
      {screen==='result' && <div className="voyage-card" role="status"><b className="voyage-seal">{won?insignia[chapter]:'☁'}</b><h3>{won?(chapter===5?(es?'¡Ya está en casa!':'The starwhale is home!'):(es?'¡Faro encendido!':'Beacon lit!')):(es?'Al refugio de nubes':'Back to cloud harbor')}</h3><p>{won?selected.reward[lang]:(es?'La tormenta alcanzó el barco. Tu tripulación está lista para otro intento.':'The storm caught the skiff. Your crew is ready for another try.')}</p><strong>★ {hud[1]} · {es?'Mejor racha':'Best streak'} ×{game.current.maxStreak}</strong>
      {won&&next>=0&&<button className="voyage-primary" onClick={()=>{setChapter(next);setScreen('chart');}}>{es?'Siguiente vuelo':'Next flight'}</button>}<button onClick={launch}>{es?'Volar otra vez':'Fly again'}</button><button onClick={()=>setScreen('chart')}>{es?'Bitácora':'Flight log'}</button></div>}
      </div>
      <footer className="voyage-deck"><p>{selected.instruction[lang]}</p><div><button disabled={!active} aria-label={es?'Subir':'Climb'} onClick={()=>steer(game.current,game.current.lane-1)}>▲</button><button disabled={!active} aria-label={es?'Bajar':'Descend'} onClick={()=>steer(game.current,game.current.lane+1)}>▼</button><button className="voyage-power" disabled={!active||Boolean(hud[3])} onClick={special}>{insignia[chapter]} {selected.power[lang]}</button></div></footer>
    </>}
  </div>;
}
