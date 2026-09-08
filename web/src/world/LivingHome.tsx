import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PremiumBoltBotSprite } from '../boltbot/PremiumBoltBotSprite';
import { NicoCostumeFigure } from '../nico/NicoCostumeFigure';
import { distance, homePath, moveHome } from '../game/starTag';
import type { Point } from '../game/starTag';
import type { LocalProfile } from '../types';
import type { Announce, UpdateProfile } from './common';
import { PetArt } from './PetArt';
import type { PetAction } from './PetArt';
import { completeOnce } from './progression';
import { optionLabel } from '../i18n/display';
import { ArtworkPreview } from './ArtworkPreview';
import { HomeWorkshop } from './HomeWorkshop';
import { CONSTELLATION } from '../game/goldenAdventureProfile';
import { HomeDecoration } from './HomeDecoration';
import './connected-home.css';
import './playable-world.css';
import './playable-world-hardening.css';
import './home-illustrated.css';

type Actor = 'nico' | 'robot' | 'pet';
type Activity = 'charge' | 'rest' | 'repair' | 'snack' | 'dance';
type Resident = Point & { moving: boolean; action: Activity | null; timer: number; facing: number };
type HomeState = { selected: Actor; residents: Record<Actor, Resident>; path: Point[]; pending: Activity | null; completed: number };
const STATIONS: { id: Activity; icon: string; target: Point; en: string; es: string }[] = [
  { id: 'charge', icon: '⚡', target: { x: 12, z: 68 }, en: 'Charge up', es: 'Recargar' },
  { id: 'rest', icon: '☾', target: { x: 28, z: 64 }, en: 'Take a rest', es: 'Descansar' },
  { id: 'repair', icon: '🔧', target: { x: 52, z: 60 }, en: 'Fix a gadget', es: 'Reparar' },
  { id: 'snack', icon: '🍎', target: { x: 80, z: 68 }, en: 'Snack time', es: 'Comer' },
  { id: 'dance', icon: '♫', target: { x: 48, z: 76 }, en: 'Dance party', es: 'Bailar' },
];
const initial = (): HomeState => {
  const resident = (x: number, z: number): Resident => ({ x, z, moving: false, action: null, timer: 0, facing: 1 });
  return { selected: 'nico', residents: { nico: resident(44, 80), robot: resident(24, 72), pet: resident(68, 84) }, path: [], pending: null, completed: 0 };
};
const copyHome = (state: HomeState): HomeState => ({ ...state, residents: { nico: { ...state.residents.nico }, robot: { ...state.residents.robot }, pet: { ...state.residents.pet } } });
const HOME_SPOTS = [[35, 23], [53, 23], [35, 38], [53, 38], [2, 44], [82, 38], [2, 75], [78, 75], [78, 52]];


