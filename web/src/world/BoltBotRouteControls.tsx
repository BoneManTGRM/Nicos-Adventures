import type { Dispatch } from 'react';
import './boltbot-route-controls.css';
import { BOLT_BOT_MOVEMENT_SEQUENCE, passesMovementTest, type MovementCommand } from '../game/boltBot';
import type { MovementRoute, MovementRouteAction } from '../game/boltBotRoute';
import type { Language } from '../types';

const labels = {
  en: { forward: 'Forward', left: 'Left', right: 'Right' },
  'es-MX': { forward: 'Adelante', left: 'Izquierda', right: 'Derecha' },
} as const;
const arrows: Record<MovementCommand, string> = { forward: '↑', left: '↶', right: '↷' };

export function BoltBotRouteControls({ route, dispatch, language, onPass }: {
  route: MovementRoute;
  dispatch: Dispatch<MovementRouteAction>;
  language: Language;
  onPass: () => void;
}) {
  const es = language === 'es-MX', text = labels[language];
  const done = passesMovementTest(route.commands);
  const next = BOLT_BOT_MOVEMENT_SEQUENCE[route.commands.length];
  const wrong = route.wrong;
  const feedback = done
    ? (es ? '¡Ruta completa! Pulsa Aprobar prueba de movimiento para continuar.' : 'Route complete! Press Pass movement test to continue.')
    : wrong
      ? (es
          ? `Pulsaste ${text[wrong.received]}. El paso ${wrong.step} necesita ${text[wrong.expected]}. Tus pasos correctos se conservan.`
          : `You tapped ${text[wrong.received]}. Step ${wrong.step} needs ${text[wrong.expected]}. Your correct steps are kept.`)
      : (es ? `Paso ${route.commands.length + 1}: pulsa ${text[next]}.` : `Step ${route.commands.length + 1}: tap ${text[next]}.`);

  return <div className="boltbot-guided-route" data-route-version="guided-v1" data-route-progress={route.commands.length}>
    <div className="boltbot-route-heading"><strong>{es ? 'Sigue esta ruta' : 'Follow this route'}</strong><span>{route.commands.length}/3</span></div>
    <div className="boltbot-command-route" role="list" aria-label={es ? 'Ruta requerida' : 'Required route'}>
      {BOLT_BOT_MOVEMENT_SEQUENCE.map((command, index) => <span
        key={index} role="listitem" data-route-step={index + 1}
        className={index < route.commands.length ? 'is-done' : index === route.commands.length ? 'is-next' : ''}
        aria-current={index === route.commands.length ? 'step' : undefined}
        aria-label={`${index + 1}. ${text[command]}${index < route.commands.length ? (es ? ', completado' : ', completed') : ''}`}>
        <b aria-hidden="true">{index < route.commands.length ? '✓' : arrows[command]} {index + 1}</b>
        <small>{text[command]}</small>
      </span>)}
    </div>
    <p className="boltbot-route-explainer">{es ? 'Izquierda y Derecha giran al robot. Adelante lo mueve después de girar.' : 'Left and Right turn the robot. Forward moves him after the turn.'}</p>
    <p id="boltbot-route-hint" className={`test-feedback ${done ? 'is-correct' : wrong ? 'is-hint' : ''}`} role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    <div className="boltbot-choice-grid boltbot-route-buttons" role="group" aria-label={es ? 'Prueba de movimiento' : 'Movement test'} aria-describedby="boltbot-route-hint">
      {(['forward', 'left', 'right'] as const).map(command => <button
        type="button" key={command} data-route-command={command} data-next={command === next}
        disabled={done} aria-label={text[command]}
        onKeyDown={event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); }}
        onClick={event => { if (event.detail < 2) dispatch({ type: 'move', command }); }}>
        <span aria-hidden="true">{arrows[command]}</span>{text[command]}
      </button>)}
    </div>
    {done && <button type="button" aria-label={es ? 'Aprobar prueba de movimiento' : 'Pass movement test'} className="fw-primary boltbot-route-continue" onClick={() => { if (passesMovementTest(route.commands)) onPass(); }}>{es ? 'Aprobar prueba de movimiento' : 'Pass movement test'} →</button>}
    <div className="boltbot-route-edit">
      <button type="button" disabled={!route.commands.length} onClick={() => dispatch({ type: 'undo' })}>{es ? 'Deshacer último paso' : 'Undo last step'}</button>
      <button type="button" disabled={!route.commands.length && !wrong} onClick={() => dispatch({ type: 'reset' })}>{es ? 'Empezar de nuevo' : 'Start over'}</button>
    </div>
  </div>;
}
