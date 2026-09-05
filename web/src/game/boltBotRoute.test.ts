import { describe, expect, it } from 'vitest';
import { BOLT_BOT_MOVEMENT_SEQUENCE, passesMovementTest } from './boltBot';
import { movementRouteReducer, newMovementRoute } from './boltBotRoute';

describe('guided BoltBot route', () => {
  it('accepts the exact authoritative route, never a different route', () => {
    let state = newMovementRoute();
    for (const command of BOLT_BOT_MOVEMENT_SEQUENCE) state = movementRouteReducer(state, { type: 'move', command });
    expect(passesMovementTest(state.commands)).toBe(true);
    expect(state.wrong).toBeNull();
  });
  it('recovers from the screenshot sequence Forward Left Forward without a forced restart', () => {
    let state = newMovementRoute();
    for (const command of ['forward', 'left', 'forward'] as const) state = movementRouteReducer(state, { type: 'move', command });
    expect(state.commands).toEqual(['forward']);
    expect(state.wrong).toEqual({ received: 'forward', expected: 'right', step: 2 });
    expect(passesMovementTest(state.commands)).toBe(false);
    for (const command of ['right', 'forward'] as const) state = movementRouteReducer(state, { type: 'move', command });
    expect(passesMovementTest(state.commands)).toBe(true);
  });
  it('rejects incorrect input at every step while retaining the validated prefix', () => {
    let state = newMovementRoute();
    for (const command of BOLT_BOT_MOVEMENT_SEQUENCE) {
      const prior = state.commands;
      state = movementRouteReducer(state, { type: 'move', command: 'left' });
      expect(state.commands).toBe(prior);
      expect(state.wrong?.expected).toBe(command);
      state = movementRouteReducer(state, { type: 'move', command });
      expect(state.wrong).toBeNull();
    }
  });
  it('supports undo, correction and resetting at any point including completion', () => {
    let state = newMovementRoute();
    for (const command of BOLT_BOT_MOVEMENT_SEQUENCE) state = movementRouteReducer(state, { type: 'move', command });
    state = movementRouteReducer(state, { type: 'undo' });
    expect(state.commands).toEqual(['forward', 'right']);
    expect(passesMovementTest(state.commands)).toBe(false);
    state = movementRouteReducer(state, { type: 'move', command: 'forward' });
    expect(passesMovementTest(state.commands)).toBe(true);
    state = movementRouteReducer(state, { type: 'reset' });
    expect(state).toEqual(newMovementRoute());
    expect(movementRouteReducer(state, { type: 'undo' })).toEqual(state);
  });
  it('bounds rapid input and does not append commands after completion', () => {
    let state = newMovementRoute();
    for (let i = 0; i < 100; i++) state = movementRouteReducer(state, { type: 'move', command: 'forward' });
    expect(state.commands).toEqual(['forward']);
    state = movementRouteReducer(state, { type: 'move', command: 'right' });
    for (let i = 0; i < 100; i++) state = movementRouteReducer(state, { type: 'move', command: 'forward' });
    expect(state.commands).toEqual(BOLT_BOT_MOVEMENT_SEQUENCE);
    expect(movementRouteReducer(state, { type: 'move', command: 'left' })).toBe(state);
  });
});
