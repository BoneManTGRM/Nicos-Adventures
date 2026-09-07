import { useEffect, useRef, useState } from 'react';
import type { Language } from '../types';
export function HomeWorkshop({ activity, language, finish, close }: {
  activity: 'repair' | 'snack' | 'dance'; language: Language; finish: () => void; close: () => void;
}) {
  const es = language === 'es-MX';
  const [step, setStep] = useState(0), [wrong, setWrong] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { first.current?.focus({ preventScroll: true }); }, []);
  const rhythm = ['★', '●', '★', '▲'];
  const done = step >= (activity === 'dance' ? 4 : 3);
  const choose = (correct: boolean) => {
    if (!correct) { setWrong(true); return; }
    setWrong(false); setStep(value => value + 1);
    if (step + 1 === (activity === 'dance' ? 4 : 3)) finish();
  };
  return <section className="home-workshop" aria-label={es ? 'Juego en casa' : 'Home mini game'}>
    <header><h3>{activity === 'repair' ? (es ? 'Enciende la lámpara estelar' : 'Light the star lamp') : activity === 'snack' ? (es ? 'Prepara un picnic' : 'Make a picnic') : (es ? 'Sigue el baile' : 'Follow the dance')}</h3><button ref={first} onClick={close}>{es ? 'Cerrar' : 'Close'} ×</button></header>
    {done ? <><p role="status">{es ? '¡Lo logramos juntos!' : 'We did it together!'} ✨</p><button onClick={() => { setStep(0); setWrong(false); }}>{es ? 'Jugar otra vez' : 'Play again'}</button></> : <>
      <p>{activity === 'repair' ? (es ? ['La batería está vacía. Encuentra una nueva.', 'Conecta el cable con la misma forma: ▲', 'Todo está conectado. ¡Prueba la lámpara!'][step] : ['The battery is empty. Find a fresh one.', 'Connect the matching cable: ▲', 'Everything is connected. Test the lamp!'][step]) : activity === 'snack' ? (es ? ['Elige una fruta.', 'Agrega algo crujiente.', '¡Sirve el picnic a todo el equipo!'][step] : ['Choose a fruit.', 'Add something crunchy.', 'Serve the picnic to the whole team!'][step]) : (es ? 'Toca las figuras en este orden: ★ ● ★ ▲' : 'Tap the shapes in this order: ★ ● ★ ▲')}</p>
      <div className="fw-action-row">{activity === 'repair' ? (step === 0 ? <><button onClick={() => choose(false)}>🧸 {es ? 'Peluche' : 'Plush'}</button><button onClick={() => choose(true)}>🔋 {es ? 'Batería nueva' : 'Fresh battery'}</button></> : step === 1 ? ['●', '▲', '■'].map(shape => <button key={shape} onClick={() => choose(shape === '▲')}>{shape}</button>) : <button onClick={() => choose(true)}>☀ {es ? 'Probar lámpara' : 'Test lamp'}</button>) : activity === 'snack' ? (step < 2 ? (step === 0 ? ['🍎', '🍌', '🍓'] : ['🥨', '🥕', '🥒']).map(food => <button key={food} onClick={() => choose(true)}>{food}</button>) : <button onClick={() => choose(true)}>🧺 {es ? 'Servir' : 'Serve'}</button>) : ['▲', '★', '●'].map(shape => <button key={shape} onClick={() => choose(shape === rhythm[step])}>{shape}</button>)}</div>
      <p role="status">{wrong ? (es ? 'Mira la pista y prueba otra vez.' : 'Look at the clue and try again.') : `${step}/${activity === 'dance' ? 4 : 3}`}</p>
    </>}
  </section>;
}
