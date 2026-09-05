import { useCallback, useEffect, useRef, useState } from 'react';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';
import { claimRoomTreasure, playPuzzle, replayPuzzle, ROOMS } from '../game/friendsMap/interiors';
import type { InteriorState } from '../game/friendsMap/interiors';
import './room-puzzle.css';
const SYMBOLS = ['✦', '☾', '♥'];
const ARROWS = ['↑', '→', '↓', '←'];
const STARS = [{ x: 18, y: 65 }, { x: 35, y: 20 }, { x: 53, y: 53 }, { x: 77, y: 18 }, { x: 88, y: 70 }];
export function RoomPuzzle({ state, es, change, close }: { state: InteriorState; es: boolean; change: () => void; close: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const [, refresh] = useState(0), [show, setShow] = useState(true), [replay, setReplay] = useState(0);
  useDialogFocusTrap({ open: true, dialogRef: dialog, onClose: close });
  const p = state.puzzle, room = state.room!, title = ROOMS[room];
  useEffect(() => {
    if (room !== 'castle' || !show) return;
    const id = window.setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(id);
  }, [show, room, replay]);
  const choose = (n: number) => { if (room === 'castle' && show) return; playPuzzle(state, n); refresh(v => v + 1); change(); };
  const reset = useCallback(() => { replayPuzzle(state); refresh(v => v + 1); setShow(true); setReplay(v => v + 1); change(); }, [state, change]);
  const instruction = room === 'garden' ? (es ? 'Riega cada planta dos veces para que florezca.' : 'Water each plant twice to make it bloom.') : room === 'workshop' ? (es ? 'Gira cada control hasta que coincida con la flecha de arriba.' : 'Turn each dial to match the arrow above it.') : room === 'treehouse' ? (es ? 'Elige la comida que está pidiendo el animal.' : 'Choose the snack the animal is asking for.') : room === 'castle' ? (es ? 'Recuerda los cuatro símbolos. Repítelos cuando se oculten.' : 'Remember the four symbols. Repeat them after they disappear.') : (es ? 'Conecta las estrellas en orden, del 1 al 5.' : 'Connect the stars in order, from 1 to 5.');
  return <div className="room-puzzle__scrim"><div ref={dialog} className="room-puzzle" role="dialog" aria-modal="true" aria-label={es ? title.es : title.en} data-room-puzzle={room} data-puzzle-solved={String(p.solved)}>
    <header><div><small>{es ? 'MISIÓN DENTRO DE LA CASA' : 'INDOOR ADVENTURE'}</small><h2>{es ? title.es : title.en}</h2></div><button type="button" onClick={close}>{es ? 'Volver' : 'Back'}</button></header>
    {p.solved ? <div className="room-puzzle__victory" role="status"><span aria-hidden="true">✦</span><h3>{es ? '¡Una insignia para el equipo!' : 'A badge for the team!'}</h3><p>{es ? `Casas completadas: ${state.completed.length}/5. Tus insignias están guardadas.` : `Buildings completed: ${state.completed.length}/5. Your badges are saved.`}</p>
      {state.completed.length === 5 && <button type="button" data-testid="room-treasure" disabled={state.claimed} onClick={() => { claimRoomTreasure(state); refresh(v => v + 1); change(); }}>{state.claimed ? (es ? 'Tesoro del equipo guardado ✓' : 'Team treasure saved ✓') : (es ? 'Abrir el tesoro del equipo' : 'Open the team treasure')}</button>}
      <button type="button" onClick={close}>{es ? 'Seguir explorando' : 'Keep exploring'}</button><button type="button" className="room-puzzle__replay" onClick={reset}>{es ? 'Jugar otra vez (sin estrellas extra)' : 'Play again (no extra stars)'}</button>
    </div> : <><p>{instruction}</p>
      {room === 'garden' && <div className="room-puzzle__plants">{p.values.map((value, i) => <button type="button" key={i} data-puzzle-choice={i} aria-label={`${es ? 'Regar planta' : 'Water plant'} ${i + 1}`} disabled={value === 2} onClick={() => choose(i)}><span className={`room-plant room-plant--${value}`} aria-hidden="true">{value === 2 ? '🌸' : value ? '🌱' : '🪴'}</span><b>{i + 1}</b><small>{value}/2</small></button>)}</div>}
      {room === 'workshop' && <div className="room-puzzle__dials">{p.values.map((value, i) => <div key={i}><small>{es ? 'Meta' : 'Target'} {ARROWS[[1, 3, 2][i]]}</small><button type="button" data-puzzle-choice={i} aria-label={`${es ? 'Girar control' : 'Turn dial'} ${i + 1}`} onClick={() => choose(i)}><span aria-hidden="true">{ARROWS[value]}</span></button><b>{value === [1, 3, 2][i] ? '✓' : '↻'}</b></div>)}</div>}
      {room === 'treehouse' && <><div className="room-puzzle__animal" aria-hidden="true">{['🐰', '🐦', '🐱'][p.step]}</div><p className="room-puzzle__request">{(es ? ['¡Quiero una zanahoria!', '¡Quiero semillas!', '¡Quiero mi plato de comida!'] : ['I would like a carrot!', 'I would like seeds!', 'I would like my food bowl!'])[p.step]}</p><div className="room-puzzle__choices">{['🌾', '🥣', '🥕'].map((item, i) => <button type="button" key={item} data-puzzle-choice={i} onClick={() => choose(i)}><span aria-hidden="true">{item}</span>{(es ? ['Semillas', 'Plato', 'Zanahoria'] : ['Seeds', 'Bowl', 'Carrot'])[i]}</button>)}</div></>}
      {room === 'castle' && <><div className="room-puzzle__sequence" aria-live="polite">{show ? <span aria-label={es ? 'Luna, estrella, corazón, luna' : 'Moon, star, heart, moon'}>☾　✦　♥　☾</span> : <span>{es ? 'Tu turno' : 'Your turn'} · {p.step}/4</span>}</div><div className="room-puzzle__choices">{SYMBOLS.map((symbol, i) => <button type="button" key={symbol} data-puzzle-choice={i} disabled={show} aria-label={(es ? ['Estrella', 'Luna', 'Corazón'] : ['Star', 'Moon', 'Heart'])[i]} onClick={() => choose(i)}><span>{symbol}</span></button>)}</div><button type="button" className="room-puzzle__replay" onClick={() => { p.step = 0; setShow(true); setReplay(n => n + 1); }}>{es ? 'Ver la secuencia otra vez' : 'Show the sequence again'}</button></>}
      {room === 'observatory' && <div className="room-puzzle__sky"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={STARS.slice(0, p.step).map(star => `${star.x},${star.y}`).join(' ')} fill="none" stroke="#f4dba1" strokeWidth="1"/></svg>{STARS.map((star, i) => <button type="button" key={i} data-puzzle-choice={i} aria-label={`${es ? 'Estrella' : 'Star'} ${i + 1}`} aria-pressed={i < p.step} style={{ left: `${star.x}%`, top: `${star.y}%` }} onClick={() => choose(i)}>✦<small>{i + 1}</small></button>)}</div>}
      <p role="status" className="room-puzzle__hint">{p.mistakes > 0 ? (es ? 'Prueba otra vez. No pierdes estrellas.' : 'Try again. You do not lose any stars.') : (es ? 'Tómate tu tiempo. No hay cuenta regresiva.' : 'Take your time. There is no countdown.')}</p>
    </>}
  </div></div>;
}
