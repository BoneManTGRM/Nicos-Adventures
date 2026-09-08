import { BOLT_BOT_MOVEMENT_SEQUENCE, type MovementCommand } from './boltBot';

export type MovementRoute = {
  commands: MovementCommand[];
  wrong: { received: MovementCommand; expected: MovementCommand; step: number } | null;
};
export type MovementRouteAction =
  | { type: 'move'; command: MovementCommand }
  | { type: 'undo' }
  | { type: 'reset' };

export const newMovementRoute = (): MovementRoute => ({ commands: [], wrong: null });

/** Keep a validated prefix. Incorrect taps never consume a step or erase progress. */
export function movementRouteReducer(state: MovementRoute, action: MovementRouteAction): MovementRoute {
  if (action.type === 'reset') return newMovementRoute();
  if (action.type === 'undo') return { commands: state.commands.slice(0, -1), wrong: null };
  const expected = BOLT_BOT_MOVEMENT_SEQUENCE[state.commands.length];
  if (!expected) return state;
  if (action.command !== expected) {
    return { commands: state.commands, wrong: { received: action.command, expected, step: state.commands.length + 1 } };
  }
  return { commands: [...state.commands, action.command], wrong: null };
}