export function LivingHome({ profile, update, announce }: { profile: LocalProfile; update: UpdateProfile; announce: Announce }) {
  const es = profile.language === 'es-MX';
  const pet = profile.pets.find(p => p.id === profile.activePetId) ?? profile.pets[0];
  const artwork = profile.artwork.find(a => a.id === profile.displayedArtworkId) ?? profile.artwork.at(-1);
  const state = useRef(initial());
  const [view, setView] = useState(() => copyHome(state.current));
  const [message, setMessage] = useState('');
  const [help, setHelp] = useState(false);
  const [workshop, setWorkshop] = useState<'repair' | 'snack' | 'dance' | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const [undo, setUndo] = useState<Record<string, number> | null>(null);
  const [follow, setFollow] = useState(false);
  const followRef = useRef(false); followRef.current = follow;
  const [storyPage, setStoryPage] = useState(0);
  const homeStory = profile.stories.find(story => story.id === 'adventure-star-bridge');
  const room = useRef<HTMLDivElement>(null);
  const controls = useRef(new Set<string>());
  const touch = useRef({ x: 0, z: 0 });
  const latest = useRef({ profile, update, announce }); latest.current = { profile, update, announce };
  const names: Record<Actor, string> = { nico: 'Nico', robot: profile.robot.name, pet: pet?.name ?? 'Sparky' };
  const speak = useCallback((en: string, spanish: string) => {
    const text = latest.current.profile.language === 'es-MX' ? spanish : en;
    setMessage(text); latest.current.announce(text);
  }, []);
  const perform = useCallback((activity: Activity) => {
    const s = state.current;
    const station = STATIONS.find(item => item.id === activity)!;
    s.pending = null; s.path = [];
    const character = s.residents[s.selected];
    character.action = activity; character.timer = 2.2; character.moving = false;
    const { profile: current, update: save } = latest.current;
    const completion = completeOnce(current, `room:play:${activity}`, 1);
    if (completion.awarded) save(completion.profile);
    s.completed++;
    if (activity === 'repair' || activity === 'snack' || activity === 'dance') setWorkshop(activity);
    speak(`${station.en}!${completion.awarded ? ' You earned a star.' : ''}`, `¡${station.es}!${completion.awarded ? ' Ganaste una estrella.' : ''}`);
    setView(copyHome(s));
  }, [speak]);
  const interact = useCallback(() => {
    const resident = state.current.residents[state.current.selected];
    const station = [...STATIONS].sort((a, b) => distance(a.target, resident) - distance(b.target, resident))[0];
    if (distance(station.target, resident) < 8) perform(station.id);
    else speak('Walk to a station or choose an activity below.', 'Camina a una estación o elige una actividad abajo.');
  }, [perform, speak]);
  const walk = (target: Point, activity: Activity | null = null) => {
    const s = state.current, resident = s.residents[s.selected];
    resident.action = null; resident.timer = 0;
    s.path = homePath(resident, target); s.pending = activity;
    room.current?.focus({ preventScroll: true });
  };
  const choose = (actor: Actor) => {
    state.current.selected = actor; state.current.path = []; state.current.pending = null;
    controls.current.clear(); touch.current = { x: 0, z: 0 };
    setView(copyHome(state.current)); room.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!pet && state.current.selected === 'pet') choose('nico');
  }, [pet?.id]);
  useEffect(() => {
    let frame = 0, previous = 0, paint = 0, dirty = false;
    const tick = (now: number) => {
      const dt = Math.min((now - (previous || now)) / 1000, .05); previous = now;
      const s = state.current;
      if (!document.hidden) {
        for (const actor of Object.values(s.residents)) {
          if (actor.moving) dirty = true;
          actor.moving = false;
          if (actor.timer > 0) { actor.timer -= dt; if (actor.timer <= 0) { actor.action = null; dirty = true; } }
        }
        const actor = s.residents[s.selected], keys = controls.current;
        let x = Number(keys.has('ArrowRight') || keys.has('KeyD')) - Number(keys.has('ArrowLeft') || keys.has('KeyA')) + touch.current.x;
        let z = Number(keys.has('ArrowDown') || keys.has('KeyS')) - Number(keys.has('ArrowUp') || keys.has('KeyW')) + touch.current.z;
        if (x || z) { s.path = []; s.pending = null; actor.action = null; }
        else if (s.path.length) {
          const next = s.path[0], d = distance(next, actor);
          if (d < .6) { s.path.shift(); dirty = true; }
          else { x = (next.x - actor.x) / d; z = (next.z - actor.z) / d; }
        }
        if (x || z) {
          const scale = 23 * dt / Math.max(1, Math.hypot(x, z));
          const next = moveHome(actor, x * scale, z * scale);
          actor.moving = distance(actor, next) > .001;
          if (Math.abs(x) > .05) actor.facing = x < 0 ? -1 : 1;
          actor.x = next.x; actor.z = next.z; dirty = true;
        }
        if (followRef.current && s.selected !== 'pet' && latest.current.profile.pets.length) {
          const companion = s.residents.pet;
          const d = distance(companion, actor);
          if (d > 12) {
            const next = moveHome(companion, (actor.x - companion.x) / d * 18 * dt, (actor.z - companion.z) / d * 18 * dt);
            companion.moving = distance(companion, next) > .001;
            companion.facing = actor.x < companion.x ? -1 : 1;
            Object.assign(companion, next); dirty = true;
          }
        }
        if (!s.path.length && s.pending) {
          const target = STATIONS.find(item => item.id === s.pending)!;
          if (distance(actor, target.target) < 6) perform(s.pending);
          else s.pending = null;
          dirty = true;
        }
      }
      if (dirty && now - paint > 33) { paint = now; dirty = false; setView(copyHome(s)); }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const clear = () => { controls.current.clear(); touch.current = { x: 0, z: 0 }; state.current.path = []; state.current.pending = null; };
    const hidden = () => { if (document.hidden) clear(); };
    const down = (e: KeyboardEvent) => {
      if (document.activeElement !== room.current) return;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) { e.preventDefault(); controls.current.add(e.code); }
      if ((e.code === 'KeyE' || e.code === 'Space') && !e.repeat) { e.preventDefault(); interact(); }
    };
    const up = (e: KeyboardEvent) => controls.current.delete(e.code);
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear); document.addEventListener('visibilitychange', hidden);
    return () => { cancelAnimationFrame(frame); clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', hidden); };
  }, [interact, perform]);
  const actors: Actor[] = pet ? ['nico', 'robot', 'pet'] : ['nico', 'robot'];
  const selected = view.residents[view.selected];
  const place = (slot: number) => {
    if (!placing) return;
    setUndo({ ...profile.homeLayout });
    update({ ...profile, homeLayout: { ...profile.homeLayout, [placing]: slot } });
    setPlacing(null);
    announce(es ? "Decoración colocada." : "Decoration placed.");
  };
  const welcomeArt = useMemo(() => ({ id: "home-welcome", title: es ? "Nuestro rincón feliz" : "Our happy place", subject: "Nico", background: "Jungle Discovery", frame: "Gold Frame", caption: es ? "Aquí comienza la aventura" : "Adventure starts here" }), [es]);

  // Preserve the public room/decor selectors used by the whole-site acceptance suite.
  return <section className="living-home robot-home-stage" aria-label={es ? 'Casa Robot interactiva' : 'Interactive Robot Home'} data-home-activities={view.completed}>
    <header className="living-home__header"><div><small>{es ? 'TU EQUIPO, TU CASA' : 'YOUR TEAM, YOUR HOME'}</small><h2>{es ? 'Una casa llena de vida' : 'Make yourself at home'}</h2></div><span>✦ {es ? 'Explora y juega' : 'Explore & play'}</span></header>
    <div className="living-home__select" role="group" aria-label={es ? 'Personaje para mover' : 'Character to move'}>
      {actors.map(actor => <button type="button" key={actor} aria-pressed={view.selected === actor} onClick={() => choose(actor)} data-home-select={actor}>{actor === 'nico' ? '🧭' : actor === 'robot' ? '⚡' : '🐾'} {names[actor]}</button>)}
    </div>
    <div ref={room} className="living-home__room" data-theme={profile.homeTheme ?? 'starlight'} tabIndex={0} role="group" aria-label={es ? 'Habitación: toca para caminar' : 'Room: tap to walk'}
      data-home-selected={view.selected} data-home-x={selected.x.toFixed(2)} data-home-z={selected.z.toFixed(2)} data-home-action={selected.action ?? (selected.moving ? 'walk' : 'idle')}
      onBlur={() => { controls.current.clear(); touch.current = { x: 0, z: 0 }; }}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        walk({ x: (e.clientX - rect.left) / rect.width * 100, z: (e.clientY - rect.top) / rect.height * 100 });
      }}>
      <div className="living-home__wall" aria-hidden="true" /><div className="living-home__floor" aria-hidden="true" />
      <div className="living-home__window" aria-hidden="true"><i>☾</i><span>✧　·　✦</span><b /></div>
      <div className={`living-home__lamp${profile.completedMissions.includes("home:gadget:lamp") ? " is-repaired" : ""}`} aria-hidden="true" />
      <div className="living-home__bed" aria-hidden="true"><i/><b>☁</b></div>
      <div className="living-home__workbench" aria-hidden="true"><span>⚙　🔧</span></div>
      <div className="living-home__snacks" aria-hidden="true"><span>🍎</span><i/></div>
      <div className="living-home__dock" aria-hidden="true">ϟ</div>
      <div className="living-home__rug" aria-hidden="true">✦</div>
      <div className="living-home__art" title={artwork?.title}>{<ArtworkPreview artwork={artwork ?? welcomeArt} profile={profile} />}</div>
      <div className="home-objects" aria-label={es ? 'Decoraciones activas' : 'Active decorations'}>{profile.decorations.map((item, index) => {
        const slot = profile.homeLayout?.[item] ?? index % 9;
        return <button type="button" className={`robot-home-decoration home-object${item === CONSTELLATION ? ' home-object--constellation' : ''}`} key={item}
          style={{ left: `${HOME_SPOTS[slot][0]}%`, top: `${HOME_SPOTS[slot][1]}%` }}
          aria-label={`${es ? 'Colocar' : 'Place'} ${item === CONSTELLATION ? (es ? 'Constelación del Puente Estelar' : CONSTELLATION) : optionLabel(item, profile.language)}`}
          onClick={() => setPlacing(item)}>
          {item === CONSTELLATION ? <svg viewBox="0 0 120 70" role="img" aria-label={es ? 'Constelación ganada en el puente' : 'Constellation earned at the bridge'}><path d="M10 55 35 15 65 40 100 10 110 55" fill="none" stroke="currentColor" strokeWidth="2" />{[[10,55],[35,15],[65,40],[100,10],[110,55]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="5" fill="currentColor" />)}</svg> : <HomeDecoration item={item} />}
        </button>;
      })}</div>
      {actors.map(actor => {
        const resident = view.residents[actor];
        const petAction: PetAction | undefined = resident.action === 'rest' ? 'Sit' : resident.action === 'repair' ? 'Fetch Tool' : resident.action === 'dance' ? 'Dance' : resident.action ? 'High Five' : undefined;
        return <button type="button" key={actor} className={`living-home__actor living-home__actor--${actor}${resident.moving ? ' is-walking' : ''}${resident.action ? ` is-${resident.action}` : ''}${view.selected === actor ? ' is-selected' : ''}`}
          style={{ left: `${resident.x}%`, top: `${resident.z}%`, zIndex: Math.round(resident.z), '--home-facing': resident.facing } as CSSProperties}
          onClick={() => choose(actor)} aria-label={`${es ? 'Mover a' : 'Move'} ${names[actor]}`} aria-pressed={view.selected === actor}>
          <span className="living-home__actor-art">
            {actor === 'nico' ? <NicoCostumeFigure profession={profile.nico.profession} wardrobe={profile.nico.wardrobe} accentColor={profile.nico.accentColor} alt="" /> : actor === 'robot' ? <PremiumBoltBotSprite robot={profile.robot} action={resident.moving ? 'drive' : resident.action ?? 'idle'} /> : pet ? <PetArt pet={pet} language={profile.language} action={petAction} decorative /> : null}
          </span>
          {resident.action && <span className="living-home__action-bubble" aria-hidden="true">{STATIONS.find(station => station.id === resident.action)?.icon}</span>}
          <small>{names[actor]}</small>
        </button>;
      })}
      {placing && <div className="home-placement-targets" role="group" aria-label={es ? 'Lugares en la habitación' : 'Places in the room'}>{HOME_SPOTS.map(([x,y],slot)=><button type="button" key={slot} style={{left:`${x+7}%`,top:`${y+6}%`}} aria-label={`${es ? 'Colocar aquí' : 'Place here'} ${slot+1}`} onClick={()=>place(slot)}>{slot+1}</button>)}</div>}
      {view.path.length > 0 && <span className="living-home__target" style={{ left: `${view.path.at(-1)!.x}%`, top: `${view.path.at(-1)!.z}%` }} aria-hidden="true">◎</span>}
    </div>
    <div className="home-themes" role="group" aria-label={es ? 'Estilo de habitación' : 'Room theme'}>
      <span>{es ? 'Mi refugio' : 'My hideaway'}</span>
      {([['starlight','Starlight','Luz de estrellas'],['sunrise','Sunrise','Amanecer'],['forest','Forest','Bosque']] as const).map(([id,en,label])=><button type="button" key={id} aria-pressed={(profile.homeTheme ?? 'starlight') === id} onClick={()=>update({...profile,homeTheme:id})}>{es ? label : en}</button>)}
    </div>
    {placing && <section className="home-placement" aria-label={es ? 'Colocar objeto' : 'Place object'}>
      <p>{es ? 'Elige un lugar para tu objeto.' : 'Choose a spot for your object.'}</p>
      <div className="home-placement__grid">{Array.from({ length: 9 }, (_, slot) => <button key={slot} onClick={() => place(slot)}>{es ? 'Lugar' : 'Spot'} {slot + 1}</button>)}</div><button onClick={() => setPlacing(null)}>{es ? 'Cancelar' : 'Cancel'}</button>
    </section>}
    {undo && <button onClick={() => { update({ ...profile, homeLayout: undo }); setUndo(null); }}>{es ? 'Deshacer colocación' : 'Undo placement'}</button>}
    {workshop && <HomeWorkshop key={workshop} activity={workshop} language={profile.language} close={() => { setWorkshop(null); room.current?.focus(); }} finish={() => {
      const current = latest.current.profile;
      const completion = completeOnce(current, workshop === 'repair' ? 'home:gadget:lamp' : `home:workshop:${workshop}`, 1);
      if (completion.awarded) latest.current.update(completion.profile);
      for (const actor of Object.values(state.current.residents)) { actor.action = workshop; actor.timer = 3; }
      setView(copyHome(state.current));
      speak('Your whole team celebrates!', '¡Todo tu equipo celebra!');
    }} />}
    <div className="living-home__command-bar">
      <div className="living-home__dpad" role="group" aria-label={es ? 'Mover personaje' : 'Move character'}>
        {([{ key: 'up', x: 0, z: -1, icon: '↑' }, { key: 'left', x: -1, z: 0, icon: '←' }, { key: 'down', x: 0, z: 1, icon: '↓' }, { key: 'right', x: 1, z: 0, icon: '→' }]).map(direction => <button key={direction.key} type="button" data-home-direction={direction.key} aria-label={es ? ({ up: 'Arriba', left: 'Izquierda', down: 'Abajo', right: 'Derecha' })[direction.key] : direction.key}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); touch.current = { x: direction.x, z: direction.z }; }}
          onPointerUp={() => { touch.current = { x: 0, z: 0 }; }} onPointerCancel={() => { touch.current = { x: 0, z: 0 }; }} onLostPointerCapture={() => { touch.current = { x: 0, z: 0 }; }}
          onClick={e => { if (e.detail === 0) { const actor = state.current.residents[state.current.selected]; Object.assign(actor, moveHome(actor, direction.x * 4, direction.z * 4)); setView(copyHome(state.current)); } }}>{direction.icon}</button>)}
      </div>
      <p role="status">{message || (es ? 'Elige a un amigo. Toca el suelo para caminar.' : 'Choose a friend. Tap the floor to walk.')}</p>
      <button type="button" onClick={interact}>{es ? 'Interactuar' : 'Interact'} <kbd>E</kbd></button>
    </div>
    <div className="living-home__activities" role="group" aria-label={es ? 'Actividades de la casa' : 'Home activities'}>{STATIONS.map(station => <button type="button" key={station.id} data-home-activity={station.id} onClick={() => walk(station.target, station.id)}><span aria-hidden="true">{station.icon}</span>{es ? station.es : station.en}{profile.completedMissions.includes(`room:play:${station.id}`) && <small>✓</small>}</button>)}</div>
    {pet && <label className="home-follow"><input type="checkbox" checked={follow} onChange={e => setFollow(e.target.checked)} />{es ? `${pet.name} te acompaña` : `${pet.name} follows you`}</label>}
    {homeStory?.pages && <details className="home-journal"><summary>📖 {homeStory.title}</summary><p>{homeStory.pages[storyPage]}</p><button disabled={storyPage === 0} onClick={() => setStoryPage(n => n - 1)}>{es ? 'Anterior' : 'Previous'}</button> {storyPage + 1}/{homeStory.pages.length} <button disabled={storyPage >= homeStory.pages.length - 1} onClick={() => setStoryPage(n => n + 1)}>{es ? 'Siguiente' : 'Next'}</button></details>}
    <details className="living-home__instructions" open={help} onToggle={e => setHelp(e.currentTarget.open)}><summary>{es ? 'Cómo jugar' : 'How to play'}</summary><p>{es ? 'Selecciona a Nico, tu robot o tu mascota. Usa las flechas, WASD o toca el suelo. Elige una actividad para caminar hasta ella y jugar. Cada actividad regala una estrella la primera vez. Tus estrellas y tu equipo se guardan en este dispositivo.' : 'Select Nico, your robot or your pet. Use arrows, WASD or tap the floor. Choose an activity to walk there and play. Each activity gives one star the first time. Your stars and team are saved on this device.'}</p></details>
  </section>;
}
